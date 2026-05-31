export default {
  id: 'p1-ch1-004',
  slug: 'adding-vectors-graphically-parallelogram',
  chapter: 'p1',
  order: 4,
  title: 'Adding Vectors Graphically — Parallelogram Method',
  subtitle: 'Two arrows into one: the diagonal of the parallelogram they form.',
  tags: ['vector addition', 'parallelogram', 'resultant', 'graphical method'],
  aliases: 'parallelogram law resultant sum of vectors graphical',

  hook: {
    question: `Two forces pull on a boat — one northeast, one northwest. What single force replaces them both?`,
    realWorldContext: `Every time two forces act simultaneously — a kite in the wind, a ship fighting a current, a joint in a truss — you need to find their combined effect. The parallelogram method is the oldest and most visual way to do that.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'vector-addition-chain' },
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (5 of 21) Adding Vectors Graphically — Parallelogram Method',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      `Imagine a boat engine pushing 30 N east while the wind pushes 40 N north at the same time. Before reading on, predict: is the net force 70 N, 50 N, or 35 N? The forces don't stack end-to-end — they act simultaneously in different directions. The answer is 50 N, and the parallelogram method is what shows you why.`,
      `Place $\\vec{A}$ and $\\vec{B}$ so their **tails share the same point**. Draw $\\vec{A}$ and $\\vec{B}$ as two sides of a shape. Complete the parallelogram by copying each vector from the tip of the other. The **diagonal** from the shared tail to the opposite corner is the resultant $\\vec{R} = \\vec{A} + \\vec{B}$.`,
      `The key insight is that the diagonal simultaneously captures both contributions. It is the single vector that has exactly the same effect as applying $\\vec{A}$ and $\\vec{B}$ together.`,
      `Vector addition is **commutative**: $\\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}$. The parallelogram makes this obvious — the same diagonal results whether you call the sides $\\vec{A}$ and $\\vec{B}$ or $\\vec{B}$ and $\\vec{A}$.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Parallelogram method — 4 steps',
        body: `1. Draw \\vec{A} and \\vec{B} tail-to-tail at a common point.\\quad 2. Copy \\vec{B} from the tip of \\vec{A}.\\quad 3. Copy \\vec{A} from the tip of \\vec{B}.\\quad 4. The diagonal from the shared tail to the far corner is \\vec{R} = \\vec{A} + \\vec{B}.`,
      },
      {
        type: 'definition',
        title: 'Resultant vector',
        body: `\\vec{R} = \\vec{A} + \\vec{B}`,
      },
      {
        type: 'insight',
        title: 'Tail-to-tail placement',
        body: 'Both vectors must share a common tail before you draw the parallelogram. If tails are not at the same point, translate one arrow.',
      },
      {
        type: 'definition',
        title: 'Commutativity',
        body: `\\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Two vectors, one resultant',
        caption: 'Place A⃗ and B⃗ tail-to-tail. Complete the parallelogram. The diagonal from the shared tail is R⃗ = A⃗ + B⃗. Components add axis-by-axis: Rₓ = Aₓ + Bₓ, Ry = Ay + By.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Two vectors, one resultant — interactive',
        caption: `Both arrows share a tail. Complete the parallelogram. The diagonal from the shared tail is $\\vec{R} = \\vec{A} + \\vec{B}$.`,
        props: { interactive: true },
      },
    ],
  },

  math: {
    prose: [
      'The parallelogram method is geometric — it does not require any calculation. But it is limited by the precision of your drawing. For exact answers we always convert to components (Lesson 6). The parallelogram tells you *what to expect* before you calculate.',
      'A useful bound: the magnitude of the resultant satisfies $\\bigl||\\vec{A}| - |\\vec{B}|\\bigr| \\le |\\vec{R}| \\le |\\vec{A}| + |\\vec{B}|$. The maximum is reached when vectors are parallel (same direction); the minimum when they are anti-parallel (opposite directions).',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Magnitude bounds (triangle inequality)',
        body: `\\bigl||\\vec{A}| - |\\vec{B}|\\bigr| \\;\\le\\; |\\vec{A}+\\vec{B}| \\;\\le\\; |\\vec{A}| + |\\vec{B}|`,
      },
      {
        type: 'warning',
        title: 'The resultant is usually NOT |A| + |B|',
        body: `$|\\vec{R}| = |\\vec{A}| + |\\vec{B}|$ only when both vectors point in exactly the same direction. For any other angle, the resultant is shorter than this sum.`,
      },
      {
        type: 'mnemonic',
        title: 'Check with extreme cases',
        body: `Same direction: $|\\vec{R}| = |\\vec{A}| + |\\vec{B}|$ (maximum). Opposite: $|\\vec{R}| = \\bigl||\\vec{A}| - |\\vec{B}|\\bigr|$ (minimum). Perpendicular: $|\\vec{R}| = \\sqrt{|\\vec{A}|^2 + |\\vec{B}|^2}$.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Triangle inequality — extreme cases',
        caption: `At $0°$ the resultant magnitude is $|\\vec{A}|+|\\vec{B}|$ (maximum). At $180°$ it is $\\bigl||\\vec{A}|-|\\vec{B}|\\bigr|$ (minimum). At $90°$ it is $\\sqrt{|\\vec{A}|^2+|\\vec{B}|^2}$.`,
      },
    ],
  },

  rigor: {
    prose: [
      'The parallelogram law follows directly from the definition of vector addition in $\\mathbb{R}^n$: $(A_x, A_y) + (B_x, B_y) = (A_x+B_x, A_y+B_y)$. The geometric construction is simply a way of visualising this component-wise sum.',
      'From an invariant viewpoint, the resultant is independent of the coordinate system. Rotating the axes changes every component, but the diagonal of the parallelogram — the vector itself — stays the same object. This is why vectors are defined as entities with magnitude and direction, not as pairs of numbers.',
      'Geometrically, the four vertices of the parallelogram are $\\mathbf{0}$, $\\vec{A}$, $\\vec{B}$, and $\\vec{A}+\\vec{B}$. The two diagonals bisect each other (a property of all parallelograms), which means the midpoint of $\\vec{A}+\\vec{B}$ coincides with the midpoint of $\\vec{B}-(-\\vec{A})$. This is the geometric proof that addition and subtraction share the same parallelogram.',
      'The parallelogram law is the gateway to the dot product (Lesson 10) and the law of cosines for vectors. In an inner-product space, the polarisation identity $\\vec{A}\\cdot\\vec{B} = \\tfrac{1}{4}(|\\vec{A}+\\vec{B}|^2 - |\\vec{A}-\\vec{B}|^2)$ recovers the dot product entirely from the two diagonals of the parallelogram — showing that geometry and algebra are one.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Vector addition (formal)',
        body: `\\vec{A} + \\vec{B} = (A_x + B_x)\\,\\hat{i} + (A_y + B_y)\\,\\hat{j}`,
      },
      {
        type: 'insight',
        title: 'Why the diagonal?',
        body: `The four vertices of the parallelogram are $\\mathbf{0}$, $\\vec{A}$, $\\vec{B}$, $\\vec{A}+\\vec{B}$. The diagonal from $\\mathbf{0}$ to $\\vec{A}+\\vec{B}$ is exactly the component sum — the geometry reflects the algebra.`,
      },
    ],
    proofSteps: [
      {
        expression: '\\vec{R} = \\vec{A} + \\vec{B}',
        annotation: 'The resultant is defined as the vector sum. We want to understand why this equals the parallelogram diagonal.',
      },
      {
        expression: '\\vec{R} = (A_x\\hat{i} + A_y\\hat{j}) + (B_x\\hat{i} + B_y\\hat{j})',
        annotation: 'Replace each vector with its unit-vector expansion. Now the addition is fully explicit.',
      },
      {
        expression: '\\vec{R} = (A_x+B_x)\\hat{i} + (A_y+B_y)\\hat{j}',
        annotation: 'Collect î and ĵ terms. Addition is done axis by axis — ordinary arithmetic.',
      },
      {
        expression: 'R_x = A_x+B_x, \\qquad R_y = A_y+B_y',
        annotation: 'The resultant components are the sums of the individual components. This is the computation step.',
      },
      {
        expression: '\\text{Corners: } 0, A, B, A+B \\implies \\text{Parallelogram}',
        annotation: 'The four corners of the parallelogram are exactly those four points. The diagonal from origin to $A+B$ is $\\vec{R}$. Geometry and algebra agree.',
      },
    ],
    title: 'Proof: parallelogram diagonal equals component sum',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Parallelogram diagonal = component sum',
        caption: `Corners: $\\mathbf{0}$, $\\vec{A}$, $\\vec{B}$, $\\vec{A}+\\vec{B}$. The diagonal from origin to $\\vec{A}+\\vec{B}$ has components $R_x = A_x+B_x$ and $R_y = A_y+B_y$. Geometry and algebra are identical.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-004-ex1',
      title: 'Resultant of two perpendicular forces',
      problem: `\\text{Force } \\vec{A} = 30\\,N \\text{ east and } \\vec{B} = 40\\,N \\text{ north act on an object. Find } |\\vec{R}| \\text{ and its direction.}`,
      steps: [
        { expression: 'R_x = A_x + B_x = 30 + 0 = 30\\,N', annotation: 'East component: A contributes 30 N, B contributes 0 N.' },
        { expression: 'R_y = A_y + B_y = 0 + 40 = 40\\,N', annotation: 'North component: A contributes 0 N, B contributes 40 N.' },
        { expression: '|\\vec{R}| = \\sqrt{30^2 + 40^2} = \\sqrt{900+1600} = \\sqrt{2500} = 50\\,N', annotation: '3-4-5 triple scaled by 10.' },
        { expression: '\\theta = \\arctan(40/30) = \\arctan(4/3) \\approx 53.1°\\text{ north of east}', annotation: 'Angle from east (+x axis). Both components positive → Quadrant I.' },
      ],
      conclusion: '$\\vec{R} = 50\\,N$ at $53.1°$ north of east. The parallelogram is a rectangle here because the vectors are perpendicular.',
      visualizations: [
        {
          id: 'SVGDiagram',
          props: { type: 'vector-addition-chain' },
          title: `A⃗ east + B⃗ north = rectangle`,
          caption: `Perpendicular vectors form a rectangle. $R_x = 30$ N, $R_y = 40$ N, $|\\vec{R}| = 50$ N.`,
        },
      ],
    },
    {
      id: 'ch1-004-ex2',
      title: 'Two forces at 60° — using the law of cosines',
      problem: `\\text{Two forces } |\\vec{A}| = 40\\,N \\text{ and } |\\vec{B}| = 30\\,N \\text{ act at } 60° \\text{ to each other. Find } |\\vec{R}|.`,
      steps: [
        { expression: '|\\vec{R}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 + 2|\\vec{A}||\\vec{B}|\\cos\\phi', annotation: 'Law of cosines for the triangle formed inside the parallelogram. $\\phi = 60°$ is the angle between the two vectors.' },
        { expression: '|\\vec{R}|^2 = 40^2 + 30^2 + 2(40)(30)\\cos60°', annotation: 'Substitute values.' },
        { expression: '|\\vec{R}|^2 = 1600 + 900 + 2400 \\times 0.5 = 3700', annotation: '$\\cos60° = 0.5$.' },
        { expression: '|\\vec{R}| = \\sqrt{3700} \\approx 60.8\\,N', annotation: 'Take the square root.' },
      ],
      conclusion: '$|\\vec{R}| \\approx 60.8\\,N$. The bounds are $|40-30| = 10\\,N$ (min) and $40+30 = 70\\,N$ (max). Our answer sits between them, as required.',
    },
    {
      id: 'ch1-004-ex3',
      title: 'River crossing — boat velocity plus current',
      problem: `\\text{A boat heads north at 4 m/s across a river. The current flows east at 3 m/s. Find the resultant velocity.}`,
      steps: [
        { expression: 'v_x = 0 + 3 = 3\\,\\text{m/s}', annotation: 'East component: boat contributes 0, current contributes 3 m/s.' },
        { expression: 'v_y = 4 + 0 = 4\\,\\text{m/s}', annotation: 'North component: boat contributes 4 m/s, current contributes 0.' },
        { expression: '|\\vec{v}| = \\sqrt{3^2 + 4^2} = \\sqrt{25} = 5\\,\\text{m/s}', annotation: '3-4-5 triple.' },
        { expression: '\\theta = \\arctan(3/4) \\approx 36.9°\\text{ east of north}', annotation: 'Angle from north toward east. The current pushes the boat off course.' },
      ],
      conclusion: 'The boat travels at 5 m/s, angled $36.9°$ east of its intended heading. The parallelogram shows exactly how the current deflects the path.',
    },
  ],

  challenges: [
    {
      id: 'ch1-004-ch1',
      difficulty: 'easy',
      problem: '\\text{Two vectors have magnitudes 5 and 12 and are perpendicular. Find the resultant magnitude.}',
      hint: 'Perpendicular vectors form a right triangle. Use the Pythagorean theorem.',
      walkthrough: [
        { expression: '|\\vec{R}| = \\sqrt{5^2 + 12^2} = \\sqrt{25 + 144} = \\sqrt{169} = 13', annotation: '5-12-13 Pythagorean triple.' },
      ],
      answer: '|\\vec{R}| = 13',
    },
    {
      id: 'ch1-004-ch2',
      difficulty: 'medium',
      problem: '\\text{Forces of 8 N and 8 N act at 120° to each other. Find the resultant magnitude.}',
      hint: 'Use the law of cosines: $|R|^2 = A^2 + B^2 + 2AB\\cos\\phi$ where $\\phi = 120°$.',
      walkthrough: [
        { expression: '|\\vec{R}|^2 = 64 + 64 + 2(8)(8)\\cos120°', annotation: 'Apply law of cosines.' },
        { expression: '= 128 + 128(-0.5) = 128 - 64 = 64', annotation: '$\\cos120° = -0.5$.' },
        { expression: '|\\vec{R}| = 8\\,N', annotation: 'Two equal forces at 120° give a resultant equal to either force.' },
      ],
      answer: '|\\vec{R}| = 8 N',
    },
    {
      id: 'ch1-004-ch3',
      difficulty: 'hard',
      problem: `\\text{Prove that } |\\vec{A} + \\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 \\text{ if and only if } \\vec{A} \\perp \\vec{B}.`,
      hint: 'Expand $|\\vec{A}+\\vec{B}|^2$ using components. A perpendicular condition produces a specific dot-product result.',
      walkthrough: [
        { expression: '|\\vec{A}+\\vec{B}|^2 = (A_x+B_x)^2 + (A_y+B_y)^2', annotation: 'Expand the squared magnitude.' },
        { expression: '= A_x^2 + 2A_xB_x + B_x^2 + A_y^2 + 2A_yB_y + B_y^2', annotation: 'Expand each square.' },
        { expression: '= (A_x^2+A_y^2) + (B_x^2+B_y^2) + 2(A_xB_x+A_yB_y)', annotation: 'Regroup into three parts.' },
        { expression: '= |\\vec{A}|^2 + |\\vec{B}|^2 + 2(\\vec{A}\\cdot\\vec{B})', annotation: 'Recognise the dot product.' },
        { expression: '\\therefore\\;|\\vec{A}+\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2 \\iff \\vec{A}\\cdot\\vec{B}=0 \\iff \\vec{A}\\perp\\vec{B}', annotation: 'The Pythagorean theorem for vectors holds exactly when the dot product vanishes.' },
      ],
      answer: `The condition holds iff $\\vec{A}\\cdot\\vec{B}=0$, i.e. $\\vec{A}\\perp\\vec{B}$.`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Component-wise addition and the parallelogram',
          type: 'code',
          language: 'python',
          code: `import numpy as np

A = np.array([30.0, 0.0])    # 30 N east
B = np.array([0.0, 40.0])    # 40 N north

R = A + B                    # component-wise: [30+0, 0+40]
R_mag = np.linalg.norm(R)
R_angle = np.degrees(np.arctan2(R[1], R[0]))

print(f"A = {A}")
print(f"B = {B}")
print(f"R = A + B = {R}")
print(f"|R| = {R_mag:.4f} N")
print(f"theta = {R_angle:.2f} degrees (from +x)")`,
          prose: [
            `\`np.array([30, 0])\` stores $\\vec{A} = 30\\,\\hat{i} + 0\\,\\hat{j}$. The \`+\` operator adds element-by-element: $R_x = A_x + B_x$, $R_y = A_y + B_y$ — this IS the parallelogram law, done numerically.`,
            `\`np.linalg.norm(R)\` computes $|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}$. For our 30-40 pair, you should see 50 N — the 3-4-5 triple at ×10. \`arctan2\` gives the correct quadrant angle.`,
            `Notice: R_mag ≠ norm(A) + norm(B) = 70 N. The diagonal of the parallelogram is always shorter than the sum of its sides, except when both vectors point the same way.`,
          ],
        },
        {
          cellTitle: 'Visualise the parallelogram with matplotlib',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import matplotlib.patches as mpatches

A = np.array([3.0, 0.0])
B = np.array([1.5, 2.6])    # 60 degrees from A, same magnitude
R = A + B

fig, ax = plt.subplots(figsize=(6, 5))
origin = np.zeros(2)

ax.quiver(*origin, *A, angles='xy', scale_units='xy', scale=1, color='royalblue', width=0.012, label=r'$\\vec{A}$')
ax.quiver(*origin, *B, angles='xy', scale_units='xy', scale=1, color='darkorange', width=0.012, label=r'$\\vec{B}$')
ax.quiver(*origin, *R, angles='xy', scale_units='xy', scale=1, color='crimson', width=0.015, label=r'$\\vec{R}=\\vec{A}+\\vec{B}$')
# complete the parallelogram
ax.quiver(*A, *B, angles='xy', scale_units='xy', scale=1, color='darkorange', alpha=0.3, width=0.008)
ax.quiver(*B, *A, angles='xy', scale_units='xy', scale=1, color='royalblue', alpha=0.3, width=0.008)

ax.set_xlim(-0.3, 5.5)
ax.set_ylim(-0.3, 3.5)
ax.set_aspect('equal')
ax.legend(fontsize=12)
ax.set_title('Parallelogram method')
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
          prose: [
            `\`ax.quiver(*origin, *A, ...)\` draws $\\vec{A}$ from the origin. Passing \`angles='xy', scale_units='xy', scale=1\` tells matplotlib to treat coordinates as actual units — so 1 unit in the array = 1 unit on screen.`,
            `The two dashed copies of $\\vec{A}$ and $\\vec{B}$ (drawn from each other's tips) complete the parallelogram. The red arrow is the diagonal $\\vec{R}$. This is exactly the 4-step parallelogram procedure, now automated.`,
            `Change \`B\` to \`np.array([0, 3])\` and re-run. The parallelogram becomes a rectangle and the diagonal is the hypotenuse — visually confirming the Pythagorean formula for perpendicular vectors.`,
          ],
        },
        {
          cellTitle: 'Triangle inequality across all angles',
          type: 'code',
          language: 'python',
          code: `mag_A, mag_B = 40.0, 30.0
angles = np.linspace(0, 180, 181)

resultants = []
for phi_deg in angles:
    phi = np.radians(phi_deg)
    A = np.array([mag_A, 0.0])
    B = np.array([mag_B * np.cos(phi), mag_B * np.sin(phi)])
    resultants.append(np.linalg.norm(A + B))

fig, ax = plt.subplots(figsize=(7, 4))
ax.plot(angles, resultants, color='crimson', lw=2, label=r'$|\\vec{R}|$')
ax.axhline(mag_A + mag_B, color='grey', ls='--', label=f'max = {mag_A+mag_B:.0f}')
ax.axhline(abs(mag_A - mag_B), color='black', ls=':', label=f'min = {abs(mag_A-mag_B):.0f}')
ax.set_xlabel('Angle between vectors (degrees)')
ax.set_ylabel('Resultant magnitude (N)')
ax.set_title('Triangle inequality: |R| vs. angle')
ax.legend()
ax.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
          prose: [
            `We sweep $\\phi$ from $0°$ (parallel) to $180°$ (anti-parallel) and compute $|\\vec{R}|$ at each step. \`np.linspace(0, 180, 181)\` generates 181 evenly-spaced angle values.`,
            `The plot confirms the triangle inequality visually: the red curve stays between the two dashed bounds at all angles. At $\\phi = 0°$ the curve touches the upper bound; at $\\phi = 180°$ it touches the lower bound.`,
            `Notice the curve is not linear — it follows $|\\vec{R}| = \\sqrt{A^2 + B^2 + 2AB\\cos\\phi}$ (law of cosines). At $\\phi = 90°$ read off the value and confirm it equals $\\sqrt{40^2 + 30^2} = 50$ N.`,
          ],
        },
        {
          cellTitle: 'Challenge: boat crossing a river',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A boat heads north at 4 m/s; the river current flows east at 3 m/s.
# 1. Define numpy arrays for boat velocity and current velocity.
# 2. Compute the resultant velocity vector R.
# 3. Compute the speed (magnitude of R) and the angle east of north.
# 4. Print speed and angle.

boat    = np.array([___, ___])   # [east, north] components
current = np.array([___, ___])
R = ___ + ___
speed = np.linalg.norm(___)
angle_east_of_north = np.degrees(np.arctan2(___, ___))

print(f"Speed  = {speed:.4f} m/s")
print(f"Offset = {angle_east_of_north:.2f} degrees east of north")`,
          prose: [
            `The boat velocity is purely north: \`boat = np.array([0, 4])\`. The current is purely east: \`current = np.array([3, 0])\`. \`R = boat + current\` gives the resultant by the parallelogram law.`,
            `\`np.linalg.norm(R)\` computes $|\\vec{R}| = \\sqrt{3^2+4^2} = 5$ m/s. For the angle east of north, use \`arctan2(R[0], R[1])\` — note the argument order flips because we measure from north (y-axis) not east (x-axis).`,
            `Expected: speed ≈ 5.000 m/s, angle ≈ 36.87° east of north. The current pushes the boat off its intended heading — which is exactly the problem a navigator using the parallelogram method must solve.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Component-wise addition and the parallelogram',
          type: 'code',
          language: 'matlab',
          code: `A = [30, 0];    % 30 N east
B = [0, 40];    % 40 N north

R = A + B;      % element-wise: [Ax+Bx, Ay+By]
R_mag = norm(R);
R_angle = atan2d(R(2), R(1));

fprintf('A = [%g, %g]\\n', A(1), A(2))
fprintf('B = [%g, %g]\\n', B(1), B(2))
fprintf('R = [%g, %g]\\n', R(1), R(2))
fprintf('|R| = %.4f N\\n', R_mag)
fprintf('theta = %.2f degrees\\n', R_angle)`,
          prose: [
            `In MATLAB, \`A = [30, 0]\` creates a row vector. The \`+\` operator is element-wise: \`R = A + B\` computes $R_x = A_x + B_x$ and $R_y = A_y + B_y$ in one operation — same parallelogram law as Python/NumPy.`,
            `\`norm(R)\` computes the Euclidean magnitude $|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}$. \`atan2d\` returns degrees directly (vs. \`atan2\` which returns radians) — a MATLAB convenience not in Python.`,
            `Run this and confirm $|\\vec{R}| = 50$ N at $53.13°$. The 3-4-5 triple: $A = 3 \\times 10$, $B = 4 \\times 10$, $R = 5 \\times 10$.`,
          ],
        },
        {
          cellTitle: 'Visualise the parallelogram with quiver',
          type: 'code',
          language: 'matlab',
          code: `A = [3.0, 0.0];
B = [1.5, 2.6];    % ~60 degrees from A
R = A + B;

figure; hold on; axis equal; grid on
% main vectors
quiver(0,0, A(1),A(2), 0, 'b', 'LineWidth',2, 'MaxHeadSize',0.5)
quiver(0,0, B(1),B(2), 0, 'r', 'LineWidth',2, 'MaxHeadSize',0.5)
quiver(0,0, R(1),R(2), 0, 'm', 'LineWidth',2.5, 'MaxHeadSize',0.5)
% complete the parallelogram (dashed)
quiver(A(1),A(2), B(1),B(2), 0, 'r--', 'LineWidth',1, 'MaxHeadSize',0.3)
quiver(B(1),B(2), A(1),A(2), 0, 'b--', 'LineWidth',1, 'MaxHeadSize',0.3)

legend('A','B','R = A+B','','')
title('Parallelogram method')
xlabel('x'); ylabel('y')`,
          prose: [
            `\`quiver(x0, y0, dx, dy, 0, ...)\` draws an arrow from $(x_0, y_0)$ with direction $(dx, dy)$. The \`0\` argument disables auto-scaling so the arrow length matches the vector magnitude exactly.`,
            `The two dashed arrows complete the parallelogram by copying each vector from the tip of the other. The magenta diagonal is $\\vec{R} = \\vec{A} + \\vec{B}$ — it starts at the origin and reaches the far corner.`,
            `Change \`B = [0, 3]\` (perpendicular to A) and re-run. The shape becomes a rectangle, visually confirming that perpendicular vectors obey the Pythagorean formula.`,
          ],
        },
        {
          cellTitle: 'Triangle inequality across all angles',
          type: 'code',
          language: 'matlab',
          code: `mag_A = 40; mag_B = 30;
phi_deg = 0:1:180;
phi     = deg2rad(phi_deg);

A = [mag_A, 0];
Bx = mag_B .* cos(phi);
By = mag_B .* sin(phi);
R_mag = sqrt((A(1)+Bx).^2 + (A(2)+By).^2);

figure
plot(phi_deg, R_mag, 'r-', 'LineWidth', 2); hold on
yline(mag_A + mag_B, 'k--', sprintf('max = %g', mag_A+mag_B))
yline(abs(mag_A - mag_B), 'k:', sprintf('min = %g', abs(mag_A-mag_B)))
xlabel('Angle between vectors (degrees)')
ylabel('Resultant magnitude (N)')
title('Triangle inequality: |R| vs. angle')
grid on; legend('|R|','upper bound','lower bound')`,
          prose: [
            `\`phi = deg2rad(phi_deg)\` converts the 0–180° sweep to radians. The dot operators (\`.*\`, \`./\`) apply element-wise to the angle array, computing all 181 resultant magnitudes at once without a loop.`,
            `\`yline\` draws horizontal reference lines at the upper ($|A|+|B| = 70$ N) and lower ($||A|-|B|| = 10$ N) triangle-inequality bounds. The red curve touches each bound at the corresponding extreme angle.`,
            `At $\\phi = 90°$, read the value and verify it equals $\\sqrt{40^2+30^2} = 50$ N. The law of cosines: $|\\vec{R}|^2 = A^2 + B^2 + 2AB\\cos\\phi$ reduces to the Pythagorean theorem when $\\cos 90° = 0$.`,
          ],
        },
        {
          cellTitle: 'Challenge: boat crossing a river',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% A boat heads north at 4 m/s; current flows east at 3 m/s.
% 1. Define boat and current as 1x2 row vectors [east, north].
% 2. Compute the resultant R.
% 3. Compute speed and angle east of north.

boat    = [___, ___];   % [east, north]
current = [___, ___];
R = ___ + ___;
speed = norm(___);
angle_east_of_north = atan2d(___,___);

fprintf('Speed  = %.4f m/s\\n', speed)
fprintf('Offset = %.2f degrees east of north\\n', angle_east_of_north)`,
          prose: [
            `\`boat = [0, 4]\` (north only) and \`current = [3, 0]\` (east only). \`R = boat + current = [3, 4]\` by element-wise addition — the parallelogram law in one line.`,
            `\`norm(R) = sqrt(9+16) = 5\` m/s. For the angle east of north, \`atan2d(R(1), R(2))\` — note MATLAB uses 1-based indexing (\`R(1)\` = east component) and the argument order is (east, north) because we measure from north.`,
            `Expected: speed = 5.0000 m/s, angle ≈ 36.87° east of north. This is the classic 3-4-5 river crossing — the current deflects the boat off its heading, exactly as the parallelogram predicts.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-004-q1',
      type: 'choice',
      question: `In the parallelogram method, where must the tails of $\\vec{A}$ and $\\vec{B}$ be placed?`,
      options: [
        `Tip of $\\vec{A}$ at origin`,
        `Both tails at the same point`,
        `Tip of $\\vec{A}$ touching tail of $\\vec{B}$`,
        `Anywhere — placement does not matter`,
      ],
      answer: `Both tails at the same point`,
      hints: [`The parallelogram is formed from a shared starting point.`, `The resultant is the diagonal from that shared point.`],
      reviewSection: 'intuition',
      explanation: `The parallelogram method requires the two vectors to share a common tail. The diagonal from that shared tail is the resultant.`,
    },
    {
      id: 'p1-ch1-004-q2',
      type: 'choice',
      question: `Forces 30 N east and 40 N north act on an object. What is the magnitude of the resultant?`,
      options: [`$70$ N`, `$50$ N`, `$10$ N`, `$35$ N`],
      answer: `$50$ N`,
      hints: [`These are perpendicular forces — use the Pythagorean theorem.`, `$\\sqrt{30^2 + 40^2} = ?$`],
      reviewSection: 'examples',
      explanation: `$|\\vec{R}| = \\sqrt{30^2+40^2} = \\sqrt{2500} = 50$ N. The 3-4-5 triple scaled by 10.`,
    },
    {
      id: 'p1-ch1-004-q3',
      type: 'choice',
      question: `Which statement about $|\\vec{A}+\\vec{B}|$ is ALWAYS true?`,
      options: [
        `$|\\vec{A}+\\vec{B}| = |\\vec{A}| + |\\vec{B}|$`,
        `$|\\vec{A}+\\vec{B}| \\le |\\vec{A}| + |\\vec{B}|$`,
        `$|\\vec{A}+\\vec{B}| = \\sqrt{|\\vec{A}|^2+|\\vec{B}|^2}$`,
        `$|\\vec{A}+\\vec{B}| \\ge |\\vec{A}| + |\\vec{B}|$`,
      ],
      answer: `$|\\vec{A}+\\vec{B}| \\le |\\vec{A}| + |\\vec{B}|$`,
      hints: [`This is the triangle inequality.`, `Equality holds only in one special case — which one?`],
      reviewSection: 'math',
      explanation: `The triangle inequality: $|\\vec{A}+\\vec{B}| \\le |\\vec{A}|+|\\vec{B}|$ always. Equality only when both vectors point in the same direction.`,
    },
    {
      id: 'p1-ch1-004-q4',
      type: 'choice',
      question: `Two equal forces of 10 N act in exactly opposite directions. What is the resultant magnitude?`,
      options: [`$20$ N`, `$10$ N`, `$0$ N`, `$14.1$ N`],
      answer: `$0$ N`,
      hints: [`Anti-parallel vectors have $\\phi = 180°$.`, `$\\cos(180°) = -1$ — use the law of cosines.`],
      reviewSection: 'math',
      explanation: `Anti-parallel equal forces cancel: $|\\vec{R}| = |10-10| = 0$ N.`,
    },
    {
      id: 'p1-ch1-004-q5',
      type: 'choice',
      question: `$\\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}$. What property is this?`,
      options: [`Associativity`, `Distributivity`, `Commutativity`, `The zero-vector identity`],
      answer: `Commutativity`,
      hints: [`This property says the order of the operands doesn't change the result.`, `The parallelogram has the same diagonal no matter which side you call A or B.`],
      reviewSection: 'intuition',
      explanation: `Commutativity: the order of addition does not change the result. The parallelogram makes this geometric — the same diagonal regardless of labelling.`,
    },
    {
      id: 'p1-ch1-004-q6',
      type: 'choice',
      question: `Two forces of 6 N and 8 N act at 90°. The resultant is:`,
      options: [`$14$ N`, `$2$ N`, `$10$ N`, `$7$ N`],
      answer: `$10$ N`,
      hints: [`Perpendicular vectors — Pythagorean theorem applies.`, `Is 6-8-10 a Pythagorean triple?`],
      reviewSection: 'examples',
      explanation: `Perpendicular vectors: $|\\vec{R}| = \\sqrt{6^2+8^2} = \\sqrt{100} = 10$ N. The 6-8-10 (3-4-5) triple.`,
    },
    {
      id: 'p1-ch1-004-q7',
      type: 'choice',
      question: `The law of cosines for vectors: $|\\vec{R}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 + 2|\\vec{A}||\\vec{B}|\\cos\\phi$. What is $\\phi$?`,
      options: [
        `The angle $\\vec{R}$ makes with $+x$`,
        `The angle between $\\vec{A}$ and $\\vec{B}$`,
        `Always 90°`,
        `The angle $\\vec{A}$ makes with $+x$`,
      ],
      answer: `The angle between $\\vec{A}$ and $\\vec{B}$`,
      hints: [`Think about which angle appears inside the parallelogram.`, `At $\\phi = 0°$, the formula should give $|\\vec{R}| = |\\vec{A}|+|\\vec{B}|$ — does it?`],
      reviewSection: 'math',
      explanation: `$\\phi$ is the angle between the two vectors being added. At $\\phi = 0°$, $\\cos\\phi = 1$ and $|\\vec{R}| = |\\vec{A}|+|\\vec{B}|$ (maximum).`,
    },
    {
      id: 'p1-ch1-004-q8',
      type: 'choice',
      question: `$|\\vec{A}+\\vec{B}|^2 = |\\vec{A}|^2+|\\vec{B}|^2$ holds only when:`,
      options: [
        `$\\vec{A}$ and $\\vec{B}$ are parallel`,
        `$\\vec{A}$ and $\\vec{B}$ are perpendicular`,
        `$|\\vec{A}| = |\\vec{B}|$`,
        `One vector is zero`,
      ],
      answer: `$\\vec{A}$ and $\\vec{B}$ are perpendicular`,
      hints: [`Expand $|\\vec{A}+\\vec{B}|^2$ using components.`, `What must the cross term $2(\\vec{A}\\cdot\\vec{B})$ equal for this to work?`],
      reviewSection: 'rigor',
      explanation: `Expanding gives $|\\vec{A}|^2+|\\vec{B}|^2+2\\vec{A}\\cdot\\vec{B}$. This equals $|\\vec{A}|^2+|\\vec{B}|^2$ only when $\\vec{A}\\cdot\\vec{B} = 0$, i.e. $\\vec{A}\\perp\\vec{B}$.`,
    },
    {
      id: 'p1-ch1-004-q9',
      type: 'choice',
      question: `Forces of 5 N and 12 N act perpendicular to each other. What is the resultant?`,
      options: [`$17$ N`, `$7$ N`, `$13$ N`, `$8.5$ N`],
      answer: `$13$ N`,
      hints: [`Perpendicular forces → Pythagorean theorem.`, `Is 5-12-13 a Pythagorean triple?`],
      reviewSection: 'examples',
      explanation: `$|\\vec{R}| = \\sqrt{5^2 + 12^2} = \\sqrt{169} = 13$ N. The 5-12-13 Pythagorean triple.`,
    },
    {
      id: 'p1-ch1-004-q10',
      type: 'choice',
      question: `Two forces of 10 N each act at 60° to each other. Which is closest to the resultant magnitude?`,
      options: [`$20$ N`, `$17.3$ N`, `$10$ N`, `$14.1$ N`],
      answer: `$17.3$ N`,
      hints: [`Use the law of cosines: $|R|^2 = 100 + 100 + 2(10)(10)\\cos 60°$.`, `$\\cos 60° = 0.5$, so $|R|^2 = 300$.`],
      reviewSection: 'math',
      explanation: `$|\\vec{R}|^2 = 100 + 100 + 2(100)(0.5) = 300$, so $|\\vec{R}| = \\sqrt{300} \\approx 17.3$ N.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-004-m1',
      title: 'The resultant magnitude is the sum of the individual magnitudes',
      description: `Students often write $|\\vec{R}| = |\\vec{A}| + |\\vec{B}|$ by analogy with scalar addition. This is only true when the vectors are parallel (same direction).`,
      correctionExample: `For $\\vec{A} = 30\\,N$ east and $\\vec{B} = 40\\,N$ north: $|\\vec{A}| + |\\vec{B}| = 70\\,N$, but $|\\vec{R}| = \\sqrt{30^2+40^2} = 50\\,N$. The parallelogram diagonal is shorter than the sum of its sides.`,
    },
    {
      id: 'p1-ch1-004-m2',
      title: 'Tip-to-tail and tail-to-tail give different resultants',
      description: `Students confuse the parallelogram method (tail-to-tail) with the tip-to-tail method. They think moving the vectors changes the answer.`,
      correctionExample: `Both methods give the same resultant because vector translation does not change a vector. In the parallelogram method the resultant is the diagonal; in tip-to-tail it is the closing side. The same $\\vec{R} = \\vec{A} + \\vec{B}$ either way — try both for 30 N east + 40 N north and confirm $|\\vec{R}| = 50$ N each time.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-004-t1',
      prompt: `A plane flies northeast at 200 km/h while a crosswind blows from the west at 50 km/h. Draw the parallelogram and estimate the resultant speed and direction. What does the pilot need to do to compensate?`,
    },
    {
      id: 'p1-ch1-004-t2',
      prompt: `Two ropes hold a chandelier in static equilibrium — one angled 30° left of vertical, one 30° right. Each has 50 N of tension. Use the parallelogram method to check whether the net upward force balances the weight.`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-004-d1',
      title: 'Adding magnitudes instead of components',
      buggyCode: `A_mag = 30; B_mag = 40
R_mag = A_mag + B_mag   # wrong: 70`,
      explanation: `This adds scalar magnitudes, not vectors. It only gives the correct resultant when the vectors are parallel. For any other angle, the true resultant is smaller.`,
      fix: `# correct: decompose first
A = np.array([30, 0])
B = np.array([0, 40])
R_mag = np.linalg.norm(A + B)   # 50.0`,
    },
    {
      id: 'p1-ch1-004-d2',
      title: 'Wrong angle in the law of cosines',
      buggyCode: `# Two forces 40 N and 30 N at 60 degrees — using the wrong angle
phi = np.radians(120)   # student used the supplement
R_sq = 40**2 + 30**2 + 2*40*30*np.cos(phi)`,
      explanation: `The law of cosines uses the angle *between* the vectors (60°), not its supplement (120°). Taking the supplement gives a smaller resultant because $\\cos 120° = -0.5$ instead of $\\cos 60° = +0.5$.`,
      fix: `phi = np.radians(60)   # the actual angle between the vectors
R_sq = 40**2 + 30**2 + 2*40*30*np.cos(phi)
# gives |R| ≈ 60.8 N (correct)`,
    },
  ],

  mastery: {
    targetLevel: `Apply the parallelogram method to find the resultant of any two vectors: decompose into components, add component-wise, compute magnitude and direction. Verify results satisfy the triangle inequality.`,
    prerequisites: [`Vector components and magnitudes (Lesson 3)`, `Trigonometry: sin, cos, arctan2`],
    enables: [`Tip-to-tail method (Lesson 5)`, `Numerical vector addition (Lesson 6)`, `Adding force vectors in 2D (Lesson 9)`],
    commonStuckPoints: [
      `Forgetting to place vectors tail-to-tail before drawing the parallelogram`,
      `Adding magnitudes instead of components for non-parallel vectors`,
      `Using the wrong angle (supplement) in the law of cosines`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\vec{R} = \\vec{A} + \\vec{B}`, meaning: `Resultant vector — the diagonal of the parallelogram formed by A and B` },
      { symbol: `R_x = A_x + B_x`, meaning: `East (x) component of resultant equals sum of east components` },
      { symbol: `R_y = A_y + B_y`, meaning: `North (y) component of resultant equals sum of north components` },
      { symbol: `|\\vec{R}| \\le |\\vec{A}| + |\\vec{B}|`, meaning: `Triangle inequality — resultant magnitude never exceeds sum of parts` },
      { symbol: `\\phi`, meaning: `Angle between vectors A and B (used in law of cosines)` },
    ],
    rulesOfThumb: [
      `Vectors are parallel → resultant = sum of magnitudes (maximum possible).`,
      `Vectors are anti-parallel → resultant = difference of magnitudes (minimum possible).`,
      `Vectors are perpendicular → use the Pythagorean theorem: $|\\vec{R}| = \\sqrt{|\\vec{A}|^2+|\\vec{B}|^2}$.`,
      `Any other angle → use the law of cosines: $|\\vec{R}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 + 2|\\vec{A}||\\vec{B}|\\cos\\phi$.`,
      `Always check: is $|\\vec{R}|$ between $\\bigl||\\vec{A}|-|\\vec{B}|\\bigr|$ and $|\\vec{A}|+|\\vec{B}|$?`,
    ],
  },
}
