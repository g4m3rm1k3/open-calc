export default {
  id: 'la1-003',
  slug: 'dot-and-cross-products',
  chapter: 'la1',
  order: 3,
  title: 'Dot and Cross Products',
  subtitle: 'How to multiply vectors to measure angles, projections, and perpendicular spaces.',
  tags: ['dot product', 'cross product', 'orthogonal', 'projection', 'angle', 'area'],
  aliases: 'inner product vector multiplication perpendicular normal vector scalar product',

  timeToComplete: 25,
  coreConcept: 'The dot product measures how much two vectors align (producing a scalar), while the cross product measures how perpendicular they are (producing a new vector in 3D).',
  prerequisites: ['la1-002'],
  nextLesson: 'la1-004',

  hook: {
    question: "If you push an object along a train track, does a force pushing sideways help you move the train forward?",
    realWorldContext: "Imagine you are pulling a heavy wagon. If you pull straight ahead, 100% of your energy goes into moving the wagon. If you pull at an upward angle, some of your energy is wasted lifting the wagon instead of pulling it forward. We need a mathematical tool to calculate exactly how much of one vector points in the direction of another. Meanwhile, in 3D graphics, a computer constantly needs to know which way a polygon is facing (its 'normal') to calculate lighting and shadows. We need a tool that takes two edges of a polygon and generates a perfectly perpendicular arrow. These two tools are the Dot Product and the Cross Product.",
    previewVisualizationId: 'LALesson03_DotCross',
  },

  intuition: {
    prose: [
      'Take $\\mathbf{u} = [3, 0]^T$ and $\\mathbf{v} = [0, 4]^T$. Multiply matching components and sum: $(3)(0) + (0)(4) = 0$. Zero means exactly perpendicular. Now try $\\mathbf{u} = [3, 0]^T$ and $\\mathbf{w} = [1, 0]^T$ (both pointing right): $(3)(1) + (0)(0) = 3$ — positive, because they fully agree in direction. This component-multiply-and-sum operation is the **dot product**, and its sign is the universal test for directional agreement between any two vectors in any dimension.',
      'Think of the **Dot Product** as the ultimate measure of agreement. If two vectors point in exactly the same direction, their dot product is large. If they point in opposite directions, it is large and negative. If they are perfectly perpendicular — they have absolutely nothing in common — their dot product is exactly zero. The dot product crushes two vectors down into a single scalar.',
      '**Predict before reading on:** Take $\\mathbf{p} = [1, 1]^T$ (pointing at 45°) and $\\mathbf{q} = [-1, 1]^T$ (pointing at 135°). Predict the sign of $\\mathbf{p}\\cdot\\mathbf{q}$: positive, zero, or negative? Compute it and check whether the result matches your geometric intuition.',
      'Geometrically, the dot product is shining a flashlight down onto one vector and seeing how long its shadow is on the other vector. This "shadow" is called a *projection*. Multiplying the shadow length by the length of the vector it lies on gives the dot product.',
      'The **Cross Product** is the opposite: it measures disagreement. Defined only in 3D, when you cross two 3D arrows, the result is a brand new 3D vector with two magical properties: (1) Its length equals the area of the parallelogram formed by the original two vectors, and (2) it points completely perpendicular to BOTH original vectors.',
      '**Real-world application — CNC toolpath geometry.** In 5-axis CNC machining, the dot product tells the controller whether the cutting tool is properly oriented. The tool axis vector $\\hat{\\mathbf{t}}$ and the surface normal $\\hat{\\mathbf{n}}$ satisfy $\\hat{\\mathbf{t}} \\cdot \\hat{\\mathbf{n}} = \\cos\\theta$ where $\\theta$ is the tilt angle. Most surface operations want $\\theta \\approx 0°$ (tool perpendicular to surface — $\\hat{\\mathbf{t}} \\cdot \\hat{\\mathbf{n}} \\approx 1$). Flank milling of ruled surfaces instead requires the tool to be nearly parallel to the surface ($\\theta \\approx 90°$, dot product $\\approx 0$). The cross product $\\hat{\\mathbf{t}} \\times \\hat{\\mathbf{n}}$ gives the lead direction — the axis around which the tilted tool rotates — and its magnitude gives $\\sin\\theta$, the amount of tilt.',
      '**Where this is heading:** The dot product is the foundation of matrix multiplication. When you multiply a row of a matrix by a column vector, you are doing a dot product. Orthogonality (dot product = 0) will eventually lead to the Singular Value Decomposition (SVD).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 6 — Vectors & Spaces',
        body: '**Previous:** Linear Combinations — span, basis, linear independence.\n**This lesson:** Dot and Cross Products — angles between vectors, projections, and 3D area.\n**Next:** Systems of Linear Equations — translating geometry into solvable algebra.',
      },
      {
        type: 'insight',
        title: 'Dot vs Cross Output',
        body: 'A Dot Product returns a NUMBER (scalar). A Cross Product returns an ARROW (vector). Never mix them up.',
      },
      {
        type: 'insight',
        title: 'WHY Does the Dot Product Equal $|a||b|\\cos\\theta$?',
        body: 'Project $\\mathbf{v}$ onto $\\mathbf{w}$. The projection (shadow) has length $\\|\\mathbf{v}\\|\\cos\\theta$. The dot product is: (length of shadow) × (length of $\\mathbf{w}$) = $\\|\\mathbf{v}\\|\\cos\\theta \\cdot \\|\\mathbf{w}\\|$. The component formula $v_1w_1 + v_2w_2$ gives the same number — two different ways to compute the same thing.',
      },
      {
        type: 'insight',
        title: 'The Compass Needle Analogy for Dot Product Sign',
        body: 'Imagine $\\mathbf{w}$ is a compass needle pointing North. The dot product $\\mathbf{v} \\cdot \\mathbf{w}$ tells you: **positive** if $\\mathbf{v}$ has any Northward component (angle < 90°), **zero** if $\\mathbf{v}$ points perfectly East or West (angle = 90°), **negative** if $\\mathbf{v}$ has any Southward component (angle > 90°).',
      },
      {
        type: 'procedure',
        title: 'Procedure: Computing the Angle Between Two Vectors',
        body: 'Step 1. Compute the dot product: $\\mathbf{u}\\cdot\\mathbf{v} = u_1v_1 + u_2v_2 + \\cdots$\nStep 2. Compute magnitudes: $\\|\\mathbf{u}\\| = \\sqrt{\\mathbf{u}\\cdot\\mathbf{u}}$, $\\|\\mathbf{v}\\| = \\sqrt{\\mathbf{v}\\cdot\\mathbf{v}}$\nStep 3. Divide: $\\cos\\theta = (\\mathbf{u}\\cdot\\mathbf{v})/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|)$\nStep 4. $\\theta = \\arccos(\\cos\\theta)$\n\nOrthogonality shortcut: skip steps 2–4. If $\\mathbf{u}\\cdot\\mathbf{v} = 0$, the vectors are perpendicular.',
      },
      {
        type: 'warning',
        title: 'Common Mistake: Applying Cross Product in 2D',
        body: 'The cross product $\\mathbf{u} \\times \\mathbf{v}$ is ONLY defined in $\\mathbb{R}^3$. In 2D, there is no third axis for the result to point along — the result would need to point "out of the page," which does not exist in a 2D space. If you are working in 2D and need the area of a parallelogram, use $|u_1v_2 - u_2v_1|$ (the magnitude of the 2D determinant).',
      },
      {
        type: 'insight',
        title: 'When to Use This',
        body: '**Use dot product when:** checking orthogonality (result = 0?), finding angles between vectors, computing projections, measuring how much two things "agree".\n\n**Use cross product when:** finding a normal vector to a plane, computing the area of a parallelogram or triangle, or generating a vector perpendicular to two given vectors.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson03_DotCross',
        title: 'The Shadow of the Dot Product',
        mathBridge: 'Drag $\\mathbf{w}$ closer to $\\mathbf{v}$. Watch the dot product increase as they align. Make them perpendicular (an L shape) to see the dot product hit zero. Drag them to opposite directions and watch the value go negative.',
        caption: 'The dot product is a continuous measure of directional alignment.',
      },
    ],
  },

  math: {
    prose: [
      'The **Dot Product** (or inner product) is easy to calculate algebraically — multiply matching components and sum:\n\n$\\mathbf{v} \\cdot \\mathbf{w} = v_1 w_1 + v_2 w_2 + \\dots + v_n w_n$',
      'This simple arithmetic is tied to the angle $\\theta$ between the vectors by:\n\n$\\mathbf{v} \\cdot \\mathbf{w} = \\|\\mathbf{v}\\| \\|\\mathbf{w}\\| \\cos(\\theta)$\n\nBecause $\\cos(90°) = 0$, the dot product of any two perpendicular (orthogonal) vectors is always 0.',
      'The **Cross Product** only works in $\\mathbb{R}^3$. The geometric magnitude formula is:\n\n$\\|\\mathbf{v} \\times \\mathbf{w}\\| = \\|\\mathbf{v}\\| \\|\\mathbf{w}\\| \\sin(\\theta)$\n\nThe direction of $\\mathbf{v} \\times \\mathbf{w}$ is given by the Right-Hand Rule: point your index finger along $\\mathbf{v}$, middle finger along $\\mathbf{w}$, and your thumb points exactly in the direction of the cross product.',
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Finding the Angle Between Two Vectors',
        body: 'Rearrange the geometric dot product formula to find the angle:\n\n$\\cos(\\theta) = \\dfrac{\\mathbf{v} \\cdot \\mathbf{w}}{\\|\\mathbf{v}\\| \\|\\mathbf{w}\\|}$\n\nThen $\\theta = \\arccos\\left(\\dfrac{\\mathbf{v} \\cdot \\mathbf{w}}{\\|\\mathbf{v}\\| \\|\\mathbf{w}\\|}\\right)$. This works in any dimension.',
      },
      {
        type: 'theorem',
        title: 'Cross Product Component Formula',
        body: '$\\mathbf{v} \\times \\mathbf{w} = \\begin{bmatrix} v_2 w_3 - v_3 w_2 \\\\ v_3 w_1 - v_1 w_3 \\\\ v_1 w_2 - v_2 w_1 \\end{bmatrix}$\n\nMemory trick: the indices cycle — component $i$ uses indices $j$ and $k$ (the other two).',
      },
    ],
    visualizations: [
      {
        id: 'CrossProductViz',
        title: 'The Cross Product Area',
        mathBridge: 'Observe two vectors on the floor of the 3D grid. As you drag them apart to form a larger parallelogram, the cross product vector (pointing straight up) grows taller. The height of the new vector equals the area of the ground parallelogram.',
        caption: 'The cross product generates a vector whose length equals the swept area.',
      },
      {
        id: 'OpenMatNotebook',
        title: 'Dot and Cross Products in OpenMAT / MATLAB',
        mathBridge: 'MATLAB\'s `dot(u,v)` computes the component-wise sum of products. For angle recovery: `acos(dot(u,v)/(norm(u)*norm(v)))` gives θ in radians. `cross(u,v)` only works for 3-element vectors.',
        caption: 'OpenMAT mirrors real MATLAB. Learn the functions here.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'dot() — the alignment test',
              prose: [
                '`dot(u, v)` computes $u_1v_1 + u_2v_2 + \\cdots + u_nv_n$ — multiply matching components, then sum. The result is a single scalar number that encodes the directional relationship between the two vectors.',
                'The sign is the diagnostic: `dot(u, v) > 0` means the vectors share a component in the same direction (angle $< 90°$); `dot(u, v) = 0` means perfectly perpendicular ($\\theta = 90°$, $\\cos 90° = 0$); `dot(u, v) < 0` means they face opposite half-spaces (angle $> 90°$).',
                '`dot(w, w)` is a special case worth remembering: it computes $w_1^2 + w_2^2$, which equals $\\|\\mathbf{w}\\|^2$. The angle between a vector and itself is $0°$, and $\\cos 0° = 1$, so $\\mathbf{w}\\cdot\\mathbf{w} = \\|\\mathbf{w}\\|^2$ always. This is a fast way to get squared magnitude without calling `norm()`.',
              ],
              code: `u = [1; 0];   % points right (x-axis)
v = [0; 1];   % points up (y-axis)
w = [1; 1];   % points at 45 degrees

disp('u . v (perpendicular -- should be 0):')
dot(u, v)

disp('u . w (partially aligned -- should be positive):')
dot(u, w)

disp('u . (-u) (opposite -- should be negative):')
dot(u, -u)

% Self-dot: v . v = norm(v)^2
disp('w . w = norm(w)^2 = 2:')
dot(w, w)`,
            },
            {
              id: 2,
              cellTitle: 'acos and rad2deg — finding the angle',
              prose: [
                'The angle formula rearranges the geometric dot product identity $\\mathbf{a}\\cdot\\mathbf{b} = \\|\\mathbf{a}\\|\\|\\mathbf{b}\\|\\cos\\theta$ to isolate $\\theta$: first divide both sides by $\\|\\mathbf{a}\\|\\|\\mathbf{b}\\|$ to get $\\cos\\theta$, then apply $\\arccos$.',
                '`sqrt(dot(a, a))` computes $\\|\\mathbf{a}\\|$ by hand: $\\mathbf{a}\\cdot\\mathbf{a} = \\sum a_i^2$, and taking the square root gives the Euclidean length. You could also write `norm(a)` — same result, but writing it out shows the connection to the dot product definition.',
                '`acos()` returns the angle in **radians**. `rad2deg()` converts by multiplying by $180/\\pi$. The orthogonality check at the bottom confirms `dot(p, q) = 0` without needing `acos` at all — when the dot product is exactly zero, you know $\\theta = 90°$ immediately.',
              ],
              code: `a = [4; 3];
b = [1; 0];

d = dot(a, b)
na = sqrt(dot(a, a))
nb = sqrt(dot(b, b))
cos_theta = d / (na * nb)
theta_deg = rad2deg(acos(cos_theta))

% Orthogonality check
p = [6; -3];  q = [1; 2];
disp('p . q (should be 0 -- perpendicular):')
dot(p, q)`,
            },
            {
              id: 3,
              cellTitle: 'cross() — perpendicular vector and area (3D)',
              prose: [
                '`cross(u, v)` applies the component formula $[u_2v_3 - u_3v_2,\\; u_3v_1 - u_1v_3,\\; u_1v_2 - u_2v_1]^\\top$ and returns a new 3D vector. MATLAB requires both inputs to be 3-element vectors — unlike `dot()`, which works in any dimension.',
                '`norm(result)` computes $\\|\\mathbf{u}\\times\\mathbf{v}\\| = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|\\sin\\theta$. For $\\mathbf{u} = [3,0,0]^\\top$ and $\\mathbf{v} = [0,4,0]^\\top$, the angle is exactly $90°$ and $\\sin 90° = 1$, so the magnitude is $3 \\times 4 = 12$ — the area of the $3\\times 4$ rectangle they form.',
                '`dot(result, u)` and `dot(result, v)` should both return 0. These are the built-in self-checks: any correctly computed cross product is perpendicular to both inputs, so both dot products must vanish. If either is non-zero, there is an arithmetic error. `cross(v, u)` flipping the sign demonstrates anti-commutativity: $\\mathbf{v}\\times\\mathbf{u} = -(\\mathbf{u}\\times\\mathbf{v})$.',
              ],
              code: `u = [3; 0; 0];   % along x-axis
v = [0; 4; 0];   % along y-axis

result = cross(u, v)
norm(result)     % = 12 = area of parallelogram

dot(result, u)   % = 0 (perpendicular to u)
dot(result, v)   % = 0 (perpendicular to v)
cross(v, u)      % sign flipped

% Normal to a plane through three points
P1 = [1;0;0];  P2 = [0;1;0];  P3 = [0;0;1];
edge1 = P2 - P1;
edge2 = P3 - P1;
normal = cross(edge1, edge2)`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC 5-axis tool orientation',
              prose: [
                'In 5-axis CNC, the tool axis $\\hat{\\mathbf{t}}$ must be tilted relative to the surface normal $\\hat{\\mathbf{n}}$ by a specific angle depending on the operation. `dot(t, n) / (norm(t) * norm(n))` gives $\\cos\\theta_{\\text{tilt}}$, and `acos(...)` recovers the tilt angle in radians.',
                '`cross(t, n)` computes a vector perpendicular to both the tool axis and the surface normal. This perpendicular direction is the **tilt axis** — the axis around which the spindle must physically rotate to achieve the tilt. Dividing by its norm gives the unit tilt axis direction.',
                'The two `fprintf` lines at the end verify the geometry: `dot(tilt_axis_unit, t)` and `dot(tilt_axis_unit, n)` should both print values near zero, confirming the tilt axis is perpendicular to both. Numerical precision means "near zero" (not exactly zero), hence using `%.6f` format to see whether the value is genuinely small or just rounded.',
              ],
              code: `% Tool axis vector (pointing up the spindle)
t = [0; 0; 1];

% Surface normal at contact point (tilted 15 degrees from vertical)
theta_surface = 15 * pi/180;
n = [sin(theta_surface); 0; cos(theta_surface)];

cos_tilt = dot(t, n) / (norm(t) * norm(n))
tilt_angle_deg = rad2deg(acos(cos_tilt))

% Cross product gives the tilt axis (axis to rotate tool around)
tilt_axis = cross(t, n)
tilt_axis_unit = tilt_axis / norm(tilt_axis)

fprintf('Tilt angle: %.2f deg (should be %.1f)\n', tilt_angle_deg, 15.0);
fprintf('Tilt axis direction: [%.3f, %.3f, %.3f]\n', tilt_axis_unit(1), tilt_axis_unit(2), tilt_axis_unit(3));

% Check: both u and n are perpendicular to the tilt axis
fprintf('Tilt axis perp to t: dot = %.6f\n', dot(tilt_axis_unit, t));
fprintf('Tilt axis perp to n: dot = %.6f\n', dot(tilt_axis_unit, n));`,
            },
          ],
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Dot Product, Angle, Cross Product',
        mathBridge: 'np.dot(a, b) = Σ aᵢbᵢ. Angle: θ = arccos(a·b / (‖a‖‖b‖)). Cross product (3D only): np.cross(a, b).',
        caption: 'Confirm the geometric meaning of both products with live computation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Dot product — measuring alignment',
              prose: [
                '`np.dot(a, b)` computes $a_1b_1 + a_2b_2 + \\cdots + a_nb_n$ — element-wise products summed into a single scalar. NumPy applies this in one vectorized operation with no loop. The result encodes directional agreement: positive means the vectors share a component in the same direction, zero means perfectly perpendicular, negative means they face opposite half-spaces.',
                'The `angle_deg` function implements the full procedure: `np.dot(u, v)` gives the numerator; `np.linalg.norm(u) * np.linalg.norm(v)` gives the denominator; dividing isolates $\\cos\\theta$; `np.degrees(np.arccos(...))` converts to degrees. `np.clip(cos_t, -1, 1)` prevents domain errors — floating-point arithmetic can produce values like $1.0000000002$ that would cause `arccos` to fail without clamping.',
                'The bar chart on the right compares `a.b`, `b.a`, `a.a`, and `b.b` side-by-side. `a.b == b.a` (commutativity), and `a.a` and `b.b` equal the squares of the respective magnitudes — all confirming the dot product identities.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

a = np.array([1.0, 0.0])
b = np.array([0.0, 1.0])
c = np.array([1.0, 1.0])

print(f"a . b = {np.dot(a, b)}  (orthogonal -> 0)")
print(f"a . c = {np.dot(a, c)}  (partially aligned -> positive)")
print(f"a . (-a) = {np.dot(a, -a)}  (opposing -> negative)")

def angle_deg(u, v):
    cos_t = np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))
    return float(np.degrees(np.arccos(np.clip(cos_t, -1, 1))))

