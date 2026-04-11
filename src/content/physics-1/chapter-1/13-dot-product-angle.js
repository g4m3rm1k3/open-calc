export default {
  id: 'p1-ch1-013',
  slug: 'dot-product-angle',
  chapter: 'p1',
  order: 13,
  title: 'Dot Product — Angle Between Vectors',
  subtitle: 'Use the dot product to find the exact angle between any two vectors, in any dimension.',
  tags: ['dot product', 'angle between vectors', 'arccos', 'cosine formula', '3D geometry'],
  aliases: 'dot product angle arccos cosine angle between vectors',

  hook: {
    question: 'A robot arm has two links. The first points in direction (3, 0, 4). The second points in direction (1, 2, -1). What is the joint angle between them?',
    realWorldContext:
      'This is a real robotics problem. Every robot joint angle, every molecular bond angle in chemistry, every lighting angle in 3D graphics — all are computed using the same formula: $\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}\\right)$. This single equation is one of the most-used formulas in all of computational physics.',
    previewVisualizationId: 'SVGDiagram',
  },

  videos: [{
    title: 'Physics 1 – Vectors (15 of 21) Dot Product: Angle Between the Two Vectors',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      `We have two equivalent formulas for the dot product:
- **Geometric**: $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi$
- **Component**: $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$

The component formula is easy to compute. The geometric formula contains $\\cos\\phi$. If we equate them and isolate $\\phi$, we get a way to find the angle between any two vectors using only their components — no protractor, no geometry, no sketching.`,

      `Rearranging: $\\cos\\phi = \\dfrac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|} = \\dfrac{A_xB_x+A_yB_y+A_zB_z}{\\sqrt{A_x^2+A_y^2+A_z^2}\\cdot\\sqrt{B_x^2+B_y^2+B_z^2}}$

Then apply $\\arccos$ to both sides to get $\\phi$.`,

      `Key insight: $\\cos\\phi$ is always between −1 and +1 by the Cauchy-Schwarz inequality, so $\\arccos$ always produces a valid answer. The result is always between 0° and 180°.

- If $\\cos\\phi > 0$: acute angle (less than 90°).
- If $\\cos\\phi = 0$: right angle (exactly 90°) — this is orthogonality.
- If $\\cos\\phi < 0$: obtuse angle (greater than 90°).`,

      `This formula works identically in 2D, 3D, or any dimension. You just add more component pairs to the dot product and the magnitudes. This is why it's so powerful for robotics and physics simulations.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Angle between two vectors',
        body: `\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}\\right)

where $0° \\le \\phi \\le 180°$ (the formula always gives the smaller of the two possible angles).`,
      },
      {
        type: 'insight',
        title: 'Sign of the dot product → type of angle',
        body: `$\\vec{A}\\cdot\\vec{B} > 0 \\Rightarrow \\phi < 90°$ (acute)
$\\vec{A}\\cdot\\vec{B} = 0 \\Rightarrow \\phi = 90°$ (right angle)
$\\vec{A}\\cdot\\vec{B} < 0 \\Rightarrow \\phi > 90°$ (obtuse)

Check the sign first — it tells you the range before you do any calculation.`,
      },
      {
        type: 'warning',
        title: '$\\arccos$ always returns 0° to 180°',
        body: `The formula $\\phi = \\arccos(\\cos\\phi)$ always gives an angle in $[0°, 180°]$.
This is the angle "between" the vectors when placed tail-to-tail.
It is NOT the same as the direction angle from the +x axis.
Don't confuse $\\phi$ (angle between vectors) with $\\theta$ (angle from +x axis).`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Two paths to the same number',
        caption: `Geometric: $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$.
Component: $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$.
Set them equal, divide by $|A||B|$: $\\cos\\phi = \\frac{A_xB_x+A_yB_y}{|A||B|}$.
The projection picture makes this formula inevitable.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Angle between vectors — the arccos formula',
        caption: `The angle is measured tail-to-tail: $\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}\\right)$. Rotating both vectors by the same amount leaves $\\phi$ unchanged. The result is always in $[0°, 180°]$.`,
      },
    ],
  },

  math: {
    prose: [
      `**The three-step procedure:**

