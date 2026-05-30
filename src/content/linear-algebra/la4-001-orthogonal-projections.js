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
      'Take $\\mathbf{b} = [3,4]^\\top$ and the $x$-axis spanned by $\\mathbf{a} = [1,0]^\\top$. The point on the $x$-axis closest to $\\mathbf{b}$: drop a perpendicular and land at $\\mathbf{p} = [3,0]^\\top$. Error: $\\mathbf{e} = \\mathbf{b} - \\mathbf{p} = [0,4]^\\top$. Check perpendicularity: $\\mathbf{a} \\cdot \\mathbf{e} = 1\\cdot 0 + 0\\cdot 4 = 0$ ✓. The formula: $c = \\mathbf{a}^\\top\\mathbf{b}/\\mathbf{a}^\\top\\mathbf{a} = 3/1 = 3$, so $\\mathbf{p} = 3\\mathbf{a} = [3,0]^\\top$. That perpendicularity condition $\\mathbf{a}\\cdot(\\mathbf{b}-c\\mathbf{a}) = 0$ is what determines $c$ — and why orthogonal projection is the closest point.',
      'Here is the core picture. Imagine a line drawn through the origin in 2D (or a plane in 3D). You have a target vector $\\mathbf{b}$ that does not lie on that line. The question is: what point ON the line is closest to $\\mathbf{b}$? The answer is the point you reach by dropping a perpendicular from $\\mathbf{b}$ straight down to the line. That foot of the perpendicular is the **orthogonal projection** of $\\mathbf{b}$.',
      'The word "orthogonal" means perpendicular. The projection is orthogonal because the error vector — the gap between $\\mathbf{b}$ and its projection — is perpendicular to the line (or subspace). This is not just aesthetically pleasing; it is the mathematical definition of "closest." Any other point on the line is farther from $\\mathbf{b}$ than the orthogonal projection, because the orthogonal path is the shortest path.',
      '**From a line to a subspace.** When the target line is spanned by a single unit vector $\\hat{u}$, the projection is $(\\mathbf{b} \\cdot \\hat{u})\\hat{u}$ — the dot product picks off how much of $\\mathbf{b}$ points in the $\\hat{u}$ direction, and then we scale $\\hat{u}$ by that amount. For a non-unit vector $\\mathbf{a}$, we need to divide by the length: $\\text{proj} = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}\\mathbf{a}$.',
      'When the subspace is larger — a plane in 3D, or the column space of a matrix $A$ — we need the full **projection matrix** $P = A(A^TA)^{-1}A^T$. Multiplying any vector $\\mathbf{b}$ by $P$ gives its orthogonal projection onto the column space of $A$.',
      '**The orthogonal decomposition.** Every vector can be split uniquely into two perpendicular pieces: the part inside the subspace (the projection) and the part outside (the error/residual). These two pieces are always perpendicular to each other. $\\mathbf{b} = \\underbrace{P\\mathbf{b}}_{\\text{in subspace}} + \\underbrace{(\\mathbf{b} - P\\mathbf{b})}_{\\perp \\text{ subspace}}$.',
      '**CNC application: closest point on a tool path.** In 5-axis CNC, the controller continuously checks whether the tool tip is on the programmed path. Given the current tool position $\\mathbf{b}$ and a programmed path segment spanned by direction $\\mathbf{a}$ (from the last waypoint), the closest point on the path to the tool tip is exactly the orthogonal projection $\\text{proj}_{\\mathbf{a}}\\mathbf{b}$. The error $\\mathbf{e} = \\mathbf{b} - \\text{proj}$ is the perpendicular deviation from the path — the **cross-track error** that the servo controller must correct. Minimizing cross-track error is projection in action at thousands of times per second.',
      '**Where this is heading:** The projection formula $P = A(A^TA)^{-1}A^T$ is exactly what Gram-Schmidt uses to subtract contamination in each step. It is also exactly what Least Squares uses to find the best approximate solution to $A\\mathbf{x}=\\mathbf{b}$. And SVD generalizes it to reveal the projection structure of any matrix. This lesson is the foundation for everything in Phase 4.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 9 — Orthogonality & SVD',
        body: '**Previous:** Phase 3 — Eigenvalues, Diagonalization, Complex Eigenvalues.\n**This lesson:** Orthogonal Projections — finding the closest point in a subspace; the perpendicularity condition.\n**Next:** Gram-Schmidt — using projection repeatedly to build a clean orthonormal basis.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Compute an Orthogonal Projection',
        body: 'Step 1. **Identify the subspace.** Determine the direction vector $\\mathbf{a}$ (for a line) or the basis matrix $A$ (for a higher-dimensional subspace, with columns as basis vectors).\n\nStep 2. **Compute the scalar coefficient.** For a line: $c = \\mathbf{a}^\\top \\mathbf{b} / \\mathbf{a}^\\top \\mathbf{a}$.\n\nStep 3. **Compute the projection.** For a line: $\\mathbf{p} = c\\mathbf{a}$. For a subspace (column space of $A$): $\\mathbf{p} = A(A^\\top A)^{-1}A^\\top \\mathbf{b} = P\\mathbf{b}$.\n\nStep 4. **Compute the error.** $\\mathbf{e} = \\mathbf{b} - \\mathbf{p}$.\n\nStep 5. **Verify perpendicularity.** Check $\\mathbf{a}^\\top \\mathbf{e} = 0$ (line) or $A^\\top \\mathbf{e} = \\mathbf{0}$ (subspace). Also verify $P^2 = P$ and $P^\\top = P$.',
      },
      {
        type: 'insight',
        title: 'Why "Orthogonal" Means "Closest"',
        body: 'The Pythagorean theorem guarantees it. If $\\mathbf{p}$ is the projection and $\\mathbf{q}$ is any other point in the subspace, then $\\|\\mathbf{b} - \\mathbf{q}\\|^2 = \\|\\mathbf{b} - \\mathbf{p}\\|^2 + \\|\\mathbf{p} - \\mathbf{q}\\|^2 > \\|\\mathbf{b}-\\mathbf{p}\\|^2$.\n\nThe error at the orthogonal projection is the shortest possible error. No other point in the subspace is closer.',
      },
      {
        type: 'definition',
        title: 'The Two Projection Formulas',
        body: '**Onto a line** spanned by $\\mathbf{a}$:\n$\\text{proj}_{\\mathbf{a}}\\mathbf{b} = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}\\,\\mathbf{a}$\n\n**Onto the column space of $A$:**\n$P\\mathbf{b} = A(A^TA)^{-1}A^T\\mathbf{b}$',
      },
      {
        type: 'insight',
        title: 'The Orthogonal Decomposition',
        body: '\\mathbf{b} = \\underbrace{P\\mathbf{b}}_{\\text{projection (in subspace)}} + \\underbrace{\\mathbf{b} - P\\mathbf{b}}_{\\text{error (perpendicular to subspace)}}\n\nThese two pieces are always perpendicular. Their Pythagorean sum equals $\\|\\mathbf{b}\\|^2$.',
      },
      {
        type: 'insight',
        title: 'Predict: Projection onto a Line',
        body: 'For $\\mathbf{b} = [2,5]^\\top$ and the line spanned by $\\mathbf{a} = [3,4]^\\top$: before computing, estimate the projection. Is it closer to $[0,0]^\\top$ or to $\\mathbf{b}$? Predict $c = \\mathbf{a}\\cdot\\mathbf{b}/\\mathbf{a}\\cdot\\mathbf{a}$ — is $c < 1$ or $c > 1$? Then verify: does the error vector $\\mathbf{e} = \\mathbf{b} - c\\mathbf{a}$ dot with $\\mathbf{a}$ to give 0?',
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
      '**Projection onto a line.** Let $\\mathbf{a}$ span the line. We want to find the scalar $c$ such that $c\\mathbf{a}$ is the closest point on the line to $\\mathbf{b}$. The error $\\mathbf{e} = \\mathbf{b} - c\\mathbf{a}$ must be perpendicular to $\\mathbf{a}$:\n\n$\\mathbf{a} \\cdot \\mathbf{e} = 0 \\quad \\Rightarrow \\quad \\mathbf{a} \\cdot (\\mathbf{b} - c\\mathbf{a}) = 0 \\quad \\Rightarrow \\quad c = \\frac{\\mathbf{a} \\cdot \\mathbf{b}}{\\mathbf{a} \\cdot \\mathbf{a}}$\n\nThe projection is $\\mathbf{p} = c\\mathbf{a} = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}\\mathbf{a}$.',
      'The **projection matrix** for projecting onto the line spanned by $\\mathbf{a}$ is:\n\n$P = \\frac{\\mathbf{a}\\mathbf{a}^T}{\\mathbf{a}^T\\mathbf{a}}$\n\n(Note: $\\mathbf{a}\\mathbf{a}^T$ is an outer product — an $n\\times n$ rank-1 matrix. $\\mathbf{a}^T\\mathbf{a}$ is a scalar.)',
      '**Projection onto a subspace.** When the subspace is the column space of $A$ (with linearly independent columns), the same perpendicularity condition applies: the error $\\mathbf{e} = \\mathbf{b} - A\\hat{\\mathbf{x}}$ must be perpendicular to every column of $A$, meaning $A^T\\mathbf{e} = \\mathbf{0}$. This gives:\n\n$A^T(\\mathbf{b} - A\\hat{\\mathbf{x}}) = \\mathbf{0} \\quad \\Rightarrow \\quad A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b} \\quad \\Rightarrow \\quad \\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b}$\n\nThe projection of $\\mathbf{b}$ onto $\\text{col}(A)$ is then $\\mathbf{p} = A\\hat{\\mathbf{x}} = A(A^TA)^{-1}A^T\\mathbf{b} = P\\mathbf{b}$.',
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
        id: 'OpenMatNotebook',
        title: 'OpenMAT: Orthogonal Projections and the CNC Cross-Track Error',
        mathBridge: 'MATLAB: scalar projection = dot(a,b)/dot(a,a). Projection matrix P = a*a\' / (a\'*a). Subspace projection P = A*inv(A\'*A)*A\'. Verify P^2 = P and P\' = P.',
        caption: 'Three cells: scalar and vector projection, projection matrix properties, and CNC cross-track error calculation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Scalar and vector projection onto a line',
              prose: [
                '`dot(a,b)` computes the dot product. Scalar projection c = dot(a,b)/dot(a,a). Vector projection p = c*a.',
                'The error e = b - p must satisfy dot(a,e) ≈ 0 (perpendicularity).',
                'The scalar projection formula $c = \\frac{\\mathbf{a}\\cdot\\mathbf{b}}{\\mathbf{a}\\cdot\\mathbf{a}}$ is exactly the solution to the normal equation $\\mathbf{a}^T(\\mathbf{b} - c\\mathbf{a}) = 0$ — minimize $\\|\\mathbf{b} - c\\mathbf{a}\\|^2$ by setting the derivative to zero. This makes orthogonal projection the 1D special case of least squares: "find the scalar $c$ such that $c\\mathbf{a}$ is closest to $\\mathbf{b}$." The perpendicularity check `dot(a, e) < 1e-10` confirms the Pythagorean theorem: $\\|\\mathbf{b}\\|^2 = \\|\\mathbf{p}\\|^2 + \\|\\mathbf{e}\\|^2$.',
              ],
              code: `a = [1; 1; 1];    % line direction
b = [1; 2; 3];    % vector to project

c = dot(a, b) / dot(a, a);
p = c * a;
e = b - p;

fprintf('Scalar projection c = %.4f\\n', c)
fprintf('Vector projection p = [%.4f; %.4f; %.4f]\\n', p(1), p(2), p(3))
fprintf('Error e             = [%.4f; %.4f; %.4f]\\n', e(1), e(2), e(3))
fprintf('Perpendicularity check: a·e = %.2e  (should be 0)\\n', dot(a, e))`,
            },
            {
              id: 2,
              cellTitle: 'Projection matrix: build it, verify P² = P and P = Pᵀ',
              prose: [
                'P = a*a\' / (a\'*a) is the projection matrix onto the line spanned by a.',
                'For subspace projection (column space of A): P = A*inv(A\'*A)*A\'.',
                'The idempotent property $P^2 = P$ is automatic: after the first projection, the vector is already in the column space of $A$, so projecting again does nothing. Verify: `P*P - P` should be the zero matrix. The complementary projector $I - P$ projects onto the null space of $A^T$ (the left null space) — and $(I-P)P = 0$ means the two projections are orthogonal: `rank(P) = rank(A)` tells you the dimension of the subspace being projected onto.',
              ],
              code: `% Projection onto a line
a = [1; 2];
P_line = a * a' / (a' * a);
fprintf('Projection matrix onto [1;2]:\\n'); disp(P_line)

% Verify P^2 = P
fprintf('P^2 - P (should be zero):\\n'); disp(P_line^2 - P_line)

% Projection onto a subspace (plane in 3D)
A = [1 0; 1 1; 0 1];   % two basis vectors for the plane
P_sub = A * inv(A' * A) * A';
fprintf('\\nProjection matrix onto plane in R^3 (3x3):\\n'); disp(P_sub)
fprintf('P symmetric (Pt - P, should be 0):\\n'); disp(P_sub' - P_sub)
fprintf('P idempotent (P^2 - P, should be 0):\\n'); disp(P_sub^2 - P_sub)`,
            },
            {
              id: 3,
              cellTitle: 'CNC cross-track error: closest point on a tool path segment',
              prose: [
                'The cross-track error is the perpendicular distance from the current tool position to the programmed path direction.',
                'Closest point on path = projection of tool position b onto path direction a. Cross-track error = ||b - proj||.',
                'The cross-track error is the perpendicular distance from the tool to the path — exactly $\\|\\mathbf{b} - \\text{proj}_{\\mathbf{a}}\\mathbf{b}\\|$. CNC controllers use this in real time: the tool\'s actual position $\\mathbf{b}$ (from encoder feedback) is projected onto the programmed path direction $\\mathbf{a}$, and the perpendicular component $\\mathbf{e}$ drives the correction. A cross-track error > 0 means the tool has drifted off the path; the controller applies a lateral correction proportional to $\\|\\mathbf{e}\\|$ to bring it back.',
              ],
              code: `% CNC: tool path from waypoint 1 to waypoint 2
wp1 = [10; 0; 5];   % mm — path start
wp2 = [50; 0; 5];   % mm — path end
b   = [30; 2; 5];   % mm — actual tool position (slight y-deviation)

% Path direction vector
a = wp2 - wp1;

% Current position relative to path start
b_rel = b - wp1;

% Projection (closest point on segment from wp1)
c = dot(a, b_rel) / dot(a, a);
c_clamped = max(0, min(1, c));  % keep within segment [0,1]
closest_point = wp1 + c_clamped * a;

% Cross-track error
cross_track = b - closest_point;
error_mag = norm(cross_track);

fprintf('Tool position:       [%.1f, %.1f, %.1f] mm\\n', b(1), b(2), b(3))
fprintf('Closest path point:  [%.1f, %.1f, %.1f] mm\\n', closest_point(1), closest_point(2), closest_point(3))
fprintf('Cross-track error:   %.4f mm\\n', error_mag)
fprintf('Direction of error:  [%.4f, %.4f, %.4f]\\n', cross_track(1)/error_mag, cross_track(2)/error_mag, cross_track(3)/error_mag)`,
            },
          ]
        }
      },
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
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Vector projection onto a line',
              prose: [
                'The projection of **b** onto the line spanned by **a** is the closest point on that line to **b**.',
                'Formula: proj = (a·b / a·a) × a. The error e = b − proj is always perpendicular to a.',
                'The left plot shows $\\mathbf{b}$ (blue), its projection $\\mathbf{p}$ (orange) on the line, and the error $\\mathbf{e}$ (green) perpendicular to $\\mathbf{a}$. The right plot verifies the Pythagorean identity: $\\|\\mathbf{b}\\|^2 = \\|\\mathbf{p}\\|^2 + \\|\\mathbf{e}\\|^2$. This decomposition is exact (not approximate) — projection splits any vector into two mutually perpendicular components: one in the subspace, one orthogonal to it. No information is lost, just reorganized.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

a = np.array([3., 1.])   # direction to project onto
b = np.array([2., 3.])   # vector to project

# Projection of b onto a
proj_b = (np.dot(a, b) / np.dot(a, a)) * a
error  = b - proj_b  # component of b perpendicular to a

print(f"proj_a(b) = {proj_b}")
print(f"error     = {error}")
print(f"Orthogonal? dot(proj, error) = {np.dot(proj_b, error):.10f}")

fig, ax = plt.subplots(figsize=(6, 5))
origin = np.zeros(2)
ax.annotate('', xy=a, xytext=origin, arrowprops=dict(arrowstyle='->', color='steelblue', lw=2.5))
ax.annotate('', xy=b, xytext=origin, arrowprops=dict(arrowstyle='->', color='darkorange', lw=2.5))
ax.annotate('', xy=proj_b, xytext=origin, arrowprops=dict(arrowstyle='->', color='green', lw=2.5))
ax.annotate('', xy=b, xytext=proj_b, arrowprops=dict(arrowstyle='->', color='crimson', lw=2, linestyle='dashed'))
ax.text(a[0]*0.5+0.1, a[1]*0.5+0.1, 'a', color='steelblue', fontsize=12, fontweight='bold')
ax.text(b[0]*0.5+0.1, b[1]*0.5-0.2, 'b', color='darkorange', fontsize=12, fontweight='bold')
ax.text(proj_b[0]*0.5+0.1, proj_b[1]*0.5-0.2, 'proj', color='green', fontsize=12, fontweight='bold')
ax.text((b[0]+proj_b[0])/2+0.1, (b[1]+proj_b[1])/2, 'error', color='crimson', fontsize=10)
ax.set_xlim(-0.5, 4); ax.set_ylim(-0.5, 4)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.set_title("Orthogonal projection of b onto a", fontsize=12)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Projection matrix P and idempotency P² = P',
              prose: [
                'The projection matrix P = aaᵀ / aᵀa projects any vector onto the line spanned by a in one multiplication.',
                'Key property: P² = P (idempotent). Projecting twice gives the same result — the projected vector is already on the line.',
                'The projection matrix $P = \\mathbf{a}\\mathbf{a}^T / \\mathbf{a}^T\\mathbf{a}$ is rank-1 (outer product divided by scalar) — it collapses all of $\\mathbb{R}^n$ onto a 1D subspace (the line through $\\mathbf{a}$). The complementary matrix $I - P$ is also a projection: it projects onto the $(n-1)$-dimensional plane orthogonal to $\\mathbf{a}$. Together $P$ and $I-P$ partition any vector: `v = P @ v + (I-P) @ v`, confirming that the two projections are complementary and exhaustive.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Projection matrix P onto the line spanned by a
a = np.array([[3.], [1.]])  # column vector
P = (a @ a.T) / (a.T @ a)   # projection matrix: rank 1
I_minus_P = np.eye(2) - P   # complementary projection

b = np.array([2., 3.])
print("P (projection matrix):"); print(P.round(4))
print("P^2 = P?", np.allclose(P @ P, P))  # idempotent
print("P = P^T?", np.allclose(P, P.T))    # symmetric

fig, axes = plt.subplots(1, 3, figsize=(11, 3.5))
for ax, M, title in zip(axes, [P, I_minus_P, P+I_minus_P],
                         ['P (onto a)', 'I-P (complement)', 'P + (I-P) = I']):
    ax.imshow(M, cmap='RdBu_r', aspect='equal', vmin=-0.5, vmax=1.2)
    ax.set_title(title, fontsize=11)
    for i in range(2):
        for j in range(2):
            ax.text(j, i, f'{M[i,j]:.3f}', ha='center', va='center', fontsize=12,
                    color='white' if abs(M[i,j]) > 0.6 else 'black')
    ax.set_xticks([]); ax.set_yticks([])
plt.tight_layout()
plt.show()`,
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
# verify A.T @ error â‰ˆ 0
`,
              hint: 'P = A @ np.linalg.inv(A.T @ A) @ A.T. Check np.allclose(P @ P, P) for idempotency. np.allclose(A.T @ (b - P @ b), 0) checks perpendicularity of error to col(A).',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Orthogonal Decomposition Theorem.** Let $W$ be a subspace of $\\mathbb{R}^n$. Every vector $\\mathbf{y} \\in \\mathbb{R}^n$ can be written uniquely as:\n\n$\\mathbf{y} = \\hat{\\mathbf{y}} + \\mathbf{z}, \\quad \\hat{\\mathbf{y}} \\in W, \\quad \\mathbf{z} \\in W^\\perp$\n\nwhere $W^\\perp$ is the **orthogonal complement** of $W$ — the set of all vectors perpendicular to every vector in $W$. The vector $\\hat{\\mathbf{y}}$ is the orthogonal projection of $\\mathbf{y}$ onto $W$.',
      '**Best Approximation Theorem.** If $\\hat{\\mathbf{y}}$ is the orthogonal projection of $\\mathbf{y}$ onto $W$, then $\\hat{\\mathbf{y}}$ is the closest vector in $W$ to $\\mathbf{y}$:\n\n$\\|\\mathbf{y} - \\hat{\\mathbf{y}}\\| \\leq \\|\\mathbf{y} - \\mathbf{v}\\| \\quad \\text{for all } \\mathbf{v} \\in W$\n\nEquality holds only if $\\mathbf{v} = \\hat{\\mathbf{y}}$.',
      '**Proof of the Best Approximation Theorem.** For any $\\mathbf{v} \\in W$, write $\\mathbf{y} - \\mathbf{v} = (\\mathbf{y} - \\hat{\\mathbf{y}}) + (\\hat{\\mathbf{y}} - \\mathbf{v})$. The first term is in $W^\\perp$ and the second is in $W$, so they are orthogonal. By the Pythagorean theorem:\n\n$\\|\\mathbf{y}-\\mathbf{v}\\|^2 = \\|\\mathbf{y}-\\hat{\\mathbf{y}}\\|^2 + \\|\\hat{\\mathbf{y}}-\\mathbf{v}\\|^2 \\geq \\|\\mathbf{y}-\\hat{\\mathbf{y}}\\|^2$\n\nThe inequality is strict unless $\\hat{\\mathbf{y}} = \\mathbf{v}$.',
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
        body: 'The orthogonal projection $\\hat{\\mathbf{y}} = P\\mathbf{y}$ is the unique closest point in $W$ to $\\mathbf{y}$.\n\n$\\|\\mathbf{y} - P\\mathbf{y}\\| < \\|\\mathbf{y} - \\mathbf{v}\\| \\quad \\forall\\, \\mathbf{v} \\in W, \\mathbf{v} \\neq P\\mathbf{y}$',
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
    {
      id: 'la4-001-ex3',
      title: 'Projecting onto a 2D Subspace using P = A(AᵀA)⁻¹Aᵀ',
      problem: 'Project $\\mathbf{b} = \\begin{bmatrix}0\\\\0\\\\1\\end{bmatrix}$ onto the subspace spanned by $\\mathbf{a}_1 = \\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix}$ and $\\mathbf{a}_2 = \\begin{bmatrix}0\\\\1\\\\1\\end{bmatrix}$. Form the matrix $A = [\\mathbf{a}_1 \\; \\mathbf{a}_2]$ and use the formula $\\mathbf{p} = A(A^TA)^{-1}A^T\\mathbf{b}$.',
      steps: [
        {
          expression: 'A^TA = \\begin{bmatrix}1&0&1\\\\0&1&1\\end{bmatrix}\\begin{bmatrix}1&0\\\\0&1\\\\1&1\\end{bmatrix} = \\begin{bmatrix}2&1\\\\1&2\\end{bmatrix}',
          annotation: 'Entry $(i,j)$ = dot product of column $i$ with column $j$ of $A$. Diagonal: $\\|\\mathbf{a}_1\\|^2=2$, $\\|\\mathbf{a}_2\\|^2=2$. Off-diagonal: $\\mathbf{a}_1 \\cdot \\mathbf{a}_2 = 1$.',
          strategyTitle: 'Compute AᵀA',
          checkpoint: 'Why must AᵀA be invertible here?',
          hints: ['The columns of A are linearly independent (neither is a multiple of the other), which guarantees AᵀA is invertible.'],
        },
        {
          expression: '(A^TA)^{-1} = \\frac{1}{3}\\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}, \\quad A^T\\mathbf{b} = \\begin{bmatrix}0+0+1\\\\0+0+1\\end{bmatrix} = \\begin{bmatrix}1\\\\1\\end{bmatrix}',
          annotation: 'det$(A^TA) = 4-1 = 3$. Standard $2\\times 2$ inverse formula. $A^T\\mathbf{b}$ picks up the third component of $\\mathbf{b}$ since $\\mathbf{a}_1, \\mathbf{a}_2$ both have a $1$ in their third entry.',
          strategyTitle: 'Invert and compute Aᵀb',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\hat{\\mathbf{x}} = (A^TA)^{-1}A^T\\mathbf{b} = \\frac{1}{3}\\begin{bmatrix}2&-1\\\\-1&2\\end{bmatrix}\\begin{bmatrix}1\\\\1\\end{bmatrix} = \\frac{1}{3}\\begin{bmatrix}1\\\\1\\end{bmatrix}',
          annotation: 'The optimal coefficients: $\\mathbf{p} = \\frac{1}{3}\\mathbf{a}_1 + \\frac{1}{3}\\mathbf{a}_2$.',
          strategyTitle: 'Solve for x-hat',
          checkpoint: '',
          hints: [],
        },
        {
          expression: '\\mathbf{p} = A\\hat{\\mathbf{x}} = \\frac{1}{3}\\begin{bmatrix}1\\\\0\\\\1\\end{bmatrix} + \\frac{1}{3}\\begin{bmatrix}0\\\\1\\\\1\\end{bmatrix} = \\begin{bmatrix}1/3\\\\1/3\\\\2/3\\end{bmatrix}',
          annotation: 'Verify: $A^T\\mathbf{e} = A^T(\\mathbf{b}-\\mathbf{p}) = A^T[{-1/3},{-1/3},{1/3}]^T = [0,0]^T$ ✓.',
          strategyTitle: 'Compute projection',
          checkpoint: 'Verify Aᵀe = 0',
          hints: ['Row 1 of Aᵀ times e: 1·(-1/3) + 0·(-1/3) + 1·(1/3) = 0 ✓. Row 2: 0·(-1/3) + 1·(-1/3) + 1·(1/3) = 0 ✓.'],
        },
      ],
      conclusion: '$\\mathbf{p} = [1/3,\\, 1/3,\\, 2/3]^T$. The error $\\mathbf{e} = [-1/3,-1/3,1/3]^T$ is perpendicular to both columns of $A$. This generalizes the line projection to any dimension: the formula $P = A(A^TA)^{-1}A^T$ always works as long as the columns of $A$ are independent.',
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
      'Unit vector projection: p = (b·û)û where û is the unit vector — dot product gives the scalar, then scale û.',
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
    { id: 'cp-la4-001-1', label: 'Read: State the perpendicularity condition for projection', type: 'read' },
    { id: 'cp-la4-001-2', label: 'Read: Explain why the projection is the closest point', type: 'read' },
    { id: 'cp-la4-001-3', label: 'Read: Write both projection formulas (line and subspace)', type: 'read' },
    { id: 'cp-la4-001-4', label: 'Lab: Drag the vector and verify error stays perpendicular', type: 'lab' },
    { id: 'cp-la4-001-5', label: 'Lab: Compute P = aaᵀ/aᵀa and verify P² = P', type: 'lab' },
    { id: 'cp-la4-001-6', label: 'Example: Project onto a line in ℝ³', type: 'example' },
    { id: 'cp-la4-001-7', label: 'Example: Build a projection matrix and apply it', type: 'example' },
    { id: 'cp-la4-001-8', label: 'Challenge: Project onto a 2D subspace with AᵀA formula', type: 'challenge' },
  ],

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la4-001-assess-1',
        type: 'choice',
        text: 'What is the dot product of the error vector $\\mathbf{e} = \\mathbf{b} - \\mathbf{p}$ and the projection direction $\\mathbf{a}$, for any valid orthogonal projection?',
        options: ['0', '1', '$\\|\\mathbf{e}\\|^2$', 'It depends on the angle between $\\mathbf{b}$ and $\\mathbf{a}$'],
        answer: '0',
        hints: ['Orthogonal means perpendicular means dot product = 0. The defining condition is $\\mathbf{a} \\cdot (\\mathbf{b} - \\mathbf{p}) = 0$.'],
        reviewSection: 'Intuition tab — orthogonality condition',
      },
      {
        id: 'la4-001-assess-2',
        type: 'choice',
        text: 'For $\\mathbf{a} = \\begin{bmatrix}3\\\\4\\end{bmatrix}$ and $\\mathbf{b} = \\begin{bmatrix}2\\\\5\\end{bmatrix}$, the scalar projection $c = \\mathbf{a}\\cdot\\mathbf{b}/\\mathbf{a}\\cdot\\mathbf{a}$ equals:',
        options: ['$26/25$', '$7/5$', '$2/5$', '$5$'],
        answer: '$26/25$',
        hints: ['$\\mathbf{a}\\cdot\\mathbf{b} = 3\\cdot 2 + 4\\cdot 5 = 6 + 20 = 26$. $\\mathbf{a}\\cdot\\mathbf{a} = 9+16 = 25$. So $c = 26/25$.'],
        reviewSection: 'Math tab — Projection onto a Line',
      },
      {
        id: 'la4-001-assess-3',
        type: 'choice',
        text: 'Which property is NOT guaranteed for a projection matrix $P = A(A^TA)^{-1}A^T$?',
        options: ['$P$ is symmetric ($P^T = P$)', '$P$ is idempotent ($P^2 = P$)', '$P$ is invertible', '$P\\mathbf{b}$ lies in the column space of $A$'],
        answer: '$P$ is invertible',
        hints: ['$P$ projects onto a subspace, so all vectors in the orthogonal complement map to $\\mathbf{0}$ — a non-trivial null space. A matrix with a non-trivial null space is never invertible.'],
        reviewSection: 'Math tab — Properties of Projection Matrices',
      },
      {
        id: 'la4-001-assess-4',
        type: 'choice',
        text: 'In the CNC cross-track error calculation, the error magnitude is:',
        options: [
          'The dot product of the tool position with the path direction',
          'The length of the projection of the tool position onto the path',
          '$\\|\\mathbf{b} - \\text{proj}_{\\mathbf{a}}\\mathbf{b}\\|$ — the distance from the tool to its closest point on the path',
          'The angle between the tool direction and path direction',
        ],
        answer: '$\\|\\mathbf{b} - \\text{proj}_{\\mathbf{a}}\\mathbf{b}\\|$ — the distance from the tool to its closest point on the path',
        hints: ['The cross-track error is the perpendicular deviation: e = b − proj gives the direction off-path, and its length is the magnitude of the error. This is exactly the norm of the error vector.'],
        reviewSection: 'Intuition tab — CNC cross-track error',
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
      type: 'choice',
      text: 'Project $\\mathbf{b} = [6, 0]^T$ onto the line spanned by $\\mathbf{a} = [1, 0]^T$. What is the $x$-component of the projection?',
      options: ['6', '0', '3', '36'],
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
    {
      id: 'q-la4-001-5',
      type: 'choice',
      text: 'For $\\mathbf{a} = [2,1]^T$ and $\\mathbf{b} = [3,0]^T$, compute the scalar projection $c$.',
      options: ['$6/5$', '$3/5$', '$6/\\sqrt{5}$', '$3$'],
      answer: '$6/5$',
      hints: ['c = aᵀb / aᵀa = (2·3 + 1·0)/(4+1) = 6/5.'],
      reviewSection: 'Math — projection onto a line',
    },
    {
      id: 'q-la4-001-6',
      type: 'choice',
      text: 'Which of the following is always true for a projection matrix $P = A(A^TA)^{-1}A^T$?',
      options: [
        '$P$ is invertible',
        '$P^T = P$ and $P^2 = P$',
        '$\\det(P) = 1$',
        '$P\\mathbf{b} = \\mathbf{b}$ for all $\\mathbf{b}$',
      ],
      answer: '$P^T = P$ and $P^2 = P$',
      hints: ['P is symmetric: P = A(AᵀA)⁻¹Aᵀ — taking transpose gives the same matrix. Idempotent: P² = A(AᵀA)⁻¹AᵀA(AᵀA)⁻¹Aᵀ = A(AᵀA)⁻¹Aᵀ = P.'],
      reviewSection: 'Math — key properties of projection matrices',
    },
    {
      id: 'q-la4-001-7',
      type: 'choice',
      text: 'The complementary projection matrix $(I - P)$ projects onto:',
      options: [
        'The column space of $A$',
        'The null space of $A$',
        'The orthogonal complement of $\\text{col}(A)$',
        'The zero vector',
      ],
      answer: 'The orthogonal complement of $\\text{col}(A)$',
      hints: ['Any vector b splits as b = Pb + (I-P)b. Pb lands in col(A); (I-P)b is perpendicular to col(A). So (I-P) is the projection onto the orthogonal complement.'],
      reviewSection: 'Math — orthogonal decomposition',
    },
    {
      id: 'q-la4-001-8',
      type: 'choice',
      text: 'If $\\mathbf{b}$ already lies in the column space of $A$, then $P\\mathbf{b} =$',
      options: ['$\\mathbf{0}$', '$\\mathbf{b}$', '$A\\mathbf{b}$', '$2\\mathbf{b}$'],
      answer: '$\\mathbf{b}$',
      hints: ['If b is already in col(A), it is its own projection. P² = P confirms: if Pb = b, then P²b = P(Pb) = Pb = b.'],
      reviewSection: 'Math — idempotency',
    },
    {
      id: 'q-la4-001-9',
      type: 'choice',
      text: 'In least squares, the normal equations $A^TA\\hat{\\mathbf{x}} = A^T\\mathbf{b}$ arise because:',
      options: [
        '$A$ is always square and invertible',
        'The error $\\mathbf{b} - A\\hat{\\mathbf{x}}$ must be perpendicular to every column of $A$',
        'We minimize $\\|\\hat{\\mathbf{x}}\\|$ rather than $\\|\\mathbf{b} - A\\hat{\\mathbf{x}}\\|$',
        'The projection formula requires $A^T = A$',
      ],
      answer: 'The error $\\mathbf{b} - A\\hat{\\mathbf{x}}$ must be perpendicular to every column of $A$',
      hints: ['Aᵀ(b - Ax̂) = 0 is the perpendicularity condition applied to all columns of A simultaneously. This is exactly the projection condition — Ax̂ is the closest point in col(A) to b.'],
      reviewSection: 'Math — projection onto a subspace',
    },
    {
      id: 'q-la4-001-10',
      type: 'choice',
      text: 'For GPS position estimation, why is orthogonal projection (least squares) used instead of solving an exact system?',
      options: [
        'GPS always has exactly 3 equations',
        'There are more satellite equations than unknowns — an overdetermined system — so the least squares projection gives the best-fit position',
        'The projection formula avoids computing inverses',
        'GPS signals are orthogonal by definition',
      ],
      answer: 'There are more satellite equations than unknowns — an overdetermined system — so the least squares projection gives the best-fit position',
      hints: ['4+ satellites give 4+ distance equations for 3 unknowns (x,y,z). No exact solution exists due to noise; the projection Pb = A(AᵀA)⁻¹Aᵀb minimizes total squared error.'],
      reviewSection: 'Hook — real-world context',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'The projection of $\\mathbf{b}$ onto the line spanned by $\\mathbf{a}$ is just the component of $\\mathbf{b}$ with the largest magnitude.',
      whyStudentsThinkIt: 'Students confuse scalar projection ($c = \\mathbf{a}\\cdot\\mathbf{b}/\\|\\mathbf{a}\\|^2$) with the magnitude of $\\mathbf{b}$.',
      correctionExample: 'For $\\mathbf{b} = [1, 10]^T$ and $\\mathbf{a} = [1, 0]^T$: the projection is $[1, 0]^T$ (the $x$-component), not $[0, 10]^T$ (the largest component). The formula picks the component along $\\mathbf{a}$, not the largest component overall.',
      contrastCase: 'If you project $\\mathbf{b}$ onto the $y$-axis ($\\mathbf{a} = [0,1]^T$), the projection is $[0, 10]^T$ — the $y$-component.',
    },
    {
      falseBelief: 'The outer product $\\mathbf{a}\\mathbf{a}^T$ and the inner product $\\mathbf{a}^T\\mathbf{a}$ are the same thing.',
      whyStudentsThinkIt: 'Both involve the same two vectors, just in different order. Students sometimes mix them up in the projection formula.',
      correctionExample: 'For $\\mathbf{a} = [1,2]^T$: $\\mathbf{a}^T\\mathbf{a} = 1+4 = 5$ (a scalar), while $\\mathbf{a}\\mathbf{a}^T = \\begin{bmatrix}1&2\\\\2&4\\end{bmatrix}$ (a $2\\times 2$ matrix). In $P = \\mathbf{a}\\mathbf{a}^T / \\mathbf{a}^T\\mathbf{a}$: the numerator is a matrix, the denominator is a scalar that rescales it.',
      contrastCase: 'A scalar times a matrix is still a matrix. The projection matrix $P$ is a $2\\times 2$ matrix, not a scalar.',
    },
  ],

  transferPrompts: [
    {
      situation: 'In data science, you want to project a high-dimensional dataset onto its first principal component — the direction of greatest variance.',
      competingTechniques: 'Computing the full covariance matrix eigendecomposition, random projection, or orthogonal projection formula.',
      whyThisTechniqueWins: 'The first principal component is the unit vector $\\mathbf{u}$ that maximizes variance. Projecting each data point onto $\\mathbf{u}$ is exactly $\\text{proj}_{\\mathbf{u}}\\mathbf{x}_i = (\\mathbf{u}^T\\mathbf{x}_i)\\mathbf{u}$. The scalar $\\mathbf{u}^T\\mathbf{x}_i$ is the new 1D coordinate. Orthogonal projection is the mathematical core of PCA.',
    },
    {
      situation: 'In signal processing, you want to extract the component of a signal at a specific frequency from a noisy measurement.',
      competingTechniques: 'Fourier transform, low-pass filter, or orthogonal projection onto frequency basis.',
      whyThisTechniqueWins: 'Each frequency basis function is a vector; the signal is projected onto it. The projection coefficient is the Fourier coefficient. Orthogonality of the Fourier basis makes each coefficient independent — projecting onto one frequency does not affect others.',
    },
  ],

  debugging: [
    {
      commonError: 'Computing $P = \\mathbf{a}^T\\mathbf{a}/\\mathbf{a}\\mathbf{a}^T$ (inner product over outer product) instead of $P = \\mathbf{a}\\mathbf{a}^T/\\mathbf{a}^T\\mathbf{a}$.',
      symptom: 'You get a scalar divided by a matrix — which is undefined — or you accidentally get just a number.',
      whyItHappened: 'The order matters: $\\mathbf{a}^T\\mathbf{a}$ is a scalar (goes in the denominator); $\\mathbf{a}\\mathbf{a}^T$ is a rank-1 matrix (goes in the numerator).',
      repairStrategy: 'Remember: the projection matrix must be an $n\\times n$ matrix. If your calculation gives a scalar, you have the fraction upside down. Check dimensions: outer product $\\mathbf{a}\\mathbf{a}^T$ is $n\\times n$; inner product $\\mathbf{a}^T\\mathbf{a}$ is $1\\times 1$ (scalar).',
    },
    {
      commonError: 'Forgetting to verify $\\mathbf{a} \\cdot \\mathbf{e} = 0$ after computing the projection.',
      symptom: 'The computed projection seems reasonable but is actually wrong due to an arithmetic error in $c = \\mathbf{a}^T\\mathbf{b}/\\mathbf{a}^T\\mathbf{a}$.',
      whyItHappened: 'The perpendicularity check is the gold standard for correctness — if the error is not perpendicular to the subspace, the projection is wrong. Students skip this verification.',
      repairStrategy: 'Always compute $\\mathbf{e} = \\mathbf{b} - \\mathbf{p}$ and verify $\\mathbf{a}^T\\mathbf{e} = 0$ (or $A^T\\mathbf{e} = \\mathbf{0}$ for the subspace case). If not zero, re-check your computation of $c$.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Project any vector onto a given line or 2D subspace, compute the projection matrix, and verify correctness using the perpendicularity condition.',
    explainVerbally: 'Explain why the projection is the closest point (Pythagorean argument), why $P^2 = P$ geometrically, and how $A^TA\\hat{x} = A^Tb$ arises from perpendicularity.',
    detectIncorrectApplication: 'Catch inner/outer product order reversal in the formula; catch a projection that fails the $A^T e = 0$ check; recognize when $A^TA$ is singular (linearly dependent columns).',
    transferToUnfamiliar: 'Apply projection to data fitting (least squares), frequency extraction (Fourier), or PCA — anywhere you need the closest point in a linear subspace.',
  },
};
