export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'p1-ch1-001',
  slug: 'what-is-a-vector',
  chapter: 'p1',
  order: 1,
  title: 'What Is a Vector?',
  subtitle: 'The first tool of physics: quantities that carry both size and direction.',
  tags: ['vector', 'scalar', 'magnitude', 'direction', 'arrow notation', 'components', 'unit vectors'],
  aliases: 'vectors intro displacement velocity force directed quantity magnitude direction components',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: 'Your GPS says you are 5 miles from home. Is that enough to get you there?',
    realWorldContext:
      `Of course not — you also need to know *which direction*. This single observation unlocks one of the most important ideas in all of physics. Some quantities — temperature, mass, time — are completely described by a single number. Others — force, velocity, acceleration — are completely *wrong* unless you also say which way. The mathematical object that carries both a size and a direction is called a **vector**, and from this lesson forward, almost everything you study in physics will be described by one.`,
    previewVisualizationId: 'VectorKinematicsLab',
  },

  // ── Videos ──────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (1 of 21) What Is A Vector?',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (2 of 21) Vector Notation',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'math',
    },
  ],

  // ── Intuition ────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      // ── WHY ─────────────────────────────────────────────────────────────
      `Let's start with a scenario. You tell your friend "I pushed the box with 50 newtons." Your friend asks, "Which way?" — and you shrug. That missing direction is the whole reason vectors exist. In the real world, a force that pushes a box to the right is completely different from a force that pushes it upward, even if both have the same strength. Physics cannot work without tracking direction. **Vectors are how we do it.**`,

      // ── SCALAR vs VECTOR (story) ─────────────────────────────────────────
      `Quantities that need only a number to describe them completely are called **scalars**. Temperature is $72°F$ — that's it. Mass is $5\\,kg$. Time is $10\\,s$. A scalar is just a number with a unit. No arrow needed. But now think about *velocity*. "The car was moving at 60 mph" tells us the speed. But physics needs to know: 60 mph *north* or 60 mph *east*? Those are physically different — one takes you to the airport; the other into the lake. Velocity is a **vector**: it has a magnitude (speed, 60 mph) and a direction (north). So is force, acceleration, displacement, momentum, and electric field. Almost every interesting quantity in physics is a vector.`,

      // ── THE ARROW ───────────────────────────────────────────────────────
      `We draw vectors as arrows. The **length** of the arrow represents the **magnitude** — the size of the quantity. A longer arrow means a bigger force, a faster velocity. The **direction** the arrow points represents the direction of the quantity. Two arrows that have the same length and point the same way are equal vectors, no matter where they are drawn on the page — this is called the **free vector rule**. You can pick up any vector and slide it anywhere without changing what it is.`,

      // ── COMPONENTS PREVIEW ──────────────────────────────────────────────
      `Once we move beyond simple "north" or "east" directions, we need a systematic way to describe any direction in the plane. The trick: break the vector into two parts — how much it points in the $x$-direction and how much in the $y$-direction. These parts are called **components**. Every vector in 2D is completely described by just two numbers: its $x$-component and its $y$-component. This converts the geometry of arrows into the algebra of numbers, and that's where the real power comes from.`,

      // ── BIG PICTURE ─────────────────────────────────────────────────────
      `This lesson builds the foundation for everything in Physics 1. Newton's laws, projectile motion, energy, momentum — all of it is written in the language of vectors. The students who struggle with physics later are almost always the ones who tried to skip this chapter. Take your time here. The reward is that every later topic feels like a natural extension of what you learn now.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Scalar',
        body: 'A quantity with **magnitude only**. Fully described by a single number and a unit.\\n\\nExamples: mass $m$ (kg), time $t$ (s), temperature $T$ (°C), speed $v$ (m/s), energy $E$ (J).',
      },
      {
        type: 'definition',
        title: 'Vector',
        body: 'A quantity with both **magnitude** and **direction**. Written with an arrow: $\\vec{A}$, or in bold: $\\mathbf{A}$.\\n\\nExamples: displacement $\\vec{d}$, velocity $\\vec{v}$, acceleration $\\vec{a}$, force $\\vec{F}$, momentum $\\vec{p}$.',
      },
      {
        type: 'insight',
        title: 'The free-vector rule',
        body:
          `A vector has no fixed location in space. You may slide (translate) a vector anywhere without changing it — only length and direction matter. This is why you can draw force arrows wherever they're clearest on a diagram.`,
      },
      {
        type: 'insight',
        title: 'Speed vs velocity — the classic confusion',
        body:
          `Speed is a scalar (how fast). Velocity is a vector (how fast AND which way). A car going around a circular track at constant speed is still *accelerating* because its direction changes every instant — meaning its velocity vector changes. This distinction will become critical in Chapter 3 (circular motion).`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'The anatomy of a vector',
        caption:
          `A vector has two parts: magnitude |A| (the arrow length) and direction θ (the angle from +x). The right triangle shows how magnitude and angle together determine the x- and y-components. A scalar has only the first — no arrow, no direction.`,
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Drag the arrow — feel magnitude and direction',
        caption: `The arrow length represents magnitude $|\\vec{A}|$; the angle it makes with the positive $x$-axis is the direction $\\theta$. Move the arrowhead and watch both values update. Move the tail — the vector is unchanged (free vector rule).`,
        props: { interactive: true, showComponents: false },
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      // ── Two equivalent descriptions ───────────────────────────────────
      `Any 2D vector $\\vec{A}$ can be described completely in two equivalent ways — and you need to be comfortable switching between them. Each form is the right tool for a different situation.`,

      `**Form 1 — Magnitude & angle:** Give $|\\vec{A}|$ (a non-negative number) and $\\theta$ (the angle from the positive $x$-axis, measured counterclockwise). Written as $\\vec{A} = |\\vec{A}|\\angle\\theta$. This form is natural when you have a physical picture — "10 N at 30° above horizontal."`,

      `**Form 2 — Component form:** Break $\\vec{A}$ into its horizontal and vertical parts using trigonometry. The horizontal part is $A_x = |\\vec{A}|\\cos\\theta$ and the vertical part is $A_y = |\\vec{A}|\\sin\\theta$. Then write $\\vec{A} = A_x\\,\\hat{\\imath} + A_y\\,\\hat{\\jmath}$, where $\\hat{\\imath}$ (i-hat) is a unit vector pointing in the $+x$ direction and $\\hat{\\jmath}$ (j-hat) points in $+y$. This form is natural for calculation — every operation reduces to ordinary arithmetic.`,

      'The two conversions you must memorise:',

      `**Polar → Components** (magnitude+angle to $x,y$): apply trig. Think of the right triangle: the vector is the hypotenuse, $A_x$ is the adjacent side, $A_y$ is the opposite side.`,

      `**Components → Polar** (recover magnitude+angle from $x,y$): use Pythagoras for magnitude; use $\\arctan$ for angle, then **check the quadrant manually**.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Polar → Components',
        body:
          'A_x = |\\vec{A}|\\cos\\theta \\quad\\quad A_y = |\\vec{A}|\\sin\\theta',
      },
      {
        type: 'theorem',
        title: 'Components → Polar',
        body:
          '|\\vec{A}| = \\sqrt{A_x^2 + A_y^2} \\quad\\quad \\theta = \\arctan\\!\\left(\\frac{A_y}{A_x}\\right)\\;(\\text{check quadrant!})',
      },
      {
        type: 'warning',
        title: 'The quadrant trap — the #1 mistake',
        body:
          `Your calculator's $\\arctan$ always returns an angle between $-90°$ and $+90°$ (Quadrants I and IV only). If $A_x < 0$, add $180°$ to shift into Quadrant II or III. If $A_x > 0$ and $A_y < 0$, the angle is negative — that's Quadrant IV, which is fine. The fix: **always sketch the vector first**, confirm the quadrant visually, then correct the arctan.`,
      },
      {
        type: 'definition',
        title: 'Unit vectors î and ĵ',
        body:
          `$\\hat{\\imath} = (1,\\,0)$ — points in the $+x$ direction, magnitude 1. $\\hat{\\jmath} = (0,\\,1)$ — points in the $+y$ direction, magnitude 1. In 3D, $\\hat{k}$ points in $+z$. Unit vectors have no units — they are pure direction indicators.`,
      },
      {
        type: 'mnemonic',
        title: 'SOH-CAH-TOA (the bridge between forms)',
        body:
          `For angle $\\theta$ and hypotenuse $r = |\\vec{A}|$:\\n$\\sin\\theta = \\frac{\\text{opp}}{\\text{hyp}} = \\frac{A_y}{r}$ → $A_y = r\\sin\\theta$\\n$\\cos\\theta = \\frac{\\text{adj}}{\\text{hyp}} = \\frac{A_x}{r}$ → $A_x = r\\cos\\theta$\\n$\\tan\\theta = \\frac{\\text{opp}}{\\text{adj}} = \\frac{A_y}{A_x}$ → $\\theta = \\arctan(A_y/A_x)$`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'From arrow to components — and back',
        caption: `Every vector hides a right triangle. $A_x = |\\vec{A}|\\cos\\theta$ is the horizontal leg; $A_y = |\\vec{A}|\\sin\\theta$ is the vertical leg. The hypotenuse is $|\\vec{A}|$. SOH-CAH-TOA converts between forms in both directions.`,
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `Formally, a vector in $\\mathbb{R}^2$ is an **ordered pair** $(A_x, A_y)$ of real numbers. The set $\\mathbb{R}^2$ with vector addition and scalar multiplication forms a **vector space** — a structure we will encounter again in Linear Algebra, where it generalises to $n$ dimensions.`,

      `Two vectors are equal if and only if every component matches: $(A_x, A_y) = (B_x, B_y)$ iff $A_x = B_x$ AND $A_y = B_y$. Position in space is completely irrelevant.`,

      `The **zero vector** $\\vec{0} = (0, 0)$ has magnitude zero. Critically, it has **no defined direction** — writing $\\theta = 0°$ for the zero vector is wrong. Direction is only meaningful for non-zero vectors.`,

      `The **magnitude** (also called the norm or Euclidean length) of $\\vec{A} = (A_x, A_y)$ is $|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}$, which is just the Pythagorean theorem applied to the right triangle formed by the components. In $\\mathbb{R}^3$: $|\\vec{A}| = \\sqrt{A_x^2+A_y^2+A_z^2}$.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Formal equality of vectors',
        body:
          `\\vec{A} = \\vec{B} \\iff A_x = B_x \\text{ and } A_y = B_y \\quad (\\text{position in space is irrelevant})`,
      },
      {
        type: 'definition',
        title: 'Magnitude (Euclidean norm)',
        body:
          '|\\vec{A}| = \\|\\vec{A}\\|_2 = \\sqrt{A_x^2 + A_y^2} \\quad (\\text{always} \\ge 0)',
      },
      {
        type: 'warning',
        title: 'The zero vector has no direction',
        body:
          `$|\\vec{0}| = 0$ and $\\theta$ is undefined. Writing $\\theta = 0°$ for the zero vector is an error — there is no direction to point.`,
      },
      {
        type: 'insight',
        title: 'Why component form beats magnitude-angle for calculation',
        body:
          `Magnitude–angle is intuitive but algebraically awkward. Component form reduces every vector operation — addition, dot product, cross product — to ordinary arithmetic on numbers. The entire machinery of linear algebra and computer graphics is built on component form. Every physics simulation on a computer stores vectors as component arrays.`,
      },
      {
        type: 'insight',
        title: 'Connection to Linear Algebra (preview)',
        body:
          `In Linear Algebra you'll generalise: a vector can live in $\\mathbb{R}^n$ for any $n$. A 3D force vector has components $(F_x, F_y, F_z)$. The rules you learn here — addition, scalar multiplication, dot product — all extend directly to $n$ dimensions without any new ideas.`,
      },
    ],
    proofSteps: [
      {
        title: 'Define both vectors',
        expression: '\\vec{A} = (A_x, A_y), \\quad \\vec{B} = (B_x, B_y)',
        annotation: 'Write each vector as an ordered pair of components. Position on the page is irrelevant.',
      },
      {
        title: 'Assert equality',
        expression: '\\vec{A} = \\vec{B}',
        annotation: 'We want to know what "equal" means for vectors. Start by assuming it and unpacking the consequences.',
      },
      {
        title: 'Expand in basis vectors',
        expression: 'A_x\\hat{\\imath} + A_y\\hat{\\jmath} = B_x\\hat{\\imath} + B_y\\hat{\\jmath}',
        annotation: 'Replace each vector with its unit-vector expansion. î and ĵ are the basis vectors of R².',
      },
      {
        title: 'Collect to zero',
        expression: '(A_x - B_x)\\hat{\\imath} + (A_y - B_y)\\hat{\\jmath} = \\vec{0}',
        annotation: 'Subtract one side from the other. If the sum is zero, each coefficient must be zero independently.',
      },
      {
        title: 'Linear independence',
        expression: 'A_x - B_x = 0 \\quad \\text{and} \\quad A_y - B_y = 0',
        annotation: 'Because î and ĵ are linearly independent, each coefficient must vanish separately.',
      },
      {
        title: 'Conclusion',
        expression: '\\therefore A_x = B_x \\quad \\text{and} \\quad A_y = B_y',
        annotation: 'Two vectors are equal if and only if every component matches — regardless of where the arrows are drawn.',
      },
    ],
    title: 'Proof: vector equality is component-by-component',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Vector equality: component-by-component',
        caption: `$\\vec{A} = \\vec{B}$ if and only if $A_x = B_x$ AND $A_y = B_y$. Two vectors can look different on the page but be equal — the free vector rule. Position does not matter; only magnitude and direction do.`,
      },
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Vectors in Python — from arrows to code',
      cells: [

        {
          cellTitle: 'Vectors as arrays: creation, magnitude, direction',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# In physics: v = 3î + 4ĵ (3 m/s east, 4 m/s north)
# In NumPy:   v = np.array([3.0, 4.0])  — same idea, just a list of components
v = np.array([3.0, 4.0])

# Magnitude: |v| = sqrt(vx^2 + vy^2)  — Pythagorean theorem
magnitude = np.linalg.norm(v)   # works in 2D, 3D, or any dimension

# Direction: theta = arctan2(vy, vx)
# Use arctan2 (two-argument), NOT arctan(vy/vx) — arctan2 handles all 4 quadrants
angle_deg = np.degrees(np.arctan2(v[1], v[0]))

print(f"v = {v} m/s")
print(f"|v| = {magnitude:.4f} m/s  (should be 5.0)")
print(f"theta = {angle_deg:.2f} deg  (should be 53.13 deg)")

# Round-trip verification: recover components from magnitude + angle
Ax = magnitude * np.cos(np.radians(angle_deg))
Ay = magnitude * np.sin(np.radians(angle_deg))
print(f"Round-trip: ({Ax:.4f}, {Ay:.4f})  (should match original)")`,
          prose: [
            `\`np.array([3.0, 4.0])\` is exactly $\\vec{v} = 3\\hat{\\imath} + 4\\hat{\\jmath}$: the first element is the $x$-component, the second is $y$. NumPy stores vectors as arrays of numbers — the same component form used in all physics calculations.`,
            `\`np.linalg.norm(v)\` computes $|\\vec{v}| = \\sqrt{v_x^2 + v_y^2} = \\sqrt{9+16} = 5$. This is the Pythagorean theorem applied to the right triangle formed by the components. The function works in any dimension — just pass a longer array for 3D.`,
            `\`np.arctan2(vy, vx)\` — note the argument order is (y, x), not (x, y). This two-argument version correctly handles all four quadrants, returning angles from −180° to +180°. The single-argument \`np.arctan(vy/vx)\` only returns angles from −90° to +90° and gives wrong answers in Quadrants II and III.`,
          ],
        },
        {
          cellTitle: 'Visualizing vector components with matplotlib',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Three vectors to visualize: the vector, its x-component, and its y-component
v = np.array([3.0, 4.0])
vx = np.array([v[0], 0.0])   # horizontal leg of the right triangle
vy_start = np.array([v[0], 0.0])   # vertical leg starts at end of vx

fig, ax = plt.subplots(figsize=(6, 6))
ax.set_aspect('equal')

# Draw the full vector v in blue
ax.annotate('', xy=v, xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='blue', lw=2.5))
ax.text(v[0]/2 + 0.2, v[1]/2 + 0.1, f'|v| = {np.linalg.norm(v):.1f}', color='blue', fontsize=11)

