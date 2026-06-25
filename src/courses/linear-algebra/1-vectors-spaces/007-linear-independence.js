import dimensionGrowthUrl from '../diagrams/la-dimension-growth.svg?url'

export default {
  id: 'la1-007',
  slug: 'linear-independence',
  chapter: 'la1',
  order: 7,
  title: 'Linear Independence and Dependence',
  subtitle: 'When vectors genuinely pull in new directions — and when they are just redundant copies in disguise.',
  tags: ['linear independence', 'linear dependence', 'rank', 'null space', 'wronskian', 'basis', 'pivot columns'],
  aliases: 'independent vectors dependent vectors redundant zero sum test rank test determinant pivot columns null space',

  timeToComplete: 25,
  coreConcept: 'A set of vectors is linearly independent when no vector can be expressed as a combination of the others — equivalently, the only way to combine them into the zero vector is to use all-zero scalars.',
  prerequisites: ['la1-002', 'la1-006'],
  nextLesson: 'la2-001',

  hook: {
    question: 'Could you throw away any of your vectors without losing ground — without losing the ability to reach any point in space?',
    realWorldContext: 'A GPS satellite network needs at minimum four satellites with independent signal directions to pinpoint a location in 3D plus time. Add a fifth satellite and its signal is redundant — it gives no new independent direction of information. Engineers test for independence before deciding how many satellites are "enough." The same logic applies everywhere: in machine learning, redundant features in a dataset are linearly dependent columns — they add computation cost but no new predictive power. Dimensionality reduction (PCA) works by finding and discarding those dependent directions.',
    previewVisualizationId: 'LinearDependenceViz',
  },

  intuition: {
    blocks: [
      { type: 'prose', paragraphs: [
      'Take two vectors $\\mathbf{v}_1 = [1, 0]^T$ and $\\mathbf{v}_2 = [2, 0]^T$. Both point rightward along the $x$-axis. No matter how you combine them — $c_1[1,0]^T + c_2[2,0]^T$ — the result always has a zero $y$-component. You can never reach $[0, 1]^T$. These vectors are **linearly dependent**: $\\mathbf{v}_2$ is just a scaled copy of $\\mathbf{v}_1$ and adds zero new information.',
      'Now replace $\\mathbf{v}_2$ with $[0, 1]^T$ — straight up. Now you CAN reach $[0,1]^T$ (use $c_1=0$, $c_2=1$). And $[3, -5]^T$ (use $c_1=3$, $c_2=-5$). And every other 2D point. These vectors are **linearly independent**: each one introduces a genuinely new direction that the other cannot replicate.',
      ] },
      { type: 'viz', id: 'LinearDependenceViz',
        title: 'Dependence: Trapped on a Line vs. Full Plane',
        mathBridge: 'Toggle between the dependent pair (two vectors on the same line) and an independent pair (vectors in different directions). Watch how the span — the full set of reachable points — collapses from the entire plane down to a single 1D line when dependence is introduced. Drag a vector until it aligns with another and observe the exact moment the span shrinks.',
        caption: 'Dependent vectors: their span is always strictly smaller than the space they live in.' },
      { type: 'prose', paragraphs: [
      '**The core test:** Can you find scalars — NOT all zero — that make the combination equal the zero vector? Formally: does $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$ have any solution other than $c_1 = c_2 = \\cdots = c_k = 0$?',
      '**If YES** → the set is **linearly dependent**. Some vector is redundant — you can express it as a combination of the others.',
      '**If NO** (only all-zero works) → the set is **linearly independent**. Every vector contributes a brand-new direction.',
      '**Predict before reading:** Consider $\\mathbf{v}_1 = [3, 1]^T$ and $\\mathbf{v}_2 = [6, 2]^T$. Without computing, can you guess whether they are independent? Look at the ratio of components: $6/3 = 2$ and $2/1 = 2$. Equal ratios mean $\\mathbf{v}_2 = 2\\mathbf{v}_1$ — they are parallel, thus dependent. The zero-sum test will confirm this with $c_1 = 2, c_2 = -1$ (both non-zero).',
      '**The geometric picture:** Independent vectors point in different directions — like the $x$- and $y$-axes. Dependent vectors are parallel (or anti-parallel, or one is zero). In 3D, three independent vectors each add a new dimension: the span grows from a line to a plane to all of space. A dependent third vector lies flat inside the plane the first two already define.',
      ] },
      { type: 'image', src: dimensionGrowthUrl,
        alt: 'Three panels: one vector spanning a line, two independent vectors spanning a plane, and a third vector either lying flat in the plane (dependent, redundant) or popping straight up out of it (independent, a genuinely new dimension)',
        caption: 'Each independent vector adds one new dimension to the span — a dependent vector adds nothing, no matter where you place it.' },
      { type: 'viz', id: 'LALesson02_Combinations',
        title: 'Sweeping the Plane with Independent vs. Dependent Pairs',
        mathBridge: 'Set $c_1$ and $c_2$ using the sliders. When two vectors are independent, every point in the plane is reachable with some $(c_1, c_2)$. Set $\\mathbf{v}_2 = 2\\mathbf{v}_1$ to simulate dependence — notice how the result vector is always constrained to the same line through the origin regardless of the sliders. You cannot escape the 1D span by changing scalars alone.',
        caption: 'Independence means every slider combination reaches a new point. Dependence means you are locked to a line.' },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 7 of 7 — Vectors & Spaces',
        body: '**Previous:** Gauss-Jordan & RREF — systematic row reduction to solve systems.\n**This lesson:** Linear independence and dependence — which vectors are redundant, and how to prove it rigorously.\n**Next (Chapter 2):** Matrices as Transformations — where columns of a matrix ARE a set of vectors we test for independence.',
      },
      {
        type: 'insight',
        title: 'Dependence = Expressibility',
        body: 'Saying "$\\mathbf{v}_3$ is dependent on $\\mathbf{v}_1, \\mathbf{v}_2$" is exactly the same as saying "$\\mathbf{v}_3$ lies in the span of $\\mathbf{v}_1, \\mathbf{v}_2$." The two statements are equivalent — proving one proves both.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Zero-Sum Independence Test',
        body: 'Step 1. Write $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$.\nStep 2. Stack the vectors as rows (or columns) of a matrix.\nStep 3. Row-reduce (RREF) the matrix.\nStep 4. Count pivots. If pivots = $k$ → **independent**. If pivots < $k$ → **dependent**, and each non-pivot column reveals a dependence relation.\nStep 5. To find the explicit relation: read the free-variable columns from RREF.',
      },
      {
        type: 'warning',
        title: 'A Single Non-Zero Solution Kills Independence',
        body: 'If you find even ONE set of scalars — not all zero — that makes the combination equal $\\mathbf{0}$, the set is dependent. You do not need to find all solutions. One counter-example suffices.',
      },
      {
        type: 'insight',
        title: 'The Zero Vector is Always Dependent',
        body: 'Any set containing $\\mathbf{0}$ is automatically linearly dependent. Proof: $1 \\cdot \\mathbf{0} + 0 \\cdot \\mathbf{v}_2 + \\cdots = \\mathbf{0}$ uses a non-zero scalar ($c_1 = 1$). This is why a basis can never include the zero vector.',
      },
    ],
  },

  math: {
    prose: [
      '**Formal Definition.** Vectors $\\mathbf{v}_1, \\mathbf{v}_2, \\ldots, \\mathbf{v}_k \\in \\mathbb{R}^n$ are **linearly independent** if and only if\n\n$$c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$$\n\nhas ONLY the **trivial solution** $c_1 = c_2 = \\cdots = c_k = 0$.\n\nThey are **linearly dependent** if there exist scalars — not all zero — satisfying the equation.',
      '**Reformulation as a matrix problem.** Form the matrix $A$ whose columns are $\\mathbf{v}_1, \\ldots, \\mathbf{v}_k$. The equation $c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$ is exactly $A\\mathbf{c} = \\mathbf{0}$, the **homogeneous system**. The set is independent iff $A\\mathbf{c} = \\mathbf{0}$ has only the trivial solution — i.e., iff $\\text{null}(A) = \\{\\mathbf{0}\\}$.',
      '**The rank test.** Stack the $k$ vectors as columns of $A$ (size $n \\times k$). Row-reduce to RREF:\n- If $\\text{rank}(A) = k$ (one pivot per column) → **independent**.\n- If $\\text{rank}(A) < k$ (some free columns) → **dependent**; the number of free variables equals the number of redundant vectors.',
      '**The determinant shortcut.** If $k = n$ (a square matrix), the columns are independent iff $\\det(A) \\neq 0$. This is the fastest check for a square system — no row reduction required.',
      '**Finding the dependence relation explicitly.** Row-reduce $A\\mathbf{c} = \\mathbf{0}$. Each free variable corresponds to a non-pivot column. Setting one free variable to 1 (others to 0) and back-substituting gives an explicit non-trivial solution — and thus an explicit dependence relation among the columns.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Linear Independence Definition',
        body: '$\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ is linearly independent iff:\n\n$$c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0} \\implies c_1 = c_2 = \\cdots = c_k = 0$$\n\nEquivalently: $\\text{rank}([\\mathbf{v}_1 \\;|\\; \\cdots \\;|\\; \\mathbf{v}_k]) = k$.\n\nEquivalently (square case): $\\det([\\mathbf{v}_1 \\;|\\; \\cdots \\;|\\; \\mathbf{v}_k]) \\neq 0$.',
      },
      {
        type: 'theorem',
        title: 'Dependence ↔ Expressibility',
        body: 'The set $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$ is linearly dependent if and only if at least one vector in the set can be written as a linear combination of the others:\n\n$$\\exists j:\\; \\mathbf{v}_j = \\sum_{i \\neq j} c_i \\mathbf{v}_i$$\n\nProof: if the zero-sum test has a non-trivial solution with $c_j \\neq 0$, isolate $\\mathbf{v}_j = -\\frac{1}{c_j}\\sum_{i\\neq j}c_i\\mathbf{v}_i$.',
      },
      {
        type: 'insight',
        title: 'Pivot Columns are Independent',
        body: 'After row-reducing a matrix to RREF, the **pivot columns** of the original matrix are linearly independent. The **non-pivot (free) columns** are always linear combinations of the pivot columns to their left. This is the fastest way to identify a maximal independent subset of a collection of vectors.',
      },
      {
        type: 'strategy',
        title: 'Choosing the Right Test',
        body: '**2 vectors in any dimension:** Check if one is a scalar multiple of the other (compare component ratios). Takes 5 seconds.\n**$k$ vectors, $k \\leq n$:** Form matrix, check $\\text{rank} = k$ using RREF. Always works.\n**$k = n$ (square):** Compute $\\det(A) \\neq 0$. Fastest for exact arithmetic.\n**$k > n$:** They are automatically dependent — more vectors than the dimension of the space.',
      },
    ],
    visualizations: [
      {
        id: 'LinearDependenceViz',
        title: 'Rank and Span: Independent vs. Dependent',
        mathBridge: 'Rank 1 means all vectors lie on a single line — span is 1D. Rank 2 means vectors span a full plane — 2D span. Rank 3 means vectors span all of $\\mathbb{R}^3$. The rank equals the dimension of the span, which equals the number of truly independent vectors in the set. Drag vectors to collinear positions and watch the rank counter drop from 2 to 1.',
        caption: 'rank = number of independent directions = dimension of the span.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Testing Independence Three Ways',
        mathBridge: 'All three approaches — zero-sum RREF, rank test, and determinant — answer the same question. See them agree on the same inputs.',
        caption: 'Three equivalent tests, one concept.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Method 1 — Zero-sum test via RREF',
              prose: [
                '`np.column_stack([v1, v2, v3])` builds a matrix $A$ whose **columns** are $\\mathbf{v}_1$, $\\mathbf{v}_2$, $\\mathbf{v}_3$. Testing independence of $\\{\\mathbf{v}_1, \\mathbf{v}_2, \\mathbf{v}_3\\}$ is equivalent to asking: does $A\\mathbf{c} = \\mathbf{0}$ have only the trivial solution?',
                '`sympy.Matrix.rref()` returns the reduced row echelon form and the pivot column indices. The number of pivots equals the rank. If the number of pivots equals the number of columns, the vectors are independent. If pivots < columns, the free (non-pivot) columns reveal the dependence.',
                'For the independent case `M_ind`, all three columns are pivots, so only $\\mathbf{c} = \\mathbf{0}$ solves $A\\mathbf{c} = \\mathbf{0}$. For `M_dep`, only two pivots, meaning the third column is a linear combination of the first two — a free variable exists, and we can read off the dependence relation.',
              ],
              code: `import numpy as np
import sympy

# Independent: standard basis vectors of R^3
v1 = np.array([1, 0, 0], dtype=float)
v2 = np.array([0, 1, 0], dtype=float)
v3 = np.array([0, 0, 1], dtype=float)

M_ind = np.column_stack([v1, v2, v3])
rref_ind, pivots_ind = sympy.Matrix(M_ind).rref()
print("Independent set:")
print(f"  Matrix columns: v1={v1}, v2={v2}, v3={v3}")
print(f"  Pivot columns: {pivots_ind}  (count={len(pivots_ind)})")
print(f"  Rank = {len(pivots_ind)} = 3 columns => INDEPENDENT")

# Dependent: v3 = v1 + v2
w1 = np.array([1, 0, 0], dtype=float)
w2 = np.array([0, 1, 0], dtype=float)
w3 = np.array([1, 1, 0], dtype=float)  # = w1 + w2

M_dep = np.column_stack([w1, w2, w3])
rref_dep, pivots_dep = sympy.Matrix(M_dep).rref()
print("\\nDependent set (w3 = w1 + w2):")
print(f"  Pivot columns: {pivots_dep}  (count={len(pivots_dep)})")
print(f"  Rank = {len(pivots_dep)} < 3 columns => DEPENDENT")
print(f"  RREF:\\n{np.array(rref_dep.tolist(), dtype=float)}")
print("  Reading RREF: c3 is free. Set c3=1 -> c1=-1, c2=-1")
print("  Dependence relation: -w1 - w2 + w3 = 0  i.e. w3 = w1 + w2")`,
            },
            {
              id: 2,
              cellTitle: 'Method 2 — Rank test with numpy',
              prose: [
                '`np.linalg.matrix_rank(A)` computes the rank via SVD: it counts singular values above a numerical threshold. This is the most numerically stable method for floating-point data.',
                'The comparison `rank == k` (where $k$ is the number of vectors = number of columns) is the complete independence test. One line of code replaces the entire RREF procedure — useful when you only need the verdict, not the explicit dependence relation.',
                'The visualization plots the column vectors as arrows. For the independent set, the three arrows point in three genuinely different directions — no one arrow lies in the plane formed by the other two. For the dependent set, $\\mathbf{w}_3 = \\mathbf{w}_1 + \\mathbf{w}_2$ lies exactly in the plane spanned by $\\mathbf{w}_1$ and $\\mathbf{w}_2$, which you can visually verify by completing the parallelogram.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

def is_independent(vectors):
    A = np.column_stack(vectors)
    return np.linalg.matrix_rank(A) == len(vectors)

# Test cases
independent_set  = [np.array([1,0,0.]), np.array([0,1,0.]), np.array([0,0,1.])]
dependent_set    = [np.array([1,0,0.]), np.array([0,1,0.]), np.array([1,1,0.])]
two_proportional = [np.array([2,4,0.]), np.array([1,2,0.])]

print(f"Standard basis: independent = {is_independent(independent_set)}")
print(f"w3=w1+w2 set:   independent = {is_independent(dependent_set)}")
print(f"Proportional 2: independent = {is_independent(two_proportional)}")

# 3D plot comparing the two sets
fig = plt.figure(figsize=(12, 5))
origin = np.zeros(3)

for col_idx, (vecs, title, colors) in enumerate([
    (independent_set, "Independent (rank=3)", ['steelblue','darkorange','green']),
    (dependent_set,   "Dependent (rank=2)",   ['steelblue','darkorange','crimson']),
]):
    ax = fig.add_subplot(1, 2, col_idx+1, projection='3d')
    ax.set_title(title, fontsize=11)
    labels = ['v1','v2','v3']
    for v, color, label in zip(vecs, colors, labels):
        ax.quiver(*origin, *v, color=color, arrow_length_ratio=0.2, linewidth=2)
        ax.text(v[0]+0.05, v[1]+0.05, v[2]+0.05, label, fontsize=10, color=color, fontweight='bold')
    ax.set_xlim(0,1.5); ax.set_ylim(0,1.5); ax.set_zlim(0,1)
    ax.set_xlabel('x'); ax.set_ylabel('y'); ax.set_zlabel('z')

plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Method 3 — Determinant test (square matrices)',
              prose: [
                'For a square matrix $A$ (same number of vectors as the dimension of the space), the determinant gives the final answer instantly: $\\det(A) \\neq 0$ iff the columns are linearly independent.',
                'Geometrically, $|\\det(A)|$ equals the volume of the parallelepiped spanned by the column vectors. If any two vectors are parallel (dependent), that parallelepiped collapses to zero volume — exactly when $\\det = 0$. If all vectors are independent, the parallelepiped has positive volume.',
                'The printed output shows why non-square cases need the rank test: you cannot take a determinant of a non-square matrix. The determinant test is only valid when the number of vectors equals the dimension of the space.',
              ],
              code: `import numpy as np

# Square case: determinant test
A_ind = np.array([[1., 0.], [0., 1.]])   # standard basis - det=1
A_dep = np.array([[2., 6.], [1., 3.]])   # v2 = 3*v1   - det=0
A_rnd = np.array([[1., 2.], [3., 4.]])   # generic      - det=-2

for label, A in [("Standard basis", A_ind), ("Dependent (v2=3v1)", A_dep), ("Random 2x2", A_rnd)]:
    d = np.linalg.det(A)
    verdict = "INDEPENDENT" if abs(d) > 1e-10 else "DEPENDENT"
    print(f"{label:<24}  det = {d:+.4f}  =>  {verdict}")

print()

# 3x3 examples
B_ind = np.array([[1.,0.,0.],[0.,1.,0.],[0.,0.,1.]])
B_dep = np.array([[1.,2.,3.],[4.,5.,6.],[7.,8.,9.]])  # known rank 2
for label, B in [("3x3 identity", B_ind), ("Arithmetic progression (dep)", B_dep)]:
    d = np.linalg.det(B)
    verdict = "INDEPENDENT" if abs(d) > 1e-10 else "DEPENDENT"
    print(f"{label:<30}  det = {d:+.4f}  =>  {verdict}")

print()
print("Note: det only works for SQUARE matrices.")
print("For non-square (more vectors than dimensions, or fewer), use rank test.")`,
            },
            {
              id: 4,
              cellTitle: 'Finding the explicit dependence relation',
              prose: [
                'When the rank test says "dependent," you often want to know *which* vector is redundant and *exactly* how to express it as a combination of the others. The RREF of the augmented homogeneous system $[A | \\mathbf{0}]$ provides this directly.',
                'The free-variable columns (non-pivot columns) give you a recipe: set one free variable to 1, solve for the rest. The resulting vector $\\mathbf{c}$ satisfies $A\\mathbf{c} = \\mathbf{0}$ with not all entries zero — that is the dependence relation.',
                'After reading off $\\mathbf{c}$, rearrange $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + c_3\\mathbf{v}_3 = \\mathbf{0}$ to isolate the redundant vector. The coefficient that was free (set to 1) indexes the redundant vector. This technique generalizes to any number of vectors.',
              ],
              code: `import numpy as np
import sympy

# Three vectors where v3 = 2*v1 - v2
v1 = np.array([1., 2., 3.])
v2 = np.array([4., 5., 6.])
v3 = 2*v1 - v2   # = [-2, -1, 0] -- DEPENDENT

A = np.column_stack([v1, v2, v3])
print("Matrix A (columns = v1, v2, v3):")
print(A)

# RREF to find the dependence relation
rref, pivots = sympy.Matrix(A).rref()
print(f"\\nPivot columns: {pivots}  (rank = {len(pivots)})")
print("RREF of A:")
print(np.array(rref.tolist(), dtype=float).round(4))

# Column 2 (index 2) is free. Set c3 = 1, read c1 and c2 from RREF
# RREF row 0: c1 + 0*c2 + rref[0,2]*c3 = 0  =>  c1 = -rref[0,2]*c3
# RREF row 1: 0*c1 + c2 + rref[1,2]*c3 = 0  =>  c2 = -rref[1,2]*c3
r = np.array(rref.tolist(), dtype=float)
c3 = 1.0
c1 = -r[0, 2] * c3
c2 = -r[1, 2] * c3

print(f"\\nWith c3=1: c1={c1:.4f}, c2={c2:.4f}, c3={c3:.4f}")
check = c1*v1 + c2*v2 + c3*v3
print(f"c1*v1 + c2*v2 + c3*v3 = {check}  (should be zeros)")
print(f"\\nDependence relation: {c3:.0f}*v3 = {-c1:.0f}*v1 + {c2:.0f}*v2")
print(f"i.e.  v3 = 2*v1 - 1*v2  (confirmed)")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Test three vectors for independence',
              difficulty: 'medium',
              prompt: 'Given v1=[1,2,1], v2=[2,1,3], v3=[1,-1,2], determine whether the set is linearly independent using the rank test. If dependent, find the explicit dependence relation.',
              code: `import numpy as np
import sympy

v1 = np.array([1., 2., 1.])
v2 = np.array([2., 1., 3.])
v3 = np.array([1., -1., 2.])

# Build matrix with v1, v2, v3 as columns
# Compute rank
# If dependent, use RREF to find the relation
`,
              hint: 'A = np.column_stack([v1, v2, v3]). Then sympy.Matrix(A).rref() gives pivots. If rank < 3, use the RREF to read off the free-variable solution.',
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Linear Independence in OpenMAT / MATLAB',
        mathBridge: 'MATLAB\'s `rank()`, `det()`, and `null()` each test independence from a different angle. `null(A)` returns the nullspace — if the nullspace is just {0}, the columns are independent.',
        caption: 'Three equivalent MATLAB approaches to test independence.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Rank test — the universal check',
              prose: [
                '`A = [v1, v2, v3]` in MATLAB stacks the column vectors side-by-side into a matrix. The semicolons inside each vector create column vectors (multiple rows, one column). The comma between vectors concatenates them horizontally into the matrix.',
                '`rank(A)` counts independent columns via SVD. Comparing `rank(A) == size(A, 2)` (number of columns) gives the verdict: equal means independent, less means dependent. `size(A, 2)` is more robust than a hard-coded constant because it works even if you add or remove vectors.',
                'Notice that `A_dep` uses `w3 = w1 + w2`, making the third column equal to the sum of the first two. MATLAB detects this immediately: `rank = 2 < 3`.',
              ],
              code: `% Independent set: standard basis in R^3
v1 = [1; 0; 0];
v2 = [0; 1; 0];
v3 = [0; 0; 1];
A_ind = [v1, v2, v3];
r_ind = rank(A_ind);
fprintf('Independent set: rank = %d (= %d cols) => %s\\n', ...
    r_ind, size(A_ind,2), ternary(r_ind==size(A_ind,2), 'INDEPENDENT', 'DEPENDENT'))

% Dependent set: w3 = w1 + w2
w1 = [1; 0; 0];
w2 = [0; 1; 0];
w3 = w1 + w2;   % lies in span of w1 and w2
A_dep = [w1, w2, w3];
r_dep = rank(A_dep);
fprintf('Dependent set:   rank = %d (< %d cols) => %s\\n', ...
    r_dep, size(A_dep,2), ternary(r_dep==size(A_dep,2), 'INDEPENDENT', 'DEPENDENT'))

function s = ternary(cond, a, b)
  if cond; s = a; else; s = b; end
end`,
            },
            {
              id: 2,
              cellTitle: 'Determinant test — fastest for square sets',
              prose: [
                '`det(A)` computes the determinant of a square matrix. Geometrically, $|\\det(A)|$ is the volume of the parallelepiped formed by the column vectors. Dependent vectors collapse that shape to zero volume.',
                'The condition `abs(det(A)) < 1e-10` (rather than `det(A) == 0`) handles floating-point rounding: computed determinants are never exactly zero for dependent matrices with real data.',
                'The printed 2D case demonstrates the geometry: $[2,1]^T$ and $[4,2]^T$ both lie along the direction $[2,1]^T$. The parallelogram they span has zero area. det = 0 catches this instantly — no row reduction needed.',
              ],
              code: `% 2x2 examples
A_ind2 = [[1; 0], [0; 1]];        % standard basis in R^2
A_dep2 = [[2; 1], [4; 2]];        % [4;2] = 2*[2;1]

fprintf('2x2 standard basis: det = %.4f => %s\\n', det(A_ind2), check_det(det(A_ind2)))
fprintf('2x2 proportional:   det = %.4f => %s\\n', det(A_dep2), check_det(det(A_dep2)))

% 3x3 examples
A_ind3 = [[1;0;0], [0;1;0], [0;0;1]];
A_dep3 = [[1;2;3], [4;5;6], [7;8;9]];   % arithmetic progression -- rank 2

fprintf('3x3 identity:             det = %.4f => %s\\n', det(A_ind3), check_det(det(A_ind3)))
fprintf('3x3 arith. progression:   det = %.6f => %s\\n', det(A_dep3), check_det(det(A_dep3)))

function s = check_det(d)
  if abs(d) > 1e-10; s = 'INDEPENDENT'; else; s = 'DEPENDENT'; end
end`,
            },
            {
              id: 3,
              cellTitle: 'Nullspace test and explicit dependence relation',
              prose: [
                '`null(A)` returns an orthonormal basis for the **nullspace** of $A$ — the set of all $\\mathbf{c}$ such that $A\\mathbf{c} = \\mathbf{0}$. If the nullspace contains only the zero vector, the columns are independent. If the nullspace is non-trivial, its basis vectors give the dependence relations.',
                'Each column of `null(A)` is a unit vector in the nullspace. Multiply it by $A$ — you get the zero vector (up to floating-point rounding). This column is the coefficient vector $[c_1, c_2, c_3]^T$ proving dependence: $c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + c_3\\mathbf{v}_3 = \\mathbf{0}$.',
                'After scaling the nullspace vector to make one entry equal to $\\pm 1$, you can read off "v3 = (ratio)*v1 + (ratio)*v2" directly. This is exactly what RREF gives — just computed via SVD instead.',
              ],
              code: `% Dependent set: v3 = 2*v1 - v2
v1 = [1; 2; 3];
v2 = [4; 5; 6];
v3 = 2*v1 - v2;   % = [-2; -1; 0]
A = [v1, v2, v3];

fprintf('rank(A) = %d  (should be 2 -> dependent)\\n', rank(A))

% Compute the nullspace
N = null(A);
fprintf('null(A) dimension = %d column(s)\\n', size(N, 2))
fprintf('Nullspace vector (unscaled): [%.4f; %.4f; %.4f]\\n', N(1), N(2), N(3))

% Scale so that c3 = 1 (divide by N(3))
c = N / N(3);
fprintf('Scaled to c3=1: c = [%.4f; %.4f; %.4f]\\n', c(1), c(2), c(3))
fprintf('Relation: %.4f*v1 + %.4f*v2 + 1*v3 = 0\\n', c(1), c(2))
fprintf('i.e.  v3 = %.4f*v1 + %.4f*v2\\n', -c(1), -c(2))

% Verify
check = c(1)*v1 + c(2)*v2 + c(3)*v3;
fprintf('Verify c1*v1+c2*v2+c3*v3 = [%.2e; %.2e; %.2e]  (machine zero)\\n', check(1), check(2), check(3))`,
            },
            {
              id: 4,
              cellTitle: 'Application: Checking sensor redundancy in a control system',
              prose: [
                'A control system has three accelerometer sensors mounted to a robot. Their measurement directions are represented as vectors in the sensor\'s coordinate frame. If two sensors are measuring the same direction, their readings are redundant — any failure in one can be reconstructed from the other. Independence tells you whether you have truly distinct information channels.',
                '`rank(sensor_matrix)` counts how many independent measurement directions exist. If `rank < 3`, the sensor array cannot observe all three spatial degrees of freedom — critical for fault detection. A full-rank sensor array means any single sensor failure can be detected (you can compare readings against what the independent sensors predict).',
                'This is exactly the problem GPS satellite geometry solves: "Do these $k$ satellites provide independent measurements of position?" The answer is a rank check on the geometry matrix.',
              ],
              code: `% Three sensor direction vectors (normalized)
s1 = [1; 0; 0] / norm([1; 0; 0]);         % x-axis sensor
s2 = [0; 1; 0] / norm([0; 1; 0]);         % y-axis sensor
s3_good = [0; 0; 1];                       % z-axis -- independent
s3_bad  = [1; 1; 0] / norm([1; 1; 0]);    % diagonal -- might be dependent

S_good = [s1, s2, s3_good];
S_bad  = [s1, s2, s3_bad];

r_good = rank(S_good);
r_bad  = rank(S_bad);

fprintf('3 orthogonal sensors: rank = %d / 3 => ', r_good)
if r_good == 3
  fprintf('Full observability -- no redundancy\\n')
else
  fprintf('REDUNDANT sensor -- blind spot in measurement\\n')
end

fprintf('Diagonal 3rd sensor: rank = %d / 3 => ', r_bad)
if r_bad == 3
  fprintf('Full observability -- all directions covered\\n')
else
  fprintf('REDUNDANT -- s3 lies in span(s1,s2), blind to z-axis\\n')
end

fprintf('\\nConclusion: a sensor in the xy-plane adds NO z-axis information.\\n')
fprintf('Minimum for 3D observability: 3 linearly independent sensors.\\n')`,
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**The nullspace connection.** The linear independence test is precisely asking whether the **nullspace** $\\text{Null}(A) = \\{\\mathbf{c} \\in \\mathbb{R}^k : A\\mathbf{c} = \\mathbf{0}\\}$ is trivial. Columns of $A$ are independent iff $\\text{Null}(A) = \\{\\mathbf{0}\\}$. Equivalently, $A$ has full column rank ($\\text{rank}(A) = k$). This connects independence directly to the rank-nullity theorem: $\\text{rank}(A) + \\text{nullity}(A) = k$, so independence ($\\text{nullity} = 0$) forces $\\text{rank} = k$.',
      '**Independence in abstract vector spaces.** The definition extends beyond $\\mathbb{R}^n$. In the polynomial space $P_2$, the set $\\{1, t, t^2\\}$ is independent because $c_0 \\cdot 1 + c_1 \\cdot t + c_2 \\cdot t^2 = 0$ (as a polynomial, identically zero) forces all $c_i = 0$. The Wronskian test provides a practical criterion: if $W(f_1, \\ldots, f_k)(x_0) \\neq 0$ at any point $x_0$, the functions are independent.',
      '**The Wronskian.** For $k$ smooth functions $f_1, \\ldots, f_k$, the Wronskian is the determinant of the matrix whose $j$-th row is the $(j-1)$-th derivative:\n\n$$W(f_1, \\ldots, f_k)(x) = \\det \\begin{pmatrix} f_1 & f_2 & \\cdots & f_k \\\\ f_1^\\prime & f_2^\\prime & \\cdots & f_k^\\prime \\\\ \\vdots & & \\ddots & \\vdots \\\\ f_1^{(k-1)} & f_2^{(k-1)} & \\cdots & f_k^{(k-1)} \\end{pmatrix}$$\n\nIf $W(x_0) \\neq 0$ at some $x_0$, the functions are linearly independent.',
      '**Invariance under row operations.** Independence of the columns of $A$ is NOT changed by row operations. Row operations on $A$ correspond to multiplying on the left by elementary matrices, which does not change the nullspace. This is why RREF correctly determines independence even though the row-reduced form looks completely different from the original.',
      '**Dimension theorem for $\\mathbb{R}^n$.** No set of more than $n$ vectors in $\\mathbb{R}^n$ can be independent — this follows from the rank bound $\\text{rank}(A) \\leq \\min(m, n)$ for an $m \\times n$ matrix. Conversely, any $n$ independent vectors in $\\mathbb{R}^n$ automatically span it — they form a basis.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Rank-Nullity and Independence',
        body: 'For $A \\in \\mathbb{R}^{n \\times k}$:\n$$\\text{rank}(A) + \\text{nullity}(A) = k$$\nThe columns are linearly independent iff $\\text{nullity}(A) = 0$ iff $\\text{rank}(A) = k$ iff $A\\mathbf{c} = \\mathbf{0}$ has only the trivial solution.',
      },
      {
        type: 'theorem',
        title: 'Dimension Ceiling',
        body: 'In $\\mathbb{R}^n$:\n1. Any $k > n$ vectors are automatically **dependent** — there are not enough independent directions.\n2. Any $n$ **independent** vectors automatically **span** $\\mathbb{R}^n$ — you do not need to check spanning separately.\n3. Any $n$ **spanning** vectors are automatically **independent**.',
      },
      {
        type: 'insight',
        title: 'Row Operations Preserve Column Independence',
        body: 'Multiplying $A$ on the left by any invertible matrix $E$ gives $EA$, which has the same nullspace as $A$. Therefore $A$ and $EA$ have identical column independence. Row reduction is applying a sequence of invertible elementary matrices — it is safe to test independence via RREF.',
      },
      {
        type: 'warning',
        title: 'Wronskian = 0 Does NOT Imply Dependence',
        body: 'The converse of the Wronskian theorem is false for general functions. $W(f_1, \\ldots, f_k)(x) = 0$ for all $x$ does NOT guarantee dependence — there exist pathological independent functions whose Wronskian vanishes identically. The Wronskian test is only reliable for solutions of a linear ODE.',
      },
    ],
    visualizations: [
      {
        id: 'LinearDependenceViz',
        title: 'Nullspace Geometry: Where the Dependence Lives',
        mathBridge: 'For an independent set, the only vector $\\mathbf{c}$ satisfying $A\\mathbf{c} = \\mathbf{0}$ is $\\mathbf{c} = \\mathbf{0}$ — the nullspace is a single point (the origin). For a dependent set, the nullspace is a full line through the origin (or a higher-dimensional subspace) — every point on that line gives a valid non-trivial combination summing to zero. The visualization shows this nullspace directly as you drag vectors to different positions: when vectors become parallel, the nullspace "inflates" from a point to a line.',
        caption: 'Independent: nullspace = {0}. Dependent: nullspace is a line (or more).',
      },
    ],
  },

  examples: [
    {
      id: 'la1-007-ex1',
      title: 'Two Independent 2D Vectors',
      problem: 'Show that $\\mathbf{v}_1 = \\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix}$ and $\\mathbf{v}_2 = \\begin{bmatrix} 2 \\\\ 5 \\end{bmatrix}$ are linearly independent.',
      steps: [
        {
          expression: 'c_1 \\begin{bmatrix} 1 \\\\ 3 \\end{bmatrix} + c_2 \\begin{bmatrix} 2 \\\\ 5 \\end{bmatrix} = \\begin{bmatrix} 0 \\\\ 0 \\end{bmatrix}',
          annotation: 'Set up the independence test. We ask: can a linear combination of these two vectors equal the zero vector using scalars not both zero?',
          strategyTitle: 'Step 1: Set up the zero-sum equation',
          hints: ['Write out the combination equal to zero. This gives us a 2×2 homogeneous system to solve.'],
        },
        {
          expression: '\\begin{cases} c_1 + 2c_2 = 0 \\\\ 3c_1 + 5c_2 = 0 \\end{cases}',
          annotation: 'Match each component: top row gives $c_1 + 2c_2 = 0$ and bottom row gives $3c_1 + 5c_2 = 0$.',
          strategyTitle: 'Step 2: Extract the system',
          hints: ['Each component of the vector equation gives one scalar equation. Two vectors = two equations.'],
        },
        {
          expression: 'R_2 - 3R_1: \\quad (5 - 6)c_2 = 0 \\Rightarrow -c_2 = 0 \\Rightarrow c_2 = 0 \\Rightarrow c_1 = 0',
          annotation: 'Eliminate $c_1$ by subtracting $3 \\times$ Row 1 from Row 2. The single remaining equation forces $c_2 = 0$, then back-substitution gives $c_1 = 0$.',
          strategyTitle: 'Step 3: Solve by elimination',
          hints: ['The determinant $\\det\\begin{bmatrix}1&2\\\\3&5\\end{bmatrix} = 5 - 6 = -1 \\neq 0$ tells you immediately that only the trivial solution exists.'],
        },
        {
          expression: 'c_1 = c_2 = 0 \\Rightarrow \\text{Linearly INDEPENDENT}',
          annotation: 'Only the trivial solution exists. The vectors are independent. They span all of $\\mathbb{R}^2$ and form a basis.',
          strategyTitle: 'Step 4: Conclude',
          hints: ['Equivalently: $5/1 \\neq 3/2$ (component ratios differ), so $\\mathbf{v}_2$ is not a scalar multiple of $\\mathbf{v}_1$.'],
        },
      ],
      conclusion: 'Independent. The non-zero determinant ($-1$) confirms it in one step. These two vectors span all of $\\mathbb{R}^2$.',
    },
    {
      id: 'la1-007-ex2',
      title: 'Two Dependent 2D Vectors — Finding the Relation',
      problem: 'Show that $\\mathbf{u} = \\begin{bmatrix} 6 \\\\ -4 \\end{bmatrix}$ and $\\mathbf{w} = \\begin{bmatrix} -9 \\\\ 6 \\end{bmatrix}$ are linearly dependent, and state the explicit dependence relation.',
      steps: [
        {
          expression: '\\frac{-9}{6} = -\\frac{3}{2}, \\quad \\frac{6}{-4} = -\\frac{3}{2}',
          annotation: 'Quick ratio check: divide each component of $\\mathbf{w}$ by the corresponding component of $\\mathbf{u}$. Both ratios equal $-3/2$, so $\\mathbf{w} = (-3/2)\\mathbf{u}$. Dependence is immediate.',
          strategyTitle: 'Step 1: Check component ratios (shortcut for 2 vectors)',
          hints: ['If ALL component ratios are equal, the vectors are scalar multiples of each other — always dependent.'],
        },
        {
          expression: '\\mathbf{w} = -\\tfrac{3}{2}\\mathbf{u} \\quad \\Longleftrightarrow \\quad \\tfrac{3}{2}\\mathbf{u} + \\mathbf{w} = \\mathbf{0}',
          annotation: 'Express the proportionality and rearrange to the standard zero-sum form. The scalars $c_1 = 3/2$ and $c_2 = 1$ are not both zero — confirming dependence.',
          strategyTitle: 'Step 2: State the dependence relation',
          hints: ['The relation $c_1\\mathbf{u} + c_2\\mathbf{w} = \\mathbf{0}$ with $c_1 = 3/2 \\neq 0$ is the non-trivial solution that proves dependence.'],
        },
        {
          expression: '\\text{span}(\\mathbf{u}, \\mathbf{w}) = \\text{span}(\\mathbf{u}) = \\{t[6,-4]^T : t \\in \\mathbb{R}\\}',
          annotation: 'Since $\\mathbf{w}$ is a multiple of $\\mathbf{u}$, the span is just the 1D line through $[6,-4]^T$. Adding $\\mathbf{w}$ contributes no new direction.',
          strategyTitle: 'Step 3: Describe the span',
          hints: ['Geometric consequence: two dependent 2D vectors are always collinear — their span is a line through the origin, not the full plane.'],
        },
      ],
      conclusion: 'Dependent. $\\mathbf{w} = -\\frac{3}{2}\\mathbf{u}$ — they are anti-parallel scalar multiples. Their span is a single 1D line, not the plane.',
    },
    {
      id: 'la1-007-ex3',
      title: 'Three 3D Vectors — Using RREF',
      problem: 'Are $\\mathbf{a} = [1, 2, 3]^T$, $\\mathbf{b} = [0, 1, 2]^T$, $\\mathbf{c} = [2, 3, 4]^T$ linearly independent?',
      steps: [
        {
          expression: 'A = \\begin{bmatrix} 1 & 0 & 2 \\\\ 2 & 1 & 3 \\\\ 3 & 2 & 4 \\end{bmatrix}',
          annotation: 'Form the $3 \\times 3$ matrix with $\\mathbf{a}, \\mathbf{b}, \\mathbf{c}$ as columns. The independence test is $A\\mathbf{x} = \\mathbf{0}$.',
          strategyTitle: 'Step 1: Build the matrix',
          hints: ['Each column = one vector. Three vectors in $\\mathbb{R}^3$ form a square matrix — we can also just compute the determinant.'],
        },
        {
          expression: '\\det(A) = 1(1\\cdot4 - 2\\cdot3) - 0 + 2(2\\cdot2 - 1\\cdot3) = 1(-2) + 2(1) = 0',
          annotation: 'Cofactor expansion along the first row. The determinant is exactly 0 — so the columns are dependent.',
          strategyTitle: 'Step 2: Compute the determinant',
          hints: ['$\\det = 0$ means the parallelopiped spanned by $\\mathbf{a}$, $\\mathbf{b}$, $\\mathbf{c}$ has zero volume — they are coplanar.'],
        },
        {
          expression: '\\xrightarrow{R_2-2R_1,\\;R_3-3R_1} \\begin{bmatrix} 1&0&2 \\\\ 0&1&-1 \\\\ 0&2&-2 \\end{bmatrix} \\xrightarrow{R_3-2R_2} \\begin{bmatrix} 1&0&2 \\\\ 0&1&-1 \\\\ 0&0&0 \\end{bmatrix}',
          annotation: 'Row-reduce to RREF. The zero row confirms rank = 2 < 3. Column 3 is non-pivot (free), so $\\mathbf{c}$ is dependent on $\\mathbf{a}$ and $\\mathbf{b}$.',
          strategyTitle: 'Step 3: Row-reduce to find the relation',
          hints: ['Free variable at column 3. Set $x_3 = 1$. RREF gives: $x_1 = -2$, $x_2 = 1$, $x_3 = 1$. So $-2\\mathbf{a} + 1\\mathbf{b} + 1\\mathbf{c} = \\mathbf{0}$.'],
        },
        {
          expression: '-2\\mathbf{a} + \\mathbf{b} + \\mathbf{c} = \\mathbf{0} \\quad \\Rightarrow \\quad \\mathbf{c} = 2\\mathbf{a} - \\mathbf{b}',
          annotation: 'The explicit dependence relation: $\\mathbf{c} = 2\\mathbf{a} - \\mathbf{b}$. Verify: $2[1,2,3]^T - [0,1,2]^T = [2,3,4]^T = \\mathbf{c}$ ✓',
          strategyTitle: 'Step 4: State the dependence relation',
          hints: ['Always verify: substitute back and check component-by-component.'],
        },
      ],
      conclusion: 'Dependent. $\\det(A) = 0$ (or equivalently $\\text{rank} = 2 < 3$). The explicit relation is $\\mathbf{c} = 2\\mathbf{a} - \\mathbf{b}$. The three vectors span only a 2D plane in $\\mathbb{R}^3$.',
    },
    {
      id: 'la1-007-ex4',
      title: 'More Vectors Than Dimensions — Automatic Dependence',
      problem: 'Four vectors in $\\mathbb{R}^3$: $\\mathbf{p} = [1,0,0]^T$, $\\mathbf{q} = [0,1,0]^T$, $\\mathbf{r} = [0,0,1]^T$, $\\mathbf{s} = [2,3,-1]^T$. Are they independent?',
      steps: [
        {
          expression: 'k = 4 > n = 3 \\Rightarrow \\text{automatically DEPENDENT}',
          annotation: 'We have 4 vectors in $\\mathbb{R}^3$. By the dimension ceiling theorem, any set of more than $n$ vectors in $\\mathbb{R}^n$ must be dependent — no computation needed.',
          strategyTitle: 'Step 1: Count before computing',
          hints: ['This is the most important shortcut in independence testing: count first. If $k > n$, stop — they are dependent.'],
        },
        {
          expression: '\\mathbf{s} = 2\\mathbf{p} + 3\\mathbf{q} - 1\\mathbf{r} = 2[1,0,0]^T + 3[0,1,0]^T - [0,0,1]^T',
          annotation: 'Since $\\{\\mathbf{p}, \\mathbf{q}, \\mathbf{r}\\}$ is the standard basis and already spans all of $\\mathbb{R}^3$, any fourth vector — including $\\mathbf{s}$ — is already in their span.',
          strategyTitle: 'Step 2: Exhibit the explicit relation',
          hints: ['Once the first three vectors form a basis, ANY fourth vector is a combination of them. The coefficients are just the coordinates of $\\mathbf{s}$ in the standard basis: $(2, 3, -1)$.'],
        },
        {
          expression: '2\\mathbf{p} + 3\\mathbf{q} - \\mathbf{r} - \\mathbf{s} = \\mathbf{0}',
          annotation: 'Rearranging to the zero-sum form confirms the non-trivial solution $(2, 3, -1, -1)$ — all four coefficients are specified, none are zero, and the combination equals $\\mathbf{0}$.',
          strategyTitle: 'Step 3: Write the zero-sum form',
          hints: ['Verify: $2[1,0,0]+3[0,1,0]-[0,0,1]-[2,3,-1] = [2,3,-1]-[2,3,-1] = [0,0,0]$ ✓'],
        },
      ],
      conclusion: 'Dependent — automatically, because $k = 4 > n = 3$. The explicit relation is $\\mathbf{s} = 2\\mathbf{p} + 3\\mathbf{q} - \\mathbf{r}$. The first three vectors already span all of $\\mathbb{R}^3$; adding $\\mathbf{s}$ adds nothing.',
    },
  ],

  // ── Walkthroughs ───────────────────────────────────────────────────────────
  walkthroughs: [
    {
      id: 'wt-la1-007-det-test',
      title: 'The Determinant Shortcut for Two Vectors in $\\mathbb{R}^2$',
      prereqs: ['2×2 determinant', 'Definition of linear independence'],
      problem: 'Are $\\mathbf{u} = [3, 1]^\\top$ and $\\mathbf{v} = [6, 2]^\\top$ linearly independent?',
      steps: [
        {
          label: 'First, look at the vectors geometrically',
          strategy: 'Visual inspection often reveals dependence instantly — before any computation.',
          explanation: 'Is $\\mathbf{v}$ a scalar multiple of $\\mathbf{u}$? Check component ratios: $6/3 = 2$ and $2/1 = 2$. Both ratios are equal, so $\\mathbf{v} = 2\\mathbf{u}$. The vectors lie on the same line through the origin — they are parallel.',
          math: '\\mathbf{v} = 2\\mathbf{u}',
          gotcha: 'Parallel vectors are ALWAYS linearly dependent — one is just a scaled copy of the other and adds no new direction.',
        },
        {
          label: 'Confirm with the determinant: form the $2\\times 2$ matrix',
          strategy: 'Place $\\mathbf{u}$ and $\\mathbf{v}$ as columns (or rows). The determinant is the signed area of the parallelogram they span.',
          explanation: 'The matrix with columns $\\mathbf{u}$ and $\\mathbf{v}$: $\\begin{bmatrix}3&6\\\\1&2\\end{bmatrix}$. The determinant is $ad - bc$.',
          math: '\\det\\begin{bmatrix}3&6\\\\1&2\\end{bmatrix} = (3)(2) - (6)(1) = 6 - 6 = 0',
        },
        {
          label: 'Interpret: determinant zero means the parallelogram has collapsed to a line',
          strategy: '$\\det = 0 \\iff$ the columns are linearly dependent.',
          explanation: 'A non-zero determinant means the two vectors span a non-degenerate parallelogram — they point in different enough directions to cover area. A zero determinant means the parallelogram has collapsed to a line segment: both vectors lie on the same line through the origin.',
          math: '\\det(A) = 0 \\iff \\{\\mathbf{u}, \\mathbf{v}\\} \\text{ linearly dependent}',
        },
        {
          label: 'Contrast: what does an independent pair look like?',
          strategy: 'Compare with $\\mathbf{w} = [3, 2]^\\top$ to build intuition for the independent case.',
          explanation: 'Replace $\\mathbf{v}$ with $\\mathbf{w} = [3, 2]^\\top$. The component ratio is $2/1 \\neq 3/3$, so they are not parallel. The determinant: $(3)(2) - (3)(1) = 6 - 3 = 3 \\neq 0$. Non-zero determinant confirms they span a genuine parallelogram — they are linearly independent.',
          math: '\\det\\begin{bmatrix}3&3\\\\1&2\\end{bmatrix} = 3 \\neq 0 \\implies \\text{independent}',
        },
      ],
    },
    {
      id: 'wt-la1-007-rref-independence',
      title: 'Testing Independence in $\\mathbb{R}^3$ by Row Reduction',
      prereqs: ['RREF', 'Pivot columns', 'Rank'],
      problem: 'Are $\\mathbf{a} = [1, 2, 3]^\\top$, $\\mathbf{b} = [2, 4, 7]^\\top$, and $\\mathbf{c} = [1, 0, 1]^\\top$ linearly independent?',
      steps: [
        {
          label: 'Form the matrix with the vectors as columns',
          strategy: 'Place each vector as a column — row-reducing this matrix reveals the rank and thus the number of independent vectors.',
          explanation: 'Three vectors in $\\mathbb{R}^3$. If the rank equals 3 (all three pivots), they are independent. If rank is less than 3, some vector lies in the span of the others.',
          math: 'A = \\begin{bmatrix}1&2&1\\\\2&4&0\\\\3&7&1\\end{bmatrix}',
        },
        {
          label: 'Forward elimination: clear column 1 below the first pivot',
          strategy: 'Use $R_1$ to eliminate the leading entries in $R_2$ and $R_3$.',
          explanation: '$R_2 \\leftarrow R_2 - 2R_1$: $(0, 0, -2)$. $R_3 \\leftarrow R_3 - 3R_1$: $(0, 1, -2)$.',
          math: '\\begin{bmatrix}1&2&1\\\\0&0&-2\\\\0&1&-2\\end{bmatrix}',
        },
        {
          label: 'Swap rows 2 and 3 to bring a non-zero pivot to column 2',
          strategy: 'When the current pivot position is zero, look below for a non-zero entry and swap.',
          explanation: 'Row 2 has a zero in column 2 but row 3 has a 1 there. Swap: $R_2 \\leftrightarrow R_3$.',
          math: '\\begin{bmatrix}1&2&1\\\\0&1&-2\\\\0&0&-2\\end{bmatrix}',
        },
        {
          label: 'Count the pivots',
          strategy: 'The number of pivots equals the rank — compare to the number of vectors.',
          explanation: 'The matrix now has pivots in columns 1, 2, and 3 — rank 3. Three vectors, three pivots. Rank equals the number of vectors, so they are linearly independent.',
          math: '\\text{rank}(A) = 3 = \\text{number of vectors} \\implies \\text{independent}',
        },
        {
          label: 'What would dependence look like? The contrast case.',
          strategy: 'Replace $\\mathbf{b}$ with $2\\mathbf{a}$ and see how the row reduction exposes the relationship.',
          explanation: 'If $\\mathbf{b} = [2, 4, 6]^\\top = 2\\mathbf{a}$, then $R_2 \\leftarrow R_2 - 2R_1$ gives $(0, 0, -2) \\to (0, 0, 0)$ — a zero row. The rank drops to 2. RREF would show a free variable in column 2, and the dependency relation $2\\mathbf{a} - \\mathbf{b} = \\mathbf{0}$ becomes visible.',
          math: '\\mathbf{b} = 2\\mathbf{a} \\implies \\text{rank} = 2 < 3 \\implies \\text{dependent}',
        },
      ],
    },
  ],

  challenges: [
    {
      id: 'la1-007-ch1',
      difficulty: 'easy',
      problem: 'Are $[2, -1]^T$ and $[-6, 3]^T$ linearly independent?',
      hint: 'Check if one is a scalar multiple of the other by looking at component ratios.',
      walkthrough: [
        { expression: '-6/2 = -3, \\quad 3/(-1) = -3', annotation: 'Both component ratios equal $-3$, so $[-6,3]^T = -3 \\cdot [2,-1]^T$. One is a scalar multiple of the other.' },
        { expression: '3[2,-1]^T + 1 \\cdot [-6,3]^T = [6-6, -3+3]^T = [0,0]^T', annotation: 'Exhibit the non-trivial zero combination: scalars $(3, 1)$ — not both zero — prove dependence.' },
        { expression: '\\Rightarrow \\text{Linearly DEPENDENT}', annotation: 'The two vectors are anti-parallel scalar multiples. Span = 1D line through $[2,-1]^T$.' },
      ],
      answer: 'Linearly dependent — $[-6,3]^T = -3[2,-1]^T$.',
    },
    {
      id: 'la1-007-ch2',
      difficulty: 'medium',
      problem: 'Determine whether $\\mathbf{v}_1 = [1,1,0]^T$, $\\mathbf{v}_2 = [0,1,1]^T$, $\\mathbf{v}_3 = [1,0,1]^T$ are linearly independent. If so, do they span $\\mathbb{R}^3$?',
      hint: 'Form the $3\\times 3$ matrix and compute its determinant. If $\\det \\neq 0$, they are independent and span $\\mathbb{R}^3$.',
      walkthrough: [
        { expression: 'A = \\begin{bmatrix}1&0&1\\\\1&1&0\\\\0&1&1\\end{bmatrix}, \\quad \\det(A) = 1(1-0) - 0 + 1(1-0) = 2', annotation: 'Cofactor expansion along row 1: $1 \\cdot \\det\\begin{bmatrix}1&0\\\\1&1\\end{bmatrix} + 1 \\cdot \\det\\begin{bmatrix}1&1\\\\0&1\\end{bmatrix} = 1+1 = 2$.' },
        { expression: '\\det(A) = 2 \\neq 0 \\Rightarrow \\text{rank}(A) = 3', annotation: 'Non-zero determinant confirms full rank — three independent directions.' },
        { expression: '\\text{rank} = 3 = \\dim(\\mathbb{R}^3) \\Rightarrow \\text{spans } \\mathbb{R}^3', annotation: 'Three independent vectors in $\\mathbb{R}^3$ automatically span the full space. They form a valid basis.' },
      ],
      answer: 'Linearly independent ($\\det = 2 \\neq 0$). They span $\\mathbb{R}^3$ and form a basis.',
    },
    {
      id: 'la1-007-ch3',
      difficulty: 'hard',
      problem: 'Find all values of $h$ such that $\\mathbf{v}_1 = [1, h]^T$ and $\\mathbf{v}_2 = [3, 6]^T$ are linearly dependent.',
      hint: 'For dependence, we need $\\det\\begin{bmatrix}1&3\\\\h&6\\end{bmatrix} = 0$. Solve for $h$.',
      walkthrough: [
        { expression: '\\det \\begin{bmatrix} 1 & 3 \\\\ h & 6 \\end{bmatrix} = 6 - 3h', annotation: 'Compute the $2\\times2$ determinant: $ad - bc = 1\\cdot6 - 3\\cdot h = 6 - 3h$.' },
        { expression: '6 - 3h = 0 \\Rightarrow h = 2', annotation: 'Set the determinant to zero (condition for dependence) and solve: $h = 2$.' },
        { expression: 'h=2: \\mathbf{v}_1=[1,2]^T, \\;\\mathbf{v}_2=[3,6]^T=3[1,2]^T \\checkmark', annotation: 'Verify: with $h=2$, indeed $\\mathbf{v}_2 = 3\\mathbf{v}_1$. For any other $h$, the vectors are independent.' },
      ],
      answer: '$h = 2$ is the only value making them dependent. For all $h \\neq 2$, the vectors are independent.',
    },
  ],

  formulas: [
    {
      latex: 'c_1\\mathbf{v}_1 + c_2\\mathbf{v}_2 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}',
      description: 'Independence test equation. If the only solution is all $c_i = 0$, the set is independent; any non-zero solution proves dependence.',
      variables: [
        { symbol: 'c_i', description: 'Scalar coefficients to solve for' },
        { symbol: '\\mathbf{v}_i', description: 'Vectors being tested' },
        { symbol: '\\mathbf{0}', description: 'The zero vector' },
      ],
    },
    {
      latex: '\\text{rank}(A) = k',
      description: 'Rank test for independence: the $k$ column vectors of $A$ are independent iff the rank equals the number of columns.',
      variables: [
        { symbol: 'A', description: 'Matrix whose columns are the vectors being tested' },
        { symbol: 'k', description: 'Number of vectors (columns)' },
        { symbol: '\\text{rank}(A)', description: 'Number of pivot positions in RREF of $A$' },
      ],
    },
    {
      latex: '\\det(A) \\neq 0',
      description: 'Determinant test for independence (square matrices only): columns of $A$ are independent iff the determinant is non-zero.',
      variables: [
        { symbol: 'A', description: 'Square matrix whose columns are the $n$ vectors in $\\mathbb{R}^n$' },
        { symbol: '\\det(A)', description: 'Signed volume of the parallelepiped spanned by the columns' },
      ],
    },
    {
      latex: '\\text{rank}(A) + \\text{nullity}(A) = k',
      description: 'Rank-nullity theorem: the number of independent columns plus the dimension of the nullspace equals the number of columns.',
      variables: [
        { symbol: '\\text{rank}(A)', description: 'Number of independent columns' },
        { symbol: '\\text{nullity}(A)', description: 'Dimension of the nullspace = number of free variables = number of redundant vectors' },
        { symbol: 'k', description: 'Total number of columns' },
      ],
    },
    {
      latex: 'W(f_1,\\ldots,f_k)(x) = \\det \\begin{pmatrix} f_1 & \\cdots & f_k \\\\ f_1^\\prime & \\cdots & f_k^\\prime \\\\ \\vdots & & \\vdots \\\\ f_1^{(k-1)} & \\cdots & f_k^{(k-1)} \\end{pmatrix}',
      description: 'Wronskian: if non-zero at any point, the functions are linearly independent. Used for testing independence in function spaces.',
      variables: [
        { symbol: 'f_i', description: 'Smooth functions being tested' },
        { symbol: "f_i^{(j)}", description: '$j$-th derivative of $f_i$' },
        { symbol: 'W \\neq 0', description: 'Sufficient (not necessary) condition for independence' },
      ],
    },
  ],

  semantics: {
    core: [
      { symbol: 'c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$, only $c_i=0', meaning: 'Linear independence: the zero combination is the ONLY combination that gives zero. Every vector points in a genuinely new direction.' },
      { symbol: '\\text{rank}(A) < k', meaning: 'Linear dependence: fewer pivots than vectors means at least one vector is a combination of the others (it lies in the span of the pivot columns).' },
      { symbol: '\\text{nullity}(A) > 0', meaning: 'Non-trivial nullspace: there are non-zero coefficient vectors $\\mathbf{c}$ that kill $A$. Each basis vector of the nullspace encodes one dependence relation.' },
      { symbol: '\\det(A) = 0', meaning: 'Zero determinant (square case): the columns are dependent, the parallelepiped they span has zero volume, the matrix is singular.' },
      { symbol: 'k > n', meaning: 'Automatic dependence: you can never have more independent vectors than the dimension of the space.' },
    ],
    rulesOfThumb: [
      'Two vectors: check if they are scalar multiples of each other (compare component ratios). Takes seconds.',
      'More than two vectors: form a matrix and compute rank. If rank = number of vectors, independent.',
      'Square matrix (k = n): compute the determinant. Non-zero ↔ independent.',
      'If k > n: immediately dependent — no computation needed.',
      'Any set containing the zero vector is automatically dependent.',
      'Pivot columns of a matrix are always independent; non-pivot columns are always dependent combinations of pivot columns.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la1-002', label: 'Linear Combinations and Span', note: 'Independence is defined using the zero combination test — review the zero-sum test and span concept if anything here is unclear.' },
      { lessonId: 'la1-006', label: 'Gauss-Jordan RREF', note: 'Finding explicit dependence relations requires row-reducing the homogeneous system. Review RREF if the pivot/free-variable logic is fuzzy.' },
    ],
    futureLinks: [
      { lessonId: 'la2-001', label: 'Matrices as Transformations', note: 'A matrix is a collection of column vectors. When those columns are independent, the matrix transformation is injective (one-to-one) and invertible. The entire theory of matrix invertibility is independence in disguise.' },
      { lessonId: 'la2-004', label: 'Null Space and Column Space', note: 'The null space IS the set of all dependence relations. The column space is the span of the columns. Independence means null space = {0}, which means column space has maximum dimension.' },
      { lessonId: 'la3-001', label: 'Eigenvalues and Eigenvectors', note: 'Eigenvectors corresponding to distinct eigenvalues are always linearly independent — a theorem proved directly from the independence definition.' },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'la1-007-assess-1',
        type: 'choice',
        text: 'Vectors $[3, 9]^T$ and $[1, 3]^T$ are:',
        options: [
          'Linearly dependent — $[3,9]^T = 3[1,3]^T$',
          'Linearly independent — they have different magnitudes',
          'Linearly independent — neither is the zero vector',
          'Cannot be determined without computing the rank',
        ],
        answer: 'Linearly dependent — $[3,9]^T = 3[1,3]^T$',
        hints: ['Check component ratios: $3/1 = 3$ and $9/3 = 3$. Equal ratios → scalar multiples → dependent.'],
      },
      {
        id: 'la1-007-assess-2',
        type: 'choice',
        text: 'How many linearly independent vectors can exist in $\\mathbb{R}^4$?',
        options: ['At most 4', 'At most 3', 'Exactly 4', 'Infinitely many'],
        answer: 'At most 4',
        hints: ['The dimension ceiling: in $\\mathbb{R}^n$, any set of more than $n$ vectors is automatically dependent. So at most 4 in $\\mathbb{R}^4$.'],
      },
      {
        id: 'la1-007-assess-3',
        type: 'choice',
        text: 'If $\\text{rank}(A) = 3$ and $A$ has 5 columns, then:',
        options: [
          '2 columns are dependent on the pivot columns; nullity = 2',
          'All 5 columns are independent',
          '3 columns are dependent; nullity = 3',
          'The matrix cannot be row-reduced',
        ],
        answer: '2 columns are dependent on the pivot columns; nullity = 2',
        hints: ['Rank-nullity: $\\text{rank} + \\text{nullity} = k$, so $3 + \\text{nullity} = 5$, giving nullity = 2. The 2 non-pivot columns are dependent.'],
      },
    ],
  },

  mentalModel: [
    'Independent = every vector points somewhere none of the others can reach alone.',
    'Dependent = at least one vector is just a repackaged combination of the others — redundant.',
    'Rank = the number of truly independent directions in a set of vectors.',
    'Nullity = the number of hidden dependence relations (free variables in the homogeneous system).',
    'k > n = automatic dependence — the space is simply too small to hold k independent vectors.',
    'det ≠ 0 (square) = independent columns = invertible matrix = non-trivial nullspace does not exist.',
  ],

  checkpoints: [
    { id: 'cp-la1-007-1', label: 'Read: State the formal definition of linear independence', type: 'read' },
    { id: 'cp-la1-007-2', label: 'Read: Explain the rank test and when to use det vs. rank', type: 'read' },
    { id: 'cp-la1-007-3', label: 'Read: State the dimension ceiling theorem', type: 'read' },
    { id: 'cp-la1-007-4', label: 'Run: Python cell 1 — zero-sum test via RREF', type: 'lab' },
    { id: 'cp-la1-007-5', label: 'Run: Python cell 3 — determinant test', type: 'lab' },
    { id: 'cp-la1-007-6', label: 'Run: MATLAB cell — rank and nullspace tests', type: 'lab' },
    { id: 'cp-la1-007-7', label: 'Complete: Example 3 — 3D vectors via RREF', type: 'example' },
    { id: 'cp-la1-007-8', label: 'Attempt: Challenge 3 — parametric independence', type: 'challenge' },
  ],

  quiz: [
    {
      id: 'la1-007-quiz-1',
      type: 'choice',
      text: 'Which condition DEFINES linear independence for vectors $\\{\\mathbf{v}_1, \\ldots, \\mathbf{v}_k\\}$?',
      options: [
        '$c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$ implies all $c_i = 0$',
        'No two vectors are equal',
        'All vectors have different magnitudes',
        'The vectors span the entire space',
      ],
      answer: '$c_1\\mathbf{v}_1 + \\cdots + c_k\\mathbf{v}_k = \\mathbf{0}$ implies all $c_i = 0$',
      hints: ['Independence is defined by the zero-sum test. The other conditions are neither necessary nor sufficient.'],
      reviewSection: 'Math tab — Formal definition',
    },
    {
      id: 'la1-007-quiz-2',
      type: 'choice',
      text: 'A set containing the zero vector $\\mathbf{0}$ is always:',
      options: [
        'Linearly dependent',
        'Linearly independent if the other vectors are independent',
        'A basis',
        'Linearly independent if the zero vector appears only once',
      ],
      answer: 'Linearly dependent',
      hints: ['$1 \\cdot \\mathbf{0} + 0 \\cdot \\mathbf{v}_2 + \\cdots = \\mathbf{0}$ uses the non-zero scalar $c_1 = 1$. Any set with the zero vector is automatically dependent.'],
      reviewSection: 'Intuition — Zero vector callout',
    },
    {
      id: 'la1-007-quiz-3',
      type: 'choice',
      text: 'Matrix $A$ has 4 columns and $\\text{rank}(A) = 3$. The nullity is:',
      options: ['1', '0', '3', '4'],
      answer: '1',
      hints: ['Rank-nullity: $\\text{rank} + \\text{nullity} = k$ (number of columns). $3 + \\text{nullity} = 4 \\Rightarrow \\text{nullity} = 1$.'],
      reviewSection: 'Rigor — Rank-nullity theorem',
    },
    {
      id: 'la1-007-quiz-4',
      type: 'choice',
      text: 'Five vectors in $\\mathbb{R}^3$ are:',
      options: [
        'Always linearly dependent — $k=5 > n=3$',
        'Always linearly independent if they are all non-zero',
        'Independent if and only if they span $\\mathbb{R}^3$',
        'Independent if no two of them are equal',
      ],
      answer: 'Always linearly dependent — $k=5 > n=3$',
      hints: ['More vectors than dimensions means automatic dependence. No computation needed.'],
      reviewSection: 'Rigor — Dimension ceiling theorem',
    },
    {
      id: 'la1-007-quiz-5',
      type: 'choice',
      text: 'Which test is fastest for checking if 3 vectors in $\\mathbb{R}^3$ are independent?',
      options: [
        'Compute $\\det(A)$ — if non-zero, independent',
        'Try all pairs of vectors for proportionality',
        'Check that no vector is the zero vector',
        'Verify that the vectors span $\\mathbb{R}^3$',
      ],
      answer: 'Compute $\\det(A)$ — if non-zero, independent',
      hints: ['For square matrices ($k = n$), the determinant gives the answer in one calculation. Row reduction is not needed.'],
      reviewSection: 'Math — Determinant shortcut',
    },
    {
      id: 'la1-007-quiz-6',
      type: 'choice',
      text: 'If $A\\mathbf{c} = \\mathbf{0}$ has only the solution $\\mathbf{c} = \\mathbf{0}$, then the columns of $A$ are:',
      options: [
        'Linearly independent — the nullspace is trivial',
        'Linearly dependent — the system has a solution',
        'Spanning — the system has a unique solution',
        'A basis — the system is consistent',
      ],
      answer: 'Linearly independent — the nullspace is trivial',
      hints: ['Only the trivial solution to $A\\mathbf{c} = \\mathbf{0}$ means nullity = 0, which is exactly the definition of linear independence.'],
      reviewSection: 'Rigor — Nullspace connection',
    },
    {
      id: 'la1-007-quiz-7',
      type: 'choice',
      text: 'After row-reducing a matrix, which columns are linearly independent?',
      options: [
        'The pivot columns of the ORIGINAL matrix',
        'All columns of the RREF',
        'The zero columns of the RREF',
        'The non-pivot columns of the original matrix',
      ],
      answer: 'The pivot columns of the ORIGINAL matrix',
      hints: ['The pivot columns of the ORIGINAL matrix (not the reduced form) are independent. Row operations change the matrix but preserve independence relationships between columns.'],
      reviewSection: 'Math — Pivot columns callout',
    },
    {
      id: 'la1-007-quiz-8',
      type: 'choice',
      text: 'Vectors $\\mathbf{u}$ and $\\mathbf{v}$ satisfy $3\\mathbf{u} - 2\\mathbf{v} = \\mathbf{0}$. What can you conclude?',
      options: [
        'They are linearly dependent — a non-trivial zero combination exists',
        'They are linearly independent — the scalars are non-zero',
        'They are orthogonal — their combination is zero',
        'Nothing — more information is needed',
      ],
      answer: 'They are linearly dependent — a non-trivial zero combination exists',
      hints: ['$3\\mathbf{u} - 2\\mathbf{v} = \\mathbf{0}$ is exactly a non-trivial combination (scalars $3$ and $-2$ are not both zero) equaling the zero vector — the definition of dependence.'],
      reviewSection: 'Intuition — Non-trivial solution',
    },
    {
      id: 'la1-007-quiz-9',
      type: 'choice',
      text: 'The set $\\{\\sin x, \\cos x\\}$ in the function space $C[0, 2\\pi]$ is:',
      options: [
        'Linearly independent — no scalar multiple of $\\sin x$ ever equals $\\cos x$',
        'Linearly dependent — they are related by $\\sin^2 x + \\cos^2 x = 1$',
        'Linearly dependent — both are bounded functions',
        'Cannot be determined without the Wronskian',
      ],
      answer: 'Linearly independent — no scalar multiple of $\\sin x$ ever equals $\\cos x$',
      hints: ['If $c_1\\sin x + c_2\\cos x = 0$ for ALL $x$, evaluate at $x=0$: $c_2 = 0$. Evaluate at $x = \\pi/2$: $c_1 = 0$. Only the trivial solution works — independent. Note: the Pythagorean identity is not a linear relation between the functions.'],
      reviewSection: 'Rigor — Independence in function spaces',
    },
    {
      id: 'la1-007-quiz-10',
      type: 'choice',
      text: 'If $\\{\\mathbf{v}_1, \\mathbf{v}_2, \\mathbf{v}_3\\}$ is dependent, what can you conclude about $\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$?',
      options: [
        'Nothing — $\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ could be independent or dependent',
        '$\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ must also be dependent',
        '$\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ must be independent',
        'At least one of $\\mathbf{v}_1, \\mathbf{v}_2$ must be the zero vector',
      ],
      answer: 'Nothing — $\\{\\mathbf{v}_1, \\mathbf{v}_2\\}$ could be independent or dependent',
      hints: ['$\\mathbf{v}_3$ might be the redundant vector while $\\mathbf{v}_1$ and $\\mathbf{v}_2$ are independent. Or all three might be pairwise dependent. Both are possible — you need to test the subset directly.'],
      reviewSection: 'Math — Testing subsets',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'Vectors with different magnitudes (lengths) are always linearly independent.',
      whyStudentsThinkIt: 'Students confuse "different" with "independent." $[1,2]^T$ and $[100,200]^T$ look very different and have very different magnitudes, but $[100,200]^T = 100 \\cdot [1,2]^T$ — they are scalar multiples and therefore dependent.',
      correctionExample: '$[1,2]^T$ and $[-3,-6]^T$ have magnitudes $\\sqrt{5}$ and $3\\sqrt{5}$ — different — but $[-3,-6]^T = -3[1,2]^T$. Independence requires a genuinely different DIRECTION, not a different length.',
      contrastCase: '$[1,2]^T$ and $[2,1]^T$ have the same magnitude $\\sqrt{5}$ but ARE independent because neither is a scalar multiple of the other.',
    },
    {
      falseBelief: 'If a set is linearly dependent, ALL vectors in it are redundant.',
      whyStudentsThinkIt: 'Students read "dependent" as a global property of all vectors equally, rather than a statement about at least one being expressible from the others.',
      correctionExample: '$\\{[1,0]^T, [0,1]^T, [1,1]^T\\}$: the set is dependent ($[1,1]^T = [1,0]^T + [0,1]^T$), but $[1,0]^T$ and $[0,1]^T$ are individually independent and useful. Only $[1,1]^T$ is the redundant one here.',
      contrastCase: 'The pivot columns of a dependent set are always independent. Only the non-pivot columns are the redundant ones.',
    },
    {
      falseBelief: '$\\det(A) = 0$ proves dependence for any matrix.',
      whyStudentsThinkIt: 'Students over-generalize the determinant test, forgetting it only applies to square matrices.',
      correctionExample: 'A $3 \\times 2$ matrix (3D vectors, only 2 of them) has no determinant. You must use the rank test. The determinant of a non-square matrix is undefined.',
      contrastCase: 'For non-square $A$, use $\\text{rank}(A) < $ (number of columns) to test dependence — this always works regardless of shape.',
    },
    {
      falseBelief: 'Linearly independent vectors must be perpendicular (orthogonal).',
      whyStudentsThinkIt: 'The standard basis vectors $\\hat{\\mathbf{i}}, \\hat{\\mathbf{j}}, \\hat{\\mathbf{k}}$ are both independent AND perpendicular, so students assume independence requires perpendicularity.',
      correctionExample: '$[1,0]^T$ and $[1,1]^T$ are independent (det $= 1 \\neq 0$) but not perpendicular (dot product $= 1 \\neq 0$). Independence is about direction, not angles.',
      contrastCase: 'Perpendicular vectors are always independent (dot product = 0 rules out scalar multiples), but independence is a weaker condition — it only rules out proportionality, not just any non-zero angle.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A machine learning engineer has a dataset with 50 features (columns). She suspects some features are linear combinations of others, inflating the model complexity without adding predictive power. How does linear independence testing help?',
      competingTechniques: 'Manual feature inspection vs. rank/correlation analysis',
      whyThisTechniqueWins: 'Compute the rank of the feature matrix. If rank < 50, at least (50 - rank) features are linearly redundant — they add nullity-many dependence directions but zero new information. PCA exploits this: it finds the independent directions and discards the redundant ones, reducing 50 features to rank meaningful ones.',
    },
    {
      situation: 'A structural engineer is designing a truss bridge with 8 structural members. Each member resists load in its direction. How many members are actually needed before adding more provides no additional structural benefit?',
      competingTechniques: 'Trial-and-error load testing vs. independence analysis of member direction vectors',
      whyThisTechniqueWins: 'The structure operates in 3D, so at most 3 independent load directions exist. A rank-3 set of member directions provides complete structural support. Any additional members whose direction vectors are in the span of the existing 3 add weight and cost without adding new load-bearing capacity — testable via rank before a single bolt is placed.',
    },
    {
      situation: 'A chemist is writing a balanced chemical equation for $n$ compounds. She has a vector of element counts per molecule for each compound. Why does linear independence matter here?',
      competingTechniques: 'Trial and error balancing vs. null space analysis',
      whyThisTechniqueWins: 'The balanced equation is precisely a non-trivial vector in the null space of the compound matrix. If the compound vectors are independent, no balanced (non-trivial) equation exists — the reaction is impossible as written. A non-trivial nullspace means the reaction can be balanced, and the nullspace basis vector gives the stoichiometric coefficients.',
    },
  ],

  debugging: [
    {
      commonError: 'Declaring independence without performing the test — just "looking" at vectors.',
      symptom: 'Student says "[2,3] and [4,6] are independent because they are different vectors."',
      whyItHappened: 'The vectors do look different. But $[4,6]^T = 2[2,3]^T$ — they are proportional. Visual inspection misses scalar multiples unless component ratios are explicitly compared.',
      repairStrategy: 'Always check component ratios for two vectors (does $a_1/b_1 = a_2/b_2 = \\ldots$ for all components?). For 3+ vectors, compute rank. Never trust "they look different."',
    },
    {
      commonError: 'Testing dependence of 3 vectors using pairwise checks only.',
      symptom: 'Student checks each pair: $\\mathbf{v}_1$ vs $\\mathbf{v}_2$, $\\mathbf{v}_1$ vs $\\mathbf{v}_3$, $\\mathbf{v}_2$ vs $\\mathbf{v}_3$ — all independent — then concludes the set of three is independent.',
      whyItHappened: 'Pairwise independence does NOT imply independence of the full set. Classic counter-example: $[1,0]^T$, $[0,1]^T$, $[1,1]^T$ — each pair is independent, but the full set is dependent ($[1,1] = [1,0] + [0,1]$).',
      repairStrategy: 'Test the full set simultaneously using the rank test or determinant. Pairwise tests are necessary but not sufficient for full-set independence.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Apply the zero-sum test, rank test, and determinant test to any set of vectors in $\\mathbb{R}^n$; identify independent and dependent cases; find explicit dependence relations via RREF.',
    explainVerbally: 'Explain why "rank = number of columns" is equivalent to "nullity = 0" is equivalent to "only trivial solution to $A\\mathbf{c} = \\mathbf{0}$" — and why all three say the same thing.',
    detectIncorrectApplication: 'Catch the pairwise test fallacy; catch applying $\\det = 0$ to non-square matrices; catch confusing independence with orthogonality.',
    transferToUnfamiliar: 'Determine whether $\\{1, \\sin^2 x, \\cos^2 x\\}$ is independent in $C[0,2\\pi]$ by applying the definition at specific values of $x$ (evaluate at $x = 0$ and $x = \\pi/2$ to extract coefficient constraints).',
  },
};
