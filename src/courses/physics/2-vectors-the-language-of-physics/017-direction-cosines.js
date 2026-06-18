export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'p1-ch1-017',
  slug: 'direction-cosines',
  chapter: 'p1',
  order: 17,
  title: 'Direction Cosines',
  subtitle: `Three cosines that uniquely pin down any direction in 3D space — and they can't be chosen independently.`,
  tags: ['direction cosines', '3D direction', 'unit vector', 'alpha beta gamma', 'orientation', 'aerospace', 'robotics'],
  aliases: 'direction cosines 3D direction angles unit vector alpha beta gamma orientation aerospace robotics',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: `A structural cable pulls at some angle in 3D space. You know its tension is 500 N — but in which direction exactly? How do you specify a 3D direction precisely?`,
    realWorldContext:
      `In 2D, you can describe any direction with a single angle — "30° above horizontal." In 3D, one angle isn't enough. A satellite's orientation in orbit, a robot arm's end position in space, a cable's pull direction in a 3D bridge — these all need a systematic way to describe direction in three dimensions. The answer used by aerospace engineers, roboticists, and structural analysts worldwide is the **direction cosine**: the cosines of the three angles that a vector makes with the x-, y-, and z-axes. Three numbers, one identity connecting them, and any 3D direction pinned down exactly.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'vector-components' },
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
      `Before reading on, predict: a vector $\\vec{A}=(1,1,0)$ lies in the xy-plane. Without computing, what angle does it make with the z-axis? And what does that tell you about $\\cos\\gamma$? Take 30 seconds — think geometrically before you continue.`,

      `Start with what you already know. In 2D, a vector $\\vec{A}$ at angle $\\theta$ from the +x axis has components $A_x = |\\vec{A}|\\cos\\theta$ and $A_y = |\\vec{A}|\\sin\\theta$. The angle $\\theta$ tells you everything about the direction. Now ask: what's the equivalent in 3D? Instead of one angle, you need to describe the vector's relationship to all three coordinate axes.`,

      `Here's the key idea: for any vector $\\vec{A}$ in 3D, define **three angles** — $\\alpha$, $\\beta$, $\\gamma$ — as the angles between $\\vec{A}$ and the positive $x$-, $y$-, and $z$-axes respectively. Then the **direction cosines** are simply $\\cos\\alpha$, $\\cos\\beta$, and $\\cos\\gamma$. Each one is "how much of $\\vec{A}$'s unit vector points along that axis?" — the same idea as a component, but normalised to magnitude 1.`,

      `Think of each direction cosine as the "shadow" the unit vector casts on each axis. If $\\alpha = 0°$, the vector points along $+x$ (full shadow) and $\\cos\\alpha = 1$. If $\\alpha = 90°$, the vector is perpendicular to $+x$ (no shadow) and $\\cos\\alpha = 0$. Returning to the prediction: $\\vec{A}=(1,1,0)$ lies in the xy-plane, so it makes a 90° angle with the z-axis, giving $\\cos\\gamma = 0$.`,

      `The remarkable thing: the three direction cosines are **not independent**. They are the three components of the unit vector $\\hat{A}=\\vec{A}/|\\vec{A}|$, and since any unit vector must have magnitude 1, the Pythagorean theorem immediately gives $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$. This identity is unavoidable. If you know two direction cosines, the third is determined up to a sign — and the sign is resolved by knowing which octant the vector points into.`,

      `**Real applications**: in aerospace, direction cosine matrices (DCM) are $3\\times3$ rotation matrices whose columns are direction cosines — the standard way to specify aircraft orientation. In structural engineering, a cable's direction cosines are used to resolve its tension into $x, y, z$ components for equilibrium analysis. In robotics, direction cosines describe joint orientations.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Three steps to direction cosines',
        steps: [
          `Compute the magnitude: $|\\vec{A}| = \\sqrt{A_x^2+A_y^2+A_z^2}$.`,
          `Divide each component by the magnitude: $\\cos\\alpha = A_x/|\\vec{A}|$, $\\cos\\beta = A_y/|\\vec{A}|$, $\\cos\\gamma = A_z/|\\vec{A}|$.`,
          `Verify the identity: $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$. If it doesn't hold, you made an arithmetic error.`,
        ],
      },
      {
        type: 'definition',
        title: 'Direction cosines',
        body: `\\cos\\alpha = \\frac{A_x}{|\\vec{A}|},\\qquad\\cos\\beta = \\frac{A_y}{|\\vec{A}|},\\qquad\\cos\\gamma = \\frac{A_z}{|\\vec{A}|}`,
      },
      {
        type: 'theorem',
        title: 'The direction cosine identity',
        body: `\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1`,
      },
      {
        type: 'insight',
        title: 'Direction cosines = components of the unit vector',
        body: `$\\hat{A} = \\vec{A}/|\\vec{A}| = (\\cos\\alpha,\\cos\\beta,\\cos\\gamma)$. The identity follows immediately from $|\\hat{A}|=1$ — it's the 3D Pythagorean theorem applied to the unit vector. Nothing to memorise separately.`,
      },
      {
        type: 'warning',
        title: 'Angles are measured from the positive axes',
        body: `$\\alpha$ is the angle between $\\vec{A}$ and the **positive** $x$-axis. A negative $x$-component gives $\\alpha > 90°$, making $\\cos\\alpha$ negative. All three direction angles always lie in $[0°, 180°]$.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Direction cosines as projections onto each axis',
        caption: `Each direction cosine is the "shadow" of the unit vector onto one axis: cosα = A_x/|A|, cosβ = A_y/|A|, cosγ = A_z/|A|. The three cosines satisfy cos²α + cos²β + cos²γ = 1 — they are the x, y, z coordinates of a point on the unit sphere.`,
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      `Given direction cosines, you can immediately reconstruct the unit vector in that direction. Multiply by the magnitude to get the full vector. Given components, compute each direction cosine by dividing by the magnitude. These two operations are inverses of each other.`,

      `**Forward (direction cosines → vector)**: given $\\cos\\alpha$, $\\cos\\beta$, $\\cos\\gamma$ and magnitude $|\\vec{A}|$, the components are $A_x = |\\vec{A}|\\cos\\alpha$, $A_y = |\\vec{A}|\\cos\\beta$, $A_z = |\\vec{A}|\\cos\\gamma$.`,

      `**Inverse (components → direction cosines)**: given $(A_x, A_y, A_z)$: compute $|\\vec{A}| = \\sqrt{A_x^2+A_y^2+A_z^2}$, then divide each component by the magnitude.`,

      `**Finding the angles**: once you have the direction cosines, take $\\arccos$ of each to get the angle in degrees. Remember that $\\arccos$ always returns values in $[0°, 180°]$, which is exactly the valid range for direction angles — so there's no quadrant ambiguity (unlike $\\arctan$ in 2D).`,

      `**The constraint and the third cosine**: because the identity always holds, you only need to independently specify two direction cosines. The third is $\\pm\\sqrt{1-\\cos^2\\alpha-\\cos^2\\beta}$, with the sign determined by whether the vector points into positive or negative $z$. This reflects that a direction in 3D has only 2 degrees of freedom — the same as specifying a point on a sphere.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Forward: unit vector from direction cosines',
        body: `$\\hat{A} = \\cos\\alpha\\,\\hat{i} + \\cos\\beta\\,\\hat{j} + \\cos\\gamma\\,\\hat{k}$. Scale by $|\\vec{A}|$ to get the full vector: $\\vec{A} = |\\vec{A}|\\,(\\cos\\alpha,\\cos\\beta,\\cos\\gamma)$.`,
      },
      {
        type: 'theorem',
        title: 'Inverse: direction cosines from components',
        body: `\\cos\\alpha = \\frac{A_x}{\\sqrt{A_x^2+A_y^2+A_z^2}},\\qquad\\cos\\beta = \\frac{A_y}{\\sqrt{A_x^2+A_y^2+A_z^2}},\\qquad\\cos\\gamma = \\frac{A_z}{\\sqrt{A_x^2+A_y^2+A_z^2}}`,
      },
      {
        type: 'insight',
        title: '3D direction = a point on the unit sphere',
        body: `Every unit vector corresponds to a unique point on the surface of a unit sphere. The direction cosines $(\\cos\\alpha, \\cos\\beta, \\cos\\gamma)$ are the $x, y, z$ coordinates of that point. The identity $\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1$ is just the equation of the unit sphere $x^2+y^2+z^2=1$.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Direction cosines from components — worked view',
        caption: `Given components (A_x, A_y, A_z): compute |A| = √(A_x²+A_y²+A_z²), divide each component by |A| to get cosα, cosβ, cosγ. Take arccos to get angles in [0°, 180°]. Negative components give obtuse angles — that's valid. Identity check: cos²α + cos²β + cos²γ = 1.`,
      },
    ],
  },

  // ── Rigor ────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The identity $\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=1$ is equivalent to the statement that the unit vector has magnitude 1. This is proved in three lines from the definition, as shown in the proof steps below. It is a direct consequence of the 3D Pythagorean theorem — nothing deeper is needed.`,

      `**Two degrees of freedom**: a direction in 3D space has exactly 2 degrees of freedom (it lives on the surface of a sphere, which is a 2D manifold). Three direction cosines with one constraint $\\sum\\cos^2 = 1$ gives exactly $3-1=2$ independent parameters. Equivalently, any direction can be parametrised by spherical coordinates: polar angle $\\theta\\in[0°,180°]$ and azimuthal angle $\\phi\\in[0°,360°)$.`,

      `**Direction cosine matrices (DCM)**: in aerospace engineering, the orientation of a rigid body is described by a $3\\times3$ matrix whose rows (or columns, depending on convention) are unit vectors aligned with the body's own axes. Each row is a direction cosine triple $(\\cos\\alpha_i, \\cos\\beta_i, \\cos\\gamma_i)$ satisfying the identity. The matrix is orthogonal ($R^TR=I$), meaning rotations preserve lengths and angles. DCMs are used in flight control systems for every modern aircraft and spacecraft.`,

      `**Generalisation to $n$ dimensions**: in $n$-dimensional space, a direction vector makes angles $\\alpha_1,\\alpha_2,\\ldots,\\alpha_n$ with the $n$ coordinate axes, and the identity becomes $\\sum_{i=1}^{n}\\cos^2\\alpha_i = 1$. The proof is identical — it is just the $n$-dimensional Pythagorean theorem applied to the unit vector. In machine learning, high-dimensional direction cosines appear in the analysis of gradient directions and weight vector orientations in neural networks.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Constraint from the Pythagorean theorem',
        body: `$|\\hat{A}|^2 = \\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$ — the same as $A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$ divided by $|\\vec{A}|^2$. The identity is the 3D Pythagorean theorem applied to the unit vector.`,
      },
      {
        type: 'insight',
        title: 'When two cosines exceed $1/\\sqrt{2}$',
        body: `If $|\\cos\\alpha| > 1/\\sqrt{2}$ and $|\\cos\\beta| > 1/\\sqrt{2}$ simultaneously, then $\\cos^2\\alpha + \\cos^2\\beta > 1$, leaving no room for $\\cos^2\\gamma \\geq 0$. A vector cannot make angles less than 45° with two different coordinate axes at the same time.`,
      },
    ],
    proofSteps: [
      {
        title: 'Define direction cosines as components of unit vector',
        expression: `(\\cos\\alpha,\\cos\\beta,\\cos\\gamma) = \\left(\\frac{A_x}{|\\vec{A}|},\\frac{A_y}{|\\vec{A}|},\\frac{A_z}{|\\vec{A}|}\\right)`,
        annotation: 'Each direction cosine is the corresponding component of the unit vector.',
      },
      {
        title: 'Square each and sum',
        expression: `\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma = \\frac{A_x^2+A_y^2+A_z^2}{|\\vec{A}|^2}`,
        annotation: 'Common denominator |A|². Numerators are the sum of squared components.',
      },
      {
        title: 'Apply the 3D Pythagorean theorem',
        expression: `A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2 \\implies \\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma = 1`,
        annotation: 'The numerator is exactly |A|². Division gives 1. Q.E.D.',
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
          expression: `|\\vec{F}|=\\sqrt{3^2+(-4)^2+0^2}=5\\text{ N}`,
          annotation: 'Magnitude first.',
        },
        {
          expression: `\\cos\\alpha=\\frac{3}{5}=0.600\\implies\\alpha=\\arccos(0.600)\\approx53.1°`,
          annotation: 'Angle to the +x-axis.',
        },
        {
          expression: `\\cos\\beta=\\frac{-4}{5}=-0.800\\implies\\beta=\\arccos(-0.800)\\approx143.1°`,
          annotation: 'Negative component → angle greater than 90°.',
        },
        {
          expression: `\\cos\\gamma=\\frac{0}{5}=0\\implies\\gamma=90°`,
          annotation: 'Zero z-component → vector lies in the xy-plane.',
        },
        {
          expression: `\\text{Check: }0.6^2+(-0.8)^2+0^2=0.36+0.64+0=1\\;\\checkmark`,
          annotation: 'Always verify the identity.',
        },
      ],
      conclusion: `Direction cosines $(0.600,\\,-0.800,\\,0)$; angles $53.1°$, $143.1°$, $90°$. The vector pulls mostly in +x and partly in −y.`,
    },
    {
      id: 'ch1-017-ex2',
      title: 'Reconstruct a vector from direction cosines and magnitude',
      problem: `\\text{A 10 N force has direction cosines }\\cos\\alpha=1/\\sqrt{2},\\;\\cos\\beta=1/\\sqrt{2},\\;\\cos\\gamma=0.\\text{ Find the components.}`,
      steps: [
        {
          expression: `\\cos^2\\alpha+\\cos^2\\beta+\\cos^2\\gamma=\\tfrac{1}{2}+\\tfrac{1}{2}+0=1\\;\\checkmark`,
          annotation: 'Identity check before computing — confirms this is a valid set of direction cosines.',
        },
        {
          expression: `F_x=10\\cdot\\frac{1}{\\sqrt{2}}\\approx7.07\\text{ N},\\quad F_y=7.07\\text{ N},\\quad F_z=0`,
          annotation: 'Each component = magnitude × direction cosine.',
        },
      ],
      conclusion: `$\\vec{F}\\approx(7.07,\\,7.07,\\,0)\\text{ N}$ — a force at 45° in the xy-plane with no vertical component.`,
    },
    {
      id: 'ch1-017-ex3',
      title: 'Finding the third direction cosine',
      problem: `\\text{A 3D vector has }\\cos\\alpha=0.6\\text{ and }\\cos\\beta=0.5\\text{. Find }\\cos\\gamma\\text{ if the vector points into }z > 0.`,
      steps: [
        {
          expression: `\\cos^2\\gamma=1-0.6^2-0.5^2=1-0.36-0.25=0.39`,
          annotation: 'Rearrange the identity: $\\cos^2\\gamma = 1 - \\cos^2\\alpha - \\cos^2\\beta$.',
        },
        {
          expression: `\\cos\\gamma=\\pm\\sqrt{0.39}=\\pm0.624`,
          annotation: 'Two possible values — the sign depends on which half-space.',
        },
        {
          expression: `z>0\\implies\\cos\\gamma>0\\implies\\cos\\gamma=+0.624,\\quad\\gamma\\approx51.4°`,
          annotation: 'The problem specifies z > 0, so take the positive root.',
        },
        {
          expression: `0.36+0.25+0.39=1.00\\;\\checkmark`,
          annotation: 'Identity satisfied.',
        },
      ],
      conclusion: `$\\cos\\gamma\\approx+0.624$, $\\gamma\\approx51.4°$. Without knowing the sign of the z-component, you'd have two valid answers.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-017-ch1',
      difficulty: 'easy',
      problem: `\\text{Find the direction cosines and angles for }\\vec{A}=(1,1,1).`,
      hint: `$|\\vec{A}|=\\sqrt{3}$. Each component divided by $\\sqrt{3}$ gives the direction cosine. By symmetry, all three are equal.`,
      walkthrough: [
        { expression: `|\\vec{A}|=\\sqrt{3}`, annotation: 'Magnitude.' },
        { expression: `\\cos\\alpha=\\cos\\beta=\\cos\\gamma=\\frac{1}{\\sqrt{3}}\\approx0.577`, annotation: 'All three equal by symmetry.' },
        { expression: `\\alpha=\\beta=\\gamma=\\arccos(1/\\sqrt{3})\\approx54.7°`, annotation: 'The "body diagonal" of a cube makes equal 54.7° angles with all three axes.' },
        { expression: `3\\times(1/\\sqrt{3})^2=1\\;\\checkmark`, annotation: 'Identity satisfied.' },
      ],
      answer: `$\\cos\\alpha=\\cos\\beta=\\cos\\gamma=1/\\sqrt{3}\\approx0.577$, $\\alpha=\\beta=\\gamma\\approx54.7°$`,
    },
    {
      id: 'ch1-017-ch2',
      difficulty: 'medium',
      problem: `\\text{Can a 3D vector have }\\cos\\alpha=0.9\\text{ and }\\cos\\beta=0.9\\text{ simultaneously? If not, find the maximum equal value both can take.}`,
      hint: 'Check if the identity can be satisfied with both values. Then set $\\cos\\alpha=\\cos\\beta=c$ and find maximum $c$ such that $2c^2\\leq1$.',
      walkthrough: [
        { expression: `\\cos^2\\gamma=1-0.81-0.81=-0.62<0`, annotation: 'Negative — impossible. Squared quantities cannot be negative.' },
        { expression: `2c^2\\leq1\\implies c\\leq\\frac{1}{\\sqrt{2}}\\approx0.707`, annotation: 'Maximum equal value is $1/\\sqrt{2}$, achieved when $\\cos\\gamma=0$ (vector in the xy-plane at 45°).' },
      ],
      answer: `No — the identity gives $\\cos^2\\gamma < 0$. Maximum equal value for two direction cosines is $1/\\sqrt{2}\\approx0.707$.`,
    },
    {
      id: 'ch1-017-ch3',
      difficulty: 'hard',
      problem: `A cable makes direction angles $\\alpha=60°$, $\\beta=45°$, $\\gamma<90°$ with tension $T=200\\text{ N}$. Find all three force components.`,
      hint: 'Find $\\cos\\gamma$ from the identity (take positive root since $\\gamma < 90°$). Then $T_i = T\\cos\\theta_i$ for each component.',
      walkthrough: [
        {
          expression: `\\cos^2\\gamma=1-\\cos^260°-\\cos^245°=1-0.25-0.50=0.25\\implies\\cos\\gamma=0.5`,
          annotation: 'Positive root since $\\gamma < 90°$.',
        },
        {
          expression: `T_x=200\\times0.5=100\\text{ N},\\quad T_y=200/\\sqrt{2}\\approx141\\text{ N},\\quad T_z=200\\times0.5=100\\text{ N}`,
          annotation: 'Multiply each direction cosine by the tension.',
        },
        {
          expression: `\\sqrt{100^2+141^2+100^2}\\approx200\\text{ N}\\;\\checkmark`,
          annotation: 'Magnitude check.',
        },
      ],
      answer: `$\\gamma=60°$; $(T_x,T_y,T_z)\\approx(100,\\,141,\\,100)\\text{ N}$.`,
    },
  ],

  // ── Notebooks ─────────────────────────────────────────────────────────────
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Computing direction cosines from any 3D vector',
          type: 'code',
          language: 'python',
          code:
