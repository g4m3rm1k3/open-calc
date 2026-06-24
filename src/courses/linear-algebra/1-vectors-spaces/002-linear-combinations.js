import linearCombinationUrl from '../diagrams/la-linear-combination.svg?url'
import spanCollapseUrl from '../diagrams/la-span-collapse.svg?url'
import basisCoordinatesUrl from '../diagrams/la-basis-coordinates.svg?url'

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
  nextLesson: 'la1-003',

  hook: {
    question: "If you only had two arrows, how could you reach any point on an infinite 2D plane?",
    realWorldContext: "Imagine you are programming a robot that can only move in two directions: exactly North, and exactly East. By moving North for a specific duration (scaling the North vector), stopping, and then moving East for another duration (scaling the East vector, then adding the two together), the robot can reach absolutely any point on the map. This is what a screen does: every pixel color you see is just a mixture of exactly three fundamental vectors: pure Red, pure Green, and pure Blue. By scaling how intensely each of those three colors shines, and adding them together, the screen can display over 16 million unique colors.",
    previewVisualizationId: 'LALesson02_Combinations',
  },

  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          'Take $\\mathbf{v}_1 = [2, 0]^T$ and $\\mathbf{v}_2 = [0, 1]^T$. Scale $\\mathbf{v}_1$ by $3$ to get $[6, 0]^T$. Scale $\\mathbf{v}_2$ by $-2$ to get $[0, -2]^T$. Add them: $[6, -2]^T$. Change the scalars to $c_1 = 5$, $c_2 = 4$: you get $[10, 4]^T$. Every choice of scalars $(c_1, c_2)$ lands you at a different output vector. This operation — scaling vectors and adding the results — is called a **linear combination**, and it is the engine that drives all of linear algebra.',
          'There are exactly two operations in linear algebra: **scalar multiplication** (stretching or shrinking a vector) and **vector addition** (placing the tail of one vector at the tip of another). When you do both at once — scaling a bunch of vectors and adding them — you have created a **Linear Combination**.',
        ],
      },
      {
        type: 'image',
        src: linearCombinationUrl,
        alt: 'Vector 3v1 = [6,0] drawn from the origin, then -2v2 = [0,-2] placed tip-to-tail at its end, with the sum vector [6,-2] drawn directly from the origin',
        caption: 'Scale each vector independently, then place the results tip-to-tail — the sum is the linear combination.',
      },
      {
        type: 'viz',
        id: 'LALesson02_Combinations',
        title: 'Linear Combinations Sweeping the Plane',
        mathBridge: 'Adjust the scalar multipliers $c_1$ and $c_2$ using the sliders. Watch the result vector sweep across the plane. When both vectors are independent, you can reach every point on the 2D plane — the span IS the full plane.',
        caption: 'Every point you can reach with any $c_1, c_2$ is in the span of those two vectors.',
      },
      {
        type: 'prose',
        paragraphs: [
          'If you have two vectors $\\mathbf{v}$ and $\\mathbf{w}$, ask: "If I scale and add these two vectors in every possible way, what set of points can I reach?" The answer is called the **Span**.',
          '**Predict before reading on:** Take $\\mathbf{v} = [1, 0]^T$ and $\\mathbf{w} = [2, 0]^T$. Can you reach the point $[0, 1]^T$ using some linear combination $c_1\\mathbf{v} + c_2\\mathbf{w}$? Try to find $c_1, c_2$ that work — hold your answer until the next paragraph.',
          'If $\\mathbf{v}$ and $\\mathbf{w}$ point in totally different directions, you can reach every single point on the 2D plane — their span is the entire 2D universe. But if they point in the exact same direction, you are trapped on a single 1D line. The second vector is redundant. That is **Linearly Dependent**.',
          'If the vectors point in different directions, they are **Linearly Independent**. When a set of vectors spans the entire space AND has zero redundancies, we call it a **Basis** — the absolute minimum number of building blocks needed to construct a universe.',
        ],
      },
      {
        type: 'image',
        src: spanCollapseUrl,
        alt: 'Left panel: two vectors pointing apart, with scattered points filling the whole panel, labeled span equals R-squared. Right panel: two vectors pointing along the same dashed line, labeled trapped on one line, span not equal to R-squared',
        caption: 'Direction is everything: vectors pointing apart span the whole plane; vectors pointing the same way collapse to a line.',
      },
      {
        type: 'viz',
        id: 'BasisVectorProof',
        title: 'Coordinates as Linear Combination Weights',
        mathBridge: 'This visualizer decomposes any vector into its standard-basis components. When you point to $(3, -2)$, it shows $3 \\cdot \\hat{\\mathbf{i}} + (-2) \\cdot \\hat{\\mathbf{j}}$ — not just the numbers, but the full linear combination with labeled arrows. The $x$-coordinate IS the $\\hat{\\mathbf{i}}$ scalar weight; the $y$-coordinate IS the $\\hat{\\mathbf{j}}$ scalar weight. Drag any point and watch the two component arrows resize — this makes the abstract definition of a linear combination concrete.',
        caption: 'Every coordinate pair = a linear combination of the standard basis vectors.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Where this is heading:** The coordinates $[3, -2]$ are a secret linear combination of the standard basis (3 steps right, 2 steps down). Later, when we get to matrices, a matrix is a machine that moves the basis vectors to new locations, dragging all of space with them.',
        ],
      },
      {
        type: 'image',
        src: basisCoordinatesUrl,
        alt: 'Standard basis vectors i-hat and j-hat shown faintly, with 3 times i-hat drawn from the origin and -2 times j-hat placed tip-to-tail, summing to the vector [3,-2]',
        caption: 'Writing a coordinate pair already IS performing a linear combination of the standard basis.',
      },
      {
        type: 'viz',
        id: 'CartesianGridLab',
        title: 'Build Any Vector by Scaling and Adding Basis Vectors',
        mathBridge: 'Use the sliders to pick $c_1$ and $c_2$. The lab draws $c_1 \\hat{\\mathbf{i}}$ (horizontal arrow) and $c_2 \\hat{\\mathbf{j}}$ (vertical arrow) separately, then places them tip-to-tail to show the resultant $c_1 \\hat{\\mathbf{i}} + c_2 \\hat{\\mathbf{j}}$. Try $c_1 = 4$, $c_2 = -3$: the result arrow lands exactly at $(4, -3)$ — confirming that the two scalar weights ARE the coordinates. Change $c_1$ and $c_2$ to any real numbers and observe that you can reach every point in the plane with just these two basis vectors.',
        caption: 'Scaling and adding the two basis vectors can reach every point in the plane.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 2 of 6 — Vectors & Spaces',
        body: '**Previous:** What is a Vector — direction, magnitude, unit vectors.\n**This lesson:** Linear combinations, span, linear independence, and basis.\n**Next:** Dot and Cross Products — measuring angles and area between vectors.',
      },
      {
        type: 'insight',
        title: 'The Coordinate Illusion',
        body: 'When you write $\\begin{bmatrix} 3 \\\\ -2 \\end{bmatrix}$, you are implicitly saying: "Take 3 copies of $\\hat{\\mathbf{i}}$ (the horizontal unit vector) and $-2$ copies of $\\hat{\\mathbf{j}}$ (the vertical unit vector)." Coordinates ARE the scalar multipliers in a linear combination.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Testing Linear Independence',
        body: 'Step 1. Write $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$.\nStep 2. Match each component row to get one scalar equation per row.\nStep 3. Solve the resulting system for $c_1, c_2, \\ldots, c_k$.\nStep 4. If the only solution is all $c_i = 0$ → **linearly independent**.\nStep 5. If any non-zero solution exists → **linearly dependent**; write the explicit relationship.',
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
        title: 'Dependence: Trapped on a Line',
        mathBridge: 'When two vectors are scalar multiples of each other — say $\\mathbf{v}_2 = -\\frac{1}{2}\\mathbf{v}_1$ — every linear combination $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2$ lies on the same line through the origin: you are "trapped." Drag the vectors in this visualizer so they become parallel: watch the reachable region collapse from the full plane to a single line. The independence test asks "can we make $\\mathbf{0}$ with scalars not all zero?" — setting $c_1 = 1$ and $c_2 = 2$ for the vectors $[4,6]^\\top$ and $[-2,-3]^\\top$ gives the zero vector with non-zero coefficients, proving they are dependent.',
        caption: 'Dependent vectors: their span collapses from the full plane to a single line.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Span, Basis, and Independence',
        mathBridge: 'Linear independence test: stack vectors as rows, compute np.linalg.matrix_rank(). If rank == number of vectors, they are independent.',
        caption: 'See how the algebra of linear combinations connects to the rank test in NumPy.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Building linear combinations',
              prose: [
                '`c1 * v1 + c2 * v2` is exactly the linear combination formula: multiply each vector by its scalar weight, then add. NumPy applies the scalar multiplication to every component and the addition component-by-component — no loops needed.',
                'The four `(c1, c2)` pairs in `combos` each produce a different result vector. The key observation: every result is a different point in the plane, reachable by tuning just two numbers. The complete set of ALL reachable points (for every possible real-number choice of c₁ and c₂) is the **span** — an infinite set, not just these four.',
                'Run this cell and look at the four arrows. They all start at the origin and reach different destinations. Change any `(c1, c2)` pair to see new destinations. Two independent vectors can reach ANY point in the plane by choosing the right pair.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

v1 = np.array([2.0, 0.0])
v2 = np.array([0.0, 1.0])

combos = [(1, 0), (0, 1), (2, 3), (-1, 2)]
for c1, c2 in combos:
    result = c1 * v1 + c2 * v2
    print(f"{c1}*v1 + {c2}*v2 = {result}")

fig, ax = plt.subplots(figsize=(7, 5))
ax.set_title("Linear Combinations of v1 and v2", fontsize=13)
origin = np.zeros(2)

colors = ['steelblue', 'darkorange', 'green', 'crimson']
for (c1, c2), color in zip(combos, colors):
    result = c1 * v1 + c2 * v2
    ax.annotate('', xy=result, xytext=origin,
                arrowprops=dict(arrowstyle='->', color=color, lw=2))
    ax.text(result[0]+0.05, result[1]+0.05,
            f'({c1},{c2})', fontsize=9, color=color, fontweight='bold')

# Draw basis vectors
ax.annotate('', xy=v1, xytext=origin,
            arrowprops=dict(arrowstyle='->', color='gray', lw=1.5, linestyle='dashed'))
ax.annotate('', xy=v2, xytext=origin,
            arrowprops=dict(arrowstyle='->', color='gray', lw=1.5, linestyle='dashed'))
ax.text(v1[0]+0.05, v1[1]+0.05, 'v1', fontsize=9, color='gray')
ax.text(v2[0]+0.05, v2[1]+0.05, 'v2', fontsize=9, color='gray')

ax.set_xlim(-3, 5); ax.set_ylim(-1, 4)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Testing linear independence — rank',
              prose: [
                '`np.linalg.matrix_rank(M)` counts the number of **independent directions** in the rows of matrix $M$. Under the hood, NumPy row-reduces $M$ and counts the non-zero pivot rows — the same procedure you do by hand when testing independence.',
                'Stacking vectors as rows gives you a matrix whose rank reports the verdict: `rank == n` (where $n$ is the number of vectors) means each row adds a genuinely new direction — independent, span is $n$-dimensional. `rank < n` means at least one row is a linear combination of the others — dependent, and the span has strictly lower dimension.',
                'The right subplot draws the dashed line that IS the span of the dependent pair `[[2,1],[4,2]]`. Both arrows lie on that line. Any combination $c_1[2,1]^\\top + c_2[4,2]^\\top = (c_1 + 2c_2)[2,1]^\\top$ — the result is always a scalar multiple of $[2,1]^\\top$, confirming rank 1 means 1D span.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Independent: different directions
indep = np.array([[1.0, 0.0], [0.0, 1.0]])

# Dependent: second = 2 x first
dep = np.array([[2.0, 1.0], [4.0, 2.0]])

print(f"Independent rank = {np.linalg.matrix_rank(indep)}  (= 2 -> independent)")
print(f"Dependent rank = {np.linalg.matrix_rank(dep)}  (= 1 -> second is redundant)")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
origin = np.zeros(2)

# Left: independent vectors
ax = axes[0]
ax.set_title(f"Independent (rank={np.linalg.matrix_rank(indep)}): span = full plane", fontsize=11)
for i, (v, color, label) in enumerate(zip(indep, ['steelblue', 'darkorange'], ['v1', 'v2'])):
    ax.annotate('', xy=v, xytext=origin,
                arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    ax.text(v[0]+0.05, v[1]+0.05, label, fontsize=11, color=color, fontweight='bold')
ax.set_xlim(-0.5, 1.5); ax.set_ylim(-0.5, 1.5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)

# Right: dependent vectors
ax2 = axes[1]
ax2.set_title(f"Dependent (rank={np.linalg.matrix_rank(dep)}): span = 1D line", fontsize=11)
# Draw the 1D line they span
t = np.linspace(-1, 2.5, 100)
direction = dep[0] / np.linalg.norm(dep[0])
ax2.plot(t * dep[0][0], t * dep[0][1], 'gray', lw=1, linestyle='--', alpha=0.5, label='span (1D line)')
for v, color, label in zip(dep, ['steelblue', 'darkorange'], ['v1', 'v2']):
    ax2.annotate('', xy=v, xytext=origin,
                 arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    ax2.text(v[0]+0.05, v[1]+0.05, label, fontsize=11, color=color, fontweight='bold')
ax2.set_xlim(-1, 5); ax2.set_ylim(-1, 3)
ax2.set_aspect('equal'); ax2.grid(True, alpha=0.3)
ax2.axhline(0, color='k', lw=0.5); ax2.axvline(0, color='k', lw=0.5)
ax2.legend(fontsize=9)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Visualize: span of two vectors',
              prose: [
                '`c1 * v1 + c2 * v2` performs the linear combination directly: `v1` and `v2` are NumPy arrays, so `*` scales every component and `+` adds component-by-component — no loops needed. The result `combo` is another NumPy array representing the endpoint of the combined arrow.',
                '`Figure` from opencalc draws vector arrows from the origin. The three arrows (blue $\\mathbf{v}_1$, amber $\\mathbf{v}_2$, green combination) make the tip-to-tail geometry explicit: walk $c_1$ steps along $\\mathbf{v}_1$, then $c_2$ steps along $\\mathbf{v}_2$, and the green arrow reaches exactly where you land.',
                'Try changing `c1` and `c2` to any real numbers. Because $\\mathbf{v}_1 = [2,1]^\\top$ and $\\mathbf{v}_2 = [0,1.5]^\\top$ point in genuinely different directions (independent), every different pair $(c_1, c_2)$ lands at a different point. The complete set of all reachable points as $c_1, c_2$ range over all reals is the **span** — the entire plane.',
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
              id: 4,
              cellTitle: 'The column picture: matrix-vector product as linear combination',
              prose: [
                '`np.column_stack([v1, v2])` builds a matrix whose **columns** are $\\mathbf{v}_1$ and $\\mathbf{v}_2$. When you compute `A @ c`, NumPy takes each row of $A$ and dots it with $\\mathbf{c}$ — but the result is identical to $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2$. These two interpretations (row picture vs. column picture) of the same multiplication are a core duality in linear algebra.',
                '`np.linalg.solve(A, b)` finds the unique vector $\\mathbf{c} = [c_1, c_2]^\\top$ satisfying $A\\mathbf{c} = \\mathbf{b}$. This is the same as finding the scalar weights to write $\\mathbf{b}$ as a linear combination of $\\mathbf{v}_1$ and $\\mathbf{v}_2$. "Is $\\mathbf{b}$ in the span of the columns?" and "does $A\\mathbf{c} = \\mathbf{b}$ have a solution?" are exactly the same question — `solve` answers both at once.',
                'The final `np.allclose(A @ c_sol, b)` check is how you verify a solution numerically: `==` on floats is unreliable due to rounding, but `allclose` tolerates tiny floating-point errors and reports `True` if every component matches within a small tolerance.',
              ],
              code: `import numpy as np

v1 = np.array([2.0, 1.0])
v2 = np.array([1.0, 3.0])
b  = np.array([7.0, 5.0])

# Build matrix whose columns ARE the vectors
A = np.column_stack([v1, v2])
print("A (columns = v1, v2):\\n", A)

# A @ c  means  c1*v1 + c2*v2  (column picture of matrix multiplication)
c = np.array([2.0, 1.0])
print("\\nA @ [2,1] =", A @ c)
print("2*v1 + 1*v2 =", 2*v1 + 1*v2, "  (same result)")

# Solve A @ c_sol = b  ->  find weights that express b as a combination of v1 and v2
c_sol = np.linalg.solve(A, b)
print("\\nWeights to reach b:", c_sol)
print("Verify:", np.allclose(A @ c_sol, b))`,
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
                'In MATLAB/Octave, `v1 = [2; 1]` creates a **column vector** — a 2×1 matrix where semicolons separate rows. The semicolon means "new row," so `[2; 1]` reads "row 1 = 2, row 2 = 1." This is different from Python\'s `np.array([2, 1])`, which is a 1D array with no explicit orientation.',
                '`c1*v1 + c2*v2` computes the linear combination: MATLAB multiplies every element of `v1` by the scalar `c1`, every element of `v2` by `c2`, then adds element-by-element. The result is always a column vector of the same shape — a new vector in the same space.',
                'The second block reassigns `c1 = -1; c2 = 3` and computes `c1*v1 + c2*v2` with the new coefficients — `fprintf` shows both results labeled with their coefficient pair. Swapping the scalars while keeping `v1` and `v2` fixed is exactly what it means to vary the linear combination — same building blocks, different amounts.',
              ],
              code: `v1 = [2; 1];
v2 = [0; 1];
c1 = 1.5;  c2 = 1.0;
combo = c1*v1 + c2*v2;
fprintf('c1=%.1f, c2=%.1f  ->  combo = [%.2f; %.2f]\n', c1, c2, combo(1), combo(2))
c1 = -1;  c2 = 3;
combo2 = c1*v1 + c2*v2;
fprintf('c1=%.1f, c2=%.1f  ->  combo = [%.2f; %.2f]\n', c1, c2, combo2(1), combo2(2))`,
            },
            {
              id: 2,
              cellTitle: 'The column picture: A*c = linear combination of columns',
              prose: [
                '`A = [v1, v2]` stacks $\\mathbf{v}_1$ and $\\mathbf{v}_2$ as **columns** of a 2×2 matrix. In MATLAB, square brackets with commas concatenate horizontally, so column 1 of $A$ is $\\mathbf{v}_1$ and column 2 is $\\mathbf{v}_2$.',
                '`A * c` (matrix-vector product) computes exactly $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2$ — the first column of $A$ scaled by `c(1)` plus the second column scaled by `c(2)`. This is the **column picture of matrix multiplication**: every product $A\\mathbf{c}$ is a linear combination of $A$\'s columns weighted by the entries of $\\mathbf{c}$.',
                '`A \\ target` (backslash) solves $A\\mathbf{c} = \\mathbf{target}$ for $\\mathbf{c}$ using LU factorization internally. The result `c_solution` gives the unique scalar weights such that $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 = \\mathbf{target}$. "Find the weights" and "solve a linear system" are the same problem.',
              ],
              code: `v1 = [2; 1];
v2 = [0; 1];
A = [v1, v2];
disp('A (columns are v1 and v2):');  disp(A)
c = [1.5; 1.0];
result = A * c;
fprintf('A*c       = [%.2f; %.2f]\n', result(1), result(2))
check = 1.5*v1 + 1.0*v2;
fprintf('1.5v1+1v2 = [%.2f; %.2f]  (same — column picture)\n', check(1), check(2))
target = [5; 3];
c_solution = A \\ target;
fprintf('Solve A*c = [5;3]:  c = [%.4f; %.4f]\n', c_solution(1), c_solution(2))
verify = A * c_solution;
fprintf('Verify A*c_sol = [%.2f; %.2f]  (= target)\n', verify(1), verify(2))`,
            },
            {
              id: 3,
              cellTitle: 'Checking linear independence with rank()',
              prose: [
                '`rank(A)` counts the number of **pivot positions** after row-reducing $A$ — equivalently, the number of linearly independent columns in $A$. For a matrix whose rows are your test vectors, `rank == k` (where $k$ is the row count) means all rows are independent; `rank < k` means at least one row is a combination of the others.',
                '`A_ind = [[2; 1], [0; 1]]` stacks $[2,1]^\\top$ and $[0,1]^\\top$ as columns. `rank(A_ind) = 2` because neither column is a multiple of the other — two independent directions means the span is all of $\\mathbb{R}^2$.',
                '`A_dep = [[2; 1], [4; 2]]` — note $[4,2]^\\top = 2 \\cdot [2,1]^\\top$. `rank(A_dep) = 1`: both columns point the same direction, so there is only one independent direction. The span is a 1D line, not the plane.',
                '`A_three` has three 2D column vectors. `rank = 2` because in $\\mathbb{R}^2$ you can never have more than 2 independent vectors — the third is always a combination of the first two, no matter what it is.',
              ],
              code: `A_ind = [[2; 1], [0; 1]];
fprintf('rank(A_ind) = %d  (2 independent cols -> span = R^2)\n', rank(A_ind))

A_dep = [[2; 1], [4; 2]];
fprintf('rank(A_dep) = %d  (cols proportional -> 1D line only)\n', rank(A_dep))

A_three = [[1;0], [0;1], [1;1]];
fprintf('rank(A_three) = %d  (3 cols in R^2 -> third is redundant)\n', rank(A_three))`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC tool offsets as linear combinations',
              prose: [
                'A CNC **Work Coordinate System (WCS) offset** shifts the machine\'s reference origin. Every tool position $\\mathbf{P}_{\\text{part}}$ is measured relative to the part origin, but the controller needs machine coordinates. The conversion is $\\mathbf{P}_{\\text{machine}} = \\mathbf{G54\\_offset} + 1 \\cdot \\mathbf{P}_{\\text{part}}$ — a linear combination with both coefficients equal to 1.',
                '`sqrt(dot(diff_vec, diff_vec))` computes the distance between $P_1$ and $P_2$: `diff_vec = P1_part - P2_part`, then `dot(diff_vec, diff_vec)` gives $\\|\\mathbf{diff}\\|^2 = \\Delta x^2 + \\Delta y^2 + \\Delta z^2$, and `sqrt(...)` gives the Euclidean distance. This is the same formula as $\\|\\mathbf{v}\\| = \\sqrt{\\mathbf{v} \\cdot \\mathbf{v}}$ from Lesson 1.',
                'The distance between $P_1$ and $P_2$ is identical in part coordinates and machine coordinates because adding a constant offset to both points cancels: $(P_1 + \\text{offset}) - (P_2 + \\text{offset}) = P_1 - P_2$. Offsets translate the origin without scaling or rotating — they preserve all inter-point distances.',
              ],
              code: `G54_offset = [150; 80; 0];
P1_part = [10; 5; -3];
P2_part = [50; 5; -3];
P1_machine = G54_offset + P1_part;
fprintf('P1 machine: [%.0f; %.0f; %.0f]\n', P1_machine(1), P1_machine(2), P1_machine(3))
P2_machine = G54_offset + P2_part;
fprintf('P2 machine: [%.0f; %.0f; %.0f]\n', P2_machine(1), P2_machine(2), P2_machine(3))
G55_offset = [300; 80; 0];
P1_new = G55_offset + P1_part;
fprintf('P1 under G55: [%.0f; %.0f; %.0f]\n', P1_new(1), P1_new(2), P1_new(3))
diff_vec = P1_part - P2_part;
dist = sqrt(dot(diff_vec, diff_vec));
fprintf('Distance P1-P2 (part coords): %.2f mm\n', dist)
diff_m = P1_machine - P2_machine;
fprintf('Distance P1-P2 (machine coords): %.2f mm  (same -- offset cancels)\n', sqrt(dot(diff_m, diff_m)))`,
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
        title: 'Why Three 2D Vectors Must Be Dependent',
        mathBridge: 'Load the visualizer with $\\mathbf{v}_1 = [1,0]^\\top$ and $\\mathbf{v}_2 = [0,1]^\\top$. Their span fills the entire plane — every point is reachable. Now place any third 2D vector $\\mathbf{v}_3$: wherever you put it, it is already in the span of $\\mathbf{v}_1$ and $\\mathbf{v}_2$, so $\\mathbf{v}_3 = c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2$ for some pair $(c_1, c_2)$. Rearranging: $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 - \\mathbf{v}_3 = \\mathbf{0}$ with coefficients not all zero — dependent by definition. No matter how you orient the third arrow, this dependence is unavoidable: dimension is a hard ceiling.',
        caption: 'Add a third 2D vector: it is always a combination of the first two, without exception.',
      },
    ],
  },

  examples: [
    {
      id: 'la1-002-ex1',
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
      id: 'la1-002-ex2',
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
      id: 'la1-002-ex3',
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
      id: 'la1-002-ex4',
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
      id: 'la1-002-ch1',
      difficulty: 'easy',
      problem: 'Compute $3\\begin{bmatrix} 2 \\\\ 1 \\end{bmatrix} + 2\\begin{bmatrix} -1 \\\\ 4 \\end{bmatrix}$.',
      hint: 'Scale both vectors first (multiply each component by the scalar), then add component-by-component.',
      walkthrough: [
        { expression: '3[2,1]^T = [6,3]^T,\\quad 2[-1,4]^T = [-2,8]^T', annotation: 'Scale each vector separately: multiply every component by its scalar weight.' },
        { expression: '[6,3]^T + [-2,8]^T = [4,11]^T', annotation: 'Add component-by-component: top 6+(\u22122)=4, bottom 3+8=11.' },
        { expression: '3(2)+2(-1)=4\\checkmark,\\quad 3(1)+2(4)=11\\checkmark', annotation: 'Verify by substituting directly into the original formula to confirm no arithmetic error.' },
      ],
      answer: '$\\begin{bmatrix} 4 \\\\ 11 \\end{bmatrix}$ \u2014 you walked 3 steps along $[2,1]^T$ then 2 steps along $[-1,4]^T$.',
    },
    {
      id: 'la1-002-ch2',
      difficulty: 'medium',
      problem: 'Are the vectors $\\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$ and $\\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$ linearly independent?',
      hint: 'Set up $c_1[1,0]^T + c_2[0,1]^T = [0,0]^T$ and read off the equations.',
      walkthrough: [
        { expression: 'c_1[1,0]^T + c_2[0,1]^T = [0,0]^T', annotation: 'Set up the independence test: find all scalars making the combination equal to the zero vector.' },
        { expression: 'c_1 = 0,\\quad c_2 = 0', annotation: 'Top component gives c\u2081\u00b71=0 \u2192 c\u2081=0; bottom gives c\u2082\u00b71=0 \u2192 c\u2082=0. The only solution is trivial.' },
        { expression: '\\Rightarrow \\text{Linearly INDEPENDENT}', annotation: 'Only the trivial solution exists. These are \u00ee and \u0135 \u2014 the standard basis vectors, the prototypical independent pair that spans all of \u211d\u00b2.' },
      ],
      answer: 'Yes, linearly independent \u2014 these are $\\hat{\\mathbf{i}}$ and $\\hat{\\mathbf{j}}$, which are perpendicular and together span all of $\\mathbb{R}^2$.',
    },
    {
      id: 'la1-002-ch3',
      difficulty: 'hard',
      problem: 'Are $[1,2,3]^T$, $[4,5,6]^T$, $[7,8,9]^T$ linearly independent? Use the rank test.',
      hint: 'Stack as rows, row-reduce. Notice the arithmetic pattern: differences between consecutive rows are all equal.',
      walkthrough: [
        { expression: 'M = \\begin{bmatrix}1&2&3\\\\4&5&6\\\\7&8&9\\end{bmatrix}', annotation: 'Stack vectors as rows. Spot the pattern: Row2\u2212Row1=[3,3,3] and Row3\u2212Row2=[3,3,3] \u2014 equal differences signal dependence before any computation.' },
        { expression: '\\xrightarrow{R_2-4R_1,\\;R_3-7R_1}\\begin{bmatrix}1&2&3\\\\0&-3&-6\\\\0&-6&-12\\end{bmatrix}\\xrightarrow{R_3-2R_2}\\begin{bmatrix}1&2&3\\\\0&-3&-6\\\\0&0&0\\end{bmatrix}', annotation: 'Row reduce: subtract multiples of Row 1 to clear the first column, then use Row 2 to eliminate Row 3 entirely.' },
        { expression: '\\text{rank}(M)=2<3 \\Rightarrow \\text{Linearly DEPENDENT},\\quad \\mathbf{v}_3 = 2\\mathbf{v}_2 - \\mathbf{v}_1', annotation: 'A zero row means rank < 3. All three vectors lie on the same 2D plane through the origin in \u211d\u00b3 and cannot span the full 3D space.' },
      ],
      answer: 'Linearly dependent \u2014 rank$(M)=2<3$, with explicit relationship $\\mathbf{v}_3 = 2\\mathbf{v}_2 - \\mathbf{v}_1$.',
    },
  ],

  semantics: {
    core: [
      { symbol: 'c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2', meaning: 'Linear combination: scale each vector by its weight, then add. Scalars $c_1, c_2$ control how much of each direction you take.' },
      { symbol: '\\text{Span}(\\mathbf{v}_1, \\mathbf{v}_2)', meaning: 'All vectors reachable by every possible linear combination \u2014 the infinite universe these vectors can build.' },
      { symbol: '\\text{rank}(A)', meaning: 'Number of independent columns in $A$; equals the dimension of the span of the columns.' },
      { symbol: 'c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}', meaning: 'Independence test: if the only solution is all $c_i=0$, vectors are independent; any non-zero solution reveals dependence.' },
      { symbol: '\\text{Basis for } \\mathbb{R}^n', meaning: 'Exactly $n$ vectors that are linearly independent AND span $\\mathbb{R}^n$ \u2014 the minimal non-redundant coordinate toolkit.' },
    ],
    rulesOfThumb: [
      'To compute a linear combination: scale each vector first, then add component by component.',
      'If two vectors lie on the same line through the origin, they are dependent \u2014 their span is 1D regardless of their magnitudes.',
      'A basis for $\\mathbb{R}^n$ has exactly $n$ vectors \u2014 not more, not fewer.',
      'rank$(A)$ = number of independent directions in $A$ = dimension of the column span.',
      '"Is $\\mathbf{b}$ in the span?" is the same question as "Does $A\\mathbf{c} = \\mathbf{b}$ have a solution?"',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la1-001', label: 'What is a vector?', note: 'Be comfortable visualizing a column matrix as an arrow before combining multiples of them.' },
    ],
    futureLinks: [
      { lessonId: 'la2-001', label: 'Matrices as Transformations', note: 'A matrix-vector product $A\\mathbf{x}$ is a linear combination of the columns of $A$, weighted by the entries of $\\mathbf{x}$ \u2014 the column picture of multiplication.' },
      { lessonId: 'la1-004', label: 'Systems of Equations', note: '"Can $\\mathbf{b}$ be written as a linear combination of the columns?" is exactly the question Gaussian elimination answers.' },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'la1-002-assess-1',
        type: 'choice',
        text: 'Compute $2[1, 5]^T - [3, 2]^T$.',
        options: ['$[-1, 8]^T$', '$[5, 12]^T$', '$[-1, 3]^T$', '$[1, 8]^T$'],
        answer: '$[-1, 8]^T$',
        hints: ['Scale first: $2[1,5]^T = [2,10]^T$. Then subtract component-by-component: $[2-3,\\; 10-2]^T = [-1, 8]^T$.'],
      },
      {
        id: 'la1-002-assess-2',
        type: 'choice',
        text: 'Are $[2, 6]^T$ and $[1, 3]^T$ linearly independent?',
        options: [
          'No — $[2,6]^T = 2 \\cdot [1,3]^T$, so they are scalar multiples and therefore dependent',
          'Yes — they have different entries, so they are independent',
          'Yes — neither vector is the zero vector',
          'Cannot determine without computing the rank',
        ],
        answer: 'No — $[2,6]^T = 2 \\cdot [1,3]^T$, so they are scalar multiples and therefore dependent',
        hints: ['Check component ratios: $2/1 = 2$ and $6/3 = 2$. Equal ratios mean proportional — one is a scalar multiple of the other, so they are dependent.'],
      },
      {
        id: 'la1-002-assess-3',
        type: 'choice',
        text: 'What is the span of $[1, 0]^T$ and $[0, 1]^T$?',
        options: [
          'The entire 2D plane $\\mathbb{R}^2$',
          'Just the two vectors themselves',
          'Only the positive quadrant',
          'A single line through the origin',
        ],
        answer: 'The entire 2D plane $\\mathbb{R}^2$',
        hints: ['Two independent vectors in $\\mathbb{R}^2$ span the full plane. Every point $(a, b)$ equals $a \\cdot [1,0]^T + b \\cdot [0,1]^T$ for any real $a, b$.'],
      },
      {
        id: 'la1-002-assess-4',
        type: 'choice',
        text: 'A set $S$ already spans $\\mathbb{R}^2$. You add a new vector $\\mathbf{v} \\in \\mathbb{R}^2$ to $S$. What happens to $\\text{span}(S \\cup \\{\\mathbf{v}\\})$?',
        options: [
          'It stays $\\mathbb{R}^2$ — any vector already in the span cannot expand it further',
          'It always grows larger because $S$ now contains more vectors',
          'It depends on whether $\\mathbf{v}$ is a unit vector',
          'The span shrinks because the new vector introduces a dependency',
        ],
        answer: 'It stays $\\mathbb{R}^2$ — any vector already in the span cannot expand it further',
        hints: ['If $S$ spans $\\mathbb{R}^2$, then every 2D vector — including $\\mathbf{v}$ — is already expressible as a combination from $S$. Adding a dependent vector creates redundancy but never expands the span.'],
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
    { id: 'cp-la1-002-1', label: 'Read: Define linear combination and span', type: 'read' },
    { id: 'cp-la1-002-2', label: 'Read: State the linear independence test', type: 'read' },
    { id: 'cp-la1-002-3', label: 'Read: Define basis and its two requirements', type: 'read' },
    { id: 'cp-la1-002-4', label: 'Run: Python cell \u2014 compute and visualize linear combinations', type: 'lab' },
    { id: 'cp-la1-002-5', label: 'Run: OpenMAT cell \u2014 column picture of matrix-vector product', type: 'lab' },
    { id: 'cp-la1-002-6', label: 'Complete: Example 1 \u2014 compute a linear combination', type: 'example' },
    { id: 'cp-la1-002-7', label: 'Complete: Example 2 \u2014 check linear dependence', type: 'example' },
    { id: 'cp-la1-002-8', label: 'Attempt: Challenge 3 \u2014 rank test for three 3D vectors', type: 'challenge' },
  ],

  quiz: [
    {
      id: 'la1-002-quiz-1',
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
      id: 'la1-002-quiz-2',
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
      id: 'la1-002-quiz-3',
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
      id: 'la1-002-quiz-4',
      type: 'choice',
      text: 'How many vectors must be in a basis for $\\mathbb{R}^3$?',
      options: ['1', '2', '3', '4 or more'],
      answer: '3',
      hints: ['A basis for $\\mathbb{R}^n$ has exactly $n$ vectors. Three dimensions need exactly 3 independent directions.'],
      reviewSection: 'Math tab — Basis',
    },
    {
      id: 'la1-002-quiz-5',
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
      id: 'la1-002-quiz-6',
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
    {
      id: 'la1-002-quiz-7',
      type: 'choice',
      text: 'Compute $2\\begin{bmatrix}3\\\\-1\\end{bmatrix} - 3\\begin{bmatrix}1\\\\2\\end{bmatrix}$.',
      options: [
        '$\\begin{bmatrix}3\\\\-8\\end{bmatrix}$',
        '$\\begin{bmatrix}9\\\\4\\end{bmatrix}$',
        '$\\begin{bmatrix}3\\\\4\\end{bmatrix}$',
        '$\\begin{bmatrix}-3\\\\8\\end{bmatrix}$',
      ],
      answer: '$\\begin{bmatrix}3\\\\-8\\end{bmatrix}$',
      hints: ['Scale first: $2[3,-1]^T = [6,-2]^T$ and $3[1,2]^T = [3,6]^T$. Then subtract: $[6-3,\\ -2-6]^T = [3,-8]^T$.'],
      reviewSection: 'Example 1 — compute a linear combination',
    },
    {
      id: 'la1-002-quiz-8',
      type: 'choice',
      text: 'Is $[3, 7]^T$ in the span of $[1, 2]^T$ and $[1, 3]^T$? If so, what scalars $c_1, c_2$ give $c_1[1,2]^T + c_2[1,3]^T = [3,7]^T$?',
      options: [
        'Yes: $c_1 = 2$, $c_2 = 1$',
        'No: $[3,7]^T$ is outside the span',
        'Yes: $c_1 = 3$, $c_2 = 7$',
        'Yes: $c_1 = 1$, $c_2 = 2$',
      ],
      answer: 'Yes: $c_1 = 2$, $c_2 = 1$',
      hints: ['Set up the system: $c_1 + c_2 = 3$ (top component) and $2c_1 + 3c_2 = 7$ (bottom). From the first equation $c_1 = 3 - c_2$. Sub into the second: $2(3-c_2) + 3c_2 = 7 \\Rightarrow c_2 = 1$, $c_1 = 2$.'],
      reviewSection: 'Example 3 — express as a linear combination',
    },
    {
      id: 'la1-002-quiz-9',
      type: 'choice',
      text: 'Which of the following sets is a basis for $\\mathbb{R}^2$?',
      options: [
        '$\\{[1,0]^T,\\; [0,1]^T\\}$ — independent and spans $\\mathbb{R}^2$',
        '$\\{[1,2]^T,\\; [2,4]^T\\}$ — two nonzero vectors',
        '$\\{[1,0]^T,\\; [0,1]^T,\\; [1,1]^T\\}$ — three vectors cover more directions',
        '$\\{[3,3]^T\\}$ — one vector in $\\mathbb{R}^2$',
      ],
      answer: '$\\{[1,0]^T,\\; [0,1]^T\\}$ — independent and spans $\\mathbb{R}^2$',
      hints: ['A basis needs (1) independence and (2) spanning. $[1,2]^T$ and $[2,4]^T$ are dependent ($[2,4] = 2[1,2]$). Three vectors in $\\mathbb{R}^2$ are always dependent. One vector can only span a line. Only two independent vectors in $\\mathbb{R}^2$ form a basis.'],
      reviewSection: 'Math tab — Basis definition',
    },
    {
      id: 'la1-002-quiz-10',
      type: 'choice',
      text: 'You add vector $\\mathbf{v} = [0, 0]^T$ (the zero vector) to a spanning set $S = \\{[1,0]^T, [0,1]^T\\}$. What happens to the span?',
      options: [
        'Nothing changes — the zero vector is always dependent on any set and contributes no new direction',
        'The span grows to include the origin',
        'The zero vector makes the set inconsistent',
        'The span shrinks because the zero vector is not in $\\mathbb{R}^2$',
      ],
      answer: 'Nothing changes — the zero vector is always dependent on any set and contributes no new direction',
      hints: ['$\\mathbf{0} = 0 \\cdot [1,0]^T + 0 \\cdot [0,1]^T$ — the zero vector is already in every span (take all scalars = 0). Adding it never expands the span and makes the set dependent.'],
      reviewSection: 'Intuition tab — Span',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The span of two vectors is just those two vectors and the line segment between them.',
      whyStudentsThinkIt: 'Students visualize "combining" as joining two specific points, forgetting that scalars range over all real numbers \u2014 including negatives and fractions.',
      correctionExample: 'Span([1,0]\u1d40, [0,1]\u1d40) contains [100,\u221257]\u1d40, [\u03c0, \u221a2]\u1d40, and every other point on the plane \u2014 infinitely many vectors, not two.',
      contrastCase: 'If scalars were restricted to {0, 1}, you could only reach four specific points. Span requires ALL real scalars.',
    },
    {
      falseBelief: 'Adding more vectors to a set always expands the span.',
      whyStudentsThinkIt: 'More vectors feels like more coverage; students expect each addition to contribute new directions.',
      correctionExample: 'Adding [2,4]\u1d40 to {[1,2]\u1d40} does nothing: [2,4]\u1d40 = 2\u00b7[1,2]\u1d40. The span remains a single line.',
      contrastCase: 'Adding [0,1]\u1d40 to {[1,0]\u1d40} expands span from a line to the full plane \u2014 only because [0,1]\u1d40 points in a genuinely new direction.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A graphics engineer has pure red=[1,0,0], green=[0,1,0], blue=[0,0,1]. A designer requests color [0.8, 0.2, 0.6]. Can she produce it, and what are the RGB intensity values?',
      competingTechniques: 'Trial and error with color sliders vs. linear combination decomposition',
      whyThisTechniqueWins: 'Since {red, green, blue} form a basis for color space, every color has a unique decomposition. The answer is directly [0.8, 0.2, 0.6] \u2014 the coordinates ARE the intensity scalars.',
    },
    {
      situation: 'A surveyor has two landmark reference vectors for her coordinate system. Both landmarks happen to lie due North at different distances. Can she express every 2D position in the region as a linear combination of those two reference vectors?',
      competingTechniques: 'Three-point triangulation vs. two-vector span test',
      whyThisTechniqueWins: 'Both vectors point North \u2014 they are collinear. Their span is a 1D line, not the plane. A span test reveals the system is insufficient before any field measurements are taken.',
    },
  ],

  debugging: [
    {
      commonError: 'Declaring vectors independent because they look different or have different magnitudes.',
      symptom: 'Student writes "independent" without performing the zero-sum test.',
      whyItHappened: 'Visually distinct vectors can still be scalar multiples: [4,6]\u1d40 and [\u22122,\u22123]\u1d40 look different, but [4,6]\u1d40 = \u22122\u00b7[\u22122,\u22123]\u1d40.',
      repairStrategy: 'Always check proportionality first: compare component ratios. If ratios match, vectors are dependent. For 3+ vectors, compute rank.',
    },
    {
      commonError: 'Confusing the span with the original vectors themselves.',
      symptom: 'Student says "the span of [1,0] and [0,1] is just those two vectors."',
      whyItHappened: 'The word "span" is new; students anchor it to the specific examples rather than the infinite generated set.',
      repairStrategy: 'Substitute specific scalars into the definition and enumerate: c\u2081=5, c\u2082=3 gives [5,3]; c\u2081=100, c\u2082=\u2212\u03c0 also gives a member. The span is infinite \u2014 enumerate three examples to make this concrete.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute any linear combination of 2\u20133 vectors, apply the zero-sum independence test, and determine whether a given target vector lies in the span.',
    explainVerbally: 'Describe why "is b in the span?" and "does Ac=b have a solution?" are the same question, and why adding a dependent vector never expands the span.',
    detectIncorrectApplication: 'Identify when a claimed basis is invalid \u2014 e.g., three vectors in \u211d\u00b2, or two parallel vectors claimed to span the plane.',
    transferToUnfamiliar: 'Determine whether {1, t, t\u00b2} forms a basis for P\u2082 (polynomials of degree \u22642) by analogy with the standard basis in \u211d\u00b3.',
  },
};
