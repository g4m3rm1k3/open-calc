export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'p1-ch1-016',
  slug: 'cross-product-applications',
  chapter: 'p1',
  order: 16,
  title: 'Cross Product — Applications',
  subtitle: 'Torque, angular momentum, magnetic force, area, and surface normals — the cross product is everywhere in physics.',
  tags: ['cross product', 'torque', 'angular momentum', 'magnetic force', 'area', 'surface normal', 'right-hand rule', 'coplanar'],
  aliases: 'cross product applications torque angular momentum magnetic force Lorentz area parallelogram triangle surface normal',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: 'A spinning gyroscope, a current-carrying wire in a magnetic field, a door closing on a hinge — what do these have in common?',
    realWorldContext:
      `They all involve a force or momentum that acts at an angle to a pivot, and the physical effect depends critically on BOTH the magnitude of that force AND the geometry of where it's applied. A door closes faster when you push far from the hinge, not near it. A magnetic compass needle swings because the magnetic force on moving charges acts perpendicular to both the velocity and the field. A spinning top precesses because gravity's torque acts perpendicular to the angular momentum. In every case, the answer is a cross product: $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$, $\\vec{F}=q\\vec{v}\\times\\vec{B}$, $\\vec{L}=\\vec{r}\\times\\vec{p}$. These aren't abstract formulas — they're the three most important equations in classical mechanics and electromagnetism, and they all share the same mathematical structure.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'cross-product-rhr' },
  },

  // ── Videos ──────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (18 of 21) Cross Product: Applications — Torque, Area, Magnetic Force',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  // ── Intuition ────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      `The cross product has a beautiful geometric meaning that makes every application easy to understand. When you compute $\\vec{A}\\times\\vec{B}$, the magnitude $|\\vec{A}||\\vec{B}|\\sin\\phi$ is the **area of the parallelogram** that $\\vec{A}$ and $\\vec{B}$ span when placed tail-to-tail. The direction is perpendicular to that parallelogram, pointing "out of" the surface it defines. This geometry underlies every physical application.`,

      `**Torque** $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$: You push a door ($\\vec{F}$) at a point a distance $\\vec{r}$ from the hinge. The torque vector says: "how strongly does this force tend to rotate the door, and which way?" If you push along the door (parallel to $\\vec{r}$), the cross product is zero — no rotation. If you push perpendicular to the door at maximum distance, you get maximum torque. The torque vector points along the rotation axis (into or out of the hinge). Its magnitude $|\\vec{r}||\\vec{F}|\\sin\\phi$ is maximised when the force is perpendicular to the position vector — exactly when it's most effective for turning.`,

      `**Angular momentum** $\\vec{L}=\\vec{r}\\times\\vec{p}$: A planet orbiting the sun carries momentum $\\vec{p}=m\\vec{v}$. The angular momentum is $\\vec{r}\\times(m\\vec{v})$, where $\\vec{r}$ is the planet's position relative to the sun. Its direction — perpendicular to the orbital plane — describes the axis of the orbit. Its magnitude tells you how "rotationally energetic" the orbit is. Kepler's second law (equal areas in equal times) is equivalent to saying angular momentum is conserved.`,

      `**Magnetic (Lorentz) force** $\\vec{F}=q\\vec{v}\\times\\vec{B}$: A charged particle moving through a magnetic field feels a force perpendicular to both its velocity and the field. This is why magnetic forces curve particle paths into circles — the force is always perpendicular to the velocity, so it can never do work (it can't speed up the particle, only change direction). Particle accelerators, mass spectrometers, and the aurora borealis all run on this cross product.`,

      `**Parallelogram area**: The area of any parallelogram whose edge vectors are $\\vec{A}$ and $\\vec{B}$ is $|\\vec{A}\\times\\vec{B}|$. For a triangle with those same edges, the area is $\\frac{1}{2}|\\vec{A}\\times\\vec{B}|$. This is used in computer graphics (calculating face areas, normal maps), structural engineering (panel loading), and computational geometry.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'The four great cross product applications',
        body: `**Torque:** $\\vec{\\tau} = \\vec{r}\\times\\vec{F}$ — rotational effect of a force (N·m)\\n\\n**Angular momentum:** $\\vec{L} = \\vec{r}\\times\\vec{p} = \\vec{r}\\times(m\\vec{v})$ — orbital rotation (kg·m²/s)\\n\\n**Magnetic force:** $\\vec{F} = q\\vec{v}\\times\\vec{B}$ — force on moving charge (N)\\n\\n**Area:** $\\text{Area of parallelogram} = |\\vec{A}\\times\\vec{B}|$, triangle area $= \\tfrac{1}{2}|\\vec{A}\\times\\vec{B}|$`,
      },
      {
        type: 'insight',
        title: 'Why cross products appear when something rotates',
        body: `Any time a physical quantity depends on **both a distance and a force (or momentum) that act at an angle**, the answer is a cross product. The "twisting" effect of a force about a pivot, the "circling" effect of a moving charge in a field — both involve two vectors that "cross" each other at some angle, and the result lives perpendicular to the plane they define.`,
      },
      {
        type: 'insight',
        title: 'Magnetic force does no work',
        body: `Because $\\vec{F}_{mag}=q\\vec{v}\\times\\vec{B}$ is always perpendicular to $\\vec{v}$, we have $\\vec{F}_{mag}\\cdot\\vec{v}=0$ always. Power delivered = $\\vec{F}\\cdot\\vec{v}=0$. The magnetic force can never speed up or slow down a particle — it only curves the path. This is why MRI machines can deflect protons with powerful magnets without adding energy to them.`,
      },
      {
        type: 'mnemonic',
        title: 'Right-hand rule for torque',
        body: `For $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$:\\n1. Point fingers along $\\vec{r}$ (from pivot to where force is applied).\\n2. Curl fingers toward $\\vec{F}$ (the force direction).\\n3. Thumb points in the direction of $\\vec{\\tau}$ (the rotation axis).\\n\\nIf thumb points upward: counterclockwise rotation when viewed from above.\\nIf thumb points downward: clockwise rotation.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Parallelogram area = |A⃗ × B⃗|',
        caption: `The shaded region is the parallelogram formed by A⃗ and B⃗. Its area equals |A⃗ × B⃗| = |A||B|sinφ. For a triangle with the same two edges, divide by 2. The perpendicular result vector (not shown) points out of the page.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Torque and area — the same cross product geometry',
        caption: `Whether computing torque τ⃗ = r⃗ × F⃗ or a parallelogram area, the geometry is identical: the magnitude is |A||B|sinφ (zero when parallel, maximum at 90°) and the result vector is perpendicular to both inputs. Only the physical interpretation changes.`,
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      `Let's work through the mathematics of each major application precisely.`,

      `**Torque magnitude and direction**: Given position vector $\\vec{r}$ (from pivot to force application point) and force $\\vec{F}$, the torque is $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$. Magnitude: $|\\vec{\\tau}|=|\\vec{r}||\\vec{F}|\\sin\\phi$, where $\\phi$ is the angle between $\\vec{r}$ and $\\vec{F}$. The quantity $|\\vec{F}|\\sin\\phi$ is called the **moment arm** or **lever arm** — the component of force perpendicular to the position vector. Alternatively, $|\\vec{r}|\\sin\\phi$ is the perpendicular distance from the pivot to the line of action of the force. Both interpretations give the same magnitude.`,

      `**Area of a parallelogram and triangle**: For edge vectors $\\vec{a}$ and $\\vec{b}$, parallelogram area $=|\\vec{a}\\times\\vec{b}|$. Triangle area $=\\frac{1}{2}|\\vec{a}\\times\\vec{b}|$. This works in 3D — the vectors can be tilted at any angle, and the formula still gives the correct area.`,

      `**Coplanar vectors**: Three vectors $\\vec{A}$, $\\vec{B}$, $\\vec{C}$ are coplanar if and only if $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})=0$ (the scalar triple product is zero, meaning the parallelepiped they span has zero volume).`,

      `**Right-handed coordinate systems**: The standard Cartesian system satisfies $\\hat{i}\\times\\hat{j}=\\hat{k}$, $\\hat{j}\\times\\hat{k}=\\hat{i}$, $\\hat{k}\\times\\hat{i}=\\hat{j}$. This is the definition of a right-handed coordinate system. A left-handed system would have $\\hat{i}\\times\\hat{j}=-\\hat{k}$ — some older texts and certain conventions (like OpenGL's original coordinate system) use this.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Torque and the lever arm',
        body: `|\\vec{\\tau}| = |\\vec{r}||\\vec{F}|\\sin\\phi = (\\text{moment arm})\\times|\\vec{F}| = |\\vec{r}|\\times(\\text{perpendicular force})\\n\\nMaximum when $\\phi=90°$ (force perpendicular to position), zero when $\\phi=0°$ or $180°$ (force through pivot).`,
      },
      {
        type: 'theorem',
        title: 'Triangle area from two edge vectors',
        body: `\\text{Area}_{\\triangle} = \\frac{1}{2}|\\vec{a}\\times\\vec{b}|\\n\\nWorks in 3D even when the triangle is tilted. The cross product "unfolds" the geometry into an area automatically.`,
      },
      {
        type: 'theorem',
        title: 'Coplanarity test',
        body: `\\vec{A},\\vec{B},\\vec{C}\\text{ are coplanar}\\iff\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})=0\\n\\nThe scalar triple product equals the signed volume of the parallelepiped. Zero volume means all three lie in the same plane.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'One formula, many interpretations',
        caption: `Torque: τ⃗ = r⃗ × F⃗ — the result points along the rotation axis. Magnetic force: F⃗ = qv⃗ × B⃗ — the force is perpendicular to both velocity and field. Parallelogram area: |a⃗ × b⃗|. In every case the cross product structure is the same — only the physical quantities plugged in change.`,
      },
    ],
  },

  // ── Rigor ────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The torque formula $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$ follows from Newton's second law applied to rotation. The rotational analogue of $\\vec{F}=m\\vec{a}$ is $\\vec{\\tau}=I\\vec{\\alpha}$, where $I$ is the moment of inertia and $\\vec{\\alpha}$ is the angular acceleration. The cross product structure of torque ensures that the torque axis is always along the rotation axis — the perpendicularity is physically necessary, not accidental.`,
      `The magnetic force law $\\vec{F}=q\\vec{v}\\times\\vec{B}$ is a postulate of classical electrodynamics (it can't be derived from more basic principles at this level; it comes from Maxwell's equations in integral form and the Lorentz force law). The cross product structure is essential: it guarantees that magnetic forces do no work, which is a conservation of energy statement.`,
      `**Conservation of angular momentum**: if no net torque acts on a system, $d\\vec{L}/dt=\\vec{\\tau}_{net}=\\vec{0}$, so $\\vec{L}=\\vec{r}\\times\\vec{p}$ is constant. This explains why gyroscopes maintain their orientation, why orbits are planar, and why a spinning ice skater speeds up when pulling in their arms.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Newton\'s 2nd law for rotation',
        body: `\\vec{\\tau}_{net} = \\frac{d\\vec{L}}{dt} = I\\vec{\\alpha}\\n\\nTorque is to rotation what force is to translation. Zero net torque implies constant angular momentum.`,
      },
      {
        type: 'insight',
        title: 'Why magnetic force does no work — proven',
        body: `$P = \\vec{F}\\cdot\\vec{v} = (q\\vec{v}\\times\\vec{B})\\cdot\\vec{v}$\\n\\nThe scalar triple product $\\vec{v}\\cdot(\\vec{v}\\times\\vec{B})=0$ always (any vector is perpendicular to a cross product that involves itself). Therefore $P=0$: magnetic forces never do work.`,
      },
    ],
    proofSteps: [
      {
        title: 'Area of a parallelogram',
        expression: `\\text{Area} = \\text{base}\\times\\text{height} = |\\vec{a}|\\cdot|\\vec{b}|\\sin\\phi = |\\vec{a}\\times\\vec{b}|`,
        annotation: 'Height = |b|sinφ (perpendicular component of b relative to a). This is exactly the cross product magnitude.',
      },
      {
        title: 'Torque maximised at 90°',
        expression: `|\\vec{\\tau}| = |\\vec{r}||\\vec{F}|\\sin\\phi\\implies\\max\\text{ when }\\phi=90°\\implies\\vec{F}\\perp\\vec{r}`,
        annotation: 'Pushing a door perpendicular to the handle gives maximum torque. Pushing toward or away from the hinge gives zero torque.',
      },
      {
        title: 'Magnetic force does no work',
        expression: `\\vec{F}_{mag}\\cdot\\vec{v} = (q\\vec{v}\\times\\vec{B})\\cdot\\vec{v} = q\\,(\\vec{v}\\times\\vec{B})\\cdot\\vec{v} = 0`,
        annotation: 'The scalar triple product v⃗·(v⃗×B⃗) = 0 because A⃗·(A⃗×B⃗) = 0 always (a vector is always perpendicular to any cross product involving itself).',
      },
      {
        title: 'Coplanarity via scalar triple product',
        expression: `\\vec{A}\\cdot(\\vec{B}\\times\\vec{C}) = 0\\iff \\vec{A},\\vec{B},\\vec{C}\\text{ are coplanar}`,
        annotation: 'The triple product is the determinant of the 3×3 matrix [A;B;C]. Zero determinant ↔ linearly dependent rows ↔ coplanar vectors.',
      },
    ],
    title: 'Cross product applications — rigorous derivations',
  },

  // ── Examples ──────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-016-ex1',
      title: 'Torque on a wrench at a general angle',
      problem: `A wrench handle is $\\vec{r}=(0.4, 0, 0)\\text{ m}$ and the applied force is $\\vec{F}=(10\\cos45°, 10\\sin45°, 0)\\text{ N}$. Find the torque vector and its magnitude.`,
      steps: [
        {
          expression: `\\vec{F}=(10\\cos45°, 10\\sin45°, 0)=(7.07, 7.07, 0)\\text{ N}`,
          annotation: 'Resolve the force into components.',
        },
        {
          expression: `\\vec{\\tau}=\\vec{r}\\times\\vec{F}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\0.4&0&0\\\\7.07&7.07&0\\end{vmatrix}`,
          annotation: 'Set up the determinant.',
        },
        {
          expression: `=(0\\cdot0-0\\cdot7.07)\\hat{i}-(0.4\\cdot0-0\\cdot7.07)\\hat{j}+(0.4\\cdot7.07-0\\cdot7.07)\\hat{k}`,
          annotation: 'Expand the minors.',
        },
        {
          expression: `=(0, 0, 2.83)\\text{ N·m}`,
          annotation: 'Only the z-component survives (both vectors in the xy-plane).',
        },
        {
          expression: `|\\vec{\\tau}|=2.83\\text{ N·m}\\approx|\\vec{r}||\\vec{F}|\\sin45°=0.4\\times10\\times0.707=2.83\\;\\checkmark`,
          annotation: 'Verify using the magnitude formula.',
        },
      ],
      conclusion: `$\\vec{\\tau}=(0,0,2.83)\\text{ N·m}$. The bolt turns counterclockwise (+z). The torque is less than the maximum (4 N·m at 90°) because the force is at 45°.`,
    },
    {
      id: 'ch1-016-ex2',
      title: 'Area of a 3D triangle',
      problem: `A triangular solar panel has vertices at $P_1=(0,0,0)$, $P_2=(3,0,0)\\text{ m}$, $P_3=(1,2,1)\\text{ m}$. Find its area.`,
      steps: [
        {
          expression: `\\vec{u}=P_2-P_1=(3,0,0),\\quad\\vec{v}=P_3-P_1=(1,2,1)`,
          annotation: 'Edge vectors from P1.',
        },
        {
          expression: `\\vec{u}\\times\\vec{v}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\3&0&0\\\\1&2&1\\end{vmatrix}=(0-0)\\hat{i}-(3-0)\\hat{j}+(6-0)\\hat{k}=(0,-3,6)`,
          annotation: 'Compute the cross product.',
        },
        {
          expression: `|\\vec{u}\\times\\vec{v}|=\\sqrt{0+9+36}=\\sqrt{45}=3\\sqrt{5}\\approx6.71\\text{ m}^2`,
          annotation: 'Magnitude of the cross product = parallelogram area.',
        },
        {
          expression: `\\text{Triangle area}=\\tfrac{1}{2}\\times6.71=3.35\\text{ m}^2`,
          annotation: 'Divide by 2 for the triangle.',
        },
      ],
      conclusion: `The solar panel area is $\\approx3.35\\text{ m}^2$. The cross product works even though the panel is tilted in 3D space.`,
    },
    {
      id: 'ch1-016-ex3',
      title: 'Magnetic force on an electron',
      problem: `An electron ($q=-1.6\\times10^{-19}\\text{ C}$) moves with $\\vec{v}=(0,3\\times10^6,0)\\text{ m/s}$ in field $\\vec{B}=(0.5,0,0)\\text{ T}$. Find the force $\\vec{F}=q\\vec{v}\\times\\vec{B}$.`,
      steps: [
        {
          expression: `\\vec{v}\\times\\vec{B}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\0&3\\times10^6&0\\\\0.5&0&0\\end{vmatrix}`,
          annotation: 'Set up the cross product. Electron moves in +y; field is in +x.',
        },
        {
          expression: `=(3\\times10^6\\cdot0-0\\cdot0)\\hat{i}-(0\\cdot0-0\\cdot0.5)\\hat{j}+(0\\cdot0-3\\times10^6\\cdot0.5)\\hat{k}`,
          annotation: 'Expand the minors.',
        },
        {
          expression: `=(0, 0, -1.5\\times10^6)`,
          annotation: 'The cross product v⃗ × B⃗ points in the −z direction.',
        },
        {
          expression: `\\vec{F}=q(\\vec{v}\\times\\vec{B})=(-1.6\\times10^{-19})\\times(0,0,-1.5\\times10^6)=(0,0,2.4\\times10^{-13})\\text{ N}`,
          annotation: 'Multiply by the (negative) charge. Negative × negative = positive.',
        },
      ],
      conclusion: `$\\vec{F}=(0,0,2.4\\times10^{-13})\\text{ N}$ — the electron is pushed in the $+z$ direction. The negative charge flips the direction compared to a positive charge moving the same way.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-016-ch1',
      difficulty: 'easy',
      problem: `Find the area of the parallelogram with edge vectors $\\vec{A}=(2,-1,2)$ and $\\vec{B}=(3,1,-2)$.`,
      hint: 'Compute A⃗ × B⃗ using the determinant, then find the magnitude.',
      walkthrough: [
        {
          expression: `\\vec{A}\\times\\vec{B}=((-1)(-2)-(2)(1))\\hat{i}-((2)(-2)-(2)(3))\\hat{j}+((2)(1)-(-1)(3))\\hat{k}`,
          annotation: 'Expand the determinant.',
        },
        {
          expression: `=(2-2)\\hat{i}-(-4-6)\\hat{j}+(2+3)\\hat{k}=(0,10,5)`,
          annotation: 'Simplify each component.',
        },
        {
          expression: `|\\vec{A}\\times\\vec{B}|=\\sqrt{0+100+25}=\\sqrt{125}=5\\sqrt{5}\\approx11.18\\text{ units}^2`,
          annotation: 'Magnitude = parallelogram area.',
        },
      ],
      answer: `$5\\sqrt{5}\\approx11.18$ square units`,
    },
    {
      id: 'ch1-016-ch2',
      difficulty: 'medium',
      problem: `A bolt is located at origin. A wrench applies force $\\vec{F}=(0,-15,0)\\text{ N}$ at position $\\vec{r}=(0.2,0.1,0)\\text{ m}$. (a) Find the torque. (b) Does the bolt tighten or loosen (from a standard right-hand thread)?`,
      hint: 'Compute τ⃗ = r⃗ × F⃗. The sign of the z-component tells you the rotation direction.',
      walkthrough: [
        {
          expression: `\\vec{\\tau}=\\vec{r}\\times\\vec{F}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\0.2&0.1&0\\\\0&-15&0\\end{vmatrix}`,
          annotation: 'Set up the determinant.',
        },
        {
          expression: `=(0.1\\cdot0-0\\cdot(-15))\\hat{i}-(0.2\\cdot0-0\\cdot0)\\hat{j}+(0.2\\cdot(-15)-0.1\\cdot0)\\hat{k}`,
          annotation: 'Expand.',
        },
        {
          expression: `=(0,0,-3.0)\\text{ N·m}`,
          annotation: 'Torque is in the −z direction.',
        },
        {
          expression: `-z\\implies\\text{clockwise rotation when viewed from above}\\implies\\text{loosens (counterclockwise tightens)}`,
          annotation: 'Right-hand thread convention: clockwise from above loosens, counterclockwise tightens.',
        },
      ],
      answer: `$\\vec{\\tau}=(0,0,-3.0)\\text{ N·m}$. The bolt loosens (clockwise rotation from the +z viewpoint).`,
    },
    {
      id: 'ch1-016-ch3',
      difficulty: 'hard',
      problem: `A proton ($q=+1.6\\times10^{-19}\\text{ C}$, $m=1.67\\times10^{-27}\\text{ kg}$) moves with speed $v=2\\times10^6\\text{ m/s}$ in a uniform magnetic field $B=0.3\\text{ T}$ perpendicular to its velocity. (a) Find the magnitude of the magnetic force. (b) Find the radius of the circular orbit it follows. (Hint: magnetic force provides centripetal acceleration: $qvB = mv^2/r$.)`,
      hint: 'Since v⃗ ⊥ B⃗, sinφ = 1 so |F| = qvB. Then set qvB = mv²/r and solve for r.',
      walkthrough: [
        {
          expression: `|\\vec{F}|=|q||\\vec{v}\\times\\vec{B}|=|q|vB\\sin90°=(1.6\\times10^{-19})(2\\times10^6)(0.3)=9.6\\times10^{-14}\\text{ N}`,
          annotation: 'Since v⃗ ⊥ B⃗, sinφ = 1.',
        },
        {
          expression: `\\text{Set }qvB=\\frac{mv^2}{r}\\implies r=\\frac{mv}{qB}=\\frac{(1.67\\times10^{-27})(2\\times10^6)}{(1.6\\times10^{-19})(0.3)}`,
          annotation: 'Centripetal force = magnetic force. Solve for radius.',
        },
        {
          expression: `r=\\frac{3.34\\times10^{-21}}{4.8\\times10^{-20}}=0.0696\\text{ m}\\approx7\\text{ cm}`,
          annotation: 'The proton curves in a circle of radius about 7 cm.',
        },
      ],
      answer: `$|F|=9.6\\times10^{-14}\\text{ N}$, orbital radius $r\\approx0.070\\text{ m}=7.0\\text{ cm}$. This is the principle behind cyclotrons and mass spectrometers.`,
    },
  ],

  // ── Python Lab ───────────────────────────────────────────────────────────
  python: {
    title: 'Python Lab — Cross Product Applications',
    description: `Apply NumPy cross products to real physics: torque analysis, magnetic force trajectories, triangle area, and coplanarity detection.`,
    placement: 'after-rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Physics applications of the cross product',
        props: {
          initialCells: [
          // ── CELL 1: Torque analysis ───────────────────────────────────
          {
            id: 'cell-01',
            type: 'code',
            cellTitle: 'Torque analysis — optimal force direction',
            code:
`import numpy as np
import matplotlib.pyplot as plt

# Wrench: handle along +x, 0.35 m long
r = np.array([0.35, 0.0, 0.0])
F_mag = 20  # N

# Torque as a function of force angle (in xy-plane)
angles = np.linspace(0, 360, 361)
torques = []

for deg in angles:
    rad = np.radians(deg)
    F = np.array([F_mag * np.cos(rad), F_mag * np.sin(rad), 0])
    tau = np.cross(r, F)
    torques.append(tau[2])   # z-component = scalar torque in 2D

angles_arr = np.array(angles)
torques_arr = np.array(torques)

# Maximum torque
idx_max = np.argmax(np.abs(torques_arr))
print(f"Maximum |τ| = {abs(torques_arr[idx_max]):.4f} N·m at {angles_arr[idx_max]:.0f}°")
print(f"Theoretical max = r × F = {0.35 * 20:.4f} N·m")

plt.figure(figsize=(8, 4))
plt.plot(angles_arr, torques_arr, 'b-', linewidth=2)
plt.axhline(0, color='k', linewidth=0.5)
plt.xlabel('Force angle (degrees)')
plt.ylabel('Torque z-component (N·m)')
plt.title('Torque vs Force Direction')
plt.grid(True, alpha=0.3)
plt.savefig('torque_vs_angle.png', dpi=100, bbox_inches='tight')
plt.show()`,
            expectedOutput: `Maximum |τ| = 7.0000 N·m at 90°\nTheoretical max = r × F = 7.0000 N·m`,
          },

          // ── CELL 2: Magnetic force circular orbit ─────────────────────
          {
            id: 'cell-02',
            type: 'code',
            cellTitle: 'Magnetic force — circular orbit of a charged particle',
            code:
`import numpy as np
import matplotlib.pyplot as plt

# Proton in a magnetic field (field along +z)
q  = 1.6e-19    # C
m  = 1.67e-27   # kg
B_mag = 0.3     # T
v_mag = 2e6     # m/s

# Theoretical orbital radius
r_orbit = m * v_mag / (q * B_mag)
print(f"Orbital radius = {r_orbit*100:.2f} cm")
print(f"Period = {2*np.pi*r_orbit/v_mag * 1e9:.2f} ns")

# Simulate the circular orbit (simplified: keep |v| constant)
theta_vals = np.linspace(0, 2*np.pi, 1000)
x = r_orbit * np.cos(theta_vals)
y = r_orbit * np.sin(theta_vals)

# Check: at θ=0, v is in +y, F = q*v×B should be in -x (centripetal)
v = np.array([0, v_mag, 0])
B = np.array([0, 0, B_mag])
F = q * np.cross(v, B)
print(f"\\nAt start: v = +y, B = +z")
print(f"F = q(v × B) = {F} N")
print("Force direction:", "−x (centripetal ✓)" if F[0] < 0 else "+x")

plt.figure(figsize=(5, 5))
plt.plot(x * 100, y * 100, 'b-', linewidth=2, label='Proton orbit')
plt.plot(0, 0, 'r*', markersize=10, label='Center')
plt.xlabel('x (cm)'); plt.ylabel('y (cm)')
plt.title(f'Circular Orbit, r = {r_orbit*100:.1f} cm')
plt.legend(); plt.axis('equal'); plt.grid(True, alpha=0.3)
plt.savefig('proton_orbit.png', dpi=100, bbox_inches='tight')
plt.show()`,
            expectedOutput:
`Orbital radius = 6.96 cm
Period = 21.83 ns

At start: v = +y, B = +z
F = q(v × B) = [-9.6e-14  0.00e+00  0.00e+00] N
Force direction: −x (centripetal ✓)`,
          },

          // ── CELL 3: Triangle area and surface normal ───────────────────
          {
            id: 'cell-03',
            type: 'code',
            cellTitle: 'Triangle area and surface normal in 3D',
            code:
`import numpy as np

def triangle_info(p1, p2, p3):
    """Return area and unit normal of a 3D triangle."""
    p1, p2, p3 = np.array(p1, float), np.array(p2, float), np.array(p3, float)
    u = p2 - p1
    v = p3 - p1
    cross = np.cross(u, v)
    area = 0.5 * np.linalg.norm(cross)
    normal = cross / np.linalg.norm(cross)
    return area, normal

# Solar panel example
p1 = [0, 0, 0]
p2 = [3, 0, 0]
p3 = [1, 2, 1]

area, normal = triangle_info(p1, p2, p3)
print(f"Triangle vertices: {p1}, {p2}, {p3}")
print(f"Area = {area:.4f} m²")
print(f"Unit normal = {np.round(normal, 4)}")

# The dot product of normal with sunlight direction tells efficiency
sun_direction = np.array([0, 0, -1])   # sunlight coming straight down (-z)
sun_direction = sun_direction / np.linalg.norm(sun_direction)
efficiency = abs(np.dot(normal, sun_direction))  # cos(angle)
print(f"\\nSunlight direction: {sun_direction}")
print(f"cos(angle with sun) = {efficiency:.4f}")
print(f"Panel efficiency = {efficiency*100:.1f}% (100% = perfectly perpendicular to sun)")`,
            expectedOutput:
`Triangle vertices: [0, 0, 0] [3, 0, 0] [1, 2, 1]
Area = 3.3541 m²
Unit normal = [ 0.     -0.4472  0.8944]

Sunlight direction: [ 0.  0. -1.]
cos(angle with sun) = 0.8944
Panel efficiency = 89.4% (100% = perfectly perpendicular to sun)`,
          },

          // ── CELL 4: Challenge — angular momentum ──────────────────────
          {
            id: 'cell-04',
            type: 'code',
            challengeTitle: 'Challenge: Angular momentum of an orbiting planet',
            challengeType: 'fill-in',
            code:
`import numpy as np

# Earth orbits the sun.
# At a given moment:
# Position: r⃗ = (1.5e11, 0, 0) m  (1.5 × 10¹¹ m along +x)
# Velocity:  v⃗ = (0, 2.98e4, 0) m/s  (29.8 km/s along +y)
# Mass:      m = 5.97e24 kg

r = np.array([1.5e11, 0.0, 0.0])   # metres
v = np.array([0.0, 2.98e4, 0.0])   # m/s
m = 5.97e24                         # kg

# Angular momentum: L⃗ = r⃗ × p⃗ = r⃗ × (m × v⃗)
# Step 1: compute momentum p⃗ = m * v⃗
# Step 2: compute L⃗ = r⃗ × p⃗
# Step 3: print the direction (which axis?) and magnitude

# TODO: compute p and L here

# print the results
# print(f"Momentum p⃗ = {p} kg·m/s")
# print(f"Angular momentum L⃗ = {L} kg·m²/s")
# print(f"|L⃗| = {np.linalg.norm(L):.3e} kg·m²/s")
# print(f"L points in {'+ or -z'} direction — orbit is {'counterclockwise or clockwise'}")`,
            testCode:
`L_expected = np.cross(r, m * v)
assert np.allclose(L, L_expected, rtol=1e-6), f"L incorrect. Expected {L_expected}, got {L}"`,
            hint: `Compute \`p = m * v\` (scalar × vector), then \`L = np.cross(r, p)\`. Earth orbits counterclockwise when viewed from above (the +z direction), so L should point in +z. The magnitude should be around $2.66\\times10^{40}$ kg·m²/s.`,
          },

          // ── CELL 5: Challenge — coplanarity test ──────────────────────
          {
            id: 'cell-05',
            type: 'code',
            challengeTitle: 'Challenge: Are these points coplanar?',
            challengeType: 'write',
            code:
`import numpy as np

# Three sets of 4 points each. For each set, determine if the 4 points are coplanar.
# A set of 4 points is coplanar if the scalar triple product of any three edge vectors is zero.
#
# Method: pick one point as origin, form 3 edge vectors, compute scalar triple product.
# If |triple product| < 1e-9, the points are coplanar.

def are_coplanar(p1, p2, p3, p4):
    """Return True if the four 3D points are coplanar."""
    # Your code here
    pass

# Test cases
set1 = [[0,0,0], [1,0,0], [0,1,0], [1,1,0]]   # all in xy-plane (coplanar)
set2 = [[0,0,0], [1,0,0], [0,1,0], [0,0,1]]   # not coplanar (tetrahedron vertices)
set3 = [[1,2,3], [2,4,6], [3,6,9], [4,8,12]]  # all on the line (coplanar)

for i, pts in enumerate([set1, set2, set3], 1):
    result = are_coplanar(*pts)
    print(f"Set {i}: coplanar = {result}")`,
            testCode:
`assert are_coplanar(*set1) == True, "Set 1 should be coplanar"
assert are_coplanar(*set2) == False, "Set 2 should NOT be coplanar"
assert are_coplanar(*set3) == True, "Set 3 should be coplanar"
print("All coplanarity tests passed ✓")`,
            hint: `Inside \`are_coplanar\`, compute edge vectors: \`u = p2 - p1\`, \`v = p3 - p1\`, \`w = p4 - p1\`. Then check \`abs(np.dot(u, np.cross(v, w))) < 1e-9\`.`,
          },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-016-q1',
      question: `The torque on a bolt is $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$. If $|\\vec{r}| = 0.4\\text{ m}$ and $|\\vec{F}| = 10\\text{ N}$ with $\\phi = 90°$ between them, what is $|\\vec{\\tau}|$?`,
      options: [
        `$4\\text{ N·m}$`,
        `$25\\text{ N·m}$`,
        `$14\\text{ N·m}$`,
        `$0\\text{ N·m}$`,
      ],
      answer: 0,
      explanation: `$|\\vec{\\tau}| = |\\vec{r}||\\vec{F}|\\sin\\phi = 0.4 \\times 10 \\times \\sin 90° = 0.4 \\times 10 \\times 1 = 4\\text{ N·m}$. At 90° the force is fully perpendicular to the lever arm, giving maximum torque.`,
    },
    {
      id: 'p1-ch1-016-q2',
      question: `A force is applied along the same line as the position vector $\\vec{r}$ (i.e. directed through the pivot). What is the torque?`,
      options: [
        `Maximum torque`,
        `$|\\vec{r}||\\vec{F}|$`,
        `Zero`,
        `$|\\vec{r}| + |\\vec{F}|$`,
      ],
      answer: 2,
      explanation: `When $\\vec{F}$ is parallel to $\\vec{r}$, $\\phi = 0°$ and $\\sin 0° = 0$, so $|\\vec{\\tau}| = 0$. Force directed through the pivot produces no rotation — the classic "pushing on a door at the hinge" example.`,
    },
    {
      id: 'p1-ch1-016-q3',
      question: `The area of the parallelogram formed by vectors $\\vec{a} = (3, 0, 0)$ and $\\vec{b} = (0, 4, 0)$ is:`,
      options: [
        `7`,
        `5`,
        `12`,
        `$\\sqrt{7}$`,
      ],
      answer: 2,
      explanation: `$\\vec{a} \\times \\vec{b} = (0, 0, 12)$, so $|\\vec{a} \\times \\vec{b}| = 12$. Alternatively, $|\\vec{a}||\\vec{b}|\\sin 90° = 3 \\times 4 \\times 1 = 12$. The triangle formed by the same two edges has half this area: 6.`,
    },
    {
      id: 'p1-ch1-016-q4',
      question: `The magnetic force on a moving charge is $\\vec{F} = q\\vec{v} \\times \\vec{B}$. If a proton moves in $+x$ and the field points in $+y$, which direction does the force act?`,
      options: [
        `$+x$`,
        `$+y$`,
        `$+z$`,
        `$-z$`,
      ],
      answer: 2,
      explanation: `$\\hat{x} \\times \\hat{y} = \\hat{z}$ by the cyclic rule. Right-hand rule: point fingers along $+x$, curl toward $+y$, thumb points $+z$. The proton is deflected in the $+z$ direction.`,
    },
    {
      id: 'p1-ch1-016-q5',
      question: `The scalar triple product $\\vec{A} \\cdot (\\vec{B} \\times \\vec{C})$ equals zero. What does this mean geometrically?`,
      options: [
        `$\\vec{A}$ is perpendicular to $\\vec{B}$`,
        `$\\vec{B}$ and $\\vec{C}$ are parallel`,
        `The three vectors are coplanar (lie in the same plane)`,
        `$\\vec{A}$ is parallel to $\\vec{B} \\times \\vec{C}$`,
      ],
      answer: 2,
      explanation: `The scalar triple product equals the signed volume of the parallelepiped formed by the three vectors. Zero volume means the three vectors are coplanar — they all lie in the same plane, so no 3D solid can be formed.`,
    },
    {
      id: 'p1-ch1-016-q6',
      question: `Which cross product formula gives the area of a triangle with edge vectors $\\vec{a}$ and $\\vec{b}$?`,
      options: [
        `$|\\vec{a} \\times \\vec{b}|$`,
        `$\\frac{1}{2}|\\vec{a} \\times \\vec{b}|$`,
        `$|\\vec{a} \\cdot \\vec{b}|$`,
        `$2|\\vec{a} \\times \\vec{b}|$`,
      ],
      answer: 1,
      explanation: `A triangle is half a parallelogram, so its area is $\\frac{1}{2}|\\vec{a} \\times \\vec{b}|$. This works in 3D for any triangle, regardless of its orientation in space.`,
    },
    {
      id: 'p1-ch1-016-q7',
      question: `A magnetic force $\\vec{F} = q\\vec{v} \\times \\vec{B}$ is always perpendicular to $\\vec{v}$. What physical consequence does this have?`,
      options: [
        `The particle accelerates in the direction it's moving`,
        `The magnetic force does no work on the particle and cannot change its speed`,
        `The magnetic force slows the particle down`,
        `The particle moves in a straight line`,
      ],
      answer: 1,
      explanation: `Work = $\\vec{F} \\cdot d\\vec{s}$. Since $\\vec{F}$ is always perpendicular to $\\vec{v}$ (and therefore to $d\\vec{s}$), the dot product is always zero — the magnetic force does no work. It can only change direction, not speed, causing the particle to move in a circular arc.`,
    },
    {
      id: 'p1-ch1-016-q8',
      question: `The moment arm in torque is defined as:`,
      options: [
        `The full length of $|\\vec{r}|$`,
        `$|\\vec{F}|\\sin\\phi$ — the component of force perpendicular to $\\vec{r}$`,
        `$|\\vec{r}||\\vec{F}|$`,
        `$|\\vec{r}|\\cos\\phi$ — the component of $\\vec{r}$ along $\\vec{F}$`,
      ],
      answer: 1,
      explanation: `The moment arm is the perpendicular distance from the pivot to the line of action of the force, which equals $|\\vec{r}|\\sin\\phi$ — or equivalently, the component of force perpendicular to the position vector, $|\\vec{F}|\\sin\\phi$. Both give the same $|\\vec{\\tau}| = rF\\sin\\phi$.`,
    },
  ],
}
