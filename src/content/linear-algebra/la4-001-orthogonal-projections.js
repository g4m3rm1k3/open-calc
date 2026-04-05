export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la4-001',
  slug: 'orthogonal-projections',
  chapter: 'la4',
  order: 1,
  title: 'Orthogonal Projections',
  subtitle: 'The mathematical art of finding the closest point in a lower-dimensional space — the foundation of least squares, Gram-Schmidt, and SVD.',
  tags: ['orthogonal projection', 'projection matrix', 'scalar projection', 'vector projection', 'orthogonal decomposition', 'shadow', 'closest point'],
  aliases: 'projection shadow closest point orthogonal decomposition projection matrix perpendicular component least squares',

  // ── Hook ──────────────────────────────────────────────────────
  hook: {
    question: "You are standing beside a wall holding a flashlight straight up at the ceiling. The light casts a shadow of your arm on the floor. What does that shadow have to do with solving equations?",
    realWorldContext: "Projections are the geometric engine behind an enormous range of real-world tools. Computer graphics uses projections to flatten 3D scenes onto 2D screens. GPS receivers project their position estimate onto the most likely path. Audio engineers project sound signals onto frequency bases to do equalization. Every time you use Google Maps navigation, a smartphone camera, a noise-canceling headphone, or a recommendation algorithm, orthogonal projection is doing work under the hood.",
    previewVisualizationId: 'LALesson11_OrthogonalProjections',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You have spent all of Phase 3 studying square matrices — their eigenvectors, their diagonal form, and what complex eigenvalues mean. Phase 4 moves to a new question: what is the closest we can get to a target when we are constrained to a subspace? That question is answered by projection.',
      'Here is the core picture. Imagine a line drawn through the origin in 2D (or a plane in 3D). You have a target vector $\\mathbf{b}$ that does not lie on that line. The question is: what point ON the line is closest to $\\mathbf{b}$? The answer is the point you reach by dropping a perpendicular from $\\mathbf{b}$ straight down to the line. That foot of the perpendicular is the **orthogonal projection** of $\\mathbf{b}$.',
      'The word "orthogonal" means perpendicular. The projection is orthogonal because the error vector — the gap between $\\mathbf{b}$ and its projection — is perpendicular to the line (or subspace). This is not just aesthetically pleasing; it is the mathematical definition of "closest." Any other point on the line is farther from $\\mathbf{b}$ than the orthogonal projection, because the orthogonal path is the shortest path.',
      '**From a line to a subspace.** When the target line is spanned by a single unit vector $\\hat{u}$, the projection is $(\\mathbf{b} \\cdot \\hat{u})\\hat{u}$ — the dot product picks off how much of $\\mathbf{b}$ points in the $\\hat{u}$ direction, and then we scale $\\hat{u}$ by that amount. For a non-unit vector $\\mathbf{a}$, we need to divide by the length: $\\text{proj} = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}\\mathbf{a}$.',
      'When the subspace is larger — a plane in 3D, or the column space of a matrix $A$ — we need the full **projection matrix** $P = A(A^TA)^{-1}A^T$. Multiplying any vector $\\mathbf{b}$ by $P$ gives its orthogonal projection onto the column space of $A$.',
      '**The orthogonal decomposition.** Every vector can be split uniquely into two perpendicular pieces: the part inside the subspace (the projection) and the part outside (the error/residual). These two pieces are always perpendicular to each other. $\\mathbf{b} = \\underbrace{P\\mathbf{b}}_{\\text{in subspace}} + \\underbrace{(\\mathbf{b} - P\\mathbf{b})}_{\\perp \\text{ subspace}}$.',
      '**Where this is heading:** The projection formula $P = A(A^TA)^{-1}A^T$ is exactly what Gram-Schmidt uses to subtract contamination in each step. It is also exactly what Least Squares uses to find the best approximate solution to $A\\mathbf{x}=\\mathbf{b}$. And SVD generalizes it to reveal the projection structure of any matrix. This lesson is the foundation for everything in Phase 4.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 4 — Advanced Projections & SVD',
        body: '**Previous:** Phase 3 — Eigenvalues, Diagonalization, Complex Eigenvalues.\n**This lesson:** Orthogonal Projections — finding the closest point in a subspace; the perpendicularity condition.\n**Next:** Gram-Schmidt — using projection repeatedly to build a clean orthonormal basis.',
      },
      {
        type: 'insight',
        title: 'Why "Orthogonal" Means "Closest"',
        body: 'The Pythagorean theorem guarantees it. If $\\mathbf{p}$ is the projection and $\\mathbf{q}$ is any other point in the subspace, then $\\|\\mathbf{b} - \\mathbf{q}\\|^2 = \\|\\mathbf{b} - \\mathbf{p}\\|^2 + \\|\\mathbf{p} - \\mathbf{q}\\|^2 > \\|\\mathbf{b}-\\mathbf{p}\\|^2$.\n\nThe error at the orthogonal projection is the shortest possible error. No other point in the subspace is closer.',
      },
      {
        type: 'definition',
        title: 'The Two Projection Formulas',
        body: '**Onto a line** spanned by $\\mathbf{a}$:\n$$\\text{proj}_{\\mathbf{a}}\\mathbf{b} = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}\\,\\mathbf{a}$$\n\n**Onto the column space of $A$:**\n$$P\\mathbf{b} = A(A^TA)^{-1}A^T\\mathbf{b}$$',
      },
      {
        type: 'insight',
        title: 'The Orthogonal Decomposition',
        body: '\\mathbf{b} = \\underbrace{P\\mathbf{b}}_{\\text{projection (in subspace)}} + \\underbrace{\\mathbf{b} - P\\mathbf{b}}_{\\text{error (perpendicular to subspace)}}\n\nThese two pieces are always perpendicular. Their Pythagorean sum equals $\\|\\mathbf{b}\\|^2$.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson11_OrthogonalProjections',
        title: 'Orthogonal Projection onto a Line',
        mathBridge: 'Drag the red vector $\\mathbf{b}$ to different positions. The blue vector is the projection $\\mathbf{p}$ — the closest point on the line to $\\mathbf{b}$. The green vector is the error $\\mathbf{e} = \\mathbf{b} - \\mathbf{p}$. Confirm: the green error vector is always exactly perpendicular (90°) to the line, no matter where you drag $\\mathbf{b}$. That right angle is not a coincidence — it is the definition of orthogonal projection.',
        caption: 'The shadow on the line, with a perpendicular error vector.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      '**Projection onto a line.** Let $\\mathbf{a}$ span the line. We want to find the scalar $c$ such that $c\\mathbf{a}$ is the closest point on the line to $\\mathbf{b}$. The error $\\mathbf{e} = \\mathbf{b} - c\\mathbf{a}$ must be perpendicular to $\\mathbf{a}$:\n\n$$\\mathbf{a} \\cdot \\mathbf{e} = 0 \\quad \\Rightarrow \\quad \\mathbf{a} \\cdot (\\mathbf{b} - c\\mathbf{a}) = 0 \\quad \\Rightarrow \\quad c = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\mathbf{a} \\cdot \\mathbf{a}}$$\n\nThe projection is $\\mathbf{p} = c\\mathbf{a} = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}\\mathbf{a}$.',
      'The **projection matrix** for projecting onto the line spanned by $\\mathbf{a}$ is:\n\n$$P = \\frac{\\mathbf{a}\\mathbf{a}^T}{\\mathbf{a}^T\\mathbf{a}}$$\n\n(Note: $\\mathbf{a}\\mathbf{a}^T$ is an outer product — an $n\\times n$ rank-1 matrix. $\\mathbf{a}^T\\mathbf{a}$ is a scalar.)',
      '**Projection onto a subspace.** When the subspace is the column space of $A$ (with linearly independent columns), the same perpendicularity condition applies: the error $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ must be perpendicular to every column of $A$, meaning $A^T\\mathbf{e} = \\mathbf{0}$. This gives:\n\n$$A^T(\\mathbf{b} - A\\hat{\\mathbf{x}}) = \\mathbf{0} \\quad \\Rightarrow \\quad A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b} \\quad \\Rightarrow \\quad \\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b}$$\n\nThe projection of $\\mathbf{b}$ onto $\\text{col}(A)$ is then $\\mathbf{p} = A\\hat{\\mathbf{x}} = A(A^TA)^{-1}A^T\\mathbf{b} = P\\mathbf{b}$.',
      '**Key properties of the projection matrix $P = A(A^TA)^{-1}A^T$:**\n\n1. **Idempotent:** $P^2 = P$ — projecting twice gives the same result as projecting once.\n2. **Symmetric:** $P^T = P$.\n3. **$P\\mathbf{b}$ is always in $\\text{col}(A)$** by construction.\n4. **$(I - P)\\mathbf{b}$ is always perpendicular to $\\text{col}(A)$** — $(I-P)$ is the complementary projection onto the orthogonal complement.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Projection onto the Column Space of A',
        body: 'P = A(A^TA)^{-1}A^T \\\\[6pt] \\text{proj}_{\\text{col}(A)}\\,\\mathbf{b} = P\\mathbf{b}',
      },
      {
        type: 'theorem',
        title: 'Properties of Projection Matrices',
        body: 'P^2 = P \\quad \\text{(idempotent)} \\\\[4pt] P^T = P \\quad \\text{(symmetric)} \\\\[4pt] \\text{rank}(P) = \\dim(\\text{col}(A))',
      },
      {
        type: 'insight',
        title: 'Projection onto a Line: Scalar vs. Vector',
        body: 'The **scalar projection** of $\\mathbf{b}$ onto $\\hat{u}$: $\\;\\mathbf{b}\\cdot\\hat{u}$ (a number — how far along $\\hat{u}$)\n\nThe **vector projection**: $(\\mathbf{b}\\cdot\\hat{u})\\hat{u}$ (the actual closest point on the line)',
      },
    ],
    visualizations: [
      {
        id: 'ProjectionMatrixViz',
        title: 'Projection Matrix: P² = P',
        mathBridge: 'Apply the projection matrix $P$ to a vector $\\mathbf{b}$ — get $P\\mathbf{b}$. Now apply $P$ again to that result: $P(P\\mathbf{b})$. Watch: nothing changes. The projected vector is already on the subspace — projecting again is a no-op. This is $P^2 = P$ in action. Drag $\\mathbf{b}$ to different positions and verify the double-projection always gives the same result as a single projection.',
        caption: 'Projecting twice = projecting once. That is idempotency.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Orthogonal Projections',
        mathBridge: 'proj_a(b) = (a·b / a·a) * a. Projection matrix: P = a @ a.T / (a.T @ a). For subspace: P = A @ inv(A.T @ A) @ A.T. Verify P² = P and P = Pᵀ.',
        caption: 'Compute vector projections, build projection matrices, and verify the idempotency property.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Vector projection onto a line',
              prose: [
                'The projection of **b** onto the line spanned by **a** is the closest point on that line to **b**.',
                'Formula: proj = (a·b / a·a) × a. The error e = b − proj is always perpendicular to a.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER, GREEN

a = np.array([4.0, 0.0])   # the line direction
b = np.array([3.0, 3.0])   # the vector to project

proj = (np.dot(a, b) / np.dot(a, a)) * a
error = b - proj

print(f"a = {a},  b = {b}")
print(f"proj_a(b) = {proj}")
print(f"error = b - proj = {error}")
print(f"perpendicular check: a · error = {np.dot(a, error):.10f}  (should be 0)")

fig = Figure(square=True, xmin=-1, xmax=5, ymin=-1, ymax=5,
             title="Projection of b onto a")
fig.grid().axes()
fig.vector(a.tolist(), color=BLUE, label="a")
fig.vector(b.tolist(), color=AMBER, label="b")
fig.vector(proj.tolist(), color=GREEN, label="proj")
fig.arrow(proj.tolist(), b.tolist(), color=AMBER, dashed=True, label="error")
fig.show()`,
            },
            {
              id: 2,
              cellTitle: 'Projection matrix P and idempotency P² = P',
              prose: [
                'The projection matrix P = aaᵀ / aᵀa projects any vector onto the line spanned by a in one multiplication.',
                'Key property: P² = P (idempotent). Projecting twice gives the same result — the projected vector is already on the line.',
              ],
              code: `import numpy as np

a = np.array([[4.0], [0.0]])   # column vector (2×1)

# Projection matrix: P = aaᵀ / (aᵀa)
P = (a @ a.T) / float(a.T @ a)
print("Projection matrix P:")
print(P)
print()

# Verify idempotency: P² = P
P2 = P @ P
print("P² =")
print(P2)
print()
print("P² = P?", np.allclose(P2, P))

# Verify symmetry: Pᵀ = P
print("P symmetric?", np.allclose(P.T, P))`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Projection onto a subspace',
              difficulty: 'hard',
              prompt: 'Build the projection matrix onto the column space of A = [[1,0],[1,1],[0,1]] (a plane in 3D). Use P = A(AᵀA)⁻¹Aᵀ. Then project b = [1,2,3] onto that plane. Verify P² = P and Pᵀ = P. Also verify that the error e = b − Pb is perpendicular to both columns of A.',
              code: `import numpy as np

A = np.array([[1., 0.],
              [1., 1.],
              [0., 1.]])
b = np.array([1., 2., 3.])

# P = A @ inv(A.T @ A) @ A.T
# proj = P @ b
# error = b - proj
# verify P² = P, Pᵀ = P
# verify A.T @ error ≈ 0
`,
              hint: 'P = A @ np.linalg.inv(A.T @ A) @ A.T. Check np.allclose(P @ P, P) for idempotency. np.allclose(A.T @ (b - P @ b), 0) for perpendicularity.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Orthogonal Decomposition Theorem.** Let $W$ be a subspace of $\\mathbb{R}^n$. Every vector $\\mathbf{y} \\in \\mathbb{R}^n$ can be written uniquely as:\n\n$$\\mathbf{y} = \\hat{\\mathbf{y}} + \\mathbf{z}, \\quad \\hat{\\mathbf{y}} \\in W, \\quad \\mathbf{z} \\in W^\\perp$$\n\nwhere $W^\\perp$ is the **orthogonal complement** of $W$ — the set of all vectors perpendicular to every vector in $W$. The vector $\\hat{\\mathbf{y}}$ is the orthogonal projection of $\\mathbf{y}$ onto $W$.',
      '**Best Approximation Theorem.** If $\\hat{\\mathbf{y}}$ is the orthogonal projection of $\\mathbf{y}$ onto $W$, then $\\hat{\\mathbf{y}}$ is the closest vector in $W$ to $\\mathbf{y}$:\n\n$$\\|\\mathbf{y} - \\hat{\\mathbf{y}}\\| \\leq \\|\\mathbf{y} - \\mathbf{v}\\| \\quad \\text{for all } \\mathbf{v} \\in W$$\n\nEquality holds only if $\\mathbf{v} = \\hat{\\mathbf{y}}$.',
      '**Proof of the Best Approximation Theorem.** For any $\\mathbf{v} \\in W$, write $\\mathbf{y} - \\mathbf{v} = (\\mathbf{y} - \\hat{\\mathbf{y}}) + (\\hat{\\mathbf{y}} - \\mathbf{v})$. The first term is in $W^\\perp$ and the second is in $W$, so they are orthogonal. By the Pythagorean theorem:\n\n$$\\|\\mathbf{y}-\\mathbf{v}\\|^2 = \\|\\mathbf{y}-\\hat{\\mathbf{y}}\\|^2 + \\|\\hat{\\mathbf{y}}-\\mathbf{v}\\|^2 \\geq \\|\\mathbf{y}-\\hat{\\mathbf{y}}\\|^2$$\n\nThe inequality is strict unless $\\hat{\\mathbf{y}} = \\mathbf{v}$.',
      '**The four fundamental subspaces.** For an $m\\times n$ matrix $A$: the column space $\\text{col}(A)$ and the left null space $\\text{null}(A^T)$ are orthogonal complements in $\\mathbb{R}^m$. The row space $\\text{row}(A)$ and the null space $\\text{null}(A)$ are orthogonal complements in $\\mathbb{R}^n$. The projection onto $\\text{col}(A)$ is $P = A(A^TA)^{-1}A^T$, and the projection onto $\\text{null}(A^T)$ is $I - P$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Orthogonal Decomposition Theorem',
        body: '\\mathbf{y} = \\hat{\\mathbf{y}} + \\mathbf{z}, \\quad \\hat{\\mathbf{y}} \\in W, \\quad \\mathbf{z} \\in W^\\perp\n\nThe decomposition is unique. $\\hat{\\mathbf{y}}$ is the orthogonal projection of $\\mathbf{y}$ onto $W$.',
      },
      {
        type: 'theorem',
        title: 'Best Approximation Theorem',
        body: 'The orthogonal projection $\\hat{\\mathbf{y}} = P\\mathbf{y}$ is the unique closest point in $W$ to $\\mathbf{y}$.\n\n$$\\|\\mathbf{y} - P\\mathbf{y}\\| < \\|\\mathbf{y} - \\mathbf{v}\\| \\quad \\forall\\, \\mathbf{v} \\in W, \\mathbf{v} \\neq P\\mathbf{y}$$',
      },
    ],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'la4-001-ex1',
      title: 'Projecting a Vector onto a Line in ℝ³',
      problem: 'Project $\\mathbf{b} = \\begin{bmatrix}1\\\\2\\\\3\\end{bmatrix}$ onto the line spanned by $\\mathbf{a} = \\begin{bmatrix}1\\\\1\\\\1\\end{bmatrix}$. Find the projection $\\mathbf{p}$ and the error $\\mathbf{e}$, and verify that $\\mathbf{e} \\perp \\mathbf{a}$.',
      steps: [
        {
          expression: 'c = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}} = \\frac{(1)(1)+(1)(2)+(1)(3)}{(1)^2+(1)^2+(1)^2} = \\frac{6}{3} = 2',
          annotation: 'Compute the scalar projection: how far along $\\mathbf{a}$ does $\\mathbf{b}$ extend?',
          strategyTitle: 'Scalar projection',
          checkpoint: 'What does $c = 2$ mean?',
          hints: ['It means $\\mathbf{b}$ extends exactly 2 units in the direction of $\\mathbf{a}$ (measured in units of $|\\mathbf{a}|$).'],
        },
        {
          expression: '\\mathbf{p} = c\\,\\mathbf{a} = 2\\begin{bmatrix}1\\\\1\\\\1\\end{bmatrix} = \\begin{bmatrix}2\\\\2\\\\2\\end{bmatrix}',
          annotation: 'Scale $\\mathbf{a}$ by $c$ to get the projection vector.',
          strategyTitle: 'Vector projection',
          checkpoint: 'Does $\\mathbf{p}$ lie on the line spanned by $\\mathbf{a}$?',
          hints: ['Yes — $\\mathbf{p} = 2\\mathbf{a}$, so it is on the line by definition.'],
        },
        {
          expression: '\\mathbf{e} = \\mathbf{b} - \\mathbf{p} = \\begin{bmatrix}1\\\\2\\\\3\\end{bmatrix} - \\begin{bmatrix}2\\\\2\\\\2\\end{bmatrix} = \\begin{bmatrix}-1\\\\0\\\\1\\end{bmatrix}',
          annotation: 'The error vector — the component of $\\mathbf{b}$ that is NOT in the direction of $\\mathbf{a}$.',
          strategyTitle: 'Error vector',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{a} \\cdot \\mathbf{e} = (1)(-1) + (1)(0) + (1)(1) = 0 \\quad ✓',
          annotation: 'Verify orthogonality: the error is perpendicular to the line. This must always be true for an orthogonal projection.',
          strategyTitle: 'Verify orthogonality',
          checkpoint: 'What would a non-zero dot product here mean?',
          hints: ['It would mean the projection was wrong — there is still some component of the error pointing in the direction of $\\mathbf{a}$, meaning we could do better.'],
        },
      ],
      conclusion: 'The projection of $[1,2,3]^T$ onto the line $[1,1,1]^T$ is $[2,2,2]^T$. The error $[-1,0,1]^T$ is perpendicular to the line. Together they add up to $\\mathbf{b}$ — the orthogonal decomposition.',
    },
    {
      id: 'la4-001-ex2',
      title: 'Computing a Projection Matrix and Applying It',
      problem: 'Find the projection matrix $P$ that projects any vector onto the line spanned by $\\mathbf{a} = \\begin{bmatrix}1\\\\2\\end{bmatrix}$, then project $\\mathbf{b} = \\begin{bmatrix}3\\\\1\\end{bmatrix}$ using $P$.',
      steps: [
        {
          expression: 'P = \\frac{\\mathbf{a}\\mathbf{a}^T}{\\mathbf{a}^T\\mathbf{a}} = \\frac{1}{5}\\begin{bmatrix}1\\\\2\\end{bmatrix}\\begin{bmatrix}1&2\\end{bmatrix} = \\frac{1}{5}\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}',
          annotation: '$\\mathbf{a}^T\\mathbf{a} = 1^2+2^2=5$. The outer product $\\mathbf{a}\\mathbf{a}^T$ is a $2\\times 2$ matrix (not a number!).',
          strategyTitle: 'Build projection matrix',
          checkpoint: 'Check: $P$ is symmetric ($P^T = P$). Verify.',
          hints: ['The $(1,2)$ entry is $2/5$ and the $(2,1)$ entry is $2/5$. They match — $P$ is symmetric. ✓'],
        },
        {
          expression: 'P\\mathbf{b} = \\frac{1}{5}\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}\\begin{bmatrix}3\\\\1\\end{bmatrix} = \\frac{1}{5}\\begin{bmatrix}5\\\\10\\end{bmatrix} = \\begin{bmatrix}1\\\\2\\end{bmatrix}',
          annotation: 'Apply $P$ to $\\mathbf{b}$. The result is the projection.',
          strategyTitle: 'Project using P',
          checkpoint: 'Is $P\\mathbf{b}$ on the line spanned by $\\mathbf{a} = [1,2]^T$?',
          hints: ['$P\\mathbf{b} = [1,2]^T = 1 \\cdot \\mathbf{a}$. Yes — it is exactly on the line. ✓'],
        },
        {
          expression: 'P^2 = P \\cdot P = \\frac{1}{5}\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix} \\cdot \\frac{1}{5}\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix} = \\frac{1}{25}\\begin{bmatrix}5&10\\\\10&20\\end{bmatrix} = \\frac{1}{5}\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix} = P \\quad ✓',
          annotation: 'Verify idempotency: $P^2 = P$. Once projected onto the line, re-projecting changes nothing.',
          strategyTitle: 'Verify P² = P',
          checkpoint: '',
          hints: [],
        },
      ],
      conclusion: 'The projection matrix $P = \\frac{1}{5}\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$ projects any vector onto the line $\\mathbf{a} = [1,2]^T$. Applied to $\\mathbf{b} = [3,1]^T$, it gives $[1,2]^T$. The idempotency $P^2 = P$ confirms correctness.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'la4-001-ch1',
      difficulty: 'easy',
      problem: 'Project $\\mathbf{b} = \\begin{bmatrix}4\\\\3\\end{bmatrix}$ onto the line spanned by $\\mathbf{a} = \\begin{bmatrix}1\\\\0\\end{bmatrix}$ (the $x$-axis). What is the projection?',
      hint: 'The $x$-axis is a unit vector. The projection formula simplifies to just the $x$-component.',
      walkthrough: [
        {
          expression: 'c = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}} = \\frac{4}{1} = 4',
          annotation: '$\\mathbf{a}$ is a unit vector so $\\mathbf{a}\\cdot\\mathbf{a}=1$.',
        },
        {
          expression: '\\mathbf{p} = 4\\begin{bmatrix}1\\\\0\\end{bmatrix} = \\begin{bmatrix}4\\\\0\\end{bmatrix}',
          annotation: 'The projection strips out the $y$-component, keeping only the $x$. Exactly what dropping a perpendicular to the $x$-axis does.',
        },
      ],
      answer: 'p = [4, 0]ᵀ',
    },
    {
      id: 'la4-001-ch2',
      difficulty: 'medium',
      problem: 'Verify that the projection matrix $P = \\frac{1}{5}\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$ (from Example 2) satisfies $P + (I-P) = I$, and show that $(I-P)\\mathbf{b}$ is perpendicular to $P\\mathbf{b}$ for $\\mathbf{b} = [3,1]^T$.',
      hint: 'Compute $(I-P)$, apply it to $\\mathbf{b}$, then take the dot product with $P\\mathbf{b}$.',
      walkthrough: [
        {
          expression: 'I - P = \\begin{bmatrix}1&0\\\\0&1\\end{bmatrix} - \\frac{1}{5}\\begin{bmatrix}1&2\\\\2&4\\end{bmatrix} = \\frac{1}{5}\\begin{bmatrix}4&-2\\\\-2&1\\end{bmatrix}',
          annotation: 'The complementary projection — projects onto the orthogonal complement of the line.',
        },
        {
          expression: '(I-P)\\mathbf{b} = \\frac{1}{5}\\begin{bmatrix}4&-2\\\\-2&1\\end{bmatrix}\\begin{bmatrix}3\\\\1\\end{bmatrix} = \\frac{1}{5}\\begin{bmatrix}10\\\\-5\\end{bmatrix} = \\begin{bmatrix}2\\\\-1\\end{bmatrix}',
          annotation: 'The error component — perpendicular to the line.',
        },
        {
          expression: 'P\\mathbf{b} \\cdot (I-P)\\mathbf{b} = \\begin{bmatrix}1\\\\2\\end{bmatrix}\\cdot\\begin{bmatrix}2\\\\-1\\end{bmatrix} = 2 - 2 = 0 \\quad ✓',
          annotation: 'The two components are perpendicular — the orthogonal decomposition is confirmed.',
        },
      ],
      answer: '(I-P)b = [2,-1]ᵀ, dot product with Pb = 0 ✓',
    },
    {
      id: 'la4-001-ch3',
      difficulty: 'hard',
      problem: 'If $\\mathbf{a}$ is already a unit vector ($\\|\\mathbf{a}\\| = 1$), show that the projection matrix simplifies to $P = \\mathbf{a}\\mathbf{a}^T$. Then show $P^2 = P$ using this simplified form.',
      hint: 'Substitute $\\|\\mathbf{a}\\|^2 = 1$ into $P = \\frac{\\mathbf{a}\\mathbf{a}^T}{\\mathbf{a}^T\\mathbf{a}}$. For $P^2$, compute $P \\cdot P$ and use $\\mathbf{a}^T\\mathbf{a} = 1$.',
      walkthrough: [
        {
          expression: 'P = \\frac{\\mathbf{a}\\mathbf{a}^T}{\\mathbf{a}^T\\mathbf{a}} = \\frac{\\mathbf{a}\\mathbf{a}^T}{1} = \\mathbf{a}\\mathbf{a}^T',
          annotation: 'Since $\\|\\mathbf{a}\\|^2 = \\mathbf{a}^T\\mathbf{a} = 1$, the denominator is 1.',
        },
        {
          expression: 'P^2 = (\\mathbf{a}\\mathbf{a}^T)(\\mathbf{a}\\mathbf{a}^T) = \\mathbf{a}(\\mathbf{a}^T\\mathbf{a})\\mathbf{a}^T = \\mathbf{a}(1)\\mathbf{a}^T = \\mathbf{a}\\mathbf{a}^T = P',
          annotation: 'Group the middle: $\\mathbf{a}^T\\mathbf{a} = 1$ (scalar). Associativity gives $P^2 = P$.',
        },
      ],
      answer: 'P = aaᵀ (unit vector case); P² = a(aᵀa)aᵀ = a(1)aᵀ = aaᵀ = P ✓',
    },
  ],

  // ── Semantics ────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: 'c = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}', meaning: 'Scalar projection — how far along a does b extend (in units of |a|)' },
      { symbol: '\\mathbf{p} = c\\,\\mathbf{a}', meaning: 'Vector projection — the closest point on the line to b' },
      { symbol: 'P = A(A^TA)^{-1}A^T', meaning: 'Projection matrix onto col(A) — maps any b to its closest point in the column space' },
      { symbol: 'P^2 = P', meaning: 'Idempotency — projecting twice is the same as projecting once' },
      { symbol: '\\mathbf{b} = P\\mathbf{b} + (I-P)\\mathbf{b}', meaning: 'Orthogonal decomposition — projection plus perpendicular error' },
    ],
    rulesOfThumb: [
      'The error e = b - proj is always perpendicular to the subspace. Always check a·e = 0.',
      'Unit vector projection: p = (b·û)û — dot product gives the scalar, then scale û.',
      'Projection matrix: symmetric (Pᵀ = P) and idempotent (P² = P). Verify both.',
      '(I - P) projects onto the orthogonal complement — the part P misses.',
    ],
  },

  // ── Spiral ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'la1-003',
        label: 'Dot Product',
        note: 'The scalar projection $c = \\mathbf{a}\\cdot\\mathbf{b}/\\mathbf{a}\\cdot\\mathbf{a}$ is built entirely from dot products. The perpendicularity condition $\\mathbf{a}\\cdot\\mathbf{e}=0$ is also a dot product condition.',
      },
    ],
    futureLinks: [
      {
        lessonId: 'la4-002',
        label: 'Gram-Schmidt',
        note: 'Every subtraction step in Gram-Schmidt is exactly: $\\mathbf{v}_j \\leftarrow \\mathbf{v}_j - \\text{proj}_{\\mathbf{e}_i}\\mathbf{v}_j$. Gram-Schmidt is projection used as a cleaning tool, applied repeatedly.',
      },
      {
        lessonId: 'la4-003',
        label: 'Least Squares',
        note: 'The least squares solution makes $A\\hat{\\mathbf{x}}$ the orthogonal projection of $\\mathbf{b}$ onto $\\text{col}(A)$. The projection matrix $P = A(A^TA)^{-1}A^T$ from this lesson is exactly the least squares projection matrix.',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Projection = shadow; drop a perpendicular to the subspace.',
    'The error (b - proj) is always perpendicular to the subspace. Always.',
    'Closer than the projection? Impossible — Pythagorean theorem proves it.',
    'Projection matrix: P² = P, Pᵀ = P. Two ways to verify correctness.',
    'I - P gives the complementary projection onto the orthogonal complement.',
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

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la4-001-assess-1',
        type: 'input',
        text: 'What is the dot product of the error vector $\\mathbf{e} = \\mathbf{b} - \\mathbf{p}$ and the projection direction $\\mathbf{a}$, for any valid orthogonal projection?',
        answer: '0',
        hint: 'Orthogonal means perpendicular means dot product = 0.',
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'orthogonal-projections-q1',
      type: 'choice',
      text: 'Why is the orthogonal projection the CLOSEST point in the subspace to $\\mathbf{b}$?',
      options: [
        'Because the projection formula always gives the smallest vector',
        'Because the Pythagorean theorem shows any other point has a strictly larger distance, since the error and the distance between projection points form a right triangle',
        'Because projections always land at the origin',
        'Because we defined "closest" to mean "orthogonal"',
      ],
      answer: 'Because the Pythagorean theorem shows any other point has a strictly larger distance, since the error and the distance between projection points form a right triangle',
      hints: ['For any other point $\\mathbf{q}$ in the subspace: $\\|\\mathbf{b}-\\mathbf{q}\\|^2 = \\|\\mathbf{b}-\\mathbf{p}\\|^2 + \\|\\mathbf{p}-\\mathbf{q}\\|^2 \\geq \\|\\mathbf{b}-\\mathbf{p}\\|^2$.'],
      reviewSection: 'Intuition tab — Why "Orthogonal" Means "Closest"',
    },
    {
      id: 'orthogonal-projections-q2',
      type: 'choice',
      text: 'A projection matrix $P$ satisfies $P^2 = P$. What does this mean geometrically?',
      options: [
        'Applying $P$ twice doubles the result',
        'Once a vector is projected onto the subspace, projecting it again leaves it unchanged',
        'The projection matrix is invertible',
        '$P$ maps everything to the origin',
      ],
      answer: 'Once a vector is projected onto the subspace, projecting it again leaves it unchanged',
      hints: ['After one projection, the vector already lives in the subspace. A second projection onto the same subspace does nothing.'],
      reviewSection: 'Math tab — Properties of Projection Matrices',
    },
    {
      id: 'orthogonal-projections-q3',
      type: 'input',
      text: 'Project $\\mathbf{b} = [6, 0]^T$ onto the line spanned by $\\mathbf{a} = [1, 0]^T$. What is the $x$-component of the projection?',
      answer: '6',
      hints: ['$c = \\mathbf{a}\\cdot\\mathbf{b}/\\mathbf{a}\\cdot\\mathbf{a} = 6/1 = 6$. Projection $= 6[1,0]^T = [6,0]^T$.'],
      reviewSection: 'Math tab — Projection onto a Line',
    },
    {
      id: 'orthogonal-projections-q4',
      type: 'choice',
      text: 'For $\\mathbf{b} = [3,4]^T$ and $\\mathbf{a} = [1,0]^T$, what is the error vector $\\mathbf{e} = \\mathbf{b} - \\mathbf{p}$?',
      options: ['$[3,0]^T$', '$[0,4]^T$', '$[3,4]^T$', '$[0,0]^T$'],
      answer: '$[0,4]^T$',
      hints: ['Projection onto the $x$-axis: $\\mathbf{p} = [3,0]^T$. Error: $\\mathbf{e} = [3,4]^T - [3,0]^T = [0,4]^T$. It points straight up — perpendicular to the $x$-axis. ✓'],
      reviewSection: 'Examples tab — Error Vector',
    },
  ],
};