# Draw x-component in red
ax.annotate('', xy=vx, xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='red', lw=2))
ax.text(v[0]/2, -0.4, f'vx = {v[0]:.1f}', color='red', ha='center', fontsize=11)

# Draw y-component in green (starts at end of x-component)
ax.annotate('', xy=v, xytext=vy_start,
            arrowprops=dict(arrowstyle='->', color='green', lw=2))
ax.text(v[0] + 0.15, v[1]/2, f'vy = {v[1]:.1f}', color='green', fontsize=11)

# Angle arc
theta = np.linspace(0, np.arctan2(v[1], v[0]), 30)
ax.plot(0.6*np.cos(theta), 0.6*np.sin(theta), 'k-', lw=1)
ax.text(0.7, 0.25, f'θ = {np.degrees(np.arctan2(v[1], v[0])):.1f}°', fontsize=10)

ax.set_xlim(-0.5, 4.5); ax.set_ylim(-0.7, 5)
ax.axhline(0, color='k', lw=0.7); ax.axvline(0, color='k', lw=0.7)
ax.set_xlabel('x (east)'); ax.set_ylabel('y (north)')
ax.set_title('Vector = x-component (red) + y-component (green)')
ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.savefig('vector_components.png', dpi=120); plt.show()`,
          prose: [
            `\`ax.annotate('', xy=endpoint, xytext=startpoint, arrowprops=...)\` draws an arrow from \`xytext\` to \`xy\`. The three arrows show the three sides of the right triangle: the full vector $\\vec{v}$ (blue), the $x$-component (red, horizontal), and the $y$-component (green, vertical). This is the geometric meaning of $\\vec{v} = v_x\\hat{\\imath} + v_y\\hat{\\jmath}$.`,
            `The red arrow goes from origin to $(v_x, 0)$; the green arrow starts where red ends and goes up to $(v_x, v_y)$. Together they trace the two legs of the right triangle whose hypotenuse is $\\vec{v}$. This is why magnitude $= \\sqrt{v_x^2 + v_y^2}$ — it is literally the Pythagorean theorem.`,
            `The angle arc marks $\\theta = \\arctan(v_y/v_x) \\approx 53.1°$ — the angle between the vector and the positive $x$-axis. Every arrow in a physics diagram can be decomposed this way: find the triangle, read off the components.`,
          ],
        },
        {
          cellTitle: 'All four quadrants: signs of components',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Four vectors, one per quadrant, all magnitude 5
cases = [
    (5, 30,  'Quadrant I',   'blue'),
    (5, 150, 'Quadrant II',  'red'),
    (5, 210, 'Quadrant III', 'green'),
    (5, 330, 'Quadrant IV',  'orange'),
]

fig, axes = plt.subplots(2, 2, figsize=(9, 9))
axes = axes.flatten()

for ax, (mag, angle_deg, label, color) in zip(axes, cases):
    theta = np.radians(angle_deg)
    vx = mag * np.cos(theta)   # A_x = |A| cos(theta)
    vy = mag * np.sin(theta)   # A_y = |A| sin(theta)

    ax.set_aspect('equal'); ax.set_xlim(-6, 6); ax.set_ylim(-6, 6)
    ax.axhline(0, color='k', lw=0.7); ax.axvline(0, color='k', lw=0.7)
    ax.annotate('', xy=(vx, vy), xytext=(0, 0),
                arrowprops=dict(arrowstyle='->', color=color, lw=2.5))
    # Component legs
    ax.plot([0, vx], [0, 0], color=color, ls='--', lw=1.5, alpha=0.6)
    ax.plot([vx, vx], [0, vy], color=color, ls='--', lw=1.5, alpha=0.6)
    ax.set_title(f'{label}: {angle_deg}°\\nvx={vx:.2f}, vy={vy:.2f}', fontsize=10)
    ax.grid(True, alpha=0.2)
    # Verify magnitude
    assert abs(np.sqrt(vx**2 + vy**2) - mag) < 1e-9

print("Signs of components by quadrant:")
for mag, angle, label, _ in cases:
    vx = mag * np.cos(np.radians(angle))
    vy = mag * np.sin(np.radians(angle))
    print(f"  {label} ({angle}°): vx={vx:+.2f}, vy={vy:+.2f}")

plt.tight_layout(); plt.savefig('four_quadrants.png', dpi=120); plt.show()`,
          prose: [
            `For each vector, $v_x = |v|\\cos\\theta$ and $v_y = |v|\\sin\\theta$ — the same two formulas regardless of quadrant. The sign of each component follows automatically from the sign of cosine and sine at that angle: Q1 (+,+), Q2 (−,+), Q3 (−,−), Q4 (+,−).`,
            `The dashed lines are the component "shadows" — projections of the vector onto each axis. This is the geometric meaning of decomposition: finding how much of the vector lies along each axis. Even for Q3 (both negative), the formulas give the right answer without any special cases.`,
            `The \`assert\` line verifies that $\\sqrt{v_x^2 + v_y^2} = 5$ for all four vectors. This is a useful debugging habit: after computing components, always check that their magnitude recovers the original value. If it doesn't, a formula is wrong.`,
          ],
        },
        {
          cellTitle: 'Challenge: Quadrant-safe angle computation',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A force F has components Fx = -6.0 N, Fy = 8.0 N  (Quadrant II)
# Complete the function that returns magnitude AND direction in degrees
def describe_vector(vx, vy):
    magnitude = ___           # Pythagorean theorem
    angle_deg = ___           # Use arctan2, convert to degrees
    return magnitude, angle_deg

mag, ang = describe_vector(-6.0, 8.0)
print(f"|F| = {mag:.2f} N")
print(f"theta = {ang:.2f} deg  (should be 126.87 for Q2)")

# Test it on all four quadrants
test_cases = [(3, 4, 5, 53.13), (-3, 4, 5, 126.87), (-3, -4, 5, -126.87), (3, -4, 5, -53.13)]
for vx, vy, exp_mag, exp_ang in test_cases:
    m, a = describe_vector(vx, vy)
    print(f"({vx:+}, {vy:+}): |v|={m:.2f} (exp {exp_mag}), ang={a:.2f} (exp {exp_ang})")`,
          prose: [
            `Fill in the two blanks: magnitude uses \`np.linalg.norm\` or \`np.sqrt(vx**2 + vy**2)\`; angle uses \`np.degrees(np.arctan2(vy, vx))\`. Note the argument order for \`arctan2\`: (y, x), not (x, y).`,
            `The test cases cover all four quadrants. The correct answers for $(−3, 4)$ is $126.87°$ — if you used \`np.arctan(4/−3)\` instead of \`arctan2\`, you'd get $−53.13°$, which is the wrong quadrant entirely. This is why \`arctan2\` exists.`,
            `Once this function works, you can describe ANY 2D vector — regardless of its quadrant — with two numbers: magnitude and angle. This is the fundamental operation you'll use throughout physics when converting between component form and magnitude-direction form.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Vectors in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'Vectors as arrays: creation, magnitude, direction',
          type: 'code',
          language: 'matlab',
          code: `% In physics: v = 3i-hat + 4j-hat  (3 m/s east, 4 m/s north)
% In MATLAB:  v = [3.0, 4.0]  — a row vector (or column vector [3;4])
v = [3.0, 4.0];

% Magnitude: norm(v) = sqrt(vx^2 + vy^2)
magnitude = norm(v);   % same as sqrt(v(1)^2 + v(2)^2)

% Direction: atan2(vy, vx) — note argument order (y, x)
angle_deg = rad2deg(atan2(v(2), v(1)));   % rad2deg converts to degrees

fprintf('v = [%.1f, %.1f] m/s\\n', v(1), v(2));
fprintf('|v| = %.4f m/s  (should be 5.0)\\n', magnitude);
fprintf('theta = %.2f deg  (should be 53.13)\\n', angle_deg);

% Round-trip: recover components from magnitude + angle
Ax = magnitude * cos(deg2rad(angle_deg));   % deg2rad: degrees -> radians
Ay = magnitude * sin(deg2rad(angle_deg));
fprintf('Round-trip: (%.4f, %.4f)  (should match original)\\n', Ax, Ay);`,
          prose: [
            `In MATLAB, \`v = [3.0, 4.0]\` creates a row vector whose elements are the x and y components. \`v(1)\` is the x-component and \`v(2)\` is the y-component (MATLAB uses 1-based indexing, unlike Python's 0-based). \`norm(v)\` computes $|\\vec{v}| = \\sqrt{v_x^2 + v_y^2}$ — the same formula as NumPy's \`linalg.norm\`.`,
            `\`atan2(y, x)\` is MATLAB's quadrant-safe arctangent — argument order is (y, x), matching NumPy's \`arctan2(y, x)\`. \`rad2deg\` converts the radian result to degrees. Use \`deg2rad\` for the reverse direction when feeding degrees into \`sin\` or \`cos\`.`,
            `The round-trip check computes $A_x = |v|\\cos\\theta$ and $A_y = |v|\\sin\\theta$ to recover the original components. If these match the input \`[3.0, 4.0]\`, the forward (components → polar) and inverse (polar → components) conversions are consistent.`,
          ],
        },
        {
          cellTitle: 'Visualizing vector components with quiver',
          type: 'code',
          language: 'matlab',
          code: `v = [3.0, 4.0];
vx_comp = [v(1), 0];        % x-component as a vector from origin
vy_start = [v(1), 0];       % y-component starts where x ends

figure; hold on; axis equal;
xlim([-0.5, 4.5]); ylim([-0.7, 5]);

% Full vector (blue): quiver(x0, y0, dx, dy)
quiver(0, 0, v(1), v(2), 'b', 'LineWidth', 2.5, 'MaxHeadSize', 0.5, 'DisplayName', sprintf('|v|=%.1f', norm(v)));

% x-component (red, horizontal leg)
quiver(0, 0, v(1), 0, 'r', 'LineWidth', 2, 'MaxHeadSize', 0.5, 'DisplayName', sprintf('vx=%.1f', v(1)));

% y-component (green, vertical leg from end of x-component)
quiver(v(1), 0, 0, v(2), 'g', 'LineWidth', 2, 'MaxHeadSize', 0.5, 'DisplayName', sprintf('vy=%.1f', v(2)));

% Angle arc
theta_vec = linspace(0, atan2(v(2), v(1)), 30);
plot(0.6*cos(theta_vec), 0.6*sin(theta_vec), 'k-', 'LineWidth', 1);
text(0.7, 0.25, sprintf('\\theta = %.1f°', rad2deg(atan2(v(2), v(1)))), 'FontSize', 10);

xline(0, 'k-', 'LineWidth', 0.7); yline(0, 'k-', 'LineWidth', 0.7);
xlabel('x (east)'); ylabel('y (north)');
title('Vector = x-component (red) + y-component (green)');
legend; grid on;`,
          prose: [
            `\`quiver(x0, y0, dx, dy)\` draws an arrow starting at $(x_0, y_0)$ with length $(dx, dy)$. The three \`quiver\` calls draw the full vector (blue), its x-component (red), and its y-component (green) — the same right-triangle decomposition as in the Python version.`,
            `The green arrow starts at \`(v(1), 0)\` — the end of the red arrow — and goes up by \`v(2)\`. This shows that adding the x-component vector and the y-component vector head-to-tail gives the original vector $\\vec{v}$. That is the geometric meaning of $\\vec{v} = v_x\\hat{\\imath} + v_y\\hat{\\jmath}$.`,
            `The angle arc is drawn by plotting parametric points \`(0.6*cos(theta), 0.6*sin(theta))\` from 0 to $\\theta$. The radius 0.6 is chosen to be visible without overlapping the arrows. This is a standard technique for marking angles in MATLAB plots.`,
          ],
        },
        {
          cellTitle: 'All four quadrants: signs of components',
          type: 'code',
          language: 'matlab',
          code: `% Four vectors, one per quadrant, all magnitude 5
angles = [30, 150, 210, 330];
labels = {'Q1 (+,+)', 'Q2 (-,+)', 'Q3 (-,-)', 'Q4 (+,-)'};
colors = {'b', 'r', 'g', [1 0.5 0]};   % blue, red, green, orange

figure;
for i = 1:4
    subplot(2, 2, i); hold on; axis equal;
    xlim([-6, 6]); ylim([-6, 6]);
    xline(0, 'k-', 'LineWidth', 0.7); yline(0, 'k-', 'LineWidth', 0.7);

    theta = deg2rad(angles(i));
    vx = 5 * cos(theta);   % Ax = |A| cos(theta)
    vy = 5 * sin(theta);   % Ay = |A| sin(theta)

    % Full vector
    quiver(0, 0, vx, vy, colors{i}, 'LineWidth', 2.5, 'MaxHeadSize', 0.4);
    % Component dashed lines
    plot([0, vx], [0, 0], '--', 'Color', colors{i}, 'LineWidth', 1.5, 'Alpha', 0.6);
    plot([vx, vx], [0, vy], '--', 'Color', colors{i}, 'LineWidth', 1.5, 'Alpha', 0.6);

    title(sprintf('%s  %d°\\nvx=%.2f, vy=%.2f', labels{i}, angles(i), vx, vy), 'FontSize', 9);
    grid on;
    assert(abs(sqrt(vx^2 + vy^2) - 5) < 1e-9, 'Magnitude mismatch');
end`,
          prose: [
            `\`deg2rad(angles(i))\` converts degrees to radians for \`cos\` and \`sin\` (which always expect radians in MATLAB/Octave). The formulas $v_x = 5\\cos\\theta$ and $v_y = 5\\sin\\theta$ give the correct signed components for any quadrant — no special cases needed.`,
            `The subplot layout (2×2 grid) puts each quadrant in its own panel. The dashed lines trace the component legs of the right triangle. Notice the signs: in Q2 (150°), cos is negative so $v_x < 0$; in Q3 (210°), both are negative; in Q4 (330°), sin is negative so $v_y < 0$.`,
            `The \`assert\` statement verifies $\\sqrt{v_x^2 + v_y^2} = 5$ for every case. If the formula were wrong (e.g., using \`sind\` and \`cosd\` inconsistently), the assert would catch it. MATLAB's \`assert\` throws an error if the condition is false — useful for debugging.`,
          ],
        },
        {
          cellTitle: 'Challenge: Quadrant-safe angle computation',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `function [magnitude, angle_deg] = describe_vector(vx, vy)
    magnitude = ___;          % norm or sqrt formula
    angle_deg = ___;          % atan2, convert to degrees
end

[mag, ang] = describe_vector(-6.0, 8.0);
fprintf('|F| = %.2f N\\n', mag);
fprintf('theta = %.2f deg  (should be 126.87 for Q2)\\n', ang);

% Test all four quadrants
test_cases = [3, 4, 5, 53.13; -3, 4, 5, 126.87; -3, -4, 5, -126.87; 3, -4, 5, -53.13];
for i = 1:size(test_cases, 1)
    [m, a] = describe_vector(test_cases(i,1), test_cases(i,2));
    fprintf('(%+.0f,%+.0f): |v|=%.2f (exp %.2f), ang=%.2f (exp %.2f)\\n', ...
            test_cases(i,1), test_cases(i,2), m, test_cases(i,3), a, test_cases(i,4));
end`,
          prose: [
            `Fill the two blanks: \`magnitude = norm([vx, vy])\` (or \`sqrt(vx^2 + vy^2)\`); \`angle_deg = rad2deg(atan2(vy, vx))\`. The argument order for \`atan2\` is (y, x) in both MATLAB and Python.`,
            `The test matrix has one row per quadrant. The key test is the Q2 case $(-3, 4)$: \`atan2(4, -3)\` returns $\\approx 2.21$ rad $= 126.87°$, while \`atan(-4/3)\` returns $-53.13°$ — the wrong quadrant by 180°. This is why \`atan2\` exists.`,
            `Once this function works correctly for all four quadrants, you have the fundamental tool for every physics problem involving vectors: given components, find magnitude and direction. This exact computation appears in projectile motion, force decomposition, and electromagnetic field problems.`,
          ],
        },
      ],
    },
  },

  // ── Examples ─────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-001-ex1',
      title: 'Classifying quantities as vector or scalar',
      problem:
        `\\text{Classify each quantity: (a) } 9.8\\,m/s^2 \\text{ downward, (b) } 25\\,°C, \\text{ (c) } 60\\,km/h \\text{ northeast, (d) } 5\\,kg, (e) \\text{ kinetic energy } 200\\,J.`,
      steps: [
        {
          expression: '\\text{(a) } \\vec{g} = 9.8\\,m/s^2 \\text{ downward} \\Rightarrow \\textbf{vector}',
          annotation:
            `Has a direction (downward). Gravitational acceleration is a vector — at the surface of Earth it always points toward the centre.`,
        },
        {
          expression: '\\text{(b) } T = 25\\,°C \\Rightarrow \\textbf{scalar}',
          annotation: 'Temperature is a pure number — there is no direction associated with being 25 °C.',
        },
        {
          expression: '\\text{(c) } \\vec{v} = 60\\,km/h \\text{ northeast} \\Rightarrow \\textbf{vector}',
          annotation: '"Speed northeast" is velocity — magnitude 60 km/h plus a direction (northeast).',
        },
        {
          expression: '\\text{(d) } m = 5\\,kg \\Rightarrow \\textbf{scalar}',
          annotation:
            `Mass is a scalar. Weight (the gravitational force on that mass) is a vector — it pulls downward with magnitude $mg$.`,
        },
        {
          expression: '\\text{(e) } KE = 200\\,J \\Rightarrow \\textbf{scalar}',
          annotation:
            `Energy is always a scalar — it has a magnitude (how much energy) but no spatial direction. The velocity that created it is a vector; the energy itself is not.`,
        },
      ],
      conclusion:
        `The test: does the quantity require a direction to be fully specified? If yes → vector. If no → scalar. When in doubt, think about whether reversing a direction would change the physical situation.`,
    },
    {
      id: 'ch1-001-ex2',
      title: 'Finding components from magnitude and angle',
      problem:
        `\\text{A displacement vector has magnitude } |\\vec{d}| = 8.0\\,m \\text{ at } \\theta = 30° \\text{ above the positive } x\\text{-axis. Find } d_x \\text{ and } d_y.`,
      steps: [
        {
          expression: 'd_x = |\\vec{d}|\\cos\\theta = 8.0\\cos 30°',
          annotation:
            `The $x$-component is the adjacent side of the right triangle: magnitude × cos(angle). Think of projecting the arrow onto the horizontal axis.`,
        },
        {
          expression: 'd_x = 8.0 \\times \\frac{\\sqrt{3}}{2} = 4\\sqrt{3} \\approx 6.93\\,m',
          annotation: '$\\cos 30° = \\sqrt{3}/2 \\approx 0.866$. The arrow reaches 6.93 m in the x-direction.',
        },
        {
          expression: 'd_y = |\\vec{d}|\\sin\\theta = 8.0\\sin 30°',
          annotation:
            `The $y$-component is the opposite side: magnitude × sin(angle). Think of projecting the arrow onto the vertical axis.`,
        },
        {
          expression: 'd_y = 8.0 \\times 0.5 = 4.0\\,m',
          annotation: '$\\sin 30° = 0.5$ exactly.',
        },
        {
          expression:
            '\\text{Check: } \\sqrt{d_x^2 + d_y^2} = \\sqrt{(4\\sqrt{3})^2 + 4^2} = \\sqrt{48 + 16} = \\sqrt{64} = 8.0\\,m \\checkmark',
          annotation:
            `Always verify by recovering the magnitude from components. If it doesn't match, you've made an error somewhere.`,
        },
      ],
      conclusion:
        `$d_x \\approx 6.93\\,m$, $d_y = 4.0\\,m$. Always verify: $\\sqrt{d_x^2+d_y^2}$ should recover the original magnitude.`,
    },
    {
      id: 'ch1-001-ex3',
      title: 'Recovering magnitude and angle from components',
      problem:
        `\\text{A force vector has components } F_x = -3.0\\,N \\text{ and } F_y = 4.0\\,N. \\text{Find } |\\vec{F}| \\text{ and the direction angle } \\theta.`,
      steps: [
        {
          expression: '|\\vec{F}| = \\sqrt{F_x^2 + F_y^2} = \\sqrt{(-3.0)^2 + (4.0)^2}',
          annotation:
            `Apply the Pythagorean formula. Squaring removes the negative sign — magnitude is always non-negative.`,
        },
        {
          expression: '|\\vec{F}| = \\sqrt{9.0 + 16.0} = \\sqrt{25.0} = 5.0\\,N',
          annotation: 'Magnitude = 5.0 N. This is a 3-4-5 right triangle.',
        },
        {
          expression:
            '\\theta_{\\text{ref}} = \\arctan\\!\\left(\\frac{|F_y|}{|F_x|}\\right) = \\arctan\\!\\left(\\frac{4.0}{3.0}\\right) \\approx 53.1°',
          annotation:
            `Find the reference angle using absolute values. This is the angle from the nearest x-axis. Then use the signs of the components to determine the quadrant.`,
        },
        {
          expression:
            'F_x < 0,\\; F_y > 0 \\Rightarrow \\text{Quadrant II} \\Rightarrow \\theta = 180° - 53.1° = 126.9°',
          annotation:
            `The vector points left ($F_x < 0$) and up ($F_y > 0$) — that's Quadrant II. In Quadrant II, the true angle = 180° − reference angle.`,
        },
      ],
      conclusion:
        `$|\\vec{F}| = 5.0\\,N$ at $\\theta \\approx 127°$ from the positive $x$-axis. If you had just typed $\\arctan(4/−3)$ into your calculator, you would have gotten $-53.1°$, which is Quadrant IV — the wrong answer. Always sketch first.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-001-ch1',
      difficulty: 'easy',
      problem:
        '\\text{Which of the following are vectors? (a) kinetic energy, (b) momentum, (c) temperature, (d) distance, (e) weight.}',
      hint: 'Ask for each: does specifying it in the opposite direction change the physical situation?',
      walkthrough: [
        {
          expression: '\\text{(a) KE} = \\tfrac{1}{2}mv^2 \\Rightarrow \\textbf{scalar}',
          annotation:
            `Energy has no direction. It's a single number (in joules). You can't have "kinetic energy pointing north."`,
        },
        {
          expression: '\\text{(b) } \\vec{p} = m\\vec{v} \\Rightarrow \\textbf{vector}',
          annotation:
            `Momentum inherits the direction of velocity. $\\vec{p} = m\\vec{v}$ — multiply a scalar (mass) by a vector (velocity) and you get a vector (momentum).`,
        },
        {
          expression: '\\text{(c) Temperature} \\Rightarrow \\textbf{scalar}',
          annotation:
            `No direction. A temperature gradient (how fast temperature changes across space) is a vector, but temperature itself is scalar.`,
        },
        {
          expression: '\\text{(d) Distance} \\Rightarrow \\textbf{scalar}',
          annotation:
            `Total path length — always positive, no direction. Displacement (the vector version) adds direction and allows negatives.`,
        },
        {
          expression: '\\text{(e) Weight } \\vec{W} = m\\vec{g} \\Rightarrow \\textbf{vector}',
          annotation:
            `Weight is the gravitational force on an object — it points downward (toward Earth's centre). Mass is the scalar; weight is the vector.`,
        },
      ],
      answer: '\\text{Vectors: (b) momentum, (e) weight. Scalars: (a) KE, (c) temperature, (d) distance.}',
    },
    {
      id: 'ch1-001-ch2',
      difficulty: 'easy',
      problem:
        `\\text{A velocity vector has } v_x = 5.0\\,m/s \\text{ and } v_y = 5.0\\,m/s. \\text{Find the speed } |\\vec{v}| \\text{ and direction } \\theta.`,
      hint:
        `Speed = $\\sqrt{v_x^2 + v_y^2}$. Both components positive → Quadrant I. The angle $\\arctan(5/5) = \\arctan(1) = 45°$ — no quadrant correction needed.`,
      walkthrough: [
        {
          expression: '|\\vec{v}| = \\sqrt{5.0^2 + 5.0^2} = \\sqrt{50} = 5\\sqrt{2} \\approx 7.07\\,m/s',
          annotation: 'Pythagorean theorem. $\\sqrt{50} = \\sqrt{25 \\times 2} = 5\\sqrt{2}$.',
        },
        {
          expression: '\\theta = \\arctan(5.0/5.0) = \\arctan(1) = 45°',
          annotation:
            'Both components are positive → Quadrant I. $\\arctan(1) = 45°$ exactly, no correction needed.',
        },
      ],
      answer: '|\\vec{v}| = 5\\sqrt{2}\\,m/s \\approx 7.07\\,m/s \\text{ at } 45°',
    },
    {
      id: 'ch1-001-ch3',
      difficulty: 'medium',
      problem:
        `\\text{Vector } \\vec{A} \\text{ has magnitude } 10 \\text{ at } 210°. \\text{Find its components. Sketch the vector and verify the quadrant.}`,
      hint:
        `$210° = 180° + 30°$, so the vector is in Quadrant III — both components negative. Use $A_x = 10\\cos210°$ and $A_y = 10\\sin210°$.`,
      walkthrough: [
        {
          expression: 'A_x = 10\\cos210° = 10\\times(-\\tfrac{\\sqrt{3}}{2}) = -5\\sqrt{3} \\approx -8.66',
          annotation:
            `$\\cos210° = -\\cos30° = -\\sqrt{3}/2$ (the cosine is negative in Quadrants II and III). Negative $A_x$ means the arrow points to the left.`,
        },
        {
          expression: 'A_y = 10\\sin210° = 10\\times(-\\tfrac{1}{2}) = -5.0',
          annotation:
            `$\\sin210° = -\\sin30° = -1/2$ (sine is negative in Quadrants III and IV). Negative $A_y$ means the arrow points downward.`,
        },
        {
          expression:
            '\\text{Check: }\\sqrt{(-8.66)^2+(-5.0)^2} = \\sqrt{75+25} = \\sqrt{100} = 10\\checkmark',
          annotation:
            `Magnitude checks out. Both components negative confirms Quadrant III. The vector points down-left, which is consistent with an angle of 210° (southwest).`,
        },
      ],
      answer: 'A_x = -5\\sqrt{3}\\approx -8.66,\\quad A_y = -5.0',
    },
    {
      id: 'ch1-001-ch4',
      difficulty: 'hard',
      problem:
        `\\text{Two vectors: } \\vec{A} = (3, 4) \\text{ and } \\vec{B} \\text{ has magnitude } 5 \\text{ at } 180°. \\text{ Are they equal? What if } \\theta = 53.13°\\text{? Explain why equal magnitudes do not guarantee equality.}`,
      hint:
        `Convert $\\vec{B}$ to component form for each angle. Apply the formal definition: vectors are equal iff every component matches.`,
      walkthrough: [
        {
          expression: '\\vec{B}_{180°}: B_x = 5\\cos180° = -5,\\quad B_y = 5\\sin180° = 0',
          annotation: '$\\cos180° = -1$, $\\sin180° = 0$. So $\\vec{B}_{180°} = (-5, 0)$.',
        },
        {
          expression: '\\vec{A} = (3,\\,4) \\neq (-5,\\,0) = \\vec{B}_{180°}',
          annotation:
            `The $x$-components alone differ (3 vs −5). One mismatch is sufficient. Note: $|\\vec{A}| = 5 = |\\vec{B}|$ — same magnitude, completely different vectors.`,
        },
        {
          expression: '\\vec{B}_{53.13°}: B_x = 5\\cos53.13° = 5(0.6) = 3.0,\\quad B_y = 5\\sin53.13° = 5(0.8) = 4.0',
          annotation:
            `$\\sin53.13° \\approx 0.8$, $\\cos53.13° \\approx 0.6$ (a 3-4-5 triangle scaled by 1). So $\\vec{B}_{53.13°} = (3, 4) = \\vec{A}$ ✓`,
        },
        {
          expression: '\\therefore\\; \\vec{A} = \\vec{B}_{53.13°}\\text{ because every component matches}',
          annotation:
            `Equal magnitude AND equal direction → equal vectors. Equal magnitude alone is not sufficient — direction must also match.`,
        },
      ],
      answer:
        `$\\vec{A} \\neq \\vec{B}_{180°}$ (same magnitude, different direction). $\\vec{A} = \\vec{B}_{53.13°}$ (same magnitude AND same direction).`,
    },
    {
      id: 'ch1-001-ch5',
      difficulty: 'hard',
      problem:
        `\\text{A boat crosses a river. It aims perpendicular to the bank at } 4\\,m/s. \\text{The current flows at } 3\\,m/s \\text{ along the bank. Find the boat's actual speed and the angle it drifts from its intended path.}`,
      hint:
        `Treat "intended velocity" and "current" as two vectors and add them. The boat's actual velocity is the vector sum.`,
      walkthrough: [
        {
          expression: '\\vec{v}_{\\text{intended}} = (0, 4)\\,m/s \\quad \\vec{v}_{\\text{current}} = (3, 0)\\,m/s',
          annotation:
            `Set up coordinates: x = along river, y = perpendicular to bank. The boat aims straight across: $v_y = 4$. The current pushes sideways: $v_x = 3$.`,
        },
        {
          expression: '\\vec{v}_{\\text{actual}} = (0+3,\\; 4+0) = (3,\\; 4)\\,m/s',
          annotation: 'Add the vectors component by component — this is vector addition.',
        },
        {
          expression: '|\\vec{v}_{\\text{actual}}| = \\sqrt{3^2+4^2} = \\sqrt{25} = 5\\,m/s',
          annotation: 'The boat actually moves at 5 m/s — faster than 4 m/s because the current adds to it.',
        },
        {
          expression: '\\theta = \\arctan(3/4) \\approx 36.87°\\text{ downstream}',
          annotation:
            `The drift angle from the intended direction (y-axis). The boat lands 36.87° downstream of where it aimed.`,
        },
      ],
      answer: '\\text{Actual speed } 5\\,m/s\\text{ at } \\approx37°\\text{ downstream from perpendicular.}',
    },
  ],

  // ── Pattern-recognition viz (registered in VizFrame.jsx) ─────────────────
  patternViz: {
    id: 'VectorPatternSpotter',
    placement: 'math',
    title: 'Spot the vector — 8 quick rounds',
    mathBridge:
      `Each round shows a physical quantity. Decide: vector or scalar? After you answer, the viz shows the arrow (or absence of one) and explains why.`,
    caption:
      'Build recognition before the examples so the worked solutions feel obvious.',
    props: {
      rounds: [
        { quantity: '12\\,m/s\\text{ west}', answer: 'vector', reason: 'velocity carries direction — west is the direction' },
        { quantity: '100\\,J', answer: 'scalar', reason: 'energy has no direction — it\'s a single number' },
        { quantity: '9.8\\,m/s^2\\text{ downward}', answer: 'vector', reason: 'acceleration is a vector — downward specifies direction' },
        { quantity: '273\\,K', answer: 'scalar', reason: 'temperature is scalar — no direction in "being 273 kelvin"' },
        { quantity: '50\\,N\\text{ at }30°', answer: 'vector', reason: 'force is a vector — "at 30°" is the direction' },
        { quantity: '3.0\\,kg', answer: 'scalar', reason: 'mass is scalar; weight (mg downward) is vector' },
        { quantity: '\\Delta\\vec{r} = 5\\,m\\text{ north}', answer: 'vector', reason: 'displacement is a vector by definition' },
        { quantity: '60\\,W', answer: 'scalar', reason: 'power (rate of doing work) is scalar' },
      ],
    },
  },

  misconceptions: [
    {
      id: 'p1-ch1-001-mis1',
      misconception: 'Speed and velocity are the same thing — just different words for how fast something moves.',
      why: `Students learn "velocity" as a synonym for "speed" in everyday language, and carry that into physics. The distinction only becomes clear when direction matters — which is most of the time.`,
      correction: `Speed is a scalar (magnitude only). Velocity is a vector (magnitude + direction). A car going around a circular track at constant speed has constant speed but changing velocity — because its direction changes every instant. This is why the car is accelerating even though it never speeds up or slows down.`,
      correctionExample: `60 mph is a speed. 60 mph north is a velocity. After making a U-turn at 60 mph, the speed is still 60 mph, but the velocity has reversed direction — it is now 60 mph south. The two velocities have the same magnitude but opposite direction: they are different vectors.`,
    },
    {
      id: 'p1-ch1-001-mis2',
      misconception: 'Two vectors with the same magnitude are equal.',
      why: `Students focus on the magnitude formula $|\\vec{A}| = \\sqrt{A_x^2+A_y^2}$ and forget that direction is also required for equality.`,
      correction: `Vectors are equal only if BOTH magnitude AND direction match — equivalently, all components must be equal: $\\vec{A} = \\vec{B}$ iff $A_x = B_x$ AND $A_y = B_y$. Equal magnitudes with different directions are different vectors entirely.`,
      correctionExample: `$\\vec{A} = (3, 4)$ and $\\vec{B} = (-3, 4)$ both have magnitude 5. But $A_x = 3 \\neq -3 = B_x$, so $\\vec{A} \\neq \\vec{B}$. One points into Q1 (northeast), the other into Q2 (northwest).`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-001-tp1',
      prompt: `Your phone's GPS reports your location as latitude/longitude coordinates $(x, y)$, and your velocity as speed + compass heading. When the navigation app calculates your arrival time, it needs to know your velocity vector components in the east-north coordinate system. How does it convert "45 mph at heading 310°" into components?`,
      connection: `Compass heading is measured clockwise from north; physics uses counterclockwise from east. The conversion is $\\theta_{physics} = 90° - \\theta_{heading}$. Then $v_x = v\\cos\\theta_{physics}$ (east) and $v_y = v\\sin\\theta_{physics}$ (north). Every navigation system uses exactly this component decomposition to compute position updates.`,
    },
    {
      id: 'p1-ch1-001-tp2',
      prompt: `A structural engineer needs to check whether a bridge cable can support a load. The cable exerts a tension of 50 kN at 40° above horizontal. What are the horizontal and vertical components of this force? Why does the engineer care more about the vertical component than the horizontal one for checking whether the bridge deck sags?`,
      connection: `$F_x = 50\\cos40° \\approx 38.3$ kN (horizontal), $F_y = 50\\sin40° \\approx 32.1$ kN (vertical). The vertical component directly opposes the weight of the bridge deck, so it determines whether the structure sags. The horizontal component creates tension along the deck and must be handled by anchor points. Force decomposition into components is the first step in every structural analysis.`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-001-dbg1',
      error: `A student computes the direction of $\\vec{F} = (-6, 8)$ N by typing \`atan(-8/6)\` into their calculator and gets $-53.13°$.`,
      explanation: `\`atan(y/x)\` always returns angles between $-90°$ and $+90°$ (Quadrants I and IV only). For $\\vec{F} = (-6, 8)$, which is in Quadrant II, the correct answer is $180° - 53.13° = 126.87°$. The single-argument arctangent loses the sign information of $x$ and $y$ separately.`,
      fix: `Always use \`atan2(y, x)\` (Python: \`np.arctan2\`, calculator: \`atan2\`). It takes $y$ and $x$ as separate arguments, preserves their individual signs, and returns the correct angle for all four quadrants. For $(-6, 8)$: \`atan2(8, -6)\` returns $126.87°$.`,
    },
    {
      id: 'p1-ch1-001-dbg2',
      error: `A student needs the speed of an object with velocity $\\vec{v} = (5, -3)$ m/s. They add the components: $5 + (-3) = 2$ m/s.`,
      explanation: `Speed is the MAGNITUDE of velocity, not the sum of components. Adding components is not a meaningful operation for recovering magnitude — it would give different answers depending on the choice of coordinate system (rotate the axes and the components change, but the magnitude doesn't).`,
      fix: `Use the Pythagorean formula: $|\\vec{v}| = \\sqrt{v_x^2 + v_y^2} = \\sqrt{25 + 9} = \\sqrt{34} \\approx 5.83$ m/s. Always square both components, add, then take the square root. Negative components square to positive — $(-3)^2 = 9$.`,
    },
  ],

  mastery: {
    targetLevel: `Identify vector vs. scalar quantities, convert fluently between component form $(A_x, A_y)$ and polar form $(|A|, \\theta)$, apply the quadrant-safe arctangent, and explain the free vector rule.`,
    checklistItems: [
      `Can correctly classify any physical quantity as vector or scalar, with justification`,
      `Can compute $A_x = |\\vec{A}|\\cos\\theta$ and $A_y = |\\vec{A}|\\sin\\theta$ for any angle`,
      `Can compute $|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}$ and identify the correct quadrant for $\\theta$`,
      `Uses \`atan2(y, x)\` (not \`atan(y/x)\`) to find angles — and knows WHY`,
      `Can state the free vector rule and explain why position does not change a vector`,
      `Can verify component calculations by round-tripping back to the original magnitude`,
    ],
    commonStruggles: [
      `Using \`arctan(vy/vx)\` instead of \`arctan2(vy, vx)\` — gets wrong quadrant for Q2 and Q3`,
      `Confusing speed (scalar) and velocity (vector) — especially on conceptual questions`,
      `Thinking equal magnitudes means equal vectors — forgetting direction must also match`,
    ],
    nextSteps: [
      `02-vector-notation.js — formal notation for all the forms vectors take in physics and math`,
      `03-components-magnitudes.js — more practice converting between forms with harder angles`,
      `04-adding-vectors.js — adding two vectors by adding their components separately`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\vec{A}`, meaning: `Vector — a quantity with both magnitude and direction; drawn as an arrow` },
      { symbol: `|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}`, meaning: `Magnitude (Euclidean norm) — always non-negative; the "length" of the arrow` },
      { symbol: `(A_x, A_y)`, meaning: `Component form — how much of the vector lies along each axis; signs encode direction` },
      { symbol: `\\hat{\\imath},\\, \\hat{\\jmath}`, meaning: `Unit vectors in $+x$ and $+y$ directions — magnitude 1, no units; pure direction markers` },
      { symbol: `\\theta = \\arctan_2(A_y, A_x)`, meaning: `Direction angle measured counterclockwise from $+x$ axis; use atan2 for all quadrants` },
    ],
    rulesOfThumb: [
      `Test for vector: would reversing direction change the physical situation? Yes → vector. No → scalar.`,
      `Magnitudes are always $\\geq 0$; components can be negative (negative means opposite to that axis direction).`,
      `Always use atan2(y, x) for angles from components — never atan(y/x) alone.`,
      `After computing components, verify: $\\sqrt{A_x^2 + A_y^2}$ should recover the original magnitude.`,
      `Free vector rule: position on the page doesn't matter — only magnitude and direction define a vector.`,
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-001-q1',
      type: 'choice',
      question: `Which of the following is a vector quantity?`,
      options: [`Temperature (°C)`, `Mass (kg)`, `Velocity (m/s)`, `Energy (J)`],
      answer: `Velocity (m/s)`,
      hints: [`A vector requires both magnitude AND direction to specify it completely.`, `Temperature, mass, and energy are single numbers — no direction needed.`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-001-q2',
      type: 'choice',
      question: `What is the magnitude of $\\vec{A} = (3, 4)$ m?`,
      options: [`$3$ m`, `$4$ m`, `$7$ m`, `$5$ m`],
      answer: `$5$ m`,
      hints: [`$|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}$.`, `$\\sqrt{3^2 + 4^2} = \\sqrt{9+16} = \\sqrt{25} = 5$ m. The 3-4-5 right triangle.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-001-q3',
      type: 'choice',
      question: `A vector arrow is slid to a different location on the page without rotating or stretching. What is true?`,
      options: [
        `The vector has changed — position matters`,
        `The vector is the same (free vector rule)`,
        `The components change when the position changes`,
        `Only the magnitude changes`,
      ],
      answer: `The vector is the same (free vector rule)`,
      hints: [`A vector is defined by magnitude and direction only.`, `Position on the page is irrelevant — you can draw a vector anywhere without changing what it is.`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-001-q4',
      type: 'choice',
      question: `$\\vec{A}$ has magnitude 10 and $\\theta = 30°$ from $+x$. What is $A_x$?`,
      options: [`$5$`, `$5\\sqrt{3}$`, `$10$`, `$\\sqrt{3}/2$`],
      answer: `$5\\sqrt{3}$`,
      hints: [`$A_x = |\\vec{A}|\\cos\\theta$.`, `$\\cos 30° = \\sqrt{3}/2$, so $A_x = 10 \\times \\sqrt{3}/2 = 5\\sqrt{3} \\approx 8.66$.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-001-q5',
      type: 'choice',
      question: `Which best describes a scalar?`,
      options: [
        `A quantity with magnitude and direction`,
        `A quantity with direction only`,
        `A quantity with magnitude only, described by a single number`,
        `A unit vector (magnitude 1)`,
      ],
      answer: `A quantity with magnitude only, described by a single number`,
      hints: [`Scalar = single number + unit.`, `Examples: mass (5 kg), temperature (25°C), speed (10 m/s), energy (200 J). All fully specified without a direction.`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-001-q6',
      type: 'choice',
      question: `A car travels at 60 mph north. It turns and now travels at 60 mph east. The two velocities are:`,
      options: [
        `Equal — same speed`,
        `Different vectors — same magnitude but different direction`,
        `The same scalar quantity`,
        `The second is twice the first`,
      ],
      answer: `Different vectors — same magnitude but different direction`,
      hints: [`Vectors are equal only if BOTH magnitude and direction match.`, `Same speed (60 mph) but different direction (north vs east) means different velocity vectors.`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-001-q7',
      type: 'choice',
      question: `$\\vec{A} = (A_x, A_y)$ and $\\vec{B} = (B_x, B_y)$. When is $\\vec{A} = \\vec{B}$?`,
      options: [
        `When they have the same starting point`,
        `When $A_x = B_x$ AND $A_y = B_y$`,
        `When $|\\vec{A}| = |\\vec{B}|$`,
        `When they point in the same direction`,
      ],
      answer: `When $A_x = B_x$ AND $A_y = B_y$`,
      hints: [`Vector equality requires every component to match.`, `Same magnitude ≠ equal vectors. Same direction ≠ equal vectors. Both conditions must hold simultaneously.`],
      reviewSection: 'rigor',
    },
    {
      id: 'p1-ch1-001-q8',
      type: 'choice',
      question: `$\\vec{A} = (0, -5)$. What is the direction $\\theta$ of $\\vec{A}$ from the $+x$-axis?`,
      options: [`$90°$`, `$0°$`, `$270°$ (or $-90°$)`, `$180°$`],
      answer: `$270°$ (or $-90°$)`,
      hints: [`$(0, -5)$ has no x-component and a negative y-component — it points straight down.`, `$\\arctan_2(-5, 0) = -90°$, equivalent to $270°$. The vector points in the $-y$ direction (south).`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-001-q9',
      type: 'choice',
      question: `$\\vec{F} = (-3, 4)$ N. A student computes the angle as $\\arctan(4/(-3)) \\approx -53.1°$. What is wrong?`,
      options: [
        `Nothing — $-53.1°$ is correct`,
        `The sign of the angle is wrong; it should be $+53.1°$`,
        `The vector is in Quadrant II; the correct angle is $180° - 53.1° = 126.9°$`,
        `The magnitude should be computed first`,
      ],
      answer: `The vector is in Quadrant II; the correct angle is $180° - 53.1° = 126.9°$`,
      hints: [`$(-3, 4)$ has negative x and positive y — that is Quadrant II.`, `\`atan(y/x)\` only returns angles in $(-90°, 90°)$. For Q2 vectors, always add $180°$ or use \`atan2(y, x)\` directly.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-001-q10',
      type: 'choice',
      question: `Weight and mass: which is a vector and which is a scalar?`,
      options: [
        `Both are scalars`,
        `Both are vectors`,
        `Mass is scalar; weight is a vector (gravitational force, directed downward)`,
        `Mass is vector; weight is scalar`,
      ],
      answer: `Mass is scalar; weight is a vector (gravitational force, directed downward)`,
      hints: [`Mass = amount of matter (kg) — just a number, no direction.`, `Weight = gravitational force $\\vec{W} = m\\vec{g}$, directed toward Earth's center. Force is always a vector.`],
      reviewSection: 'intuition',
    },
  ],

  // ── Recognition/exhaustive-forms viz ────────────────────────────────────
  recognitionViz: {
    id: 'VectorFormRecogniser',
    placement: 'examples_end',
    title: 'Every disguise a vector wears — recognition drill',
    mathBridge:
      'Vectors appear in many notations across textbooks, papers, and code. After this drill you should recognise them all.',
    caption:
      'Forms covered: arrow notation, bold, bracket/component, magnitude–angle, unit-vector, negative vector.',
    prerequisiteRecaps: [
      {
        concept: 'Right-triangle trigonometry (SOH-CAH-TOA)',
        summary:
          `$\\sin\\theta = \\text{opp}/\\text{hyp}$, $\\cos\\theta = \\text{adj}/\\text{hyp}$, $\\tan\\theta = \\text{opp}/\\text{adj}$. Used to convert between magnitude–angle and component forms.`,
        lessonSlug: null,
      },
      {
        concept: 'Pythagorean theorem',
        summary: '$c^2 = a^2 + b^2$. Used to find the magnitude of a vector from its components.',
        lessonSlug: null,
      },
    ],
    props: {
      forms: [
        { notation: '\\vec{A}', label: 'Arrow notation', example: '\\vec{F} = 10\\,N\\text{ east}' },
        { notation: '\\mathbf{A}', label: 'Bold notation (textbooks / linear algebra)', example: '\\mathbf{v} = 3\\,m/s\\text{ north}' },
        { notation: '(A_x,\\, A_y)', label: 'Component/bracket notation', example: '\\vec{d} = (4,\\,-3)\\,m' },
        { notation: '|\\vec{A}|\\angle\\theta', label: 'Magnitude–angle notation', example: '|\\vec{v}| = 5\\,m/s\\angle 37°' },
        { notation: 'A_x\\,\\hat{\\imath} + A_y\\,\\hat{\\jmath}', label: 'Unit-vector notation', example: '\\vec{F} = 3\\hat{\\imath} - 4\\hat{\\jmath}\\,N' },
        { notation: '-\\vec{A}', label: 'Negative vector (same magnitude, opposite direction)', example: '\\text{If }\\vec{A}=(3,4)\\text{ then }-\\vec{A}=(-3,-4)' },
      ],
    },
  },
}
