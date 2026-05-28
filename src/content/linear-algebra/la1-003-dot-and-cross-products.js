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
      'Take $\\mathbf{u} = [3, 0]^T$ and $\\mathbf{v} = [0, 4]^T$. Multiply matching components and sum: $(3)(0) + (0)(4) = 0$. Zero means exactly perpendicular. Now try $\\mathbf{u} = [3, 0]^T$ and $\\mathbf{w} = [1, 0]^T$ (both pointing right): $(3)(1) + (0)(0) = 3$ â€” positive, because they fully agree in direction. This component-multiply-and-sum operation is the **dot product**, and its sign is the universal test for directional agreement between any two vectors in any dimension.',
      'Think of the **Dot Product** as the ultimate measure of agreement. If two vectors point in exactly the same direction, their dot product is large. If they point in opposite directions, it is large and negative. If they are perfectly perpendicular â€” they have absolutely nothing in common â€” their dot product is exactly zero. The dot product crushes two vectors down into a single scalar.',
      '**Predict before reading on:** Take $\\mathbf{p} = [1, 1]^T$ (pointing at 45Â°) and $\\mathbf{q} = [-1, 1]^T$ (pointing at 135Â°). Predict the sign of $\\mathbf{p}\\cdot\\mathbf{q}$: positive, zero, or negative? Compute it and check whether the result matches your geometric intuition.',
      'Geometrically, the dot product is shining a flashlight down onto one vector and seeing how long its shadow is on the other vector. This "shadow" is called a *projection*. Multiplying the shadow length by the length of the vector it lies on gives the dot product.',
      'The **Cross Product** is the opposite: it measures disagreement. Defined only in 3D, when you cross two 3D arrows, the result is a brand new 3D vector with two magical properties: (1) Its length equals the area of the parallelogram formed by the original two vectors, and (2) it points completely perpendicular to BOTH original vectors.',
      '**Real-world application â€” CNC toolpath geometry.** In 5-axis CNC machining, the dot product tells the controller whether the cutting tool is properly oriented. The tool axis vector $\\hat{\\mathbf{t}}$ and the surface normal $\\hat{\\mathbf{n}}$ satisfy $\\hat{\\mathbf{t}} \\cdot \\hat{\\mathbf{n}} = \\cos\\theta$ where $\\theta$ is the tilt angle. Most surface operations want $\\theta \\approx 0Â°$ (tool perpendicular to surface â€” $\\hat{\\mathbf{t}} \\cdot \\hat{\\mathbf{n}} \\approx 1$). Flank milling of ruled surfaces instead requires the tool to be nearly parallel to the surface ($\\theta \\approx 90Â°$, dot product $\\approx 0$). The cross product $\\hat{\\mathbf{t}} \\times \\hat{\\mathbf{n}}$ gives the lead direction â€” the axis around which the tilted tool rotates â€” and its magnitude gives $\\sin\\theta$, the amount of tilt.',
      '**Where this is heading:** The dot product is the foundation of matrix multiplication. When you multiply a row of a matrix by a column vector, you are doing a dot product. Orthogonality (dot product = 0) will eventually lead to the Singular Value Decomposition (SVD).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 6 â€” Vectors & Spaces',
        body: '**Previous:** Linear Combinations â€” span, basis, linear independence.\n**This lesson:** Dot and Cross Products â€” angles between vectors, projections, and 3D area.\n**Next:** Systems of Linear Equations â€” translating geometry into solvable algebra.',
      },
      {
        type: 'insight',
        title: 'Dot vs Cross Output',
        body: 'A Dot Product returns a NUMBER (scalar). A Cross Product returns an ARROW (vector). Never mix them up.',
      },
      {
        type: 'insight',
        title: 'WHY Does the Dot Product Equal $|a||b|\\cos\\theta$?',
        body: 'Project $\\mathbf{v}$ onto $\\mathbf{w}$. The projection (shadow) has length $\\|\\mathbf{v}\\|\\cos\\theta$. The dot product is: (length of shadow) Ã— (length of $\\mathbf{w}$) = $\\|\\mathbf{v}\\|\\cos\\theta \\cdot \\|\\mathbf{w}\\|$. The component formula $v_1w_1 + v_2w_2$ gives the same number â€” two different ways to compute the same thing.',
      },
      {
        type: 'insight',
        title: 'The Compass Needle Analogy for Dot Product Sign',
        body: 'Imagine $\\mathbf{w}$ is a compass needle pointing North. The dot product $\\mathbf{v} \\cdot \\mathbf{w}$ tells you: **positive** if $\\mathbf{v}$ has any Northward component (angle < 90Â°), **zero** if $\\mathbf{v}$ points perfectly East or West (angle = 90Â°), **negative** if $\\mathbf{v}$ has any Southward component (angle > 90Â°).',
      },
      {
        type: 'procedure',
        title: 'Procedure: Computing the Angle Between Two Vectors',
        body: 'Step 1. Compute the dot product: $\\mathbf{u}\\cdot\\mathbf{v} = u_1v_1 + u_2v_2 + \\cdots$\nStep 2. Compute magnitudes: $\\|\\mathbf{u}\\| = \\sqrt{\\mathbf{u}\\cdot\\mathbf{u}}$, $\\|\\mathbf{v}\\| = \\sqrt{\\mathbf{v}\\cdot\\mathbf{v}}$\nStep 3. Divide: $\\cos\\theta = (\\mathbf{u}\\cdot\\mathbf{v})/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|)$\nStep 4. $\\theta = \\arccos(\\cos\\theta)$\n\nOrthogonality shortcut: skip steps 2â€“4. If $\\mathbf{u}\\cdot\\mathbf{v} = 0$, the vectors are perpendicular.',
      },
      {
        type: 'warning',
        title: 'Common Mistake: Applying Cross Product in 2D',
        body: 'The cross product $\\mathbf{u} \\times \\mathbf{v}$ is ONLY defined in $\\mathbb{R}^3$. In 2D, there is no third axis for the result to point along â€” the result would need to point "out of the page," which does not exist in a 2D space. If you are working in 2D and need the area of a parallelogram, use $|u_1v_2 - u_2v_1|$ (the magnitude of the 2D determinant).',
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
      'The **Dot Product** (or inner product) is easy to calculate algebraically â€” multiply matching components and sum:\n\n$\\mathbf{v} \\cdot \\mathbf{w} = v_1 w_1 + v_2 w_2 + \\dots + v_n w_n$',
      'This simple arithmetic is tied to the angle $\\theta$ between the vectors by:\n\n$\\mathbf{v} \\cdot \\mathbf{w} = \\|\\mathbf{v}\\| \\|\\mathbf{w}\\| \\cos(\\theta)$\n\nBecause $\\cos(90Â°) = 0$, the dot product of any two perpendicular (orthogonal) vectors is always 0.',
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
        body: '$\\mathbf{v} \\times \\mathbf{w} = \\begin{bmatrix} v_2 w_3 - v_3 w_2 \\\\ v_3 w_1 - v_1 w_3 \\\\ v_1 w_2 - v_2 w_1 \\end{bmatrix}$\n\nMemory trick: the indices cycle â€” component $i$ uses indices $j$ and $k$ (the other two).',
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
        mathBridge: 'MATLAB\'s `dot(u,v)` computes the component-wise sum of products. For angle recovery: `acos(dot(u,v)/(norm(u)*norm(v)))` gives Î¸ in radians. `cross(u,v)` only works for 3-element vectors.',
        caption: 'OpenMAT mirrors real MATLAB. Learn the functions here.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'dot() â€” the alignment test',
              prose: [
                '`dot(u, v)` multiplies corresponding components and sums them: uâ‚vâ‚ + uâ‚‚vâ‚‚ + â€¦ It returns a single scalar.',
                'The sign tells you the relationship: positive = same half-space (angle < 90Â°), zero = perpendicular, negative = opposite half-space (angle > 90Â°).',
              ],
              code: `u = [1; 0];   % points right (x-axis)
v = [0; 1];   % points up (y-axis)
w = [1; 1];   % points at 45 degrees

disp('u Â· v (perpendicular â€” should be 0):')
dot(u, v)

disp('u Â· w (partially aligned â€” should be positive):')
dot(u, w)

disp('u Â· (-u) (opposite â€” should be negative):')
dot(u, -u)

% Self-dot: v Â· v = â€–vâ€–Â²
disp('w Â· w = â€–wâ€–Â² = 2:')
dot(w, w)`,
            },
            {
              id: 2,
              cellTitle: 'acos and rad2deg â€” finding the angle',
              prose: [
                'Rearranging: cos(Î¸) = dot(u,v) / (norm(u)*norm(v)). Then Î¸ = acos(â€¦).',
                '`acos()` returns radians; `rad2deg()` converts to degrees.',
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
disp('p Â· q (should be 0 â€” perpendicular):')
dot(p, q)`,
            },
            {
              id: 3,
              cellTitle: 'cross() â€” perpendicular vector and area (3D)',
              prose: [
                '`cross(u, v)` returns a new 3D vector perpendicular to both. Its magnitude = area of the parallelogram.',
                'Anti-commutativity: `cross(v, u)` = `-cross(u, v)`. Order matters!',
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
          ],
        },
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Dot Product, Angle, Cross Product',
        mathBridge: 'np.dot(a, b) = Î£ aáµ¢báµ¢. Angle: Î¸ = arccos(aÂ·b / (â€–aâ€–â€–bâ€–)). Cross product (3D only): np.cross(a, b).',
        caption: 'Confirm the geometric meaning of both products with live computation.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Dot product â€” measuring alignment',
              prose: [
                '`np.dot(a, b)` computes the dot product: positive when vectors align, zero when perpendicular, negative when opposing.',
              ],
              code: `import numpy as np

a = np.array([1.0, 0.0])
b = np.array([0.0, 1.0])
c = np.array([1.0, 1.0])

print(f"a Â· b = {np.dot(a, b)}  (orthogonal â†’ 0)")
print(f"a Â· c = {np.dot(a, c)}  (partially aligned â†’ positive)")
print(f"a Â· (-a) = {np.dot(a, -a)}  (opposing â†’ negative)")

def angle_deg(u, v):
    cos_t = np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))
    return float(np.degrees(np.arccos(np.clip(cos_t, -1, 1))))

