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
      `This is a real robotics problem. Every robot joint angle, every molecular bond angle in chemistry, every lighting angle in 3D graphics — all are computed using the same formula: $\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}\\right)$. This single equation is one of the most-used formulas in all of computational physics.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'dot-product-projection' },
  },

  videos: [{
    title: 'Physics 1 – Vectors (15 of 21) Dot Product: Angle Between the Two Vectors',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      `$\\vec{A} = (1, \\sqrt{3})$ and $\\vec{B} = (\\sqrt{3}, 1)$. Before reading on, predict: is the angle between these vectors less than, equal to, or greater than 60°? Both vectors are in the first quadrant — but which one leans more toward the $x$-axis? Compute the dot product and check.`,

      `We have two equivalent formulas for the dot product:\n- **Geometric**: $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi$\n- **Component**: $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$\n\nThe component formula is easy to compute. The geometric formula contains $\\cos\\phi$. If we equate them and isolate $\\phi$, we get a way to find the angle between any two vectors using only their components — no protractor, no geometry, no sketching.`,

      `Rearranging: $\\cos\\phi = \\dfrac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|} = \\dfrac{A_xB_x+A_yB_y+A_zB_z}{\\sqrt{A_x^2+A_y^2+A_z^2}\\cdot\\sqrt{B_x^2+B_y^2+B_z^2}}$, then $\\phi = \\arccos(\\cos\\phi)$. For the prediction: $\\vec{A}\\cdot\\vec{B} = \\sqrt{3}+\\sqrt{3} = 2\\sqrt{3}$, $|\\vec{A}|=|\\vec{B}|=2$, so $\\cos\\phi = 2\\sqrt{3}/4 = \\sqrt{3}/2$, giving $\\phi = 30°$.`,

      `Key insight: $\\cos\\phi$ is always between −1 and +1 by the Cauchy-Schwarz inequality, so $\\arccos$ always produces a valid answer. The result is always between 0° and 180°. This formula works identically in 2D, 3D, or any dimension — you just add more component pairs. This is why it's so powerful for robotics and physics simulations.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Angle between two vectors',
        body: `\\phi = \\arccos\\!\\left(\\dfrac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}\\right)`,
      },
      {
        type: 'insight',
        title: 'Sign of the dot product → type of angle',
        body: `$\\vec{A}\\cdot\\vec{B} > 0 \\Rightarrow \\phi < 90°$ (acute)\n$\\vec{A}\\cdot\\vec{B} = 0 \\Rightarrow \\phi = 90°$ (right angle)\n$\\vec{A}\\cdot\\vec{B} < 0 \\Rightarrow \\phi > 90°$ (obtuse)\n\nCheck the sign first — it tells you the range before any calculation.`,
      },
      {
        type: 'warning',
        title: '$\\arccos$ always returns 0° to 180°',
        body: `The formula gives the angle "between" the vectors placed tail-to-tail — always in $[0°, 180°]$. This is NOT the same as the direction angle from the $+x$ axis. Don't confuse $\\phi$ (angle between vectors) with $\\theta$ (angle from $+x$ axis).`,
      },
      {
        type: 'procedure',
        title: 'Three steps to the angle between any two vectors',
        body: `1. **Dot product:** $d = A_xB_x + A_yB_y + A_zB_z$\n2. **Magnitudes:** $|A| = \\sqrt{A_x^2+A_y^2+A_z^2}$, $|B| = \\sqrt{B_x^2+B_y^2+B_z^2}$\n3. **Arccos:** $\\phi = \\arccos(d / (|A||B|))$\n\nFor unit vectors, skip step 2: $\\phi = \\arccos(\\hat{A}\\cdot\\hat{B})$`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Two paths to the same number',
        caption: `Geometric: $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. Component: $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$. Set them equal, divide by $|A||B|$: $\\cos\\phi = \\frac{A_xB_x+A_yB_y}{|A||B|}$. The projection picture makes this formula inevitable.`,
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
      `The three-step procedure — compute dot product, compute magnitudes, apply arccos — works for any pair of vectors in any dimension.`,
      `A common efficiency: for **unit vectors** ($|\\vec{A}|=|\\vec{B}|=1$), the formula reduces to $\\phi = \\arccos(\\vec{A}\\cdot\\vec{B})$ — no magnitudes needed. This is why physicists normalise vectors before finding angles. Normalise: $\\hat{A} = \\vec{A}/|\\vec{A}|$, then use $\\phi = \\arccos(\\hat{A}\\cdot\\hat{B})$.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Three-step angle formula',
        body: `d = \\vec{A}\\cdot\\vec{B} = \\sum_i A_i B_i \\quad\\text{(step 1)}\\n|A| = \\sqrt{\\sum_i A_i^2},\\quad |B| = \\sqrt{\\sum_i B_i^2} \\quad\\text{(step 2)}\\n\\phi = \\arccos\\!\\left(\\frac{d}{|A||B|}\\right) \\quad\\text{(step 3)}`,
      },
      {
        type: 'insight',
        title: 'For unit vectors: one step',
        body: `If $|\\hat{A}|=|\\hat{B}|=1$, then $\\phi = \\arccos(\\hat{A}\\cdot\\hat{B})$. Normalise first with $\\hat{A} = \\vec{A}/|\\vec{A}|$, then take the dot product — magnitudes cancel.`,
      },
      {
        type: 'insight',
        title: 'Acute vs obtuse — quick check',
        body: `Check the sign of $\\vec{A}\\cdot\\vec{B}$ before computing arccos: positive → $\\phi < 90°$; zero → $\\phi = 90°$ exactly; negative → $\\phi > 90°$. This tells you the range immediately.`,
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
      `The formula $\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}$ is always well-defined: the Cauchy-Schwarz inequality $|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|$ proves the ratio is always in $[-1, 1]$, so $\\arccos$ never receives an out-of-domain argument. In fact, in higher mathematics this formula is used as the **definition** of angle in $\\mathbb{R}^n$ — we cannot directly measure angles in 10D space, but we can compute dot products. The formula works in any dimension.`,
      `The **Law of Cosines** for triangles is a direct consequence. For a triangle with sides $|\\vec{A}|$, $|\\vec{B}|$, and $|\\vec{C}| = |\\vec{B} - \\vec{A}|$: expand $|\\vec{B}-\\vec{A}|^2 = (\\vec{B}-\\vec{A})\\cdot(\\vec{B}-\\vec{A}) = |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B} + |\\vec{A}|^2 = |\\vec{A}|^2+|\\vec{B}|^2-2|\\vec{A}||\\vec{B}|\\cos\\phi$. This is exactly the familiar law of cosines $c^2 = a^2+b^2-2ab\\cos C$ — derived from the dot product, not the other way around.`,
      `The angle formula is invariant under rotation and reflection: if you rotate both vectors by the same transformation, their dot product changes only by a constant factor and the magnitudes change by the same factor, so the ratio $\\vec{A}\\cdot\\vec{B}/(|\\vec{A}||\\vec{B}|)$ is unchanged. This confirms that the angle between two vectors is a geometric property, independent of the coordinate system.`,
      `In $n$ dimensions, the formula $\\cos\\phi = \\sum_i A_iB_i / (|A||B|)$ defines angles between any two non-zero vectors. This is used in machine learning as "cosine similarity" — a measure of how aligned two high-dimensional feature vectors are. Two documents represented as word-frequency vectors have cosine similarity 1 if they use exactly the same words in the same proportions, 0 if they share no words, and negative if one uses words that the other avoids.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cauchy-Schwarz inequality',
        body: `|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|`,
      },
      {
        type: 'theorem',
        title: 'Law of Cosines (vector form)',
        body: `|\\vec{B}-\\vec{A}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}\\n= |\\vec{A}|^2 + |\\vec{B}|^2 - 2|\\vec{A}||\\vec{B}|\\cos\\phi`,
      },
    ],
    proofSteps: [
      {
        title: 'Two formulas for the same number',
        expression: `A_xB_x+A_yB_y = |\\vec{A}||\\vec{B}|\\cos\\phi`,
        annotation: 'Both component and geometric formulas give the same scalar. We proved this in lesson 10.',
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
          expression: `|\\vec{A}| = \\sqrt{1+4+4} = 3,\\quad |\\vec{B}| = \\sqrt{9+16+0} = 5`,
          annotation: 'Both magnitudes — compute before combining.',
        },
        {
          expression: `\\cos\\phi = \\frac{-5}{3\\times5} = -\\frac{1}{3}`,
          annotation: 'Negative → confirms obtuse angle.',
        },
        {
          expression: `\\phi = \\arccos\\!\\left(-\\tfrac{1}{3}\\right) \\approx 109.5°`,
          annotation: `$\\arccos(-1/3)\\approx 109.47°$. This is also the tetrahedral angle in methane (CH₄) and diamond.`,
        },
      ],
      conclusion: `$\\phi\\approx109.5°$. The negative dot product correctly predicted an obtuse angle.`,
    },
    {
      id: 'ch1-013-ex2',
      title: 'Angle between force and displacement',
      problem: `\\text{A force }\\vec{F}=(8,6)\\,N\\text{ acts as an object moves along }\\vec{d}=(3,4)\\,m.\\text{ Find the angle between them, then compute the work.}`,
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
          expression: `\\cos\\phi = \\frac{48}{50} = 0.96 \\Rightarrow \\phi = \\arccos(0.96) \\approx 16.3°`,
          annotation: 'Small angle — force and motion are mostly aligned.',
        },
        {
          expression: `W = 48\\,J\\text{ (or: }|F||d|\\cos\\phi = 10\\times5\\times0.96=48\\,J\\text{)}`,
          annotation: 'Both methods give the same work.',
        },
      ],
      conclusion: `$\\phi\\approx16.3°$, $W=48\\,J$. The nearly-parallel alignment means almost maximum work transfer.`,
    },
    {
      id: 'ch1-013-ex3',
      title: 'Law of cosines from vectors',
      problem: `\\text{A triangle has two sides given by vectors: }\\vec{A}=(3,0)\\text{ and }\\vec{B}=(2,2).\\text{ Find the length of the third side and the angle at the origin.}`,
      steps: [
        {
          expression: `\\vec{C} = \\vec{B} - \\vec{A} = (-1, 2)`,
          annotation: 'The third side is the vector from the tip of $\\vec{A}$ to the tip of $\\vec{B}$.',
        },
        {
          expression: `|\\vec{C}| = \\sqrt{(-1)^2+2^2} = \\sqrt{5}\\approx2.24`,
          annotation: 'Length of the third side.',
        },
        {
          expression: `\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|} = \\frac{(3)(2)+(0)(2)}{3\\cdot2\\sqrt{2}} = \\frac{6}{6\\sqrt{2}} = \\frac{1}{\\sqrt{2}}`,
          annotation: 'Angle at the origin between $\\vec{A}$ and $\\vec{B}$.',
        },
        {
          expression: `\\phi = \\arccos\\!\\left(\\frac{1}{\\sqrt{2}}\\right) = 45°`,
          annotation: 'The angle at the origin is exactly 45°.',
        },
      ],
      conclusion: `Third side $= \\sqrt{5}\\approx2.24$, angle at origin $= 45°$. Check via the law of cosines: $|C|^2 = 9+8-2(3)(2\\sqrt{2})\\cos45° = 17-12 = 5$ ✓.`,
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
          expression: `\\vec{A}\\cdot\\vec{B} = 1`,
          annotation: 'Dot product.',
        },
        {
          expression: `|\\vec{A}|=\\sqrt{2},\\quad |\\vec{B}|=1`,
          annotation: 'Magnitudes.',
        },
        {
          expression: `\\cos\\phi = \\frac{1}{\\sqrt{2}} \\Rightarrow \\phi = 45°`,
          annotation: `$\\arccos(1/\\sqrt{2}) = 45°$ exactly. ✓`,
        },
      ],
      answer: `\\phi = 45°`,
    },
    {
      id: 'ch1-013-ch2',
      difficulty: 'medium',
      problem: `\\text{Three position vectors: }\\vec{A}=(1,0,0),\\;\\vec{B}=(0,1,0),\\;\\vec{C}=(1,1,1).\\text{ Find all three pairwise angles.}`,
      hint: `Use the formula for each pair. $\\vec{A}\\cdot\\vec{B}=0$ (orthogonal). $\\vec{A}\\cdot\\vec{C}=1$, $|\\vec{C}|=\\sqrt{3}$.`,
      walkthrough: [
        {
          expression: `\\phi_{AB}=\\arccos\\!\\left(\\frac{0}{1\\cdot1}\\right) = 90°`,
          annotation: `$\\hat{\\imath}\\perp\\hat{\\jmath}$ — standard basis vectors are orthogonal.`,
        },
        {
          expression: `\\phi_{AC}=\\arccos\\!\\left(\\frac{1}{\\sqrt{3}}\\right) \\approx 54.7°`,
          annotation: `$\\vec{A}\\cdot\\vec{C}=1$, $|\\vec{A}|=1$, $|\\vec{C}|=\\sqrt{3}$.`,
        },
        {
          expression: `\\phi_{BC}=\\arccos\\!\\left(\\frac{1}{\\sqrt{3}}\\right) \\approx 54.7°`,
          annotation: `By symmetry ($\\vec{B}\\cdot\\vec{C}=1$ as well), same angle as $\\phi_{AC}$.`,
        },
      ],
      answer: `\\phi_{AB}=90°,\\quad \\phi_{AC}=\\phi_{BC}\\approx54.7°`,
    },
    {
      id: 'ch1-013-ch3',
      difficulty: 'hard',
      problem: `\\text{In a solar panel problem: sun's rays direction }\\hat{s}=(\\cos40°, -\\sin40°)\\text{ (40° below horizontal).}\\text{ Panel 1: horizontal, normal }\\hat{n}_1=(0,1).\\text{ Panel 2: tilted to face the sun, normal }\\hat{n}_2=(-\\cos40°, \\sin40°).\\text{ Find the efficiency (power fraction) of each panel.}`,
      hint: `Efficiency $= |\\hat{n}\\cdot\\hat{s}|$ — the absolute value of the dot product of unit normal with sun direction. Tilting the panel so its normal faces the sun gives $\\hat{n}\\cdot\\hat{s} = -1$ (anti-parallel = facing the sun).`,
      walkthrough: [
        {
          expression: `\\hat{n}_1\\cdot\\hat{s} = (0)(\\cos40°) + (1)(-\\sin40°) = -\\sin40° \\approx -0.643`,
          annotation: `Negative because sun hits from below the horizontal; efficiency $= |{-0.643}| = 64.3\\%$.`,
        },
        {
          expression: `\\hat{n}_2\\cdot\\hat{s} = (-\\cos40°)(\\cos40°) + (\\sin40°)(-\\sin40°) = -(\\cos^240°+\\sin^240°) = -1`,
          annotation: `Cosine = −1, so $\\phi = 180°$ — the normal is anti-parallel to the sun ray, meaning it FACES the sun directly. Efficiency = $|-1| = 100\\%$.`,
        },
      ],
      answer: `\\text{Panel 1: }64.3\\%\\text{ efficiency. Panel 2 (tilted): }100\\%\\text{ efficiency.}`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'The angle formula in Python — three steps',
          type: 'code',
          language: 'python',
          code: `import numpy as np

def angle_between(A, B):
    dot   = np.dot(A, B)
    norms = np.linalg.norm(A) * np.linalg.norm(B)
    # Clip to [-1,1] to prevent arccos domain errors from floating-point noise
    cos_phi = np.clip(dot / norms, -1.0, 1.0)
    return np.degrees(np.arccos(cos_phi))

# Test the three landmark cases plus 45°
A = np.array([1.0, 0.0])
cases = [
    (np.array([1.0,  0.0]), "same direction (0°)"),
    (np.array([0.0,  1.0]), "perpendicular (90°)"),
    (np.array([-1.0, 0.0]), "opposite direction (180°)"),
    (np.array([1.0,  1.0]), "diagonal (45°)"),
]
for B, label in cases:
    phi = angle_between(A, B)
    print(f"{label:32s}: {phi:.2f}°")`,
          prose: [
            `\`np.dot(A, B)\` gives the component dot product; \`np.linalg.norm\` gives the Euclidean magnitude. Dividing and applying \`np.arccos\` implements the three-step formula $\\phi = \\arccos(\\vec{A}\\cdot\\vec{B} / (|A||B|))$.`,
            `\`np.clip(cos_phi, -1.0, 1.0)\` prevents rare domain errors where floating-point gives $1.0000000000000002$ due to rounding — which would cause \`arccos\` to return \`nan\`. Always clip when the result should be in $[-1,1]$.`,
            `\`np.degrees\` converts radians to degrees. Python's \`np.arccos\` always returns radians; \`np.degrees\` applies the $\\times 180/\\pi$ conversion. The function returns $\\phi \\in [0°, 180°]$ by definition of \`arccos\`.`,
          ],
        },
        {
          cellTitle: 'Visualising angle formula — dot product vs angle',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import numpy as np

A = np.array([5.0, 0.0])  # fixed reference vector
angles_deg = np.linspace(0, 360, 361)
angles_rad = np.radians(angles_deg)

# For each angle, B rotates around the circle of radius 3
dots   = np.array([np.dot(A, np.array([3*np.cos(r), 3*np.sin(r)])) for r in angles_rad])
theory = 5 * 3 * np.cos(angles_rad)   # |A||B|cos(phi) — should match dots exactly

fig, axes = plt.subplots(1, 2, figsize=(12, 4))

# Left: dot product vs angle
ax = axes[0]
ax.plot(angles_deg, dots,   'steelblue', lw=2.5, label='np.dot(A, B(θ))')
ax.plot(angles_deg, theory, 'tomato',    lw=1.5, ls='--', label='|A||B|cos(θ)')
ax.axhline(0, color='k', lw=0.8)
ax.set_xlabel('Angle θ (degrees)'); ax.set_ylabel('Dot product')
ax.set_title('A·B = |A||B|cos(θ) — verified numerically'); ax.legend(); ax.grid(True, alpha=0.3)

# Right: illustrate angle formula for one pair of vectors
ax2 = axes[1]
B_ex = np.array([3*np.cos(np.radians(50)), 3*np.sin(np.radians(50))])
ax2.quiver(0,0,A[0],A[1], angles='xy', scale_units='xy', scale=1, color='steelblue', width=0.05, label='A')
ax2.quiver(0,0,B_ex[0],B_ex[1], angles='xy', scale_units='xy', scale=1, color='tomato', width=0.05, label='B(50°)')
phi = angle_between(A, B_ex)
ax2.set_title(f'angle_between(A, B) = {phi:.1f}°')
ax2.set_xlim(-6, 6); ax2.set_ylim(-4, 4); ax2.set_aspect('equal'); ax2.grid(True, alpha=0.3); ax2.legend()

plt.tight_layout(); plt.show()`,
          prose: [
            `The left plot overlays the numerical dot product (computed via \`np.dot\`) with the theoretical formula $5 \\times 3 \\times \\cos\\theta$. They match exactly — confirming that $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$ is not an approximation but an identity.`,
            `The cosine wave reaches +15 at 0° (parallel), crosses zero at 90° (perpendicular), reaches −15 at 180° (anti-parallel), and returns to zero at 270°. The sign immediately tells you the type of angle.`,
            `The right plot shows two specific vectors and labels the computed angle. As you move B around the circle, the dot product and the displayed angle update together — the formula is doing real geometry.`,
          ],
        },
        {
          cellTitle: 'Robot arm and molecular geometry — real applications',
          type: 'code',
          language: 'python',
          code: `import numpy as np

def angle_between(A, B):
    cos_phi = np.clip(np.dot(A,B)/(np.linalg.norm(A)*np.linalg.norm(B)), -1, 1)
    return np.degrees(np.arccos(cos_phi))

# ── Application 1: Robot arm joint angle ────────────────────────
print("=== Robot Arm ===")
link1 = np.array([3.0, 0.0, 4.0])
link2 = np.array([1.0, 2.0, -1.0])
joint_angle = angle_between(link1, link2)
print(f"Link 1: {link1}, |link1| = {np.linalg.norm(link1):.2f}")
print(f"Link 2: {link2}, |link2| = {np.linalg.norm(link2):.2f}")
print(f"Joint angle = {joint_angle:.2f}°")

# ── Application 2: Water molecule H-O-H bond angle ──────────────
print("\\n=== Water Molecule ===")
bond1 = np.array([1.0, 0.0, 0.0])
bond2 = np.array([-0.3, 0.954, 0.0])   # approx 104.5°
h2o_angle = angle_between(bond1, bond2)
print(f"Bond 1: {bond1}")
print(f"Bond 2: {bond2}")
print(f"H-O-H bond angle = {h2o_angle:.1f}°  (real ≈ 104.5°)")

# ── Application 3: Methane tetrahedral angle ─────────────────────
print("\\n=== Methane (tetrahedral) ===")
c1 = np.array([1.0,  1.0,  1.0])
c2 = np.array([1.0, -1.0, -1.0])
tet_angle = angle_between(c1, c2)
print(f"C-H bond 1 direction: {c1/np.linalg.norm(c1)}")
print(f"C-H bond 2 direction: {c2/np.linalg.norm(c2)}")
print(f"Tetrahedral angle = {tet_angle:.2f}°  (expected 109.47°)")`,
          prose: [
            `The robot arm joint angle requires 3D vectors — the same three-step formula just has one more component pair. \`angle_between\` handles 2D, 3D, or any dimension without modification.`,
            `The water molecule calculation shows how computational chemistry uses this exact formula for all bond angles. The real H-O-H angle is 104.5° (slightly less than tetrahedral due to lone pair repulsion). Our approximation gives a close match.`,
            `The methane tetrahedral angle $\\arccos(-1/3) \\approx 109.47°$ is a famous result. The four C-H bonds in methane point to the vertices of a regular tetrahedron — four equally-spaced directions in 3D. Their pairwise dot product is exactly $-1/3$.`,
          ],
        },
        {
          cellTitle: 'Challenge: angle sweep and law of cosines',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np
import matplotlib.pyplot as plt

def angle_between(A, B):
    cos_phi = np.clip(np.dot(A,B)/(np.linalg.norm(A)*np.linalg.norm(B)), -1, 1)
    return np.degrees(np.arccos(cos_phi))

# For A = [5, 0] and B rotating from 0° to 360°, verify:
# 1. Compute dots = np.array([np.dot([5,0], [3*cos(r), 3*sin(r)]) for r in angles_rad])
# 2. Compute theory = 5 * 3 * np.cos(angles_rad)
# 3. Show they are equal: np.allclose(dots, theory)
# 4. Plot both curves on the same axes

# angles_deg = np.linspace(0, 360, 361)
# angles_rad = np.radians(angles_deg)
# dots = ...
# theory = ...
# print("Match:", np.allclose(dots, theory, atol=1e-10))
# plt.plot(...); plt.show()`,
          prose: [
            `This challenge verifies $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$ numerically for all 361 angles. Expected: \`np.allclose(dots, theory)\` returns \`True\` — the two formulas agree to machine precision at every angle.`,
            `\`angles_rad = np.radians(angles_deg)\` converts degrees to radians. The B vector at angle $\\theta$ is \`[3*np.cos(r), 3*np.sin(r)]\`. The theory curve is \`5 * 3 * np.cos(angles_rad)\`.`,
            `When the two lines overlap perfectly on the plot, you've confirmed the identity is exact — not an approximation. The formula $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$ is a theorem, not a model.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'The angle formula in MATLAB',
          type: 'code',
          language: 'matlab',
          code: `function phi = angle_between(A, B)
    cos_phi = dot(A,B) / (norm(A)*norm(B));
    cos_phi = max(-1, min(1, cos_phi));   % clip to [-1,1]
    phi = rad2deg(acos(cos_phi));
end

% Test the landmark cases
A = [1, 0];
cases = {[1, 0],  'same direction (0 deg)'; ...
         [0, 1],  'perpendicular (90 deg)'; ...
         [-1, 0], 'opposite direction (180 deg)'; ...
         [1, 1],  'diagonal (45 deg)'};

for k = 1:size(cases,1)
    B   = cases{k,1};
    lbl = cases{k,2};
    phi = angle_between(A, B);
    fprintf('%-32s: %.2f deg\\n', lbl, phi);
end`,
          prose: [
            `MATLAB's \`dot(A,B)\` and \`norm(A)\` compute the dot product and magnitude respectively. \`acos\` is MATLAB's inverse cosine (returns radians); \`rad2deg\` converts to degrees.`,
            `\`max(-1, min(1, cos_phi))\` is MATLAB's equivalent of NumPy's \`np.clip\`. It prevents rare floating-point values like \`1.0000000000000002\` from causing \`acos\` to return \`NaN\`.`,
            `The function handles 2D, 3D, and $n$D vectors identically — \`dot\` and \`norm\` work for any vector length. The angle formula $\\phi = \\arccos(\\vec{A}\\cdot\\vec{B}/(|A||B|))$ is dimensionless and dimension-agnostic.`,
          ],
        },
        {
          cellTitle: 'Visualising dot product vs angle',
          type: 'code',
          language: 'matlab',
          code: `A = [5, 0];
angles_deg = linspace(0, 360, 361);
angles_rad = deg2rad(angles_deg);

% Numerical dots
dots = zeros(1, length(angles_rad));
for k = 1:length(angles_rad)
    B = [3*cos(angles_rad(k)), 3*sin(angles_rad(k))];
    dots(k) = dot(A, B);
end

theory = 5 * 3 * cos(angles_rad);   % |A||B|cos(phi)

fprintf('Max difference: %.2e (should be near machine eps)\\n', max(abs(dots - theory)));

figure('Position', [100 100 800 350]);
subplot(1,2,1);
plot(angles_deg, dots,   'b', 'LineWidth', 2.5); hold on;
plot(angles_deg, theory, 'r--', 'LineWidth', 1.5);
yline(0, 'k', 'LineWidth', 0.8);
xlabel('Angle (degrees)'); ylabel('Dot product');
title('A·B = |A||B|cos(theta)'); legend({'np.dot', 'theory'}); grid on;

subplot(1,2,2);
B_ex = [3*cos(deg2rad(50)), 3*sin(deg2rad(50))];
quiver(0,0,A(1),A(2), 0, 'b', 'LineWidth',2); hold on;
quiver(0,0,B_ex(1),B_ex(2), 0, 'r', 'LineWidth',2);
phi = angle_between(A, B_ex);
title(sprintf('angle\\_between(A,B) = %.1f deg', phi));
xlim([-6 6]); ylim([-4 4]); axis equal; grid on;`,
          prose: [
            `The loop computes \`dot(A,B)\` for 361 angles numerically. The \`max(abs(dots - theory))\` comparison shows agreement to machine epsilon — the formula is an exact identity, not an approximation.`,
            `The left plot shows a cosine wave: +15 at 0° (parallel), 0 at 90° (perpendicular), −15 at 180° (anti-parallel). This is $|A||B|\\cos\\phi$ traced out as $\\phi$ varies from 0° to 360°.`,
            `\`quiver(..., 0)\` in MATLAB draws vectors at true scale (the trailing 0 disables auto-scaling). The right plot labels the angle computed by the formula for $\\vec{B}$ at 50°.`,
          ],
        },
        {
          cellTitle: 'Robot arm and molecular geometry',
          type: 'code',
          language: 'matlab',
          code: `function phi = angle_between(A, B)
    cos_phi = max(-1, min(1, dot(A,B)/(norm(A)*norm(B))));
    phi = rad2deg(acos(cos_phi));
end

% Robot arm joint angle
fprintf('=== Robot Arm ===\\n');
link1 = [3, 0, 4];
link2 = [1, 2, -1];
fprintf('Link1: [%g %g %g], norm=%.2f\\n', link1, norm(link1));
fprintf('Link2: [%g %g %g], norm=%.2f\\n', link2, norm(link2));
fprintf('Joint angle = %.2f deg\\n\\n', angle_between(link1, link2));

% Water H-O-H bond angle
fprintf('=== Water Molecule ===\\n');
bond1 = [1, 0, 0];
bond2 = [-0.3, 0.954, 0];
fprintf('H-O-H bond angle = %.1f deg  (real ~104.5 deg)\\n\\n', angle_between(bond1, bond2));

% Methane tetrahedral angle
fprintf('=== Methane tetrahedral ===\\n');
c1 = [1, 1, 1];
c2 = [1, -1, -1];
fprintf('Tetrahedral angle = %.2f deg  (expected 109.47 deg)\\n', angle_between(c1, c2));`,
          prose: [
            `The robot arm problem uses 3D vectors — \`angle_between\` works identically. Real robot controllers run this formula millions of times per second to compute inverse kinematics.`,
            `The water molecule bond angle (≈104.5°) and methane tetrahedral angle (≈109.47°) are both computed with the same three-step formula. Chemistry's entire bond angle framework is built on dot products.`,
            `\`max(-1, min(1, ...))\` clips to $[-1, 1]$ in MATLAB. This is important for unit vectors where floating-point drift can give \`cos_phi = 1.0000000001\`, causing \`acos\` to return \`NaN\`.`,
          ],
        },
        {
          cellTitle: 'Challenge: angle sweep and law of cosines',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Verify A·B = |A||B|cos(theta) for A=[5,0] and B rotating 0° to 360°

% angles_deg = linspace(0, 360, 361);
% angles_rad = deg2rad(angles_deg);

% Compute dots (loop or vectorised)
% dots = zeros(1, 361);
% for k = 1:361
%     B = [3*cos(angles_rad(k)), 3*sin(angles_rad(k))];
%     dots(k) = dot([5,0], B);
% end

% Compute theory = 5 * 3 * cos(angles_rad)

% Check: fprintf('Max diff: %.2e\\n', max(abs(dots - theory)))
% Plot both curves`,
          prose: [
            `Compute \`dots\` as the numerical dot products and \`theory = 5*3*cos(angles_rad)\` as the analytic formula. They should agree to machine epsilon ($\\approx 10^{-14}$).`,
            `\`max(abs(dots - theory))\` is the maximum pointwise error. If this is near \`2.2e-14\` (machine epsilon), the identity holds. If it's larger, check for a sign or indexing error.`,
            `Plotting both curves on the same axes with \`plot\` shows whether they visually overlap. Use different colors or line styles (\`'b-'\`, \`'r--'\`) to distinguish them.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-013-q1',
      type: 'choice',
      question: `The formula for the angle between two vectors is:`,
      options: [
        `$\\phi = \\arcsin\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}\\right)$`,
        `$\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}\\right)$`,
        `$\\phi = \\arctan\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}\\right)$`,
        `$\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}$`,
      ],
      answer: `$\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}\\right)$`,
      hints: [
        'From $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$, isolate $\\phi$.',
        'Which inverse trig function undoes cosine?',
      ],
      reviewSection: 'intuition',
      explanation: `From $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$, solving for $\\phi$: $\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|}$, then $\\phi = \\arccos(\\ldots)$.`,
    },
    {
      id: 'p1-ch1-013-q2',
      type: 'choice',
      question: `$\\vec{A} = (1, 1)$, $\\vec{B} = (1, -1)$. What is the angle between them?`,
      options: [`$45°$`, `$90°$`, `$135°$`, `$60°$`],
      answer: `$90°$`,
      hints: [
        'Compute the dot product first: $1(1) + 1(-1) = ?$',
        'If the dot product is zero, what angle does $\\arccos(0)$ give?',
      ],
      reviewSection: 'intuition',
      explanation: `$\\vec{A}\\cdot\\vec{B} = 1-1 = 0$. So $\\cos\\phi = 0$ and $\\phi = 90°$.`,
    },
    {
      id: 'p1-ch1-013-q3',
      type: 'choice',
      question: `The angle formula always returns a value in the range:`,
      options: [`$(-90°, 90°)$`, `$[0°, 180°]$`, `$[0°, 360°]$`, `$(-180°, 180°]$`],
      answer: `$[0°, 180°]$`,
      hints: [
        'What is the range of $\\arccos$?',
        'Can the angle between two vectors be greater than 180° when measured tail-to-tail?',
      ],
      reviewSection: 'intuition',
      explanation: `$\\arccos$ always returns $[0°, 180°]$. Angles between vectors are measured as the smaller angle between the arrows, so this range is sufficient.`,
    },
    {
      id: 'p1-ch1-013-q4',
      type: 'choice',
      question: `$\\vec{A} = (1, 0, 0)$, $\\vec{B} = (0, 1, 0)$. What angle does the formula give?`,
      options: [`$0°$`, `$45°$`, `$90°$`, `$180°$`],
      answer: `$90°$`,
      hints: [
        'Compute the 3D dot product: $A_xB_x + A_yB_y + A_zB_z$.',
        'These are $\\hat{i}$ and $\\hat{j}$ — what do you know about their angle?',
      ],
      reviewSection: 'intuition',
      explanation: `$\\vec{A}\\cdot\\vec{B} = 0$. $\\cos\\phi = 0/1 = 0$. $\\phi = \\arccos(0) = 90°$.`,
    },
    {
      id: 'p1-ch1-013-q5',
      type: 'choice',
      question: `Why does dividing the dot product by $|\\vec{A}||\\vec{B}|$ give $\\cos\\phi$?`,
      options: [
        `It normalises the result to $[0, 1]$`,
        `Dividing by the magnitudes converts to unit vectors; the dot product of unit vectors is $\\cos\\phi$`,
        `It makes the formula dimensionless`,
        `Both B and C`,
      ],
      answer: `Both B and C`,
      hints: [
        'What is $\\hat{A}\\cdot\\hat{B}$ where $\\hat{A} = \\vec{A}/|\\vec{A}|$?',
        'Does the result have units? What are the units of magnitudes?',
      ],
      reviewSection: 'math',
      explanation: `$\\frac{\\vec{A}\\cdot\\vec{B}}{|A||B|} = \\hat{A}\\cdot\\hat{B} = \\cos\\phi$. Dividing by magnitudes normalises to unit vectors. The result is dimensionless AND equals $\\cos\\phi$. Both B and C are correct.`,
    },
    {
      id: 'p1-ch1-013-q6',
      type: 'choice',
      question: `$\\vec{A} = (3, 0, 4)$. What are $|\\vec{A}|$ and $\\hat{A}$?`,
      options: [
        `$|A|=5$, $\\hat{A}=(3/5, 0, 4/5)$`,
        `$|A|=7$, $\\hat{A}=(3/7, 0, 4/7)$`,
        `$|A|=5$, $\\hat{A}=(3, 0, 4)$`,
        `$|A|=7$, $\\hat{A}=(3, 0, 4)$`,
      ],
      answer: `$|A|=5$, $\\hat{A}=(3/5, 0, 4/5)$`,
      hints: [
        '$|\\vec{A}| = \\sqrt{A_x^2+A_y^2+A_z^2} = \\sqrt{9+0+16}$.',
        '$\\hat{A} = \\vec{A}/|\\vec{A}|$ — divide each component by the magnitude.',
      ],
      reviewSection: 'math',
      explanation: `$|\\vec{A}| = \\sqrt{9+0+16} = 5$. $\\hat{A} = (3/5, 0, 4/5)$.`,
    },
    {
      id: 'p1-ch1-013-q7',
      type: 'choice',
      question: `A solar panel has unit normal $\\hat{n} = (0, 1)$ (pointing straight up). Sunlight comes from direction $\\hat{s} = (\\sin50°, -\\cos50°)$ (50° from vertical, going downward). The power factor $|\\hat{n}\\cdot\\hat{s}|$ is:`,
      options: [`$\\sin50°$`, `$\\cos50°$`, `$0$`, `$1$`],
      answer: `$\\cos50°$`,
      hints: [
        'Compute $(0)(\\sin50°) + (1)(-\\cos50°)$.',
        'Power factor = $|\\hat{n}\\cdot\\hat{s}|$ — take the absolute value.',
      ],
      reviewSection: 'challenges',
      explanation: `$\\hat{n}\\cdot\\hat{s} = (0)(\\sin50°) + (1)(-\\cos50°) = -\\cos50°$. Power factor $= |-\\cos50°| = \\cos50° \\approx 0.643$ — about 64% of maximum.`,
    },
    {
      id: 'p1-ch1-013-q8',
      type: 'choice',
      question: `$\\vec{A}\\cdot\\vec{B} < 0$ implies the angle between them is:`,
      options: [`Acute ($< 90°$)`, `A right angle ($90°$)`, `Obtuse ($> 90°$)`, `Zero`],
      answer: `Obtuse ($> 90°$)`,
      hints: [
        '$\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. If this is negative, what sign must $\\cos\\phi$ have?',
        'For what range of $\\phi$ is $\\cos\\phi$ negative?',
      ],
      reviewSection: 'intuition',
      explanation: `$\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi < 0 \\Rightarrow \\cos\\phi < 0 \\Rightarrow \\phi \\in (90°, 180°)$ — obtuse.`,
    },
    {
      id: 'p1-ch1-013-q9',
      type: 'choice',
      question: `The tetrahedral angle in a methane molecule is $\\arccos(-1/3) \\approx 109.5°$. What does this say about the dot product of any two C-H bond direction vectors?`,
      options: [
        `Their dot product is $1/3$`,
        `Their dot product (as unit vectors) is $-1/3$`,
        `Their dot product is 0`,
        `Their dot product is $\\sqrt{3}/2$`,
      ],
      answer: `Their dot product (as unit vectors) is $-1/3$`,
      hints: [
        'If $\\phi = \\arccos(-1/3)$, then $\\cos\\phi = ?$',
        'For unit vectors, $\\phi = \\arccos(\\hat{A}\\cdot\\hat{B})$, so $\\hat{A}\\cdot\\hat{B} = \\cos\\phi$.',
      ],
      reviewSection: 'examples',
      explanation: `$\\cos(109.5°) = -1/3$. Since the formula gives $\\cos\\phi = \\hat{A}\\cdot\\hat{B}$ for unit vectors, the dot product of any two tetrahedral C-H bond directions is $-1/3$.`,
    },
    {
      id: 'p1-ch1-013-q10',
      type: 'choice',
      question: `In code, why should you use \`np.clip(cos_phi, -1.0, 1.0)\` before calling \`np.arccos\`?`,
      options: [
        `To convert from degrees to radians`,
        `To prevent NaN errors when floating-point gives a value like 1.0000000001`,
        `To ensure the result is positive`,
        `To speed up the computation`,
      ],
      answer: `To prevent NaN errors when floating-point gives a value like 1.0000000001`,
      hints: [
        'What is the domain of $\\arccos$? What values can it accept?',
        'Floating-point arithmetic is not exact — can a "unit vector" dot product give slightly more than 1?',
      ],
      reviewSection: 'math',
      explanation: `\`np.arccos\` requires input in $[-1, 1]$. Floating-point rounding can produce values like $1.0000000000000002$ for unit vectors, which would cause \`arccos\` to return \`nan\`. Clipping prevents this defensive check from causing silent failures.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-013-m1',
      wrong: 'The angle formula gives angles between 0° and 360°, so it can distinguish vectors in all four quadrants.',
      correction: '$\\arccos$ always returns $[0°, 180°]$. The formula gives the angle between the two vectors, not the direction of either. For example, $\\vec{A}=(1,0)$ and $\\vec{B}=(1,0)$ give $\\phi=0°$, but $\\vec{A}=(1,0)$ and $\\vec{B}=(-1,0)$ give $\\phi=180°$ — there is no way to get $\\phi=270°$ from this formula.',
      correctionExample: '$\\vec{A}=(1,0),\\;\\vec{B}=(0,-1):\\quad \\phi = \\arccos(0) = 90°$, not $-90°$ or $270°$',
    },
    {
      id: 'p1-ch1-013-m2',
      wrong: 'If two vectors have the same angle from the $+x$ axis, their pairwise angle is zero.',
      correction: 'The pairwise angle depends on the angle BETWEEN the vectors, not their individual directions from any axis. Two vectors pointing in the same direction (e.g., $(1,2)$ and $(2,4)$) do have pairwise angle $0°$ — but if they point in different directions from $+x$ (e.g., $30°$ and $70°$), their pairwise angle is $40°$, not $0°$.',
      correctionExample: '$\\vec{A}$ at $30°$ and $\\vec{B}$ at $70°$ from $+x$: pairwise $\\phi = 40°$, not $0°$',
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-013-t1',
      prompt: `Cosine similarity in machine learning is defined as $\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}$. If two documents are represented as word-frequency vectors where each component counts how many times a word appears, what does a cosine similarity of 0 mean? Of 1? Of -1? Why is cosine similarity preferred over Euclidean distance for text comparison?`,
    },
    {
      id: 'p1-ch1-013-t2',
      prompt: `In 3D computer graphics, Phong shading computes the brightness of a surface point as $L = |\\hat{n}\\cdot\\hat{l}|$ where $\\hat{n}$ is the surface normal and $\\hat{l}$ is the direction toward the light. This is the same formula as the solar panel efficiency calculation. Why does a surface appear darkest when the normal is perpendicular to the light direction, and brightest when they're parallel?`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-013-d1',
      buggyCode: `import numpy as np
A = np.array([1.0, 0.0])
B = np.array([1.0, 0.0])   # same as A
cos_phi = np.dot(A, B) / (np.linalg.norm(A) * np.linalg.norm(B))
phi = np.degrees(np.arccos(cos_phi))
# Might print nan due to floating-point giving cos_phi = 1.0000000000000002`,
      language: 'python',
      issue: '`np.arccos` requires input in `[-1, 1]`. Floating-point arithmetic can give exactly-equal unit vectors a dot product of `1.0000000000000002`, which causes `arccos` to return `nan`.',
      fix: `import numpy as np
A = np.array([1.0, 0.0])
B = np.array([1.0, 0.0])
cos_phi = np.dot(A, B) / (np.linalg.norm(A) * np.linalg.norm(B))
cos_phi = np.clip(cos_phi, -1.0, 1.0)   # guard against floating-point noise
phi = np.degrees(np.arccos(cos_phi))
print(phi)  # 0.0`,
    },
    {
      id: 'p1-ch1-013-d2',
      buggyCode: `import numpy as np
# Find angle between (1,1) and (0,1) in degrees
A = np.array([1, 1])
B = np.array([0, 1])
phi = np.arccos(np.dot(A, B) / (np.linalg.norm(A) * np.linalg.norm(B)))
print(f"Angle = {phi}°")  # prints 0.7854...° instead of 45°`,
      language: 'python',
      issue: '`np.arccos` returns radians, not degrees. The result `0.7854` is $\\pi/4$ radians = 45°. The code prints it without converting.',
      fix: `import numpy as np
A = np.array([1, 1])
B = np.array([0, 1])
cos_phi = np.clip(np.dot(A, B)/(np.linalg.norm(A)*np.linalg.norm(B)), -1, 1)
phi_deg = np.degrees(np.arccos(cos_phi))   # convert radians to degrees
print(f"Angle = {phi_deg:.2f}°")  # 45.00°`,
    },
  ],

  mastery: {
    targetLevel: 'You can compute the angle between any two vectors using the three-step formula, predict the angle range from the sign of the dot product, apply the formula in robotics and molecular geometry contexts, and verify the law of cosines using dot product expansion.',
    prerequisites: ['Dot product component formula', 'Vector magnitude: $|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}}$', 'Basic inverse trig: $\\arccos$ maps $[-1,1]$ to $[0°,180°]$'],
    unlocks: ['Scalar and vector projection', 'Direction cosines', 'Cross product and its relationship to sin of the angle'],
    checkpoints: [
      'Can apply the three-step formula (dot → magnitudes → arccos) to any 2D or 3D pair of vectors',
      'Can predict whether the angle is acute, right, or obtuse from the sign of the dot product alone',
      'Can normalise vectors to unit vectors and use the simplified formula $\\phi = \\arccos(\\hat{A}\\cdot\\hat{B})$',
      'Can use the formula in applied contexts: robot joint angles, molecular bond angles, solar panel efficiency',
    ],
  },

  semantics: {
    core: [
      { symbol: `\\phi = \\arccos\\!\\left(\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}\\right)`, meaning: 'Angle between two vectors — always in $[0°, 180°]$, derived by equating the two dot product formulas' },
      { symbol: '\\cos\\phi = \\hat{A}\\cdot\\hat{B}', meaning: 'For unit vectors, the dot product directly equals $\\cos\\phi$ — no magnitude division needed' },
      { symbol: '\\text{sign}(\\vec{A}\\cdot\\vec{B})', meaning: 'Positive → acute angle; zero → right angle; negative → obtuse angle — check this before computing arccos' },
      { symbol: '\\text{np.clip}(x, -1, 1)', meaning: 'Guards arccos from floating-point values slightly outside $[-1,1]$ — always use this in code' },
      { symbol: '|\\vec{B}-\\vec{A}|^2 = |A|^2+|B|^2-2\\vec{A}\\cdot\\vec{B}', meaning: 'Law of cosines derived from dot product expansion — connects to the familiar triangle formula' },
    ],
    rulesOfThumb: [
      'Check the sign of the dot product before computing arccos — positive = acute, zero = 90°, negative = obtuse.',
      'Always clip $\\cos\\phi$ to $[-1,1]$ in code before calling arccos — floating-point can give values like $1.0000000001$.',
      'For unit vectors, skip the magnitude division: $\\phi = \\arccos(\\hat{A}\\cdot\\hat{B})$ — normalise first, then dot.',
      'The formula works in any dimension — 2D, 3D, 100D. Just add more component products.',
      'arccos always returns $[0°, 180°]$ — it cannot distinguish "which side" the vectors are on. If you need full $[0°, 360°]$, you need $\\text{atan2}$.',
    ],
  },
}