p = np.array([3.0, 1.0])
q = np.array([1.0, 3.0])
print(f"angle(p, q) = {angle_deg(p, q):.2f} deg")
print(f"angle(a, b) = {angle_deg(a, b):.1f} deg  (right angle confirmed)")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
origin = np.zeros(2)

ax = axes[0]
ax.set_title("Dot Product: Alignment Measure", fontsize=12)
ax.annotate('', xy=a, xytext=origin, arrowprops=dict(arrowstyle='->', color='steelblue', lw=2.5))
ax.annotate('', xy=b, xytext=origin, arrowprops=dict(arrowstyle='->', color='darkorange', lw=2.5))
c_unit = c / np.linalg.norm(c)
ax.annotate('', xy=c_unit, xytext=origin, arrowprops=dict(arrowstyle='->', color='green', lw=2.5))
ax.text(a[0]+0.05, a[1]+0.05, 'a', fontsize=11, color='steelblue', fontweight='bold')
ax.text(b[0]+0.05, b[1]+0.05, 'b (perp)', fontsize=11, color='darkorange', fontweight='bold')
ax.text(c_unit[0]+0.05, c_unit[1]+0.05, 'c (45°)', fontsize=10, color='green')
ax.set_xlim(-0.3, 1.5); ax.set_ylim(-0.3, 1.5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)

