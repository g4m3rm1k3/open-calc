export default {
  id: 'la1-002',
  slug: 'linear-combinations',
  chapter: 'la1',
  order: 2,
  title: 'Linear Combinations, Span, and Basis',
  subtitle: 'How to build entire mathematical universes by adding and scaling a few fundamental arrows.',
  tags: ['linear combinations', 'span', 'basis', 'linear independence', 'coordinates'],
  aliases: 'basis vectors scaling adding vectors spanning a space linearly dependent standard basis',

  timeToComplete: 20,
  coreConcept: 'Every vector in a space can be represented as a scaled sum (linear combination) of fundamental basis vectors. The set of all possible combinations forms the span.',
  prerequisites: ['la1-001'],
  nextLesson: 'dot-and-cross-products',

  hook: {
    question: "If you only had two arrows, how could you reach any point on an infinite 2D plane?",
    realWorldContext: "Imagine you are programming a robot that can only move in two directions: exactly North, and exactly East. By moving North for a specific duration (scaling the North vector), stopping, and then moving East for another duration (scaling the East vector, then adding the two together), the robot can reach absolutely any point on the map. This is what a screen does: every pixel color you see is just a mixture of exactly three fundamental vectors: pure Red, pure Green, and pure Blue. By scaling how intensely each of those three colors shines, and adding them together, the screen can display over 16 million unique colors.",
    previewVisualizationId: 'LALesson02_Combinations',
  },

  intuition: {
    prose: [
      '**Where you are in the story:** In the last lesson, we defined what a vector is. But a single vector by itself is lonely. What happens when we take two vectors and allow ourselves to stretch them, squish them, and add them together? We are about to build entire spaces from scratch.',
      'There are exactly two operations in linear algebra: **scalar multiplication** (stretching or shrinking a vector) and **vector addition** (placing the tail of one vector at the tip of another). When you do both at once — scaling a bunch of vectors and adding them — you have created a **Linear Combination**.',
      'If you have two vectors $\\mathbf{v}$ and $\\mathbf{w}$, ask: "If I scale and add these two vectors in every possible way, what set of points can I reach?" The answer is called the **Span**.',
      'If $\\mathbf{v}$ and $\\mathbf{w}$ point in totally different directions, you can reach every single point on the 2D plane — their span is the entire 2D universe. But if they point in the exact same direction, you are trapped on a single 1D line. The second vector is redundant. That is **Linearly Dependent**.',
      'If the vectors point in different directions, they are **Linearly Independent**. When a set of vectors spans the entire space AND has zero redundancies, we call it a **Basis** — the absolute minimum number of building blocks needed to construct a universe.',
      '**Where this is heading:** The coordinates $[3, -2]$ are a secret linear combination of the standard basis (3 steps right, 2 steps down). Later, when we get to matrices, a matrix is a machine that moves the basis vectors to new locations, dragging all of space with them.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 3 — Vectors & Spaces',
        body: '**Previous:** What vectors are and how we represent them.\n**This lesson:** Combining vectors to construct space (Span, Basis, Independence).\n**Next:** Vector multiplication geometries (Dot and Cross Products).',
      },
      {
        type: 'insight',
        title: 'The Coordinate Illusion',
        body: 'When you write $\\begin{bmatrix} 3 \\\\ -2 \\end{bmatrix}$, you are implicitly saying: "Take 3 copies of $\\hat{\\mathbf{i}}$ (the horizontal unit vector) and $-2$ copies of $\\hat{\\mathbf{j}}$ (the vertical unit vector)." Coordinates ARE the scalar multipliers in a linear combination.',
      },
      {
        type: 'warning',
        title: 'Common Mistake: Confusing Span with the Vectors Themselves',
        body: 'The **span** of $\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ is NOT just those two vectors — it is the INFINITE collection of ALL linear combinations $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2$ for every possible $c_1, c_2 \\in \\mathbb{R}$. If the two vectors are independent in $\\mathbb{R}^2$, their span is the entire plane — infinitely many points.',
      },
      {
        type: 'insight',
        title: 'When to Use This',
        body: 'Use the **span** test to answer: "Can I reach target $\\mathbf{b}$ using these building blocks?" Use **independence** to check: "Are any of my vectors redundant?" Use a **basis** whenever you need a minimal, non-redundant coordinate system.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson02_Combinations',
        title: 'Linear Combinations Sweeping the Plane',
        mathBridge: 'Adjust the scalar multipliers $c_1$ and $c_2$ using the sliders. Watch the result vector sweep across the plane. When both vectors are independent, you can reach every point on the 2D plane — the span IS the full plane.',
        caption: 'Every point you can reach with any $c_1, c_2$ is in the span of those two vectors.',
      },
      {
        id: 'BasisVectorProof',
        title: 'Standard Basis: Every Vector as a Linear Combination',
        mathBridge: 'The standard basis for $\\mathbb{R}^2$ is $\\hat{\\mathbf{i}} = [1,0]^T$ and $\\hat{\\mathbf{j}} = [0,1]^T$. Any vector $[x,y]^T = x\\hat{\\mathbf{i}} + y\\hat{\\mathbf{j}}$. Your $x$-coordinate is "how many $\\hat{\\mathbf{i}}$ steps," your $y$-coordinate is "how many $\\hat{\\mathbf{j}}$ steps."',
        caption: 'Coordinates ARE coefficients in a linear combination of the standard basis.',
      },
      {
        id: 'CartesianGridLab',
        title: 'The Grid As a Span',
        mathBridge: 'The entire Cartesian grid is just the span of $\\hat{\\mathbf{i}}$ and $\\hat{\\mathbf{j}}$. Every grid point $(m, n)$ is the linear combination $m\\hat{\\mathbf{i}} + n\\hat{\\mathbf{j}}$. Change the basis vectors and the entire grid changes with them.',
        caption: 'The standard grid = span of standard basis vectors.',
      },
    ],
  },

  math: {
    prose: [
      'A linear combination of vectors $\\mathbf{v}_1, \\mathbf{v}_2, \\dots, \\mathbf{v}_n$ with scalar weights $c_1, c_2, \\dots, c_n$ is:\n\n$c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\dots + c_n\\mathbf{v}_n$',
      'The **Span** of a set of vectors is the collection of ALL vectors expressible in this form: $\\text{Span}(\\mathbf{v}_1, \\ldots, \\mathbf{v}_n) = \\{c_1\\mathbf{v}_1 + \\cdots + c_n\\mathbf{v}_n : c_i \\in \\mathbb{R}\\}$.',
      'The **Linear Independence** test: set the combination equal to zero and check whether the only solution is all scalars zero.',
      'A **Basis** for a vector space requires (1) linear independence AND (2) spanning. In $\\mathbb{R}^n$, any basis has exactly $n$ vectors. Standard basis for $\\mathbb{R}^2$: $\\hat{\\mathbf{i}} = [1,0]^T$ and $\\hat{\\mathbf{j}} = [0,1]^T$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linear Independence Formal Definition',
        body: 'Vectors $\\mathbf{v}_1, \\dots, \\mathbf{v}_n$ are linearly independent if and only if:\n\n$c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\dots + c_n\\mathbf{v}_n = \\mathbf{0}$\n\nhas ONLY the trivial solution $c_1 = c_2 = \\cdots = c_n = 0$.',
      },
      {
        type: 'strategy',
        title: 'Checking Dependence',
        body: 'If you can find ANY non-trivial way (scalars not all zero) to make the combination equal $\\mathbf{0}$, there is a redundancy. One vector can be cancelled by a combination of the others.',
      },
      {
        type: 'insight',
        title: 'WHY the Zero-Sum Test is the Right Test',
        body: 'If $\\mathbf{v}_2 = 2\\mathbf{v}_1$, then $2\\mathbf{v}_1 - \\mathbf{v}_2 = \\mathbf{0}$ with non-zero coefficients $(2, -1)$. The zero-sum test catches it. If any vector is a combination of the others, you can rearrange it into a sum-to-zero with non-trivial coefficients.',
      },
      {
        type: 'insight',
        title: 'Real-World Analogy: Paint Mixing',
        body: 'Red, Green, Blue are linearly independent — no combination of two produces the third in the additive light model. They span the color space. Now add Yellow = Red + Green: it is dependent on Red and Green — redundant. Dependent vectors are like redundant paint colors: they take up space without expanding your range.',
      },
    ],
    visualizations: [
      {
        id: 'LinearDependenceViz',
        title: 'Trapped on a Line',
        mathBridge: 'Observe two vectors pointing along the exact same line. Try to reach the red point hovering in 2D space. You cannot. Dependent vectors collapse the span into a lower dimension regardless of how many you add.',
        caption: 'Linearly dependent vectors collapse the span into a lower dimension.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Span, Basis, and Independence',
        mathBridge: 'Linear independence test: stack vectors as rows, compute np.linalg.matrix_rank(). If rank == number of vectors, they are independent.',
        caption: 'See how the algebra of linear combinations connects to the rank test in NumPy.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Building linear combinations',
              prose: [
                'A **linear combination** of vectors v₁, v₂ with scalars c₁, c₂ is: c₁·v₁ + c₂·v₂.',
                'The set of ALL such combinations (for every possible c₁, c₂) is the **span**.',
              ],
              code: `import numpy as np

v1 = np.array([2.0, 0.0])
v2 = np.array([0.0, 1.0])

combos = [(1, 0), (0, 1), (2, 3), (-1, 2)]
for c1, c2 in combos:
    result = c1 * v1 + c2 * v2
    print(f"{c1}·{v1} + {c2}·{v2} = {result}")`,
            },
            {
              id: 2,
              cellTitle: 'Testing linear independence — rank',
              prose: [
                'Stack vectors as rows of a matrix. `np.linalg.matrix_rank()` counts the independent directions.',
                'rank == n means independent; rank < n means at least one is redundant.',
              ],
              code: `import numpy as np

# Independent: different directions
indep = np.array([[1.0, 0.0], [0.0, 1.0]])

# Dependent: second = 2 × first
dep = np.array([[2.0, 1.0], [4.0, 2.0]])

print(f"Independent rank = {np.linalg.matrix_rank(indep)}  (= 2 → independent)")
print(f"Dependent rank = {np.linalg.matrix_rank(dep)}  (= 1 → second is redundant)")`,
            },
            {
              id: 3,
              cellTitle: 'Visualize: span of two vectors',
              prose: [
                'Two independent vectors span the entire plane — you can reach any point by scaling and adding.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER, GREEN

v1 = np.array([2.0, 1.0])
v2 = np.array([0.0, 1.5])
c1, c2 = 1.5, 1.0
combo = c1 * v1 + c2 * v2

fig = Figure(square=True, xmin=-1, xmax=5, ymin=-1, ymax=5,
             title=f"Linear Combination: {c1}·v1 + {c2}·v2")
fig.grid().axes()
fig.vector(v1.tolist(), color=BLUE, label="v1")
fig.vector(v2.tolist(), color=AMBER, label="v2")
fig.vector(combo.tolist(), color=GREEN, label=f"{c1}v1+{c2}v2")
fig.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Find the coefficients',
              difficulty: 'medium',
              prompt: 'Given v1 = [1, 2] and v2 = [3, 1], find scalars c1 and c2 such that c1*v1 + c2*v2 = [5, 5]. Use np.linalg.solve() and verify.',
              code: `import numpy as np

v1 = np.array([1.0, 2.0])
v2 = np.array([3.0, 1.0])
target = np.array([5.0, 5.0])

# A = matrix with v1 and v2 as columns
# Solve A @ [c1, c2] = target
`,
              hint: 'A = np.column_stack([v1, v2]). Then np.linalg.solve(A, target) gives [c1, c2]. Verify: c1*v1 + c2*v2 == target.',
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Linear Combinations in OpenMAT / MATLAB',
        mathBridge: 'Stacking your vectors as columns of a matrix A, then computing A*c, gives the same result as c₁*v₁ + c₂*v₂. This equivalence — "matrix-vector product IS a linear combination of columns" — is the single most important idea connecting this lesson to matrix algebra.',
        caption: 'The column picture of matrix multiplication starts here.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Computing linear combinations directly',
              prose: [
                'A linear combination is just scalar multiplication and addition.',
              ],
              code: `v1 = [2; 1];
v2 = [0; 1];
c1 = 1.5;  c2 = 1.0;
combo = c1*v1 + c2*v2
c1 = -1;  c2 = 3;
c1*v1 + c2*v2`,
            },
            {
              id: 2,
              cellTitle: 'The column picture: A*c = linear combination of columns',
              prose: [
                'Stack v1 and v2 as **columns** of a matrix A. Then A*[c1;c2] computes c1*v1 + c2*v2 automatically.',
                '**Matrix-vector multiplication is a linear combination of columns, weighted by the vector entries.**',
              ],
              code: `v1 = [2; 1];
v2 = [0; 1];
A = [v1, v2]
c = [1.5; 1.0];
A * c
1.5*v1 + 1.0*v2   % same result

target = [5; 3];
c_solution = A \\ target
A * c_solution`,
            },
            {
              id: 3,
              cellTitle: 'Checking linear independence with rank()',
              prose: [
                '`rank(A)` tells you how many independent columns A has.',
              ],
              code: `A_ind = [[2; 1], [0; 1]]
rank(A_ind)

A_dep = [[2; 1], [4; 2]]
rank(A_dep)

A_three = [[1;0], [0;1], [1;1]]
rank(A_three)   % = 2, third is redundant`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC tool offsets as linear combinations',
              prose: [
                'In CNC machining, a Work Coordinate System (WCS) offset shifts the origin. All positions are relative to the new origin — vector addition with coefficient 1.',
              ],
              code: `G54_offset = [150; 80; 0];
P1_part = [10; 5; -3];
P2_part = [50; 5; -3];
P1_machine = G54_offset + P1_part
P2_machine = G54_offset + P2_part
G55_offset = [300; 80; 0];
P1_new = G55_offset + P1_part
norm(P1_part - P2_part)   % distance unchanged by offset`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Span is always a subspace.** The span of any collection $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ is automatically a subspace: any linear combination of linear combinations is still a linear combination.',
      '**Basis for abstract spaces.** The standard basis for $P_2$ (polynomials of degree $\\leq 2$) is $\\{1, t, t^2\\}$. Every polynomial $a + bt + ct^2 = a \\cdot 1 + b \\cdot t + c \\cdot t^2$ — the weights $(a, b, c)$ are the coordinates. Converting polynomial problems to matrix problems using this coordinate assignment is the entire mechanism of linear algebra applied to functions.',
      '**Dimension: a theorem, not a definition.** The dimension of a vector space is the number of vectors in any basis. This requires a theorem: all bases have the same size. The proof uses the Steinitz Exchange Lemma. Therefore "dimension" is well-defined.',
      '**Dimension Inequality:** (1) Any set of more than $n$ vectors in $\\mathbb{R}^n$ is automatically dependent. (2) Any $n$ independent vectors in $\\mathbb{R}^n$ span it. (3) No spanning set can have fewer than $n$ vectors.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Basis Theorem (for $\\mathbb{R}^n$)',
        body: 'In $\\mathbb{R}^n$: any $n$ linearly independent vectors form a basis. Any $n$ spanning vectors form a basis. You only need to verify ONE property if you already know the count is exactly $n$.',
      },
      {
        type: 'insight',
        title: 'Coordinates Are Unique',
        body: 'Once you fix a basis $\\{\\mathbf{b}_1, \\ldots, \\mathbf{b}_n\\}$, every vector has a **unique** representation $\\mathbf{v} = c_1\\mathbf{b}_1 + \\cdots + c_n\\mathbf{b}_n$. Uniqueness follows from independence.',
      },
      {
        type: 'warning',
        title: 'Any $n+1$ Vectors in $\\mathbb{R}^n$ Are Dependent',
        body: 'You cannot have 3 independent vectors in $\\mathbb{R}^2$. If someone hands you three 2D vectors and claims independence, one is a linear combination of the others — no exceptions. Dimension is a hard ceiling.',
      },
    ],
    visualizations: [
      {
        id: 'LinearDependenceViz',
        title: 'Why Three Vectors in $\\mathbb{R}^2$ Must Be Dependent',
        mathBridge: 'Add a third vector. No matter what direction you choose, it lands inside the span of the first two (the entire plane). The third vector is automatically a linear combination of the first two.',
        caption: 'Three 2D vectors are always dependent. The third is always redundant.',
      },
    ],
  },

  examples: [
    {
      id: 'ex-la1-002-1',
      title: 'Computing a Linear Combination',
      problem: 'Given $\\mathbf{u} = \\begin{bmatrix} 1 \\\\ -2 \\end{bmatrix}$ and $\\mathbf{v} = \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}$, compute the linear combination $2\\mathbf{u} - \\mathbf{v}$.',
      steps: [
        {
          expression: '2\\mathbf{u} - \\mathbf{v} = 2 \\begin{bmatrix} 1 \\\\ -2 \\end{bmatrix} + (-1) \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}',
          annotation: 'Rewrite the expression with explicit scalars where $\\mathbf{u} = [1,-2]^T$ = first vector with weight $c_1 = 2$, and $\\mathbf{v} = [3,1]^T$ = second vector with weight $c_2 = -1$ (subtracting means multiplying by $-1$).',
          strategyTitle: 'Step 1: Identify scalars and vectors',
          hints: ['Write subtraction as adding a negative: $2\\mathbf{u} - \\mathbf{v} = 2\\mathbf{u} + (-1)\\mathbf{v}$.'],
        },
        {
          expression: '= \\begin{bmatrix} 2 \\\\ -4 \\end{bmatrix} + \\begin{bmatrix} -3 \\\\ -1 \\end{bmatrix}',
          annotation: 'Perform scalar multiplication first: $2 \\times [1,-2]^T = [2,-4]^T$ and $(-1) \\times [3,1]^T = [-3,-1]^T$.',
          strategyTitle: 'Step 2: Scale each vector',
          hints: ['Multiply every component by the scalar: $2(1) = 2$, $2(-2) = -4$, $(-1)(3) = -3$, $(-1)(1) = -1$.'],
        },
        {
          expression: '= \\begin{bmatrix} 2 + (-3) \\\\ -4 + (-1) \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ -5 \\end{bmatrix}',
          annotation: 'Add component-by-component: top $2 + (-3) = -1$, bottom $-4 + (-1) = -5$.',
          strategyTitle: 'Step 3: Add components',
          hints: ['Verify by substitution: $c_1 = 2$, $c_2 = -1$ in the general combination formula gives the same answer.'],
        },
      ],
      conclusion: 'The resulting vector is $[-1, -5]^T$. Geometrically: walk twice as far along $\\mathbf{u}$, then walk backward along $\\mathbf{v}$.',
    },
    {
      id: 'ex-la1-002-2',
      title: 'Checking for Linear Dependence',
      problem: 'Are $\\mathbf{v}_1 = \\begin{bmatrix} 4 \\\\ 6 \\end{bmatrix}$ and $\\mathbf{v}_2 = \\begin{bmatrix} -2 \\\\ -3 \\end{bmatrix}$ linearly independent?',
      steps: [
        {
          expression: 'c_1 \\begin{bmatrix} 4 \\\\ 6 \\end{bmatrix} + c_2 \\begin{bmatrix} -2 \\\\ -3 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\end{bmatrix}',
          annotation: 'Set up the zero-sum test where $c_1, c_2 \\in \\mathbb{R}$ are unknown scalars and $\\mathbf{0} = [0,0]^T$ is the zero vector. Ask: can we find non-zero scalars satisfying this?',
          strategyTitle: 'Step 1: Set up the independence test',
          hints: ['Before computing, check: is $\\mathbf{v}_2 = k\\mathbf{v}_1$? Try $k = -1/2$: $(-1/2)[4,6]^T = [-2,-3]^T = \\mathbf{v}_2$. They are proportional — strong sign of dependence.'],
        },
        {
          expression: '1 \\cdot [4,6]^T + 2 \\cdot [-2,-3]^T = [4-4, 6-6]^T = [0,0]^T',
          annotation: 'We found $c_1 = 1$ and $c_2 = 2$ — both non-zero — that make the combination zero. This is a non-trivial solution, which is exactly what we need to prove dependence.',
          strategyTitle: 'Step 2: Exhibit the non-trivial combination',
          hints: ['$c_1 = 1$ and $c_2 = 2$ are not both zero. By definition of linear independence, the vectors are DEPENDENT.'],
        },
        {
          expression: '\\mathbf{v}_1 \\text{ and } \\mathbf{v}_2 \\text{ are Linearly Dependent since } \\mathbf{v}_2 = -\\tfrac{1}{2}\\mathbf{v}_1',
          annotation: 'The vectors lie on the same line through the origin. Their span is 1D — a single line — not the full 2D plane.',
          strategyTitle: 'Step 3: Conclude and give the explicit relationship',
          hints: ['Geometric meaning: $\\mathbf{v}_2 = (-1/2)\\mathbf{v}_1$ — they point in exactly opposite directions along the same line.'],
        },
      ],
      conclusion: 'The vectors are linearly dependent because $\\mathbf{v}_2 = (-1/2)\\mathbf{v}_1$. Their span is a 1D line, not the full 2D plane.',
    },
    {
      id: 'ex-la1-002-3',
      title: 'Expressing a Vector as a Linear Combination',
      problem: 'Express $\\mathbf{b} = \\begin{bmatrix} 7 \\\\ -3 \\end{bmatrix}$ as $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2$ where $\\mathbf{v}_1 = \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix}$ and $\\mathbf{v}_2 = \\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix}$.',
      steps: [
        {
          expression: 'c_1 \\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + c_2 \\begin{bmatrix} 1 \\\\ -1 \\end{bmatrix} = \\begin{bmatrix} 7 \\\\ -3 \\end{bmatrix} \\quad \\Rightarrow \\quad \\begin{cases} 2c_1 + c_2 = 7 \\\\ c_1 - c_2 = -3 \\end{cases}',
          annotation: 'Match each component to get a 2-equation system where $c_1, c_2$ are the unknown scalar weights. Top entry: $2c_1 + c_2 = 7$. Bottom entry: $c_1 - c_2 = -3$. The span question "is $\\mathbf{b}$ reachable?" equals the system question "does this have a solution?"',
          strategyTitle: 'Step 1: Translate to a linear system',
          hints: ['Top components: $2c_1 + c_2 = 7$. Bottom: $c_1 - c_2 = -3$. This is the bridge between span and systems of equations.'],
        },
        {
          expression: '(2c_1 + c_2) + (c_1 - c_2) = 7 + (-3) \\Rightarrow 3c_1 = 4 \\Rightarrow c_1 = \\tfrac{4}{3}',
          annotation: 'Add both equations to eliminate $c_2$ (the $+c_2$ and $-c_2$ terms cancel). This reveals $c_1 = 4/3$ directly.',
          strategyTitle: 'Step 2: Eliminate $c_2$ by adding',
          hints: ['Adding works because the $c_2$ coefficients are $+1$ and $-1$ — they cancel. Choosing the right operation to eliminate a variable is the core skill of solving linear systems.'],
        },
        {
          expression: 'c_2 = 7 - 2c_1 = 7 - \\tfrac{8}{3} = \\tfrac{13}{3}',
          annotation: 'Substitute $c_1 = 4/3$ into the first equation: $c_2 = 7 - 2(4/3) = 21/3 - 8/3 = 13/3$.',
          strategyTitle: 'Step 3: Back-substitute to find $c_2$',
          hints: ['Verify: $\\frac{4}{3}[2,1]^T + \\frac{13}{3}[1,-1]^T = [8/3+13/3,\\; 4/3-13/3]^T = [21/3,\\; -9/3]^T = [7,-3]^T$ ✓'],
        },
      ],
      conclusion: '$\\mathbf{b} = \\frac{4}{3}\\mathbf{v}_1 + \\frac{13}{3}\\mathbf{v}_2$. The key insight: "is $\\mathbf{b}$ in the span?" and "does this linear system have a solution?" are exactly the same question.',
    },
    {
      id: 'ex-la1-002-4',
      title: 'Independence in 3D — Three Vectors',
      problem: 'Are $\\mathbf{a} = [1,0,0]^T$, $\\mathbf{b} = [1,1,0]^T$, $\\mathbf{c} = [1,1,1]^T$ linearly independent?',
      steps: [
        {
          expression: 'c_1\\begin{bmatrix}1\\\\0\\\\0\\end{bmatrix} + c_2\\begin{bmatrix}1\\\\1\\\\0\\end{bmatrix} + c_3\\begin{bmatrix}1\\\\1\\\\1\\end{bmatrix} = \\begin{bmatrix}0\\\\0\\\\0\\end{bmatrix}',
          annotation: 'Set up the zero-sum test where $c_1, c_2, c_3$ are scalar weights to determine. Matching each row gives three equations: Row 1: $c_1 + c_2 + c_3 = 0$. Row 2: $c_2 + c_3 = 0$. Row 3: $c_3 = 0$.',
          strategyTitle: 'Step 1: Set up and extract equations',
          hints: ['Row 1 from the first components: $c_1 + c_2 + c_3 = 0$. Row 2: $0 + c_2 + c_3 = 0$. Row 3: $0 + 0 + c_3 = 0$.'],
        },
        {
          expression: 'c_3 = 0 \\Rightarrow c_2 = 0 \\Rightarrow c_1 = 0',
          annotation: 'Back-substitute from the bottom equation upward. Row 3 immediately gives $c_3 = 0$. Substituting into Row 2 gives $c_2 = 0$. Substituting into Row 1 gives $c_1 = 0$. Only the trivial solution exists.',
          strategyTitle: 'Step 2: Solve by back-substitution',
          hints: ['The triangular structure means we solve from bottom to top — this is how upper triangular systems always work.'],
        },
        {
          expression: 'c_1 = c_2 = c_3 = 0 \\Rightarrow \\text{Linearly INDEPENDENT}',
          annotation: 'Only the trivial solution exists, so the vectors are linearly independent. They also span $\\mathbb{R}^3$ — forming a valid basis.',
          strategyTitle: 'Step 3: Conclude independence',
          hints: ['These three vectors form a triangular basis for $\\mathbb{R}^3$. Each adds one new non-zero component the others lack.'],
        },
      ],
      conclusion: 'The three vectors are linearly independent. The triangular structure enabled immediate back-substitution without any row operations.',
    },
  ],

  challenges: [
    {
      id: 'ch-la1-002-1',
      difficulty: 'easy',
      problem: 'Compute $3\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + 2\\begin{bmatrix} -1 \\\\ 4 \\end{bmatrix}$.',
      hint: 'Scale both vectors first (multiply each component by the scalar), then add component-by-component.',
      walkthrough: [
        '**Scale both vectors:** $3[2,1]^T = [6,3]^T$ and $2[-1,4]^T = [-2,8]^T$.',
        '**Add component-by-component:** top: $6 + (-2) = 4$; bottom: $3 + 8 = 11$.',
        '**Result:** $[4, 11]^T$.',
        '**Verify:** $3(2)+2(-1) = 6-2 = 4$ ✓ and $3(1)+2(4) = 3+8 = 11$ ✓.',
        '**Interpretation:** You walked 3 steps in the $[2,1]$ direction, then 2 steps in the $[-1,4]$ direction. Combined displacement: $[4,11]$.',
      ],
      answer: '\\begin{bmatrix} 4 \\\\ 11 \\end{bmatrix}',
    },
    {
      id: 'ch-la1-002-2',
      difficulty: 'medium',
      problem: 'Are the vectors $\\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$ and $\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$ linearly independent?',
      hint: 'Set up $c_1[1,0]^T + c_2[0,1]^T = [0,0]^T$ and read off the equations.',
      walkthrough: [
        '**Set up:** $c_1[1,0]^T + c_2[0,1]^T = [0,0]^T$.',
        '**Top component:** $c_1(1) + c_2(0) = 0 \\Rightarrow c_1 = 0$.',
        '**Bottom component:** $c_1(0) + c_2(1) = 0 \\Rightarrow c_2 = 0$.',
        '**Conclusion:** Only the trivial solution $c_1 = c_2 = 0$ exists — the vectors are **linearly independent**.',
        '**These are $\\hat{\\mathbf{i}}$ and $\\hat{\\mathbf{j}}$** — the standard basis vectors. They are perpendicular and span all of $\\mathbb{R}^2$. This is the prototypical independent pair.',
      ],
      answer: 'Yes, linearly independent.',
    },
    {
      id: 'ch-la1-002-3',
      difficulty: 'hard',
      problem: 'Are $[1,2,3]^T$, $[4,5,6]^T$, $[7,8,9]^T$ linearly independent? Use the rank test.',
      hint: 'Stack as rows, row-reduce. Notice the arithmetic pattern: differences between consecutive rows are all equal.',
      walkthrough: [
        '**Spot the pattern:** Row 2 $-$ Row 1 $= [3,3,3]^T$ and Row 3 $-$ Row 2 $= [3,3,3]^T$. The differences are equal — strong sign of dependence.',
        '**Row reduce:** $\\xrightarrow{R_2-4R_1,\\;R_3-7R_1} \\begin{bmatrix}1&2&3\\\\0&-3&-6\\\\0&-6&-12\\end{bmatrix} \\xrightarrow{R_3-2R_2} \\begin{bmatrix}1&2&3\\\\0&-3&-6\\\\0&0&0\\end{bmatrix}$',
        '**Row 3 becomes all zeros** — rank$(M) = 2 < 3$.',
        '**Conclusion:** Linearly **dependent**. Explicit relationship: $\\mathbf{v}_3 = 2\\mathbf{v}_2 - \\mathbf{v}_1$.',
        '**Geometric meaning:** All three vectors lie on the same 2D plane through the origin in $\\mathbb{R}^3$ — they cannot span all of 3D space.',
      ],
      answer: 'Linearly dependent (rank = 2).',
    },
  ],

  semantics: {
    core: [
      { symbol: 'c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2', meaning: 'Linear combination: $c_1$ = scalar weight for $\\mathbf{v}_1$, $c_2$ = scalar weight for $\\mathbf{v}_2$' },
      { symbol: '\\text{Span}(\\mathbf{v}_1, \\mathbf{v}_2)', meaning: 'All vectors reachable via every possible linear combination of $\\mathbf{v}_1$ and $\\mathbf{v}_2$' },
    ],
    rulesOfThumb: [
      'To combine vectors, scale first, then add component by component.',
      'If vectors lie on the same line through the origin, they are dependent.',
      'A basis gives you a coordinate system. A space can have infinitely many different bases.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la1-001', label: 'What is a vector?', note: 'Be comfortable visualizing a column matrix as an arrow before combining multiples of them.' },
    ],
    futureLinks: [
      { lessonId: 'la2-001', label: 'Matrices as Transformations', note: 'A matrix is a compact way to write a linear combination of its column vectors.' },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'assess-la1-002-1',
        type: 'input',
        text: 'Compute $2[1, 5]^T - [3, 2]^T$. Give the answer as [top, bottom].',
        answer: '[-1, 8]',
        hint: 'Scale: $[2,10]^T$. Subtract: $[2-3, 10-2]^T = [-1, 8]^T$.',
      },
    ],
  },

  mentalModel: [
    'Scaling stretches arrows. Adding connects them tip-to-tail.',
    'Span = "Everything I can possibly reach with these building blocks."',
    'Independent = "Every arrow adds a totally new direction."',
    'Dependent = "At least one arrow is redundant."',
    'Basis = "Independent AND spans everything — the perfect minimal toolkit."',
  ],

  checkpoints: [
    { id: 'cp-la1-002-1', question: 'What is a linear combination of vectors $\\mathbf{v}_1$ and $\\mathbf{v}_2$?', answer: 'Any expression $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2$ where $c_1, c_2$ are real scalars.' },
    { id: 'cp-la1-002-2', question: 'What does it mean for two vectors to be linearly dependent?', answer: 'One is a scalar multiple of the other — equivalently, $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 = \\mathbf{0}$ has a non-trivial solution.' },
    { id: 'cp-la1-002-3', question: 'What two requirements must a set of vectors satisfy to form a basis?', answer: '(1) Linearly independent — no redundancies. (2) Spans the space — reaches everywhere.' },
  ],

  quiz: [
    {
      id: 'quiz-la1-002-1',
      type: 'choice',
      text: "What defines a 'basis' of a vector space?",
      options: [
        'Any set of vectors that has zeros in it',
        'A set of linearly independent vectors that span the entire space',
        'Any two vectors that are parallel',
        'A set of dependent vectors that do not span the space',
      ],
      answer: 'A set of linearly independent vectors that span the entire space',
      hints: ['A basis is the minimal toolkit: no redundancies (independent) and reaches everywhere (spanning).'],
      reviewSection: 'Math tab — Basis definition',
    },
    {
      id: 'quiz-la1-002-2',
      type: 'choice',
      text: 'Three vectors in $\\mathbb{R}^2$ (like $[1,0]^T$, $[0,1]^T$, $[1,1]^T$) are always:',
      options: [
        'Linearly dependent, because $\\dim(\\mathbb{R}^2) = 2 < 3$',
        'Linearly independent, if they point in different directions',
        'A basis for $\\mathbb{R}^2$',
        'Cannot be determined without computation',
      ],
      answer: 'Linearly dependent, because $\\dim(\\mathbb{R}^2) = 2 < 3$',
      hints: ['Any $n+1$ vectors in $\\mathbb{R}^n$ must be dependent. With 3 vectors in a 2D space, the third is always in the span of the first two.'],
      reviewSection: 'Rigor tab — Dimension inequality',
    },
    {
      id: 'quiz-la1-002-3',
      type: 'choice',
      text: 'What is the span of two linearly independent vectors in $\\mathbb{R}^2$?',
      options: [
        'A single line through the origin',
        'Two separate lines',
        'The entire 2D plane $\\mathbb{R}^2$',
        'Only the two vectors themselves',
      ],
      answer: 'The entire 2D plane $\\mathbb{R}^2$',
      hints: ['Two independent vectors in 2D provide two degrees of freedom. With $c_1$ and $c_2$ ranging over all reals, $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2$ traces every point in the plane.'],
      reviewSection: 'Intuition tab — Span',
    },
    {
      id: 'quiz-la1-002-4',
      type: 'choice',
      text: 'How many vectors must be in a basis for $\\mathbb{R}^3$?',
      options: ['1', '2', '3', '4 or more'],
      answer: '3',
      hints: ['A basis for $\\mathbb{R}^n$ has exactly $n$ vectors. Three dimensions need exactly 3 independent directions.'],
      reviewSection: 'Math tab — Basis',
    },
    {
      id: 'quiz-la1-002-5',
      type: 'choice',
      text: 'The vectors $[1, 0]^T$ and $[-3, 0]^T$ are linearly ________ because ________.',
      options: [
        'Independent, because they have different $x$-components',
        'Dependent, because one is a scalar multiple of the other and both lie on the $x$-axis',
        'Independent, because neither is the zero vector',
        'Dependent, because they have the same number of components',
      ],
      answer: 'Dependent, because one is a scalar multiple of the other and both lie on the $x$-axis',
      hints: ['$[-3,0]^T = -3 \\cdot [1,0]^T$. They both lie along the $x$-axis — their span is only a 1D line.'],
      reviewSection: 'Intuition tab — Linear Dependence',
    },
    {
      id: 'quiz-la1-002-6',
      type: 'choice',
      text: 'The coordinates $[5, 7]^T$ relative to the standard basis mean:',
      options: [
        '$5 \\cdot \\hat{\\mathbf{i}} + 7 \\cdot \\hat{\\mathbf{j}}$ — coordinates ARE the scalar weights',
        '5 and 7 are the magnitudes of two separate vectors',
        'The vector has magnitude $5 + 7 = 12$',
        'The vector makes an angle of $5/7$ radians with the $x$-axis',
      ],
      answer: '$5 \\cdot \\hat{\\mathbf{i}} + 7 \\cdot \\hat{\\mathbf{j}}$ — coordinates ARE the scalar weights',
      hints: ['$[5,7]^T = 5[1,0]^T + 7[0,1]^T = 5\\hat{\\mathbf{i}} + 7\\hat{\\mathbf{j}}$. The $x$-coordinate IS the $\\hat{\\mathbf{i}}$ weight; the $y$-coordinate IS the $\\hat{\\mathbf{j}}$ weight.'],
      reviewSection: 'Intuition tab — Coordinate Illusion',
    },
  ],
};