p = np.array([3.0, 1.0])
q = np.array([1.0, 3.0])
print(f"angle(p, q) = {angle_deg(p, q):.2f}Â°")
print(f"angle(a, b) = {angle_deg(a, b):.1f}Â°  (right angle confirmed)")`,
            },
            {
              id: 2,
              cellTitle: 'Cross product â€” perpendicular and area (3D)',
              prose: [
                '`np.cross(a, b)` produces a vector perpendicular to both a and b. Its magnitude = area of the parallelogram.',
              ],
              code: `import numpy as np

a = np.array([3.0, 0.0, 0.0])
b = np.array([0.0, 4.0, 0.0])

axb = np.cross(a, b)
print(f"a Ã— b = {axb}  (should point in z direction)")
print(f"â€–a Ã— bâ€– = {np.linalg.norm(axb)}  (area = 3Ã—4 = 12)")
print(f"(aÃ—b)Â·a = {np.dot(axb, a):.1f}  (should be 0)")
print(f"(aÃ—b)Â·b = {np.dot(axb, b):.1f}  (should be 0)")
print(f"b Ã— a = {np.cross(b, a)}  (sign flipped)")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Orthogonality and projection',
              difficulty: 'medium',
              prompt: 'Given a = [4, 0] and b = [3, 3]: (1) compute the angle between them, (2) compute the vector projection of b onto a â€” formula: (aÂ·b / aÂ·a) * a, (3) verify that b minus its projection is perpendicular to a.',
              code: `import numpy as np

a = np.array([4.0, 0.0])
b = np.array([3.0, 3.0])

# 1. angle between a and b
# 2. vector projection of b onto a
# 3. perpendicularity check: dot(b - proj, a) â‰ˆ 0
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
      '**Orthogonal functions.** For continuous functions on $[a,b]$: $\\langle f, g \\rangle = \\int_a^b f(x)g(x)\\,dx$. When this integral equals zero, $f$ and $g$ are called **orthogonal**. The functions $\\sin(nx)$ and $\\cos(mx)$ are mutually orthogonal under this inner product â€” this is why Fourier series can decompose any periodic signal into a sum of sines and cosines without interference.',
      '**The Cauchy-Schwarz inequality.** For any inner product space: $|\\langle u, v \\rangle| \\leq \\|u\\| \\cdot \\|v\\|$. This is equivalent to $|\\cos\\theta| \\leq 1$ â€” no projection can be longer than the original vector. Equality holds only when $u$ and $v$ are parallel.',
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
        body: 'The dot product uses $\\cos\\theta$, measuring alignment. The cross product uses $\\sin\\theta$, measuring divergence. When $\\theta = 90Â°$, $\\sin = 1$ â€” perpendicular vectors form the largest parallelogram. When $\\theta = 0Â°$ or $180Â°$, $\\sin = 0$ â€” parallel vectors form a flat parallelogram with zero area. Dot and cross are complementary.',
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
          annotation: 'The result is a single **scalar** number (not a vector). Because the result is positive, the angle between $\\mathbf{v}$ and $\\mathbf{w}$ is acute (less than 90Â°). They mostly point in the same direction.',
          strategyTitle: 'Step 3: Sum to get the scalar',
          hints: ['The dot product is positive â†’ angle < 90Â° (acute). Zero would mean perpendicular. Negative would mean angle > 90Â° (obtuse).'],
        },
      ],
      conclusion: 'The dot product is 2. A positive result confirms the angle is acute â€” the vectors partially agree in direction.',
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
          annotation: 'The dot product is exactly zero. Since $\\mathbf{a} \\cdot \\mathbf{b} = \\|\\mathbf{a}\\|\\|\\mathbf{b}\\|\\cos\\theta = 0$ and both magnitudes are non-zero, we must have $\\cos\\theta = 0$, which means $\\theta = 90Â°$.',
          strategyTitle: 'Step 2: Zero result means perpendicular',
          hints: ['Exact zero means exact perpendicularity. Near-zero means nearly perpendicular but not exactly â€” in applied work, use a threshold like $|\\mathbf{a}\\cdot\\mathbf{b}| < 10^{-10}$.'],
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
          annotation: 'Compute the dot product where $\\mathbf{u} = [1,1]^T$ (pointing at 45Â°) and $\\mathbf{v} = [1,0]^T$ (pointing at 0Â° along the $x$-axis). The positive result confirms the angle is acute â€” expected since $45Â° - 0Â° = 45Â°$.',
          strategyTitle: 'Step 1: Compute the dot product',
          hints: ['The dot product is positive, which means the angle is acute (< 90Â°). We expected 45Â° from the geometry â€” this is consistent.'],
        },
        {
          expression: '\\|\\mathbf{u}\\| = \\sqrt{1^2 + 1^2} = \\sqrt{2}, \\quad \\|\\mathbf{v}\\| = \\sqrt{1^2 + 0^2} = 1',
          annotation: 'Compute both magnitudes where $\\|\\mathbf{v}\\| = 1$ because $\\mathbf{v} = [1,0]^T$ is already the standard unit vector along the $x$-axis.',
          strategyTitle: 'Step 2: Compute magnitudes',
          hints: ['$\\mathbf{v} = [1,0]^T$ is the standard basis vector $\\hat{\\mathbf{i}}$ â€” it always has magnitude 1.'],
        },
        {
          expression: '\\cos(\\theta) = \\frac{\\mathbf{u} \\cdot \\mathbf{v}}{\\|\\mathbf{u}\\|\\,\\|\\mathbf{v}\\|} = \\frac{1}{\\sqrt{2} \\cdot 1} = \\frac{1}{\\sqrt{2}}',
          annotation: 'Apply the angle formula. The formula $\\cos\\theta = \\frac{\\mathbf{u}\\cdot\\mathbf{v}}{\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|}$ is the dot product formula rearranged to isolate $\\cos\\theta$.',
          strategyTitle: 'Step 3: Apply the angle formula',
          hints: ['The formula works in any dimension â€” 2D, 3D, or higher.'],
        },
        {
          expression: '\\theta = \\arccos\\!\\left(\\frac{1}{\\sqrt{2}}\\right) = 45Â°',
          annotation: 'Take arccosine to get the angle. $\\cos(45Â°) = 1/\\sqrt{2}$ is a standard value to memorize. The result matches our geometric intuition: $[1,1]^T$ sits exactly halfway between the $x$ and $y$ axes.',
          strategyTitle: 'Step 4: Take arccosine',
          hints: ['Common arccosine values: $\\arccos(1) = 0Â°$, $\\arccos(1/\\sqrt{2}) = 45Â°$, $\\arccos(0) = 90Â°$, $\\arccos(-1/\\sqrt{2}) = 135Â°$, $\\arccos(-1) = 180Â°$.'],
        },
      ],
      conclusion: 'The angle is 45Â°. Procedure: (1) compute dot product, (2) compute magnitudes, (3) divide to get $\\cos\\theta$, (4) take arccos. Works in any dimension.',
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
          annotation: 'Second component uses rows 3 and 1 where $u_3 = 3$, $u_1 = 2$, $v_1 = 1$, $v_3 = -1$. Pattern: $(u_3v_1 - u_1v_3)$. Note the index order shifts cyclically: 1â†’2â†’3â†’1.',
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
          annotation: 'Verify perpendicularity by computing dot products with BOTH original vectors. Both must be zero â€” this is the built-in self-check for any cross product computation.',
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
        { expression: '= -14', annotation: 'The result is negative, so $\\cos\\theta < 0$, meaning $\\theta > 90\\degree$ \u2014 the angle is obtuse.' },
        { expression: '[0,-7]^T\\text{ points down},\\quad [4,2]^T\\text{ points right-up}', annotation: 'Direction check: one points down, the other up-right. They face opposite half-spaces, confirming an obtuse angle.' },
      ],
      answer: 'The dot product is $-14$; the angle is obtuse (greater than 90\\degree) because the result is negative.',
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
      answer: '$x = 6$ \u2014 the vector $[6, 4]^T$ is orthogonal to $[2, -3]^T$, confirmed by dot product equal to zero.',
    },
    {
      id: 'la1-003-ch3',
      difficulty: 'hard',
      problem: 'Compute $\\mathbf{u} \\times \\mathbf{v}$ for $\\mathbf{u} = [2,-1,3]^T$ and $\\mathbf{v} = [1,4,-1]^T$. Then verify that $\\mathbf{u} \\times \\mathbf{v}$ is perpendicular to both $\\mathbf{u}$ and $\\mathbf{v}$.',
      hint: 'Use the cross product formula: component $i$ = $(u_2v_3 - u_3v_2)$, component $j$ = $(u_3v_1 - u_1v_3)$, component $k$ = $(u_1v_2 - u_2v_1)$. The indices cycle.',
      walkthrough: [
        { expression: '(\\mathbf{u}\\times\\mathbf{v})_1 = (-1)(-1)-(3)(4) = 1-12 = -11', annotation: 'First component uses rows 2 and 3. Pattern: (row2 of u)(row3 of v) minus (row3 of u)(row2 of v).' },
        { expression: '(\\mathbf{u}\\times\\mathbf{v})_2 = (3)(1)-(2)(-1) = 3+2 = 5', annotation: 'Second component uses rows 3 and 1 (cyclic shift). Indices cycle: 1\u21922\u21923\u21921.' },
        { expression: '(\\mathbf{u}\\times\\mathbf{v})_3 = (2)(4)-(-1)(1) = 8+1 = 9', annotation: 'Third component uses rows 1 and 2.' },
        { expression: '[-11,5,9]\\cdot[2,-1,3]=-22-5+27=0\\checkmark,\\quad[-11,5,9]\\cdot[1,4,-1]=-11+20-9=0\\checkmark', annotation: 'Verify perpendicularity: dot the result with BOTH original vectors. Both must equal zero \u2014 this is the universal self-check for any cross product.' },
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
      'Dot product: fastest way to check for 90\u00b0 angles in any dimension \u2014 one computation, no arccos needed.',
      'Cross product: use when you need a vector pointing out of a 3D plane (normals, torque, area).',
      '$\\mathbf{v}\\cdot\\mathbf{v} = \\|\\mathbf{v}\\|^2$ \u2014 a faster path to squared magnitude than the distance formula.',
      'For the cross product, always verify by dotting the result with both originals \u2014 both must be zero.',
      'Dot and cross are complementary: dot uses $\\cos\\theta$ (measures alignment), cross uses $\\sin\\theta$ (measures divergence).',
    ],
  },

  spiral: {
    recoveryPoints: [
      { lessonId: 'algebra-trig', label: 'Trigonometry: Cosine and Sine', note: 'cos(0)=1 (full alignment), cos(90\u00b0)=0 (orthogonal), cos(180\u00b0)=\u22121 (opposite). This maps exactly to dot product sign behavior.' },
    ],
    futureLinks: [
      { lessonId: 'la2-002', label: 'Matrix Multiplication', note: 'Multiplying two matrices is computing many dot products simultaneously \u2014 one for every (row, column) pair.' },
      { lessonId: 'la1-005', label: 'Lines and Planes', note: 'The normal vector to a plane is the cross product of two edge vectors; the dot product with the normal tests whether a point lies on the plane.' },
    ],
  },

  assessment: {
    questions: [
      {
        id: 'la1-003-assess-1',
        type: 'choice',
        text: 'Are the vectors $[5, 2]^T$ and $[-2, 5]^T$ orthogonal?',
        options: ['Yes \u2014 their dot product is zero', 'No \u2014 their dot product is non-zero', 'Cannot be determined without knowing their magnitudes', 'Yes \u2014 they have the same magnitude'],
        answer: 'Yes \u2014 their dot product is zero',
        hint: '$(5)(-2) + (2)(5) = -10 + 10 = 0$. A dot product of exactly zero means perpendicular (orthogonal).',
      },
    ],
  },

  mentalModel: [
    'Dot Product = Alignment = Shadow length. Returns a scalar.',
    'Cross Product = Perpendicular area vector. Returns a 3D vector.',
    'Orthogonal means dot product is ZERO.',
    'Angle formula: $\\theta = \\arccos(\\mathbf{u}\\cdot\\mathbf{v} / (\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|))$.',
    'Cross product perpendicularity check: dot the result with both originals â€” both must be zero.',
  ],

  checkpoints: [
    { id: 'cp-la1-003-1', label: 'Read: Define dot product and its geometric meaning', type: 'read' },
    { id: 'cp-la1-003-2', label: 'Read: State the orthogonality condition', type: 'read' },
    { id: 'cp-la1-003-3', label: 'Read: State the cross product formula and right-hand rule', type: 'read' },
    { id: 'cp-la1-003-4', label: 'Run: OpenMAT cell \u2014 compute dot product and angle', type: 'lab' },
    { id: 'cp-la1-003-5', label: 'Run: Python cell \u2014 cross product and perpendicularity check', type: 'lab' },
    { id: 'cp-la1-003-6', label: 'Complete: Example 1 \u2014 compute a dot product', type: 'example' },
    { id: 'cp-la1-003-7', label: 'Complete: Example 3 \u2014 find the angle between two vectors', type: 'example' },
    { id: 'cp-la1-003-8', label: 'Attempt: Challenge 3 \u2014 compute and verify a 3D cross product', type: 'challenge' },
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
      hints: ['The dot product is tied to $\\cos\\theta$ â€” the angle between the vectors. It squashes two vectors into one number measuring their directional agreement.'],
      reviewSection: 'Intuition tab â€” Shadow of the Dot Product',
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
      hints: ['The cross product creates a vector perpendicular to BOTH inputs. If both inputs are in the XY plane, the result must point in the Z direction â€” straight up or down.'],
      reviewSection: 'Intuition tab â€” Cross Product',
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
      hints: ['$\\mathbf{v}\\cdot\\mathbf{v} = v_1^2 + v_2^2 + \\cdots = \\|\\mathbf{v}\\|^2$. The angle between a vector and itself is 0Â°, and $\\cos(0Â°) = 1$, so $\\mathbf{v}\\cdot\\mathbf{v} = \\|\\mathbf{v}\\|^2$.'],
      reviewSection: 'Math tab â€” Dot Product',
    },
    {
      id: 'la1-003-quiz-4',
      type: 'choice',
      text: 'If $\\mathbf{u} \\cdot \\mathbf{v} > 0$, then the angle $\\theta$ between them satisfies:',
      options: [
        '$\\theta = 90Â°$',
        '$90Â° < \\theta \\leq 180Â°$ (obtuse)',
        '$0Â° \\leq \\theta < 90Â°$ (acute)',
        '$\\theta = 0Â°$ exactly',
      ],
      answer: '$0Â° \\leq \\theta < 90Â°$ (acute)',
      hints: ['$\\mathbf{u}\\cdot\\mathbf{v} = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|\\cos\\theta > 0$. Since magnitudes are always positive, $\\cos\\theta > 0 \\Leftrightarrow \\theta < 90Â°$.'],
      reviewSection: 'Intuition tab â€” Compass analogy',
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
      reviewSection: 'Intuition tab â€” Cross Product',
    },
    {
      id: 'la1-003-quiz-6',
      type: 'choice',
      text: 'Two vectors $\\mathbf{u} = [3, 0, 0]^T$ and $\\mathbf{v} = [0, 5, 0]^T$. What is $\\|\\mathbf{u} \\times \\mathbf{v}\\|$?',
      options: ['0', '8', '15', '$\\sqrt{34}$'],
      answer: '15',
      hints: ['$\\|\\mathbf{u}\\| = 3$, $\\|\\mathbf{v}\\| = 5$, angle between them = 90Â° (perpendicular). $\\|\\mathbf{u}\\times\\mathbf{v}\\| = \\|\\mathbf{u}\\|\\|\\mathbf{v}\\|\\sin(90Â°) = 3 \\times 5 \\times 1 = 15$. This is the area of the $3\\times 5$ rectangle they form.'],
      reviewSection: 'Math tab \u2014 Cross Product magnitude',
    },
  ],

  misconceptions: [
    {
      falseBelief: 'A larger dot product always means the vectors are more aligned.',
      whyStudentsThinkIt: 'Students conflate the raw magnitude of the dot product with the angle, forgetting that longer vectors produce larger dot products even if their angle is the same.',
      correctionExample: '$[100, 0]^T \\cdot [100, 0]^T = 10000$, but $[1, 0]^T \\cdot [1, 0]^T = 1$ \u2014 both pairs have angle 0\u00b0. The dot product value depends on both angle AND magnitudes.',
      contrastCase: 'To measure angle alone, divide by magnitudes: $\\cos\\theta = (\\mathbf{u}\\cdot\\mathbf{v})/(\\|\\mathbf{u}\\|\\|\\mathbf{v}\\|)$. This normalizes out the size effect.',
    },
    {
      falseBelief: 'The cross product is commutative: $\\mathbf{u}\\times\\mathbf{v} = \\mathbf{v}\\times\\mathbf{u}$.',
      whyStudentsThinkIt: 'Students treat the cross product like multiplication of numbers, where $ab = ba$.',
      correctionExample: '$[1,0,0]^T\\times[0,1,0]^T = [0,0,1]^T$ (pointing up), but $[0,1,0]^T\\times[1,0,0]^T = [0,0,-1]^T$ (pointing down) \u2014 the sign flips.',
      contrastCase: 'The cross product is anti-commutative: $\\mathbf{u}\\times\\mathbf{v} = -(\\mathbf{v}\\times\\mathbf{u})$. Use the right-hand rule to determine which direction your specific pair gives.',
    },
  ],

  transferPrompts: [
    {
      situation: 'A CNC machinist is checking whether a cutting tool force vector $\\mathbf{F} = [8, 6, 0]^T$ is doing useful work in the feed direction $\\mathbf{d} = [1, 0, 0]^T$. What fraction of the force is effective?',
      competingTechniques: ['Measuring angles with a protractor', 'Dot product projection'],
      whyThisTechniqueWins: 'The effective component is the dot product projection: $(\\mathbf{F}\\cdot\\hat{\\mathbf{d}}) = 8$. Total force magnitude is 10. So only 80% is effective. This generalizes to any direction in any dimension instantly.',
    },
    {
      situation: 'A 3D graphics shader needs to decide how brightly to illuminate a triangle face. The light direction is $\\mathbf{L}$ and the face normal is $\\mathbf{n}$. How should it compute brightness?',
      competingTechniques: ['Angle-based lookup table', 'Dot product of normal and light direction'],
      whyThisTechniqueWins: 'Brightness = $\\max(0, \\hat{\\mathbf{n}}\\cdot\\hat{\\mathbf{L}})$. When normal and light fully align (angle 0\u00b0), brightness = 1. When perpendicular, brightness = 0. This runs in one GPU operation per pixel.',
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
      whyItHappened: 'The second component formula is $u_3v_1 - u_1v_3$, which has a sign reversal compared to the other two components \u2014 easy to miss under time pressure.',
      repairStrategy: 'Use the mnemonic: first component positive, second component negative sign (or swap the formula order), third positive. Always run the perpendicularity check \u2014 dot with both originals, both must be zero.',
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