ax2 = axes[1]
ax2.set_title(f"Angle between p and q: {angle_deg(p, q):.1f}°", fontsize=12)
ax2.annotate('', xy=p, xytext=origin, arrowprops=dict(arrowstyle='->', color='steelblue', lw=2.5))
ax2.annotate('', xy=q, xytext=origin, arrowprops=dict(arrowstyle='->', color='darkorange', lw=2.5))
ax2.text(p[0]*0.5+0.1, p[1]*0.5-0.2, f'p={p}', fontsize=10, color='steelblue')
ax2.text(q[0]*0.5-0.8, q[1]*0.5+0.1, f'q={q}', fontsize=10, color='darkorange')
from matplotlib.patches import Arc
theta1 = np.degrees(np.arctan2(p[1], p[0]))
theta2 = np.degrees(np.arctan2(q[1], q[0]))
arc = Arc((0,0), 0.8, 0.8, theta1=min(theta1,theta2), theta2=max(theta1,theta2), color='gray', lw=1.5)
ax2.add_patch(arc)
ax2.set_xlim(-0.5, 4); ax2.set_ylim(-0.5, 4)
ax2.set_aspect('equal'); ax2.grid(True, alpha=0.3)
ax2.axhline(0, color='k', lw=0.5); ax2.axvline(0, color='k', lw=0.5)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Cross product — perpendicular and area (3D)',
              prose: [
                '`np.cross(a, b)` applies the formula $[a_2b_3 - a_3b_2,\\; a_3b_1 - a_1b_3,\\; a_1b_2 - a_2b_1]^\\top$ and returns a 3-element NumPy array. For 3D inputs, NumPy requires shape `(3,)` — a plain 1D array of length 3.',
                '`np.linalg.norm(axb)` gives the length of the cross product, which equals $\\|\\mathbf{a}\\|\\|\\mathbf{b}\\|\\sin\\theta$ — the area of the parallelogram formed by $\\mathbf{a}$ and $\\mathbf{b}$. Here $\\mathbf{a} = [3,0,0]^\\top$ and $\\mathbf{b} = [0,4,0]^\\top$ are perpendicular ($\\sin 90° = 1$), so the area is $3 \\times 4 = 12$, matching the $3\\times 4$ parallelogram drawn on the left plot.',
                '`np.dot(axb, a)` and `np.dot(axb, b)` both print near-zero, verifying perpendicularity. `np.cross(b, a)` returns the negated result — anti-commutativity means order matters: swapping inputs flips the direction of the perpendicular arrow.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

a = np.array([3.0, 0.0, 0.0])
b = np.array([0.0, 4.0, 0.0])

axb = np.cross(a, b)
print(f"a x b = {axb}  (should point in z direction)")
print(f"||a x b|| = {np.linalg.norm(axb)}  (area = 3x4 = 12)")
print(f"(axb).a = {np.dot(axb, a):.1f}  (must be 0 -- perpendicular to a)")
print(f"(axb).b = {np.dot(axb, b):.1f}  (must be 0 -- perpendicular to b)")
print(f"b x a = {np.cross(b, a)}  (sign flipped)")

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
origin = np.zeros(2)

ax = axes[0]
ax.set_title("Parallelogram: area = ||a x b||", fontsize=12)
a2d = a[:2]; b2d = b[:2]
para = plt.Polygon([a2d*0, a2d, a2d+b2d, b2d], alpha=0.25, color='steelblue')
ax.add_patch(para)
ax.annotate('', xy=a2d, xytext=origin, arrowprops=dict(arrowstyle='->', color='steelblue', lw=2.5))
ax.annotate('', xy=b2d, xytext=origin, arrowprops=dict(arrowstyle='->', color='darkorange', lw=2.5))
ax.text(a2d[0]*0.5+0.1, a2d[1]+0.1, f'a={a[:2]}', fontsize=10, color='steelblue')
ax.text(b2d[0]+0.1, b2d[1]*0.5, f'b={b[:2]}', fontsize=10, color='darkorange')
ax.text(1.2, 1.5, f'Area = {np.linalg.norm(axb):.0f}', fontsize=11, color='green', fontweight='bold')
ax.set_xlim(-0.5, 4.5); ax.set_ylim(-0.5, 5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)

ax2 = axes[1]
ax2.set_title("Cross Product Magnitudes", fontsize=12)
labels = ['||a x b||', '||b x a||', 'a.(axb)', 'b.(axb)']
values = [np.linalg.norm(axb), np.linalg.norm(np.cross(b,a)),
          abs(np.dot(a, axb)), abs(np.dot(b, axb))]
colors = ['steelblue', 'darkorange', 'green', 'crimson']
bars = ax2.bar(labels, values, color=colors, alpha=0.7, edgecolor='black')
for bar, val in zip(bars, values):
    ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.2,
             f'{val:.1f}', ha='center', fontsize=10, fontweight='bold')