`import numpy as np

def direction_cosines(v):
    v = np.array(v, dtype=float)
    mag = np.linalg.norm(v)
    unit = v / mag
    cos_a, cos_b, cos_g = unit
    alpha = np.degrees(np.arccos(np.clip(cos_a, -1, 1)))
    beta  = np.degrees(np.arccos(np.clip(cos_b, -1, 1)))
    gamma = np.degrees(np.arccos(np.clip(cos_g, -1, 1)))
    return cos_a, cos_b, cos_g, alpha, beta, gamma

# Test: structural cable from the lesson
F = np.array([3, -4, 0])
ca, cb, cg, a, b, g = direction_cosines(F)

print(f"Vector: {F},  |F| = {np.linalg.norm(F):.2f}")
print(f"cos α = {ca:.4f},  α = {a:.1f}°")
print(f"cos β = {cb:.4f},  β = {b:.1f}°")
print(f"cos γ = {cg:.4f},  γ = {g:.1f}°")
print(f"Identity: cos²α + cos²β + cos²γ = {ca**2 + cb**2 + cg**2:.6f}")`,
          prose: [
            `\`unit = v / mag\` computes the unit vector. \`cos_a, cos_b, cos_g = unit\` unpacks its three components — these ARE the direction cosines by definition. \`np.arccos\` converts each back to an angle in $[0°, 180°]$.`,
            `\`np.clip(cos_a, -1, 1)\` prevents floating-point errors from producing values like $1.0000000001$ that would make \`arccos\` raise an error. The clip has no effect on valid direction cosines.`,
            `The identity check prints $1.000000$ — confirming that the three squared cosines sum to exactly 1. The negative $\\cos\\beta = -0.8000$ correctly produces $\\beta = 143.1°$ (obtuse angle, because the y-component is negative).`,
          ],
        },
        {
          cellTitle: 'Visualising direction cosines on the unit sphere',
          type: 'code',
          language: 'python',
          code:
`import numpy as np
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D

fig = plt.figure(figsize=(10, 4))

vectors = [
    ([1, 0, 0], 'along +x'),
    ([1, 1, 0], '45° in xy-plane'),
    ([1, 1, 1], 'body diagonal'),
    ([3, -4, 0], 'cable (3,-4,0)'),
]

ax = fig.add_subplot(111, projection='3d')
colors = ['blue', 'red', 'green', 'orange']

for (v, label), color in zip(vectors, colors):
    v = np.array(v, dtype=float)
    unit = v / np.linalg.norm(v)
    ca, cb, cg = unit
    ax.scatter(*unit, color=color, s=80)
    ax.quiver(0, 0, 0, *unit, color=color, arrow_length_ratio=0.15, label=f'{label}: ({ca:.2f},{cb:.2f},{cg:.2f})')

# Draw unit sphere wireframe
u = np.linspace(0, 2*np.pi, 30)
v = np.linspace(0, np.pi, 20)
ax.plot_surface(np.outer(np.cos(u), np.sin(v)),
                np.outer(np.sin(u), np.sin(v)),
                np.outer(np.ones(30), np.cos(v)),
                alpha=0.05, color='gray')

ax.set_xlabel('x (cosα)'); ax.set_ylabel('y (cosβ)'); ax.set_zlabel('z (cosγ)')
ax.set_title('Direction cosines = points on the unit sphere')
ax.legend(fontsize=8, loc='upper left')
plt.tight_layout()
plt.show()`,
          prose: [
            `Each vector's unit vector is plotted as a point on the unit sphere. The direction cosines $(\\cos\\alpha, \\cos\\beta, \\cos\\gamma)$ are literally the $(x, y, z)$ coordinates of that point — which is why the identity $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$ is just the equation of the sphere.`,
            `The "along +x" vector plots at $(1, 0, 0)$ — cosines $(1, 0, 0)$, angles $(0°, 90°, 90°)$. The "body diagonal" $(1,1,1)$ plots at $(1/\\sqrt{3}, 1/\\sqrt{3}, 1/\\sqrt{3})$ — all three cosines equal. The cable $(3,-4,0)$ plots at $(0.6, -0.8, 0)$ — in the southern hemisphere (negative $y$-coordinate) because $\\cos\\beta < 0$.`,
            `All four points lie exactly on the sphere surface — that's the geometric meaning of the identity. No matter what vector you start with, its unit vector always lands on the sphere. The direction cosines give you its location.`,
          ],
        },
        {
          cellTitle: 'Engineering application: 3D cable tension decomposition',
          type: 'code',
          language: 'python',
          code:
`import numpy as np

def cable_components(tension, alpha_deg, beta_deg, gamma_deg=None, z_positive=True):
    """
    Given tension and two direction angles, find all three force components.
    If gamma_deg is None, compute it from the identity.
    """
    ca = np.cos(np.radians(alpha_deg))
    cb = np.cos(np.radians(beta_deg))

    if gamma_deg is None:
        cos2g = 1 - ca**2 - cb**2
        if cos2g < -1e-10:
            raise ValueError(f"Invalid: cos²α + cos²β = {ca**2 + cb**2:.4f} > 1")
        cg = np.sqrt(max(0, cos2g)) * (1 if z_positive else -1)
    else:
        cg = np.cos(np.radians(gamma_deg))

    # Verify identity
    identity = ca**2 + cb**2 + cg**2
    if not np.isclose(identity, 1.0, atol=1e-6):
        raise ValueError(f"Identity check failed: {identity:.6f}")

    Fx = tension * ca
    Fy = tension * cb
    Fz = tension * cg
    mag_check = np.linalg.norm([Fx, Fy, Fz])

    return Fx, Fy, Fz, mag_check

# Example from the lesson: α=60°, β=45°, γ<90°
Fx, Fy, Fz, check = cable_components(200, alpha_deg=60, beta_deg=45, z_positive=True)
print(f"Cable (α=60°, β=45°): Fx={Fx:.1f} N, Fy={Fy:.1f} N, Fz={Fz:.1f} N")
print(f"Magnitude check: {check:.1f} N (should be 200)")

# A second cable with explicit γ=120°
Fx2, Fy2, Fz2, _ = cable_components(300, alpha_deg=50, beta_deg=40, gamma_deg=120)
print(f"\\nCable 2 (γ=120°): Fx={Fx2:.1f} N, Fy={Fy2:.1f} N, Fz={Fz2:.1f} N")

# Net force from both cables
print(f"\\nNet: ({Fx+Fx2:.1f}, {Fy+Fy2:.1f}, {Fz+Fz2:.1f}) N")`,
          prose: [
            `The function uses the identity $\\cos^2\\gamma = 1 - \\cos^2\\alpha - \\cos^2\\beta$ to find the missing direction cosine when only $\\alpha$ and $\\beta$ are given. The \`z_positive\` flag resolves the sign ambiguity. The magnitude check confirms the decomposition is correct.`,
            `For the first cable (200 N, $\\alpha=60°$, $\\beta=45°$): $\\cos\\gamma = \\sqrt{1-0.25-0.5} = 0.5$, giving $(100, 141, 100)$ N. For the second cable with explicit $\\gamma=120°$: $\\cos 120° = -0.5$, so $F_z$ is negative (cable pulls downward in z).`,
            `Adding the force components gives the net load on whatever structure the cables are supporting. This is exactly how structural engineers analyze 3D trusses: resolve every member's tension into $(F_x, F_y, F_z)$ using direction cosines, then apply equilibrium ($\\sum F_x = 0$, etc.) at each joint.`,
          ],
        },
        {
          cellTitle: 'Challenge: validate direction cosines and find unknown angles',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode:
`import numpy as np

# Part A: Write a function that validates a set of direction cosines
# and prints the direction angles if valid, or an error message if not.
def check_direction_cosines(cos_a, cos_b, cos_g, label=""):
    s = cos_a**2 + cos_b**2 + cos_g**2
    # TODO: if s is close to 1 (atol=1e-6): print angles in degrees
    #       else: print label and how much sum of squares differs from 1
    pass

check_direction_cosines(0.6,  -0.8,  0.0,  "Cable A")   # valid
check_direction_cosines(0.9,   0.9,  0.1,  "Cable B")   # invalid
check_direction_cosines(1/np.sqrt(3), 1/np.sqrt(3), 1/np.sqrt(3), "Diagonal")  # valid

# Part B: For each valid cable above, find the actual direction angles
# and confirm they match what check_direction_cosines printed.

# Part C: A cable has cos_alpha = 0.5 and the vector points into z > 0 and y > 0.
# The angle beta is 60°. Find cos_gamma and all three direction angles.
cos_a = 0.5
beta_deg = 60.0
# TODO: compute cos_beta, then cos_gamma, then all three angles`,
          prose: [
            `For Part A: compute \`s = cos_a**2 + cos_b**2 + cos_g**2\`. If \`np.isclose(s, 1.0, atol=1e-6)\`, use \`np.degrees(np.arccos(np.clip(c, -1, 1)))\` for each cosine to get the angles. Otherwise print \`f"{label}: INVALID — sum of squares = {s:.6f}"\`.`,
            `For Part C: \`cos_b = np.cos(np.radians(60))\`, then \`cos_g = np.sqrt(1 - 0.25 - cos_b**2)\` (positive root because $z > 0$). The angles follow from \`np.degrees(np.arccos(...))\`. Verify the identity holds.`,
            `Cable B fails because $0.9^2 + 0.9^2 + 0.1^2 = 0.81 + 0.81 + 0.01 = 1.63 \\ne 1$. No 3D vector can have these three direction cosines simultaneously — they would require the unit vector to have magnitude $\\sqrt{1.63} > 1$, which is impossible.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Computing direction cosines from any 3D vector',
          type: 'code',
          language: 'matlab',
          code:
`function [ca, cb, cg, a, b, g] = dir_cosines(v)
    mag = norm(v);
    unit = v / mag;
    ca = unit(1);  cb = unit(2);  cg = unit(3);
    a = rad2deg(acos(ca));
    b = rad2deg(acos(cb));
    g = rad2deg(acos(cg));
end

F = [3, -4, 0];
[ca, cb, cg, a, b, g] = dir_cosines(F);
fprintf('Vector: [%d %d %d],  |F| = %.2f\\n', F, norm(F))
fprintf('cos a = %.4f,  alpha = %.1f deg\\n', ca, a)
fprintf('cos b = %.4f,  beta  = %.1f deg\\n', cb, b)
fprintf('cos g = %.4f,  gamma = %.1f deg\\n', cg, g)
fprintf('Identity: %.6f\\n', ca^2 + cb^2 + cg^2)`,
          prose: [
            `MATLAB's 1-based indexing: \`unit(1)\`, \`unit(2)\`, \`unit(3)\` are the x, y, z components of the unit vector. These are the direction cosines. \`rad2deg(acos(ca))\` converts the arccos result to degrees.`,
            `The function returns all six values at once. The identity check prints $1.000000$. The negative $\\cos\\beta = -0.8$ gives $\\beta = 143.1°$ — an obtuse angle because the y-component is negative. MATLAB's \`acos\` returns angles in $[0, \\pi]$ radians, matching the valid range for direction angles.`,
            `You don't need \`clip\` in MATLAB for this example, but for numerical stability you can write \`acos(max(-1, min(1, ca)))\` to guard against floating-point values slightly outside $[-1, 1]$.`,
          ],
        },
        {
          cellTitle: 'Visualising direction cosines on the unit sphere',
          type: 'code',
          language: 'matlab',
          code:
`figure; hold on;

% Draw unit sphere
[X, Y, Z] = sphere(40);
surf(X, Y, Z, 'FaceAlpha', 0.05, 'EdgeColor', 'none', 'FaceColor', [0.7 0.7 0.7]);

% Plot unit vectors for four cases
vectors = {[1,0,0], 'along +x', 'b';
           [1,1,0], '45 in xy', 'r';
           [1,1,1], 'diagonal', 'g';
           [3,-4,0], 'cable', 'm'};

for i = 1:4
    v = vectors{i,1};
    u = v / norm(v);
    quiver3(0,0,0, u(1),u(2),u(3), 1, vectors{i,3}, 'LineWidth',2, ...
            'DisplayName', sprintf('%s: (%.2f,%.2f,%.2f)', vectors{i,2}, u))
    scatter3(u(1), u(2), u(3), 80, vectors{i,3}, 'filled')
end

xlabel('x (cos α)'); ylabel('y (cos β)'); zlabel('z (cos γ)')
title('Direction cosines = points on the unit sphere')
legend; axis equal; grid on`,
          prose: [
            `\`sphere(40)\` generates a unit sphere with 40 divisions. \`surf(..., ''FaceAlpha'', 0.05)\` makes it nearly transparent so the vectors inside are visible. Each vector's unit version is plotted as both an arrow and a point on the sphere surface.`,
            `The "along +x" vector lands at $(1,0,0)$ on the sphere — on the equator at the $+x$ pole. The diagonal $(1,1,1)/\\sqrt{3}$ lands in the first octant equidistant from all three axes. The cable $(3,-4,0)/5 = (0.6,-0.8,0)$ lands on the equator (z=0) in the fourth quadrant of the xy-plane.`,
            `The key insight: ALL unit vectors, regardless of their original magnitude, map to the same unit sphere. Direction cosines tell you WHERE on that sphere. The identity $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$ is the sphere equation $x^2+y^2+z^2=1$.`,
          ],
        },
        {
          cellTitle: '3D cable tension decomposition',
          type: 'code',
          language: 'matlab',
          code:
`function [Fx, Fy, Fz] = cable_components(T, alpha_deg, beta_deg, z_pos)
    ca = cos(deg2rad(alpha_deg));
    cb = cos(deg2rad(beta_deg));
    cos2g = 1 - ca^2 - cb^2;
    if cos2g < -1e-10
        error('Invalid: sum of first two cos^2 exceeds 1');
    end
    cg = sqrt(max(0, cos2g)) * (2*z_pos - 1);  % +1 if z_pos=true, -1 if false
    fprintf('Identity check: %.6f\\n', ca^2 + cb^2 + cg^2)
    Fx = T * ca;  Fy = T * cb;  Fz = T * cg;
end

% Cable 1: alpha=60, beta=45, gamma<90 (z_positive=true)
[Fx1, Fy1, Fz1] = cable_components(200, 60, 45, true);
fprintf('Cable 1: Fx=%.1f N, Fy=%.1f N, Fz=%.1f N\\n', Fx1, Fy1, Fz1)
fprintf('Magnitude: %.1f N\\n', norm([Fx1, Fy1, Fz1]))

% Cable 2: alpha=50, beta=40, gamma>90 (z_positive=false)
[Fx2, Fy2, Fz2] = cable_components(300, 50, 40, false);
fprintf('\\nCable 2: Fx=%.1f N, Fy=%.1f N, Fz=%.1f N\\n', Fx2, Fy2, Fz2)

fprintf('\\nNet force: (%.1f, %.1f, %.1f) N\\n', Fx1+Fx2, Fy1+Fy2, Fz1+Fz2)`,
          prose: [
            `The expression \`(2*z_pos - 1)\` converts MATLAB's logical \`true/false\` to $+1/-1$ — a compact way to apply the sign. When \`z_pos = true\`, result is $+1$; when \`false\`, result is $-1$. This determines whether $\\cos\\gamma$ is positive (angle < 90°) or negative (angle > 90°).`,
            `For Cable 1: $\\cos\\gamma = \\sqrt{1 - 0.25 - 0.5} = 0.5$, giving $(100, 141.4, 100)$ N. The identity check prints 1.000000 — confirming the direction cosines are valid before the forces are computed.`,
            `Net force combines both cables. In a full equilibrium problem, you'd add the weight of the sign (downward) and verify that the net force is zero at the attachment point. This is the starting point for any 3D truss analysis.`,
          ],
        },
        {
          cellTitle: 'Challenge: validate direction cosines and find unknown angle',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode:
`% Part A: Write a function to validate direction cosines
function check_dir_cosines(ca, cb, cg, label)
    s = ca^2 + cb^2 + cg^2;
    % TODO: if s is close to 1 (use abs(s-1) < 1e-6):
    %   print angles in degrees using rad2deg(acos(...))
    % else:
    %   print label and how much s differs from 1
end

check_dir_cosines(0.6,  -0.8,  0.0,  'Cable A')
check_dir_cosines(0.9,   0.9,  0.1,  'Cable B')
check_dir_cosines(1/sqrt(3), 1/sqrt(3), 1/sqrt(3), 'Diagonal')

% Part B: Cable has alpha=60°, beta=45°, z > 0.
% Find cos_gamma and all three direction angles.
alpha_deg = 60;  beta_deg = 45;
% TODO: compute ca, cb, cos_gamma, then all three angles`,
          prose: [
            `For Part A: compute \`s = ca^2 + cb^2 + cg^2\`. If \`abs(s - 1) < 1e-6\`, print the three angles using \`rad2deg(acos(ca))\` etc. Otherwise print \`sprintf('%s INVALID: sum = %.6f', label, s)\`. Cable B should fail because $0.81 + 0.81 + 0.01 = 1.63 \\ne 1$.`,
            `For Part B: \`ca = cos(deg2rad(60))\`, \`cb = cos(deg2rad(45))\`, then \`cg = sqrt(1 - ca^2 - cb^2)\` (positive root for $z > 0$). The three angles follow from \`rad2deg(acos(...))\`. The identity should hold to 6 decimal places.`,
            `This challenge tests whether you can use the identity in BOTH directions: validating a given set of cosines (Part A) and computing a missing cosine from two known ones (Part B). Both skills are essential in structural engineering and aerospace applications.`,
          ],
        },
      ],
    },
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-017-q1',
      type: 'choice',
      question: `The direction angle $\\alpha$ is the angle between a vector $\\vec{A}$ and which axis?`,
      options: [
        `The $y$-axis`,
        `The $z$-axis`,
        `The $x$-axis`,
        `The origin`,
      ],
      answer: `The $x$-axis`,
      hints: [
        `The Greek letters go in order: $\\alpha$ (first letter) → $x$ (first axis), $\\beta$ → $y$, $\\gamma$ → $z$.`,
        `$\\cos\\alpha = A_x / |\\vec{A}|$ — the x-component divided by the magnitude.`,
      ],
      reviewSection: 'intuition',
      explanation: `By convention: $\\alpha$ is the angle with the $x$-axis, $\\beta$ with $y$, $\\gamma$ with $z$. So $\\cos\\alpha = A_x / |\\vec{A}|$.`,
    },
    {
      id: 'p1-ch1-017-q2',
      type: 'choice',
      question: `For $\\vec{A} = (3, 0, 0)$, what is $\\cos\\alpha$?`,
      options: [
        `$0$`,
        `$3$`,
        `$1$`,
        `$1/3$`,
      ],
      answer: `$1$`,
      hints: [
        `$|\\vec{A}| = 3$. Then $\\cos\\alpha = A_x / |\\vec{A}| = ?$`,
        `The vector points entirely along $+x$, so it makes a 0° angle with the x-axis.`,
      ],
      reviewSection: 'intuition',
      explanation: `$\\cos\\alpha = 3/3 = 1$. The vector points along $+x$, so the angle is $0°$ and $\\cos 0° = 1$.`,
    },
    {
      id: 'p1-ch1-017-q3',
      type: 'choice',
      question: `The direction cosines of any vector always satisfy:`,
      options: [
        `$\\cos\\alpha + \\cos\\beta + \\cos\\gamma = 1$`,
        `$\\cos\\alpha \\cdot \\cos\\beta \\cdot \\cos\\gamma = 1$`,
        `$\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$`,
        `$\\cos\\alpha = \\cos\\beta = \\cos\\gamma$`,
      ],
      answer: `$\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$`,
      hints: [
        `The direction cosines are the components of the unit vector $\\hat{A}$.`,
        `What is the magnitude of a unit vector?`,
      ],
      reviewSection: 'intuition',
      explanation: `Direction cosines are components of the unit vector, so $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = |\\hat{A}|^2 = 1$. The other identities are false in general.`,
    },
    {
      id: 'p1-ch1-017-q4',
      type: 'choice',
      question: `A vector has $\\cos\\alpha = 0.6$ and $\\cos\\beta = 0.8$. What must $\\cos\\gamma$ equal if the vector has a non-negative $z$-component?`,
      options: [
        `$0.2$`,
        `$0$`,
        `$0.6$`,
        `$1$`,
      ],
      answer: `$0$`,
      hints: [
        `Use the identity: $\\cos^2\\gamma = 1 - \\cos^2\\alpha - \\cos^2\\beta$.`,
        `$1 - 0.36 - 0.64 = ?$`,
      ],
      reviewSection: 'math',
      explanation: `$\\cos^2\\gamma = 1 - 0.36 - 0.64 = 0$, so $\\cos\\gamma = 0$. The vector lies in the xy-plane and makes 90° with the z-axis.`,
    },
    {
      id: 'p1-ch1-017-q5',
      type: 'choice',
      question: `Find $\\cos\\alpha$ for $\\vec{A} = (1, 1, 1)$.`,
      options: [
        `$1$`,
        `$1/\\sqrt{3}$`,
        `$1/3$`,
        `$\\sqrt{3}$`,
      ],
      answer: `$1/\\sqrt{3}$`,
      hints: [
        `$|\\vec{A}| = \\sqrt{1+1+1} = \\sqrt{3}$.`,
        `$\\cos\\alpha = A_x / |\\vec{A}| = 1/\\sqrt{3}$.`,
      ],
      reviewSection: 'examples',
      explanation: `$|\\vec{A}|=\\sqrt{3}$, so $\\cos\\alpha = 1/\\sqrt{3} \\approx 0.577$. All three cosines are equal, and $3 \\times (1/\\sqrt{3})^2 = 1$ ✓.`,
    },
    {
      id: 'p1-ch1-017-q6',
      type: 'choice',
      question: `Can a direction angle be greater than 90°?`,
      options: [
        `No — angles must be between 0° and 90°`,
        `Yes — if the corresponding component is negative, the angle is between 90° and 180°`,
        `Yes, but only $\\gamma$`,
        `No — direction cosines are always positive`,
      ],
      answer: `Yes — if the corresponding component is negative, the angle is between 90° and 180°`,
      hints: [
        `$\\cos\\alpha = A_x / |\\vec{A}|$. What happens when $A_x < 0$?`,
        `$\\cos\\alpha < 0$ means $\\alpha > 90°$.`,
      ],
      reviewSection: 'intuition',
      explanation: `A negative component gives a negative direction cosine, which corresponds to an obtuse angle. For example, $A_x = -1$ gives $\\cos\\alpha = -1$, so $\\alpha = 180°$. All direction angles lie in $[0°, 180°]$.`,
    },
    {
      id: 'p1-ch1-017-q7',
      type: 'choice',
      question: `How many direction cosines can you freely choose before the identity determines the third?`,
      options: [
        `All three are independent`,
        `Two — the third's squared value is determined by the identity`,
        `Only one`,
        `None — all are determined by the magnitude`,
      ],
      answer: `Two — the third's squared value is determined by the identity`,
      hints: [
        `The identity $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$ gives $\\cos^2\\gamma = 1 - \\cos^2\\alpha - \\cos^2\\beta$.`,
        `A direction in 3D has how many degrees of freedom? (Think: latitude and longitude on a sphere.)`,
      ],
      reviewSection: 'rigor',
      explanation: `Specifying two direction cosines determines the squared value of the third. The sign is a separate choice (positive or negative $z$). This reflects that a direction in 3D has 2 degrees of freedom — like latitude and longitude.`,
    },
    {
      id: 'p1-ch1-017-q8',
      type: 'choice',
      question: `The direction cosines $(\\cos\\alpha, \\cos\\beta, \\cos\\gamma)$ are the components of which vector?`,
      options: [
        `$\\vec{A}$ itself`,
        `$2\\vec{A}$`,
        `The unit vector $\\hat{A} = \\vec{A}/|\\vec{A}|$`,
        `The zero vector`,
      ],
      answer: `The unit vector $\\hat{A} = \\vec{A}/|\\vec{A}|$`,
      hints: [
        `$\\cos\\alpha = A_x / |\\vec{A}|$. What does dividing each component by $|\\vec{A}|$ give you?`,
        `A vector divided by its own magnitude is the unit vector in the same direction.`,
      ],
      reviewSection: 'intuition',
      explanation: `Direction cosines are the components of $\\hat{A} = \\vec{A}/|\\vec{A}|$. The identity $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$ follows because $|\\hat{A}|^2 = 1$.`,
    },
    {
      id: 'p1-ch1-017-q9',
      type: 'choice',
      question: `A vector $\\vec{A}$ points along the $-y$ direction. What is $\\beta$ (the angle it makes with the $+y$ axis)?`,
      options: [
        `$0°$`,
        `$90°$`,
        `$180°$`,
        `$-90°$`,
      ],
      answer: `$180°$`,
      hints: [
        `The vector points along $-y$, so $A_y < 0$ and $A_x = A_z = 0$.`,
        `$\\cos\\beta = A_y / |\\vec{A}| = -1$. What angle has cosine $-1$?`,
      ],
      reviewSection: 'intuition',
      explanation: `$\\vec{A} = (0,-1,0)$ gives $\\cos\\beta = -1/1 = -1$, so $\\beta = \\arccos(-1) = 180°$. The vector points directly away from the $+y$ axis.`,
    },
    {
      id: 'p1-ch1-017-q10',
      type: 'choice',
      question: `A cable in a 3D truss has direction angles $\\alpha=60°$ and $\\beta=45°$. What is the maximum number of valid values for $\\gamma$?`,
      options: [
        `$0$ — these angles are impossible`,
        `Exactly $1$`,
        `$2$ — one with $\\gamma < 90°$ and one with $\\gamma > 90°$`,
        `Infinitely many`,
      ],
      answer: `$2$ — one with $\\gamma < 90°$ and one with $\\gamma > 90°$`,
      hints: [
        `From the identity: $\\cos^2\\gamma = 1 - \\cos^2 60° - \\cos^2 45° = 1 - 0.25 - 0.5 = 0.25$.`,
        `$\\cos\\gamma = \\pm 0.5$ — two solutions.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\cos^2\\gamma = 0.25$ gives $\\cos\\gamma = \\pm 0.5$. So $\\gamma = 60°$ or $\\gamma = 120°$ — the cable could point into either the positive or negative $z$ half-space. Additional context (which way the cable actually runs) resolves the ambiguity.`,
    },
  ],

  // ── Misconceptions ───────────────────────────────────────────────────────
  misconceptions: [
    {
      id: 'p1-ch1-017-m1',
      misconception: `The three direction angles must sum to 180° (like angles in a triangle).`,
      correction: `The direction cosines satisfy $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$, NOT $\\alpha + \\beta + \\gamma = 180°$. For the "body diagonal" $(1,1,1)$, all three angles are $\\approx 54.7°$, summing to $\\approx 164°$, not 180°. The identity involves the SQUARES of the cosines, not the angles themselves.`,
      correctionExample: `$\\vec{A}=(1,0,0)$: angles are $0°, 90°, 90°$ — sum = 180° (coincidence). $\\vec{A}=(1,1,1)$: angles are $\\approx 54.7°, 54.7°, 54.7°$ — sum ≈ 164°. The sum-to-180° rule is not a general truth.`,
    },
    {
      id: 'p1-ch1-017-m2',
      misconception: `You can freely choose any three numbers as direction cosines, as long as they're between -1 and 1.`,
      correction: `Direction cosines must satisfy $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$. You cannot pick three arbitrary values in $[-1,1]$. For example, $(0.9, 0.9, 0.9)$ is invalid: $0.81 + 0.81 + 0.81 = 2.43 \\ne 1$. Only if the sum of squares equals 1 do the numbers represent a valid 3D direction.`,
      correctionExample: `$(0.6, -0.8, 0.0)$: valid — $0.36 + 0.64 + 0 = 1.00$ ✓. $(0.5, 0.5, 0.5)$: invalid — $0.25 + 0.25 + 0.25 = 0.75 \\ne 1$. To make three equal values valid, each must be $1/\\sqrt{3}\\approx0.577$.`,
    },
  ],

  // ── Transfer Prompts ─────────────────────────────────────────────────────
  transferPrompts: [
    {
      id: 'p1-ch1-017-t1',
      prompt: `A satellite antenna must point toward Earth. At a given moment, the direction from the satellite to Earth has components $(−3, 4, −2)$ km (relative to the satellite's reference frame). Find the direction cosines and direction angles of the required pointing direction.`,
      hint: 'Normalize the displacement vector to get the unit vector — its components ARE the direction cosines.',
    },
    {
      id: 'p1-ch1-017-t2',
      prompt: `An aerospace student claims a wing strut makes angles of $\\alpha=30°$, $\\beta=45°$, and $\\gamma=75°$ with the three body axes. Without computing the full vector, quickly determine whether these angles are geometrically possible. Explain your reasoning.`,
      hint: 'Compute $\\cos^2 30° + \\cos^2 45° + \\cos^2 75°$ and check whether it equals 1.',
    },
  ],

  // ── Debugging ────────────────────────────────────────────────────────────
  debugging: [
    {
      id: 'p1-ch1-017-d1',
      buggyCode:
`# Student's direction cosines
import numpy as np
A = np.array([3, -4, 0])
cos_alpha = 3      # BUG: forgot to divide by magnitude
cos_beta  = -4
cos_gamma = 0
print(f"Identity check: {cos_alpha**2 + cos_beta**2 + cos_gamma**2}")`,
      expectedOutput: `Identity check: 1.0`,
      actualOutput: `Identity check: 25`,
      explanation: `The student used the raw components instead of dividing by the magnitude. Direction cosines are $\\cos\\alpha = A_x/|\\vec{A}|$, not $A_x$ itself. Fix: \`mag = np.linalg.norm(A); cos_alpha = A[0]/mag; cos_beta = A[1]/mag; cos_gamma = A[2]/mag\`. The identity then gives $0.36 + 0.64 + 0 = 1$.`,
    },
    {
      id: 'p1-ch1-017-d2',
      buggyCode:
`% MATLAB — finding the third direction cosine
alpha_deg = 60;  beta_deg = 45;
ca = cos(deg2rad(alpha_deg));
cb = cos(deg2rad(beta_deg));
cg = 1 - ca^2 - cb^2;  % BUG: forgot to take the square root
gamma_deg = rad2deg(acos(cg));
fprintf('gamma = %.1f deg\\n', gamma_deg)`,
      expectedOutput: `gamma = 60.0 deg`,
      actualOutput: `gamma = 75.5 deg`,
      explanation: `The student computed $\\cos^2\\gamma = 1 - \\cos^2\\alpha - \\cos^2\\beta = 0.25$ correctly, but then passed $0.25$ to \`acos\` instead of $\\sqrt{0.25} = 0.5$. The fix is \`cg = sqrt(1 - ca^2 - cb^2)\` (for $\\gamma < 90°$). Then \`acos(0.5)\` gives the correct 60°, not \`acos(0.25)\` = 75.5°.`,
    },
  ],

  // ── Mastery ───────────────────────────────────────────────────────────────
  mastery: {
    targetLevel: `Given any 3D vector, compute its direction cosines and angles from memory. Given two direction cosines, use the identity to find the third (with the correct sign). Immediately recognize when a proposed set of direction cosines is invalid.`,
    coreSkill: `Three-step procedure: compute magnitude, divide each component, verify identity. Run the identity check every time — it's a 5-second arithmetic check that catches all errors.`,
    commonSticking: `Forgetting to divide by the magnitude (using raw components as direction cosines), or forgetting to take the square root when computing the third cosine from the identity.`,
    connections: `Unit vector components (connect to vector arithmetic); dot product (direction cosines appear in $\\cos\\theta = \\hat{A}\\cdot\\hat{B}$); 3D rotation matrices / DCMs (connect to linear algebra and aerospace engineering); spherical coordinates (connect to multivariable calculus).`,
  },

  // ── Semantics ──────────────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: `\\cos\\alpha`, meaning: 'Direction cosine for x-axis: ratio of x-component to magnitude; equals the x-component of the unit vector' },
      { symbol: `\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1`, meaning: 'Direction cosine identity — Pythagorean theorem applied to the unit vector; must hold for any valid direction' },
      { symbol: `\\hat{A} = (\\cos\\alpha, \\cos\\beta, \\cos\\gamma)`, meaning: 'Unit vector = triple of direction cosines; all three are its Cartesian components' },
      { symbol: `\\alpha, \\beta, \\gamma \\in [0°, 180°]`, meaning: 'Valid range for direction angles — all three are acute or obtuse, never negative or greater than 180°' },
    ],
    rulesOfThumb: [
      `Direction cosines are components of the unit vector — always divide by the magnitude, never use raw components.`,
      `Always run the identity check: $\\cos^2\\alpha + \\cos^2\\beta + \\cos^2\\gamma = 1$. If it fails, your cosines are invalid.`,
      `A negative component gives an obtuse angle (between 90° and 180°) — that's correct, not an error.`,
      `You can only freely choose two direction cosines; the third is $\\pm\\sqrt{1-\\cos^2\\alpha-\\cos^2\\beta}$.`,
      `Two direction cosines cannot both exceed $1/\\sqrt{2} \\approx 0.707$ — the identity wouldn't leave room for the third.`,
    ],
  },
}
