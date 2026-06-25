import cofactorMinorUrl from '../diagrams/la-cofactor-minor.svg?url'
import sarrusRuleUrl from '../diagrams/la-sarrus-rule.svg?url'

export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la2-005',
  slug: 'determinants-general',
  chapter: 'la2',
  order: 5,
  title: 'Determinants: General Formulas and Properties',
  subtitle: 'How to compute the determinant of any size matrix — and the algebraic laws that make it far more powerful than just a single number.',
  tags: ['determinant', 'cofactor expansion', 'minors', 'cofactors', 'Sarrus rule', 'row operations', 'det properties', '3x3 determinant'],
  aliases: 'cofactor expansion minors 3x3 determinant Sarrus rule volume scaling properties triangular matrix determinant properties det AB',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 30,
  coreConcept: 'The determinant of any n×n matrix can be computed by expanding along any row or column using cofactors. The result measures how the matrix scales n-dimensional volume — and a set of algebraic properties makes computation far more efficient than brute force.',
  prerequisites: ['la2-003'],
  nextLesson: 'lu-decomposition',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "In the previous lesson you used ad − bc for 2×2 matrices. What happens when someone hands you a 3×3 or 4×4 matrix?",
    realWorldContext: "A structural engineer computing whether a steel framework will hold a load needs to know whether the stiffness matrix of the structure is invertible — and for a real building, that matrix is 100×100 or larger. A 3D graphics engine computes determinants of 4×4 matrices (one per polygon) sixty times per second to detect when polygons face away from the camera. Crystallographers use 3×3 determinants to verify that three lattice vectors of a crystal are linearly independent. The ad − bc formula you already know is just the smallest case of a general algorithm — one you are about to master. The same algorithm your calculator runs, just exposed.",
    previewVisualizationId: 'LALesson06_Inverses',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Expand $\\det\\begin{bmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{bmatrix}$ along row 1: $1\\cdot\\det\\begin{bmatrix}5&6\\\\8&9\\end{bmatrix} - 2\\cdot\\det\\begin{bmatrix}4&6\\\\7&9\\end{bmatrix} + 3\\cdot\\det\\begin{bmatrix}4&5\\\\7&8\\end{bmatrix}$. The three $2\\times 2$ determinants: $(45-48)=-3$, $(36-42)=-6$, $(32-35)=-3$. Total: $1(-3)-2(-6)+3(-3) = -3+12-9 = 0$. Zero — space collapses. Notice: row 3 = row 1 + row 2. Dependent rows ALWAYS give $\\det = 0$. The pattern for $3\\times 3$ (expand along a row, peel off $2\\times 2$ minors) extends the $ad-bc$ idea to any size matrix.',
      'The key insight is: **a 3×3 determinant can be reduced to a sum of three 2×2 determinants**. Pick any row or column. Multiply each entry by the determinant of the "leftover" 2×2 matrix you get by deleting that entry\'s row and column. Apply a checkerboard of plus and minus signs. Add everything up. This is called **cofactor expansion**.',
      '**Before cofactor expansion makes sense, two terms must be defined:**',
      '**Minor $M_{ij}$** — For the entry at row $i$, column $j$, delete that entire row and that entire column from the matrix. The determinant of what remains is the minor $M_{ij}$. For a 3×3 matrix, each minor is a 2×2 determinant you already know how to compute.',
      '**Cofactor $C_{ij}$** — The cofactor attaches a sign to the minor based on position. The sign is $(-1)^{i+j}$. This creates a checkerboard pattern across the matrix: corners get $+$, their neighbors get $-$, then $+$ again, alternating like a chess board. So $C_{ij} = (-1)^{i+j} M_{ij}$.',
      '**Cofactor expansion** — To compute $\\det(A)$, pick any row (say row 1). Multiply each entry $a_{1j}$ by its cofactor $C_{1j}$, then add all three results. You can also expand along any column — you get the same determinant regardless of which row or column you choose. This gives you a strategic choice: **always expand along the row or column with the most zeros**, since each zero entry contributes nothing to the sum and eliminates one 2×2 computation.',
      ] },
      { type: 'image', src: cofactorMinorUrl,
        alt: 'A 3x3 matrix grid with row 1 and column 1 grayed out as deleted, the remaining 2x2 minor M11 boxed in blue, and a checkerboard of plus and minus signs shown as a legend',
        caption: 'Cofactor expansion peels off one row and one column at a time, sign-checkered, down to a 2×2 you already know.' },
      { type: 'prose', paragraphs: [
      'Beyond the formula, determinants obey a set of **algebraic properties** that each have a geometric meaning:',
      '• **Row swap**: Flipping two rows flips the orientation of the space. The determinant changes sign. Two swaps cancel, restoring the original sign.',
      '• **Row scaling**: If you double one row, you double the "height" of the parallelepiped in that direction. Volume doubles. Determinant scales by the same factor.',
      '• **Row replacement**: Adding a multiple of one row to another row is a shear — it does not change volume. Determinant is unchanged. This is the most important property for computation.',
      '• **Triangular matrices**: All the volume information lives on the diagonal. $\\det = $ product of diagonal entries — no cofactor expansion needed.',
      '• **$\\det(AB) = \\det(A) \\cdot \\det(B)$**: If $A$ scales volume by 3 and $B$ scales it by 2, composing them scales by 6. This is the most important property for theory.',
      ] },
      { type: 'image', src: sarrusRuleUrl,
        alt: 'A 3 by 5 grid with the first two columns repeated, showing three green diagonals going down-right summed and three red diagonals going down-left subtracted, the classic Sarrus rule pattern for a 3x3 determinant',
        caption: "Sarrus's rule: a fast 3×3-only shortcut — three diagonals summed, three subtracted. It does not generalize to 4×4." },
      { type: 'prose', paragraphs: [
      '**Predict before reading on.** If you double row 2 of a $3\\times 3$ matrix $A$, what happens to $\\det(A)$? If you swap rows 1 and 2? Write your guesses, then verify with the Seven Properties callout.',
      '**Where this is heading:** The next lesson (LU Decomposition) is Gaussian elimination tracked as a product of matrices. Because row replacements do not change the determinant, the LU process computes $\\det(A)$ as a free byproduct — just the product of the diagonal of $U$, adjusted for any row swaps.',
      ] },
      { type: 'viz', id: 'DeterminantGeometricViz',
        title: 'Determinant as Signed Parallelogram Area — Draggable',
        mathBridge: 'Drag the red vector tip (v₁) and blue vector tip (v₂) to reshape the parallelogram. The |det| updates live inside the shape. When v₂ is counterclockwise from v₁ the determinant is positive (green); clockwise makes it negative (red). Drag them to be parallel to see det = 0 — the parallelogram collapses to a line, the matrix is singular.',
        caption: 'The sign of the determinant encodes orientation — positive means counterclockwise, negative means the coordinate system has been flipped.' },
      { type: 'viz', id: 'LALesson06_Inverses',
        title: 'Determinant as Volume Scaling',
        mathBridge: 'The yellow shape starts as the unit square (area = 1). Watch the determinant value as you adjust the matrix entries. The key insight extends to 3×3: the determinant is the signed volume of the parallelepiped formed by the three column vectors. A determinant of 2 means volumes double. A determinant of 0 means the three column vectors are coplanar and volume collapses to zero — space is irreversibly flattened.',
        caption: 'The determinant measures signed volume scaling.' },
      { type: 'viz', id: 'LALinearAlgebraRealWorld',
        title: 'Linear Algebra in the Real World — Applied Module',
        mathBridge: 'A six-tab applied module spanning chapters 1 and 2: Systems→CNC shows two sensor equations as intersecting lines and computes the tool position via RREF; Matrices→Graphics applies rotation/scale/shear to a 2D shape and displays the combined matrix T with det(T); Vectors→Forces decomposes two cable tensions into a linear system and solves for T₁ and T₁; Dot→Normals shows how the dot product controls surface brightness and cutting-tool contact angle; Det→Area/Vol draws the parallelogram spanned by two vectors and shows area = |det|; Practice has five hand-calculation problems with real manufacturing context.',
        caption: 'The five core tools of linear algebra — systems, matrices, vectors, dot products, determinants — each doing real engineering work.' },
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Procedure: Compute a 3×3 Determinant by Cofactor Expansion',
        body: 'Step 1. Choose the row or column with the most zero entries — each zero eliminates one 2×2 computation.\nStep 2. For each nonzero entry $a_{ij}$ in that row/column: delete row $i$ and column $j$ to form the 2×2 submatrix. Compute its determinant — this is the minor $M_{ij}$.\nStep 3. Apply the checkerboard sign: cofactor $C_{ij} = (-1)^{i+j} M_{ij}$. Corners are positive ($+$), neighbors negative ($-$), alternating like a chess board.\nStep 4. Multiply each entry by its cofactor: $a_{ij} \\cdot C_{ij}$.\nStep 5. Sum all products for the chosen row or column: $\\det(A) = \\sum_j a_{ij} C_{ij}$.\nStep 6. Verify with a second expansion along a different row — you must get the same answer.',
      },
      {
        type: 'sequencing',
        title: 'Lesson 5 of 12 — Matrices & Transformations',
        body: '**Previous:** Null Space and Column Space — what a matrix destroys and what it can reach.\n**This lesson:** Computing determinants for 3×3 and larger; algebraic properties that make computation tractable.\n**Next:** LU Decomposition — Gaussian elimination formalized as a matrix factorization.',
      },
      {
        type: 'insight',
        title: 'The Checkerboard Sign Pattern',
        body: 'The cofactor sign pattern $(-1)^{i+j}$ for a 3×3 matrix looks like:\n\n$\\begin{bmatrix} + & - & + \\\\ - & + & - \\\\ + & - & + \\end{bmatrix}$\n\nThe (1,1) corner is always positive. Signs alternate like a chess board. This is the only new thing in cofactor expansion beyond the 2×2 formula you already know.',
      },
      {
        type: 'insight',
        title: 'Why Any Row or Column Works',
        body: 'Expanding along row 1, row 2, or column 3 all give the same number — the determinant is unique. This is not obvious; it is a theorem. In practice: choose the row or column with the most zeros to minimize work.',
      },
      {
        type: 'strategy',
        title: "Sarrus's Rule — the 3×3 Shortcut",
        body: "Copy the first two columns to the right of the matrix. Sum the three forward diagonals, subtract the three backward diagonals.\n\n$\\det(A) = a_{11}a_{22}a_{33} + a_{12}a_{23}a_{31} + a_{13}a_{21}a_{32}$\n$\\phantom{\\det(A)} - a_{13}a_{22}a_{31} - a_{11}a_{23}a_{32} - a_{12}a_{21}a_{33}$\n\n**Warning:** Sarrus's rule does NOT generalize to 4×4 matrices or larger. Cofactor expansion or row reduction always work.",
      },
      {
        type: 'warning',
        title: 'Career Signal',
        body: 'Computing 3×3 determinants by cofactor expansion is on every linear algebra exam and in many interviews. Interviewers also ask: "What does a zero determinant mean geometrically?" and "What property does det(AB) satisfy?" Both follow directly from what you are learning now. Knowing the answers cold — not just having computed one before — is what separates someone who took linear algebra from someone who understands it.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      '**Minors and Cofactors — Formal Definitions**',
      'Let $A$ be an $n \\times n$ matrix. The **minor** $M_{ij}$ is the determinant of the $(n-1) \\times (n-1)$ submatrix formed by deleting row $i$ and column $j$ from $A$.',
      'The **cofactor** $C_{ij}$ applies a sign to the minor:\n\n$C_{ij} = (-1)^{i+j} M_{ij}$',
      '**Cofactor Expansion Along Row $i$ (the General Determinant Formula)**',
      'For any fixed row $i$:\n\n$\\det(A) = \\sum_{j=1}^{n} a_{ij}\\, C_{ij} = a_{i1}C_{i1} + a_{i2}C_{i2} + \\cdots + a_{in}C_{in}$',
      'The same formula works along any column $j$:\n\n$\\det(A) = \\sum_{i=1}^{n} a_{ij}\\, C_{ij}$',
      '**Explicit 3×3 Formula (Expanding Along Row 1)**',
      'For $A = \\begin{bmatrix} a & b & c \\\\ d & e & f \\\\ g & h & i \\end{bmatrix}$:\n\n$\\det(A) = a\\underbrace{(ei - fh)}_{M_{11}} - b\\underbrace{(di - fg)}_{M_{12}} + c\\underbrace{(dh - eg)}_{M_{13}}$',
      '**The Seven Properties of the Determinant**',
      '1. $\\det(I_n) = 1$ — the identity matrix scales nothing.\n2. **Row swap**: swapping two rows multiplies $\\det$ by $-1$.\n3. **Row scaling**: multiplying row $i$ by scalar $k$ multiplies $\\det$ by $k$.\n4. **Row replacement**: adding $k \\times \\text{row}_j$ to row $i$ leaves $\\det$ unchanged.\n5. $A$ is invertible $\\iff$ $\\det(A) \\neq 0$.\n6. $\\det(AB) = \\det(A) \\cdot \\det(B)$ — the multiplicative property.\n7. $\\det(A^T) = \\det(A)$ — transposing does not change the determinant.',
      '**Derived Properties (consequences of the seven)**',
      '• $\\det(A^{-1}) = 1/\\det(A)$ — from Property 6: $\\det(A \\cdot A^{-1}) = \\det(I) = 1$.\n• **Triangular matrix**: $\\det = a_{11} \\cdot a_{22} \\cdots a_{nn}$ (product of diagonal entries).\n• **Repeated or proportional rows**: $\\det = 0$ — swapping them gives $-\\det$ but the same matrix, forcing $\\det = -\\det$, so $\\det = 0$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cofactor Expansion',
        body: '\\det(A) = \\sum_{j=1}^{n} a_{ij}\\, C_{ij} \\quad \\text{for any fixed row } i\n\n\\text{where } C_{ij} = (-1)^{i+j} M_{ij}',
      },
      {
        type: 'theorem',
        title: 'Multiplicative Property',
        body: '\\det(AB) = \\det(A) \\cdot \\det(B)\n\n\\text{Consequence: } \\det(A^{-1}) = 1 / \\det(A)',
      },
      {
        type: 'strategy',
        title: 'Efficient Computation via Row Operations',
        body: 'Use row replacements (Property 4: det unchanged) to convert to upper triangular form. Then det = product of diagonal entries. Track row swaps (each flips sign) and row scalings (each multiplies det by that factor). This is what NumPy does internally — never cofactor expansion for $n \\geq 4$.',
      },
    ],
    visualizations: [
      {
        id: 'GaussianEliminationStepper',
        title: 'Row Operations and the Determinant',
        mathBridge: 'Step through row reduction on a 3×3 matrix. Observe: each row replacement leaves the determinant number unchanged. Each row swap flips the sign. The determinant of the final upper triangular matrix is just the product of its diagonal entries. This is why all practical determinant computation uses row reduction rather than cofactor expansion.',
        caption: 'How each row operation affects (or preserves) the determinant.',
      },
      {
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Determinants — Computing and Verifying Properties',
        mathBridge: 'MATLAB: `det(A)` computes the determinant for any size matrix. Verify the seven properties: det(AB) = det(A)·det(B), det(A^T) = det(A), row swap flips sign, triangular matrix = product of diagonal.',
        caption: 'Three cells: cofactor expansion, property verification, and CNC coplanarity check.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Cofactor expansion and MATLAB det() — 3×3 verification',
              prose: [
                '`det(A)` in MATLAB uses LU decomposition: $A = LU$ (with pivoting), $\\det(A) = (\\pm 1) \\cdot \\prod_i U_{ii}$ — just the product of the diagonal of $U$, corrected for any row swaps. For a $3\\times 3$ matrix LU takes ~27 multiplications; cofactor expansion takes $6$ full-term products (but these grow to $n!$ for larger matrices).',
                'The manual block computes each cofactor explicitly using the checkerboard sign $(-1)^{i+j}$: `C11 = +(2·4 - 1·1)` (sign $+1$ at position $(1,1)$), `C12 = -(3·4 - 1·0)` (sign $-1$ at $(1,2)$), `C13 = +(3·1 - 2·0)` (sign $+1$ at $(1,3)$). Then $\\det = a_{11}C_{11} + a_{12}C_{12} + a_{13}C_{13}$.',
                '`abs(det_manual - d) < 1e-10` verifies they match. This is the difference between **understanding** the formula (cofactor expansion) and **computing** it in practice (LU).',
              ],
              code: `A = [2 -1 0; 3 2 1; 0 1 4];

% MATLAB det()
d = det(A);
fprintf('det(A) via MATLAB = %g\\n', d)

% Manual cofactor expansion along row 1
% C11 = (+1) * det([[2 1],[1 4]]) = (+1)(8-1) = 7
C11 = +( 2*4 - 1*1 );
% C12 = (-1) * det([[3 1],[0 4]]) = (-1)(12-0) = -12
C12 = -( 3*4 - 1*0 );
% C13 = (+1) * det([[3 2],[0 1]]) = (+1)(3-0) = 3
C13 = +( 3*1 - 2*0 );

det_manual = A(1,1)*C11 + A(1,2)*C12 + A(1,3)*C13;
fprintf('Manual cofactor expansion = %g\\n', det_manual)
fprintf('Match: %d\\n', abs(det_manual - d) < 1e-10)`,
            },
            {
              id: 2,
              cellTitle: 'Verifying the seven determinant properties',
              prose: [
                '`det(A*B)` multiplies two $2\\times 2$ matrices and computes the determinant of the product. `det(A)*det(B)` computes them separately and multiplies. Both should give the same number — this is Property 6. Geometrically: $A$ scales areas by $\\det(A)$ and $B$ scales them by $\\det(B)$; composing them scales by $\\det(A) \\cdot \\det(B)$.',
                '`A_swap = A([2 1], :)` reorders rows using MATLAB index vector `[2 1]`: row 2 goes first, row 1 goes second. `det(A_swap)` should equal $-\\det(A)$ — one row swap flips the sign (Property 2). `T = [3 1 5; 0 2 4; 0 0 7]` is upper triangular: `det(T)` should equal $3 \\times 2 \\times 7 = 42$ — the triangular matrix rule (only the diagonal matters).',
                '`det(A\') == det(A)` (Property 7) means the determinant is immune to transposing — a non-obvious fact. Its consequence: everything true about rows is equally true about columns (since transposing turns columns into rows). This is why you can expand along any row OR any column in cofactor expansion and get the same answer. For triangular $T$: MATLAB\'s `det(T)` computes LU internally and returns $U_{11} \\cdot U_{22} \\cdot U_{33}$ — since $T$ is already upper triangular, $U = T$ and the product is just the diagonal.',
              ],
              code: `A = [2 1; 5 3];
B = [1 0; 2 4];

fprintf('--- Property 6: det(AB) = det(A)·det(B) ---\\n')
fprintf('det(A)    = %g\\n', det(A))
fprintf('det(B)    = %g\\n', det(B))
fprintf('det(A*B)  = %g\\n', det(A*B))
fprintf('det(A)*det(B) = %g\\n', det(A)*det(B))

fprintf('\\n--- Property 7: det(A^T) = det(A) ---\\n')
fprintf('det(A)   = %g\\n', det(A))
fprintf("det(A')  = %g\\n", det(A'))

fprintf('\\n--- Property 2: row swap flips sign ---\\n')
A_swap = A([2 1], :);  % swap rows
fprintf('det(A)        = %g\\n', det(A))
fprintf('det(A swapped) = %g\\n', det(A_swap))

fprintf('\\n--- Triangular matrix: det = product of diagonal ---\\n')
T = [3 1 5; 0 2 4; 0 0 7];
fprintf('det(T) via MATLAB = %g\\n', det(T))
fprintf('3*2*7 = %g\\n', 3*2*7)`,
            },
            {
              id: 3,
              cellTitle: 'Application: CNC — checking if three tool paths span a volume',
              prose: [
                'A 3-axis CNC router follows three independent axis vectors. If the vectors are coplanar (det = 0), the machine cannot reach all points in 3D — one direction of motion is impossible.',
                'This is the determinant test for 3D linear independence: are three motion directions truly independent?',
                '`det(M_good) = 1.0` (the standard orthogonal axes form a unit cube — volume 1). `det(M_bad) ≈ 0` because `Z_flat = [0.5; 0.866; 0]` lies entirely in the XY plane — the three vectors are coplanar. For the CNC controller, this means: no commanded Z-axis move will actually produce motion out of the XY plane. The determinant is the **controllability test**: $\\det \\neq 0$ guarantees the machine can reach any point in 3D; $\\det = 0$ means the workspace is dimensionally degenerate.',
              ],
              code: `% Three axis direction vectors of a CNC machine
% Good: X, Y, Z axes are orthogonal
X_axis = [1; 0; 0];
Y_axis = [0; 1; 0];
Z_axis = [0; 0; 1];

M_good = [X_axis, Y_axis, Z_axis];  % put as columns
fprintf('Standard 3-axis setup:\\n')
fprintf('  det = %g  (nonzero → 3D motion fully possible)\\n', det(M_good))

% Degenerate: if Z-axis is tilted into the XY plane
Z_flat = [0.5; 0.866; 0];  % lies in XY plane!
M_bad = [X_axis, Y_axis, Z_flat];
fprintf('\\nDegenerate (Z in XY plane):\\n')
fprintf('  det = %.4f  (zero → cannot reach off-plane points)\\n', det(M_bad))

% 5-axis CNC: add rotary axes A (around X) and C (around Z)
% The 5-axis capability matrix would be 5x5
% But checking the 3D translation axes is the critical constraint
fprintf('\\nConclusion: det tests whether 3 motion axes span full 3D.\\n')`,
            },
            {
              id: 4,
              cellTitle: 'Challenge: det(AB) = det(A)·det(B) and the c^n scaling rule',
              prose: [
                '`det(A*B)` computes the determinant of the product directly. `det(A)*det(B)` computes them separately and multiplies. Property 6 guarantees they are equal — this verifies that the volume-scaling factors compose multiplicatively: if $A$ scales volume by $\\det(A)$ and $B$ by $\\det(B)$, then $AB$ scales by their product.',
                '`det(k*A)` scales every entry of $A$ by $k$, which scales every row by $k$. Since there are $n$ rows and each row-scale multiplies the determinant by $k$, the result is $\\det(kA) = k^n \\det(A)$. The code checks this for $k=3$ and $n=3$: `det(3*A)` should equal $3^3 \\cdot \\det(A) = 27 \\det(A)$. This is the most common misconception — students expect $k \\cdot \\det(A)$ but get $k^n \\cdot \\det(A)$.',
                'The `fprintf` line printing `Common mistake: 3*det(A) = ... (WRONG for n>1)` explicitly shows the wrong answer for comparison. The key insight: scaling a $3\\times3$ matrix by 3 triples every row independently — the parallelpiped formed by the three column vectors is scaled by 3 in each of 3 independent directions, so volume scales by $3^3 = 27$. This is why $\\det(2I_n) = 2^n$, not 2 — the identity times 2 scales ALL dimensions simultaneously.',
              ],
              code: `A = [2 -1 0; 3 2 1; 0 1 4];
B = [1 0 2; -1 3 0; 2 1 1];

dA = det(A);
dB = det(B);
dAB = det(A*B);

fprintf('--- Property 6: det(AB) = det(A)·det(B) ---\\n')
fprintf('det(A)        = %g\\n', dA)
fprintf('det(B)        = %g\\n', dB)
fprintf('det(A*B)      = %g\\n', dAB)
fprintf('det(A)*det(B) = %g\\n', dA*dB)
fprintf('Equal: %d\\n', abs(dAB - dA*dB) < 1e-10)

fprintf('\\n--- Scaling: det(k*A) = k^n * det(A) for n=3 ---\\n')
k = 3;
n = 3;
fprintf('det(3*A)          = %g\\n', det(k*A))
fprintf('3^3 * det(A)      = %g\\n', k^n * dA)
fprintf('Common mistake: 3*det(A) = %g  (WRONG for n>1)\\n', k * dA)
fprintf('Scaling matches k^n rule: %d\\n', abs(det(k*A) - k^n*dA) < 1e-10)`,
            },
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: 3×3 Determinants and Properties',
        mathBridge: 'np.linalg.det(A) handles matrices of any size — it uses LU decomposition internally. The cells below compute a 3×3 determinant both by hand (cofactor expansion) and numerically, then verify the seven properties.',
        caption: 'Run each cell to verify the properties numerically.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing a 3×3 determinant: manual vs NumPy',
              prose: [
                '`np.linalg.det(A)` uses LU decomposition internally — not cofactor expansion. The manual block computes each $2 \\times 2$ minor: `M11 = 5*9 - 6*2 = 33`, `M12 = 4*9 - 6*7 = -6`, `M13 = 4*2 - 5*7 = -27`. Signs from $(-1)^{1+j}$: `1*M11 - 2*M12 + 3*M13 = 33 + 12 - 81 = -36`.',
                'The matrix heatmap (left) shows the entries with color intensity. The right panel shows the three cofactor values as colored cells — their signed weighted sum equals the determinant. A lighter tile means a smaller cofactor contribution to the total.',
                'The cofactor expansion connects directly to the **Leibniz formula**: $\\det(A) = \\sum_{\\sigma \\in S_n} \\text{sgn}(\\sigma) \\prod_i a_{i,\\sigma(i)}$. For $n=3$, there are $3! = 6$ permutations — exactly 6 products in the full expansion. Cofactor expansion along row 1 groups these 6 terms into 3 pairs (one pair per entry in row 1), each pair being a $2\\times2$ determinant. So cofactor expansion is just a structured way to sum the 6 Leibniz terms. For $n=4$ there are $4! = 24$ terms; for $n=10$ there are $10! = 3{,}628{,}800$ — which is why computers use LU for large matrices.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[1., 2., 3.], [4., 5., 6.], [7., 2., 9.]])

print(f"np.linalg.det(A) = {np.linalg.det(A):.1f}")  # should be -36.0

# Manual cofactor expansion along row 1
M11 = 5*9 - 6*2    # = 33
M12 = 4*9 - 6*7    # = -6
M13 = 4*2 - 5*7    # = -27
det_manual = 1*M11 - 2*M12 + 3*M13
print(f"Manual cofactor expansion = {det_manual}")

fig, axes = plt.subplots(1, 2, figsize=(9, 3.5))
ax = axes[0]
ax.imshow(A, cmap='Blues', aspect='equal', vmin=0, vmax=10)
ax.set_title(f"Matrix A  (det = {np.linalg.det(A):.1f})", fontsize=12)
for i in range(3):
    for j in range(3):
        ax.text(j, i, f'{A[i,j]:.0f}', ha='center', va='center', fontsize=14, fontweight='bold')
ax.set_xticks([]); ax.set_yticks([])

ax2 = axes[1]
cofactors = np.array([[M11, -(-1)*M12, M13], [0,0,0],[0,0,0]], dtype=float)
ax2.imshow([[M11, M12, M13]], cmap='RdBu_r', aspect='auto', vmin=-30, vmax=35)
ax2.set_title(f"Row 1 cofactors\\ndet = 1*{M11} - 2*{M12} + 3*{M13} = {det_manual}", fontsize=11)
for j, (c, lbl) in enumerate(zip([M11, M12, M13], ['C11', 'C12', 'C13'])):
    ax2.text(j, 0, f'{lbl}\\n{c}', ha='center', va='center', fontsize=12,
             color='white' if abs(c) > 20 else 'black')
ax2.set_xticks([]); ax2.set_yticks([])
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: "Sarrus's rule verification",
              prose: [
                'Sarrus\'s rule sums six products: three from forward diagonals (top-left to bottom-right) minus three from backward diagonals (top-right to bottom-left). These six terms correspond exactly to the $3! = 6$ permutations in the Leibniz formula $\\det(A) = \\sum_{\\sigma \\in S_3} \\text{sgn}(\\sigma) \\prod_i a_{i,\\sigma(i)}$. This is why it only works for $3\\times 3$: a $4\\times 4$ has $4! = 24$ terms, not 6.',
                '`grid = np.hstack([A, A[:, :2]])` extends to a $3 \\times 5$ grid by copying the first two columns. Each forward diagonal uses column indices $[k, k+1, k+2]$ for $k = 0, 1, 2$ (going right and down). The backward diagonals use $[k+2, k+1, k]$ (going left and down). The plot shows each diagonal in a separate color with its product labeled — forward products are added, backward products are subtracted.',
                'Sarrus\'s rule gives the same result as cofactor expansion because it is just a visual shortcut for the same 6 Leibniz-formula terms. **Critical warning**: Sarrus only works for exactly $3\\times3$. For $4\\times4$, copying the first 3 columns and tracing diagonals would produce 8 diagonal products — but there are $4! = 24$ Leibniz terms. The extra 16 terms are NOT captured by diagonals. This is why Sarrus\'s rule is taught only as a $3\\times3$ trick; cofactor expansion (or LU) is the general method.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[1., 2., 3.], [4., 5., 6.], [7., 2., 9.]])
a,b,c = A[0]; d,e,f = A[1]; g,h,i = A[2]

sarrus = (a*e*i + b*f*g + c*d*h) - (c*e*g + a*f*h + b*d*i)
print(f"Sarrus rule:  {sarrus}")
print(f"NumPy det:    {np.linalg.det(A):.1f}")
print(f"Match: {np.isclose(sarrus, np.linalg.det(A))}")

# Visualize Sarrus: show 3x3 grid + extended columns, highlight diagonals
fig, axes = plt.subplots(1, 2, figsize=(10, 4))
grid = np.hstack([A, A[:, :2]])  # augment with first 2 cols

ax = axes[0]
ax.imshow(grid, cmap='Greys', aspect='equal', alpha=0.15, vmin=0, vmax=12)
ax.set_title("Forward diagonals (add)", fontsize=11)
colors = ['steelblue', 'darkorange', 'green']
for k, color in enumerate(colors):
    xs = [k, k+1, k+2]
    ys = [0, 1, 2]
    vals = [grid[r, c] for r, c in zip(ys, xs)]
    for r, c in zip(ys, xs):
        ax.text(c, r, f'{grid[r,c]:.0f}', ha='center', va='center', fontsize=13,
                color=color, fontweight='bold')
    product = vals[0]*vals[1]*vals[2]
    ax.plot(xs, ys, color=color, lw=2, marker='o', markersize=6)
    ax.text(k+1, 2.7, f'+{product:.0f}', ha='center', fontsize=10, color=color)
ax.set_xlim(-0.5, 4.5); ax.set_ylim(3.2, -0.5)
ax.set_xticks([]); ax.set_yticks([])

ax2 = axes[1]
ax2.imshow(grid, cmap='Greys', aspect='equal', alpha=0.15, vmin=0, vmax=12)
ax2.set_title("Backward diagonals (subtract)", fontsize=11)
for k, color in enumerate(colors):
    xs = [k+2, k+1, k]
    ys = [0, 1, 2]
    vals = [grid[r, c] for r, c in zip(ys, xs)]
    for r, c in zip(ys, xs):
        ax2.text(c, r, f'{grid[r,c]:.0f}', ha='center', va='center', fontsize=13,
                color=color, fontweight='bold')
    product = vals[0]*vals[1]*vals[2]
    ax2.plot(xs, ys, color=color, lw=2, marker='o', markersize=6)
    ax2.text(k+1, 2.7, f'-{product:.0f}', ha='center', fontsize=10, color=color)
ax2.set_xlim(-0.5, 4.5); ax2.set_ylim(3.2, -0.5)
ax2.set_xticks([]); ax2.set_yticks([])
plt.suptitle(f"Sarrus: ({a*e*i:.0f}+{b*f*g:.0f}+{c*d*h:.0f}) - ({c*e*g:.0f}+{a*f*h:.0f}+{b*d*i:.0f}) = {sarrus:.0f}", fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Verifying the key properties',
              prose: [
                '`np.linalg.det(A @ B)` computes $\\det(AB)$ directly; `dA * dB` multiplies two separately computed determinants. They should match to floating-point precision — this is Property 6. The geometric meaning: if $A$ scales areas by $\\det(A)$ and $B$ by $\\det(B)$, composing them scales by the product.',
                '`A_swapped = A[[1,0], :]` uses NumPy fancy indexing to reorder rows 0↔1. `det(A_swapped)` should equal $-\\det(A)$ — one row swap flips the sign. `T = [[3,1,5],[0,2,4],[0,0,7]]` is upper triangular: `det(T)` should equal $3 \\times 2 \\times 7 = 42$ (the triangular matrix rule). The bar chart plots LHS vs RHS for each property — matching heights confirm each property holds.',
                'The bar chart makes equality visual: every pair of bars (blue = LHS, orange = RHS) should be the same height. A height difference means a property failed numerically — useful for debugging. `det(A^T) = det(A)` appears especially surprising (the matrix changes shape, but its determinant is invariant to transposing). This property implies: cofactor expansion along column $j$ gives the same result as expansion along row $j$ of $A^T$, which has the same determinant — proving column expansion is valid.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

A = np.array([[2., 1.], [5., 3.]])
B = np.array([[1., 0.], [2., 4.]])

dA = np.linalg.det(A)
dB = np.linalg.det(B)
dAB = np.linalg.det(A @ B)
A_swapped = A[[1,0], :]
T = np.array([[3., 1., 5.], [0., 2., 4.], [0., 0., 7.]])

print(f"det(A)={dA:.4f}  det(B)={dB:.4f}  det(AB)={dAB:.4f}  det(A)*det(B)={dA*dB:.4f}")
print(f"det(A)={dA:.4f}  det(A^T)={np.linalg.det(A.T):.4f}")
print(f"det(A)={dA:.4f}  det(A row-swapped)={np.linalg.det(A_swapped):.4f}")
print(f"det(T)={np.linalg.det(T):.1f}  3x2x7={3*2*7}")

# Bar chart visualizing each property
properties = ['det(AB)\\n=det(A)*det(B)', 'det(A^T)\\n=det(A)', 'Row swap\\nflips sign', 'Triangular\\n=prod(diag)']
lhs = [dAB, np.linalg.det(A.T), np.linalg.det(A_swapped), np.linalg.det(T)]
rhs = [dA*dB, dA, -dA, 3*2*7]

fig, ax = plt.subplots(figsize=(10, 4))
x = np.arange(len(properties))
w = 0.35
ax.bar(x - w/2, lhs, w, label='LHS', color='steelblue', alpha=0.85)
ax.bar(x + w/2, rhs, w, label='RHS', color='darkorange', alpha=0.85)
ax.set_xticks(x); ax.set_xticklabels(properties, fontsize=10)
ax.set_ylabel('Determinant value')
ax.set_title('Determinant Properties: LHS vs RHS (should match)', fontsize=12)
ax.legend(); ax.axhline(0, color='k', lw=0.5); ax.grid(True, alpha=0.3, axis='y')
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: 'Application: 3D volume test — do three crystal lattice vectors span a crystal cell?',
              prose: [
                '`np.linalg.det(L)` with `L` having the three lattice vectors as columns computes the **signed volume** of the unit cell (the parallelepiped spanned by the three vectors). For a real crystal, this volume is the volume of the repeating unit cell in ångströms cubed. `abs(np.linalg.det(L))` gives the positive volume. If `det = 0`, the three vectors are coplanar — they don\'t define a 3D crystal; they define a 2D layer.',
                '`L_degenerate` with `a3 = 2*a1 + a2` makes column 3 a linear combination of columns 1 and 2 — the three vectors are coplanar. `np.linalg.det(L_degenerate)` returns 0 (or near-zero due to floating point). The plot shows both parallelpiped cases: the valid crystal (non-zero volume) as a 3D wireframe, and the degenerate case as a flat 2D shape.',
                '`np.linalg.matrix_rank(L)` confirms the degenerate case: rank 2 instead of 3 — two independent directions remain, but the third is a linear combination. The determinant and rank tell the same story: $\\det \\neq 0 \\iff \\text{rank} = n \\iff$ the vectors are linearly independent and span the full 3D space. Both tests are used in crystallography software to validate that a proposed unit cell is non-degenerate before computing diffraction patterns.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d.art3d import Poly3DCollection

# Three lattice vectors of a simple orthorhombic crystal (in Angstroms)
a1 = np.array([3.0, 0.0, 0.0])  # a-axis
a2 = np.array([0.0, 4.0, 0.0])  # b-axis
a3 = np.array([0.0, 0.0, 5.0])  # c-axis
L = np.column_stack([a1, a2, a3])

vol = abs(np.linalg.det(L))
print(f"Valid crystal: det = {np.linalg.det(L):.1f}, volume = {vol:.1f} Å³")
print(f"  rank(L) = {np.linalg.matrix_rank(L)}  (3 = full rank = valid 3D cell)")

# Degenerate case: a3 lies in the a1-a2 plane
a3_bad = 2*a1 + a2
L_bad = np.column_stack([a1, a2, a3_bad])
print(f"\nDegenerate: det = {np.linalg.det(L_bad):.6f}  (≈ 0)")
print(f"  rank(L_bad) = {np.linalg.matrix_rank(L_bad)}  (only 2 independent directions!)")

# Plot both as parallelepipeds
fig = plt.figure(figsize=(10, 5))
for idx, (vecs, title) in enumerate([(L, f'Valid cell (vol={vol:.0f} ų)'), (L_bad, 'Degenerate (vol≈0)')]):
    ax = fig.add_subplot(1, 2, idx+1, projection='3d')
    o = np.zeros(3)
    for v, c in zip(vecs.T, ['steelblue','darkorange','green']):
        ax.quiver(*o, *v, color=c, arrow_length_ratio=0.15, lw=2)
    ax.set_title(title, fontsize=11)
    ax.set_xlim(0, 7); ax.set_ylim(0, 7); ax.set_zlim(0, 7)
    ax.set_xlabel('X'); ax.set_ylabel('Y'); ax.set_zlabel('Z')
plt.suptitle('det = volume of unit cell (0 = degenerate / coplanar)', fontsize=11)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Full cofactor analysis',
              difficulty: 'medium',
              prompt: 'For A = [[2,0,1],[3,1,2],[1,4,0]]: (1) compute det(A) by cofactor expansion along row 1 (show each minor and cofactor), (2) verify with NumPy, (3) verify det(A^T) = det(A), (4) compute det(A)·det(A⁻¹) and confirm it equals 1.',
              code: `import numpy as np

A = np.array([[2., 0., 1.],
              [3., 1., 2.],
              [1., 4., 0.]])

# 1. Cofactor expansion along row 1:
# M11 = det([[1,2],[4,0]])  →  ?
# M12 = det([[3,2],[1,0]])  →  ?
# M13 = det([[3,1],[1,4]])  →  ?
# Signs: C11 = +M11, C12 = -M12, C13 = +M13
# det = 2*C11 + 0*C12 + 1*C13

# 2. Verify with np.linalg.det(A)

# 3. det(A.T) should equal det(A)

# 4. det(A) * det(np.linalg.inv(A)) should equal 1.0
`,
              hint: 'M11 = 1×0 − 2×4 = −8. M12 = 3×0 − 2×1 = −2. M13 = 3×4 − 1×1 = 11. Expansion: 2×(+)(−8) + 0 + 1×(+)(11) = −16 + 11 = −5.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'The determinant is formally defined as the unique function $\\mathbb{R}^{n \\times n} \\to \\mathbb{R}$ satisfying three axioms: (1) multilinearity in each row, (2) antisymmetry under row swaps (swapping two rows changes the sign), and (3) $\\det(I_n) = 1$. All seven properties and the cofactor expansion formula are theorems that follow from these three axioms alone.',
      'The **Leibniz formula** gives an explicit closed form:\n\n$\\det(A) = \\sum_{\\sigma \\in S_n} \\text{sgn}(\\sigma) \\prod_{i=1}^{n} a_{i,\\sigma(i)}$\n\nwhere $S_n$ is the set of all $n!$ permutations of $\\{1, \\ldots, n\\}$ and $\\text{sgn}(\\sigma) = +1$ for even permutations, $-1$ for odd. For $n = 3$, $S_3$ has $3! = 6$ permutations — exactly the six terms in Sarrus\'s rule.',
      'Computational complexity: cofactor expansion runs in $O(n!)$ time — for $n = 20$, that is $2.4 \\times 10^{18}$ operations (one calculation per nanosecond would take 76 years). LU decomposition computes the determinant in $O(n^3)$ time: reduce to upper triangular, multiply diagonal entries, apply sign corrections for row swaps. For $n = 20$: 8,000 operations instead of $2.4 \\times 10^{18}$. This is why no practical software uses cofactor expansion for matrices larger than 3×3.',
      'The determinant connects to geometry via the **exterior algebra**: $\\det(A)$ is the scalar by which $A$ scales the $n$-dimensional unit hypercube. In 2D, $|\\det(A)|$ equals the area of the parallelogram spanned by the two column vectors; in 3D, it equals the volume of the parallelepiped. This geometric view explains why $\\det(AB) = \\det(A)\\det(B)$: composing two transformations compounds their scaling factors. It also clarifies why a zero determinant signals collapse — the image has zero $n$-dimensional volume, meaning the transformation squashes space into a lower-dimensional subspace.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Axiomatic Definition of the Determinant',
        body: 'The determinant is the unique function $\\det: \\mathbb{R}^{n \\times n} \\to \\mathbb{R}$ satisfying:\n\n1. **Multilinearity in each row**: if row $i$ is $c\\mathbf{u} + \\mathbf{v}$, then $\\det$ splits as $c\\det(A_u) + \\det(A_v)$\n2. **Antisymmetry**: swapping any two rows multiplies $\\det$ by $-1$\n3. **Normalization**: $\\det(I_n) = 1$\n\nEvery other property (cofactor expansion, multiplicativity, triangular matrix formula) is a theorem derived from these three axioms.',
      },
      {
        type: 'proof',
        title: 'Why det(AB) = det(A)·det(B)',
        body: 'The function $f(B) = \\det(AB)$ satisfies the three axioms of a determinant as a function of $B$\'s rows, scaled by $\\det(A)$. By uniqueness of the determinant, $f(B) = \\det(A) \\cdot \\det(B)$.\n\nConsequence: if $A$ is invertible, $\\det(A) \\cdot \\det(A^{-1}) = \\det(AA^{-1}) = \\det(I) = 1$, so $\\det(A^{-1}) = 1/\\det(A)$.',
      },
      {
        type: 'insight',
        title: 'Computational Complexity — Why Cofactor Expansion Is Only for 3×3',
        body: 'Cofactor expansion runs in $O(n!)$ time. For $n = 20$: $20! = 2.4 \\times 10^{18}$ operations. At $10^9$ operations/second, that is 76 years.\n\nLU decomposition computes the determinant in $O(n^3)$ time. For $n = 20$: $8{,}000$ operations. Same answer, in microseconds.\n\nThis is why `np.linalg.det()` and MATLAB\'s `det()` both use LU internally — never cofactor expansion for $n \\geq 4$.',
      },
    ],
    visualizations: [
      {
        id: 'DeterminantsModuleViz',
        title: 'Determinants — Cofactor Expansion & Area/Volume',
        mathBridge: 'A five-tab module: Concept covers 2×2 and 3×3 determinants, cofactor signs, and geometry; Canonical steps through a 3×3 cofactor expansion along row 1 showing each minor; Real World shows how det gives signed area of a parallelogram and signed volume of a parallelepiped; Interactive lets you enter any 2×2 or 3×3 matrix and see the determinant computed with all cofactors highlighted; Practice has four problems including real CNC applications.',
        caption: 'The determinant is the signed scaling factor of a transformation — zero means collapse, nonzero means invertible.',
      },
      {
        id: 'LALinearAlgebraRealWorld',
        title: 'Linear Algebra in the Real World — Applied Module',
        mathBridge: 'A six-tab applied module spanning chapters 1 and 2: Systems→CNC shows two sensor equations as intersecting lines and computes the tool position via RREF; Matrices→Graphics applies rotation/scale/shear to a 2D shape and displays the combined matrix T with det(T); Vectors→Forces decomposes two cable tensions into a linear system and solves for T₁ and T₁; Dot→Normals shows how the dot product controls surface brightness and cutting-tool contact angle; Det→Area/Vol draws the parallelogram spanned by two vectors and shows area = |det|; Practice has five hand-calculation problems with real manufacturing context.',
        caption: 'The five core tools of linear algebra — systems, matrices, vectors, dot products, determinants — each doing real engineering work.',
      },
    ],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "la2-005-ex1",
      title: "3×3 Determinant by Cofactor Expansion",
      problem: "Compute $\\det(A)$ for $A = \\begin{bmatrix} 2 & -1 & 0 \\\\ 3 & 2 & 1 \\\\ 0 & 1 & 4 \\end{bmatrix}$ by expanding along row 1.",
      steps: [
        {
          expression: "C_{11} = (+1)\\det\\begin{bmatrix} 2 & 1 \\\\ 1 & 4 \\end{bmatrix} = (+1)(8-1) = 7",
          annotation: "Entry (1,1): sign $(-1)^{1+1} = +1$. Delete row 1 and column 1. The remaining 2×2 matrix is rows 2—3, columns 2—3. Compute its determinant: $2 \\cdot 4 - 1 \\cdot 1 = 7$.",
          strategyTitle: "First cofactor",
          checkpoint: "Which entries remain after deleting row 1 and column 1?",
          hints: ["Rows 2 and 3, columns 2 and 3 remain: [[2,1],[1,4]]. Its det = 2·4 − 1·1 = 7."],
        },
        {
          expression: "C_{12} = (-1)\\det\\begin{bmatrix} 3 & 1 \\\\ 0 & 4 \\end{bmatrix} = (-1)(12-0) = -12",
          annotation: "Entry (1,2): sign $(-1)^{1+2} = -1$. Delete row 1 and column 2. Remaining: rows 2—3, columns 1 and 3. Minor = $3 \\cdot 4 - 1 \\cdot 0 = 12$. Cofactor = $-12$.",
          strategyTitle: "Second cofactor — sign flips",
          checkpoint: "Why does the sign flip for the (1,2) position?",
          hints: ["The checkerboard: position (1,2) has exponent 1+2=3, which is odd, so $(-1)^3 = -1$."],
        },
        {
          expression: "C_{13} = (+1)\\det\\begin{bmatrix} 3 & 2 \\\\ 0 & 1 \\end{bmatrix} = (+1)(3-0) = 3",
          annotation: "Entry (1,3): sign $(-1)^{1+3} = +1$. Delete row 1 and column 3. Remaining: rows 2—3, columns 1 and 2. Minor = $3 \\cdot 1 - 2 \\cdot 0 = 3$.",
          strategyTitle: "Third cofactor",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\det(A) = a_{11}C_{11} + a_{12}C_{12} + a_{13}C_{13} = 2(7) + (-1)(-12) + 0(3) = 14 + 12 + 0 = 26",
          annotation: "Multiply each row-1 entry by its cofactor and add. The zero in position (1,3) eliminated the third computation entirely — this is why expanding along rows with zeros saves time.",
          strategyTitle: "Final sum",
          checkpoint: "What would happen if you expanded along row 3 (which also has a zero) instead?",
          hints: ["Row 3 has a zero at (3,1). Expanding along row 3 would also eliminate one computation. You would still get det = 26."],
        }
      ],
      conclusion: "det(A) = 26. The matrix is invertible. The zero entry in row 1 reduced the work from three 2×2 computations to two. Choosing a row or column with zeros is always a strategic advantage.",
    },
    {
      id: "la2-005-ex2",
      title: "Using Row Operations to Compute a Determinant Efficiently",
      problem: "Compute $\\det(A)$ for $A = \\begin{bmatrix} 1 & 2 & 3 \\\\ 2 & 5 & 4 \\\\ 1 & 3 & 2 \\end{bmatrix}$ by reducing to upper triangular form.",
      steps: [
        {
          expression: "R_2 \\leftarrow R_2 - 2R_1: \\quad \\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & 1 & -2 \\\\ 1 & 3 & 2 \\end{bmatrix}",
          annotation: "Row replacement: subtract $2 \\times R_1$ from $R_2$. Property 4 says row replacement leaves det unchanged.",
          strategyTitle: "Eliminate below first pivot",
          checkpoint: "Does this operation change the determinant?",
          hints: ["No. Property 4: row replacement (adding a multiple of one row to another) never changes the determinant."],
        },
        {
          expression: "R_3 \\leftarrow R_3 - R_1: \\quad \\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & 1 & -2 \\\\ 0 & 1 & -1 \\end{bmatrix}",
          annotation: "Row replacement: subtract $R_1$ from $R_3$. Still no change to det.",
          strategyTitle: "Eliminate the second entry in column 1",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "R_3 \\leftarrow R_3 - R_2: \\quad \\begin{bmatrix} 1 & 2 & 3 \\\\ 0 & 1 & -2 \\\\ 0 & 0 & 1 \\end{bmatrix}",
          annotation: "Row replacement: subtract $R_2$ from $R_3$. The matrix is now upper triangular. All three operations were row replacements — det is completely unchanged from the original.",
          strategyTitle: "Complete upper triangular form",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\det(A) = 1 \\cdot 1 \\cdot 1 = 1",
          annotation: "Triangular matrix: multiply the diagonal entries. Since all three row operations preserved det, the original matrix also has det = 1. No cofactor expansion was needed.",
          strategyTitle: "Read off the determinant",
          checkpoint: "If the third step had been a row swap instead of a row replacement, what would det(A) be?",
          hints: ["A row swap flips the sign. If one swap occurred, det would be −1 instead of +1."],
        }
      ],
      conclusion: "det(A) = 1. The row-reduction strategy involves only O(n²) work to reach triangular form versus O(n!) for cofactor expansion. For this 3×3, three row replacements sufficed — no sign tracking needed. For most problems, row reduction is faster.",
    },
    {
      id: "la2-005-ex3",
      title: "Strategic Row Choice — Two Zeros Reduce Work to One Cofactor",
      problem: "Compute $\\det(A)$ for $A = \\begin{bmatrix} 2 & -3 & 1 \\\\ 0 & 0 & 5 \\\\ 4 & 1 & 3 \\end{bmatrix}$ by choosing the most efficient row.",
      steps: [
        {
          expression: "\\text{Scan each row: Row 1 has 0 zeros, Row 2 has 2 zeros, Row 3 has 0 zeros. Choose Row 2.}",
          annotation: "Row 2 is $[0, 0, 5]$ — two zeros. Expanding along it means only one nonzero term survives: the entry 5 at position $(2,3)$. The other two cofactors are multiplied by zero and contribute nothing.",
          strategyTitle: "Identify the most efficient row",
          checkpoint: "How many 2×2 computations does row 2 save compared to row 1?",
          hints: ["Row 1 has no zeros — all three cofactors require a 2×2 determinant. Row 2 has two zeros — only one cofactor is needed. Saving 2 of 3 computations."],
        },
        {
          expression: "M_{23} = \\det\\begin{bmatrix} 2 & -3 \\\\ 4 & 1 \\end{bmatrix} = (2)(1) - (-3)(4) = 2 + 12 = 14",
          annotation: "Delete row 2 and column 3. The remaining 2×2 submatrix uses rows 1 and 3, columns 1 and 2. Minor $M_{23} = 2 \\cdot 1 - (-3) \\cdot 4 = 14$.",
          strategyTitle: "Compute the one surviving minor",
          checkpoint: "Which entries go into the submatrix after deleting row 2 and column 3?",
          hints: ["Rows 1 and 3, columns 1 and 2: $\\begin{bmatrix}2&-3\\\\4&1\\end{bmatrix}$. Determinant = $2(1) - (-3)(4) = 14$."],
        },
        {
          expression: "C_{23} = (-1)^{2+3} M_{23} = (-1)^5 \\cdot 14 = -14",
          annotation: "Position $(2,3)$: exponent $2+3 = 5$ is odd, so sign is $-1$. The cofactor is $C_{23} = (-1)(-14)$... wait — $C_{23} = (-1)^5 \\cdot M_{23} = (-1) \\cdot 14 = -14$.",
          strategyTitle: "Apply the checkerboard sign",
          checkpoint: "What is the sign at position $(2,3)$ on the checkerboard?",
          hints: ["Checkerboard: $(1,1)$ is $+$, $(1,2)$ is $-$, $(2,1)$ is $-$, $(2,2)$ is $+$, $(2,3)$ is $-$. Exponent $2+3=5$ is odd, so sign is $-1$."],
        },
        {
          expression: "\\det(A) = 0 \\cdot C_{21} + 0 \\cdot C_{22} + 5 \\cdot C_{23} = 5(-14) = -70",
          annotation: "Row 2 expansion: $a_{21}C_{21} + a_{22}C_{22} + a_{23}C_{23} = 0 + 0 + 5(-14) = -70$. The two zero entries eliminated two cofactor computations entirely — this is the strategic advantage of choosing row 2.",
          strategyTitle: "Sum along row 2",
          checkpoint: "Verify: expand along row 1 and confirm you get the same −70.",
          hints: ["Row 1 expansion: $C_{11} = +\\det\\begin{bmatrix}0&5\\\\1&3\\end{bmatrix} = -5$, $C_{12} = -\\det\\begin{bmatrix}0&5\\\\4&3\\end{bmatrix} = 20$, $C_{13} = +\\det\\begin{bmatrix}0&0\\\\4&1\\end{bmatrix} = 0$. $\\det = 2(-5) + (-3)(20) + 1(0) = -10 - 60 = -70$ ✓."],
        }
      ],
      conclusion: "det(A) = −70. Row 2 had two zeros, reducing three 2×2 computations to one. This is the key strategic principle: the row or column with the most zeros is always the best choice for cofactor expansion. The determinant is the same regardless of which row you choose — only the amount of work differs.",
    }
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la2-005-det-zeros',
      title: '3×3 Determinant — Choose the Row with the Most Zeros',
      prereqs: ['Cofactor expansion', '2×2 determinant'],
      problem: 'Compute $\\det(A)$ for $A = \\begin{bmatrix}2&0&1\\\\3&-1&2\\\\0&0&4\\end{bmatrix}$.',
      steps: [
        {
          label: 'Scan for the best row or column to expand along',
          strategy: 'Every zero in the chosen row/column eliminates one 2×2 determinant computation.',
          explanation: 'Row 3 has two zeros: $[0, 0, 4]$. Only the third entry is non-zero, so expanding along row 3 requires computing just ONE cofactor. This is the key strategic move: always look for zeros before expanding.',
          math: '\\text{Row 3: } [0, 0, 4] \\quad \\to \\quad \\text{only one nonzero cofactor}',
        },
        {
          label: 'Write the cofactor expansion along row 3',
          strategy: 'Expansion along row $i$: sum $a_{i1}C_{i1} + a_{i2}C_{i2} + a_{i3}C_{i3}$.',
          explanation: 'Only the $a_{33}=4$ term is non-zero. Its cofactor $C_{33}$ carries a positive sign (the $(3,3)$ position has sign $(-1)^{3+3}=+1$).',
          math: '\\det(A) = 0\\cdot C_{31} + 0\\cdot C_{32} + 4\\cdot C_{33} = 4 C_{33}',
        },
        {
          label: 'Compute the 2×2 minor $M_{33}$ (delete row 3 and column 3)',
          strategy: 'The minor is the determinant of the sub-matrix formed by removing the row and column of the chosen entry.',
          explanation: 'Removing row 3 and column 3 leaves $\\begin{bmatrix}2&0\\\\3&-1\\end{bmatrix}$. Determinant: $(2)(-1)-(0)(3)=-2$.',
          math: 'M_{33} = \\det\\begin{bmatrix}2&0\\\\3&-1\\end{bmatrix} = -2-0 = -2',
        },
        {
          label: 'Assemble: $\\det(A) = 4 \\cdot (+1) \\cdot M_{33}$',
          strategy: 'Cofactor = sign × minor. Multiply by the entry and the sign.',
          explanation: '$\\det(A) = 4 \\cdot (-2) = -8$. The negative determinant means $A$ reverses orientation — it flips the handedness of the basis vectors while scaling volume by 8.',
          math: '\\det(A) = 4 \\cdot (-2) = -8',
        },
        {
          label: 'Sanity check: what does the sign of the determinant mean?',
          strategy: '$|\\det(A)|$ is the volume-scaling factor; $\\text{sign}(\\det(A))$ indicates whether orientation is preserved.',
          explanation: '$\\det(A) = -8$: the transformation scales area by 8 AND flips orientation (like reflecting in a mirror). If $\\det(A) = 0$, the transformation would have collapsed the 3D input to a plane or line.',
          math: '|\\det(A)| = 8 \\;\\text{(volume scale)} \\quad \\text{sign}(-) \\;\\text{(orientation flip)}',
        },
      ],
    },
    {
      id: 'wt-la2-005-det-row-ops',
      title: 'Determinant Via Row Operations — Tracking the Rules',
      prereqs: ['Row operations', 'Cofactor expansion'],
      problem: 'Compute $\\det\\begin{bmatrix}2&4&2\\\\1&3&2\\\\3&7&4\\end{bmatrix}$ by using row operations to simplify first.',
      steps: [
        {
          label: 'Remember the three rules for determinants under row operations',
          strategy: 'Knowing what operations change the determinant prevents sign errors.',
          explanation: '(1) Swapping two rows multiplies $\\det$ by $-1$. (2) Multiplying a row by scalar $k$ multiplies $\\det$ by $k$. (3) Adding a multiple of one row to another leaves $\\det$ unchanged. Rule (3) is the workhorse: it is free.',
          math: 'R_i \\leftrightarrow R_j: \\det \\to -\\det \\qquad kR_i: \\det \\to k\\cdot\\det \\qquad R_i+cR_j: \\det \\text{ unchanged}',
          gotcha: 'Do NOT factor out a common factor unless you explicitly account for it. If you multiply a row by 2 to create nicer numbers, the determinant of the modified matrix is twice the original.',
        },
        {
          label: 'Apply $R_2 \\leftarrow R_2 - \\frac{1}{2}R_1$ (type 3: free)',
          strategy: 'Use the first row to create a zero below the first pivot.',
          explanation: '$R_2$: $(1-1, 3-2, 2-1) = (0, 1, 1)$.',
          math: '\\begin{bmatrix}2&4&2\\\\0&1&1\\\\3&7&4\\end{bmatrix} \\quad (\\det\\text{ unchanged})',
        },
        {
          label: 'Apply $R_3 \\leftarrow R_3 - \\frac{3}{2}R_1$ (type 3: free)',
          strategy: 'Create zero below the pivot in column 1 for row 3.',
          explanation: '$R_3$: $(3-3, 7-6, 4-3)=(0,1,1)$.',
          math: '\\begin{bmatrix}2&4&2\\\\0&1&1\\\\0&1&1\\end{bmatrix} \\quad (\\det\\text{ unchanged})',
        },
        {
          label: 'Spot the identical rows — the determinant must be zero',
          strategy: 'Two identical rows mean the matrix is singular: $\\det = 0$.',
          explanation: 'Rows 2 and 3 are now identical. Swapping them would give $\\det \\to -\\det$, but swapping identical rows changes nothing, so $\\det = -\\det \\Rightarrow \\det = 0$. No further computation needed.',
          math: 'R_2 = R_3 \\implies \\det(A) = 0',
        },
        {
          label: 'Interpret: what does $\\det = 0$ tell you?',
          strategy: 'Singular matrix — the original rows were linearly dependent.',
          explanation: 'Column 3 = column 2 of $A$ minus column 1 (check: $[2,2,4] = [4,3,7]-[2,1,3]$). The three columns lie in a 2D subspace, so the 3D volume they enclose is zero. The matrix cannot be inverted.',
          math: '\\det(A)=0 \\implies A \\text{ is singular, columns are dependent}',
        },
      ],
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "la2-005-ch1",
      difficulty: "easy",
      problem: "Compute $\\det\\begin{bmatrix} 3 & 1 & 0 \\\\ 2 & -1 & 4 \\\\ 0 & 2 & 1 \\end{bmatrix}$ by expanding along row 1. The zero entry in position (1,3) eliminates one computation.",
      hint: "Expansion along row 1: $3 \\cdot C_{11} + 1 \\cdot C_{12} + 0 \\cdot C_{13}$. The last term drops out. Signs: $C_{11}$ is positive (odd+odd = even), $C_{12}$ is negative.",
      walkthrough: [
        {
          expression: "C_{11} = +\\det\\begin{bmatrix} -1 & 4 \\\\ 2 & 1 \\end{bmatrix} = (-1)(1) - (4)(2) = -9",
          annotation: "Delete row 1, col 1. Sign $(-1)^{1+1} = +1$."
        },
        {
          expression: "C_{12} = -\\det\\begin{bmatrix} 2 & 4 \\\\ 0 & 1 \\end{bmatrix} = -((2)(1) - (4)(0)) = -2",
          annotation: "Delete row 1, col 2. Sign $(-1)^{1+2} = -1$."
        },
        {
          expression: "\\det = 3(-9) + 1(-2) + 0 = -27 - 2 = -29",
          annotation: "Multiply each row-1 entry by its cofactor and add."
        }
      ],
      answer: "-29"
    },
    {
      id: "la2-005-ch2",
      difficulty: "medium",
      problem: "A matrix $A$ has $\\det(A) = 4$. A student applies two operations: (1) multiplies row 2 by $-3$, then (2) swaps rows 1 and 3. What is the determinant of the resulting matrix?",
      hint: "Property 3: multiplying a row by $k$ multiplies det by $k$. Property 2: each row swap multiplies det by $-1$. Track each operation in sequence.",
      walkthrough: [
        {
          expression: "\\text{After multiply row 2 by } (-3): \\quad \\det = (-3) \\cdot 4 = -12",
          annotation: "Property 3: multiplying a single row by k multiplies the determinant by k."
        },
        {
          expression: "\\text{After row swap: } \\quad \\det = (-1) \\cdot (-12) = 12",
          annotation: "Property 2: each row swap multiplies the determinant by −1."
        }
      ],
      answer: "12"
    },
    {
      id: "la2-005-ch3",
      difficulty: "hard",
      problem: "Compute $\\det\\begin{bmatrix} 0 & 2 & 1 \\\\ 3 & -1 & 2 \\\\ 1 & 0 & 4 \\end{bmatrix}$ using row operations. The leading zero in position (1,1) means you must swap rows before eliminating — track the sign change carefully.",
      hint: "Since $a_{11} = 0$, swap row 1 with a row that has a non-zero first entry (e.g., swap with row 3). This flip counts as one sign change. Then use row replacements (no more sign changes) to reach upper triangular form.",
      walkthrough: [
        {
          expression: "\\text{Swap } R_1 \\leftrightarrow R_3: \\quad \\begin{bmatrix} 1 & 0 & 4 \\\\ 3 & -1 & 2 \\\\ 0 & 2 & 1 \\end{bmatrix} \\quad \\det_{\\text{new}} = -\\det_{\\text{original}}",
          annotation: "One row swap: the new matrix has det = −det(original). We track this sign and apply it at the end."
        },
        {
          expression: "R_2 \\leftarrow R_2 - 3R_1: \\quad \\begin{bmatrix} 1 & 0 & 4 \\\\ 0 & -1 & -10 \\\\ 0 & 2 & 1 \\end{bmatrix}",
          annotation: "Row replacement. No change to det of the current matrix."
        },
        {
          expression: "R_3 \\leftarrow R_3 + 2R_2: \\quad \\begin{bmatrix} 1 & 0 & 4 \\\\ 0 & -1 & -10 \\\\ 0 & 0 & -19 \\end{bmatrix}",
          annotation: "Row replacement. Upper triangular."
        },
        {
          expression: "\\det(\\text{upper tri}) = 1 \\cdot (-1) \\cdot (-19) = 19",
          annotation: "Product of diagonal."
        },
        {
          expression: "\\det(\\text{original}) = -19",
          annotation: "The one row swap means det(original) = −det(swapped matrix) = −19."
        }
      ],
      answer: "-19"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "M_{ij}",
        meaning: "The (i,j) minor: the determinant of the (n−1)×(n−1) submatrix after deleting row i and column j."
      },
      {
        symbol: "C_{ij} = (-1)^{i+j} M_{ij}",
        meaning: "The (i,j) cofactor: the minor with a checkerboard sign applied. Positive at corners, alternating inward."
      },
      {
        symbol: "\\det(AB) = \\det(A)\\det(B)",
        meaning: "The multiplicative property: composing two transformations multiplies their volume-scaling factors."
      },
      {
        symbol: "\\det(A) = 0",
        meaning: "Singular matrix: columns are linearly dependent, no inverse exists, the transformation collapses space to a lower dimension."
      },
      {
        symbol: "\\det(cA) = c^n\\det(A)",
        meaning: "Scaling an n×n matrix by c multiplies the determinant by cⁿ — one factor of c per row, n rows total."
      },
      {
        symbol: "\\det(A^T) = \\det(A)",
        meaning: "Transposing a matrix leaves the determinant unchanged — row expansion and column expansion give the same result."
      }
    ],
    rulesOfThumb: [
      "Always expand along the row or column with the most zeros — each zero eliminates one 2×2 computation.",
      "Sarrus's rule is only for 3×3. Never apply it to 4×4 or larger.",
      "Row replacement never changes det. Row swap flips sign. Row scaling multiplies det by that scalar.",
      "Triangular matrix det = product of diagonal entries. No expansion needed.",
      "For matrices larger than 3×3, always use row reduction — cofactor expansion is O(n!) and becomes unusable."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la2-003',
        label: 'Determinants (2×2)',
        note: 'The formula ad − bc is exactly cofactor expansion on a 2×2 matrix — two terms instead of three. This lesson extends that same pattern to any matrix size.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la2-006',
        label: 'LU Decomposition',
        note: 'LU decomposition is Gaussian elimination tracked as matrix factors. Because all steps are row replacements (det unchanged) plus tracked row swaps (each flips sign), det(A) = Â±(product of diagonal of U) — cofactor expansion is never needed.'
      },
      {
        lessonId: 'la3-001',
        label: 'Eigenvalues',
        note: 'The characteristic equation det(A − λI) = 0 requires computing the determinant of an n×n matrix containing the symbol λ. For a 3×3 matrix, cofactor expansion produces a cubic polynomial whose roots are the eigenvalues.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "la2-005-assess-1",
        type: "choice",
        text: "What is the determinant of $\\begin{bmatrix} 2 & 0 & 0 \\\\ 1 & -3 & 0 \\\\ 4 & 2 & 5 \\end{bmatrix}$?",
        options: ["-30", "30", "-6", "0"],
        answer: "-30",
        hints: ["This is a lower triangular matrix. det = product of diagonal entries = 2 × (−3) × 5 = −30."],
        reviewSection: "Math tab — Triangular matrix determinant"
      },
      {
        id: "la2-005-assess-2",
        type: "choice",
        text: "What is the sign of the cofactor $C_{23}$ (position row 2, column 3)?",
        options: [
          "$(-1)^{2+3} = -1$ — the cofactor is $-M_{23}$",
          "$(-1)^{2+3} = +1$ — the cofactor is $+M_{23}$",
          "The sign is always positive for row 2",
          "The sign depends on the matrix entries"
        ],
        answer: "$(-1)^{2+3} = -1$ — the cofactor is $-M_{23}$",
        hints: ["Cofactor sign formula: $(-1)^{i+j}$. For position $(2,3)$: $(-1)^{2+3} = (-1)^5 = -1$."],
        reviewSection: "Intuition tab — The Checkerboard Sign Pattern callout"
      },
      {
        id: "la2-005-assess-3",
        type: "choice",
        text: "$\\det(A) = 6$. What is $\\det(A^{-1})$?",
        options: [
          "$\\frac{1}{6}$ — from $\\det(A) \\cdot \\det(A^{-1}) = \\det(I) = 1$",
          "$-6$ — the inverse flips the sign",
          "$36$ — squaring the determinant",
          "$6$ — the determinant is the same"
        ],
        answer: "$\\frac{1}{6}$ — from $\\det(A) \\cdot \\det(A^{-1}) = \\det(I) = 1$",
        hints: ["Property 6: $\\det(AB) = \\det(A)\\det(B)$. Apply with $B = A^{-1}$: $\\det(A)\\det(A^{-1}) = \\det(AA^{-1}) = \\det(I) = 1$. So $\\det(A^{-1}) = 1/\\det(A)$."],
        reviewSection: "Math tab — Multiplicative Property theorem"
      },
      {
        id: "la2-005-assess-4",
        type: "choice",
        text: "A row-reduction of $A$ uses three row replacements and two row swaps, ending with a triangular matrix with diagonal $[2, 3, 1]$. What is $\\det(A)$?",
        options: [
          "$-6$ — two swaps each flip the sign; product of diagonal = $2 \\times 3 \\times 1 = 6$; two flips give $(-1)^2 \\times 6 = 6$... wait: $(-1)^2 = 1$ so det = $6$.",
          "$6$",
          "$-6$",
          "$12$"
        ],
        answer: "$6$",
        hints: [
          "Row replacements never change the determinant.",
          "Each row swap multiplies det by $-1$. Two swaps: $(-1)^2 = +1$.",
          "Product of diagonal entries: $2 \\times 3 \\times 1 = 6$. Two sign flips cancel: $\\det(A) = (+1) \\times 6 = 6$."
        ],
        reviewSection: "Math tab — Row operations and Properties 2 and 4"
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Cofactor expansion: pick any row or column, multiply each entry by its signed minor, sum everything.",
    "Properties make computation tractable: row replacements preserve det; row swaps flip sign; triangular form → read off product of diagonal.",
    "det(AB) = det(A)·det(B) — composing two transformations multiplies their volume-scaling factors.",
    "Zero determinant ↔ coplanar columns (3D) ↔ space collapses ↔ no inverse.",
    "Cofactor expansion is O(n!) — never use it for matrices larger than 3×3 in practice."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la2-005-1', label: 'Read intuition — understand cofactor expansion conceptually', type: 'read' },
    { id: 'cp-la2-005-2', label: 'Read math — memorize the 7 properties and their geometric meanings', type: 'read' },
    { id: 'cp-la2-005-3', label: 'Read rigor — understand why cofactor expansion is O(n!) vs O(n³)', type: 'read' },
    { id: 'cp-la2-005-4', label: 'Run OpenMAT cell 1 — verify manual cofactor expansion matches det()', type: 'lab' },
    { id: 'cp-la2-005-5', label: 'Run OpenMAT cell 2 — verify all 7 properties numerically', type: 'lab' },
    { id: 'cp-la2-005-6', label: 'Complete example 1: trace all 3 cofactors of the 3×3 matrix', type: 'example' },
    { id: 'cp-la2-005-7', label: 'Complete example 2: reduce to upper triangular using row operations', type: 'example' },
    { id: 'cp-la2-005-8', label: 'Attempt challenge 1: cofactor expansion with a zero entry', type: 'challenge' },
    { id: 'cp-la2-005-9', label: 'Attempt challenge 3: hard — row swap + row reduction, track sign carefully', type: 'challenge' },
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'la2-005-quiz-1',
      type: 'choice',
      text: "You row-reduce a 3×3 matrix using two row replacements and one row swap. The upper triangular result has diagonal entries 2, −3, and 1. What is the determinant of the original matrix?",
      options: [
        "−6 (two replacements change nothing; one swap flips sign; product of diagonal = 2×(−3)×1 = −6; one flip: −1 × −6 = +6... wait, the sign of the diagonal product is −6, then the swap multiplies by −1 again, giving +6)",
        "6",
        "−6",
        "−12"
      ],
      answer: "6",
      hints: ["Product of diagonal = 2×(−3)×1 = −6. The row replacements change nothing. The one row swap multiplies by −1. So det(original) = (−1) × (−6) = 6."],
      reviewSection: 'Math tab — Properties 2, 4, and triangular'
    },
    {
      id: 'la2-005-quiz-2',
      type: 'choice',
      text: "For a 3×3 matrix $A$, which row operation does NOT change $\\det(A)$?",
      options: [
        "Multiplying row 2 by −5",
        "Swapping row 1 and row 3",
        "Adding 4 times row 1 to row 3",
        "Multiplying the entire matrix by 3"
      ],
      answer: "Adding 4 times row 1 to row 3",
      hints: ["Row replacement (adding a multiple of one row to another) is the only elementary row operation that does not change the determinant — Property 4."],
      reviewSection: 'Math tab — The Seven Properties'
    },
    {
      id: 'la2-005-quiz-3',
      type: 'choice',
      text: "What does $\\det(AB) = \\det(A) \\cdot \\det(B)$ mean geometrically?",
      options: [
        "Applying transformation $A$ then $B$ scales volume by $\\det(A) \\cdot \\det(B)$ — the area-scaling factors multiply.",
        "The entries of $AB$ are products of entries from $A$ and $B$.",
        "The column spaces of $A$ and $B$ multiply.",
        "The trace of $AB$ equals the trace of $A$ times the trace of $B$."
      ],
      answer: "Applying transformation $A$ then $B$ scales volume by $\\det(A) \\cdot \\det(B)$ — the area-scaling factors multiply.",
      hints: ["The determinant measures how a transformation scales area/volume. Composing two transformations multiplies their scaling factors, just as composing a 3× scale with a 2× scale gives a 6× scale."],
      reviewSection: 'Math tab — Multiplicative property'
    },
    {
      id: 'la2-005-quiz-4',
      type: 'choice',
      text: "A $4\\times 4$ upper triangular matrix has diagonal entries $2, -1, 3, -4$. What is its determinant?",
      options: [
        "24 — product of diagonal: $2 \\times (-1) \\times 3 \\times (-4) = 24$.",
        "0 — triangular matrices are always singular.",
        "−24 — because there are two negative diagonal entries.",
        "It cannot be computed without full cofactor expansion."
      ],
      answer: "24 — product of diagonal: $2 \\times (-1) \\times 3 \\times (-4) = 24$.",
      hints: ["Triangular matrix rule: det = product of all diagonal entries. Two negatives multiply to a positive. $2 \\times (-1) = -2$; $-2 \\times 3 = -6$; $-6 \\times (-4) = 24$."],
      reviewSection: 'Math tab — Triangular matrix'
    },
    {
      id: 'la2-005-quiz-5',
      type: 'choice',
      text: "Why should you never use Sarrus\u2019s rule on a $4 \\times 4$ matrix?",
      options: [
        "Sarrus\u2019s rule only works for $3 \\times 3$ matrices; it does not generalize to larger matrices and gives wrong answers for $n \\geq 4$.",
        "Sarrus\u2019s rule only works for matrices with integer entries.",
        "Sarrus\u2019s rule is too slow for $4 \\times 4$ — use cofactor expansion instead.",
        "Sarrus\u2019s rule requires a square determinant, which $4\\times 4$ matrices don\u2019t have."
      ],
      answer: "Sarrus\u2019s rule only works for $3 \\times 3$ matrices; it does not generalize to larger matrices and gives wrong answers for $n \\geq 4$.",
      hints: ["Sarrus\u2019s rule is a mnemonic trick specific to $3\\times 3$. The diagonal pattern it uses does not capture all the permutation terms needed for larger determinants. Always use cofactor expansion or row reduction for $n \\geq 4$."],
      reviewSection: 'Intuition tab — Sarrus\u2019s Rule callout'
    },
    {
      id: 'la2-005-quiz-6',
      type: 'choice',
      text: "You have a $10 \\times 10$ matrix and need to compute its determinant in a program. Which approach is correct?",
      options: [
        "Use LU decomposition (or call `np.linalg.det()`) — it runs in $O(n^3)$ time.",
        "Use cofactor expansion — it is the most direct formula.",
        "Use Sarrus\u2019s rule extended to $10 \\times 10$.",
        "Take the trace divided by the rank."
      ],
      answer: "Use LU decomposition (or call `np.linalg.det()`) — it runs in $O(n^3)$ time.",
      hints: ["Cofactor expansion is $O(10!) = 3{,}628{,}800$ multiplications. LU decomposition is $O(10^3) = 1{,}000$. Both give the same answer, but LU is 3,628× faster for $n=10$ and astronomically faster for larger matrices."],
      reviewSection: 'Rigor tab — Computational complexity',
    },
    {
      id: 'la2-005-quiz-7',
      type: 'choice',
      text: 'Expand $\\det\\begin{bmatrix}2&0&0\\\\1&3&0\\\\4&5&6\\end{bmatrix}$ along column 1. What is the determinant?',
      options: [
        '36 — lower triangular, so det = product of diagonal = $2 \\times 3 \\times 6$',
        '0 — the last column has a zero in the first row',
        '11 — sum of the diagonal entries',
        '−36 — the negative diagonal product',
      ],
      answer: '36 — lower triangular, so det = product of diagonal = $2 \\times 3 \\times 6$',
      hints: ['Lower triangular: det = product of diagonal entries (same rule as upper triangular). $2 \\times 3 \\times 6 = 36$. You can verify with cofactor expansion along column 1 but the triangular rule is faster.'],
      reviewSection: 'Math tab — Triangular matrix determinant',
    },
    {
      id: 'la2-005-quiz-8',
      type: 'choice',
      text: 'You scale a $3 \\times 3$ matrix $A$ (every entry multiplied by 5) to get $5A$. What is $\\det(5A)$ in terms of $\\det(A)$?',
      options: [
        '$125 \\det(A)$ — each row is scaled by 5, so the det is scaled by $5^3$',
        '$5 \\det(A)$ — you scale by 5 once',
        '$25 \\det(A)$ — you scale by $5^2$',
        '$\\det(A)$ — scaling the matrix does not change the determinant',
      ],
      answer: '$125 \\det(A)$ — each row is scaled by 5, so the det is scaled by $5^3$',
      hints: ['Scaling an entire $n \\times n$ matrix by $c$ scales the determinant by $c^n$. For $n=3$: $\\det(5A) = 5^3 \\det(A) = 125\\det(A)$. Each row scale-by-5 multiplies the determinant by 5, and there are 3 rows.'],
      reviewSection: 'Math tab — Property 3: scaling a row',
    },
    {
      id: 'la2-005-quiz-9',
      type: 'choice',
      text: 'A $3\\times 3$ matrix $A$ has two identical rows. What is $\\det(A)$?',
      options: [
        '0 — identical rows mean the matrix is singular',
        '1 — identical rows cancel each other out',
        'Impossible to determine without knowing all entries',
        '2 — the identical rows contribute double',
      ],
      answer: '0 — identical rows mean the matrix is singular',
      hints: ['If rows $i$ and $j$ are identical, swapping them changes nothing (the matrix is the same), but a row swap multiplies the determinant by $-1$. So $\\det = -\\det \\Rightarrow \\det = 0$.'],
      reviewSection: 'Math tab — Property 6: identical rows',
    },
    {
      id: 'la2-005-quiz-10',
      type: 'choice',
      text: 'Which row to expand along to minimize cofactor computation in $A = \\begin{bmatrix}0&0&1\\\\2&3&4\\\\0&5&0\\end{bmatrix}$?',
      options: [
        'Row 1 — it has the most zeros, so two of the three cofactors multiply by 0 and can be skipped',
        'Row 2 — it has the largest entries, giving the most accurate computation',
        'Row 3 — it has two zeros, equally good',
        'Column 1 — columns cannot be used in cofactor expansion',
      ],
      answer: 'Row 1 — it has the most zeros, so two of the three cofactors multiply by 0 and can be skipped',
      hints: ['Pick the row (or column) with the most zeros — each zero eliminates one cofactor computation. Row 1 = $[0,0,1]$ has two zeros: expand along it and only one $2\\times 2$ minor needs computing. Row 3 = $[0,5,0]$ also has two zeros — equally efficient.'],
      reviewSection: 'Math tab — Cofactor expansion strategy',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Scaling an $n\\times n$ matrix by $c$ multiplies the determinant by $c$ (not $c^n$).',
      whyStudentsThinkIt: 'Students apply the scalar multiplication rule entry-by-entry: "I scaled every entry by $c$, so everything scales by $c$."',
      correctionExample: '$A = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix}$, $\\det = 1$. Now $3A = \\begin{bmatrix}3&0\\\\0&3\\end{bmatrix}$, $\\det = 9 = 3^2$. Each ROW gets scaled by 3, and each scaling multiplies the det by 3. With 2 rows: $3^2 = 9$.',
      contrastCase: '$\\det(cA) = c^n \\det(A)$ for $n\\times n$ matrices. This is completely different from the scalar case where $c \\cdot (\\det A)$ would only scale once. Always raise $c$ to the $n$-th power.',
    },
    {
      falseBelief: 'Cofactor expansion always gives a different answer depending on which row you expand along.',
      whyStudentsThinkIt: 'The computation looks different when you use different rows or columns — students assume the result changes too.',
      correctionExample: 'The determinant is unique — cofactor expansion along ANY row or column gives the same value. Row 1 expansion of $\\begin{bmatrix}1&2\\\\3&4\\end{bmatrix}$: $1(4) - 2(3) = -2$. Column 2 expansion: $-2(3) + 4(1) = -2$. Always $-2$.',
      contrastCase: 'This is analogous to computing the area of a parallelogram — you can use base×height along any side and you always get the same area.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A structural engineer writes a system of 3 equations for the forces in a truss. She sets up the $3\\times 3$ coefficient matrix and computes its determinant — it comes out to 0. What does this tell her about the truss?',
      competingTechniques: 'Attempt to solve the system anyway vs. interpret the zero determinant geometrically',
      whyThisTechniqueWins: 'Determinant 0 means the system is singular — either no solution (the truss is over-constrained with contradictory forces) or infinitely many (under-determined, meaning the truss can deform without any applied forces — a structural failure mode). The determinant gives this diagnosis before any solving.',
    },
    {
      situation: 'In 3D computer graphics, a bounding-box computation needs to check whether three points are collinear (all on one line). You have three 3D points $P_1, P_2, P_3$. How do you test collinearity using a determinant?',
      competingTechniques: 'Compute parametric line equations and check each point vs. form a 3×3 matrix with the points as rows and compute the determinant',
      whyThisTechniqueWins: 'Form the matrix with rows $[P_1, 1]$, $[P_2, 1]$, $[P_3, 1]$ (homogeneous coordinates). $\\det = 0$ iff the three points are collinear (lie on one line). This is one matrix computation instead of three parametric substitutions, and it generalizes naturally to higher dimensions.',
    },
  ],

  debugging: [
    {
      commonError: 'Sign error in cofactor expansion — forgetting the alternating $+, -, +, -, \\ldots$ sign pattern.',
      symptom: 'Student computes each minor correctly but the final determinant has the wrong sign.',
      whyItHappened: 'The cofactor $C_{ij} = (-1)^{i+j} M_{ij}$. Students forget the $(-1)^{i+j}$ factor, especially for off-diagonal entries.',
      repairStrategy: 'Use the checkerboard pattern: $\\begin{bmatrix}+&-&+\\\\-&+&-\\\\+&-&+\\end{bmatrix}$. Write the signs on the matrix before computing. The top-left is always $+$, and signs alternate. For expansion along row $i$, start at $+$ if $i$ is odd, $-$ if $i$ is even (column 1), and alternate.',
    },
    {
      commonError: 'Confusing the minor $M_{ij}$ (the sub-matrix) with the cofactor $C_{ij}$ (the signed minor).',
      symptom: 'Student correctly deletes row $i$ and column $j$ but omits the sign $(-1)^{i+j}$.',
      whyItHappened: 'Two different but related terms; students remember to delete but forget to sign.',
      repairStrategy: 'Always write both steps: (1) delete row $i$ and column $j$ to get minor $M_{ij}$; (2) multiply by $(-1)^{i+j}$ to get cofactor $C_{ij}$; (3) multiply by entry $a_{ij}$. The determinant is $\\sum_j a_{ij} C_{ij}$.',
    },
  ],

  mastery: {
    targetLevel: 3,
    solveIndependently: 'Compute the determinant of any $3\\times 3$ matrix by cofactor expansion along the row or column with the most zeros, track sign changes through row swaps in row reduction, and compute $\\det(AB)$ using multiplicativity.',
    explainVerbally: 'Explain why identical rows give $\\det = 0$, why a row swap flips the sign, and why LU decomposition is preferred over cofactor expansion for large matrices.',
    detectIncorrectApplication: 'Identify when a student forgets the $(-1)^{i+j}$ sign in cofactor expansion, or applies $\\det(cA) = c\\det(A)$ instead of $c^n\\det(A)$.',
    transferToUnfamiliar: 'Given a system of equations representing a physical network, use the determinant to predict (before solving) whether the system has a unique solution, no solution, or infinitely many.',
  },
};