1. Compute the dot product: $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$
2. Compute the magnitudes: $|\\vec{A}| = \\sqrt{A_x^2+A_y^2+A_z^2}$, $|\\vec{B}| = \\sqrt{B_x^2+B_y^2+B_z^2}$
3. Apply $\\arccos$: $\\phi = \\arccos\\!\\left(\\dfrac{\\text{step 1}}{\\text{step 2}}\\right)$

This is always the same three steps, regardless of dimension.`,

      `A common efficiency: for **unit vectors** ($|\\vec{A}|=|\\vec{B}|=1$), the formula reduces to $\\phi = \\arccos(\\vec{A}\\cdot\\vec{B})$ — no magnitudes needed. This is why physicists normalise vectors before finding angles.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Three-step angle formula',
        body: `\\text{Step 1: } d = \\vec{A}\\cdot\\vec{B} = \\sum_i A_i B_i
\\text{Step 2: } |A| = \\sqrt{\\sum_i A_i^2},\\quad |B| = \\sqrt{\\sum_i B_i^2}
\\text{Step 3: } \\phi = \\arccos\\!\\left(\\frac{d}{|A||B|}\\right)`,
      },
      {
        type: 'insight',
        title: 'For unit vectors: one step',
        body: `If $|\\hat{A}|=|\\hat{B}|=1$, then $\\phi = \\arccos(\\hat{A}\\cdot\\hat{B})$.
Normalize first with $\\hat{A} = \\vec{A}/|\\vec{A}|$, then take the dot product.`,
      },
      {
        type: 'theorem',
        title: 'Acute vs obtuse — quick check',
        body: `Before applying $\\arccos$, check the sign of $\\vec{A}\\cdot\\vec{B}$:
- Positive: $\\phi < 90°$ (acute) — no need to calculate if that's all you need
- Zero: $\\phi = 90°$ exactly
- Negative: $\\phi > 90°$ (obtuse)`,
      },
    ],
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Angle formula — 2D and 3D',
      caption: `$\\cos\\phi = \\frac{A_xB_x+A_yB_y+A_zB_z}{|\\vec{A}||\\vec{B}|}$. Divide the component dot product by the product of magnitudes to get $\\cos\\phi$, then apply $\\arccos$.`,
    }],
  },

  rigor: {
    prose: [
      `The formula $\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}$ is bounded: the Cauchy-Schwarz inequality proves $|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|$, so the ratio is always in $[-1, 1]$, and $\\arccos$ is well-defined.

In fact, in higher mathematics, this formula is used **as the definition** of the angle between two vectors in $\\mathbb{R}^n$. We cannot directly measure angles in 10D space — but we can compute dot products. The formula works in any dimension.`,

      `The **Law of Cosines** for triangles is a direct consequence. For a triangle with sides $\\vec{A}$, $\\vec{B}$, $\\vec{C} = \\vec{B} - \\vec{A}$:
$|\\vec{C}|^2 = |\\vec{B}-\\vec{A}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2\\vec{A}\\cdot\\vec{B} = |\\vec{A}|^2+|\\vec{B}|^2-2|\\vec{A}||\\vec{B}|\\cos\\phi$

This is the familiar law of cosines from trigonometry — derived from the dot product.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cauchy-Schwarz inequality',
        body: `|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|

This guarantees $-1 \\le \\cos\\phi \\le 1$, so $\\arccos$ is always well-defined.
Equality holds iff the vectors are parallel ($\\phi = 0°$ or $180°$).`,
      },
      {
        type: 'theorem',
        title: 'Law of Cosines (vector form)',
        body: `|\\vec{B}-\\vec{A}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}
= |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi`,
      },
    ],
    proofSteps: [
      {
        title: 'Two formulas for the same number',
        expression: `\\underbrace{A_xB_x+A_yB_y}_{\\text{component}} = \\underbrace{|\\vec{A}||\\vec{B}|\\cos\\phi}_{\\text{geometric}}`,
        annotation: 'Both formulas give the same scalar. We proved this in the previous lesson.',
      },
      {
        title: 'Divide both sides by $|\\vec{A}||\\vec{B}|$',
        expression: `\\cos\\phi = \\frac{A_xB_x+A_yB_y}{|\\vec{A}||\\vec{B}|}`,
        annotation: 'Valid as long as both vectors are non-zero.',
      },
      {
        title: 'Cauchy-Schwarz ensures $|\\cos\\phi| \\le 1$',
        expression: '|A_xB_x+A_yB_y| \\le \\sqrt{A_x^2+A_y^2}\\cdot\\sqrt{B_x^2+B_y^2}',
        annotation: 'So the ratio is always in $[-1,1]$ and $\\arccos$ is well-defined.',
      },
      {
        title: 'Apply arccos',
        expression: `\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}\\right), \\quad \\phi \\in [0°, 180°]`,
        annotation: 'The unique angle between 0° and 180° whose cosine equals the ratio.',
      },
    ],
    title: 'Deriving the angle formula from the two dot product definitions',
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Angle range and dot product sign',
      caption: `$\\arccos$ always returns $[0°, 180°]$. If $\\vec{A}\\cdot\\vec{B} > 0$: acute angle. If $= 0$: right angle. If $< 0$: obtuse angle. You can determine the rough angle just from the sign of the dot product.`,
    }],
  },

  python: {
    title: 'Angle Lab — Finding Angles in 2D and 3D',
    description: 'Compute angles between vectors using numpy. Applications: robot kinematics, molecular geometry, lighting in 3D graphics.',
    placement: 'after_rigor',
    visualizations: [{
      id: 'PythonNotebook',
      title: 'Angle Between Vectors Lab',
      mathBridge: 'The three-step formula in Python: dot → magnitudes → arccos.',
      caption: 'Run each cell top-to-bottom.',
      props: {
        initialCells: [
          // ── CELL 1 ───────────────────────────────────────────────────────
          {
            id: 1,
            cellTitle: '1 · The angle formula in Python',
            prose: `The three steps translated to code:
1. \`dot = np.dot(A, B)\`
2. \`norms = np.linalg.norm(A) * np.linalg.norm(B)\`
3. \`phi = np.degrees(np.arccos(dot / norms))\`

We wrap this in a function to reuse it.`,
            code: `import numpy as np

def angle_between(A, B):
    """Return the angle between vectors A and B in degrees (0 to 180)."""
    dot = np.dot(A, B)
    norms = np.linalg.norm(A) * np.linalg.norm(B)
    # Clip to [-1, 1] to avoid arccos domain error from floating-point noise
    cos_phi = np.clip(dot / norms, -1.0, 1.0)
    return np.degrees(np.arccos(cos_phi))

# Test the three landmark cases
A = np.array([1.0, 0.0])   # pointing right

cases = [
    (np.array([1.0, 0.0]),  "same direction (0°)"),
    (np.array([0.0, 1.0]),  "perpendicular (90°)"),
    (np.array([-1.0, 0.0]), "opposite direction (180°)"),
    (np.array([1.0, 1.0]),  "diagonal (45°)"),
]

for B, label in cases:
    phi = angle_between(A, B)
    print(f"{label:30s}: {phi:.2f}°")`,
            output: '', status: 'idle', figureJson: null,
          },
          // ── CELL 2 ───────────────────────────────────────────────────────
          {
            id: 2,
            cellTitle: '2 · Robot arm joint angle',
            prose: `The robot arm from the hook: link 1 points in direction (3, 0, 4), link 2 points in direction (1, 2, −1). What is the joint angle?`,
            code: `# Robot arm links as direction vectors
link1 = np.array([3.0, 0.0, 4.0])   # first link direction
link2 = np.array([1.0, 2.0, -1.0])  # second link direction

joint_angle = angle_between(link1, link2)
print(f"|link1| = {np.linalg.norm(link1):.3f}")
print(f"|link2| = {np.linalg.norm(link2):.3f}")
print(f"link1 · link2 = {np.dot(link1, link2):.3f}")
print(f"cos(phi) = {np.dot(link1, link2)/(np.linalg.norm(link1)*np.linalg.norm(link2)):.4f}")
print(f"Joint angle = {joint_angle:.2f}°")`,
            output: '', status: 'idle', figureJson: null,
          },
          // ── CELL 3: CHALLENGE ─────────────────────────────────────────────
          {
            id: 3,
            cellTitle: '3 · Challenge: molecular bond angle',
            challengeType: 'fill-in',
            challengeNumber: 1,
            challengeTitle: 'Water molecule bond angle',
            difficulty: 'medium',
            prompt: `A water molecule (H₂O) has the oxygen atom at the origin.
The two O-H bonds point in these directions:
- Bond 1: direction = (1.0, 0.0, 0.0)
- Bond 2: direction = (-0.3, 0.95, 0.0)

Compute \`h2o_angle = angle_between(bond1, bond2)\`.
The real H-O-H bond angle in water is about 104.5°. Does your result match?`,
            starterBlock: `bond1 = np.array([___, ___, ___])
bond2 = np.array([___, ___, ___])
h2o_angle = angle_between(___, ___)`,
            code: `bond1 = np.array([1.0, 0.0, 0.0])
bond2 = np.array([-0.3, 0.95, 0.0])
h2o_angle = angle_between(bond1, bond2)
print(f"H-O-H bond angle: {h2o_angle:.2f}°")
print("Real H-O-H angle: ~104.5°")`,
            output: '', status: 'idle', figureJson: null,
            testCode: `import numpy as np
assert "h2o_angle" in dir(), "Compute h2o_angle"
expected = np.degrees(np.arccos(np.dot([1,0,0],[-0.3,0.95,0])/(np.linalg.norm([-0.3,0.95,0]))))
assert np.isclose(h2o_angle, expected, atol=0.1), f"h2o_angle wrong: {h2o_angle:.2f}°"
"SUCCESS: Bond angle ≈ {:.1f}°. The dot product formula works for molecular geometry as easily as for force vectors.".format(h2o_angle)`,
            hint: `bond1 = np.array([1.0, 0.0, 0.0])
bond2 = np.array([-0.3, 0.95, 0.0])
h2o_angle = angle_between(bond1, bond2)
The dot product: 1(-0.3) + 0(0.95) + 0(0) = -0.3. Magnitude of bond2 ≈ 1.0. So cos(phi) ≈ -0.3, phi ≈ 107°.`,
          },
          // ── CELL 4: CHALLENGE ─────────────────────────────────────────────
          {
            id: 4,
            cellTitle: '4 · Challenge: angle sweep',
            challengeType: 'write',
            challengeNumber: 2,
            challengeTitle: 'Plot dot product vs angle',
            difficulty: 'medium',
            prompt: `Verify the relationship $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$ visually.

For a fixed vector $\\vec{A} = (5, 0)$ and $\\vec{B}$ rotating from 0° to 360°:
1. Create \`angles_deg = np.linspace(0, 360, 361)\`
2. For each angle, compute $\\vec{B}(\\theta) = (3\\cos\\theta, 3\\sin\\theta)$
3. Compute \`dots = np.array([np.dot(A, [3*np.cos(r), 3*np.sin(r)]) for r in angles_rad])\`
4. Compute \`theory = 5 * 3 * np.cos(angles_rad)\` (should match dots exactly)
5. Plot both on the same axes.

Store arrays as \`dots\` and \`theory\`.`,
            code: `# Write your solution here
# A = np.array([5.0, 0.0])
# angles_deg = ...
# angles_rad = ...
# dots = ...
# theory = ...
# then plot`,
            output: '', status: 'idle', figureJson: null,
            testCode: `import numpy as np
assert "dots" in dir(), "Compute dots array"
assert "theory" in dir(), "Compute theory array"
assert len(dots) == 361, "Should have 361 values (0° to 360° inclusive)"
assert np.allclose(dots, theory, atol=0.01), "dots and theory should match"
"SUCCESS: dot(A, B(theta)) = |A||B|cos(theta) verified for all 361 angles. The formula is exact."`,
            hint: `angles_deg = np.linspace(0, 360, 361)
angles_rad = np.radians(angles_deg)
A = np.array([5.0, 0.0])
dots = np.array([np.dot(A, np.array([3*np.cos(r), 3*np.sin(r)])) for r in angles_rad])
theory = 5 * 3 * np.cos(angles_rad)
Then matplotlib to plot.`,
          },
        ],
      },
    }],
  },

  examples: [
    {
      id: 'ch1-013-ex1',
      title: '3D angle between vectors',
      problem: `\\text{Find the angle between }\\vec{A}=(1,2,-2)\\text{ and }\\vec{B}=(3,-4,0).`,
      steps: [
        {
          expression: `\\vec{A}\\cdot\\vec{B} = (1)(3)+(2)(-4)+(-2)(0) = 3-8+0 = -5`,
          annotation: 'Component dot product. Negative result → obtuse angle expected.',
        },
        {
          expression: `|\\vec{A}| = \\sqrt{1^2+2^2+(-2)^2} = \\sqrt{1+4+4} = \\sqrt{9} = 3`,
          annotation: 'Magnitude of $\\vec{A}$.',
        },
        {
          expression: `|\\vec{B}| = \\sqrt{3^2+(-4)^2+0^2} = \\sqrt{9+16} = \\sqrt{25} = 5`,
          annotation: 'Magnitude of $\\vec{B}$.',
        },
        {
          expression: `\\cos\\phi = \\frac{-5}{3\\times5} = \\frac{-5}{15} = -\\frac{1}{3}`,
          annotation: 'Negative → confirms obtuse angle.',
        },
        {
          expression: `\\phi = \\arccos\\!\\left(-\\tfrac{1}{3}\\right) \\approx 109.5°`,
          annotation: `$\\arccos(-1/3)\\approx 109.47°$. Interesting: this is also the tetrahedral angle found in diamond crystals and methane (CH₄).`,
        },
      ],
      conclusion: `$\\phi\\approx109.5°$. The negative dot product correctly predicted an obtuse angle.`,
    },
    {
      id: 'ch1-013-ex2',
      title: 'Angle between force and displacement',
      problem: `\\text{A force }\\vec{F}=(8,6)\\,N\\text{ acts as an object moves along }\\vec{d}=(3,4)\\,m.
\\text{Find the angle between them, then compute the work.}`,
      steps: [
        {
          expression: `\\vec{F}\\cdot\\vec{d} = (8)(3)+(6)(4) = 24+24 = 48`,
          annotation: 'Component dot product.',
        },
        {
          expression: `|\\vec{F}|=\\sqrt{64+36}=10\\,N,\\quad |\\vec{d}|=\\sqrt{9+16}=5\\,m`,
          annotation: 'Magnitudes.',
        },
        {
          expression: `\\cos\\phi = \\frac{48}{10\\times5} = \\frac{48}{50} = 0.96`,
          annotation: 'Ratio. Very close to 1 — vectors are nearly parallel.',
        },
        {
          expression: `\\phi = \\arccos(0.96) \\approx 16.3°`,
          annotation: 'Small angle — force and motion are mostly aligned.',
        },
        {
          expression: `W = \\vec{F}\\cdot\\vec{d} = 48\\,J \\quad(\\text{or: }|F||d|\\cos\\phi = 10\\times5\\times0.96=48\\,J)`,
          annotation: 'Both methods give the same work.',
        },
      ],
      conclusion: `$\\phi\\approx16.3°$, $W=48\\,J$. The nearly-parallel alignment means almost maximum work transfer.`,
    },
  ],

  challenges: [
    {
      id: 'ch1-013-ch1',
      difficulty: 'easy',
      problem: `\\text{Find the angle between }\\vec{A}=(1,1)\\text{ and }\\vec{B}=(1,0).`,
      hint: `$\\vec{A}=(1,1)$ points at 45° from the +x axis. $\\vec{B}=(1,0)$ points along +x. The angle between them should be 45°.`,
      walkthrough: [
        {
          expression: `\\vec{A}\\cdot\\vec{B} = 1(1)+1(0) = 1`,
          annotation: 'Dot product.',
        },
        {
          expression: `|\\vec{A}|=\\sqrt{2},\\quad |\\vec{B}|=1`,
          annotation: 'Magnitudes.',
        },
        {
          expression: `\\cos\\phi = \\frac{1}{\\sqrt{2}\\times1} = \\frac{1}{\\sqrt{2}} \\Rightarrow \\phi = 45°`,
          annotation: `$\\arccos(1/\\sqrt{2}) = 45°$ exactly. ✓`,
        },
      ],
      answer: `\\phi = 45°`,
    },
    {
      id: 'ch1-013-ch2',
      difficulty: 'medium',
      problem: `\\text{Three position vectors point from the origin: }
\\vec{A}=(1,0,0),\\;\\vec{B}=(0,1,0),\\;\\vec{C}=(1,1,1).
\\text{Find all three pairwise angles.}`,
      hint: `Use the formula for each pair. $\\vec{A}\\cdot\\vec{B}=0$, so that angle is 90°. $\\vec{A}\\cdot\\vec{C}=1$, $|\\vec{C}|=\\sqrt{3}$.`,
      walkthrough: [
        {
          expression: `\\phi_{AB}=\\arccos\\!\\left(\\frac{0}{1\\cdot1}\\right) = 90°`,
          annotation: `$\\hat{\\imath}\\perp\\hat{\\jmath}$ — standard basis vectors are orthogonal.`,
        },
        {
          expression: `\\phi_{AC}=\\arccos\\!\\left(\\frac{1}{1\\cdot\\sqrt{3}}\\right) = \\arccos\\!\\left(\\tfrac{1}{\\sqrt{3}}\\right) \\approx 54.7°`,
          annotation: `$\\vec{A}\\cdot\\vec{C}=1$. $|\\vec{C}|=\\sqrt{3}$.`,
        },
        {
          expression: `\\phi_{BC}=\\arccos\\!\\left(\\frac{1}{1\\cdot\\sqrt{3}}\\right) \\approx 54.7°`,
          annotation: `By symmetry ($\\vec{B}\\cdot\\vec{C}=1$ as well), same angle as $\\phi_{AC}$.`,
        },
      ],
      answer: `\\phi_{AB}=90°,\\quad \\phi_{AC}=\\phi_{BC}\\approx54.7°`,
    },
    {
      id: 'ch1-013-ch3',
      difficulty: 'hard',
      problem: `\\text{In a solar panel problem: the sun's rays are in direction }\\hat{s}=(\\cos40°, -\\sin40°)\\text{ (40° below horizontal).}
\\text{Panel 1 is horizontal: normal }\\hat{n}_1=(0,1).
\\text{Panel 2 is tilted to face the sun directly: normal }\\hat{n}_2=(-\\cos40°, \\sin40°).
\\text{Find the angle between each panel's normal and the sun's rays. Which collects more power?}`,
      hint: `Power output is proportional to $\\cos\\phi$ where $\\phi$ is the angle between the sun-direction and the panel normal. Smaller angle = more power.`,
      walkthrough: [
        {
          expression: `\\hat{s}\\cdot\\hat{n}_1 = (\\cos40°)(0)+(-\\sin40°)(1) = -\\sin40° \\approx -0.643`,
          annotation: `Angle $= \\arccos(-0.643) \\approx 130°$ — obtuse! The sun hits the back of the horizontal panel at 40° sun elevation → front angle is $90°-40°=50°$ from sun direction. Let\'s use the acute angle: panel 1 collects $\\cos50°\\approx0.643$ of max.`,
        },
        {
          expression: `\\hat{s}\\cdot\\hat{n}_2 = \\cos40°(-\\cos40°)+(-\\sin40°)(\\sin40°) = -(\\cos^240°+\\sin^240°) = -1`,
          annotation: `Wait — $\\hat{n}_2 = (-\\cos40°, \\sin40°)$ and $\\hat{s} = (\\cos40°, -\\sin40°)$ are anti-parallel! $\\cos\\phi = -1 \\Rightarrow \\phi = 180°$.`,
        },
        {
          expression: `\\text{Correct: face the panel toward the sun means }\\hat{n}_2 = -\\hat{s} = (-\\cos40°, \\sin40°)`,
          annotation: `The normal points toward the sun. $\\hat{n}_2\\cdot\\hat{s} = -(cos^2 40° + sin^2 40°) = -1$.
This means the panel FACES the sun (normal is anti-parallel to sun direction = pointing toward it). Effective angle = 0°, max power. ✓`,
        },
      ],
      answer: `\\text{Tilted panel facing sun: max power (angle between normal and sun-ray = 0°). Horizontal panel: } \\cos50°\\approx 64\\%\\text{ of max.}`,
    },
  ],

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-013-q1',
      question: `The formula for the angle between two vectors is:`,
      options: [
        `$\\phi = \\arcsin\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}\\right)$`,
        `$\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}\\right)$`,
        `$\\phi = \\arctan\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}\\right)$`,
        `$\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}$`,
      ],
      answer: 1,
      explanation: `From $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$, solving for $\\phi$: $\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}$, then $\\phi = \\arccos(\\ldots)$.`,
    },
    {
      id: 'p1-ch1-013-q2',
      question: `$\\vec{A} = (1, 1)$, $\\vec{B} = (1, -1)$. What is the angle between them?`,
      options: [`$45°$`, `$90°$`, `$135°$`, `$60°$`],
      answer: 1,
      explanation: `$\\vec{A}\\cdot\\vec{B} = 1-1 = 0$. So $\\cos\\phi = 0$ and $\\phi = 90°$.`,
    },
    {
      id: 'p1-ch1-013-q3',
      question: `The angle formula always returns a value in the range:`,
      options: [`$(-90°, 90°)$`, `$[0°, 180°]$`, `$[0°, 360°]$`, `$(-180°, 180°]$`],
      answer: 1,
      explanation: `$\\arccos$ always returns $[0°, 180°]$. Angles between vectors are measured as the smaller angle between the arrows, so this range is sufficient.`,
    },
    {
      id: 'p1-ch1-013-q4',
      question: `$\\vec{A} = (1, 0, 0)$, $\\vec{B} = (0, 1, 0)$. What angle does the formula give?`,
      options: [`$0°$`, `$45°$`, `$90°$`, `$180°$`],
      answer: 2,
      explanation: `$\\vec{A}\\cdot\\vec{B} = 0$. $\\cos\\phi = 0/1 = 0$. $\\phi = \\arccos(0) = 90°$.`,
    },
    {
      id: 'p1-ch1-013-q5',
      question: `Why does dividing the dot product by $|\\vec{A}||\\vec{B}|$ give $\\cos\\phi$?`,
      options: [
        `It normalises the result to $[0, 1]$`,
        `Dividing by the magnitudes converts to unit vectors; the dot product of unit vectors is $\\cos\\phi$`,
        `It makes the formula dimensionless`,
        `Both B and C`,
      ],
      answer: 3,
      explanation: `$\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|} = \\hat{A}\\cdot\\hat{B} = \\cos\\phi$. Dividing by magnitudes normalises to unit vectors. The result is dimensionless AND equals $\\cos\\phi$. Both B and C are correct.`,
    },
    {
      id: 'p1-ch1-013-q6',
      question: `$\\vec{A} = (3, 0, 4)$. What is $|\\vec{A}|$ and $\\hat{A}$?`,
      options: [
        `$|A|=5$, $\\hat{A}=(3/5, 0, 4/5)$`,
        `$|A|=7$, $\\hat{A}=(3/7, 0, 4/7)$`,
        `$|A|=5$, $\\hat{A}=(3, 0, 4)$`,
        `$|A|=7$, $\\hat{A}=(3, 0, 4)$`,
      ],
      answer: 0,
      explanation: `$|\\vec{A}| = \\sqrt{9+0+16} = 5$. $\\hat{A} = (3/5, 0, 4/5)$.`,
    },
    {
      id: 'p1-ch1-013-q7',
      question: `A solar panel has normal vector $\\hat{n} = (0, 1)$ (pointing straight up). Sunlight comes from direction $\\vec{s} = (\\sin50°, -\\cos50°)$ (50° from vertical). The power factor $\\cos\\phi$ is:`,
      options: [`$\\sin50°$`, `$\\cos50°$`, `$0$`, `$1$`],
      answer: 1,
      explanation: `$\\hat{n}\\cdot\\hat{s} = (0)(\\sin50°) + (1)(-\\cos50°) = -\\cos50°$. Since $\\phi$ is the angle between normal and sun direction, and $|\\cos\\phi| = \\cos50° \\approx 0.643$ gives the fraction of maximum power.`,
    },
    {
      id: 'p1-ch1-013-q8',
      question: `$\\vec{A}\\cdot\\vec{B} < 0$ implies the angle between them is:`,
      options: [`Acute ($< 90°$)`, `A right angle ($90°$)`, `Obtuse ($> 90°$)`, `Zero`],
      answer: 2,
      explanation: `$\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi < 0 \\Rightarrow \\cos\\phi < 0 \\Rightarrow \\phi \\in (90°, 180°)$ — obtuse.`,
    },
  ],
}
