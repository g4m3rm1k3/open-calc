export default {
  id: 'la1-005',
  slug: 'lines-and-planes',
  chapter: 'la1',
  order: 5,
  title: 'Lines and Planes in 3D',
  subtitle: 'Parametric, symmetric, and normal-vector forms — the geometric language of linear constraints.',
  tags: ['lines', 'planes', 'parametric equations', 'normal vector', 'dot product geometry', 'distance', 'intersection'],
  aliases: 'parametric line equation plane equation normal vector point-normal form vector equation line plane intersection distance',

  timeToComplete: 35,
  coreConcept: 'Lines and planes in 3D are described using vectors: a line needs a base point and a direction vector; a plane needs a base point and a normal vector (found via the cross product).',
  prerequisites: ['la1-003', 'la1-004'],
  nextLesson: 'la1-006',

  hook: {
    question: "You're designing a robot arm. The end-effector must travel in a straight line in 3D space. How do you describe that line mathematically — and how do you tell if two robot paths will collide?",
    realWorldContext: "Every 3D graphics engine, robotics planner, and physics simulator must answer questions about lines and planes thousands of times per second. Collision detection is a line-plane intersection test. Flight simulators check whether a wing intersects the ground plane. Ray tracing (the rendering algorithm inside Pixar films) fires rays — lines — and finds intersections with planes to determine what a camera sees. The math is all here.",
    previewVisualizationId: 'ProjectionMatrixViz',
  },

  intuition: {
    prose: [
      'Start at the point $(1, 2, -1)$ and walk in direction $[3, -1, 2]$. After $t = 0$: you are at $(1, 2, -1)$. After $t = 1$: $(4, 1, 1)$. After $t = -1$: $(-2, 3, -3)$. The formula $(1+3t,\\ 2-t,\\ -1+2t)$ visits every point on an infinite straight line — one free parameter $t$ traces the whole thing. This is the **parametric form** of a line. Now, to describe a flat surface (a plane) in 3D, a direction to walk *along* the surface is not enough — you need the one direction that is perpendicular to the entire surface: the **normal vector**.',
      'Think of a line in 3D. You need two pieces of information: a **point** you start from, and a **direction** to travel. If you start at point $P_0$ and walk in direction $\\mathbf{d}$, after time $t$ you are at $P_0 + t\\mathbf{d}$. That simple idea is the parametric equation of a line.',
      'A plane needs a different description. Instead of a direction to travel ALONG the plane, it is easier to give a direction PERPENDICULAR to the plane — the **normal vector** $\\mathbf{n}$. Every point $\\mathbf{x}$ on the plane satisfies $\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0$: the vector from $P_0$ to $\\mathbf{x}$ is perpendicular to $\\mathbf{n}$.',
      '**Why does the cross product appear here?** If you know two vectors lying IN a plane (say the edges of a triangle), their cross product is perpendicular to both — it IS the normal vector. So the cross product is the machine for finding plane equations from geometric data.',      '**Predict before reading the intersection formula:** the line $\\mathbf{r}(t) = (2,0,1) + t[1,2,-1]$ and the plane $x + 2y - z = 4$. Compute $\\mathbf{n} \\cdot \\mathbf{d}_{\\text{line}} = [1,2,-1]\\cdot[1,2,-1]$ mentally. Is the line parallel to the plane, or will it intersect at one point? Hold your answer until Example 3.',      'Lines and planes are the 1D and 2D linear subspaces (shifted by a point) of 3D space. Every linear algebra concept — span, basis, orthogonality — has a concrete geometric home in lines and planes.',
      '**CNC and robotics applications.** Every CNC toolpath segment is a line in 3D space — parametrically $\\mathbf{r}(t) = P_0 + t\\mathbf{d}$ where $\\mathbf{d}$ is the feed direction and $t$ is proportional to time. The machined surface is (locally) a plane with a specific normal. The controller must constantly check: is the tool axis aligned with the surface normal? Is the feedrate vector tangent to the surface (dot product with normal = 0)? In 5-axis machining, the tool orientation is defined by two vectors — the tool axis and the surface normal — and keeping these properly aligned is a geometric problem entirely expressed through lines, planes, and their intersections.',
      '**Where this is heading.** When you have multiple plane equations (a system of linear equations), finding where the planes all intersect simultaneously is a system of equations problem — which is exactly what Gauss-Jordan RREF (the next lesson) solves. Every row of an $m \\times n$ linear system is one plane in $n$-dimensional space, and the solution is the set of points where all those hyperplanes meet.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 5 of 6 — Vectors & Spaces',
        body: '**Previous:** Systems of Linear Equations — Gaussian elimination and pivot structure.\n**This lesson:** Lines and Planes — the geometric picture of linear constraints and intersections in 3D.\n**Next:** Gauss-Jordan RREF — the complete algorithm for solving any linear system.',
      },
      {
        type: 'insight',
        title: 'Two Ways to Describe a Line',
        body: '**Parametric:** $\\mathbf{r}(t) = P_0 + t\\mathbf{d}$\nTravel from $P_0$ in direction $\\mathbf{d}$.\n\n**Symmetric (when $d_i \\neq 0$):** $\\dfrac{x-x_0}{d_x} = \\dfrac{y-y_0}{d_y} = \\dfrac{z-z_0}{d_z}$\nEliminate $t$ to get the ratio form.',
      },
      {
        type: 'insight',
        title: 'Two Ways to Describe a Plane',
        body: '**Normal form:** $\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0$\nEvery point $\\mathbf{x}$ on the plane satisfies this.\n\n**Scalar form:** $ax + by + cz = d$\nwhere $\\mathbf{n} = [a, b, c]$ and $d = \\mathbf{n} \\cdot P_0$.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Line-Plane Intersection',
        body: 'Step 1. From the plane $ax+by+cz=d$, read off $\\mathbf{n}=[a,b,c]$ and $d$.\nStep 2. From the parametric line, read off base point $P_0$ and direction $\\mathbf{d}_{\\text{line}}$.\nStep 3. Compute the denominator: $\\mathbf{n}\\cdot\\mathbf{d}_{\\text{line}}$. If zero \u2014 line is parallel to the plane (stop).\nStep 4. Compute $t = (d - \\mathbf{n}\\cdot P_0)\\;/\\;(\\mathbf{n}\\cdot\\mathbf{d}_{\\text{line}})$.\nStep 5. Compute the intersection point: $\\mathbf{r}(t) = P_0 + t\\,\\mathbf{d}_{\\text{line}}$.\nStep 6. Verify: substitute the intersection point into $ax+by+cz$ and confirm it equals $d$.',
      },
      {
        type: 'warning',
        title: 'Common Mistake: Confusing the Normal Vector with a Direction Vector',
        body: `For a **line**, you need a direction vector $\\mathbf{d}$ that points ALONG the line. For a **plane**, you need a normal vector $\\mathbf{n}$ that points PERPENDICULAR to the plane.\n\n**Wrong:** Using the normal vector $\\mathbf{n} = [1, 2, -1]$ as the line direction when the plane equation is $x + 2y - z = 4$.\n\n**What you actually get:** A line through $P_0$ in direction $[1, 2, -1]$ is PERPENDICULAR to the plane, not lying in it.\n\n**Right rule:** For the plane $ax + by + cz = d$, the normal is $\\mathbf{n} = [a,b,c]$. A direction vector for a line IN the plane must satisfy $\\mathbf{n} \\cdot \\mathbf{d} = 0$.`,
      },
      {
        type: 'warning',
        title: 'A Line in 3D ≠ A Single Equation',
        body: 'In 2D, a line = one equation ($ax + by = c$). In 3D, a line = the INTERSECTION of two planes = TWO equations. One equation in 3D defines a **plane**, not a line. This trips up many students.',
      },
      {
        type: 'insight',
        title: 'When to Use This',
        body: `Use **parametric line form** when you need to:\n- Trace a path through space (robotics, animation, physics)\n- Test if a point lies on a line (check whether all components give the same $t$)\n- Find where a ray hits a surface (ray tracing, collision detection)\n\nUse **plane normal form** when you need to:\n- Test if a point is on a plane: evaluate $\\mathbf{n} \\cdot \\mathbf{x} - d$; zero means on the plane, sign tells which side\n- Measure distance from a point to a plane: $\\frac{|\\mathbf{n} \\cdot Q - d|}{\\|\\mathbf{n}\\|}$\n- Find the normal to a surface given two edges: take the cross product`,
      },
    ],
    visualizations: [
      {
        id: 'ProjectionMatrixViz',
        title: 'Lines and Planes: Geometric Intuition',
        mathBridge: 'Visualize parametric lines and normal-vector planes in 3D. The normal vector is always perpendicular to every in-plane direction. The line-plane intersection is the single point where a moving ray meets a flat surface.',
        caption: 'Direction vectors drive lines; normal vectors define planes.',
      },
    ],
  },

  math: {
    prose: [
      '**Parametric equation of a line.** Given a point $P_0 = (x_0, y_0, z_0)$ and a nonzero direction vector $\\mathbf{d} = [d_x, d_y, d_z]$, the line through $P_0$ in direction $\\mathbf{d}$ is:\n$$\\mathbf{r}(t) = P_0 + t\\mathbf{d} = (x_0 + td_x,\\ y_0 + td_y,\\ z_0 + td_z), \\quad t \\in \\mathbb{R}$$\nThe scalar $t$ is the parameter — it tells you how far along the line you are.',
      '**Symmetric equations.** If none of $d_x, d_y, d_z$ is zero, solve each parametric equation for $t$ and set them equal:\n$$\\frac{x - x_0}{d_x} = \\frac{y - y_0}{d_y} = \\frac{z - z_0}{d_z}$$\nIf one component is zero (say $d_z = 0$), then $z = z_0$ is one of the equations and the symmetric form uses just the other two ratios.',
      '**Equation of a plane.** A plane is determined by a point $P_0$ and a normal vector $\\mathbf{n} = [a, b, c]$ perpendicular to every vector in the plane. The condition for a point $\\mathbf{x} = (x, y, z)$ to lie on the plane is:\n$$\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0 \\quad \\Longleftrightarrow \\quad a(x - x_0) + b(y - y_0) + c(z - z_0) = 0$$\nExpanding and collecting: $ax + by + cz = d$ where $d = ax_0 + by_0 + cz_0$.',
      '**Distance from a point to a plane.** The distance from point $Q$ to the plane $ax + by + cz = d$ is:\n$$\\text{dist} = \\frac{|a q_x + b q_y + c q_z - d|}{\\sqrt{a^2 + b^2 + c^2}} = \\frac{|\\mathbf{n} \\cdot Q - d|}{\\|\\mathbf{n}\\|}$$\nThis is projection: you project $Q - P_0$ onto the unit normal.',
      '**Line-plane intersection.** To find where a line $P_0 + t\\mathbf{d}$ meets a plane $\\mathbf{n} \\cdot \\mathbf{x} = d$, substitute:\n$$\\mathbf{n} \\cdot (P_0 + t\\mathbf{d}) = d \\quad \\Rightarrow \\quad t = \\frac{d - \\mathbf{n} \\cdot P_0}{\\mathbf{n} \\cdot \\mathbf{d}}$$\nIf $\\mathbf{n} \\cdot \\mathbf{d} = 0$, the line is parallel to the plane (no intersection or the line lies in the plane).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Point-Normal Form of a Plane',
        body: '\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0\n\nor equivalently: $ax + by + cz = d$\n\n$\\mathbf{n} = [a,b,c]$ is perpendicular to every vector lying in the plane.',
      },
      {
        type: 'definition',
        title: 'Normal Vector',
        body: 'A vector $\\mathbf{n}$ is **normal** to a plane if it is perpendicular to every vector that lies in the plane.\n\nGiven two non-parallel vectors $\\mathbf{u}, \\mathbf{v}$ in the plane, $\\mathbf{n} = \\mathbf{u} \\times \\mathbf{v}$.',
      },
      {
        type: 'insight',
        title: 'Cross Product Gives the Normal Immediately',
        body: 'If you know two edges of a triangle (vectors $\\mathbf{u}$ and $\\mathbf{v}$), then $\\mathbf{n} = \\mathbf{u} \\times \\mathbf{v}$ is immediately perpendicular to both — it IS the normal to the plane containing the triangle. No algebra required.',
      },
    ],
    visualizations: [
      {
        id: 'OpenMatNotebook',
        title: 'Lines and Planes in OpenMAT / MATLAB',
        mathBridge: 'In MATLAB, a parametric line is just arithmetic: r = P0 + t*d. A plane equation n·x = d is a dot product test. The line-plane intersection formula t = (d - dot(n,P0)) / dot(n,dir) is four lines of code. Learn these patterns once and they cover every lines-and-planes problem in your coursework.',
        caption: 'Lines and planes in MATLAB — also exactly how CNC and robotics check for workspace violations.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Parametric line: generate and test points',
              prose: [
                'A parametric line r(t) = P0 + t*d is just a loop over t values. Each value of t gives one point on the line.',
                'Test if a point lies on the line: solve for t from each component and check they are equal.',
              ],
              code: `% Parametric line: r(t) = P0 + t*d
P0 = [1; 2; -1];      % base point
d  = [3; -1; 2];      % direction vector

% Sample points at t = -1, 0, 1, 2
for t = -1:2
    r = P0 + t*d;
    fprintf('t=%2d → (%5.1f, %5.1f, %5.1f)\\n', t, r(1), r(2), r(3))
end

% Does the point (7, 0, 3) lie on this line?
% If yes, all three t values from x,y,z components must be equal
Q = [7; 0; 3];
t_from_x = (Q(1) - P0(1)) / d(1)
t_from_y = (Q(2) - P0(2)) / d(2)
t_from_z = (Q(3) - P0(3)) / d(3)
% All equal to 2 → Q is on the line at t=2`,
            },
            {
              id: 2,
              cellTitle: 'Plane equation: test and distance',
              prose: [
                'The plane n·x = d is verified by: if a point x satisfies dot(n,x) == d, it is on the plane.',
                'Distance from point Q to the plane: abs(dot(n,Q) - d) / sqrt(dot(n,n)). This is the most important formula in 3D geometry.',
              ],
              code: `n = [1; 2; -1];    % normal vector
d = 4;             % right-hand side: n·x = 4

% Test point on the plane: P = [2; 1; 0]
P = [2; 1; 0];
disp('Is P on the plane? (should be 4):')
dot(n, P)          % = 1*2 + 2*1 + (-1)*0 = 4 âœ“

% Test point NOT on the plane: Q = [1; 2; 3]
Q = [1; 2; 3];
disp('n·Q = (should not be 4):')
dot(n, Q)          % = 1+4-3 = 2 ≠ 4

% Distance from Q to the plane
distance = abs(dot(n, Q) - d) / sqrt(dot(n, n))
% = |2 - 4| / sqrt(1+4+1) = 2/sqrt(6) â‰ˆ 0.816`,
            },
            {
              id: 3,
              cellTitle: 'Line-plane intersection',
              prose: [
                'Substitute r(t) = P0 + t*d into n·x = d to find t. If n·d = 0, the line is parallel to the plane.',
                'Application: ray tracing in 3D graphics fires millions of these per frame.',
              ],
              code: `% Line: r(t) = P0 + t*dir
P0  = [2; 0; 1];
dir = [1; -1; 3];

% Plane: n·x = d_plane
n       = [1; 2; -1];
d_plane = 4;

% Check if line is parallel to plane (n·dir = 0)
n_dot_dir = dot(n, dir)
if abs(n_dot_dir) < 1e-10
    disp('Line is parallel to the plane — no intersection')
else
    t = (d_plane - dot(n, P0)) / n_dot_dir
    intersection = P0 + t * dir

    % Verify: does the intersection point satisfy the plane equation?
    disp('Verify n·intersection = d_plane:')
    dot(n, intersection)
end`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC workspace limit as a plane',
              prose: [
                'CNC machines have hard workspace limits — physical boundaries beyond which the machine cannot travel without crashing. These limits ARE planes.',
                'Before commanding a move, the controller checks: will the new tool position violate any limit plane? This is a distance-to-plane check.',
              ],
              code: `% CNC workspace planes (soft limits)
% Machine has limits: 0 ≤ X ≤ 500, 0 ≤ Y ≤ 300, -200 ≤ Z ≤ 0
% Each limit is a plane: e.g., X_max = 500 → normal [1;0;0], d = 500

limits = struct();
limits.Xmax = struct('n', [1;0;0], 'd', 500);
limits.Xmin = struct('n', [-1;0;0], 'd', 0);
limits.Ymax = struct('n', [0;1;0], 'd', 300);
limits.Ymin = struct('n', [0;-1;0], 'd', 0);
limits.Zmin = struct('n', [0;0;-1], 'd', 200);  % Z ≥ -200

function check = inWorkspace(pos, limits)
    fields = fieldnames(limits);
    check = true;
    for i = 1:length(fields)
        L = limits.(fields{i});
        % Point must satisfy n·x ≤ d
        if dot(L.n, pos) > L.d
            fprintf('  VIOLATION: %s limit!\\n', fields{i});
            check = false;
        end
    end
end

disp('Test (100, 50, -5): ')
inWorkspace([100;50;-5], limits)

disp('Test (520, 50, -5): ')
inWorkspace([520;50;-5], limits)`,
            },
          ],
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Lines, Planes, and 3D Geometry',
        mathBridge: 'Parametric lines, plane equations, line-plane intersections, and distance formulas — all in NumPy. Visualize with opencalc.Figure for 3D perspective.',
        caption: 'Use Python to build geometric intuition with interactive 3D visualizations.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Parametric lines: generate and visualize',
              prose: [
                'A line r(t) = P0 + t*d is just vectorized arithmetic in NumPy.',
                'Evaluate at many t values to get a dense set of points for visualization.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

# Define the line
P0 = np.array([1.0, 2.0])   # base point (2D for visualization)
d  = np.array([3.0, -1.0])  # direction vector

# Generate points along the line
t_vals = np.linspace(-1, 2, 100)
# r(t) = P0 + t*d  (NumPy broadcasts over all t values at once)
points = P0 + np.outer(t_vals, d)   # shape: (100, 2)

print("r(0) = P0:", P0)
print("r(1) =", P0 + d)
print("r(-1) =", P0 - d)

# Sample specific points
for t in [-1, 0, 1, 2]:
    r = P0 + t*d
    print(f"t={t}: r = {r}")

fig, ax = plt.subplots(figsize=(7, 4))
ax.set_title("Parametric Line r(t) = P0 + t*d", fontsize=13)
ax.plot(points[:, 0], points[:, 1], 'steelblue', lw=2, label='r(t) = P0 + t*d')

# Mark specific t values
for t_val, color in [(-1, 'red'), (0, 'green'), (1, 'darkorange'), (2, 'purple')]:
    r = P0 + t_val * d
    ax.scatter(*r, color=color, s=80, zorder=5)
    ax.text(r[0]+0.1, r[1]+0.1, f't={t_val}', fontsize=9, color=color)

# Mark direction vector from P0
ax.annotate('', xy=P0+d, xytext=P0,
            arrowprops=dict(arrowstyle='->', color='black', lw=2))
ax.text(P0[0]+d[0]*0.5+0.1, P0[1]+d[1]*0.5+0.1, 'd', fontsize=11, fontweight='bold')
ax.scatter(*P0, color='green', s=100, zorder=6)
ax.text(P0[0]+0.1, P0[1]+0.15, 'P0', fontsize=10, color='green', fontweight='bold')

ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.legend(fontsize=10)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Plane equation: the dot product test',
              prose: [
                'A point x is on the plane n·x = d if and only if np.dot(n, x) == d.',
                'The distance formula from point Q to the plane is the most important geometric formula in 3D: |n·Q - d| / –n–.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

n = np.array([1.0, 2.0, -1.0])   # normal vector
d_val = 4.0                        # plane: n.x = 4

# Test if P = [2, 1, 0] is on the plane
P = np.array([2.0, 1.0, 0.0])
print(f"n . P = {np.dot(n, P):.4f}  (plane value = {d_val})")
print(f"P is on plane: {np.isclose(np.dot(n, P), d_val)}")

# Distance from Q = [1, 2, 3] to the plane
Q = np.array([1.0, 2.0, 3.0])
dist = abs(np.dot(n, Q) - d_val) / np.linalg.norm(n)
print(f"
Distance from Q to plane = {dist:.4f}")
print(f"  |n.Q - d| = |{np.dot(n,Q):.1f} - {d_val}| = {abs(np.dot(n,Q)-d_val):.1f}")
print(f"  ||n|| = {np.linalg.norm(n):.4f}")

# Visualize in 2D (x-y plane, z=0 slice)
fig, ax = plt.subplots(figsize=(7, 5))
ax.set_title("Plane n.x = d: Point Test and Distance", fontsize=12)

# Plot the plane as a line in x-y (set z=0: n[0]*x + n[1]*y = d_val)
x_range = np.linspace(-1, 4, 100)
if abs(n[1]) > 1e-10:
    y_plane = (d_val - n[0]*x_range) / n[1]
    ax.plot(x_range, y_plane, 'gray', lw=2, linestyle='--', label=f'Plane: n.x = {d_val} (z=0 slice)')

# Plot P (on plane) and Q (off plane)
P2d, Q2d = P[:2], Q[:2]
ax.scatter(*P2d, color='green', s=120, zorder=5)
ax.text(P2d[0]+0.05, P2d[1]+0.05, f'P={P[:2]} (ON plane)', fontsize=9, color='green')

ax.scatter(*Q2d, color='red', s=120, zorder=5)
ax.text(Q2d[0]+0.05, Q2d[1]+0.05, f'Q={Q[:2]} (OFF, dist={dist:.2f})', fontsize=9, color='red')

# Draw perpendicular from Q to plane (approximate in 2D)
n2d = n[:2] / np.linalg.norm(n[:2])
proj = Q2d - (np.dot(n[:2], Q2d) - d_val/np.linalg.norm(n[2:])) * n2d
ax.annotate('', xy=P2d, xytext=Q2d,
            arrowprops=dict(arrowstyle='->', color='crimson', lw=1.5, linestyle='dashed'))

ax.set_xlim(-1, 4); ax.set_ylim(-1, 4)
ax.set_xlabel('x'); ax.set_ylabel('y')
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.grid(True, alpha=0.3); ax.legend(fontsize=9)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Line-plane intersection and distance',
              prose: [
                'Combine the parametric line formula with the plane dot-product test.',
                'Substitute r(t) = P0 + t*d into n·x = d, solve for t, then compute the intersection point.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

P0  = np.array([2.0, 0.0, 1.0])    # line base point
direction = np.array([1.0, -1.0, 3.0])  # direction

n       = np.array([1.0, 2.0, -1.0])
d_plane = 4.0

n_dot_d = np.dot(n, direction)
print(f"n . direction = {n_dot_d}")

if abs(n_dot_d) < 1e-10:
    print("Line is parallel to the plane -- no intersection")
else:
    t = (d_plane - np.dot(n, P0)) / n_dot_d
    intersection = P0 + t * direction
    print(f"t = {t:.4f}")
    print(f"Intersection point = {intersection}")
    print(f"Verify: n . intersection = {np.dot(n, intersection):.4f}  (should be {d_plane})")

# Visualize in 2D (x-z plane projection)
t_vals = np.linspace(-0.5, 0.8, 100)
line_pts = P0 + np.outer(t_vals, direction)

fig, ax = plt.subplots(figsize=(7, 5))
ax.set_title("Line-Plane Intersection (x-z projection)", fontsize=12)

# Plot projected line (x-z coords)
ax.plot(line_pts[:, 0], line_pts[:, 2], 'steelblue', lw=2, label='Line r(t)')
ax.scatter(P0[0], P0[2], color='steelblue', s=80, zorder=5)
ax.text(P0[0]+0.05, P0[2]+0.05, 'P0', fontsize=9, color='steelblue')

# Show the plane as a line in this projection (n . x = d_plane with y=0)
# n[0]*x + n[2]*z = d_plane when projected
x_range = np.linspace(2, 4.5, 50)
if abs(n[2]) > 1e-10:
    z_plane = (d_plane - n[0]*x_range) / n[2]
    ax.plot(x_range, z_plane, 'darkorange', lw=2, label='Plane (projected)')

if abs(n_dot_d) >= 1e-10:
    t_val = (d_plane - np.dot(n, P0)) / n_dot_d
    inter = P0 + t_val * direction
    ax.scatter(inter[0], inter[2], color='red', s=120, zorder=6,
               label=f'Intersection t={t_val:.2f}')
    ax.text(inter[0]+0.05, inter[2]+0.05, 'Intersection', fontsize=9, color='red')

ax.set_xlabel('x'); ax.set_ylabel('z')
ax.grid(True, alpha=0.3); ax.legend(fontsize=9)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 4,
              cellTitle: 'Application: 3D collision detection (ray tracing)',
              prose: [
                'Ray tracing renders photorealistic 3D graphics by firing rays from the camera through each pixel and checking which surfaces they hit.',
                'Each "ray" is a parametric line. Each "surface" is a plane (or a collection of triangles approximated by planes). The core algorithm is what you just learned.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

def ray_plane_intersection(ray_origin, ray_dir, plane_normal, plane_d):
    """Find where a ray hits a plane. Returns (t, point) or None if parallel."""
    denom = np.dot(plane_normal, ray_dir)
    if abs(denom) < 1e-6:
        return None  # ray is parallel to plane
    t = (plane_d - np.dot(plane_normal, ray_origin)) / denom
    if t < 0:
        return None  # intersection is behind the camera
    return t, ray_origin + t * ray_dir

# Camera shoots a ray
camera_pos = np.array([0.0, 0.0, 10.0])
ray_direction = np.array([0.2, -0.1, -1.0])
ray_direction /= np.linalg.norm(ray_direction)  # normalize to unit length

# Scene: a floor plane at y = -3
floor_normal = np.array([0.0, 1.0, 0.0])
floor_d = -3.0

result = ray_plane_intersection(camera_pos, ray_direction, floor_normal, floor_d)
if result:
    t, hit_point = result
    print(f"Ray hits the floor at t = {t:.3f}")
    print(f"Hit point: {hit_point.round(3)}")
    print(f"That's {t:.1f} units from the camera")
else:
    print("Ray misses the floor (parallel or going up)")

# Visualize in 2D (side view: x-z plane, ignoring y)
fig, ax = plt.subplots(figsize=(7, 5))
ax.set_title("Ray Tracing: Camera Ray Hitting Floor Plane", fontsize=12)

# Floor line (y = -3 shown as z = -3 in side view)
ax.axhline(-3, color='saddlebrown', lw=2, label='Floor plane (y=-3)')
ax.fill_between([-5, 5], -3, -5, alpha=0.2, color='saddlebrown')

# Camera position
cam2d = np.array([camera_pos[0], camera_pos[2]])  # (x, z)
ax.scatter(*cam2d, color='purple', s=120, zorder=5, label='Camera')
ax.text(cam2d[0]+0.1, cam2d[1]+0.1, 'Camera', fontsize=9, color='purple')

# Ray direction (x, z components)
ray2d_dir = np.array([ray_direction[0], ray_direction[2]])
if result:
    hit2d = np.array([hit_point[0], hit_point[2]])
    ax.annotate('', xy=hit2d, xytext=cam2d,
                arrowprops=dict(arrowstyle='->', color='steelblue', lw=2))
    ax.scatter(*hit2d, color='red', s=120, zorder=5, label=f'Hit point {hit_point.round(2)}')
    ax.text(hit2d[0]+0.1, hit2d[1]+0.1, 'Hit!', fontsize=10, color='red', fontweight='bold')

ax.set_xlim(-2, 5); ax.set_ylim(-5, 12)
ax.set_xlabel('x'); ax.set_ylabel('z (depth)')
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.grid(True, alpha=0.3); ax.legend(fontsize=9)
plt.tight_layout()
plt.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Find the plane through three points',
              difficulty: 'medium',
              prompt: 'Given three points A = [1, 0, 0], B = [0, 2, 0], C = [0, 0, 3]: (1) Find two vectors in the plane using B-A and C-A. (2) Compute the normal using np.cross(). (3) Find the plane constant d = np.dot(n, A). (4) Verify all three points satisfy n·x = d.',
              code: `import numpy as np

A = np.array([1.0, 0.0, 0.0])
B = np.array([0.0, 2.0, 0.0])
C = np.array([0.0, 0.0, 3.0])

# 1. Two vectors in the plane
# 2. Normal vector via cross product
# 3. Plane constant d
# 4. Verify all three points
`,
              hint: 'u = B - A, v = C - A. n = np.cross(u, v). d = np.dot(n, A). Check np.isclose(np.dot(n, A), d), same for B and C.',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Affine subspaces.** A **line** in $\\mathbb{R}^n$ is the set $\\{P_0 + t\\mathbf{d} : t \\in \\mathbb{R}\\}$ — a 1-dimensional affine subspace. A **plane** is $\\{P_0 + s\\mathbf{u} + t\\mathbf{v} : s, t \\in \\mathbb{R}\\}$ — a 2-dimensional affine subspace. "Affine" means a linear subspace shifted away from the origin. A subspace must contain the origin; an affine subspace need not. If $P_0 = \\mathbf{0}$, the affine subspace is a genuine linear subspace.',
      '**Hyperplanes.** The equation $\\mathbf{n} \\cdot \\mathbf{x} = d$ defines a **hyperplane** — a subspace of codimension 1 in $\\mathbb{R}^n$. In $\\mathbb{R}^3$: a plane (dimension 2). In $\\mathbb{R}^2$: a line (dimension 1). In $\\mathbb{R}^n$: an $(n-1)$-dimensional flat. The kernel of the linear map $f(\\mathbf{x}) = \\mathbf{n} \\cdot \\mathbf{x}$ is a linear subspace; the level set $f(\\mathbf{x}) = d$ is the affine hyperplane. The normal vector $\\mathbf{n}$ spans the orthogonal complement of the hyperplane.',
      '**Intersection of planes is a system.** Two planes $\\mathbf{n}_1 \\cdot \\mathbf{x} = d_1$ and $\\mathbf{n}_2 \\cdot \\mathbf{x} = d_2$ with linearly independent normals intersect in a line (codimension 2 in $\\mathbb{R}^3$). Three planes with linearly independent normals intersect in a point — which is exactly a $3 \\times 3$ linear system. This is the bridge between geometry (intersecting planes) and algebra (Gaussian elimination). Every intersection question in 3D is secretly a linear system.',
      '**General position.** In $\\mathbb{R}^n$, a line is a 1-flat (parametric = one free parameter). A plane is a 2-flat. In general, a $k$-flat has $k$ free parameters and is defined by $n - k$ independent linear equations. The "dimension" of an intersection of two flats of dimensions $p$ and $q$ is at least $p + q - n$ (when they are not parallel). This is the dimension formula for affine subspaces.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Affine Subspace (Formal)',
        body: 'An **affine subspace** of $\\mathbb{R}^n$ is a set of the form $P_0 + W$ where $W$ is a linear subspace.\n\n**Line** = $P_0 + \\text{span}\\{\\mathbf{d}\\}$ (1-dimensional)\n**Plane** = $P_0 + \\text{span}\\{\\mathbf{u}, \\mathbf{v}\\}$ (2-dimensional)\n\nDifference from a subspace: affine subspaces need not pass through the origin.',
      },
      {
        type: 'theorem',
        title: 'Codimension and Equations',
        body: 'Every hyperplane in $\\mathbb{R}^n$ is defined by exactly ONE linear equation. A line in $\\mathbb{R}^3$ needs TWO equations (intersection of two planes). Generally: a $k$-dimensional affine subspace is the solution set of $n - k$ independent linear equations.',
      },
      {
        type: 'insight',
        title: 'The Normal Vector Is the "Perpendicular Coordinate"',
        body: 'The normal vector $\\mathbf{n}$ is to a plane what the $z$-axis is to the $xy$-plane. It points in the one direction that has ZERO component within the plane. The distance from any point $Q$ to the plane is the magnitude of $Q$\'s component in the $\\mathbf{n}$ direction — literally a projection of $(Q - P_0)$ onto $\\hat{\\mathbf{n}}$.',
      },
    ],
    visualizations: [
      {
        id: 'ProjectionMatrixViz',
        title: 'Projection and Perpendicularity',
        mathBridge: 'The distance from a point to a plane is a projection: decompose the displacement vector into a component parallel to the normal and a component within the plane. The normal component is the distance.',
        caption: 'Distance = projection onto the unit normal.',
      },
    ],
  },

  examples: [
    {
      id: 'la1-005-ex1',
      title: 'Parametric and Symmetric Equations of a Line',
      problem: 'Find the parametric and symmetric equations of the line through $P_0 = (1, 2, -1)$ with direction $\\mathbf{d} = [3, -1, 2]$.',
      steps: [
        {
          expression: '\\mathbf{r}(t) = (1, 2, -1) + t[3, -1, 2]',
          annotation: 'Plug the base point $P_0 = (1,2,-1)$ and direction $\\mathbf{d} = [3,-1,2]$ into the parametric form $\\mathbf{r}(t) = P_0 + t\\mathbf{d}$. The parameter $t$ ranges over all reals, tracing the full infinite line.',
          strategyTitle: 'Write parametric form',
          hints: ['At $t=0$: $\\mathbf{r}(0) = (1,2,-1) = P_0$ âœ“. At $t=1$: $\\mathbf{r}(1) = (1+3, 2-1, -1+2) = (4,1,1)$.'],
        },
        {
          expression: 'x = 1 + 3t, \\quad y = 2 - t, \\quad z = -1 + 2t',
          annotation: 'Write the three component equations. Each is linear in $t$ — a line in each of the coordinate directions.',
          strategyTitle: 'Component form',
        },
        {
          expression: 't = \\frac{x-1}{3}, \\quad t = \\frac{y-2}{-1}, \\quad t = \\frac{z+1}{2}',
          annotation: 'Solve each component equation for $t$. Since all three expressions equal the same $t$, they must all be equal to each other.',
          strategyTitle: 'Solve each equation for t',
        },
        {
          expression: '\\frac{x-1}{3} = \\frac{y-2}{-1} = \\frac{z+1}{2}',
          annotation: 'Set all three expressions equal — this is the symmetric (or Cartesian) form of the line. Each denominator is a component of $\\mathbf{d}$; each numerator is the distance from $P_0$ in that coordinate.',
          strategyTitle: 'Set equal — symmetric form',
          hints: ['The symmetric form is useful for checking whether a point lies on the line: substitute the point coordinates and verify all three ratios are equal.'],
        },
      ],
      conclusion: 'Parametric: $(1+3t,\\ 2-t,\\ -1+2t)$. Symmetric: $\\frac{x-1}{3} = \\frac{y-2}{-1} = \\frac{z+1}{2}$. Both describe the same infinite line.',
    },
    {
      id: 'la1-005-ex2',
      title: 'Equation of a Plane from Three Points',
      problem: 'Find the equation of the plane through $A = (1,0,0)$, $B = (0,1,0)$, $C = (0,0,2)$.',
      steps: [
        {
          expression: '\\mathbf{u} = B - A = [-1, 1, 0], \\quad \\mathbf{v} = C - A = [-1, 0, 2]',
          annotation: 'Form two vectors $\\mathbf{u}$ and $\\mathbf{v}$ lying IN the plane by subtracting the base point $A$ from the other two points. Any vector from one point on the plane to another is a displacement within the plane.',
          strategyTitle: 'Two vectors in the plane',
          hints: ['Verify: $\\mathbf{u}$ connects $A$ to $B$, so it lies in the plane. Same for $\\mathbf{v}$.'],
        },
        {
          expression: '\\mathbf{n} = \\mathbf{u} \\times \\mathbf{v} = \\begin{vmatrix}\\mathbf{i}&\\mathbf{j}&\\mathbf{k}\\\\-1&1&0\\\\-1&0&2\\end{vmatrix}',
          annotation: 'Compute the cross product $\\mathbf{n} = \\mathbf{u} \\times \\mathbf{v}$. The cross product is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$, so it is perpendicular to the plane — it IS the normal vector.',
          strategyTitle: 'Cross product for normal',
        },
        {
          expression: '\\mathbf{n} = \\mathbf{i}(1\\cdot2 - 0\\cdot0) - \\mathbf{j}((-1)\\cdot2 - 0\\cdot(-1)) + \\mathbf{k}((-1)\\cdot0 - 1\\cdot(-1)) = [2, 2, 1]',
          annotation: 'Expand the $3 \\times 3$ determinant cofactor by cofactor. Result: $\\mathbf{n} = [2, 2, 1]$.',
          strategyTitle: 'Evaluate cross product',
          hints: ['Verify $\\mathbf{n} \\cdot \\mathbf{u} = 0$: $[2,2,1]\\cdot[-1,1,0] = -2+2+0 = 0$ âœ“. And $\\mathbf{n} \\cdot \\mathbf{v} = 0$: $[2,2,1]\\cdot[-1,0,2] = -2+0+2 = 0$ âœ“.'],
        },
        {
          expression: '\\mathbf{n} \\cdot (\\mathbf{x} - A) = 0 \\quad \\Rightarrow \\quad 2(x-1) + 2(y-0) + 1(z-0) = 0',
          annotation: 'Use point $A = (1,0,0)$ in the point-normal form $\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0$. Every point $\\mathbf{x}$ on the plane satisfies this — the vector from $A$ to $\\mathbf{x}$ is perpendicular to $\\mathbf{n}$.',
          strategyTitle: 'Point-normal form',
        },
        {
          expression: '2x + 2y + z = 2',
          annotation: 'Expand and simplify: $2x - 2 + 2y + z = 0$ → $2x + 2y + z = 2$. The scalar equation $ax + by + cz = d$ has the normal vector $[a,b,c] = [2,2,1]$ as its coefficients.',
          strategyTitle: 'Scalar equation',
          hints: ['Verify all three points: $A=(1,0,0)$: $2+0+0=2$ âœ“. $B=(0,1,0)$: $0+2+0=2$ âœ“. $C=(0,0,2)$: $0+0+2=2$ âœ“.'],
        },
      ],
      conclusion: 'The plane through $A$, $B$, $C$ has equation $2x + 2y + z = 2$. Normal vector $[2,2,1]$ is perpendicular to every vector lying in the plane.',
    },
    {
      id: 'la1-005-ex3',
      title: 'Line-Plane Intersection',
      problem: 'Find where the line $\\mathbf{r}(t) = (2, 0, 1) + t[1, -1, 3]$ intersects the plane $x + 2y - z = 4$.',
      steps: [
        {
          expression: '\\mathbf{n} = [1, 2, -1], \\quad d = 4, \\quad P_0 = (2,0,1), \\quad \\mathbf{d}_{\\text{line}} = [1,-1,3]',
          annotation: 'Identify the ingredients: $\\mathbf{n} = [1,2,-1]$ is the normal to the plane (read from the coefficients), $d = 4$ is the plane offset, $P_0$ is the line base point, and $\\mathbf{d}_{\\text{line}}$ is the line direction.',
          strategyTitle: 'Identify all components',
        },
        {
          expression: 't = \\frac{d - \\mathbf{n} \\cdot P_0}{\\mathbf{n} \\cdot \\mathbf{d}_{\\text{line}}} = \\frac{4 - (1\\cdot2 + 2\\cdot0 + (-1)\\cdot1)}{1\\cdot1 + 2\\cdot(-1) + (-1)\\cdot3}',
          annotation: 'Apply the intersection formula: substitute $\\mathbf{r}(t) = P_0 + t\\mathbf{d}_{\\text{line}}$ into $\\mathbf{n} \\cdot \\mathbf{x} = d$ and solve for the parameter $t$.',
          strategyTitle: 'Apply intersection formula',
        },
        {
          expression: 't = \\frac{4 - 1}{1 - 2 - 3} = \\frac{3}{-4} = -\\frac{3}{4}',
          annotation: 'Numerator: $\\mathbf{n} \\cdot P_0 = 2 + 0 - 1 = 1$, so $4 - 1 = 3$. Denominator: $\\mathbf{n} \\cdot \\mathbf{d}_{\\text{line}} = 1 - 2 - 3 = -4$. Result: $t = -3/4$.',
          strategyTitle: 'Evaluate t',
          hints: ['If the denominator were 0 ($\\mathbf{n} \\cdot \\mathbf{d}_{\\text{line}} = 0$), the line direction would be perpendicular to the normal — meaning the line runs parallel to the plane and never intersects it.'],
        },
        {
          expression: '\\mathbf{r}\\!\\left(-\\tfrac{3}{4}\\right) = \\left(2 - \\tfrac{3}{4},\\ 0 + \\tfrac{3}{4},\\ 1 - \\tfrac{9}{4}\\right) = \\left(\\tfrac{5}{4},\\ \\tfrac{3}{4},\\ -\\tfrac{5}{4}\\right)',
          annotation: 'Substitute $t = -3/4$ back into the parametric line equation $\\mathbf{r}(t) = P_0 + t\\mathbf{d}_{\\text{line}}$ to find the exact intersection point.',
          strategyTitle: 'Find intersection point',
          hints: ['Verify on the plane: $\\frac{5}{4} + 2 \\cdot \\frac{3}{4} - (-\\frac{5}{4}) = \\frac{5}{4} + \\frac{6}{4} + \\frac{5}{4} = \\frac{16}{4} = 4$ âœ“'],
        },
      ],
      conclusion: 'The line hits the plane at $\\left(\\frac{5}{4}, \\frac{3}{4}, -\\frac{5}{4}\\right)$.',
    },
    {
      id: 'la1-005-ex4',
      title: 'Distance from a Point to a Plane',
      problem: 'Find the distance from $Q = (1, 2, 3)$ to the plane $2x - y + 2z = 6$.',
      steps: [
        {
          expression: '\\mathbf{n} = [2, -1, 2], \\quad d = 6, \\quad \\|\\mathbf{n}\\| = \\sqrt{4+1+4} = \\sqrt{9} = 3',
          annotation: 'Extract the normal vector $\\mathbf{n} = [2,-1,2]$ from the plane coefficients $a=2$, $b=-1$, $c=2$. Compute $\\|\\mathbf{n}\\| = \\sqrt{a^2+b^2+c^2} = 3$. This normalizer converts the raw dot product into an actual distance.',
          strategyTitle: 'Identify normal vector and compute magnitude',
        },
        {
          expression: '\\text{dist} = \\frac{|\\mathbf{n} \\cdot Q - d|}{\\|\\mathbf{n}\\|} = \\frac{|2(1) + (-1)(2) + 2(3) - 6|}{3} = \\frac{|2 - 2 + 6 - 6|}{3} = \\frac{|0|}{3} = 0',
          annotation: 'Apply the distance formula. Compute the numerator: $2(1) - 1(2) + 2(3) = 2 - 2 + 6 = 6$. Then $|6 - 6| = 0$. Distance zero means $Q$ is ON the plane.',
          strategyTitle: 'Apply distance formula',
          hints: ['Verify directly: $2(1) - (2) + 2(3) = 2 - 2 + 6 = 6$ — this equals $d = 6$, so $Q$ satisfies the plane equation exactly.'],
        },
      ],
      conclusion: 'Distance = 0, meaning $Q = (1, 2, 3)$ lies on the plane $2x - y + 2z = 6$. The distance formula gives 0 whenever the query point satisfies the plane equation.',
    },
  ],

  challenges: [
    {
      id: 'la1-005-ch1',
      difficulty: 'easy',
      problem: 'Write parametric equations for the line through $P = (0, 1, -2)$ and $Q = (3, -1, 4)$.',
      walkthrough: [
        { expression: '\\mathbf{d} = Q - P = [3-0,\ -1-1,\ 4-(-2)] = [3,-2,6]', annotation: 'The direction vector points from P toward Q. Any scalar multiple of d gives the same line \u2014 both P\u2192Q and Q\u2192P describe the same line.' },
        { expression: '\\mathbf{r}(t) = (0,1,-2) + t[3,-2,6] = (3t,\ 1-2t,\ -2+6t)', annotation: 'Use P as the base point in the formula r(t) = P\u2080 + t\u00b7d. At t=0 you get P; at t=1 you get Q.' },
        { expression: 't=0:\; (0,1,-2)=P\; \\checkmark;\quad t=1:\; (3,-1,4)=Q\; \\checkmark', annotation: 'Verify both endpoints. t=0 returns P, t=1 returns Q. The line passes through both.' },
      ],
      answer: '$\\mathbf{r}(t) = (3t,\ 1-2t,\ -2+6t)$ for $t \\in \\mathbb{R}$.',
    },
    {
      id: 'la1-005-ch2',
      difficulty: 'medium',
      problem: 'Find the plane containing the three points $P=(2,1,0)$, $Q=(1,3,-1)$, $R=(0,0,4)$. Give the equation in the form $ax+by+cz=d$.',
      walkthrough: [
        { expression: '\\mathbf{u}=Q-P=[-1,2,-1],\\quad\\mathbf{v}=R-P=[-2,-1,4]', annotation: 'Two vectors lying in the plane: subtract the base point P from each of the other two points.' },
        { expression: '\\mathbf{n}=\\mathbf{u}\\times\\mathbf{v}=\\begin{vmatrix}\\mathbf{i}&\\mathbf{j}&\\mathbf{k}\\\\-1&2&-1\\\\-2&-1&4\\end{vmatrix}=[7,6,5]', annotation: 'Cross product gives the normal. Verify: n\u00b7u = -7+12-5=0 \u2713 and n\u00b7v = -14-6+20=0 \u2713.' },
        { expression: '7(x-2)+6(y-1)+5(z-0)=0', annotation: 'Point-normal form using P=(2,1,0). Expand: 7x-14+6y-6+5z=0.' },
        { expression: '7x+6y+5z=20', annotation: 'Scalar form. Verify: P: 14+6+0=20 \u2713; Q: 7+18-5=20 \u2713; R: 0+0+20=20 \u2713.' },
      ],
      answer: '$7x + 6y + 5z = 20$',
    },
    {
      id: 'la1-005-ch3',
      difficulty: 'hard',
      problem: 'Find the distance between the two parallel planes $x + 2y - 2z = 4$ and $x + 2y - 2z = 13$.',
      walkthrough: [
        { expression: '\\|\\mathbf{n}\\|=\\sqrt{1^2+2^2+(-2)^2}=\\sqrt{9}=3', annotation: 'Extract the normal n=[1,2,-2] from both planes (same coefficients). Compute its magnitude once \u2014 you will use it for the distance formula.' },
        { expression: 'Q=(4,0,0)\;\\in\;P_1:\quad 1(4)+2(0)-2(0)=4\;\\checkmark', annotation: 'Pick any point on plane P\u2081 by setting y=z=0, giving x=4.' },
        { expression: '\\text{dist}=\\dfrac{|1(4)+2(0)-2(0)-13|}{3}=\\dfrac{|4-13|}{3}=\\dfrac{9}{3}=3', annotation: 'Apply the distance formula from Q to plane P\u2082. Shortcut: for parallel planes ax+by+cz=d\u2081 and d\u2082, the distance is |d\u2082-d\u2081|/\u2016n\u2016 = |13-4|/3 = 3.' },
      ],
      answer: 'Distance = 3 units.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathbf{r}(t) = P_0 + t\\mathbf{d}', meaning: 'Parametric equation of a line through P₀ in direction d' },
      { symbol: 'ax + by + cz = d', meaning: 'Scalar equation of a plane with normal vector [a,b,c]' },
      { symbol: '\\mathbf{n} \\cdot (\\mathbf{x} - P_0) = 0', meaning: 'Point-normal form: all points x on the plane are perpendicular to n from P₀' },
      { symbol: '\\text{dist} = \\frac{|\\mathbf{n}\\cdot Q - d|}{\\|\\mathbf{n}\\|}', meaning: 'Distance from point Q to the plane with normal n and offset d' },
    ],
    rulesOfThumb: [
      'Line in 3D needs a point + direction vector (parametric form).',
      'Plane in 3D needs a point + normal vector (point-normal form).',
      'Cross product of two in-plane vectors = the normal vector.',
      'One equation in 3D = a plane. A line in 3D needs TWO equations.',
      'If denominator n·d = 0 in the intersection formula, the line is parallel to the plane.',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'la1-003', label: 'Dot and Cross Products', note: 'The dot product underpins the plane equation (n·x = d). The cross product produces the normal from two edge vectors.' },
    ],
    futureLinks: [
      { lessonId: 'la2-001', label: 'Matrices as Transformations', note: 'The parametric form P\u2080 + t\u00b7d becomes a matrix equation when you express the constraint as Ax=b \u2014 connecting geometry back to linear systems.' },
      { lessonId: 'la4-001', label: 'Orthogonal Projections', note: 'The distance formula is a projection: you project the point onto the normal direction. The full machinery of projections generalizes this to any subspace.' },
      { lessonId: 'la1-006', label: 'Gauss-Jordan RREF', note: 'Finding the intersection of two or three planes is exactly a linear system solved by Gaussian elimination \u2014 reinforcing the algebraic side of geometric intersection.' },
    ],
  },

  mentalModel: [
    'Line = point + direction × parameter. One degree of freedom.',
    'Plane = point + normal vector. Perpendicularity condition.',
    'Normal vector = cross product of two in-plane edges.',
    'Line-plane intersection: substitute parametric into plane, solve for t.',
    'Distance to plane = projection of (Q - P₀) onto unit normal.',
  ],

  checkpoints: [
    { id: 'cp-la1-005-1', label: 'Read: Write parametric form of a line given point and direction', type: 'read' },
    { id: 'cp-la1-005-2', label: 'Read: Identify normal vector from scalar plane equation', type: 'read' },
    { id: 'cp-la1-005-3', label: 'Read: Compute distance from point to plane', type: 'read' },
    { id: 'cp-la1-005-4', label: 'Run: OpenMAT \u2014 parametric line and distance formula', type: 'lab' },
    { id: 'cp-la1-005-5', label: 'Run: Python \u2014 plane dot-product test and line-plane intersection', type: 'lab' },
    { id: 'cp-la1-005-6', label: 'Complete: Example 2 \u2014 find plane through three points', type: 'example' },
    { id: 'cp-la1-005-7', label: 'Complete: Example 3 \u2014 line-plane intersection', type: 'example' },
    { id: 'cp-la1-005-8', label: 'Attempt: Challenge 3 \u2014 distance between parallel planes', type: 'challenge' },
  ],

  assessment: {
    questions: [
      {
        id: 'la1-005-assess-1',
        type: 'choice',
        text: 'What is the normal vector to the plane $3x - y + 4z = 7$?',
        options: ['[3, -1, 4]', '[7, 0, 0]', '[1, 1, 1]', '[-3, 1, -4]'],
        answer: '[3, -1, 4]',
        hint: 'The normal vector is formed directly from the coefficients of x, y, z in the scalar plane equation.',
      },
    ],
  },

  quiz: [
    {
      id: 'la1-005-quiz-1',
      type: 'choice',
      text: 'In 3D, the equation $2x - y + 3z = 5$ defines which geometric object?',
      options: ['A line', 'A plane', 'A point', 'A sphere'],
      answer: 'A plane',
      hints: ['One linear equation in 3 variables always defines a plane (a 2D surface). You need TWO equations to define a line in 3D.'],
      reviewSection: 'Intuition — warning callout',
    },
    {
      id: 'la1-005-quiz-2',
      type: 'choice',
      text: 'You have two vectors $\\mathbf{u}$ and $\\mathbf{v}$ lying in a plane. Which operation gives the normal vector?',
      options: ['u + v', 'u · v', 'u × v', '|u| − |v|'],
      answer: 'u × v',
      hints: ['The cross product produces a vector perpendicular to BOTH inputs — that perpendicularity is exactly the definition of normal to the plane.'],
      reviewSection: 'Intuition — cross product insight',
    },
    {
      id: 'la1-005-quiz-3',
      type: 'choice',
      text: 'The line $\\mathbf{r}(t) = (1,0,2) + t[3,-1,1]$ is tested for intersection with the plane $\\mathbf{n}\\cdot\\mathbf{x}=d$ where $\\mathbf{n}=[3,-1,1]$. Since $\\mathbf{n}\\cdot\\mathbf{d} = 9+1+1 = 11 \\neq 0$, the line:',
      options: ['Is parallel to the plane', 'Lies inside the plane', 'Intersects the plane at exactly one point', 'Is perpendicular to the normal'],
      answer: 'Intersects the plane at exactly one point',
      hints: ['n·d ≠ 0 means the denominator in the formula t = (d - n·P₀)/(n·d) is defined, so there is exactly one intersection.'],
      reviewSection: 'Math — line-plane intersection',
    },
    {
      id: 'la1-005-quiz-4',
      type: 'choice',
      text: 'What is the distance from the origin $(0,0,0)$ to the plane $x + y + z = 3$?',
      options: ['1', 'âˆš3', '3', '3/âˆš3 = âˆš3'],
      answer: 'âˆš3',
      hints: ['dist = |1(0)+1(0)+1(0)-3| / âˆš(1+1+1) = 3/âˆš3 = âˆš3.'],
      reviewSection: 'Math — distance formula',
    },
    {
      id: 'la1-005-quiz-5',
      type: 'choice',
      text: 'Two planes $ax+by+cz=d_1$ and $ax+by+cz=d_2$ (with $d_1 \\neq d_2$) are:',
      options: ['Identical', 'Intersecting along a line', 'Parallel and distinct', 'Perpendicular'],
      answer: 'Parallel and distinct',
      hints: ['Same normal vector [a,b,c] means same orientation (parallel). Different right-hand sides d₁≠d₁ means different positions (distinct). Parallel lines never intersect.'],
      reviewSection: 'Rigor — parallel planes',
    },
    {
      id: 'la1-005-quiz-6',
      type: 'choice',
      text: 'The plane $3x + y - 2z = 7$ has normal vector $\\mathbf{n} = [3, 1, -2]$. A student uses $[3,1,-2]$ as the direction vector of a line and claims the line lies in the plane. What is wrong?',
      options: [
        'The normal vector has the wrong sign for a direction vector',
        'A direction vector parallel to the normal is PERPENDICULAR to the plane — the line would drill through it, not lie in it',
        'The direction vector must always have magnitude 1',
        'Nothing — the normal vector can always serve as a line direction in the plane',
      ],
      answer: 'A direction vector parallel to the normal is PERPENDICULAR to the plane — the line would drill through it, not lie in it',
      hints: ['A line IN the plane must have a direction $\\mathbf{d}$ satisfying $\\mathbf{n} \\cdot \\mathbf{d} = 0$. Using $\\mathbf{n}$ itself gives $\\mathbf{n} \\cdot \\mathbf{n} = \\|\\mathbf{n}\\|^2 \\neq 0$ — so the line is perpendicular to the plane, not inside it.'],
      reviewSection: 'Intuition — warning callout: normal vs direction',
    },
  ],

  // ── Misconceptions ────────────────────────────────────────────────
  misconceptions: [
    {
      falseBelief: 'One equation in 3D defines a line.',
      whyStudentsThinkIt: 'In 2D, one equation defines a line — students carry this pattern to 3D without adjustment.',
      correctionExample: 'x + 2y - z = 4 in 3D defines a PLANE (infinitely many points). To get a line in 3D you need TWO equations (two planes intersecting). Parametric form r(t) = P₀ + t·d uses one free parameter and is the clean way to express a line.',
      contrastCase: '2D: ax+by=c → line. 3D: ax+by+cz=d → plane. Line in 3D: intersection of TWO planes (two equations).',
    },
    {
      falseBelief: 'The normal vector to a plane can be used as a direction vector for a line lying in the plane.',
      whyStudentsThinkIt: 'Students know the normal "belongs" to the plane and confuse "associated with" with "lying in".',
      correctionExample: 'The normal n=[1,2,-1] to the plane x+2y-z=4 is PERPENDICULAR to the plane. A line IN the plane must have direction d satisfying n·d=0. Using n as d gives a line that drills through the plane perpendicularly.',
      contrastCase: 'Direction IN the plane: any d with n·d=0, e.g., d=[2,-1,0] (verify: 2-2+0=0 âœ“). Normal direction: d=n=[1,2,-1] (n·d=6≠0 → perpendicular to plane).',
    },
  ],

  // ── Transfer Prompts ──────────────────────────────────────────────
  transferPrompts: [
    {
      situation: 'A game engine must check whether a bullet (modeled as a ray) hits a wall (modeled as a plane). Which formula applies?',
      competingTechniques: ['Line-plane intersection formula', 'Distance formula', 'Cross product'],
      whyThisTechniqueWins: 'The line-plane intersection formula t=(d-n·P₀)/(n·d) gives the exact parameter t where the ray hits the plane. If t>0, the hit is in front of the camera. If t<0, the ray is going away from the wall. Distance only tells you how far off-plane a static point is — it does not give intersection timing.',
    },
    {
      situation: 'A mesh triangle is defined by vertices A, B, C. A renderer must shade the surface correctly, which requires a unit normal. What is the workflow?',
      competingTechniques: ['Cross product of edge vectors', 'Average of vertex positions', 'Dot product of edges'],
      whyThisTechniqueWins: 'u = B-A and v = C-A are vectors lying in the triangle plane. n = u×v is perpendicular to both — it is the triangle normal. Normalize: nÌ‚ = n/–n–. The dot product gives a scalar (angle), not a direction; averaging positions gives the centroid, not the normal.',
    },
  ],

  // ── Debugging ─────────────────────────────────────────────────────
  debugging: [
    {
      commonError: 'np.cross(u, v) returns the zero vector.',
      symptom: 'Normal vector is [0, 0, 0] — plane equation degenerates.',
      whyItHappened: 'u and v are parallel (or one is zero). Parallel vectors do not span a plane — they lie on the same line, so there is no unique normal.',
      repairStrategy: 'Check that np.linalg.norm(u) > 0, np.linalg.norm(v) > 0, and that u and v are not scalar multiples of each other (np.cross(u,v) == 0 confirms they are parallel). Pick a third point that is genuinely off the line to get a non-degenerate second edge.',
    },
    {
      commonError: 'Distance formula gives an incorrect result.',
      symptom: 'The distance is computed but does not match geometric intuition.',
      whyItHappened: 'The most common slip is forgetting to divide by –n– — computing |n·Q - d| alone gives the unnormalized projection, not the true distance.',
      repairStrategy: 'Always divide by np.linalg.norm(n) (or sqrt(dot(n,n)) in OpenMAT). Verify with a sanity check: if Q is the point P₀ used to define the plane, the distance should be 0.',
    },
  ],

  // ── Mastery ────────────────────────────────────────────────────────
  mastery: {
    targetLevel: 2,
    solveIndependently: 'Given three points in ℝ³, find the plane equation (ax+by+cz=d) by hand and verify all three points satisfy it.',
    explainVerbally: 'Explain why a normal vector cannot be used as a line direction lying in the plane, and why a single equation in 3D defines a plane rather than a line.',
    detectIncorrectApplication: 'Catch when a classmate uses norm(n) in OpenMAT (fails on column vectors — use sqrt(dot(n,n))), or writes a single equation and calls it a line in 3D.',
    transferToUnfamiliar: 'Apply the distance formula in ℝⁿ: for a hyperplane n·x=d in ℝ⁴, the distance from Q is |n·Q-d|/–n– — the same formula works in any dimension.',
  },
};
