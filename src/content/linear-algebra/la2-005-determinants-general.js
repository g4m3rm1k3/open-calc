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
    prose: [
      '**Where you are in the story:** In the last lesson you learned that the determinant of a 2×2 matrix measures how much area is scaled — and that a determinant of zero means space collapses irreversibly. Now you face a 3×3 matrix. The formula $ad - bc$ does not even have enough letters. You need a systematic method.',
      'The key insight is: **a 3×3 determinant can be reduced to a sum of three 2×2 determinants**. Pick any row or column. Multiply each entry by the determinant of the "leftover" 2×2 matrix you get by deleting that entry\'s row and column. Apply a checkerboard of plus and minus signs. Add everything up. This is called **cofactor expansion**.',
      '**Before cofactor expansion makes sense, two terms must be defined:**',
      '**Minor $M_{ij}$** — For the entry at row $i$, column $j$, delete that entire row and that entire column from the matrix. The determinant of what remains is the minor $M_{ij}$. For a 3×3 matrix, each minor is a 2×2 determinant you already know how to compute.',
      '**Cofactor $C_{ij}$** — The cofactor attaches a sign to the minor based on position. The sign is $(-1)^{i+j}$. This creates a checkerboard pattern across the matrix: corners get $+$, their neighbors get $-$, then $+$ again, alternating like a chess board. So $C_{ij} = (-1)^{i+j} M_{ij}$.',
      '**Cofactor expansion** — To compute $\\det(A)$, pick any row (say row 1). Multiply each entry $a_{1j}$ by its cofactor $C_{1j}$, then add all three results. You can also expand along any column — you get the same determinant regardless of which row or column you choose. This gives you a strategic choice: **always expand along the row or column with the most zeros**, since each zero entry contributes nothing to the sum and eliminates one 2×2 computation.',
      'Beyond the formula, determinants obey a set of **algebraic properties** that each have a geometric meaning:',
      '• **Row swap**: Flipping two rows flips the orientation of the space. The determinant changes sign. Two swaps cancel, restoring the original sign.',
      '• **Row scaling**: If you double one row, you double the "height" of the parallelepiped in that direction. Volume doubles. Determinant scales by the same factor.',
      '• **Row replacement**: Adding a multiple of one row to another row is a shear — it does not change volume. Determinant is unchanged. This is the most important property for computation.',
      '• **Triangular matrices**: All the volume information lives on the diagonal. $\\det = $ product of diagonal entries — no cofactor expansion needed.',
      '• **$\\det(AB) = \\det(A) \\cdot \\det(B)$**: If $A$ scales volume by 3 and $B$ scales it by 2, composing them scales by 6. This is the most important property for theory.',
      '**Where this is heading:** The next lesson (LU Decomposition) is Gaussian elimination tracked as a product of matrices. Because row replacements do not change the determinant, the LU process computes $\\det(A)$ as a free byproduct — just the product of the diagonal of $U$, adjusted for any row swaps.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 6 — Matrices & Transformations',
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
    visualizations: [
      {
        id: 'LALesson06_Inverses',
        title: 'Determinant as Volume Scaling',
        mathBridge: 'The yellow shape starts as the unit square (area = 1). Watch the determinant value as you adjust the matrix entries. The key insight extends to 3×3: the determinant is the signed volume of the parallelepiped formed by the three column vectors. A determinant of 2 means volumes double. A determinant of 0 means the three column vectors are coplanar and volume collapses to zero — space is irreversibly flattened.',
        caption: 'The determinant measures signed volume scaling.',
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
                '`det(A)` in MATLAB uses LU decomposition internally — never cofactor expansion for large matrices. Use cofactor expansion by hand to understand the formula; use `det()` in practice.',
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
                'Each property has a geometric meaning. det(AB) = det(A)·det(B) means "composing two transformations multiplies their area-scaling factors." Row swap flips orientation.',
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
          ]
        }
      },
      {
        id: 'PythonNotebook',
        title: 'Code: 3×3 Determinants and Properties',
        mathBridge: 'np.linalg.det(A) handles matrices of any size — it uses LU decomposition internally. The cells below compute a 3×3 determinant both by hand (cofactor expansion) and numerically, then verify the seven properties.',
        caption: 'Run each cell to verify the properties numerically.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing a 3×3 determinant: manual vs NumPy',
              prose: [
                'We compute det(A) by cofactor expansion along row 1, then verify with NumPy.',
                'A = [[1,2,3],[4,5,6],[7,2,9]]. Expansion: 1·det([[5,6],[2,9]]) − 2·det([[4,6],[7,9]]) + 3·det([[4,5],[7,2]])',
                '= 1·(45−12) − 2·(36−42) + 3·(8−35) = 33 + 12 − 81 = −36',
              ],
              code: `import numpy as np

A = np.array([[1., 2., 3.],
              [4., 5., 6.],
              [7., 2., 9.]])

# NumPy (internally uses LU decomposition — same result)
print(f"np.linalg.det(A) = {np.linalg.det(A):.1f}")  # should be -36.0

# Manual cofactor expansion along row 1
# M11: delete row 0, col 0 → remaining = [[5,6],[2,9]]
M11 = 5*9 - 6*2    # = 33
# M12: delete row 0, col 1 → remaining = [[4,6],[7,9]]
M12 = 4*9 - 6*7    # = -6  (note: cofactor sign = -1)
# M13: delete row 0, col 2 → remaining = [[4,5],[7,2]]
M13 = 4*2 - 5*7    # = -27

det_manual = 1*M11 + (-1)*(-1)*M12 + 1*M13  # signs: +1, -1, +1
# Equivalently: a11*M11 - a12*M12 + a13*M13
det_manual = 1*M11 - 2*M12 + 3*M13
print(f"Manual cofactor expansion = {det_manual}")  # -36`,
            },
            {
              id: 2,
              cellTitle: "Sarrus's rule verification",
              prose: [
                "Sarrus's rule: sum three forward diagonals, subtract three backward diagonals. Only valid for 3×3.",
                'The six terms correspond exactly to the six permutations in the Leibniz formula for n=3.',
              ],
              code: `import numpy as np

A = np.array([[1., 2., 3.],
              [4., 5., 6.],
              [7., 2., 9.]])

a,b,c = A[0];  d,e,f = A[1];  g,h,i = A[2]

# Forward diagonals: aei, bfg, cdh
# Backward diagonals: ceg, afh, bdi
sarrus = (a*e*i + b*f*g + c*d*h) - (c*e*g + a*f*h + b*d*i)
print(f"Sarrus rule:    {sarrus}")
print(f"NumPy det:      {np.linalg.det(A):.1f}")
print(f"Match: {np.isclose(sarrus, np.linalg.det(A))}")`,
            },
            {
              id: 3,
              cellTitle: 'Verifying the key properties',
              prose: [
                'Property 6 (det(AB) = det(A)det(B)) and Property 7 (det(A^T) = det(A)) are the most important for theoretical work.',
                'We also verify: row swap flips sign; triangular matrix → product of diagonal.',
              ],
              code: `import numpy as np

A = np.array([[2., 1.], [5., 3.]])
B = np.array([[1., 0.], [2., 4.]])

dA, dB, dAB = np.linalg.det(A), np.linalg.det(B), np.linalg.det(A @ B)
print("--- Property 6: det(AB) = det(A) * det(B) ---")
print(f"det(A)  = {dA:.4f}")
print(f"det(B)  = {dB:.4f}")
print(f"det(AB) = {dAB:.4f}")
print(f"det(A)*det(B) = {dA*dB:.4f}")
print(f"Equal? {np.isclose(dAB, dA*dB)}")

print()
print("--- Property 7: det(A^T) = det(A) ---")
print(f"det(A)   = {dA:.4f}")
print(f"det(A^T) = {np.linalg.det(A.T):.4f}")

print()
print("--- Property 2: row swap flips sign ---")
A_swapped = A[[1,0], :]           # swap rows 0 and 1
print(f"det(A)           = {dA:.4f}")
print(f"det(A row-swapped) = {np.linalg.det(A_swapped):.4f}")

print()
print("--- Triangular matrix: det = product of diagonal ---")
T = np.array([[3., 1., 5.],
              [0., 2., 4.],
              [0., 0., 7.]])
print(f"det(T) = {np.linalg.det(T):.1f}")
print(f"3×2×7  = {3*2*7}")`,
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
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "3×3 Determinant by Cofactor Expansion",
      problem: "Compute $\\det(A)$ for $A = \\begin{bmatrix} 2 & -1 & 0 \\\\ 3 & 2 & 1 \\\\ 0 & 1 & 4 \\end{bmatrix}$ by expanding along row 1.",
      steps: [
        {
          expression: "C_{11} = (+1)\\det\\begin{bmatrix} 2 & 1 \\\\ 1 & 4 \\end{bmatrix} = (+1)(8-1) = 7",
          annotation: "Entry (1,1): sign $(-1)^{1+1} = +1$. Delete row 1 and column 1. The remaining 2×2 matrix is rows 2–3, columns 2–3. Compute its determinant: $2 \\cdot 4 - 1 \\cdot 1 = 7$.",
          strategyTitle: "First cofactor",
          checkpoint: "Which entries remain after deleting row 1 and column 1?",
          hints: ["Rows 2 and 3, columns 2 and 3 remain: [[2,1],[1,4]]. Its det = 2·4 − 1·1 = 7."],
        },
        {
          expression: "C_{12} = (-1)\\det\\begin{bmatrix} 3 & 1 \\\\ 0 & 4 \\end{bmatrix} = (-1)(12-0) = -12",
          annotation: "Entry (1,2): sign $(-1)^{1+2} = -1$. Delete row 1 and column 2. Remaining: rows 2–3, columns 1 and 3. Minor = $3 \\cdot 4 - 1 \\cdot 0 = 12$. Cofactor = $-12$.",
          strategyTitle: "Second cofactor — sign flips",
          checkpoint: "Why does the sign flip for the (1,2) position?",
          hints: ["The checkerboard: position (1,2) has exponent 1+2=3, which is odd, so $(-1)^3 = -1$."],
        },
        {
          expression: "C_{13} = (+1)\\det\\begin{bmatrix} 3 & 2 \\\\ 0 & 1 \\end{bmatrix} = (+1)(3-0) = 3",
          annotation: "Entry (1,3): sign $(-1)^{1+3} = +1$. Delete row 1 and column 3. Remaining: rows 2–3, columns 1 and 2. Minor = $3 \\cdot 1 - 2 \\cdot 0 = 3$.",
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
      id: "ex-2",
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
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
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
      id: "ch-2",
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
      id: "ch-3",
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
        note: 'LU decomposition is Gaussian elimination tracked as matrix factors. Because all steps are row replacements (det unchanged) plus tracked row swaps (each flips sign), det(A) = ±(product of diagonal of U) — cofactor expansion is never needed.'
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
        id: "assess-1",
        type: "input",
        text: "What is the determinant of $\\begin{bmatrix} 2 & 0 & 0 \\\\ 1 & -3 & 0 \\\\ 4 & 2 & 5 \\end{bmatrix}$?",
        answer: "-30",
        hint: "This is a lower triangular matrix. det = product of diagonal entries = 2 × (−3) × 5 = −30."
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
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'quiz-1',
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
      id: 'quiz-2',
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
    }
  ]
};
