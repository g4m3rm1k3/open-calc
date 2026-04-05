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
      '**Where you are in the story:** You just saw that one Matrix acts as a single warp to the fabric of space. But what if you need to perform multiple actions? This lesson teaches the algebra of chaining spatial warps together.',
      'Imagine dragging space with matrix $A$. All the grid lines warp. Then, you immediately drag *that already warped space* with a second matrix, $B$.',
      'Because every line remains perfectly straight and evenly spaced throughout both warps, the final resting spot of the grid could have simply been reached in *one single warp*. That single, equivalent warp is the matrix product $BA$.',
      'Wait, why $BA$ and not $AB$? In mathematics, we write transformations as functions, like $B(A(x))$. You evaluate from the inside out. You apply $A$ first, then $B$. So when you chain matrices, you read the multiplication **Right-to-Left**.',
      'One of the most profound realizations in linear algebra is that order matters. If you rotate a book 90 degrees and then drop it on its face, it ends up in a completely different position than if you drop it on its face and *then* rotate it 90 degrees. In matrix math, $AB$ almost never equals $BA$. This is called being Non-Commutative.',
      '**Where this is heading:** Once we know how to chain transformations forward, we will ask the natural next question: "Can we multiply by a matrix that perfectly undoes the transformation we just did?" That is the Inverse matrix.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 4 — Matrices & Transformations',
        body: '**Previous:** One matrix performs one transformation.\n**This lesson:** Multiplying matrices composes multiple transformations into one.\n**Next:** How to undo a transformation (Inverse matrices).',
      },
      {
        type: 'warning',
        title: 'Read Right-to-Left!',
        body: 'When you see the matrix math $CBA\\vec{v}$, it physically means: Take vector $v$, apply transformation $A$, then apply transformation $B$, then apply transformation $C$. The matrix physically closest to the vector hits it first.',
      },
      {
        type: 'insight',
        title: 'Chaining Columns',
        body: 'To figure out the columns of the final combined matrix $BA$, you just need to track where the original $\\hat{i}$ and $\\hat{j}$ land. Where does $\\hat{i}$ land after $A$? (The first column of A). Now, where does *that* new vector land when subjected to $B$? That final resting place is the first column of the combined matrix!',
      },
    ],
    visualizations: [
      {
        id: 'LALesson05_MatrixMult',
        title: 'Composing Two Warps',
        mathBridge: 'Step 1: Check the two individual matrices, A (a shear) and B (a rotation). Step 2: Use the playback slider. Watch the space undergo the shear A, and then undergo the rotation B. Step 3: Look at the final destination of the red $\\hat{i}$ and green $\\hat{j}$ basis vectors. Those coordinates exactly match the columns of the mathematically derived product matrix BA.',
        caption: 'Applying matrix A, then matrix B, is physically equivalent to applying the single matrix BA.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'There is a mechanical algorithm for multiplying two matrices $A$ and $B$ by hand. Note that to multiply two matrices, their inner dimensions must match: an $(m \\times n)$ matrix times an $(n \\times p)$ matrix creates an $(m \\times p)$ matrix.',
      'To find the entry in the $i$-th row and $j$-th column of the new matrix, you take the **Dot Product** of the $i$-th row of the left matrix and the $j$-th column of the right matrix.',
      'For a $2 \\times 2$ example:',
      '$$ \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix} \\begin{bmatrix} e & f \\\\ g & h \\end{bmatrix} = \\begin{bmatrix} (ae+bg) & (af+bh) \\\\ (ce+dg) & (cf+dh) \\end{bmatrix} $$',
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
      'Formally, matrix multiplication corresponds exactly to the composition of linear transformations. Let $T_1: U \\to V$ and $T_2: V \\to W$ be linear transformations.',
      'The composition $(T_2 \\circ T_1)(\\vec{u})$ applies $T_1$ to vector $\\vec{u}$, and then applies $T_2$ to the result: $T_2(T_1(\\vec{u}))$.',
      'If $A$ is the matrix for $T_2$ and $B$ is the matrix for $T_1$, then the matrix product $AB$ represents the composition $T_2 \\circ T_1$. The formula for matrix multiplication (row dotted with column) is not an arbitrary invention; it is the inescapable algebraic result of expanding the nested functions $T_2(T_1(\\vec{x}))$ and grouping the terms.',
    ],
    callouts: [],
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