ax2.set_ylim(0, 16); ax2.set_ylabel("Value"); ax2.grid(True, axis='y', alpha=0.3)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Visualize: projection — the dot product as a shadow',
              prose: [
                '`(np.dot(a, b) / np.dot(a, a)) * a` computes the vector projection of $\\mathbf{b}$ onto $\\mathbf{a}$. Breaking this down: `np.dot(a, b)` is the scalar alignment measure; dividing by `np.dot(a, a)` ($= \\|\\mathbf{a}\\|^2$) converts it to the fractional "shadow length" relative to $\\|\\mathbf{a}\\|$; multiplying by `a` stretches the unit direction of $\\mathbf{a}$ to that shadow length. The result is the part of $\\mathbf{b}$ that lies along $\\mathbf{a}$.',
                '`perp = b - proj` removes the projection, leaving only the part of $\\mathbf{b}$ perpendicular to $\\mathbf{a}$. `np.dot(perp, a)` printed as `%.10f` should be effectively zero — any tiny non-zero value is floating-point rounding, not a real component. Together, `proj + perp` reconstructs $\\mathbf{b}$ exactly: every vector decomposes into one part parallel to $\\mathbf{a}$ and one part perpendicular.',
                'In the Figure visualization, the green "proj" arrow is the shadow; the red "b − proj" arrow is perpendicular to the blue $\\mathbf{a}$. Visually, the red and blue arrows form a right angle — confirming the dot product of zero.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER, GREEN, RED

a = np.array([4.0, 1.0])
b = np.array([2.0, 3.0])

proj = (np.dot(a, b) / np.dot(a, a)) * a
perp = b - proj

print(f"a = {a}")
print(f"b = {b}")
print(f"proj of b onto a = {proj.round(3)}")
print(f"perpendicular component = {perp.round(3)}")
print(f"dot(perp, a) = {np.dot(perp, a):.10f}  (should be 0)")

fig = Figure(square=True, xmin=-1, xmax=5, ymin=-1, ymax=5,
             title="Projection: dot product as shadow")
fig.grid().axes()
fig.vector(a.tolist(), color=BLUE, label="a (target direction)")
fig.vector(b.tolist(), color=AMBER, label="b (vector to project)")
fig.vector(proj.tolist(), color=GREEN, label="proj (shadow of b onto a)")
fig.vector(perp.tolist(), color=RED, label="b - proj (perpendicular)")
fig.show()`,
            },
            {
              id: 4,
              cellTitle: 'Application: 3D surface normal and lighting',
              prose: [
                '`np.cross(edge1, edge2)` finds the face normal from two edge vectors. `edge1 = P2 - P1` and `edge2 = P3 - P1` are both vectors lying in the triangle plane, so their cross product is perpendicular to the plane — that perpendicular direction is the normal. Dividing by `np.linalg.norm(normal)` makes it a unit vector (`unit_normal`), which is required for the dot product to correctly report brightness as a value between 0 and 1.',
                'The lighting model `brightness = max(0.0, np.dot(unit_normal, -light))` computes how directly the face "faces" the light source: `np.dot(unit_normal, -light)` gives $\\cos\\theta$ where $\\theta$ is the angle between the face normal and the incoming light direction. At $\\theta = 0°$ (face directly toward light), $\\cos 0° = 1$ — fully lit. At $\\theta = 90°$ (face edge-on), $\\cos 90° = 0$ — no illumination. `max(0, ...)` clamps negative values (back-facing surfaces) to zero rather than "negative brightness."',
                '`np.linalg.norm(normal)` — before normalizing — gives $\\|\\mathbf{edge_1} \\times \\mathbf{edge_2}\\| = \\|\\mathbf{edge_1}\\|\\|\\mathbf{edge_2}\\|\\sin\\theta$, which equals twice the triangle area. For the triangle with edges $[3,0,0]$ and $[0,4,0]$, the cross product is $[0,0,12]$ with magnitude 12, confirming area $= 12/2 = 6$. This dual use — normal direction AND area measurement — is why the cross product is the fundamental tool for 3D mesh geometry.',
              ],
              code: `import numpy as np

# Triangle vertices
P1 = np.array([0.0, 0.0, 0.0])
P2 = np.array([3.0, 0.0, 0.0])
P3 = np.array([0.0, 4.0, 0.0])

edge1 = P2 - P1
edge2 = P3 - P1

normal = np.cross(edge1, edge2)
unit_normal = normal / np.linalg.norm(normal)

print(f"Edge 1: {edge1}")
print(f"Edge 2: {edge2}")
print(f"Normal (unnormalized): {normal}")
print(f"Unit normal: {unit_normal}")

# Three different light directions
lights = {
    "straight down (-z)": np.array([0.0, 0.0, -1.0]),
    "angled (45 deg)": np.array([0.0, 0.707, -0.707]),
    "parallel to face (+x)": np.array([1.0, 0.0, 0.0]),
}

print()
for name, light in lights.items():
    brightness = max(0.0, float(np.dot(unit_normal, -light)))
    print(f"Light {name}: brightness = {brightness:.3f}")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Orthogonality and projection',
              difficulty: 'medium',
              prompt: 'Given a = [4, 0] and b = [3, 3]: (1) compute the angle between them, (2) compute the vector projection of b onto a — formula: (a·b / a·a) * a, (3) verify that b minus its projection is perpendicular to a.',
              code: `import numpy as np

a = np.array([4.0, 0.0])
b = np.array([3.0, 3.0])

# 1. angle between a and b
# 2. vector projection of b onto a
# 3. perpendicularity check: dot(b - proj, a) should be ~= 0
`,
              hint: 'proj = (np.dot(a,b) / np.dot(a,a)) * a. Then check np.dot(b - proj, a) is close to zero.',
            },
          ],
        },
      },
    ],
  },

  rigor: {
    prose: [
      '**Inner Products: the generalization.** In advanced mathematics, the dot product is one instance of an **inner product**. Formally, an inner product on a vector space $V$ over $\\mathbb{R}$ is a function $\\langle \\cdot, \\cdot \\rangle : V \\times V \\to \\mathbb{R}$ satisfying: (1) **Symmetry**: $\\langle u, v \\rangle = \\langle v, u \\rangle$. (2) **Linearity in the first argument**: $\\langle cu + w, v \\rangle = c\\langle u, v \\rangle + \\langle w, v \\rangle$. (3) **Positive-definiteness**: $\\langle v, v \\rangle > 0$ for all $v \\neq \\mathbf{0}$.',
      '**Orthogonal functions.** For continuous functions on $[a,b]$: $\\langle f, g \\rangle = \\int_a^b f(x)g(x)\\,dx$. When this integral equals zero, $f$ and $g$ are called **orthogonal**. The functions $\\sin(nx)$ and $\\cos(mx)$ are mutually orthogonal under this inner product — this is why Fourier series can decompose any periodic signal into a sum of sines and cosines without interference. "Orthogonality" survives the jump from arrows to functions because the axioms, not the geometry, define it.',
      '**The Cauchy-Schwarz inequality.** For any inner product space: $|\\langle u, v \\rangle| \\leq \\|u\\| \\cdot \\|v\\|$. This is equivalent to $|\\cos\\theta| \\leq 1$ — no projection can be longer than the original vector. Equality holds only when $u$ and $v$ are parallel. In probability theory this becomes the correlation bound: no two random variables can have $|\\text{corr}(X, Y)| > 1$.',
      '**Future link: Gram-Schmidt and QR.** Every inner product space admits an orthonormal basis — a basis where all vectors are mutually orthogonal and each has length 1. The Gram-Schmidt process (LA4-002) systematically converts any basis into an orthonormal one by subtracting projections. This is exactly the dot product computed repeatedly: each new basis vector is the original minus all its "shadows" onto the already-orthogonalized vectors. The QR decomposition is Gram-Schmidt written as a matrix factorization.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cauchy-Schwarz Inequality',
        body: 'For any vectors in an inner product space: $|\\langle u, v \\rangle| \\leq \\|u\\| \\cdot \\|v\\|$.\n\nEquivalently: $|u \\cdot v| \\leq \\|u\\| \\|v\\|$, or $|\\cos\\theta| \\leq 1$.\n\nEquality holds if and only if $u$ and $v$ are linearly dependent (one is a scalar multiple of the other).',
      },
      {
        type: 'insight',
        title: 'Why sin for the Cross Product?',
        body: 'The dot product uses $\\cos\\theta$, measuring alignment. The cross product uses $\\sin\\theta$, measuring divergence. When $\\theta = 90°$, $\\sin = 1$ — perpendicular vectors form the largest parallelogram. When $\\theta = 0°$ or $180°$, $\\sin = 0$ — parallel vectors form a flat parallelogram with zero area. Dot and cross are complementary.',
      },
    ],
    visualizations: [
      {
        id: 'VectorsModuleViz',
        title: 'Vectors — Dot Product, Cross Product & Applications',
        mathBridge: 'A five-tab module: Concept explains vector notation, magnitude, direction, dot and cross products; Canonical steps through a dot product calculation showing each term, the angle formula, and projection; Real World shows cable tension decomposition and CNC toolpath normal vectors; Interactive lets you enter two 3D vectors and instantly computes dot, cross, angle, projections, and parallelogram area; Practice has four hand-calculation problems.',
        caption: 'Dot product measures alignment; cross product measures perpendicularity — both essential for force decomposition and surface normals.',
      },
    ],
  },

  examples: [
    {
      id: 'la1-003-ex1',
      title: 'Calculating a Dot Product',
      problem: 'Compute $\\mathbf{v} \\cdot \\mathbf{w}$ where $\\mathbf{v} = \\begin{bmatrix} 3 \\\\ -2 \\end{bmatrix}$ and $\\mathbf{w} = \\begin{bmatrix} 4 \\\\ 5 \\end{bmatrix}$.',
      steps: [
        {
          expression: '\\mathbf{v} \\cdot \\mathbf{w} = v_1 w_1 + v_2 w_2 = (3)(4) + (-2)(5)',
          annotation: 'Apply the dot product formula where $v_1 = 3$, $v_2 = -2$ are components of $\\mathbf{v}$ and $w_1 = 4$, $w_2 = 5$ are components of $\\mathbf{w}$. Multiply matching components and sum them.',
          strategyTitle: 'Step 1: Multiply matching components',
          hints: ['$v_1 w_1 = (3)(4) = 12$. $v_2 w_2 = (-2)(5) = -10$. A negative component can produce a negative term in the sum.'],
        },
        {
          expression: '= 12 + (-10) = 12 - 10',
          annotation: 'Evaluate each product: $(3)(4) = 12$ and $(-2)(5) = -10$.',
          strategyTitle: 'Step 2: Evaluate products',
          hints: [],
        },
        {
          expression: '\\mathbf{v} \\cdot \\mathbf{w} = 2',
          annotation: 'The result is a single **scalar** number (not a vector). Because the result is positive, the angle between $\\mathbf{v}$ and $\\mathbf{w}$ is acute (less than 90°). They mostly point in the same direction.',
          strategyTitle: 'Step 3: Sum to get the scalar',
          hints: ['The dot product is positive → angle < 90° (acute). Zero would mean perpendicular. Negative would mean angle > 90° (obtuse).'],
        },
      ],
      conclusion: 'The dot product is 2. A positive result confirms the angle is acute — the vectors partially agree in direction.',
    },
    {
      id: 'la1-003-ex2',
      title: 'Checking for Orthogonality',
      problem: 'Determine if $\\mathbf{a} = \\begin{bmatrix} 6 \\\\ -3 \\end{bmatrix}$ and $\\mathbf{b} = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}$ are perpendicular.',
      steps: [
        {
          expression: '\\mathbf{a} \\cdot \\mathbf{b} = a_1 b_1 + a_2 b_2 = (6)(1) + (-3)(2)',
          annotation: 'Apply the dot product formula where $a_1 = 6$, $a_2 = -3$ and $b_1 = 1$, $b_2 = 2$. If the result is zero, the vectors are perpendicular.',
          strategyTitle: 'Step 1: Compute the dot product',
          hints: ['$(6)(1) = 6$. $(-3)(2) = -6$. Sum these.'],
        },
        {
          expression: '\\mathbf{a} \\cdot \\mathbf{b} = 6 - 6 = 0',
          annotation: 'The dot product is exactly zero. Since $\\mathbf{a} \\cdot \\mathbf{b} = \\|\\mathbf{a}\\|\\|\\mathbf{b}\\|\\cos\\theta = 0$ and both magnitudes are non-zero, we must have $\\cos\\theta = 0$, which means $\\theta = 90°$.',
          strategyTitle: 'Step 2: Zero result means perpendicular',
          hints: ['Exact zero means exact perpendicularity. Near-zero means nearly perpendicular but not exactly — in applied work, use a threshold like $|\\mathbf{a}\\cdot\\mathbf{b}| < 10^{-10}$.'],
        },
      ],
      conclusion: 'Because the dot product is exactly 0, the vectors are perpendicular (orthogonal). This test takes seconds and works in any dimension.',
    },
    {
      id: 'la1-003-ex3',
      title: 'Finding the Angle Between Two Vectors',
      problem: 'Find the angle between $\\mathbf{u} = \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}$ and $\\mathbf{v} = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$.',
      steps: [
        {
          expression: '\\mathbf{u} \\cdot \\mathbf{v} = (1)(1) + (1)(0) = 1',
          annotation: 'Compute the dot product where $\\mathbf{u} = [1,1]^T$ (pointing at 45°) and $\\mathbf{v} = [1,0]^T$ (pointing at 0° along the $x$-axis). The positive result confirms the angle is acute — expected since $45° - 0° = 45°$.',
          strategyTitle: 'Step 1: Compute the dot product',
          hints: ['The dot product is positive, which means the angle is acute (< 90°). We expected 45° from the geometry — this is consistent.'],
        },
        {
          expression: '\\|\\mathbf{u}\\| = \\sqrt{1^2 + 1^2} = \\sqrt{2}, \\quad \\|\\mathbf{v}\\| = \\sqrt{1^2 + 0^2} = 1',
          annotation: 'Compute both magnitudes where $\\|\\mathbf{v}\\| = 1$ because $\\mathbf{v} = [1,0]^T$ is already the standard unit vector along the $x$-axis.',
          strategyTitle: 'Step 2: Compute magnitudes',
          hints: ['$\\mathbf{v} = [1,0]^T$ is the standard basis vector $\\hat{\\mathbf{i}}$ — it always has magnitude 1.'],
        },
        {
          expression: '\\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|} = \\frac{1}{\\sqrt{2} \\cdot 1} = \\frac{1}{\\sqrt{2}}',
          annotation: 'Apply the angle formula. The formula $\\cos\\theta = \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|}$ is the dot product formula rearranged to isolate $\\cos\\theta$.',
          strategyTitle: 'Step 3: Apply the angle formula',
          hints: ['The formula works in any dimension — 2D, 3D, or higher.'],
        },
        {
          expression: '\\theta = \\arccos\\!\\left(\\frac{1}{\\sqrt{2}}\\right) = 45°',
          annotation: 'Take arccosine to get the angle. $\\cos(45°) = 1/\\sqrt{2}$ is a standard value to memorize. The result matches our geometric intuition: $[1,1]^T$ sits exactly halfway between the $x$ and $y$ axes.',
          strategyTitle: 'Step 4: Take arccosine',
          hints: ['Common arccosine values: $\\arccos(1) = 0°$, $\\arccos(1/\\sqrt{2}) = 45°$, $\\arccos(0) = 90°$, $\\arccos(-1/\\sqrt{2}) = 135°$, $\\arccos(-1) = 180°$.'],
        },
      ],
      conclusion: 'The angle is 45°. Procedure: (1) compute dot product, (2) compute magnitudes, (3) divide to get $\\cos\\theta$, (4) take arccos. Works in any dimension.',
    },
    {
      id: 'la1-003-ex4',
      title: 'Computing a 3D Cross Product',
      problem: 'Compute $\\mathbf{u} \\times \\mathbf{v}$ for $\\mathbf{u} = \\begin{bmatrix} 2 \\\\ -1 \\\\ 3 \\end{bmatrix}$ and $\\mathbf{v} = \\begin{bmatrix} 1 \\\\ 4 \\\\ -1 \\end{bmatrix}$. Verify the result is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$.',
      steps: [
        {
          expression: '(\\mathbf{u}\\times\\mathbf{v})_1 = u_2 v_3 - u_3 v_2 = (-1)(-1) - (3)(4) = 1 - 12 = -11',
          annotation: 'First component of the cross product uses the second and third entries of each vector where $u_2 = -1$, $u_3 = 3$, $v_2 = 4$, $v_3 = -1$. Pattern: $(u_2v_3 - u_3v_2)$.',
          strategyTitle: 'Step 1: First component ($i$-component)',
          hints: ['The first component uses rows 2 and 3 of both vectors. Always (2nd)(3rd of other) MINUS (3rd)(2nd of other).'],
        },
        {
          expression: '(\\mathbf{u}\\times\\mathbf{v})_2 = u_3 v_1 - u_1 v_3 = (3)(1) - (2)(-1) = 3 + 2 = 5',
          annotation: 'Second component uses rows 3 and 1 where $u_3 = 3$, $u_1 = 2$, $v_1 = 1$, $v_3 = -1$. Pattern: $(u_3v_1 - u_1v_3)$. Note the index order shifts cyclically: 1→2→3→1.',
          strategyTitle: 'Step 2: Second component ($j$-component)',
          hints: ['The second component uses rows 3 and 1. The cyclic pattern: 1st component uses rows 2,3. 2nd uses rows 3,1. 3rd uses rows 1,2.'],
        },
        {
          expression: '(\\mathbf{u}\\times\\mathbf{v})_3 = u_1 v_2 - u_2 v_1 = (2)(4) - (-1)(1) = 8 + 1 = 9',
          annotation: 'Third component uses rows 1 and 2 where $u_1 = 2$, $u_2 = -1$, $v_1 = 1$, $v_2 = 4$.',
          strategyTitle: 'Step 3: Third component ($k$-component)',
          hints: ['Third component uses rows 1 and 2.'],
        },
        {
          expression: '\\mathbf{u} \\times \\mathbf{v} = \\begin{bmatrix} -11 \\\\ 5 \\\\ 9 \\end{bmatrix}',
          annotation: 'Assemble the three components into the result vector.',
          strategyTitle: 'Step 4: Assemble the result',
          hints: [],
        },
        {
          expression: '\\begin{bmatrix}-11\\\\5\\\\9\\end{bmatrix}\\cdot\\begin{bmatrix}2\\\\-1\\\\3\\end{bmatrix} = -22-5+27 = 0\\;\\checkmark \\qquad \\begin{bmatrix}-11\\\\5\\\\9\\end{bmatrix}\\cdot\\begin{bmatrix}1\\\\4\\\\-1\\end{bmatrix} = -11+20-9 = 0\\;\\checkmark',
          annotation: 'Verify perpendicularity by computing dot products with BOTH original vectors. Both must be zero — this is the built-in self-check for any cross product computation.',
          strategyTitle: 'Step 5: Verify perpendicularity (dot product = 0)',
          hints: ['This verification ALWAYS works for any correctly computed cross product. If either dot product is non-zero, you made an arithmetic error.'],
        },
      ],
      conclusion: 'The cross product $[-11, 5, 9]^T$ is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$ (verified by both dot products being zero).',
    },
  ],

  challenges: [
    {
      id: 'la1-003-ch1',
      difficulty: 'easy',
      problem: 'Calculate the dot product of $\\begin{bmatrix} 0 \\\\ -7 \\end{bmatrix}$ and $\\begin{bmatrix} 4 \\\\ 2 \\end{bmatrix}$. Is the angle acute, right, or obtuse?',
      hint: 'Multiply the top numbers together, multiply the bottom numbers together, and sum.',
      walkthrough: [
        { expression: '\\mathbf{v}\\cdot\\mathbf{w} = (0)(4) + (-7)(2) = 0 + (-14)', annotation: 'Apply the dot product formula: multiply matching components and sum the products.' },
        { expression: '= -14', annotation: 'The result is negative, so $\\cos\\theta < 0$, meaning $\\theta > 90°$ — the angle is obtuse.' },
        { expression: '[0,-7]^T\\text{ points down},\\quad [4,2]^T\\text{ points right-up}', annotation: 'Direction check: one points down, the other up-right. They face opposite half-spaces, confirming an obtuse angle.' },
      ],
      answer: 'The dot product is $-14$; the angle is obtuse (greater than 90°) because the result is negative.',
    },
    {
      id: 'la1-003-ch2',
      difficulty: 'medium',
      problem: 'Find the missing component $x$ so that $\\mathbf{v} = \\begin{bmatrix} x \\\\ 4 \\end{bmatrix}$ and $\\mathbf{w} = \\begin{bmatrix} 2 \\\\ -3 \\end{bmatrix}$ are orthogonal.',
      hint: 'Set the dot product equal to 0 (orthogonality condition) and solve for $x$.',
      walkthrough: [
        { expression: '\\mathbf{v}\\cdot\\mathbf{w}=0 \\Rightarrow (x)(2)+(4)(-3)=0', annotation: 'Set the dot product to zero: orthogonality requires the sum of component products to equal zero.' },
        { expression: '2x - 12 = 0 \\Rightarrow x = 6', annotation: 'Solve the resulting linear equation: $2x = 12$, so $x = 6$.' },
        { expression: '[6,4]^T\\cdot[2,-3]^T = 12-12 = 0\\checkmark', annotation: 'Verify: substitute $x=6$ and confirm the dot product is exactly zero.' },
      ],
      answer: '$x = 6$ — the vector $[6, 4]^T$ is orthogonal to $[2, -3]^T$, confirmed by dot product equal to zero.',
    },
    {
      id: 'la1-003-ch3',
      difficulty: 'hard',
      problem: 'Compute $\\mathbf{u} \\times \\mathbf{v}$ for $\\mathbf{u} = [2,-1,3]^T$ and $\\mathbf{v} = [1,4,-1]^T$. Then verify that $\\mathbf{u} \\times \\mathbf{v}$ is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$.',
      hint: 'Use the cross product formula: component $i$ = $(u_2v_3 - u_3v_2)$, component $j$ = $(u_3v_1 - u_1v_3)$, component $k$ = $(u_1v_2 - u_2v_1)$. The indices cycle.',
      walkthrough: [
        { expression: '(\\mathbf{u}\\times\\mathbf{v})_1 = (-1)(-1)-(3)(4) = 1-12 = -11', annotation: 'First component uses rows 2 and 3. Pattern: (row2 of u)(row3 of v) minus (row3 of u)(row2 of v).' },
        { expression: '(\\mathbf{u}\\times\\mathbf{v})_2 = (3)(1)-(2)(-1) = 3+2 = 5', annotation: 'Second component uses rows 3 and 1 (cyclic shift). Indices cycle: 1→2→3→1.' },
        { expression: '(\\mathbf{u}\\times\\mathbf{v})_3 = (2)(4)-(-1)(1) = 8+1 = 9', annotation: 'Third component uses rows 1 and 2.' },
        { expression: '[-11,5,9]\\cdot[2,-1,3]=-22-5+27=0\\checkmark,\\quad[-11,5,9]\\cdot[1,4,-1]=-11+20-9=0\\checkmark', annotation: 'Verify perpendicularity: dot the result with BOTH original vectors. Both must equal zero — this is the universal self-check for any cross product.' },
      ],
      answer: '$[-11, 5, 9]^T$ is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$, verified by both dot products equaling zero.',
    },
  ],

  semantics: {
    core: [
      { symbol: '\\mathbf{v} \\cdot \\mathbf{w}', meaning: 'Dot product: sum of component products. Positive = vectors share a direction, zero = perpendicular, negative = opposing directions.' },
      { symbol: '\\mathbf{v} \\times \\mathbf{w}', meaning: 'Cross product (3D only): a new vector perpendicular to both inputs, with magnitude equal to the parallelogram area.' },
      { symbol: '\\mathbf{v} \\cdot \\mathbf{w} = 0', meaning: 'Orthogonality condition: the two vectors are perfectly perpendicular, sharing no directional component.' },
      { symbol: '\\|\\mathbf{v}\\|^2 = \\mathbf{v}\\cdot\\mathbf{v}', meaning: 'Squared magnitude: dot a vector with itself to get length-squared without computing a square root.' },
      { symbol: '\\cos\\theta = \\mathbf{u}\\cdot\\mathbf{v}/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|)', meaning: 'Angle formula: rearrange the geometric dot product definition to isolate the angle between two vectors in any dimension.' },
    ],
    rulesOfThumb: [
      'Dot product: fastest way to check for 90° angles in any dimension — one computation, no arccos needed.',
      'Cross product: use when you need a vector pointing out of a 3D plane (normals, torque, area).',
      '$\\mathbf{v}\\cdot\\mathbf{v} = \\|\\mathbf{v}\\|^2$ — a faster path to squared magnitude than the distance formula.',
      'For the cross product, always verify by dotting the result with both originals — both must be zero.',
      'Dot and cross are complementary: dot uses $\\cos\\theta$ (measures alignment), cross uses $\\sin\\theta$ (measures divergence).',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'algebra-trig', label: 'Trigonometry: Cosine and Sine', note: 'cos(0)=1 (full alignment), cos(90°)=0 (orthogonal), cos(180°)=−1 (opposite). This maps exactly to dot product sign behavior.' },
    ],
    futureLinks: [
      { lessonId: 'la2-002', label: 'Matrix Multiplication', note: 'Multiplying two matrices is computing many dot products simultaneously — one for every (row, column) pair.' },
      { lessonId: 'la1-005', label: 'Lines and Planes', note: 'The normal vector to a plane is the cross product of two edge vectors; the dot product with the normal tests whether a point lies on the plane.' },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'la1-003-assess-1',
        type: 'choice',
        text: 'Are the vectors $[5, 2]^T$ and $[-2, 5]^T$ orthogonal?',
        options: ['Yes — their dot product is zero', 'No — their dot product is non-zero', 'Cannot be determined without knowing their magnitudes', 'Yes — they have the same magnitude'],
        answer: 'Yes — their dot product is zero',
        hints: ['$(5)(-2) + (2)(5) = -10 + 10 = 0$. A dot product of exactly zero means perpendicular (orthogonal).'],
      },
      {
        id: 'la1-003-assess-2',
        type: 'choice',
        text: 'Compute $\\mathbf{u} \\cdot \\mathbf{v}$ for $\\mathbf{u} = [4, -1]^T$ and $\\mathbf{v} = [2, 3]^T$.',
        options: ['$5$', '$-5$', '$14$', '$[8, -3]^T$'],
        answer: '$5$',
        hints: ['$(4)(2) + (-1)(3) = 8 - 3 = 5$. The result is a scalar, not a vector.'],
      },
      {
        id: 'la1-003-assess-3',
        type: 'choice',
        text: 'The dot product $\\mathbf{u} \\cdot \\mathbf{v} = -8$ with $\\|\\mathbf{u}\\| = 2$ and $\\|\\mathbf{v}\\| = 5$. What is $\\cos\\theta$?',
        options: ['$-0.8$', '$0.8$', '$-3$', '$-40$'],
        answer: '$-0.8$',
        hints: ['$\\cos\\theta = (\\mathbf{u}\\cdot\\mathbf{v})/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|) = -8/(2 \\times 5) = -8/10 = -0.8$.'],
      },
      {
        id: 'la1-003-assess-4',
        type: 'choice',
        text: 'The cross product is only defined in $\\mathbb{R}^3$. What property does $\\mathbf{u} \\times \\mathbf{v}$ always satisfy?',
        options: [
          'It is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$',
          'It is parallel to both $\\mathbf{u}$ and $\\mathbf{v}$',
          'It has the same length as $\\mathbf{u}$',
          'It equals $\\mathbf{v} \\times \\mathbf{u}$',
        ],
        answer: 'It is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$',
        hints: ['By construction, $(\\mathbf{u}\\times\\mathbf{v})\\cdot\\mathbf{u} = 0$ and $(\\mathbf{u}\\times\\mathbf{v})\\cdot\\mathbf{v} = 0$ — perpendicular to both. The cross product is NOT commutative: $\\mathbf{v}\\times\\mathbf{u} = -(\\mathbf{u}\\times\\mathbf{v})$.'],
      },
    ],
  },

  mentalModel: [
    'Dot Product = Alignment = Shadow length. Returns a scalar.',
    'Cross Product = Perpendicular area vector. Returns a 3D vector.',
    'Orthogonal means dot product is ZERO.',
    'Angle formula: $\\theta = \\arccos(\\mathbf{u}\\cdot\\mathbf{v} / (\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|))$.',
    'Cross product perpendicularity check: dot the result with both originals — both must be zero.',
  ],

  checkpoints: [
    { id: 'cp-la1-003-1', label: 'Read: Define dot product and its geometric meaning', type: 'read' },
    { id: 'cp-la1-003-2', label: 'Read: State the orthogonality condition', type: 'read' },
    { id: 'cp-la1-003-3', label: 'Read: State the cross product formula and right-hand rule', type: 'read' },
    { id: 'cp-la1-003-4', label: 'Run: OpenMAT cells — compute dot product, angle, and cross product', type: 'lab' },
    { id: 'cp-la1-003-5', label: 'Run: Python cells — dot product alignment and projection visualization', type: 'lab' },
    { id: 'cp-la1-003-6', label: 'Complete: Example 1 — compute a dot product', type: 'example' },
    { id: 'cp-la1-003-7', label: 'Complete: Example 3 — find the angle between two vectors', type: 'example' },
    { id: 'cp-la1-003-8', label: 'Attempt: Challenge 3 — compute and verify a 3D cross product', type: 'challenge' },
  ],

  quiz: [
    {
      id: 'la1-003-quiz-1',
      type: 'choice',
      text: 'What does the Dot Product mathematically tell you?',
      options: [
        'The exact area of the parallelogram between two vectors',
        'A vector perpendicular to both inputs',
        'A scalar number representing how much the two vectors align directionally',
        'The distance between the tips of the two vectors',
      ],
      answer: 'A scalar number representing how much the two vectors align directionally',
      hints: ['The dot product is tied to $\\cos\\theta$ — the angle between the vectors. It squashes two vectors into one number measuring their directional agreement.'],
      reviewSection: 'Intuition tab — Shadow of the Dot Product',
    },
    {
      id: 'la1-003-quiz-2',
      type: 'choice',
      text: 'If you compute the cross product of two vectors lying flat on your desk (in the XY plane), where will the resulting vector point?',
      options: [
        'Also flat on the desk, cutting the angle in half',
        'Straight up towards the ceiling (or straight down into the floor)',
        'It will become a scalar (number 0)',
        'Along the x-axis',
      ],
      answer: 'Straight up towards the ceiling (or straight down into the floor)',
      hints: ['The cross product creates a vector perpendicular to BOTH inputs. If both inputs are in the XY plane, the result must point in the Z direction — straight up or down.'],
      reviewSection: 'Intuition tab — Cross Product',
    },
    {
      id: 'la1-003-quiz-3',
      type: 'choice',
      text: 'The dot product of a vector $\\mathbf{v}$ with itself, $\\mathbf{v} \\cdot \\mathbf{v}$, equals what?',
      options: [
        'The unit vector in the direction of $\\mathbf{v}$',
        'The square of the magnitude: $\\|\\mathbf{v}\\|^2$',
        'Zero',
        'The cross product of $\\mathbf{v}$ with itself',
      ],
      answer: 'The square of the magnitude: $\\|\\mathbf{v}\\|^2$',
      hints: ['$\\mathbf{v}\\cdot\\mathbf{v} = v_1^2 + v_2^2 + \\cdots = \\|\\mathbf{v}\\|^2$. The angle between a vector and itself is 0°, and $\\cos(0°) = 1$, so $\\mathbf{v}\\cdot\\mathbf{v} = \\|\\mathbf{v}\\|^2$.'],
      reviewSection: 'Math tab — Dot Product',
    },
    {
      id: 'la1-003-quiz-4',
      type: 'choice',
      text: 'If $\\mathbf{u} \\cdot \\mathbf{v} > 0$, then the angle $\\theta$ between them satisfies:',
      options: [
        '$\\theta = 90°$',
        '$90° < \\theta \\leq 180°$ (obtuse)',
        '$0° \\leq \\theta < 90°$ (acute)',
        '$\\theta = 0°$ exactly',
      ],
      answer: '$0° \\leq \\theta < 90°$ (acute)',
      hints: ['$\\mathbf{u}\\cdot\\mathbf{v} = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|\\cos\\theta > 0$. Since magnitudes are always positive, $\\cos\\theta > 0 \\Leftrightarrow \\theta < 90°$.'],
      reviewSection: 'Intuition tab — Compass analogy',
    },
    {
      id: 'la1-003-quiz-5',
      type: 'choice',
      text: 'Why is the cross product only defined in $\\mathbb{R}^3$?',
      options: [
        'Because 2D computers cannot draw it',
        'Because there is no perpendicular direction available inside a 2D plane; you need a third axis for the result to point along',
        'Because the sine formula only works with three components',
        'Because 2D vectors cannot be perpendicular to each other',
      ],
      answer: 'Because there is no perpendicular direction available inside a 2D plane; you need a third axis for the result to point along',
      hints: ['The cross product produces a vector perpendicular to BOTH inputs. If the inputs are in the XY-plane, the result must point in the Z direction. In 2D, there is no Z direction.'],
      reviewSection: 'Intuition tab — Cross Product',
    },
    {
      id: 'la1-003-quiz-6',
      type: 'choice',
      text: 'Two vectors $\\mathbf{u} = [3, 0, 0]^T$ and $\\mathbf{v} = [0, 5, 0]^T$. What is $\\|\\mathbf{u} \\times \\mathbf{v}\\|$?',
      options: ['0', '8', '15', '$\\sqrt{34}$'],
      answer: '15',
      hints: ['$\\|\\mathbf{u}\\| = 3$, $\\|\\mathbf{v}\\| = 5$, angle between them = 90° (perpendicular). $\\|\\mathbf{u}\\times\\mathbf{v}\\| = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|\\sin(90°) = 3 \\times 5 \\times 1 = 15$. This is the area of the $3\\times 5$ rectangle they form.'],
      reviewSection: 'Math tab — Cross Product magnitude',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'A larger dot product always means the vectors are more aligned.',
      whyStudentsThinkIt: 'Students conflate the raw magnitude of the dot product with the angle, forgetting that longer vectors produce larger dot products even if their angle is the same.',
      correctionExample: '$[100, 0]^T \\cdot [100, 0]^T = 10000$, but $[1, 0]^T \\cdot [1, 0]^T = 1$ — both pairs have angle 0°. The dot product value depends on both angle AND magnitudes.',
      contrastCase: 'To measure angle alone, divide by magnitudes: $\\cos\\theta = (\\mathbf{u}\\cdot\\mathbf{v})/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|)$. This normalizes out the size effect.',
    },
    {
      falseBelief: 'The cross product is commutative: $\\mathbf{u}\\times\\mathbf{v} = \\mathbf{v}\\times\\mathbf{u}$.',
      whyStudentsThinkIt: 'Students treat the cross product like multiplication of numbers, where $ab = ba$.',
      correctionExample: '$[1,0,0]^T\\times[0,1,0]^T = [0,0,1]^T$ (pointing up), but $[0,1,0]^T\\times[1,0,0]^T = [0,0,-1]^T$ (pointing down) — the sign flips.',
      contrastCase: 'The cross product is anti-commutative: $\\mathbf{u}\\times\\mathbf{v} = -(\\mathbf{v}\\times\\mathbf{u})$. Use the right-hand rule to determine which direction your specific pair gives.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A CNC machinist is checking whether a cutting tool force vector $\\mathbf{F} = [8, 6, 0]^T$ is doing useful work in the feed direction $\\mathbf{d} = [1, 0, 0]^T$. What fraction of the force is effective?',
      competingTechniques: 'Measuring angles with a protractor vs. dot product projection',
      whyThisTechniqueWins: 'The effective component is the dot product projection: $(\\mathbf{F}\\cdot\\hat{\\mathbf{d}}) = 8$. Total force magnitude is 10. So only 80% is effective. This generalizes to any direction in any dimension instantly.',
    },
    {
      situation: 'A 3D graphics shader needs to decide how brightly to illuminate a triangle face. The light direction is $\\mathbf{L}$ and the face normal is $\\mathbf{n}$. How should it compute brightness?',
      competingTechniques: 'Angle-based lookup table vs. dot product of normal and light direction',
      whyThisTechniqueWins: 'Brightness = $\\max(0, \\hat{\\mathbf{n}}\\cdot\\hat{\\mathbf{L}})$. When normal and light fully align (angle 0°), brightness = 1. When perpendicular, brightness = 0. This runs in one GPU operation per pixel.',
    },
  ],

  debugging: [
    {
      commonError: 'Forgetting to divide by magnitudes when computing the angle.',
      symptom: 'Student uses $\\arccos(\\mathbf{u}\\cdot\\mathbf{v})$ directly and gets a domain error or wrong angle.',
      whyItHappened: 'The formula $\\cos\\theta = \\mathbf{u}\\cdot\\mathbf{v}/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|)$ requires dividing, but students remember only the numerator.',
      repairStrategy: 'Write the formula explicitly before computing: $\\cos\\theta = (\\mathbf{u}\\cdot\\mathbf{v})/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|)$. Compute numerator and denominator separately, then divide.',
    },
    {
      commonError: 'Getting the wrong sign on the second component of a cross product.',
      symptom: 'The perpendicularity check fails for one of the two original vectors.',
      whyItHappened: 'The second component formula is $u_3v_1 - u_1v_3$, which has a sign reversal compared to the other two components — easy to miss under time pressure.',
      repairStrategy: 'Use the mnemonic: first component positive, second component negative sign (or swap the formula order), third positive. Always run the perpendicularity check — dot with both originals, both must be zero.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute dot products, check orthogonality, find angles between vectors, and compute 3D cross products with perpendicularity verification.',
    explainVerbally: 'Describe why the dot product can be negative, why it equals zero for perpendicular vectors, and why the cross product is anti-commutative.',
    detectIncorrectApplication: 'Recognize when someone applies the cross product in 2D (invalid), or computes an angle without dividing by magnitudes.',
    transferToUnfamiliar: 'Compute the vector projection of $\\mathbf{b}$ onto $\\mathbf{a}$ using $\\text{proj}_{\\mathbf{a}}(\\mathbf{b}) = (\\mathbf{b}\\cdot\\mathbf{a}/\\mathbf{a}\\cdot\\mathbf{a})\\mathbf{a}$ and verify the remainder $\\mathbf{b}-\\text{proj}$ is perpendicular to $\\mathbf{a}$.',
  },
};
