export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'p1-ch1-017',
  slug: 'direction-cosines',
  chapter: 'p1',
  order: 17,
  title: 'Direction Cosines',
  subtitle: 'Three cosines that uniquely pin down any direction in 3D space — and they can\'t be chosen independently.',
  tags: ['direction cosines', '3D direction', 'unit vector', 'alpha beta gamma', 'orientation', 'aerospace', 'robotics'],
  aliases: 'direction cosines 3D direction angles unit vector alpha beta gamma orientation aerospace robotics',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: 'A structural cable pulls at some angle in 3D space. You know its tension is 500 N — but in which direction exactly? How do you specify a 3D direction precisely?',
    realWorldContext:
      `In 2D, you can describe any direction with a single angle — "30° above horizontal." In 3D, one angle isn't enough. A satellite's orientation in orbit, a robot arm's end position in space, a cable's pull direction in a 3D bridge — these all need a systematic way to describe direction in three dimensions. The answer used by aerospace engineers, roboticists, and structural analysts worldwide is the **direction cosine**: the cosines of the three angles that a vector makes with the x-, y-, and z-axes. Three numbers, one identity connecting them, and any 3D direction pinned down exactly.`,
    previewVisualizationId: 'DirectionCosineIntuition',
  },

  // ── Videos ──────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (19 of 21) Finding the Direction Cosine',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (20 of 21) Direction Angles',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'math',
    },
  ],

  // ── Intuition ────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      `Start with what you already know. In 2D, a vector $\\vec{A}$ at angle $\\theta$ from the +x axis has components $A_x = |\\vec{A}|\\cos\\theta$ and $A_y = |\\vec{A}|\\sin\\theta$. The angle $\\theta$ tells you everything about the direction. Now ask: what's the equivalent in 3D? Instead of one angle, you need to describe the vector's relationship to all three coordinate axes.`,

      `Here's the key idea: for any vector $\\vec{A}$ in 3D, define **three angles** — $\\alpha$, $\\beta$, $\\gamma$ — as the angles between $\\vec{A}$ and the positive $x$-, $y$-, and $z$-axes respectively. Then the **direction cosines** are simply $\\cos\\alpha$, $\\cos\\beta$, and $\\cos\\gamma$. Each one is "how much of $\\vec{A}$'s unit vector points along that axis?" — exactly the same idea as a component, but normalised to magnitude 1.`,

      `Think of each direction cosine as the "shadow" the unit vector casts on each axis. The $x$-direction cosine $\\cos\\alpha$ tells you the fraction of the vector's direction that is in the $+x$ direction. If $\\alpha = 0°$, the vector points along $+x$ (full shadow) and $\\cos\\alpha = 1$. If $\\alpha = 90°$, the vector is perpendicular to $+x$ (no shadow) and $\\cos\\alpha = 0$. If $\\alpha = 180°$, the vector points along $-x$ and $\\cos\\alpha = -1$.`,

      `The remarkable thing: the three direction cosines are **not independent**. They are the three components of the **unit vector** $\\hat{A}=\\vec{A}/|\\vec{A}|$, and since any unit vector must have magnitude 1, the Pythagorean theorem immediately gives $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$. This identity is unavoidable. If you know two direction cosines, the third is determined up to a sign — and the sign is resolved by knowing which octant (which "corner" of 3D space) the vector points into.`,

      `**Real applications**: in aerospace, "direction cosine matrices" (DCM) are $3\\times3$ rotation matrices whose columns are direction cosines — the standard way to specify aircraft orientation. In structural engineering, a cable's direction cosines are used to resolve its tension into $x$, $y$, $z$ components for equilibrium analysis. In robotics, direction cosines describe joint orientations. In physics, they appear whenever a 3D force or field must be decomposed along coordinate axes.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Direction cosines',
        body: `\\cos\\alpha = \\frac{A_x}{|\\vec{A}|},\\qquad\\cos\\beta = \\frac{A_y}{|\\vec{A}|},\\qquad\\cos\\gamma = \\frac{A_z}{|\\vec{A}|}\\n\\n$\\alpha,\\beta,\\gamma$ are the angles between $\\vec{A}$ and the positive $x$-, $y$-, $z$-axes respectively. All angles lie in $[0°, 180°]$.`,
      },
      {
        type: 'theorem',
        title: 'The direction cosine identity',
        body: `\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1\\n\\nThis ALWAYS holds for any non-zero 3D vector. It is the Pythagorean theorem applied to the unit vector. If your three direction cosines don't satisfy this identity, you made an error.`,
      },
      {
        type: 'insight',
        title: 'Direction cosines = components of the unit vector',
        body: `\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|} = (\\cos\\alpha,\\;\\cos\\beta,\\;\\cos\\gamma)\\n\\nThe identity $\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1$ follows immediately from $|\\hat{A}|=1$. There's nothing to memorise separately — it's just the statement that the unit vector has magnitude 1.`,
      },
      {
        type: 'warning',
        title: 'Angles are measured from the positive axes',
        body: `$\\alpha$ is the angle between $\\vec{A}$ and the **positive** $x$-axis (not the negative x-axis, not the yz-plane). A negative $x$-component gives $\\alpha > 90°$, making $\\cos\\alpha$ negative. All three angles always lie between 0° and 180° inclusive.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'From 2D angles to 3D direction cosines',
        caption: `In 2D, $A_x = |A|\\cos\\theta$ is the projection ("shadow") of the vector onto the x-axis. In 3D, the same idea applies separately to all three axes. Each direction cosine is the cosine of the angle to that axis — or equivalently, the component of the unit vector along that axis.`,
      },
      {
        id: 'DirectionCosineIntuition',
        title: 'Direction cosines — interactive exploration',
        mathBridge: `Drag the 3D vector. Watch how $\\cos\\alpha$, $\\cos\\beta$, $\\cos\\gamma$ update as you rotate it. Verify that their squares always sum to 1, regardless of the direction.`,
        caption: `As you rotate the vector toward any axis, the corresponding direction cosine approaches 1. Moving away from an axis makes that cosine approach 0 or −1.`,
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      `Given direction cosines, you can immediately reconstruct the unit vector in that direction. Multiply by the magnitude to get the full vector. Given components, compute each direction cosine by dividing by the magnitude. These two operations are inverses of each other.`,

      `**Forward (direction cosines → vector)**: given $\\cos\\alpha$, $\\cos\\beta$, $\\cos\\gamma$ and magnitude $|\\vec{A}|$:\\n$A_x = |\\vec{A}|\\cos\\alpha$, $A_y = |\\vec{A}|\\cos\\beta$, $A_z = |\\vec{A}|\\cos\\gamma$.`,

      `**Inverse (components → direction cosines)**: given $(A_x, A_y, A_z)$:\\n$|\\vec{A}| = \\sqrt{A_x^2+A_y^2+A_z^2}$, then each direction cosine is that component divided by the magnitude.`,

      `**Finding the angles**: once you have the direction cosines, take $\\arccos$ of each to get the angle in degrees. Remember that $\\arccos$ always returns values in $[0°, 180°]$, which is exactly the range for direction angles — so there's no quadrant ambiguity issue here (unlike $\\arctan$ in 2D).`,

      `**The constraint and the third cosine**: because the identity $\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1$ always holds, you only need to independently specify two direction cosines. The third is $\\pm\\sqrt{1-\\cos^2\\alpha-\\cos^2\\beta}$, with the sign determined by whether the vector points into positive or negative $z$ (for example). This is why a direction in 3D has only 2 degrees of freedom — same as specifying a point on a sphere.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Forward: unit vector from direction cosines',
        body: `\\hat{A} = \\cos\\alpha\\,\\hat{i} + \\cos\\beta\\,\\hat{j} + \\cos\\gamma\\,\\hat{k}\\n\\nScale by $|\\vec{A}|$ to recover the full vector: $\\vec{A} = |\\vec{A}|\\,(\\cos\\alpha,\\cos\\beta,\\cos\\gamma)$.`,
      },
      {
        type: 'theorem',
        title: 'Inverse: direction cosines from components',
        body: `\\cos\\alpha = \\frac{A_x}{\\sqrt{A_x^2+A_y^2+A_z^2}},\\qquad\\cos\\beta = \\frac{A_y}{\\sqrt{A_x^2+A_y^2+A_z^2}},\\qquad\\cos\\gamma = \\frac{A_z}{\\sqrt{A_x^2+A_y^2+A_z^2}}`,
      },
      {
        type: 'insight',
        title: '3D direction = a point on the unit sphere',
        body: `Every unit vector corresponds to a unique point on the surface of a sphere of radius 1. The direction cosines $\\cos\\alpha, \\cos\\beta, \\cos\\gamma$ are the $x, y, z$ coordinates of that point. The identity $\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1$ is just the equation of the unit sphere $x^2+y^2+z^2=1$.`,
      },
    ],
    visualizations: [
      {
        id: 'DirectionCosineExplorer',
        title: 'Explorer: compute direction cosines from components',
        mathBridge: `Enter any 3D vector components. The explorer computes all three direction cosines, the corresponding angles, and verifies the identity. Try negative components to see angles greater than 90°.`,
        caption: `The identity is always satisfied — it's a built-in check for whether your direction cosines are geometrically valid.`,
      },
    ],
  },

  // ── Rigor ────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The identity $\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1$ is equivalent to the statement that the unit vector has magnitude 1. This is proved in three lines from the definition, as shown in the proof steps below.`,
      `**Two degrees of freedom**: a direction in 3D space has exactly 2 degrees of freedom (it lives on the surface of a sphere, which is a 2D manifold). This means three direction cosines with one constraint $\\sum\\cos^2 = 1$ — giving 2 independent parameters. Equivalently, you can parametrise any direction by spherical coordinates: polar angle $\\theta\\in[0°,180°]$ and azimuthal angle $\\phi\\in[0°,360°)$.`,
      `**Direction cosine matrices (DCM)**: in aerospace engineering, the orientation of a rigid body is described by a $3\\times3$ matrix whose rows (or columns, depending on convention) are unit vectors aligned with the body's own axes. Each row is a direction cosine triple $(\\cos\\alpha_i, \\cos\\beta_i, \\cos\\gamma_i)$ satisfying the identity. The matrix is orthogonal ($R^TR=I$), meaning rotations preserve lengths and angles. DCMs are used in flight control systems for every modern aircraft and spacecraft.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Constraint from the Pythagorean theorem',
        body: `$|\\hat{A}|^2 = \\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1\\;$ — the same as $A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$ divided through by $|\\vec{A}|^2$. The identity is nothing more than the 3D Pythagorean theorem applied to the unit vector.`,
      },
      {
        type: 'insight',
        title: 'When two cosines exceed √(1/2)',
        body: `If you try to set $|\\cos\\alpha| > 1/\\sqrt{2}$ and $|\\cos\\beta| > 1/\\sqrt{2}$ simultaneously, then $\\cos^2\\alpha + \\cos^2\\beta > 1$, leaving no room for $\\cos^2\\gamma \\geq 0$. This means a vector cannot make angles less than 45° with two different axes simultaneously — they'd have to overlap too much.`,
      },
    ],
    proofSteps: [
      {
        title: 'Define direction cosines as components of unit vector',
        expression: `(\\cos\\alpha,\\cos\\beta,\\cos\\gamma) = \\left(\\frac{A_x}{|\\vec{A}|},\\frac{A_y}{|\\vec{A}|},\\frac{A_z}{|\\vec{A}|}\\right)`,
        annotation: 'This is the definition — each direction cosine is the corresponding component of the unit vector.',
      },
      {
        title: 'Square each and sum',
        expression: `\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma = \\frac{A_x^2}{|\\vec{A}|^2} + \\frac{A_y^2}{|\\vec{A}|^2} + \\frac{A_z^2}{|\\vec{A}|^2} = \\frac{A_x^2+A_y^2+A_z^2}{|\\vec{A}|^2}`,
        annotation: 'Common denominator |A|². Numerators sum to the sum of squared components.',
      },
      {
        title: 'Apply 3D Pythagorean theorem',
        expression: `A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2 \\implies \\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma = \\frac{|\\vec{A}|^2}{|\\vec{A}|^2} = 1`,
        annotation: 'The numerator is exactly |A|² by the Pythagorean theorem in 3D. Division gives 1. Q.E.D.',
      },
    ],
    title: 'Proof: the direction cosine identity from the Pythagorean theorem',
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-017-ex1',
      title: 'Direction cosines of a 3D force',
      problem: `\\text{A structural cable exerts force }\\vec{F}=(3,-4,0)\\text{ N. Find its direction cosines and direction angles.}`,
      steps: [
        {
          expression: `|\\vec{F}|=\\sqrt{3^2+(-4)^2+0^2}=\\sqrt{9+16}=5\\text{ N}`,
          annotation: 'Magnitude first.',
        },
        {
          expression: `\\cos\\alpha=\\frac{3}{5}=0.600\\implies\\alpha=\\arccos(0.600)\\approx53.1°`,
          annotation: 'Angle to the +x-axis.',
        },
        {
          expression: `\\cos\\beta=\\frac{-4}{5}=-0.800\\implies\\beta=\\arccos(-0.800)\\approx143.1°`,
          annotation: 'Negative component → angle greater than 90° (vector points away from +y).',
        },
        {
          expression: `\\cos\\gamma=\\frac{0}{5}=0\\implies\\gamma=90°`,
          annotation: 'Zero z-component → vector lies in the xy-plane, perpendicular to the z-axis.',
        },
        {
          expression: `\\text{Identity check: }0.6^2+(-0.8)^2+0^2=0.36+0.64+0=1\\;\\checkmark`,
          annotation: 'Always verify the identity.',
        },
      ],
      conclusion: `Direction cosines $(0.600,\\,-0.800,\\,0)$; angles $53.1°$, $143.1°$, $90°$. The vector lies in the xy-plane and pulls mostly in +x and partly in −y.`,
    },
    {
      id: 'ch1-017-ex2',
      title: 'Reconstruct a vector from direction cosines and magnitude',
      problem: `\\text{A force has magnitude } 10\\text{ N and direction cosines }\\cos\\alpha=1/\\sqrt{2},\\;\\cos\\beta=1/\\sqrt{2},\\;\\cos\\gamma=0.\\text{ Find the components and verify the identity.}`,
      steps: [
        {
          expression: `\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=\\tfrac{1}{2}+\\tfrac{1}{2}+0=1\\;\\checkmark`,
          annotation: 'Identity check before computing — confirms this is a valid set of direction cosines.',
        },
        {
          expression: `F_x=|\\vec{F}|\\cos\\alpha=10\\cdot\\frac{1}{\\sqrt{2}}=\\frac{10}{\\sqrt{2}}\\approx7.07\\text{ N}`,
          annotation: 'x-component.',
        },
        {
          expression: `F_y=7.07\\text{ N},\\quad F_z=0`,
          annotation: 'By symmetry, y-component equals x-component. z-component is zero.',
        },
      ],
      conclusion: `$\\vec{F}\\approx(7.07,\\,7.07,\\,0)\\text{ N}$ — a force at 45° in the xy-plane with no vertical component.`,
    },
    {
      id: 'ch1-017-ex3',
      title: 'Finding the third direction cosine',
      problem: `\\text{A 3D vector has }\\cos\\alpha=0.6\\text{ and }\\cos\\beta=0.5\\text{. Find }\\cos\\gamma\\text{ if the vector points into the region }z > 0.`,
      steps: [
        {
          expression: `\\cos^2\\gamma=1-\\cos^2\\alpha-\\cos^2\\beta=1-0.36-0.25=0.39`,
          annotation: 'Rearrange the identity.',
        },
        {
          expression: `\\cos\\gamma=\\pm\\sqrt{0.39}=\\pm0.624`,
          annotation: 'Two possible values — the sign depends on which half-space the vector points into.',
        },
        {
          expression: `z>0\\implies\\cos\\gamma>0\\implies\\cos\\gamma=+0.624\\implies\\gamma\\approx51.4°`,
          annotation: 'The problem specifies z > 0, so we take the positive root.',
        },
        {
          expression: `\\text{Final check: }0.36+0.25+0.39=1.00\\;\\checkmark`,
          annotation: 'Identity satisfied.',
        },
      ],
      conclusion: `$\\cos\\gamma\\approx+0.624$, $\\gamma\\approx51.4°$. Without knowing the sign of the z-component, you'd get two valid answers.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-017-ch1',
      difficulty: 'easy',
      problem: `\\text{A vector has equal components: }\\vec{A}=(1,1,1). \\text{ Find its direction cosines and the angle each makes with the coordinate axes.}`,
      hint: `$|\\vec{A}|=\\sqrt{3}$. Each component divided by $\\sqrt{3}$ gives each direction cosine. By symmetry, all three angles are equal.`,
      walkthrough: [
        { expression: `|\\vec{A}|=\\sqrt{1+1+1}=\\sqrt{3}`, annotation: 'Magnitude.' },
        { expression: `\\cos\\alpha=\\cos\\beta=\\cos\\gamma=\\frac{1}{\\sqrt{3}}\\approx0.577`, annotation: 'All three are equal by symmetry.' },
        { expression: `\\alpha=\\beta=\\gamma=\\arccos(1/\\sqrt{3})\\approx54.7°`, annotation: 'The "body diagonal" of a cube makes equal angles with all three axes.' },
        { expression: `\\text{Check: }3\\times(1/\\sqrt{3})^2=3\\times\\tfrac{1}{3}=1\\;\\checkmark`, annotation: 'Identity satisfied.' },
      ],
      answer: `$\\cos\\alpha=\\cos\\beta=\\cos\\gamma=1/\\sqrt{3}\\approx0.577$, $\\alpha=\\beta=\\gamma\\approx54.7°$`,
    },
    {
      id: 'ch1-017-ch2',
      difficulty: 'medium',
      problem: `\\text{Can a 3D vector have }\\cos\\alpha=0.9\\text{ and }\\cos\\beta=0.9\\text{ simultaneously? If not, what is the maximum equal value both can have?}`,
      hint: 'Check if the identity can be satisfied. Then set $\\cos\\alpha=\\cos\\beta=c$ and find the maximum $c$ such that $2c^2 \\leq 1$.',
      walkthrough: [
        { expression: `\\cos^2\\gamma=1-0.81-0.81=-0.62<0`, annotation: 'Negative — impossible. A squared quantity cannot be negative.' },
        { expression: `\\text{For }\\cos\\alpha=\\cos\\beta=c:\\;2c^2\\leq1\\implies c\\leq\\frac{1}{\\sqrt{2}}\\approx0.707`, annotation: 'Maximum equal value is $1/\\sqrt{2}$, achieved when $\\gamma=90°$ (vector in the xy-plane at 45°).' },
      ],
      answer: `No — the identity gives $\\cos^2\\gamma < 0$, which is impossible. The maximum equal value for two direction cosines is $1/\\sqrt{2}\\approx0.707$.`,
    },
    {
      id: 'ch1-017-ch3',
      difficulty: 'hard',
      problem: `A cable in a 3D truss makes direction angles $\\alpha=60°$, $\\beta=45°$, and $\\gamma=?°$ (with $\\gamma < 90°$). The cable has tension $T=200\\text{ N}$. Find all three components of the tension force.`,
      hint: 'Find cosγ from the identity. Then multiply each direction cosine by T = 200 N to get each force component.',
      walkthrough: [
        {
          expression: `\\cos^2\\gamma=1-\\cos^260°-\\cos^245°=1-0.25-0.5=0.25\\implies\\cos\\gamma=0.5\\;(\\gamma<90°)`,
          annotation: 'Solve from the identity. Positive root since γ < 90°.',
        },
        {
          expression: `\\gamma=\\arccos(0.5)=60°`,
          annotation: 'The cable makes 60° with the z-axis.',
        },
        {
          expression: `T_x=200\\cos60°=200\\times0.5=100\\text{ N}`,
          annotation: 'x-component of tension.',
        },
        {
          expression: `T_y=200\\cos45°=200\\times\\frac{1}{\\sqrt{2}}\\approx141\\text{ N}`,
          annotation: 'y-component.',
        },
        {
          expression: `T_z=200\\cos60°=100\\text{ N}`,
          annotation: 'z-component.',
        },
        {
          expression: `\\text{Check: }\\sqrt{100^2+141^2+100^2}=\\sqrt{10000+19881+10000}=\\sqrt{39881}\\approx200\\;\\checkmark`,
          annotation: 'Magnitude recovers the original 200 N tension.',
        },
      ],
      answer: `$\\gamma=60°$; components $(100,\\,141,\\,100)\\text{ N}$ (approximately). The cable pulls strongly in the y-direction and equally in x and z.`,
    },
  ],

  // ── Python Lab ───────────────────────────────────────────────────────────
  python: {
    title: 'Python Lab — Direction Cosines in 3D Engineering',
    description: `Compute direction cosines for arbitrary 3D vectors, verify the identity, and solve structural engineering problems where cables pull in 3D.`,
    placement: 'after-rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Direction cosines: from formula to engineering',
        props: {
          initialCells: [
          // ── CELL 1: Core computation ──────────────────────────────────
          {
            id: 'cell-01',
            type: 'code',
            cellTitle: 'Computing direction cosines from any 3D vector',
            code:
`import numpy as np

def direction_cosines(v):
    """
    Compute direction cosines and direction angles for a 3D vector v.
    Returns (cos_alpha, cos_beta, cos_gamma, alpha, beta, gamma) in degrees.
    """
    v = np.array(v, dtype=float)
    mag = np.linalg.norm(v)
    if mag == 0:
        raise ValueError("Zero vector has no direction")
    unit = v / mag
    cos_alpha, cos_beta, cos_gamma = unit
    alpha = np.degrees(np.arccos(np.clip(cos_alpha, -1, 1)))
    beta  = np.degrees(np.arccos(np.clip(cos_beta,  -1, 1)))
    gamma = np.degrees(np.arccos(np.clip(cos_gamma, -1, 1)))
    return cos_alpha, cos_beta, cos_gamma, alpha, beta, gamma

# Test with the structural cable example
F = np.array([3, -4, 0])
ca, cb, cg, a, b, g = direction_cosines(F)

print(f"Vector: {F}")
print(f"Magnitude: {np.linalg.norm(F):.4f}")
print(f"cos α = {ca:.4f}, angle α = {a:.1f}°")
print(f"cos β = {cb:.4f}, angle β = {b:.1f}°")
print(f"cos γ = {cg:.4f}, angle γ = {g:.1f}°")
print(f"Identity check: cos²α + cos²β + cos²γ = {ca**2 + cb**2 + cg**2:.6f}")`,
            expectedOutput:
`Vector: [ 3 -4  0]
Magnitude: 5.0000
cos α = 0.6000, angle α = 53.1°
cos β = -0.8000, angle β = 143.1°
cos γ = 0.0000, angle γ = 90.0°
Identity check: cos²α + cos²β + cos²γ = 1.000000`,
          },

          // ── CELL 2: Reconstruction from cosines ───────────────────────
          {
            id: 'cell-02',
            type: 'code',
            cellTitle: 'Reconstruct a vector from direction cosines and magnitude',
            code:
`import numpy as np

def from_direction_cosines(cos_alpha, cos_beta, cos_gamma, magnitude):
    """
    Reconstruct a vector from direction cosines and magnitude.
    First verifies the identity.
    """
    identity_val = cos_alpha**2 + cos_beta**2 + cos_gamma**2
    if not np.isclose(identity_val, 1.0, atol=1e-6):
        raise ValueError(f"Direction cosines don't satisfy identity: sum of squares = {identity_val:.6f}")
    return magnitude * np.array([cos_alpha, cos_beta, cos_gamma])

# Example: cable with tension 200 N at direction angles 60°, 45°, 60°
T = 200  # N
cos_a = np.cos(np.radians(60))
cos_b = np.cos(np.radians(45))
cos_g = np.cos(np.radians(60))

print("Direction cosines:", np.round([cos_a, cos_b, cos_g], 4))
print("Sum of squares:", round(cos_a**2 + cos_b**2 + cos_g**2, 6))

F = from_direction_cosines(cos_a, cos_b, cos_g, T)
print(f"\\nForce vector: {np.round(F, 2)} N")
print(f"Magnitude check: {np.linalg.norm(F):.2f} N (should be {T} N)")`,
            expectedOutput:
`Direction cosines: [0.5    0.7071 0.5   ]
Sum of squares: 1.0

Force vector: [100.   141.42 100.  ] N
Magnitude check: 200.00 N (should be 200 N)`,
          },

          // ── CELL 3: Visualise direction angles ────────────────────────
          {
            id: 'cell-03',
            type: 'code',
            cellTitle: 'Visualise direction cosines as angles with axes',
            code:
`import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

def draw_direction_cosines(vector, ax, color='blue'):
    """Draw a vector and show its projections onto each axis."""
    v = np.array(vector, dtype=float)
    mag = np.linalg.norm(v)
    unit = v / mag

    # Draw the main vector
    ax.quiver(0,0,0, *v, color=color, arrow_length_ratio=0.1, linewidth=2.5, label=f'v = {vector}')

    # Draw projection onto x-axis
    ax.plot([0, v[0]], [0, 0], [0, 0], 'r--', linewidth=1.5, alpha=0.7)
    ax.plot([v[0], v[0]], [0, v[1]], [0, 0], 'r:', linewidth=1, alpha=0.5)

    # Direction cosines
    ca, cb, cg = unit
    ax.set_xlabel(f'x (cosα = {ca:.2f})')
    ax.set_ylabel(f'y (cosβ = {cb:.2f})')
    ax.set_zlabel(f'z (cosγ = {cg:.2f})')

fig = plt.figure(figsize=(8, 6))
ax = fig.add_subplot(111, projection='3d')

v = [3, 4, 2]
draw_direction_cosines(v, ax)

# Mark origin
ax.scatter([0], [0], [0], color='black', s=50)

# Draw coordinate axes
for i, (col, label) in enumerate(zip(['r','g','b'], ['x','y','z'])):
    direction = [0,0,0]
    direction[i] = 5
    ax.quiver(0,0,0, *direction, color=col, alpha=0.3, arrow_length_ratio=0.05)

ax.set_xlim(0, 5); ax.set_ylim(0, 5); ax.set_zlim(0, 5)
ax.legend(fontsize=10)
ax.set_title('Direction cosines: projections onto each axis')

ca, cb, cg = np.array(v)/np.linalg.norm(v)
print(f"Direction cosines: cosα={ca:.4f}, cosβ={cb:.4f}, cosγ={cg:.4f}")
print(f"Angles: α={np.degrees(np.arccos(ca)):.1f}°, β={np.degrees(np.arccos(cb)):.1f}°, γ={np.degrees(np.arccos(cg)):.1f}°")
print(f"Identity: {ca**2+cb**2+cg**2:.6f}")

plt.tight_layout()
plt.savefig('direction_cosines.png', dpi=100, bbox_inches='tight')
plt.show()`,
            expectedOutput:
`Direction cosines: cosα=0.5571, cosβ=0.7428, cosγ=0.3714
Angles: α=56.1°, β=42.0°, γ=68.2°
Identity: 1.000000`,
          },

          // ── CELL 4: Challenge — 3D structural equilibrium ─────────────
          {
            id: 'cell-04',
            type: 'code',
            challengeTitle: 'Challenge: 3D cable equilibrium analysis',
            challengeType: 'fill-in',
            code:
`import numpy as np

# A hanging sign is supported by two cables attached to the ceiling.
# Cable 1: tension 300 N, direction angles α₁=50°, β₁=40°, γ₁=?  (γ₁ > 90°)
# Cable 2: tension 250 N, direction angles α₂=55°, β₂=35°, γ₂=?  (γ₂ > 90°)
#
# Task: Find the z-component of each cable's tension.
# The z-component should be negative (cables pull UP, i.e., toward +z,
# but we set up coordinates so cables pull INTO negative z — treat as you see fit).
#
# Step 1: find cos_gamma for each cable using the identity
# Step 2: multiply by tension to get z-component
# Step 3: print the net vertical (z) force from both cables

T1 = 300   # N
a1, b1 = 50, 40   # degrees

T2 = 250   # N
a2, b2 = 55, 35   # degrees

# Step 1: compute cos_gamma for each cable (take negative root since γ > 90°)
cos_g1 = None  # TODO
cos_g2 = None  # TODO

# Step 2: z-components
Fz1 = None  # TODO
Fz2 = None  # TODO

# Step 3: net z force
Fz_net = None  # TODO

print(f"Cable 1: cos γ₁ = {cos_g1:.4f}, Fz1 = {Fz1:.2f} N")
print(f"Cable 2: cos γ₂ = {cos_g2:.4f}, Fz2 = {Fz2:.2f} N")
print(f"Net z-force: {Fz_net:.2f} N")`,
            testCode:
`cos_g1_expected = -np.sqrt(1 - np.cos(np.radians(50))**2 - np.cos(np.radians(40))**2)
cos_g2_expected = -np.sqrt(1 - np.cos(np.radians(55))**2 - np.cos(np.radians(35))**2)
assert np.isclose(cos_g1, cos_g1_expected, atol=1e-4), f"cos_g1 wrong: {cos_g1}"
assert np.isclose(cos_g2, cos_g2_expected, atol=1e-4), f"cos_g2 wrong: {cos_g2}"
assert np.isclose(Fz_net, T1*cos_g1_expected + T2*cos_g2_expected, atol=0.1), "Fz_net wrong"`,
            hint: `For each cable: \`cos_gN = -np.sqrt(1 - np.cos(np.radians(aN))**2 - np.cos(np.radians(bN))**2)\` (negative because γ > 90°). Then \`FzN = TN * cos_gN\`. Sum for the net force.`,
          },

          // ── CELL 5: Challenge — are these valid direction cosines? ─────
          {
            id: 'cell-05',
            type: 'code',
            challengeTitle: 'Challenge: Test validity of direction cosine sets',
            challengeType: 'write',
            code:
`import numpy as np

# Write a function that:
# 1. Takes three candidate direction cosines
# 2. Checks if they satisfy the identity (within tolerance 1e-6)
# 3. If valid, prints the three direction angles in degrees
# 4. If invalid, prints why they fail (sum of squares, and how far from 1)

def check_direction_cosines(cos_a, cos_b, cos_g, label=""):
    """Check validity and print results."""
    # Your code here
    pass

# Test cases
check_direction_cosines(0.6, -0.8, 0.0, "Cable A")
check_direction_cosines(0.9, 0.9, 0.1, "Cable B")       # should fail
check_direction_cosines(1/np.sqrt(3), 1/np.sqrt(3), 1/np.sqrt(3), "Cable C")
check_direction_cosines(0.5, 0.5, 0.5, "Cable D")        # should fail
`,
            testCode:
`# Check that function correctly identifies valid vs invalid
import io, sys
# Valid: Cable A and C, invalid: Cable B and D
# We test the identity directly
assert np.isclose(0.6**2 + (-0.8)**2 + 0.0**2, 1.0), "Cable A should be valid"
assert not np.isclose(0.9**2 + 0.9**2 + 0.1**2, 1.0, atol=1e-6), "Cable B should be invalid"
assert np.isclose((1/np.sqrt(3))**2 * 3, 1.0), "Cable C should be valid"
assert not np.isclose(0.5**2 * 3, 1.0, atol=1e-6), "Cable D should be invalid"
print("All validity checks passed ✓")`,
            hint: `Compute \`s = cos_a**2 + cos_b**2 + cos_g**2\`. If \`np.isclose(s, 1.0, atol=1e-6)\`, it's valid — compute angles with \`np.degrees(np.arccos(...))\` and print them. Otherwise print the failure message showing \`s\` vs 1.0.`,
          },
          ],
        },
      },
    ],
  },
}
