// Chapter 2.3 — Systems & Geometry
//
// PHASE 2 — NUMERICAL COMPUTING (NUMPY-FIRST)
//
// TEACHES:
//   Math:    Linear systems as geometric intersections (lines/planes),
//            column space and null space, rank and dimension,
//            overdetermined vs underdetermined systems, conditioning
//            and numerical stability, the condition number
//
//   Python:  np.linalg.solve, np.linalg.lstsq, np.linalg.matrix_rank,
//            np.linalg.cond, np.linalg.null_space (via SVD), scipy.linalg,
//            structured problem solving with numpy, parameter sweeps
//
//   Library: fig.transformed_grid() to show basis vector distortion,
//            fig.parametric() for geometric curves,
//            fig.polygon() for feasible regions,
//            fig.plot(fn) for constraint lines

export default {
  id: 'py-2-3-systems-geometry',
  slug: 'systems-and-geometry',
  chapter: 2.3,
  order: 2,
  title: 'Systems & Geometry',
  subtitle: 'What linear systems look like geometrically — and how to solve them reliably',
  tags: [
    'linear systems', 'geometry', 'null space', 'column space', 'rank',
    'conditioning', 'overdetermined', 'underdetermined', 'least squares',
    'numpy.linalg', 'transformed grid', 'opencalc',
  ],

  hook: {
    question: 'A bridge has 50 load-bearing joints. Each joint gives one equation. With 48 unknown forces, do you have enough information to solve the system?',
    realWorldContext:
      'Structural engineering, circuit analysis, computer graphics, and machine learning ' +
      'all reduce to linear systems. ' +
      'The shape of the solution — unique, none, or infinitely many — ' +
      'tells you something fundamental about the physical system: ' +
      'whether it is rigid or flexible, determined or redundant. ' +
      'A poorly conditioned system means tiny measurement errors cause huge solution errors — ' +
      'understanding conditioning is the difference between a reliable simulation and a numerically unstable one.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      'Solving **Ax = b** is finding the point (or points) where the rows of A define ' +
      'geometric objects — lines in 2D, planes in 3D — that all pass through a common point. ' +
      'When there is exactly one such point, the system has a unique solution. ' +
      'When the objects are parallel they never meet; when they coincide there are infinitely many solutions.',
      'The **condition number** tells you how trustworthy the answer is. ' +
      'A well-conditioned system (condition number near 1) gives reliable answers even with ' +
      'slightly noisy data. An ill-conditioned system amplifies tiny errors into huge ones — ' +
      'small changes in b produce wildly different x.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Rank of a matrix',
        body: 'rank(A) = number of linearly independent rows (or columns). If rank(A) = n (full column rank), Ax = b has at most one solution. If rank(A) < n, the null space is non-trivial — infinitely many solutions exist (if any).',
      },
      {
        type: 'insight',
        title: 'Condition number κ(A)',
        body: '\\kappa(A) = \\|A\\| \\cdot \\|A^{-1}\\| = \\sigma_{\\max} / \\sigma_{\\min}. If κ = 10^k, you lose about k digits of precision solving Ax = b. κ = 1 is perfect; κ > 10^6 is dangerously ill-conditioned.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Systems & Geometry',
        mathBridge: 'Ax = b: each row is a hyperplane. The solution is their intersection. rank(A) + nullity(A) = n. κ(A) = σ_max / σ_min.',
        caption: 'Work through every cell — the transformed_grid visualization makes the geometry of transformations concrete.',
        props: {
          disableRunAll: true,
          initialCells: [

            // ── TWO LINES: GEOMETRIC VIEW ─────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Two equations — three possible geometries',
              prose: [
                'A 2×2 linear system Ax = b defines two lines in the plane. The solution is their intersection. Three outcomes are possible, each with a distinct geometric signature:',
                '## The three cases',
                '- **Unique solution**: lines cross at one point — `rank(A) = 2`, `det(A) ≠ 0`\n- **No solution**: lines are parallel but distinct — `rank(A) = 1`, b not in column space\n- **Infinite solutions**: lines are the same — `rank(A) = 1`, b in column space',
                '## Reading the geometry from the matrix',
                'Two rows are linearly dependent (parallel lines) when one is a scalar multiple of the other. Checking `np.linalg.matrix_rank(A)` tells you the case before you even try to solve.',
              ],
              code: `import numpy as np, math
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def solve_and_show(A, b, title):
    r = np.linalg.matrix_rank(A)
    d = np.linalg.det(A)
    print(f"{title}")
    print(f"  rank={r}, det={d:.4f}")
    if r == A.shape[1]:
        x = np.linalg.solve(A, b)
        print(f"  unique solution: x={x.round(4)}")
    else:
        print(f"  rank deficient — no unique solution")
    print()

# Case 1: unique solution
A1 = np.array([[2.0, 1.0], [1.0, 3.0]])
b1 = np.array([5.0, 10.0])
solve_and_show(A1, b1, "Case 1 — unique solution")

# Case 2: no solution (parallel lines)
A2 = np.array([[2.0, 1.0], [4.0, 2.0]])
b2 = np.array([5.0, 9.0])
solve_and_show(A2, b2, "Case 2 — no solution (parallel lines)")

# Case 3: infinite solutions (same line)
A3 = np.array([[2.0, 1.0], [4.0, 2.0]])
b3 = np.array([5.0, 10.0])
solve_and_show(A3, b3, "Case 3 — infinite solutions (same line)")

# Visualize case 1 — two lines intersecting
x_sol = np.linalg.solve(A1, b1)
fig = Figure(xmin=-1, xmax=5, ymin=-1, ymax=6,
             title="Case 1: unique solution (lines cross)")
fig.grid().axes()
# 2x + y = 5  →  y = 5 - 2x
# x + 3y = 10 →  y = (10 - x)/3
fig.plot(lambda x: 5 - 2*x,     color=BLUE, label="2x+y=5")
fig.plot(lambda x: (10 - x)/3,  color=RED,  label="x+3y=10")
fig.point([float(x_sol[0]), float(x_sol[1])], color=AMBER, radius=8)
fig.text([float(x_sol[0])+0.2, float(x_sol[1])+0.3],
         f"({x_sol[0]:.1f}, {x_sol[1]:.1f})", color='black', size=11, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── TRANSFORMED GRID ──────────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Transformed grid — seeing what a matrix does to space',
              prose: [
                'The most powerful geometric intuition for a matrix: watch what it does to the **entire coordinate grid**, not just individual vectors. `fig.transformed_grid(matrix)` draws the original grid distorted by the matrix — the columns of the matrix show where the standard basis vectors **î** and **ĵ** land.',
                '## What to read from the transformed grid',
                '- **Stretched grid lines**: the matrix scales space differently in different directions\n- **Skewed grid lines**: shear is present\n- **Collapsed grid** (lines overlap): det = 0, the matrix is singular\n- **Orientation flip**: if the "blue" horizontal lines cross the "green" vertical lines on the wrong side, det < 0',
                '## opencalc: `fig.transformed_grid(matrix)`',
                '`matrix` is a plain Python list `[[a, b], [c, d]]` where columns are where î and ĵ land. Column 1 `[a, c]` is the new î; column 2 `[b, d]` is the new ĵ. The grid lines follow these new basis vectors.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Shear matrix: î stays, ĵ slides right
A = [[1, 1.5],
     [0, 1.0]]

fig = Figure(xmin=-4, xmax=4, ymin=-4, ymax=4,
             title="Shear — î stays, ĵ slides right", square=True)
fig.grid()                              # original grid (faint)
fig.transformed_grid(A, color_h=BLUE, color_v=RED)
fig.arrow([0,0], [A[0][0], A[1][0]], color=BLUE,  label="î→")
fig.arrow([0,0], [A[0][1], A[1][1]], color=RED,   label="ĵ→")
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── THREE TYPES OF SYSTEM ─────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Rank, null space, and the three system types',
              prose: [
                'The **rank** of A is the number of independent directions in its column space. The **null space** (kernel) of A is the set of all x where Ax = 0 — the directions that get collapsed to zero. The **rank-nullity theorem** states: rank(A) + nullity(A) = n (number of columns).',
                '## Three system types',
                '- **Square, full rank** (rank = n = m): unique solution. Use `np.linalg.solve`.\n- **Overdetermined** (m > n, more equations than unknowns): usually no exact solution. Use `np.linalg.lstsq` for the best approximate solution.\n- **Underdetermined** (m < n, fewer equations than unknowns): infinitely many solutions (if any). The minimum-norm solution is `A.T @ np.linalg.solve(A @ A.T, b)`.',
                '## Finding the null space via SVD',
                'When the SVD of A is `U, s, Vt = np.linalg.svd(A)`, the null space vectors are the rows of Vt corresponding to zero (or near-zero) singular values. In practice: rows of Vt where `s[i] < tol`.',
              ],
              code: `import numpy as np

# Case A: square, full rank
A_sq = np.array([[3.0, 1.0], [1.0, 2.0]])
b_sq = np.array([7.0, 4.0])
x_sq = np.linalg.solve(A_sq, b_sq)
print(f"Square system — rank {np.linalg.matrix_rank(A_sq)}")
print(f"  solution: {x_sq.round(4)}")
print()

# Case B: overdetermined (3 equations, 2 unknowns)
A_over = np.array([[1.0, 1.0],
                   [1.0, 2.0],
                   [1.0, 3.0]])
b_over = np.array([2.1, 3.9, 5.8])   # noisy linear data
x_over, res, rank_o, sv = np.linalg.lstsq(A_over, b_over, rcond=None)
print(f"Overdetermined — rank {rank_o}, shape {A_over.shape}")
print(f"  least-squares solution: {x_over.round(4)}")
print(f"  residual: {float(res[0]):.6f}")
print()

# Case C: underdetermined (2 equations, 4 unknowns) — many solutions
A_under = np.array([[1.0, 2.0, 1.0, 0.0],
                    [0.0, 1.0, 2.0, 1.0]])
b_under = np.array([5.0, 4.0])
# Minimum-norm solution via lstsq
x_min, _, _, _ = np.linalg.lstsq(A_under, b_under, rcond=None)
print(f"Underdetermined — rank {np.linalg.matrix_rank(A_under)}, shape {A_under.shape}")
print(f"  min-norm solution: {x_min.round(4)}")
print(f"  verify Ax = b: {np.allclose(A_under @ x_min, b_under)}")
print()

# Null space via SVD
U, s, Vt = np.linalg.svd(A_under)
tol = 1e-10
null_mask = s < tol if len(s) < Vt.shape[0] else np.zeros(Vt.shape[0], dtype=bool)
# Rows of Vt beyond len(s) are always null space
null_vecs = Vt[len(s):]
print(f"Null space basis vectors ({null_vecs.shape[0]} found):")
for v in null_vecs:
    print(f"  {v.round(4)}")
    print(f"  A @ null_vec = {(A_under @ v).round(10)}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CONDITIONING ──────────────────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Conditioning — when small errors cause big problems',
              prose: [
                'The **condition number** κ(A) = σ_max / σ_min measures how sensitive the solution of Ax = b is to small perturbations. If κ(A) = 10^k, solving the system can lose up to k decimal digits of precision. With 64-bit floats (about 16 significant digits), κ > 10^12 makes the result meaningless.',
                '## The classic ill-conditioned matrix: Hilbert',
                'The Hilbert matrix H where H[i,j] = 1/(i+j+1) is famously ill-conditioned. Its condition number grows exponentially with size. It is used as a stress test for linear solvers.',
                '## Practical conditioning rules',
                '- κ < 100: excellent — results are reliable\n- κ < 10^6: acceptable for most engineering work\n- κ > 10^8: treat results with suspicion\n- κ > 10^12: results may be dominated by floating-point error\n- Regularization (adding a small λI to A) deliberately trades some accuracy for better conditioning',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Hilbert matrix condition numbers
print("Hilbert matrix conditioning:")
print(f"{'n':>4}  {'cond(H)':>14}  {'digits lost':>12}")
print("-" * 36)
ns = [2, 3, 4, 5, 6, 8, 10, 12]
conds, digits_lost = [], []
for n in ns:
    H = np.array([[1/(i+j+1) for j in range(n)] for i in range(n)])
    c = np.linalg.cond(H)
    d = min(16, int(np.log10(c)) if c > 1 else 0)
    conds.append(float(np.log10(c)))
    digits_lost.append(float(d))
    print(f"{n:>4}  {c:>14.2e}  {d:>12}")

# Visualize: log10(cond) vs matrix size
fig = Figure(xmin=1, xmax=13, ymin=0, ymax=18,
             title="Hilbert matrix: log₁₀(condition number) vs size n")
fig.grid().axes()
fig.scatter(ns, conds, color=BLUE, radius=6)
fig.hline(12, color=RED)    # danger zone
fig.hline(6,  color=AMBER)  # caution zone
fig.text([9.5, 12.5], "danger (κ>10¹²)", color='red',   size=11, bold=True)
fig.text([9.5, 6.5],  "caution (κ>10⁶)", color='amber', size=11, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── REGULARIZATION ────────────────────────────────────────────────
            {
              id: 5,
              cellTitle: 'Regularization — taming ill-conditioned systems',
              prose: [
                '**Tikhonov regularization** (Ridge regression in ML) adds a small multiple of the identity to A before solving: instead of solving Ax = b, solve (AᵀA + λI)x = Aᵀb. The λ > 0 term ensures the matrix is always invertible and well-conditioned, at the cost of slightly biasing the solution.',
                '## The bias-variance tradeoff',
                '- λ = 0: original system (possibly ill-conditioned, low bias, high variance)\n- λ small: slightly biased, much better conditioned\n- λ large: heavily biased toward x = 0, very stable but inaccurate',
                '## When to regularize',
                'Any time `np.linalg.cond(A.T @ A)` is large (> 10^6), or when you have more features than observations (n > m), regularization is essential. In machine learning this appears as L2 regularization or weight decay.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Fit a high-degree polynomial to noisy data — classic ill-conditioning
rng = np.random.default_rng(1)
n_pts = 15
x_data = np.linspace(-1, 1, n_pts)
y_true = np.sin(np.pi * x_data)
y_noisy = y_true + rng.normal(0, 0.1, n_pts)

# Design matrix for degree-10 polynomial
degree = 10
A = np.column_stack([x_data**k for k in range(degree + 1)])

print(f"Design matrix condition number: {np.linalg.cond(A):.2e}")
print()

# Compare: unregularized vs regularized
lambdas = [0, 1e-6, 1e-3, 0.1]
colors_plt = [RED, AMBER, BLUE, GRAY]
labels_plt = ["λ=0 (unregularized)", "λ=1e-6", "λ=1e-3", "λ=0.1"]

fig = Figure(xmin=-1.2, xmax=1.2, ymin=-1.5, ymax=1.5,
             title="Polynomial fit: regularization tames the wiggle")
fig.grid().axes()

for lam, color, lbl in zip(lambdas, colors_plt, labels_plt):
    # Solve (AᵀA + λI)c = Aᵀy
    ATA = A.T @ A
    reg = ATA + lam * np.eye(ATA.shape[0])
    ATy = A.T @ y_noisy
    coeffs = np.linalg.solve(reg, ATy)
    # Plot using a lambda that evaluates the polynomial
    c = coeffs.tolist()          # plain Python list — safe to capture
    deg = degree
    fig.plot(lambda x, c=c, deg=deg: sum(c[k] * x**k for k in range(deg+1)),
             color=color)

fig.scatter(x_data.tolist(), y_noisy.tolist(), color=GRAY, radius=5)
fig.plot(lambda x: __import__('math').sin(__import__('math').pi * x),
         color='black')
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── GEOMETRIC INTERPRETATION: PLANES IN 3D ────────────────────────
            {
              id: 6,
              cellTitle: 'Three planes in 3D — when do they share a point?',
              prose: [
                'A 3×3 system Ax = b represents three planes in 3D space. The solution — if it exists — is the point where all three planes meet. The rank of A tells you the geometry immediately, without solving:',
                '## Rank and geometry in 3D',
                '- **rank = 3**: three planes meet at exactly one point — unique solution\n- **rank = 2**: planes intersect along a line — infinite solutions (a 1D solution space)\n- **rank = 1**: all three planes are parallel to the same direction — degenerate\n- **rank deficient + inconsistent b**: planes never all meet — no solution',
                '## Computing with `np.linalg.solve` vs `np.linalg.lstsq`',
                '`np.linalg.solve` raises `LinAlgError` if A is singular. Always check `np.linalg.matrix_rank(A)` first, or use a try/except. `np.linalg.lstsq` never raises — it always returns something, even if the system is inconsistent.',
              ],
              code: `import numpy as np

cases = [
    ("Full rank (unique point)",
     np.array([[2.,1.,1.],[1.,3.,2.],[1.,0.,4.]]),
     np.array([4.,7.,9.])),
    ("Rank 2 (line of solutions)",
     np.array([[1.,2.,3.],[2.,4.,6.],[1.,1.,2.]]),
     np.array([6.,12.,4.])),
    ("Rank 2, inconsistent (no solution)",
     np.array([[1.,2.,3.],[2.,4.,6.],[1.,1.,2.]]),
     np.array([6.,13.,4.])),  # b changed so no solution exists
]

for title, A, b in cases:
    r = np.linalg.matrix_rank(A)
    Ab = np.column_stack([A, b])
    r_aug = np.linalg.matrix_rank(Ab)
    print(f"--- {title} ---")
    print(f"  rank(A)={r}, rank([A|b])={r_aug}")
    if r == A.shape[1] and r == r_aug:
        x = np.linalg.solve(A, b)
        print(f"  solution: {x.round(4)}")
    elif r == r_aug and r < A.shape[1]:
        x_min, _, _, _ = np.linalg.lstsq(A, b, rcond=None)
        resid = np.linalg.norm(A @ x_min - b)
        print(f"  min-norm solution: {x_min.round(4)}")
        print(f"  residual: {resid:.2e}  (should be ~0)")
    else:
        _, res, _, _ = np.linalg.lstsq(A, b, rcond=None)
        print(f"  no exact solution — least-squares residual: {float(np.linalg.norm(A @ np.linalg.lstsq(A,b,rcond=None)[0] - b)):.4f}")
    print()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── COLUMN SPACE AND ROW SPACE ────────────────────────────────────
            {
              id: 7,
              cellTitle: 'Column space — what outputs can Ax produce?',
              prose: [
                'The **column space** of A (also called the range or image) is the set of all vectors b that Ax = b can possibly produce — every linear combination of the columns of A. If b is not in the column space, there is no solution.',
                '## Four fundamental subspaces',
                '- **Column space** of A: span of columns — lives in ℝᵐ\n- **Row space** of A: span of rows — lives in ℝⁿ\n- **Null space** of A: all x with Ax = 0 — lives in ℝⁿ, perpendicular to row space\n- **Left null space** of A: all y with Aᵀy = 0 — lives in ℝᵐ, perpendicular to column space',
                '## Checking if b is in the column space',
                'Augment [A | b] and compare rank: if `rank([A|b]) == rank(A)`, b is in the column space and a solution exists. If `rank([A|b]) > rank(A)`, b is outside the column space — no solution.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# 3×2 matrix — column space is a 2D plane in 3D
A = np.array([[1., 0.],
              [0., 1.],
              [1., 1.]])   # column space: all (a, b, a+b) — a plane through origin

# Test vectors — in the column space vs not
def check_b(A, b, label):
    Ab = np.column_stack([A, b])
    in_cs = np.linalg.matrix_rank(Ab) == np.linalg.matrix_rank(A)
    if in_cs:
        x, _, _, _ = np.linalg.lstsq(A, b, rcond=None)
        resid = float(np.linalg.norm(A @ x - b))
        print(f"{label}: IN column space  (x={x.round(3)}, residual={resid:.2e})")
    else:
        x, _, _, _ = np.linalg.lstsq(A, b, rcond=None)
        resid = float(np.linalg.norm(A @ x - b))
        print(f"{label}: NOT in column space (best approx residual={resid:.4f})")

check_b(A, np.array([2., 3., 5.]),  "b = [2,3,5]")   # 2*(col1) + 3*(col2) = [2,3,5] ✓
check_b(A, np.array([2., 3., 4.]),  "b = [2,3,4]")   # 2+3=5≠4, not in span
check_b(A, np.array([0., 0., 0.]),  "b = [0,0,0]")   # trivially in column space

print()

# SVD reveals the column space basis directly
U, s, Vt = np.linalg.svd(A, full_matrices=False)
print(f"Singular values: {s.round(4)}")
print(f"Column space basis (left singular vectors — columns of U):")
print(U.round(4))
print(f"\\nRow space basis (right singular vectors — rows of Vt):")
print(Vt.round(4))

# Condition number
print(f"\\nCondition number of A: {s[0]/s[-1]:.4f}")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── PRACTICAL: NETWORK / CIRCUIT ANALYSIS ─────────────────────────
            {
              id: 8,
              cellTitle: 'Application — electrical circuit analysis',
              prose: [
                'Kirchhoff\'s Current Law at each node gives one linear equation per node: the sum of currents into a node equals the sum leaving. Ohm\'s Law (V = IR) links currents to voltages. Together they produce a linear system whose solution gives every voltage and current in the circuit.',
                '## Setting up the conductance matrix',
                'For a resistor network: build a conductance matrix G where G[i,i] = sum of conductances at node i, G[i,j] = −conductance between nodes i and j. Then Gv = i_source gives node voltages v.',
                '## Why this matters',
                'This is exactly how SPICE (the industry-standard circuit simulator) works internally — every call to simulate a circuit solves a linear system. The same technique applies to heat flow, fluid networks, and structural mechanics.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Simple resistor network — 4 nodes, 5 resistors
# Node 0: ground (reference, voltage = 0)
# Resistors (between nodes, resistance in Ω):
#   1-2: 2Ω,  1-3: 4Ω,  2-3: 1Ω,  2-0: 3Ω,  3-0: 5Ω
# Current source: 2A injected at node 1

edges = [(1, 2, 2.0),   # (from, to, resistance)
         (1, 3, 4.0),
         (2, 3, 1.0),
         (2, 0, 3.0),
         (3, 0, 5.0)]

n_nodes = 4
G = np.zeros((n_nodes, n_nodes))

for i, j, R in edges:
    g = 1.0 / R   # conductance
    if i > 0: G[i, i] += g
    if j > 0: G[j, j] += g
    if i > 0 and j > 0:
        G[i, j] -= g
        G[j, i] -= g

# Remove ground node (row 0, col 0) — it's the reference
G_red = G[1:, 1:]

# Current source: 2A at node 1
i_src = np.array([2.0, 0.0, 0.0])

# Solve for node voltages (nodes 1, 2, 3)
v = np.linalg.solve(G_red, i_src)
print("Node voltages (V):")
for node, volt in enumerate(v, start=1):
    print(f"  Node {node}: {volt:.4f} V")
print(f"\\nConductance matrix G:")
print(G_red.round(4))
print(f"Condition number: {np.linalg.cond(G_red):.2f}")
print()

# Currents through each resistor
print("Branch currents (A):")
for i, j, R in edges:
    vi = float(v[i-1]) if i > 0 else 0.0
    vj = float(v[j-1]) if j > 0 else 0.0
    I  = (vi - vj) / R
    print(f"  Node {i} → Node {j} ({R}Ω): {I:.4f} A")`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── LEAST SQUARES APPLIED ─────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'Least squares — the geometry of best approximation',
              prose: [
                'When Ax = b has no solution (b is outside the column space of A), `np.linalg.lstsq` finds the x that minimises ‖Ax − b‖² — the closest point in the column space to b. Geometrically: it projects b onto the column space.',
                '## The normal equations',
                'The least-squares solution satisfies the **normal equations**: AᵀAx = Aᵀb. This is always solvable (AᵀA is positive semi-definite). `lstsq` solves these via SVD, which is more stable than forming AᵀA explicitly.',
                '## Projection interpretation',
                'The residual vector r = b − Ax̂ is **perpendicular to the column space** of A: Aᵀr = 0. This is why it\'s called the "orthogonal projection" — the residual is the component of b that lies outside what A can produce.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# Dataset: 20 noisy measurements of a quadratic + linear system
rng = np.random.default_rng(9)
n = 20
t = np.linspace(0, 3, n)
y_true = 1.5*t**2 - 2*t + 0.5
y_obs  = y_true + rng.normal(0, 0.3, n)

# Design matrix for quadratic fit: columns [t², t, 1]
A = np.column_stack([t**2, t, np.ones(n)])

# Least-squares fit
coeffs, residuals_sq, rank, sv = np.linalg.lstsq(A, y_obs, rcond=None)
a, b, c = coeffs
print(f"Fitted:  y = {a:.4f}t² + {b:.4f}t + {c:.4f}")
print(f"True:    y = 1.5000t² - 2.0000t + 0.5000")
print()

# Residual analysis
y_fit = A @ coeffs
residuals = y_obs - y_fit
print(f"Residual norm:  {np.linalg.norm(residuals):.4f}")
print(f"Max residual:   {np.abs(residuals).max():.4f}")
print(f"R²:             {1 - residuals.var() / y_obs.var():.4f}")
print()

# Verify normal equations: Aᵀr ≈ 0
print(f"Aᵀr (should be ~0): {(A.T @ residuals).round(8)}")

# Plot fit
fig = Figure(xmin=-0.2, xmax=3.2, ymin=-1.5, ymax=6,
             title=f"Least-squares quadratic fit: {a:.2f}t²+{b:.2f}t+{c:.2f}")
fig.grid().axes()
fig.plot(lambda x: a*x**2 + b*x + c, color=BLUE)
fig.plot(lambda x: 1.5*x**2 - 2*x + 0.5, color=GRAY)
fig.scatter(t.tolist(), y_obs.tolist(), color=RED, radius=4)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── ITERATIVE METHODS ─────────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'Iterative methods — when direct solvers are too slow',
              prose: [
                'Direct solvers like `np.linalg.solve` (LU decomposition) cost O(n³) operations. For a 10,000 × 10,000 system that\'s a trillion operations. Large sparse systems (most real engineering problems) use **iterative methods** that only need O(n) memory and converge in far fewer steps.',
                '## Jacobi iteration — the simplest iterative solver',
                'Decompose A = D + (A − D) where D is the diagonal. Then iterate: x^(k+1) = D⁻¹(b − (A − D)x^(k)). Each step updates all components simultaneously using the previous iteration\'s values.',
                '## Convergence condition',
                'Jacobi converges when A is **strictly diagonally dominant**: |A[i,i]| > Σⱼ≠ᵢ |A[i,j]| for every row i. For well-conditioned systems convergence is fast; for ill-conditioned ones it may be very slow or diverge.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def jacobi(A, b, x0=None, tol=1e-8, max_iter=200):
    """Jacobi iteration for Ax = b. Returns (solution, iteration_count, error_history)."""
    n = len(b)
    x = np.zeros(n) if x0 is None else x0.copy()
    D_inv = 1.0 / np.diag(A)           # diagonal elements
    R = A - np.diag(np.diag(A))        # off-diagonal part
    errors = []
    for k in range(max_iter):
        x_new = D_inv * (b - R @ x)
        err = float(np.linalg.norm(x_new - x))
        errors.append(err)
        x = x_new
        if err < tol:
            return x, k + 1, errors
    return x, max_iter, errors

# Diagonally dominant system — Jacobi will converge
A = np.array([[10., -1.,  2.],
              [-1.,  11., -1.],
              [ 2., -1.,  10.]], dtype=float)
b = np.array([6., 25., -11.], dtype=float)

x_exact  = np.linalg.solve(A, b)
x_jacobi, iters, err_hist = jacobi(A, b, tol=1e-10)

print(f"Exact solution:   {x_exact.round(6)}")
print(f"Jacobi solution:  {x_jacobi.round(6)}")
print(f"Converged in {iters} iterations")
print(f"Final error: {err_hist[-1]:.2e}")

# Convergence plot
log_errors = [float(np.log10(max(e, 1e-16))) for e in err_hist]
fig = Figure(xmin=0, xmax=len(err_hist)+1, ymin=min(log_errors)-0.5, ymax=1,
             title="Jacobi iteration convergence (log₁₀ error)")
fig.grid().axes()
fig.scatter(list(range(1, len(err_hist)+1)), log_errors, color=BLUE, radius=4)
fig.hline(-10, color=RED)
fig.text([len(err_hist)*0.6, -9.3], "tolerance 1e-10", color='red', size=11, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── PUTTING IT TOGETHER ───────────────────────────────────────────
            {
              id: 11,
              cellTitle: 'Putting it together — structural truss analysis',
              prose: [
                'A planar truss is a structure made of rigid bars connected at joints (nodes). At each node, force equilibrium gives two equations (horizontal and vertical). The unknowns are the forces in each bar. Setting up and solving this linear system is the core of structural engineering.',
                '## The workflow',
                '1. Number the nodes and bars\n2. For each bar, compute the direction cosines (cos θ, sin θ) from geometry\n3. Build the equilibrium matrix A: 2 rows per node, one column per bar\n4. Solve Ax = F for the bar forces x, where F is the external load vector\n- Positive = tension, negative = compression',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

# 2-bar truss — statically determinate, clean 2×2 system
# Node 0=(0,0) pinned, Node 1=(2,0) pinned, Node 2=(1,1) free — load here
# Bars: 0→2 (left bar) and 1→2 (right bar)
# At free node 2: two equilibrium equations, two unknowns → 2×2 solve

nodes = np.array([[0., 0.], [2., 0.], [1., 1.]])
bars  = [(0, 2), (1, 2)]   # only bars touching the free node

def bar_direction(nodes, na, nb):
    """Unit vector from node na toward node nb."""
    d = nodes[nb] - nodes[na]
    return d / np.linalg.norm(d)

# Build 2×2 equilibrium matrix at node 2
# Column j: direction cosines of bar j AS IT PULLS ON node 2
# (bar pulls toward the pinned end, so direction is from node 2 toward pin)
A = np.zeros((2, 2))
for j, (na, nb) in enumerate(bars):
    # Bar force on node 2 acts along the bar — toward na (the pinned end)
    unit = bar_direction(nodes, nb, na)   # from node 2 toward pin
    A[0, j] = float(unit[0])   # x component
    A[1, j] = float(unit[1])   # y component

# External load at node 2: 15 kN downward
F = np.array([0., -15.])

print("Equilibrium matrix A (columns = bar directions at free node):")
print(A.round(4))
print(f"Condition number: {np.linalg.cond(A):.4f}")
print()

# Solve — F1 and F2 are the bar forces (positive = tension)
forces = np.linalg.solve(A, F)

print("Bar forces (kN):")
for j, (na, nb) in enumerate(bars):
    state = "TENSION" if forces[j] > 0 else "COMPRESSION"
    print(f"  Bar {na}-{nb}: {forces[j]:+.4f} kN  ({state})")

print(f"\\nVerify Ax = F: {np.allclose(A @ forces, F)}")

# Visualise
fig = Figure(xmin=-0.3, xmax=2.5, ymin=-0.4, ymax=1.4,
             title="2-bar truss (blue=tension, red=compression)", square=True)
fig.grid()
for j, (na, nb) in enumerate(bars):
    color = BLUE if forces[j] > 0 else RED
    fig.line(nodes[na].tolist(), nodes[nb].tolist(), color=color, width=3)
for i, (nx, ny) in enumerate(nodes):
    fig.point([float(nx), float(ny)], color=AMBER, radius=8)
    fig.text([float(nx)+0.07, float(ny)+0.07], f"N{i}", color='black', size=11, bold=True)
fig.arrow([1.0, 1.0], [1.0, 0.4], color=RED, label="15 kN")
fig.show()`,
              output: '', status: 'idle', figureJson: null,
            },

            // ── CHALLENGES ───────────────────────────────────────────────────

            {
              id: 'c1',
              challengeType: 'fill',
              challengeNumber: 1,
              challengeTitle: 'Classify and solve linear systems',
              difficulty: 'easy',
              prompt: 'Fill in the blanks to classify each system and solve it correctly.',
              starterBlock: `import numpy as np

A1 = np.array([[2., 1.], [4., 2.]])   # rank-deficient
b1 = np.array([3., 6.])

A2 = np.array([[1., 2.], [3., 4.]])   # full rank
b2 = np.array([5., 6.])

# 1. Compute the rank of A1
r1 = np.linalg._____(A1)

# 2. Check if b1 is in the column space of A1
#    Hint: compare rank([A1|b1]) with rank(A1)
Ab1 = np.column_stack([A1, b1])
in_cs = np.linalg.matrix_rank(Ab1) _____ r1

# 3. Solve A2 x = b2 for the unique solution
x2 = np.linalg._____(A2, b2)

print(f"rank(A1) = {r1}")
print(f"b1 in column space of A1? {in_cs}")
print(f"A2 x = b2 solution: {x2.round(4)}")`,
              code: `import numpy as np

A1 = np.array([[2., 1.], [4., 2.]])
b1 = np.array([3., 6.])
A2 = np.array([[1., 2.], [3., 4.]])
b2 = np.array([5., 6.])

r1 = np.linalg.matrix_rank(A1)
Ab1 = np.column_stack([A1, b1])
in_cs = np.linalg.matrix_rank(Ab1) == r1
x2 = np.linalg.solve(A2, b2)

print(f"rank(A1) = {r1}")
print(f"b1 in column space of A1? {in_cs}")
print(f"A2 x = b2 solution: {x2.round(4)}")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
A1 = np.array([[2.,1.],[4.,2.]]); b1 = np.array([3.,6.])
A2 = np.array([[1.,2.],[3.,4.]]); b2 = np.array([5.,6.])
if 'r1' not in dir():
    res = "ERROR: r1 not defined."
elif r1 != 1:
    res = f"ERROR: rank(A1) should be 1, got {r1}."
elif not isinstance(in_cs, (bool, np.bool_)):
    res = "ERROR: in_cs should be a boolean."
elif not bool(in_cs):
    res = "ERROR: b1 IS in the column space of A1 (b1 = 3 * [1,2])."
elif not np.allclose(x2, np.linalg.solve(A2, b2)):
    res = f"ERROR: x2 wrong. Got {x2}, expected {np.linalg.solve(A2,b2)}."
else:
    res = f"SUCCESS: rank(A1)={r1}, b1 in CS={bool(in_cs)}, x2={x2.round(4)}."
res
`,
              hint: 'np.linalg.matrix_rank(A). np.linalg.matrix_rank(Ab) == r1 gives a boolean. np.linalg.solve(A2, b2).',
            },

            {
              id: 'c2',
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Condition number experiment',
              difficulty: 'easy',
              prompt: 'Write `make_system(n, epsilon)` that builds an n×n system where the matrix A is the identity plus a rank-1 perturbation that makes it increasingly ill-conditioned as epsilon → 0. Specifically: A = I + (1/epsilon) * v @ v.T where v is a unit vector. Solve Ax = b for random b, then plot the condition number and the relative error vs epsilon for epsilon in [0.01, 0.1, 0.5, 1.0, 2.0].',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def make_system(n, epsilon):
    """Build (A, b) where A = I + (1/epsilon)*v@v.T. Returns (A, b, x_true)."""
    rng = np.random.default_rng(42)
    v = rng.standard_normal(n)
    v /= np.linalg.norm(v)
    A = np.eye(n) + (1/epsilon) * np.outer(v, v)
    x_true = rng.standard_normal(n)
    b = A @ x_true
    return A, b, x_true

n = 6
epsilons = [0.01, 0.05, 0.1, 0.5, 1.0, 2.0]
conds, rel_errors = [], []

print(f"{'epsilon':>8}  {'cond(A)':>12}  {'rel error':>12}")
print("-" * 38)
for eps in epsilons:
    A, b, x_true = make_system(n, eps)
    x_solved = np.linalg.solve(A, b)
    c = float(np.linalg.cond(A))
    err = float(np.linalg.norm(x_solved - x_true) / np.linalg.norm(x_true))
    conds.append(float(np.log10(c)))
    rel_errors.append(float(np.log10(max(err, 1e-16))))
    print(f"{eps:>8.3f}  {c:>12.2e}  {err:>12.2e}")

fig = Figure(xmin=min(epsilons)-0.1, xmax=max(epsilons)+0.2,
             ymin=min(min(conds), min(rel_errors))-0.5,
             ymax=max(max(conds), max(rel_errors))+0.5,
             title="log₁₀(cond) and log₁₀(rel error) vs epsilon")
fig.grid().axes()
fig.scatter(epsilons, conds,      color=BLUE, radius=6)
fig.scatter(epsilons, rel_errors, color=RED,  radius=6)
fig.text([1.2, max(conds)-0.3],      "log cond",  color='blue', size=11, bold=True)
fig.text([1.2, max(rel_errors)-0.3], "log error", color='red',  size=11, bold=True)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'make_system' not in dir():
    res = "ERROR: make_system not defined."
else:
    A, b, x_true = make_system(4, 1.0)
    if A is None:
        res = "ERROR: returned None."
    elif A.shape != (4,4):
        res = f"ERROR: A shape should be (4,4), got {A.shape}."
    elif not np.allclose(A, A.T, atol=1e-8):
        res = "ERROR: A should be symmetric."
    elif not np.allclose(A @ x_true, b, atol=1e-8):
        res = "ERROR: b should equal A @ x_true."
    else:
        A2, b2, x2 = make_system(4, 0.01)
        c1 = np.linalg.cond(A)
        c2 = np.linalg.cond(A2)
        if c2 <= c1:
            res = f"ERROR: smaller epsilon should give larger condition number. cond(eps=1)={c1:.1f}, cond(eps=0.01)={c2:.1f}."
        else:
            res = f"SUCCESS: make_system correct. cond(eps=1)={c1:.2f}, cond(eps=0.01)={c2:.2e}."
res
`,
              hint: 'np.outer(v, v) gives a rank-1 matrix. np.eye(n) + (1/epsilon)*np.outer(v, v). np.linalg.cond(A) for condition number.',
            },

            {
              id: 'c3',
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Polynomial interpolation vs least squares',
              difficulty: 'medium',
              prompt: 'Given 8 noisy data points from y = cos(x) + 0.1·noise on x ∈ [0, 2π]: (1) Fit an exact interpolating polynomial of degree 7 (8 points, 8 unknowns — Vandermonde matrix). (2) Fit a degree-3 least-squares polynomial. (3) Compare the condition numbers of the two design matrices, the fitted curves, and the mean squared error on a dense test grid. Show both fits on a single figure.',
              code: `import numpy as np, math
from opencalc import Figure, BLUE, RED, AMBER, GRAY

rng = np.random.default_rng(3)
n = 8
x_data = np.linspace(0, 2*math.pi, n)
y_data = np.cos(x_data) + 0.1*rng.standard_normal(n)

# 1. Exact interpolation — Vandermonde matrix (degree 7)
deg_interp = 7
V7 = np.column_stack([x_data**k for k in range(deg_interp+1)])
c7 = np.linalg.solve(V7, y_data)

# 2. Least-squares — degree 3
deg_ls = 3
V3 = np.column_stack([x_data**k for k in range(deg_ls+1)])
c3, _, _, _ = np.linalg.lstsq(V3, y_data, rcond=None)

# Condition numbers
print(f"Cond(Vandermonde deg-7): {np.linalg.cond(V7):.2e}")
print(f"Cond(LS matrix deg-3):   {np.linalg.cond(V3):.2e}")

# MSE on a dense test grid
x_test = np.linspace(0, 2*math.pi, 200)
y_true_test = np.cos(x_test)
y_interp = np.array([sum(c7[k] * x**k for k in range(deg_interp+1)) for x in x_test])
y_ls     = np.array([sum(c3[k] * x**k for k in range(deg_ls+1))     for x in x_test])
mse_interp = float(np.mean((y_interp - y_true_test)**2))
mse_ls     = float(np.mean((y_ls     - y_true_test)**2))
print(f"MSE deg-7 interpolation: {mse_interp:.6f}")
print(f"MSE deg-3 least-squares: {mse_ls:.6f}")

# Plot
c7l = c7.tolist(); d7 = deg_interp
c3l = c3.tolist(); d3 = deg_ls
fig = Figure(xmin=-0.3, xmax=6.6, ymin=-2.5, ymax=2.0,
             title="Interpolation (red) vs LS deg-3 (blue) vs true cos (gray)")
fig.grid().axes()
fig.plot(math.cos, color=GRAY)
fig.plot(lambda x, c=c7l, d=d7: sum(c[k]*x**k for k in range(d+1)), color=RED)
fig.plot(lambda x, c=c3l, d=d3: sum(c[k]*x**k for k in range(d+1)), color=BLUE)
fig.scatter(x_data.tolist(), y_data.tolist(), color=AMBER, radius=5)
fig.show()`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np, math
rng = np.random.default_rng(3)
n = 8
x_data = np.linspace(0, 2*math.pi, n)
y_data = np.cos(x_data) + 0.1*rng.standard_normal(n)
if 'c7' not in dir() or 'c3' not in dir():
    res = "ERROR: c7 or c3 not defined."
elif len(c7) != 8:
    res = f"ERROR: degree-7 fit should have 8 coefficients, got {len(c7)}."
elif len(c3) != 4:
    res = f"ERROR: degree-3 fit should have 4 coefficients, got {len(c3)}."
else:
    V7 = np.column_stack([x_data**k for k in range(8)])
    if not np.allclose(V7 @ c7, y_data, atol=1e-4):
        res = f"ERROR: degree-7 polynomial does not interpolate the data."
    else:
        V3 = np.column_stack([x_data**k for k in range(4)])
        resid = float(np.linalg.norm(V3 @ c3 - y_data))
        res = f"SUCCESS: deg-7 interpolates exactly; deg-3 LS residual={resid:.4f}."
res
`,
              hint: 'V = np.column_stack([x**k for k in range(deg+1)]). For exact interpolation: np.linalg.solve(V, y). For LS: np.linalg.lstsq(V, y, rcond=None)[0]. Use default arg trick for lambdas: lambda x, c=c7.tolist(): ...',
            },

            {
              id: 'c4',
              challengeType: 'write',
              challengeNumber: 4,
              challengeTitle: 'Jacobi solver with convergence test',
              difficulty: 'medium',
              prompt: 'Write `jacobi_solve(A, b, tol=1e-8, max_iter=500)` returning `(x, converged, n_iters)`. Check diagonal dominance before iterating — if A is not diagonally dominant, print a warning but continue. Test it on: (1) a diagonally dominant 5×5 system, (2) the same system with rows permuted to break diagonal dominance. Compare with `np.linalg.solve` for accuracy.',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, GRAY

def jacobi_solve(A, b, tol=1e-8, max_iter=500):
    """
    Jacobi iteration. Returns (x, converged, n_iters).
    Check diagonal dominance and warn if not satisfied.
    """
    pass

# Diagonally dominant system
A_good = np.array([[10., -1.,  2.,  0.,  0.],
                   [-1.,  11., -1.,  3.,  0.],
                   [ 2., -1., 10., -1.,  0.],
                   [ 0.,  3., -1.,  8.,  1.],
                   [ 0.,  0.,  0.,  1.,  5.]], dtype=float)
b = np.array([6., 25., -11., 15., 8.], dtype=float)

x_exact = np.linalg.solve(A_good, b)
x_jac, conv, n_it = jacobi_solve(A_good, b)
err = float(np.linalg.norm(x_jac - x_exact) / np.linalg.norm(x_exact))
print(f"Diagonally dominant: converged={conv}, iters={n_it}, rel_err={err:.2e}")

# Permuted (not diagonally dominant)
perm = [4, 0, 2, 1, 3]   # bad row order
A_bad = A_good[perm, :]
b_bad = b[perm]
x_jac2, conv2, n_it2 = jacobi_solve(A_bad, b_bad)
x_exact2 = np.linalg.solve(A_bad, b_bad)
err2 = float(np.linalg.norm(x_jac2 - x_exact2) / np.linalg.norm(x_exact2))
print(f"Permuted (may not converge): converged={conv2}, iters={n_it2}, rel_err={err2:.2e}")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'jacobi_solve' not in dir():
    res = "ERROR: jacobi_solve not defined."
else:
    A = np.array([[10.,-1.,2.],[-1.,11.,-1.],[2.,-1.,10.]], dtype=float)
    b = np.array([6.,25.,-11.], dtype=float)
    out = jacobi_solve(A, b, tol=1e-8)
    if out is None:
        res = "ERROR: returned None — fill in the function."
    elif len(out) != 3:
        res = f"ERROR: should return (x, converged, n_iters), got {len(out)} values."
    else:
        x, conv, n_it = out
        x_exact = np.linalg.solve(A, b)
        if not np.allclose(x, x_exact, atol=1e-5):
            res = f"ERROR: solution wrong. Got {x.round(4)}, expected {x_exact.round(4)}."
        elif not conv:
            res = "ERROR: should converge for this diagonally dominant system."
        else:
            res = f"SUCCESS: converged in {n_it} iters, solution matches np.linalg.solve."
res
`,
              hint: 'Diagonal dominance: check all(abs(A[i,i]) > sum(abs(A[i,j]) for j≠i) for i in range(n)). Iteration: D_inv = 1/np.diag(A); R = A - np.diag(np.diag(A)); x_new = D_inv*(b - R@x). Converged when np.linalg.norm(x_new - x) < tol.',
            },

            {
              id: 'c5',
              challengeType: 'write',
              challengeNumber: 5,
              challengeTitle: 'Truss solver — generalised to any planar truss',
              difficulty: 'hard',
              prompt: 'Extend the circuit/truss idea: write `solve_truss(nodes, bars, supports, loads)` where `nodes` is an (n,2) array of coordinates, `bars` is a list of (i,j) node pairs, `supports` is a list of (node, dof) pairs where dof=0 means x is fixed and dof=1 means y is fixed, and `loads` is a list of (node, dof, force) triples. Build the full equilibrium matrix A (2n rows, n_bars + n_reactions columns), solve the system, and return bar forces and reaction forces. Test on a simply supported beam with a mid-span point load.',
              code: `import numpy as np
from opencalc import Figure, BLUE, RED, AMBER, GRAY

def solve_truss(nodes, bars, supports, loads):
    """
    Solve a planar truss by direct stiffness / equilibrium.
    nodes:    (n,2) array — coordinates
    bars:     list of (i,j) — bar member connections
    supports: list of (node, dof) — constrained dofs (dof 0=x, 1=y)
    loads:    list of (node, dof, force) — applied forces
    Returns:  dict with 'bar_forces', 'reactions'
    """
    pass

# Simply supported truss beam: 4 nodes, 5 bars, pinned at 0 and 3
# Node layout:
#   0 ------ 1 ------ 2 ------ 3
#    \\      / \\      / \\      /
#     (diagonal bars not shown for clarity)
# Actually a Pratt configuration:
nodes = np.array([[0.,0.],[1.,0.],[2.,0.],[3.,0.],
                  [0.5,1.],[1.5,1.],[2.5,1.]], dtype=float)
bars = [(0,1),(1,2),(2,3),(4,5),(5,6),   # bottom and top chords
        (0,4),(1,4),(1,5),(2,5),(2,6),(3,6)]  # verticals/diagonals

supports = [(0,0),(0,1),(3,1)]   # pin at node 0 (x,y), roller at node 3 (y only)
loads    = [(2, 1, -10.0)]       # 10 kN downward at mid-span node 2

result = solve_truss(nodes, bars, supports, loads)
if result is not None:
    print("Bar forces (kN):")
    for j, ((ni, nj), f) in enumerate(zip(bars, result['bar_forces'])):
        state = "T" if f > 0 else "C"
        print(f"  Bar {ni}-{nj}: {f:+.4f} kN ({state})")
    print("\\nReactions (kN):")
    for (node, dof), r in zip(supports, result['reactions']):
        direction = "x" if dof==0 else "y"
        print(f"  Node {node} {direction}: {r:+.4f} kN")`,
              output: '', status: 'idle', figureJson: null,
              testCode: `
import numpy as np
if 'solve_truss' not in dir():
    res = "ERROR: solve_truss not defined."
else:
    nodes = np.array([[0.,0.],[1.,0.],[2.,0.]], dtype=float)
    bars = [(0,1),(1,2)]
    supports = [(0,0),(0,1),(2,1)]
    loads = [(1,1,-10.0)]
    r = solve_truss(nodes, bars, supports, loads)
    if r is None:
        res = "ERROR: returned None — fill in the function."
    elif not isinstance(r, dict):
        res = "ERROR: must return a dict."
    elif 'bar_forces' not in r:
        res = "ERROR: dict missing 'bar_forces'."
    elif 'reactions' not in r:
        res = "ERROR: dict missing 'reactions'."
    else:
        reactions = np.array(r['reactions'])
        if not np.isclose(sum(r['reactions']), 10.0, atol=0.5):
            res = f"ERROR: sum of reactions should balance the 10kN load. Got sum={sum(r['reactions']):.4f}."
        else:
            res = f"SUCCESS: truss solved — {len(r['bar_forces'])} bar forces, {len(r['reactions'])} reactions."
res
`,
              hint: 'Build a (2n × n_bars+n_reactions) matrix. Each bar contributes ±cos/sin to the equilibrium of its two end nodes. Each support contributes a unit vector (1,0) or (0,1) at the support node. The RHS is the external load vector. Solve with np.linalg.solve.',
            },

          ], // end initialCells
        }, // end props
      }, // end visualization
    ], // end visualizations
  }, // end intuition
}
