export default {
  id: 'la2-011',
  slug: 'four-fundamental-subspaces',
  chapter: 'la2',
  order: 11,
  title: 'The Four Fundamental Subspaces',
  subtitle: 'Every matrix $A$ produces four subspaces: column space, null space, row space, and left null space. These four spaces fit together perfectly — they are orthogonal complements in pairs — and their dimensions satisfy a single equation: rank plus nullity equals $n$.',
  tags: ['four fundamental subspaces', 'column space', 'null space', 'row space', 'left null space', 'rank-nullity', 'orthogonal complement', 'big picture'],
  aliases: 'four fundamental subspaces column space null space row space left null space rank nullity theorem big picture Strang',

  hook: {
    question: "You solve $A\\mathbf{x} = \\mathbf{b}$ for some $\\mathbf{b}$ and get a solution. How many solutions are there? What right-hand sides $\\mathbf{b}$ even have solutions? These questions have clean answers — once you see the four subspaces that every matrix generates.",
    realWorldContext: "The four fundamental subspaces are the organizing principle of all of linear algebra. In signal processing, the null space of a measurement matrix determines what signals are invisible to the sensor. In control theory, the null space identifies uncontrollable modes. In data science, the column space of the data matrix is the span of features the model can represent; the null space encodes redundancy. Understanding these four spaces explains why least-squares works, why the pseudoinverse gives a unique minimum-norm solution, and why the rank-nullity theorem holds.",
    previewVisualizationId: 'OpenMatNotebook',
  },

  intuition: {
    prose: [
      '**The four subspaces from a concrete matrix.** Let $A = \\begin{pmatrix}1&2&3\\\\4&5&6\\end{pmatrix}$ (2×3). Row reduce: $\\begin{pmatrix}1&2&3\\\\0&-3&-6\\end{pmatrix} \\to \\begin{pmatrix}1&0&-1\\\\0&1&2\\end{pmatrix}$. Pivot columns: 1 and 2. Rank = 2. The four subspaces: (1) **Column space** $C(A) \\subseteq \\mathbb{R}^2$: span of pivot columns $\\{(1,4),(2,5)\\}$, dim = 2. (2) **Null space** $N(A) \\subseteq \\mathbb{R}^3$: solve $A\\mathbf{x}=0$, one free variable $x_3$, giving $\\mathbf{x} = t(-1,-2,1)^\\top$, dim = 1. (3) **Row space** $C(A^\\top) \\subseteq \\mathbb{R}^3$: span of non-zero rows after reduction $\\{(1,0,-1),(0,1,2)\\}$, dim = 2. (4) **Left null space** $N(A^\\top) \\subseteq \\mathbb{R}^2$: solve $A^\\top\\mathbf{y}=0$, i.e., $\\mathbf{y}^\\top A = 0$, dim = $2-2=0$ (only $\\mathbf{y}=0$). Dimension check: $2+1=3$ ✓ and $2+0=2$ ✓.',
      '**Rank-nullity theorem.** For any $m \\times n$ matrix $A$ with rank $r$: $\\dim C(A) = r$, $\\dim N(A) = n - r$, $\\dim C(A^\\top) = r$, $\\dim N(A^\\top) = m - r$. Two key equations: $r + (n-r) = n$ (columns) and $r + (m-r) = m$ (rows). The rank measures "how much the matrix does"; the nullity measures "how much it ignores."',
      '**Orthogonality between the pairs.** The row space and null space are orthogonal complements in $\\mathbb{R}^n$: every vector in $C(A^\\top)$ is perpendicular to every vector in $N(A)$. Proof: if $A^\\top\\mathbf{w}$ is in the row space and $A\\mathbf{x}=0$, then $\\langle A^\\top\\mathbf{w}, \\mathbf{x}\\rangle = \\mathbf{w}^\\top(A\\mathbf{x}) = 0$. Similarly, $C(A)$ and $N(A^\\top)$ are orthogonal complements in $\\mathbb{R}^m$. This gives the complete picture: $\\mathbb{R}^n = C(A^\\top) \\oplus N(A)$ and $\\mathbb{R}^m = C(A) \\oplus N(A^\\top)$.',
      '**What this means for $A\\mathbf{x}=\\mathbf{b}$.** A solution exists iff $\\mathbf{b} \\in C(A)$ (i.e., $\\mathbf{b} \\perp N(A^\\top)$). If a solution $\\mathbf{x}_p$ exists, the complete solution is $\\mathbf{x}_p + N(A)$ — a particular solution plus anything in the null space. The minimum-norm solution is the particular solution with $\\mathbf{x}_p \\in C(A^\\top)$ (row space).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Prediction: dimensions for a rank-3 matrix',
        body: 'Let $A$ be a $5 \\times 7$ matrix with rank 3. **Before computing:** predict all four dimensions. After predicting: $\\dim C(A) = 3$, $\\dim N(A) = 7-3 = 4$, $\\dim C(A^\\top) = 3$, $\\dim N(A^\\top) = 5-3 = 2$. Check: $3+4=7$ (columns) ✓, $3+2=5$ (rows) ✓. The four numbers $3, 4, 3, 2$ are completely determined by just knowing the rank and size.',
      },
      {
        type: 'theorem',
        title: 'Rank-Nullity Theorem',
        body: 'For an $m \\times n$ matrix $A$ with rank $r$:\n\n$\\dim C(A) + \\dim N(A^\\top) = m$ (column space + left null space)\n$\\dim C(A^\\top) + \\dim N(A) = n$ (row space + null space)\n\nBoth equal $r + (m-r) = m$ and $r + (n-r) = n$.\n\nOrthogonality: $C(A^\\top) \\perp N(A)$ in $\\mathbb{R}^n$, and $C(A) \\perp N(A^\\top)$ in $\\mathbb{R}^m$.',
      },
      {
        type: 'insight',
        title: 'Solvability from the left null space',
        body: '$A\\mathbf{x} = \\mathbf{b}$ has a solution iff $\\mathbf{b} \\perp N(A^\\top)$.\n\nEquivalently: for every $\\mathbf{y}$ with $A^\\top\\mathbf{y} = 0$, we need $\\mathbf{y}^\\top\\mathbf{b} = 0$.\n\nThis is the **Fredholm alternative**: either $A\\mathbf{x} = \\mathbf{b}$ has a solution, or there exists $\\mathbf{y}$ with $A^\\top\\mathbf{y}=0$ and $\\mathbf{y}^\\top\\mathbf{b}\\neq 0$ — never both.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Four Fundamental Subspaces',
        mathBridge: 'Compute all four subspaces for a given matrix and verify orthogonality.',
        caption: 'Row space ⊥ null space in R^n; column space ⊥ left null space in R^m.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Four subspaces via SVD',
              prose: ['Extract bases for all four fundamental subspaces using the SVD.'],
              code: `% Matrix A (2x3, rank 2)
A = [1 2 3; 4 5 6]
[m, n] = size(A)
r = rank(A)
disp(['Size: ', num2str(m), 'x', num2str(n), ', Rank: ', num2str(r)])

% SVD: A = U*S*V' gives all four subspaces
[U, S, V] = svd(A, 'econ')

% Column space C(A): first r columns of U
disp('Column space basis (first r cols of U):')
col_space = U(:, 1:r)

% Row space C(A'): first r columns of V
disp('Row space basis (first r cols of V):')
row_space = V(:, 1:r)

% Null space N(A): last n-r columns of V
disp('Null space basis (last n-r cols of V):')
null_space = V(:, r+1:end)

% Left null space N(A'): last m-r columns of U
disp('Left null space basis (last m-r cols of U):')
left_null = U(:, r+1:end)

% Verify orthogonality: row space ⊥ null space
disp('Row space · Null space (should be ~0):')
row_space' * null_space
`,
            },
            {
              id: 2,
              cellTitle: 'Solvability check via left null space',
              prose: ['Check whether Ax=b has a solution using the Fredholm alternative.'],
              code: `A = [1 2 3; 4 5 6; 7 8 9]  % rank 2, 3x3
b1 = [1; 2; 3]   % test: is b1 in C(A)?
b2 = [1; 2; 4]   % test: is b2 in C(A)?

% Find basis for left null space N(A')
[U, S, ~] = svd(A)
r = rank(A)
left_null = U(:, r+1:end)
disp('Left null space basis:')
left_null

% Fredholm: Ax=b solvable iff left_null' * b = 0
disp('Fredholm check for b1 (should be 0):')
left_null' * b1

disp('Fredholm check for b2 (should be nonzero):')
left_null' * b2

% Verify directly
disp('Rank of [A b1] vs rank(A):')
[rank(A), rank([A b1])]
disp('Rank of [A b2] vs rank(A):')
[rank(A), rank([A b2])]
`,
            },
          ],
        },
      },
    ],
  },

  math: {
    prose: [
      '**Finding subspace bases systematically.** Given $A$, row reduce to RREF. (1) **Column space**: take the pivot columns of the ORIGINAL matrix $A$ (not the reduced form — reduction changes the column space). (2) **Null space**: the RREF gives $x_{\\text{free}} = $ free variables; express pivot variables in terms of free, set one free variable to 1 and others to 0 for each basis vector. (3) **Row space**: take the non-zero rows of the RREF (row reduction preserves the row space). (4) **Left null space**: row reduce $[A | I_m]$ and the rows of the right block corresponding to zero rows on the left give the left null space basis.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The Big Picture Diagram',
        body: 'Every vector $\\mathbf{x} \\in \\mathbb{R}^n$ splits: $\\mathbf{x} = \\mathbf{x}_{\\text{row}} + \\mathbf{x}_{\\text{null}}$ (row space + null space component).\n\n$A$ maps: $\\mathbf{x}_{\\text{row}} \\mapsto A\\mathbf{x}_{\\text{row}} \\in C(A)$ (bijection from row space to column space), and $\\mathbf{x}_{\\text{null}} \\mapsto 0$.\n\nSo $A$ is an isomorphism from the row space to the column space — both have dimension $r$.\n\nThe "invisible" part of any input is its null space component.',
      },
    ],
    visualizations: [],
  },

  rigor: {
    prose: [
      '**Generalization beyond finite dimensions.** For a bounded linear operator $T: V \\to W$ between Banach spaces, the four fundamental subspaces generalize to: $\\ker T$, $\\text{im}\\, T$, $\\ker T^*$, $\\text{im}\\, T^*$. The Fredholm alternative still holds for Fredholm operators: $\\dim \\ker T = \\dim \\ker T^*$ (Fredholm index 0 for self-adjoint operators). For compact operators, this gives the Fredholm integral equation theory. In PDE, the solvability of $Lu = f$ (for a differential operator $L$) requires $f \\perp \\ker L^*$ — a direct generalization of the matrix Fredholm alternative.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Rank-Nullity in Infinite Dimensions',
        body: 'For a linear map $T: V \\to W$ with $V$ finite-dimensional:\n$\\dim V = \\dim \\ker T + \\dim \\text{im}\\, T$\n\nFor infinite-dimensional operators, this fails in general. However, for Fredholm operators:\n$\\text{ind}(T) = \\dim \\ker T - \\dim \\text{coker}\\, T$\nis finite and stable under compact perturbations.\n\nFor $A: \\mathbb{R}^n \\to \\mathbb{R}^m$: ind$(A) = n - m$ (by rank-nullity applied twice).',
      },
    ],
    visualizations: [],
  },

  examples: [
    {
      id: 'ex-la2-011-1',
      title: 'All four subspaces for a 3×4 matrix',
      problem: 'Find bases for all four fundamental subspaces of $A = \\begin{pmatrix}1&2&0&1\\\\0&0&1&2\\\\1&2&1&3\\end{pmatrix}$ and verify the dimension count.',
      steps: [
        { explanation: 'Row reduce $A$: $R_3 \\leftarrow R_3 - R_1$ gives row 3 → $(0,0,1,2)$. Then $R_3 \\leftarrow R_3 - R_2$: row 3 → $(0,0,0,0)$. RREF: $\\begin{pmatrix}1&2&0&1\\\\0&0&1&2\\\\0&0&0&0\\end{pmatrix}$. Pivot columns: 1 and 3. Rank $r = 2$.' },
        { explanation: '**Column space**: pivot columns of original $A$ are columns 1 and 3: $\\{(1,0,1)^\\top, (0,1,1)^\\top\\}$. Dimension = 2.' },
        { explanation: '**Null space**: free variables $x_2, x_4$. From RREF: $x_1 = -2x_2 - x_4$, $x_3 = -2x_4$. Two basis vectors: $x_2=1, x_4=0$: $(-2,1,0,0)^\\top$; and $x_2=0, x_4=1$: $(-1,0,-2,1)^\\top$. Dimension = 2 = $4-2$ ✓.' },
        { explanation: '**Row space**: non-zero rows of RREF: $\\{(1,2,0,1), (0,0,1,2)\\}$. Dimension = 2.' },
        { explanation: '**Left null space**: dimension = $3-2=1$. The zero row in RREF came from $R_3 - R_1 - R_2 = 0$ applied to original rows. So $\\mathbf{y} = (-1, -1, 1)^\\top$ satisfies $A^\\top \\mathbf{y} = 0$. Verify: $A^\\top(-1,-1,1)^\\top = (-1+0+1, -2+0+2, 0-1+1, -1-2+3)^\\top = (0,0,0,0)^\\top$ ✓.' },
        { explanation: 'Dimension check: $2+2=4$ (row space + null space = $n=4$) ✓. $2+1=3$ (column space + left null space = $m=3$) ✓.' },
      ],
    },
    {
      id: 'ex-la2-011-2',
      title: 'Solvability via the left null space (Fredholm)',
      problem: 'For $A = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$ (rank 1), determine which right-hand sides $\\mathbf{b}$ make $A\\mathbf{x} = \\mathbf{b}$ solvable, then solve for one such $\\mathbf{b}$.',
      steps: [
        { explanation: 'Find the left null space: $A^\\top\\mathbf{y} = 0$. $A^\\top = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$. Row reduce: $\\begin{pmatrix}1&2\\\\0&0\\end{pmatrix}$. So $y_1 + 2y_2 = 0$, giving basis $\\mathbf{y} = (-2, 1)^\\top$.' },
        { explanation: 'Fredholm condition: $A\\mathbf{x} = \\mathbf{b}$ solvable iff $\\mathbf{y}^\\top\\mathbf{b} = 0$, i.e., $-2b_1 + b_2 = 0$, i.e., $b_2 = 2b_1$. So solvable iff $\\mathbf{b} = (b_1, 2b_1)^\\top$.' },
        { explanation: 'Take $\\mathbf{b} = (1, 2)^\\top$ (satisfies $b_2 = 2b_1$). Solve $A\\mathbf{x} = \\mathbf{b}$: $x_1 + 2x_2 = 1$ (one equation, since row 2 is $2\\times$ row 1). Particular solution: $x_1 = 1, x_2 = 0$. Null space: $x_1 = -2t, x_2 = t$. Complete solution: $(1-2t, t)^\\top$.' },
        { explanation: 'Geometric picture: the complete solution is a line in $\\mathbb{R}^2$. The minimum-norm solution is the point on this line closest to the origin — the component in the row space.' },
      ],
    },
    {
      id: 'ex-la2-011-3',
      title: 'Orthogonality verification',
      problem: 'For $A = \\begin{pmatrix}1&0&2\\\\0&1&-1\\end{pmatrix}$, find the null space and row space, then verify they are orthogonal complements in $\\mathbb{R}^3$.',
      steps: [
        { explanation: 'Already in RREF. Rank = 2. Pivot columns: 1 and 2. Free variable: $x_3$.' },
        { explanation: 'Null space: $x_1 = -2x_3$, $x_2 = x_3$. Basis: $(-2, 1, 1)^\\top$. Dimension = 1.' },
        { explanation: 'Row space: rows of RREF: $\\{(1,0,2), (0,1,-1)\\}$. Dimension = 2.' },
        { explanation: 'Verify orthogonality: $(1,0,2)^\\top \\cdot (-2,1,1) = -2+0+2 = 0$ ✓. $(0,1,-1)^\\top \\cdot (-2,1,1) = 0+1-1 = 0$ ✓.' },
        { explanation: 'Orthogonal complement check: $\\mathbb{R}^3 = C(A^\\top) \\oplus N(A)$. Since $2+1=3$ and they are orthogonal, they span all of $\\mathbb{R}^3$ ✓. Any vector $(a,b,c)^\\top = $ (row space part) + (null space part): row part $= (a+2c)/5\\cdot(1,0,2)+(b-c)/2\\cdot(0,1,-1)$... the dimensions confirm it works.' },
      ],
    },
  ],

  challenges: [
    {
      id: 'ch-la2-011-1',
      title: 'Minimum-norm solution lives in the row space',
      difficulty: 'medium',
      prompt: 'For $A\\mathbf{x} = \\mathbf{b}$ with multiple solutions, prove that the unique solution in the row space $C(A^\\top)$ has minimum norm among all solutions.',
      hint: 'Write any solution as $\\mathbf{x} = \\mathbf{x}_r + \\mathbf{x}_n$ where $\\mathbf{x}_r \\in C(A^\\top)$ and $\\mathbf{x}_n \\in N(A)$, then use the Pythagorean theorem.',
      solution: 'Any solution to $A\\mathbf{x}=\\mathbf{b}$ is $\\mathbf{x} = \\mathbf{x}_r + \\mathbf{x}_n$ where $\\mathbf{x}_r \\in C(A^\\top)$ (the row space component) and $\\mathbf{x}_n \\in N(A)$ (null space component). Since $C(A^\\top) \\perp N(A)$, by Pythagoras: $\\|\\mathbf{x}\\|^2 = \\|\\mathbf{x}_r\\|^2 + \\|\\mathbf{x}_n\\|^2 \\geq \\|\\mathbf{x}_r\\|^2$. The minimum is achieved when $\\mathbf{x}_n = 0$, i.e., $\\mathbf{x} = \\mathbf{x}_r \\in C(A^\\top)$. This minimum-norm solution is unique (the row space component is unique).',
    },
  ],

  mentalModel: [
    'Four subspaces: $C(A)$ in $\\mathbb{R}^m$, $N(A)$ in $\\mathbb{R}^n$, $C(A^\\top)$ in $\\mathbb{R}^n$, $N(A^\\top)$ in $\\mathbb{R}^m$.',
    'Dimensions: $r, n-r, r, m-r$ where $r = $ rank$(A)$.',
    'Orthogonal pairs: $C(A^\\top) \\perp N(A)$ in $\\mathbb{R}^n$; $C(A) \\perp N(A^\\top)$ in $\\mathbb{R}^m$.',
    'Solvability: $A\\mathbf{x}=\\mathbf{b}$ solvable iff $\\mathbf{b} \\perp N(A^\\top)$.',
    'Minimum-norm solution: the unique solution in the row space $C(A^\\top)$.',
  ],

  checkpoints: [
    { id: 'cp-la2-011-1', label: 'Read the four subspaces from the concrete 2×3 example', type: 'read' },
    { id: 'cp-la2-011-2', label: 'Read the rank-nullity theorem and orthogonality pairs', type: 'read' },
    { id: 'cp-la2-011-3', label: 'Read the solvability condition via the left null space', type: 'read' },
    { id: 'cp-la2-011-4', label: 'Extract all four subspaces via SVD in the notebook', type: 'lab' },
    { id: 'cp-la2-011-5', label: 'Test solvability using the Fredholm alternative in the notebook', type: 'lab' },
    { id: 'cp-la2-011-6', label: 'Trace the 3×4 matrix four-subspace example', type: 'example' },
    { id: 'cp-la2-011-7', label: 'Trace the Fredholm solvability and orthogonality example', type: 'example' },
    { id: 'cp-la2-011-8', label: 'Prove the minimum-norm solution lives in the row space', type: 'challenge' },
  ],

  assessment: 'For the matrix $A = \\begin{pmatrix}2&1&3\\\\4&2&6\\end{pmatrix}$: (a) find rank and all four dimensions; (b) find a basis for each of the four subspaces; (c) determine which $\\mathbf{b} = (b_1, b_2)^\\top$ make $A\\mathbf{x}=\\mathbf{b}$ solvable.',

  quiz: [
    {
      id: 'q-la2-011-1',
      type: 'choice',
      text: 'For an $m \\times n$ matrix with rank $r$, what is $\\dim N(A)$?',
      options: ['$r$', '$m - r$', '$n - r$', '$m + n - r$'],
      answer: '$n - r$',
      hints: ['The null space lives in $\\mathbb{R}^n$ (the domain).', 'Rank-nullity: rank + nullity = number of columns = $n$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-2',
      type: 'choice',
      text: 'For a $5 \\times 7$ matrix with rank 3, what is $\\dim N(A^\\top)$?',
      options: ['$3$', '$4$', '$2$', '$5$'],
      answer: '$2$',
      hints: ['Left null space dimension = $m - r$.', '$5 - 3 = 2$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-3',
      type: 'choice',
      text: 'The row space $C(A^\\top)$ and null space $N(A)$ are:',
      options: ['Parallel subspaces in $\\mathbb{R}^n$', 'Orthogonal complements in $\\mathbb{R}^n$', 'Equal when $A$ is symmetric', 'Orthogonal complements in $\\mathbb{R}^m$'],
      answer: 'Orthogonal complements in $\\mathbb{R}^n$',
      hints: ['Both live in $\\mathbb{R}^n$ (the domain of $A$).', 'Their dimensions add up to $n$, and they are perpendicular.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-4',
      type: 'choice',
      text: '$A\\mathbf{x} = \\mathbf{b}$ has a solution if and only if $\\mathbf{b}$ is:',
      options: ['In the null space of $A$', 'Perpendicular to the row space', 'In the column space of $A$', 'A unit vector'],
      answer: 'In the column space of $A$',
      hints: ['$C(A)$ = all possible outputs $A\\mathbf{x}$.', 'If $\\mathbf{b} \\in C(A)$, some $\\mathbf{x}$ produces it.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-5',
      type: 'choice',
      text: 'For $A = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$ (rank 1), the left null space $N(A^\\top)$ has basis:',
      options: ['$(1,0)^\\top$', '$(2,1)^\\top$', '$(-2,1)^\\top$', '$(0,0)^\\top$'],
      answer: '$(-2,1)^\\top$',
      hints: ['Left null space: solve $A^\\top \\mathbf{y} = 0$.', '$A^\\top = A$ here (symmetric). Row reduce: $y_1 + 2y_2 = 0$, so $\\mathbf{y} = (-2,1)^\\top$.'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la2-011-6',
      type: 'choice',
      text: 'For $A = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$, which $\\mathbf{b}$ makes $A\\mathbf{x}=\\mathbf{b}$ solvable?',
      options: ['$(1,3)^\\top$', '$(1,2)^\\top$', '$(2,3)^\\top$', '$(0,1)^\\top$'],
      answer: '$(1,2)^\\top$',
      hints: ['Solvable iff $\\mathbf{b} \\perp N(A^\\top) = \\text{span}\\{(-2,1)^\\top\\}$.', '$(-2)(1) + (1)(b_2) = 0 \\Rightarrow b_2 = 2b_1$. Which option satisfies $b_2 = 2b_1$?'],
      reviewSection: 'examples',
    },
    {
      id: 'q-la2-011-7',
      type: 'choice',
      text: 'A basis for the column space is found from:',
      options: ['Non-zero rows of RREF', 'Pivot columns of the ORIGINAL matrix $A$', 'Pivot columns of the RREF', 'The null space vectors'],
      answer: 'Pivot columns of the ORIGINAL matrix $A$',
      hints: ['Row operations change the column space — use original columns.', 'The pivot positions identify WHICH columns span $C(A)$, but you take them from $A$.'],
      reviewSection: 'math',
    },
    {
      id: 'q-la2-011-8',
      type: 'choice',
      text: 'The minimum-norm solution to $A\\mathbf{x}=\\mathbf{b}$ (when solutions exist) lies in:',
      options: ['The null space $N(A)$', 'The column space $C(A)$', 'The row space $C(A^\\top)$', 'The left null space $N(A^\\top)$'],
      answer: 'The row space $C(A^\\top)$',
      hints: ['Any solution = row space part + null space part.', 'Adding a null space component increases norm. Minimum norm means no null space component.'],
      reviewSection: 'challenges',
    },
    {
      id: 'q-la2-011-9',
      type: 'choice',
      text: 'For a $3 \\times 3$ invertible matrix $A$, what are the dimensions of all four subspaces?',
      options: ['$3, 0, 3, 0$', '$3, 3, 3, 3$', '$2, 1, 2, 1$', '$3, 1, 3, 1$'],
      answer: '$3, 0, 3, 0$',
      hints: ['Invertible means rank = $n = m = 3$.', '$\\dim C(A)=3, \\dim N(A)=0, \\dim C(A^\\top)=3, \\dim N(A^\\top)=0$.'],
      reviewSection: 'intuition',
    },
    {
      id: 'q-la2-011-10',
      type: 'choice',
      text: 'The row space and null space are orthogonal because:',
      options: [
        'For any $A^\\top\\mathbf{w}$ and $\\mathbf{x}$ with $A\\mathbf{x}=0$: $\\langle A^\\top\\mathbf{w}, \\mathbf{x}\\rangle = \\mathbf{w}^\\top(A\\mathbf{x}) = 0$',
        'Rows of $A$ are always perpendicular by definition',
        'The RREF has orthogonal rows',
        'They live in different spaces',
      ],
      answer: 'For any $A^\\top\\mathbf{w}$ and $\\mathbf{x}$ with $A\\mathbf{x}=0$: $\\langle A^\\top\\mathbf{w}, \\mathbf{x}\\rangle = \\mathbf{w}^\\top(A\\mathbf{x}) = 0$',
      hints: ['Row space = column space of $A^\\top$, spanned by vectors $A^\\top w$.', 'Inner product of row space vector with null space vector: $\\langle A^\\top w, x\\rangle = w^\\top Ax = w^\\top 0 = 0$.'],
      reviewSection: 'intuition',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'For any given matrix, find bases for all four fundamental subspaces by row reducing; verify dimensions using rank-nullity; check solvability of $A\\mathbf{x}=\\mathbf{b}$ using the Fredholm condition.',
    explainVerbally: 'Explain how $\\mathbb{R}^n$ splits into row space and null space (orthogonal complements), and why the minimum-norm solution to $A\\mathbf{x}=\\mathbf{b}$ is the component of any solution in the row space.',
    detectIncorrectApplication: 'Catch the error of taking pivot columns from the RREF (not the original matrix) for the column space basis, or confusing null space $N(A)$ with left null space $N(A^\\top)$.',
    transferToUnfamiliar: 'Apply the Fredholm alternative to determine solvability: if someone gives you $A\\mathbf{x}=\\mathbf{b}$ with no obvious solution, find the left null space and check if $\\mathbf{y}^\\top\\mathbf{b}=0$ for all $\\mathbf{y} \\in N(A^\\top)$.',
  },

  misconceptions: [
    {
      falseBelief: 'The column space basis comes from the pivot columns of the RREF.',
      whyStudentsThinkIt: 'Row reduction produces a clean RREF, and students naturally use those columns for the column space. But row operations change column relationships — only row operations preserve the null space and row space.',
      correctionExample: 'For $A = \\begin{pmatrix}1&2\\\\2&4\\end{pmatrix}$, RREF is $\\begin{pmatrix}1&2\\\\0&0\\end{pmatrix}$. Pivot column 1 in RREF is $(1,0)^\\top$, but the actual column space basis is column 1 of $A$: $(1,2)^\\top$. These are different!',
      contrastCase: 'The pivot POSITIONS (which column indices) are the same in $A$ and its RREF. But you must go back to $A$ to get the actual basis vectors for $C(A)$. Row space and null space use the RREF directly.',
    },
    {
      falseBelief: 'The null space and column space are orthogonal.',
      whyStudentsThinkIt: 'Students hear "the four subspaces come in orthogonal pairs" and incorrectly pair $N(A)$ with $C(A)$ instead of $C(A^\\top)$.',
      correctionExample: 'For $A = \\begin{pmatrix}1&0\\\\0&0\\end{pmatrix}$: $C(A) = \\text{span}\\{(1,0)^\\top\\}$ and $N(A) = \\text{span}\\{(0,1)^\\top\\}$. These ARE orthogonal here, but only by coincidence (the standard basis is orthogonal). In general, $N(A) \\not\\perp C(A)$.',
      contrastCase: 'The correct orthogonal pairs are: $C(A^\\top) \\perp N(A)$ (both in $\\mathbb{R}^n$) and $C(A) \\perp N(A^\\top)$ (both in $\\mathbb{R}^m$). Remember: orthogonality requires the vectors to live in the same space.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A compressed sensing problem gives you $m$ measurements of an $n$-dimensional signal ($m < n$). The system $A\\mathbf{x}=\\mathbf{b}$ is underdetermined. How do the four fundamental subspaces tell you about recoverability?',
      competingTechniques: ['Try to solve by least squares (gives a particular solution)', 'Analyze the null space: signals in $N(A)$ are completely invisible to the measurements'],
      whyThisTechniqueWins: 'The null space $N(A)$ has dimension $n-m$ — a large family of signals that produce zero measurements. Any solution $\\mathbf{x}_0$ could actually be $\\mathbf{x}_0 +$ (any null space vector). Recovery requires additional assumptions (like sparsity) to identify which element of the null space coset is the true signal.',
    },
    {
      situation: 'In a linear regression model $X\\boldsymbol{\\beta} = \\mathbf{y}$ (overdetermined, $m > n$), the system usually has no exact solution. How do the four subspaces describe what the model can and cannot fit?',
      competingTechniques: ['Just minimize $\\|X\\boldsymbol{\\beta}-\\mathbf{y}\\|^2$ (least squares)', 'Decompose $\\mathbf{y} = \\mathbf{y}_{\\text{col}} + \\mathbf{y}_{\\text{left null}}$ and recognize only $\\mathbf{y}_{\\text{col}}$ is fittable'],
      whyThisTechniqueWins: 'The component of $\\mathbf{y}$ in $C(X)$ is what the model CAN fit exactly; the component in $N(X^\\top)$ (left null space) is the irreducible residual. Least squares gives the best possible $\\hat{\\mathbf{y}} = P_{C(X)}\\mathbf{y}$ — the projection onto the column space.',
    },
  ],

  debugging: [
    {
      commonError: 'Applying the Fredholm alternative incorrectly — checking null space of $A$ instead of $A^\\top$.',
      symptom: 'Student checks if $\\mathbf{b} \\perp N(A)$ for solvability, but $N(A)$ lives in the domain, not the codomain.',
      whyItHappened: 'Confusion between $N(A)$ (vectors $\\mathbf{x}$ with $A\\mathbf{x}=0$) and $N(A^\\top)$ (vectors $\\mathbf{y}$ with $A^\\top\\mathbf{y}=0$). Both are called "null spaces" and students mix them up.',
      repairStrategy: 'Solvability of $A\\mathbf{x}=\\mathbf{b}$: check $\\mathbf{b}$ against $N(A^\\top)$ (left null space, in $\\mathbb{R}^m$). Mnemonic: "$\\mathbf{b}$ lives in $\\mathbb{R}^m$, so the check must also be in $\\mathbb{R}^m$. Left null space is also in $\\mathbb{R}^m$."',
    },
    {
      commonError: 'Forgetting that the column space basis uses ORIGINAL matrix columns, not RREF columns.',
      symptom: 'Student row reduces to RREF, identifies pivot column positions (e.g., columns 1 and 3), then uses the pivot columns from the RREF as the column space basis.',
      whyItHappened: 'The RREF is the cleanest form of the matrix, and students naturally read off everything from it. But row operations change what column vectors look like.',
      repairStrategy: 'After identifying pivot column INDICES from the RREF (say, columns 1 and 3), go back to the ORIGINAL matrix and take those columns. For the null space, row space, and left null space, you can use the RREF directly.',
    },
  ],
};
