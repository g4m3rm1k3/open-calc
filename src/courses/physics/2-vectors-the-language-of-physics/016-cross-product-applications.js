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
    question: `A spinning gyroscope, a current-carrying wire in a magnetic field, a door closing on a hinge — what do these have in common?`,
    realWorldContext:
      `They all involve a force or momentum that acts at an angle to a pivot, and the physical effect depends critically on BOTH the magnitude of that force AND the geometry of where it's applied. A door closes faster when you push far from the hinge, not near it. A magnetic compass needle swings because the magnetic force on moving charges acts perpendicular to both the velocity and the field. A spinning top precesses because gravity's torque acts perpendicular to the angular momentum. In every case the answer is a cross product: $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$, $\\vec{F}=q\\vec{v}\\times\\vec{B}$, $\\vec{L}=\\vec{r}\\times\\vec{p}$. These aren't abstract formulas — they're the three most important equations in classical mechanics and electromagnetism, and they all share the same mathematical structure.`,
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
      `Before reading on, predict: you push a door with force $\\vec{F}=(0,-10,0)$ N at position $\\vec{r}=(0.8,0,0)$ m from the hinge. Which direction does the resulting torque point — toward you, away from you, or straight up/down? Take 30 seconds and use the right-hand rule before continuing.`,

      `The cross product has a beautiful geometric meaning that makes every application easy to understand. When you compute $\\vec{A}\\times\\vec{B}$, the magnitude $|\\vec{A}||\\vec{B}|\\sin\\phi$ is the **area of the parallelogram** that $\\vec{A}$ and $\\vec{B}$ span when placed tail-to-tail. The direction is perpendicular to that parallelogram, pointing "out of" the surface it defines. This geometry underlies every physical application.`,

      `**Torque** $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$: You push a door ($\\vec{F}$) at a point a distance $\\vec{r}$ from the hinge. If you push along the door (parallel to $\\vec{r}$), the cross product is zero — no rotation. If you push perpendicular to the door at maximum distance, you get maximum torque. The torque vector points along the rotation axis (into or out of the hinge). Its magnitude $|\\vec{r}||\\vec{F}|\\sin\\phi$ is maximised when the force is perpendicular to the position vector.`,

      `**Angular momentum** $\\vec{L}=\\vec{r}\\times\\vec{p}$: A planet orbiting the sun carries momentum $\\vec{p}=m\\vec{v}$. The angular momentum $\\vec{r}\\times(m\\vec{v})$ is perpendicular to the orbital plane — its direction describes the orbit axis and its magnitude encodes how "rotationally energetic" the orbit is. Kepler's second law is equivalent to conservation of angular momentum.`,

      `**Magnetic force** $\\vec{F}=q\\vec{v}\\times\\vec{B}$: A charged particle moving through a magnetic field feels a force perpendicular to both velocity and field. This is why magnetic forces curve particle paths into circles — the force is always perpendicular to velocity and can never do work (it can't speed up the particle, only change direction). Particle accelerators, mass spectrometers, and the aurora borealis all run on this cross product.`,

      `**Parallelogram area**: The area of any parallelogram with edge vectors $\\vec{A}$ and $\\vec{B}$ is $|\\vec{A}\\times\\vec{B}|$. For a triangle, the area is $\\frac{1}{2}|\\vec{A}\\times\\vec{B}|$. This works in 3D — the vectors can be tilted at any angle.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Applying the cross product to any physics problem',
        steps: [
          `Identify the two vectors whose "crossing" creates the physical effect (e.g., $\\vec{r}$ and $\\vec{F}$ for torque; $\\vec{v}$ and $\\vec{B}$ for magnetic force).`,
          `Predict the direction using the right-hand rule BEFORE computing. This is your sanity check.`,
          `Compute the cross product using the determinant formula. Multiply by any scalar (like $q$ or $m$). Verify perpendicularity by dot products.`,
        ],
      },
      {
        type: 'insight',
        title: 'The four great cross product applications',
        body: `Torque: $\\vec{\\tau} = \\vec{r}\\times\\vec{F}$ (N·m)\\n\\nAngular momentum: $\\vec{L} = \\vec{r}\\times\\vec{p} = \\vec{r}\\times(m\\vec{v})$ (kg·m²/s)\\n\\nMagnetic force: $\\vec{F} = q\\vec{v}\\times\\vec{B}$ (N)\\n\\nParallelogram area: $|\\vec{A}\\times\\vec{B}|$; triangle area: $\\tfrac{1}{2}|\\vec{A}\\times\\vec{B}|$`,
      },
      {
        type: 'insight',
        title: 'Why cross products appear when something rotates',
        body: `Any time a physical quantity depends on both a distance and a force (or momentum) that act at an angle, the answer is a cross product. The "twisting" effect of a force about a pivot, the "circling" effect of a moving charge in a field — both involve two vectors crossing at some angle, and the result lives perpendicular to the plane they define.`,
      },
      {
        type: 'mnemonic',
        title: 'Right-hand rule for torque',
        body: `For $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$:\\n1. Point fingers along $\\vec{r}$ (from pivot to force application point).\\n2. Curl fingers toward $\\vec{F}$ (the force direction).\\n3. Thumb points along $\\vec{\\tau}$ (the rotation axis).\\n\\nThumb up: counterclockwise rotation when viewed from above. Thumb down: clockwise.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'Parallelogram area = |A⃗ × B⃗|',
        caption: `The shaded region is the parallelogram formed by A⃗ and B⃗. Its area equals |A⃗ × B⃗| = |A||B|sinφ. For a triangle with the same two edges, divide by 2. The result vector points perpendicular to this plane.`,
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      `Let's work through the mathematics of each major application precisely.`,

      `**Torque magnitude and direction**: Given position vector $\\vec{r}$ (from pivot to force application point) and force $\\vec{F}$, torque is $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$. Magnitude: $|\\vec{\\tau}|=|\\vec{r}||\\vec{F}|\\sin\\phi$, where $\\phi$ is the angle between $\\vec{r}$ and $\\vec{F}$. The quantity $|\\vec{F}|\\sin\\phi$ is the **moment arm** — the component of force perpendicular to the position vector. Alternatively, $|\\vec{r}|\\sin\\phi$ is the perpendicular distance from the pivot to the line of action of the force. Both give the same magnitude.`,

      `**Area of a parallelogram and triangle**: For edge vectors $\\vec{a}$ and $\\vec{b}$, parallelogram area $=|\\vec{a}\\times\\vec{b}|$. Triangle area $=\\frac{1}{2}|\\vec{a}\\times\\vec{b}|$. This works in 3D — the vectors can be tilted at any angle.`,

      `**Coplanar vectors**: Three vectors $\\vec{A}$, $\\vec{B}$, $\\vec{C}$ are coplanar if and only if $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})=0$ (the scalar triple product equals zero, meaning the parallelepiped they span has zero volume).`,

      `**Right-handed coordinate systems**: The standard Cartesian system satisfies $\\hat{i}\\times\\hat{j}=\\hat{k}$, $\\hat{j}\\times\\hat{k}=\\hat{i}$, $\\hat{k}\\times\\hat{i}=\\hat{j}$. This is the definition of a right-handed coordinate system. Swapping any two axes gives a left-handed system where these products change sign.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Torque and the lever arm',
        body: `|\\vec{\\tau}| = |\\vec{r}||\\vec{F}|\\sin\\phi`,
      },
      {
        type: 'theorem',
        title: 'Triangle area from two edge vectors',
        body: `\\text{Area}_{\\triangle} = \\frac{1}{2}|\\vec{a}\\times\\vec{b}|`,
      },
      {
        type: 'theorem',
        title: 'Coplanarity test',
        body: `\\vec{A},\\vec{B},\\vec{C}\\text{ coplanar}\\iff\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})=0`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'cross-product-rhr' },
        title: 'One formula, many interpretations',
        caption: `Torque: τ⃗ = r⃗ × F⃗ — result along rotation axis. Magnetic force: F⃗ = qv⃗ × B⃗ — force perpendicular to both velocity and field. Parallelogram area: |a⃗ × b⃗|. The cross product structure is identical; only the physical quantities plugged in change.`,
      },
    ],
  },

  // ── Rigor ────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The torque formula $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$ follows from Newton's second law applied to rotation. The rotational analogue of $\\vec{F}=m\\vec{a}$ is $\\vec{\\tau}=I\\vec{\\alpha}$, where $I$ is the moment of inertia and $\\vec{\\alpha}$ is the angular acceleration. The cross product structure of torque ensures that the torque axis is always along the rotation axis — the perpendicularity is physically necessary, not accidental.`,

      `The magnetic force law $\\vec{F}=q\\vec{v}\\times\\vec{B}$ is a postulate of classical electrodynamics — it comes from the Lorentz force law and cannot be derived from more basic principles at this level. The cross product structure is essential: it guarantees that magnetic forces do no work on moving charges, which is a conservation of energy statement. This follows because $\\vec{F}_{mag}\\cdot\\vec{v} = (q\\vec{v}\\times\\vec{B})\\cdot\\vec{v} = 0$ always (the scalar triple product $\\vec{v}\\cdot(\\vec{v}\\times\\vec{B})=0$ since a vector is always perpendicular to a cross product involving itself).`,

      `**Conservation of angular momentum**: if no net torque acts on a system, $d\\vec{L}/dt=\\vec{\\tau}_{net}=\\vec{0}$, so $\\vec{L}=\\vec{r}\\times\\vec{p}$ remains constant. This explains why gyroscopes maintain their orientation, why orbits are planar, and why a spinning ice skater speeds up when pulling in their arms (reducing $r$ while conserving $|\\vec{L}|$ increases $\\omega$).`,

      `Looking further ahead: the cross product is a special structure of 3D space that generalises to the **exterior product** (wedge product) $\\vec{A}\\wedge\\vec{B}$ in higher dimensions. In relativistic mechanics, torque and angular momentum become antisymmetric rank-2 tensors — the cross product is the 3D dual of these. The area formula $|\\vec{A}\\times\\vec{B}|$ becomes $|\\vec{A}\\wedge\\vec{B}|$ in any dimension, computing the area of the parallelogram spanned by the two vectors in their 2D subspace.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: `Newton's 2nd law for rotation`,
        body: `$\\vec{\\tau}_{net} = \\frac{d\\vec{L}}{dt} = I\\vec{\\alpha}$. Torque is to rotation what force is to translation. Zero net torque implies constant angular momentum.`,
      },
      {
        type: 'insight',
        title: 'Magnetic force does no work — proven',
        body: `$P = \\vec{F}_{mag}\\cdot\\vec{v} = (q\\vec{v}\\times\\vec{B})\\cdot\\vec{v} = 0$ always, because $\\vec{v}\\cdot(\\vec{v}\\times\\vec{B})=0$ (any vector dotted with a cross product involving itself is zero). Magnetic forces only change direction, never speed.`,
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
        annotation: 'Pushing a door perpendicular to the handle gives maximum torque. Pushing through the hinge gives zero.',
      },
      {
        title: 'Magnetic force does no work',
        expression: `\\vec{F}_{mag}\\cdot\\vec{v} = (q\\vec{v}\\times\\vec{B})\\cdot\\vec{v} = q\\,(\\vec{v}\\times\\vec{B})\\cdot\\vec{v} = 0`,
        annotation: 'The scalar triple product v⃗·(v⃗×B⃗) = 0 because a vector is always perpendicular to any cross product involving itself.',
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
          expression: `\\vec{F}=(10\\cos45°, 10\\sin45°, 0)\\approx(7.07, 7.07, 0)\\text{ N}`,
          annotation: 'Resolve the force into components.',
        },
        {
          expression: `\\vec{\\tau}=\\vec{r}\\times\\vec{F}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\0.4&0&0\\\\7.07&7.07&0\\end{vmatrix}`,
          annotation: 'Set up the determinant.',
        },
        {
          expression: `R_z=(0.4)(7.07)-(0)(7.07)=2.83,\\quad R_x=R_y=0`,
          annotation: 'Both vectors in the xy-plane, so only z-component survives.',
        },
        {
          expression: `\\vec{\\tau}=(0, 0, 2.83)\\text{ N·m}`,
          annotation: 'Torque points in +z — the bolt turns counterclockwise viewed from above.',
        },
        {
          expression: `|\\vec{\\tau}|=2.83\\approx|\\vec{r}||\\vec{F}|\\sin45°=0.4\\times10\\times0.707=2.83\\;\\checkmark`,
          annotation: 'Verify using the magnitude formula.',
        },
      ],
      conclusion: `$\\vec{\\tau}=(0,0,2.83)\\text{ N·m}$ — counterclockwise rotation. Less than the maximum (4 N·m at 90°) because the force is at 45°.`,
    },
    {
      id: 'ch1-016-ex2',
      title: 'Area of a 3D triangle (solar panel)',
      problem: `A triangular solar panel has vertices at $P_1=(0,0,0)$, $P_2=(3,0,0)\\text{ m}$, $P_3=(1,2,1)\\text{ m}$. Find its area.`,
      steps: [
        {
          expression: `\\vec{u}=P_2-P_1=(3,0,0),\\quad\\vec{v}=P_3-P_1=(1,2,1)`,
          annotation: 'Edge vectors from P1.',
        },
        {
          expression: `\\vec{u}\\times\\vec{v}=(0\\cdot1-0\\cdot2)\\hat{i}-(3\\cdot1-0\\cdot1)\\hat{j}+(3\\cdot2-0\\cdot1)\\hat{k}=(0,-3,6)`,
          annotation: 'Cross product of the two edge vectors.',
        },
        {
          expression: `|\\vec{u}\\times\\vec{v}|=\\sqrt{0+9+36}=\\sqrt{45}=3\\sqrt{5}\\approx6.71\\text{ m}^2`,
          annotation: 'Magnitude = parallelogram area.',
        },
        {
          expression: `\\text{Triangle area}=\\tfrac{1}{2}\\times6.71\\approx3.35\\text{ m}^2`,
          annotation: 'Divide by 2 for the triangle.',
        },
      ],
      conclusion: `The solar panel area is $\\approx3.35\\text{ m}^2$. The cross product works even though the panel is tilted in 3D.`,
    },
    {
      id: 'ch1-016-ex3',
      title: 'Magnetic force on an electron',
      problem: `An electron ($q=-1.6\\times10^{-19}\\text{ C}$) moves with $\\vec{v}=(0,3\\times10^6,0)\\text{ m/s}$ in field $\\vec{B}=(0.5,0,0)\\text{ T}$. Find the force.`,
      steps: [
        {
          expression: `\\vec{v}\\times\\vec{B}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\0&3\\times10^6&0\\\\0.5&0&0\\end{vmatrix}`,
          annotation: 'Set up the cross product. Electron moves in +y; field in +x.',
        },
        {
          expression: `R_z=(0)(0)-(3\\times10^6)(0.5)=-1.5\\times10^6,\\quad R_x=R_y=0`,
          annotation: 'Expand the minors. Only R_z survives.',
        },
        {
          expression: `\\vec{v}\\times\\vec{B}=(0, 0, -1.5\\times10^6)`,
          annotation: 'The cross product points in the −z direction.',
        },
        {
          expression: `\\vec{F}=q(\\vec{v}\\times\\vec{B})=(-1.6\\times10^{-19})(0,0,-1.5\\times10^6)=(0,0,2.4\\times10^{-13})\\text{ N}`,
          annotation: 'Negative charge × negative z = positive z. The electron is pushed upward.',
        },
      ],
      conclusion: `$\\vec{F}=(0,0,2.4\\times10^{-13})\\text{ N}$ in the $+z$ direction. The negative charge flips the direction relative to a positive charge moving the same way.`,
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
          expression: `R_x=(-1)(-2)-(2)(1)=2-2=0`,
          annotation: 'Cover column 1.',
        },
        {
          expression: `R_y=-[(2)(-2)-(2)(3)]=-[-4-6]=-(-10)=10`,
          annotation: 'Cover column 2, apply minus sign.',
        },
        {
          expression: `R_z=(2)(1)-(-1)(3)=2+3=5`,
          annotation: 'Cover column 3.',
        },
        {
          expression: `|\\vec{A}\\times\\vec{B}|=\\sqrt{0+100+25}=\\sqrt{125}=5\\sqrt{5}\\approx11.18`,
          annotation: 'Magnitude = parallelogram area.',
        },
      ],
      answer: `$5\\sqrt{5}\\approx11.18$ square units`,
    },
    {
      id: 'ch1-016-ch2',
      difficulty: 'medium',
      problem: `A wrench applies force $\\vec{F}=(0,-15,0)\\text{ N}$ at position $\\vec{r}=(0.2,0.1,0)\\text{ m}$. (a) Find $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$. (b) Does a right-hand thread tighten or loosen?`,
      hint: 'Compute the cross product. The sign of the z-component tells you the rotation direction.',
      walkthrough: [
        {
          expression: `\\vec{\\tau}=\\vec{r}\\times\\vec{F}=\\begin{vmatrix}\\hat{i}&\\hat{j}&\\hat{k}\\\\0.2&0.1&0\\\\0&-15&0\\end{vmatrix}`,
          annotation: 'Set up the determinant.',
        },
        {
          expression: `R_z=(0.2)(-15)-(0.1)(0)=-3.0\\text{ N·m},\\quad R_x=R_y=0`,
          annotation: 'Both vectors in the xy-plane, so only R_z is non-zero.',
        },
        {
          expression: `\\vec{\\tau}=(0,0,-3.0)\\text{ N·m}\\implies\\text{clockwise rotation from above}`,
          annotation: 'Negative z-component = clockwise when viewed from +z.',
        },
      ],
      answer: `$\\vec{\\tau}=(0,0,-3.0)\\text{ N·m}$. Clockwise from above — a right-hand thread loosens.`,
    },
    {
      id: 'ch1-016-ch3',
      difficulty: 'hard',
      problem: `A proton ($q=+1.6\\times10^{-19}\\text{ C}$, $m=1.67\\times10^{-27}\\text{ kg}$) moves at $v=2\\times10^6\\text{ m/s}$ perpendicular to $B=0.3\\text{ T}$. (a) Find $|\\vec{F}|$. (b) Find the orbital radius (hint: $qvB=mv^2/r$).`,
      hint: 'Since v⃗ ⊥ B⃗, sinφ = 1 so |F| = qvB. Then solve qvB = mv²/r for r.',
      walkthrough: [
        {
          expression: `|\\vec{F}|=qvB\\sin90°=(1.6\\times10^{-19})(2\\times10^6)(0.3)=9.6\\times10^{-14}\\text{ N}`,
          annotation: 'v⃗ ⊥ B⃗ so sinφ = 1.',
        },
        {
          expression: `r=\\frac{mv}{qB}=\\frac{(1.67\\times10^{-27})(2\\times10^6)}{(1.6\\times10^{-19})(0.3)}=\\frac{3.34\\times10^{-21}}{4.8\\times10^{-20}}\\approx0.070\\text{ m}`,
          annotation: 'Solve qvB = mv²/r for r = mv/(qB).',
        },
      ],
      answer: `$|\\vec{F}|=9.6\\times10^{-14}\\text{ N}$, orbital radius $r\\approx7.0\\text{ cm}$. This is the principle behind cyclotrons.`,
    },
  ],

  // ── Notebooks ─────────────────────────────────────────────────────────────
  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Torque analysis — how force angle affects rotational effect',
          type: 'code',
          language: 'python',
          code:
`import numpy as np
import matplotlib.pyplot as plt

r = np.array([0.35, 0.0, 0.0])  # wrench handle: 0.35 m along +x
F_mag = 20  # N

angles = np.linspace(0, 360, 361)
torques = []
for deg in angles:
    rad = np.radians(deg)
    F = np.array([F_mag * np.cos(rad), F_mag * np.sin(rad), 0])
    tau = np.cross(r, F)
    torques.append(tau[2])       # z-component = rotation about bolt

torques = np.array(torques)
idx = np.argmax(np.abs(torques))
print(f"Max |τ| = {abs(torques[idx]):.2f} N·m at {angles[idx]:.0f}°")
print(f"Theoretical max = r × F_mag = {0.35 * 20:.2f} N·m")

plt.figure(figsize=(8, 4))
plt.plot(angles, torques, 'b-', linewidth=2)
plt.axhline(0, color='k', linewidth=0.5)
plt.xlabel('Force angle (degrees)')
plt.ylabel('Torque z-component (N·m)')
plt.title('τ = r × F: how angle determines torque')
plt.grid(True, alpha=0.3)
plt.tight_layout()
plt.show()`,
          prose: [
            `This code sweeps the force direction from 0° to 360° while keeping $|\\vec{F}|$ and $|\\vec{r}|$ fixed. For each angle, \`np.cross(r, F)\` computes the torque vector, and we extract the z-component — the scalar torque that drives rotation around the bolt.`,
            `The output confirms $|\\vec{\\tau}|_{max} = |\\vec{r}||\\vec{F}| = 0.35 \\times 20 = 7\\text{ N·m}$ occurs at 90° (force perpendicular to handle). At 0° and 180° the force is parallel to the handle — no rotation. The sinusoidal curve is $\\tau = rF\\sin\\phi$ made visible.`,
            `The right-hand rule predicts: at 90° (force in +y direction), $\\vec{r}=(+x)\\times\\vec{F}=(+y) = +z$ torque (counterclockwise). At 270°, force in $-y$: torque is $-z$ (clockwise). The sign of the z-component encodes rotation direction.`,
          ],
        },
        {
          cellTitle: 'Magnetic force and circular orbit of a proton',
          type: 'code',
          language: 'python',
          code:
`import numpy as np
import matplotlib.pyplot as plt

q = 1.6e-19   # C
m = 1.67e-27  # kg
B = 0.3       # T, field in +z direction
v = 2e6       # m/s

# Orbital radius and period
r_orbit = m * v / (q * B)
period = 2 * np.pi * r_orbit / v
print(f"Orbital radius = {r_orbit*100:.2f} cm")
print(f"Period = {period*1e9:.2f} ns")

# Verify force direction at start (v in +y, B in +z)
v_vec = np.array([0, v, 0])
B_vec = np.array([0, 0, B])
F_vec = q * np.cross(v_vec, B_vec)
print(f"\\nF = q(v × B) = {F_vec}")
print(f"Force in -x direction (centripetal): {F_vec[0] < 0}")

# Plot the circular orbit
theta = np.linspace(0, 2*np.pi, 500)
plt.figure(figsize=(5, 5))
plt.plot(r_orbit * np.cos(theta) * 100,
         r_orbit * np.sin(theta) * 100, 'b-', linewidth=2)
plt.plot(0, 0, 'r*', markersize=12, label='Center')
plt.xlabel('x (cm)'); plt.ylabel('y (cm)')
plt.title(f'Proton orbit: r = {r_orbit*100:.1f} cm, B = {B} T')
plt.axis('equal'); plt.grid(True, alpha=0.3); plt.legend()
plt.tight_layout()
plt.show()`,
          prose: [
            `The orbital radius $r = mv/(qB)$ comes from setting the magnetic force equal to the centripetal force: $qvB = mv^2/r$. This formula shows that a stronger field $B$ gives a tighter orbit (smaller $r$), and a faster particle gives a wider orbit. Mass spectrometers use this to separate isotopes by mass.`,
            `At the starting position (v in +y, B in +z): \`np.cross([0,v,0], [0,0,B])\` gives $(vB, 0, 0)$ — wait, let's check: $R_x = v_y B_z - v_z B_y = v\\cdot B - 0 = vB$. Then $\\vec{F} = q\\cdot(vB, 0, 0)$. For a proton ($q > 0$), force is in $+x$... but we said centripetal force should be toward the center. Since the proton starts at the top of the circle and moves in $+y$, the center is to the $+x$ side — so $+x$ force IS centripetal here. The code checks this.`,
            `The key physical insight: the magnetic force is always perpendicular to velocity (confirmed by the cross product). Therefore it does no work — it changes direction but not speed. The proton orbits at constant speed $v$ indefinitely (ignoring radiation effects).`,
          ],
        },
        {
          cellTitle: 'Triangle area, surface normals, and solar panel efficiency',
          type: 'code',
          language: 'python',
          code:
`import numpy as np

def triangle_area_and_normal(p1, p2, p3):
    p1, p2, p3 = [np.array(p, float) for p in [p1, p2, p3]]
    u, v = p2 - p1, p3 - p1
    cross = np.cross(u, v)
    area = 0.5 * np.linalg.norm(cross)
    normal = cross / np.linalg.norm(cross)
    return area, normal

# Example from the lesson: tilted solar panel
area, n_hat = triangle_area_and_normal([0,0,0], [3,0,0], [1,2,1])
print(f"Panel area = {area:.4f} m²")
print(f"Unit normal = {np.round(n_hat, 4)}")

# Solar efficiency: dot product of normal with sun direction
# Sun shines straight down: direction = (0, 0, -1)
sun = np.array([0, 0, -1.0])
efficiency = abs(np.dot(n_hat, sun))
print(f"\\nSun direction: {sun}")
print(f"Panel efficiency = {efficiency*100:.1f}%  (cos θ between panel and sun)")
print("(100% = panel faces the sun directly)")

# Compare three panel orientations
orientations = [
    ([0,0,0], [1,0,0], [0,1,0], 'horizontal (flat)'),
    ([0,0,0], [3,0,0], [1,2,1], 'tilted 30° south'),
    ([0,0,0], [1,0,0], [0,0,1], 'vertical (wall)'),
]
print("\\nOrientation comparison:")
for p1, p2, p3, label in orientations:
    _, n = triangle_area_and_normal(p1, p2, p3)
    eff = abs(np.dot(n, sun))
    print(f"  {label}: {eff*100:.1f}% efficiency")`,
          prose: [
            `Area = $\\frac{1}{2}|\\vec{u}\\times\\vec{v}|$ where $\\vec{u}=P_2-P_1$ and $\\vec{v}=P_3-P_1$. This formula works in full 3D — the triangle can be oriented at any angle. The cross product automatically "measures" the 2D area of the parallelogram spanned by the edge vectors, regardless of the 3D tilt.`,
            `Solar panel efficiency is proportional to $\\cos\\theta = \\hat{n}\\cdot\\hat{s}$ where $\\hat{n}$ is the panel normal and $\\hat{s}$ is the sun direction. When the panel faces the sun directly ($\\hat{n}\\parallel\\hat{s}$), $\\cos\\theta=1$ and efficiency is 100%. A panel lying flat (normal = $+z$) with the sun directly overhead achieves this. A tilted panel or angled sun reduces it.`,
            `The comparison confirms: horizontal panel facing a vertical sun = 100%; tilted panel = intermediate; vertical wall facing vertical sun = 0%. This is why solar farms tilt their panels toward the sun — maximising the dot product $\\hat{n}\\cdot\\hat{s}$ is equivalent to maximising the cross-product area that faces the light source.`,
          ],
        },
        {
          cellTitle: 'Challenge: angular momentum of Earth and coplanarity test',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode:
`import numpy as np

# Part A: Angular momentum of Earth
# At perihelion: r⃗ = (1.47e11, 0, 0) m, v⃗ = (0, 3.02e4, 0) m/s, m = 5.97e24 kg
r = np.array([1.47e11, 0.0, 0.0])
v = np.array([0.0, 3.02e4, 0.0])
m_earth = 5.97e24

# TODO: compute L = r × (m*v), print its direction and magnitude

# Part B: Coplanarity test
# Are these four points coplanar?
# P1=(0,0,0), P2=(1,0,0), P3=(0,1,0), P4=(0,0,1)  <- tetrahedron, NOT coplanar
# P1=(0,0,0), P2=(1,0,0), P3=(0,1,0), P4=(1,1,0)  <- all z=0, coplanar

def are_coplanar(p1, p2, p3, p4):
    # TODO: compute three edge vectors from p1, then check scalar triple product
    pass

pts_a = [[0,0,0], [1,0,0], [0,1,0], [0,0,1]]
pts_b = [[0,0,0], [1,0,0], [0,1,0], [1,1,0]]
print("Tetrahedron coplanar:", are_coplanar(*pts_a))   # should be False
print("Flat quad coplanar: ", are_coplanar(*pts_b))   # should be True`,
          prose: [
            `For Part A: compute \`p = m_earth * v\`, then \`L = np.cross(r, p)\`. Earth orbits counter-clockwise when viewed from $+z$, so $\\vec{L}$ should point in $+z$. Magnitude should be around $2.66\\times10^{40}$ kg·m²/s — an enormous number because Earth is massive and far from the sun.`,
            `For Part B: inside \`are_coplanar\`, compute \`u = p2-p1\`, \`v = p3-p1\`, \`w = p4-p1\` as numpy arrays. Then \`return abs(np.dot(u, np.cross(v, w))) < 1e-9\`. The tetrahedron vertices span 3D space (non-zero volume), so the triple product is non-zero. The flat quad has all points in the xy-plane (zero z), so the triple product is zero.`,
            `This connects both halves of the lesson: angular momentum uses the cross product to capture orbital geometry, and the coplanarity test uses the scalar triple product to detect when three vectors fail to span 3D space. Both rely on the same perpendicularity machinery.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Torque analysis — how force angle affects rotation',
          type: 'code',
          language: 'matlab',
          code:
`r = [0.35, 0, 0];   % wrench handle (m)
F_mag = 20;         % N

angles = 0:1:360;
torques = zeros(1, numel(angles));

for i = 1:numel(angles)
    rad = deg2rad(angles(i));
    F = [F_mag*cos(rad), F_mag*sin(rad), 0];
    tau = cross(r, F);
    torques(i) = tau(3);   % z-component = rotation about bolt
end

[max_tau, idx] = max(abs(torques));
fprintf('Max |tau| = %.2f N*m at %d deg\\n', max_tau, angles(idx))
fprintf('Theoretical max = %.2f N*m\\n', 0.35 * 20)

figure;
plot(angles, torques, 'b-', 'LineWidth', 2)
yline(0, 'k-', 'LineWidth', 0.5)
xlabel('Force angle (degrees)')
ylabel('Torque z-component (N*m)')
title('tau = r x F: how angle determines torque')
grid on`,
          prose: [
            `MATLAB's \`cross(r, F)\` computes the torque vector. \`tau(3)\` extracts the z-component — the rotation that would turn the bolt. The loop sweeps all force directions while holding position and force magnitude constant.`,
            `The maximum occurs at 90° with value $0.35 \\times 20 = 7$ N·m. At 0° and 180° the torque is zero — force through the handle axis causes no rotation. This is $\\tau = rF\\sin\\phi$ visualised as a sinusoid.`,
            `MATLAB's \`deg2rad\` converts degrees to radians. \`yline(0)\` draws the zero torque reference line, making it easy to see where the force direction crosses from CCW to CW rotation.`,
          ],
        },
        {
          cellTitle: 'Magnetic force: circular orbit of a proton',
          type: 'code',
          language: 'matlab',
          code:
`q = 1.6e-19;  m = 1.67e-27;  B = 0.3;  v = 2e6;

r_orbit = m * v / (q * B);
period = 2 * pi * r_orbit / v;
fprintf('Orbital radius = %.2f cm\\n', r_orbit * 100)
fprintf('Period = %.2f ns\\n', period * 1e9)

% Force direction check at start (v = +y, B = +z)
v_vec = [0, v, 0];
B_vec = [0, 0, B];
F_vec = q * cross(v_vec, B_vec);
fprintf('\\nF = q(v x B) = [%.2e %.2e %.2e] N\\n', F_vec)

% Plot the orbit
theta = linspace(0, 2*pi, 500);
figure;
plot(r_orbit * cos(theta) * 100, r_orbit * sin(theta) * 100, 'b-', 'LineWidth', 2)
hold on; plot(0, 0, 'r*', 'MarkerSize', 12)
xlabel('x (cm)'); ylabel('y (cm)')
title(sprintf('Proton orbit: r = %.1f cm, B = %.1f T', r_orbit*100, B))
axis equal; grid on`,
          prose: [
            `The orbital radius formula $r = mv/(qB)$ comes from balancing magnetic force $qvB$ with centripetal force $mv^2/r$. The code computes this and draws the circular orbit. A stronger $B$ field gives a tighter orbit; a higher-energy (faster) proton makes a wider orbit.`,
            `The force check confirms: at the starting position (v in +y, B in +z), \`cross(v_vec, B_vec)\` gives the centripetal direction. Multiplying by $q > 0$ keeps the direction — the proton curves inward. For an electron ($q < 0$) the force would flip, curving it the opposite way.`,
            `MATLAB's parametric plot \`r*cos(theta), r*sin(theta)\` draws the circle. \`axis equal\` ensures it appears circular rather than elliptical due to axis scaling. The red star marks the center of the circular orbit.`,
          ],
        },
        {
          cellTitle: 'Triangle area, unit normal, and solar panel efficiency',
          type: 'code',
          language: 'matlab',
          code:
`function [area, n_hat] = tri_info(p1, p2, p3)
    u = p2 - p1;  v = p3 - p1;
    c = cross(u, v);
    area = 0.5 * norm(c);
    n_hat = c / norm(c);
end

[area, n_hat] = tri_info([0,0,0], [3,0,0], [1,2,1]);
fprintf('Panel area = %.4f m^2\\n', area)
fprintf('Unit normal = [%.4f %.4f %.4f]\\n', n_hat)

sun = [0, 0, -1];
efficiency = abs(dot(n_hat, sun));
fprintf('\\nEfficiency = %.1f%%\\n', efficiency * 100)

% Compare orientations
cases = {
    [0,0,0],[1,0,0],[0,1,0], 'horizontal';
    [0,0,0],[3,0,0],[1,2,1], 'tilted';
    [0,0,0],[1,0,0],[0,0,1], 'vertical';
};
disp('Orientation efficiency:')
for i = 1:3
    [area_skip, n] = tri_info(cases{i,1}, cases{i,2}, cases{i,3});
    fprintf('  %s: %.1f%%\\n', cases{i,4}, abs(dot(n, sun))*100)
end`,
          prose: [
            `The \`tri_info\` function follows the same formula as the Python version: edge vectors $\\vec{u}=P_2-P_1$, $\\vec{v}=P_3-P_1$, cross product, divide area by 2, divide normal by its norm.`,
            `Solar panel efficiency = $|\\hat{n}\\cdot\\hat{s}|$ where $\\hat{s}$ is the sun direction. When $\\hat{n}\\parallel\\hat{s}$ (panel faces sun directly), the dot product is 1 (100% efficiency). When $\\hat{n}\\perp\\hat{s}$ (edge-on to sun), it's 0. Real solar farms optimize this angle throughout the day.`,
            `MATLAB struct arrays would be cleaner here, but the cell array \`cases\` avoids the function scope issue with passing mixed types. The loop calls \`tri_info\` for each orientation — the tilted panel achieves higher efficiency than vertical but lower than horizontal (when sun is directly overhead).`,
          ],
        },
        {
          cellTitle: 'Challenge: angular momentum and coplanarity',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode:
`% Part A: Angular momentum of Earth at perihelion
r = [1.47e11, 0, 0];      % m
v = [0, 3.02e4, 0];       % m/s
m_earth = 5.97e24;        % kg

% TODO: compute L = r × (m_earth * v)
% TODO: print direction and magnitude

% Part B: Coplanarity test
function result = are_coplanar(p1, p2, p3, p4)
    % TODO: compute three edge vectors from p1
    % TODO: check if scalar triple product is near zero
    result = false;  % placeholder
end

pts_a = {[0,0,0], [1,0,0], [0,1,0], [0,0,1]};  % tetrahedron
pts_b = {[0,0,0], [1,0,0], [0,1,0], [1,1,0]};  % flat quad

fprintf('Tetrahedron coplanar: %d\\n', are_coplanar(pts_a{:}))
fprintf('Flat quad coplanar:   %d\\n', are_coplanar(pts_b{:}))`,
          prose: [
            `For Part A: \`L = cross(r, m_earth * v)\`. Earth's orbit is in the xy-plane, so $\\vec{L}$ points in $+z$ (counterclockwise orbit viewed from above). The magnitude $|\\vec{L}| = m|\\vec{r}||\\vec{v}|\\sin 90° = m r v$ (since $\\vec{r}\\perp\\vec{v}$ at perihelion) ≈ $2.66\\times10^{40}$ kg·m²/s.`,
            `For Part B: inside \`are_coplanar\`, compute \`u = p2-p1; v = p3-p1; w = p4-p1\`, then \`result = abs(dot(u, cross(v,w))) < 1e-9\`. The tetrahedron has 4 non-coplanar vertices (triple product ≠ 0). The flat quad has all points in the z=0 plane (triple product = 0).`,
            `The coplanarity test is used in 3D geometry to check if a polygon is flat (needed before triangulation), and in linear algebra to check if three vectors span the full 3D space (or only a 2D subspace within it).`,
          ],
        },
      ],
    },
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-016-q1',
      type: 'choice',
      question: `The torque on a bolt is $\\vec{\\tau} = \\vec{r} \\times \\vec{F}$. If $|\\vec{r}| = 0.4\\text{ m}$ and $|\\vec{F}| = 10\\text{ N}$ with $\\phi = 90°$ between them, what is $|\\vec{\\tau}|$?`,
      options: [
        `$4\\text{ N·m}$`,
        `$25\\text{ N·m}$`,
        `$14\\text{ N·m}$`,
        `$0\\text{ N·m}$`,
      ],
      answer: `$4\\text{ N·m}$`,
      hints: [
        `$|\\vec{\\tau}| = |\\vec{r}||\\vec{F}|\\sin\\phi$. Substitute $\\sin 90° = 1$.`,
        `$0.4 \\times 10 \\times 1 = 4$.`,
      ],
      reviewSection: 'examples',
      explanation: `$|\\vec{\\tau}| = 0.4 \\times 10 \\times \\sin 90° = 4\\text{ N·m}$. At 90° the force is fully perpendicular to the lever arm, giving maximum torque.`,
    },
    {
      id: 'p1-ch1-016-q2',
      type: 'choice',
      question: `A force is applied directly toward the pivot (along $\\vec{r}$, so $\\phi = 0°$). What is the torque?`,
      options: [
        `Maximum torque`,
        `$|\\vec{r}||\\vec{F}|$`,
        `Zero`,
        `$|\\vec{r}| + |\\vec{F}|$`,
      ],
      answer: `Zero`,
      hints: [
        `$|\\vec{\\tau}| = |\\vec{r}||\\vec{F}|\\sin\\phi$. What is $\\sin 0°$?`,
        `Think about pushing a door at the hinge itself.`,
      ],
      reviewSection: 'math',
      explanation: `When $\\vec{F}$ is parallel to $\\vec{r}$, $\\phi = 0°$ and $\\sin 0° = 0$, so $|\\vec{\\tau}| = 0$. Force directed through the pivot produces no rotation.`,
    },
    {
      id: 'p1-ch1-016-q3',
      type: 'choice',
      question: `The area of the parallelogram formed by $\\vec{a} = (3, 0, 0)$ and $\\vec{b} = (0, 4, 0)$ is:`,
      options: [
        `$7$`,
        `$5$`,
        `$12$`,
        `$\\sqrt{7}$`,
      ],
      answer: `$12$`,
      hints: [
        `Area = $|\\vec{a}\\times\\vec{b}|$. Since the vectors are perpendicular, $\\sin 90° = 1$.`,
        `$|\\vec{a}||\\vec{b}|\\sin 90° = 3 \\times 4 \\times 1 = 12$.`,
      ],
      reviewSection: 'math',
      explanation: `$\\vec{a}\\times\\vec{b}=(0,0,12)$, so area = 12. The triangle formed by the same edges has half this area: 6.`,
    },
    {
      id: 'p1-ch1-016-q4',
      type: 'choice',
      question: `A proton moves in $+x$ and the magnetic field points in $+y$. The magnetic force $\\vec{F} = q\\vec{v}\\times\\vec{B}$ acts in which direction?`,
      options: [
        `$+x$`,
        `$+y$`,
        `$+z$`,
        `$-z$`,
      ],
      answer: `$+z$`,
      hints: [
        `Compute $\\hat{x}\\times\\hat{y}$ using the cyclic rule: $\\hat{i}\\times\\hat{j}=\\hat{k}$.`,
        `Right-hand rule: point along $+x$, curl toward $+y$ — thumb points $+z$.`,
      ],
      reviewSection: 'examples',
      explanation: `$\\hat{x}\\times\\hat{y}=\\hat{z}$. For a positive charge ($q > 0$), the force is in $+z$.`,
    },
    {
      id: 'p1-ch1-016-q5',
      type: 'choice',
      question: `The scalar triple product $\\vec{A}\\cdot(\\vec{B}\\times\\vec{C})$ equals zero. What does this mean geometrically?`,
      options: [
        `$\\vec{A}$ is perpendicular to $\\vec{B}$`,
        `$\\vec{B}$ and $\\vec{C}$ are parallel`,
        `The three vectors are coplanar`,
        `$\\vec{A}$ is parallel to $\\vec{B}\\times\\vec{C}$`,
      ],
      answer: `The three vectors are coplanar`,
      hints: [
        `The scalar triple product equals the signed volume of the parallelepiped spanned by the three vectors.`,
        `Zero volume means the parallelepiped is completely flat.`,
      ],
      reviewSection: 'rigor',
      explanation: `Zero scalar triple product = zero parallelepiped volume = the three vectors all lie in a common plane (coplanar). This is used as a coplanarity test in computational geometry.`,
    },
    {
      id: 'p1-ch1-016-q6',
      type: 'choice',
      question: `The area of a triangle with edge vectors $\\vec{a}$ and $\\vec{b}$ is:`,
      options: [
        `$|\\vec{a}\\times\\vec{b}|$`,
        `$\\tfrac{1}{2}|\\vec{a}\\times\\vec{b}|$`,
        `$|\\vec{a}\\cdot\\vec{b}|$`,
        `$2|\\vec{a}\\times\\vec{b}|$`,
      ],
      answer: `$\\tfrac{1}{2}|\\vec{a}\\times\\vec{b}|$`,
      hints: [
        `A triangle is exactly half of a parallelogram with the same two edge vectors.`,
        `Parallelogram area = $|\\vec{a}\\times\\vec{b}|$. Divide by 2 for the triangle.`,
      ],
      reviewSection: 'math',
      explanation: `Triangle area = $\\tfrac{1}{2}|\\vec{a}\\times\\vec{b}|$. This works in 3D for any triangle, regardless of its orientation in space.`,
    },
    {
      id: 'p1-ch1-016-q7',
      type: 'choice',
      question: `A magnetic force $\\vec{F}=q\\vec{v}\\times\\vec{B}$ is always perpendicular to $\\vec{v}$. What physical consequence does this have?`,
      options: [
        `The particle accelerates in the direction it's moving`,
        `The magnetic force does no work and cannot change the particle's speed`,
        `The magnetic force slows the particle down`,
        `The particle moves in a straight line`,
      ],
      answer: `The magnetic force does no work and cannot change the particle's speed`,
      hints: [
        `Work = $\\vec{F}\\cdot d\\vec{s}$. If $\\vec{F}\\perp\\vec{v}$, then $\\vec{F}\\perp d\\vec{s}$ as well.`,
        `A perpendicular force has zero dot product with displacement — zero work.`,
      ],
      reviewSection: 'rigor',
      explanation: `Since $\\vec{F}\\perp\\vec{v}$, power $= \\vec{F}\\cdot\\vec{v} = 0$. The magnetic force does no work — it curves the path without changing speed. This is why particles spiral in magnetic fields at constant speed.`,
    },
    {
      id: 'p1-ch1-016-q8',
      type: 'choice',
      question: `The "moment arm" in torque is:`,
      options: [
        `The full length $|\\vec{r}|$`,
        `$|\\vec{F}|\\sin\\phi$ — the component of force perpendicular to $\\vec{r}$`,
        `$|\\vec{r}||\\vec{F}|$`,
        `$|\\vec{r}|\\cos\\phi$ — the component of $\\vec{r}$ along $\\vec{F}$`,
      ],
      answer: `$|\\vec{F}|\\sin\\phi$ — the component of force perpendicular to $\\vec{r}$`,
      hints: [
        `$|\\vec{\\tau}| = |\\vec{r}||\\vec{F}|\\sin\\phi$. Which factor is the "moment arm"?`,
        `The moment arm is the part of the force that actually causes rotation — the component perpendicular to the lever.`,
      ],
      reviewSection: 'math',
      explanation: `The moment arm is $|\\vec{F}|\\sin\\phi$ (perpendicular force component) or equivalently $|\\vec{r}|\\sin\\phi$ (perpendicular distance from pivot to force line). Both give $|\\vec{\\tau}|=rF\\sin\\phi$.`,
    },
    {
      id: 'p1-ch1-016-q9',
      type: 'choice',
      question: `A proton and an electron have the same speed and travel through the same magnetic field. Compared to the proton, the electron's magnetic force is:`,
      options: [
        `Same magnitude and same direction`,
        `Same magnitude, opposite direction`,
        `Greater magnitude, same direction`,
        `Smaller magnitude, same direction`,
      ],
      answer: `Same magnitude, opposite direction`,
      hints: [
        `$|\\vec{F}| = |q|vB\\sin\\phi$. The proton and electron have the same $|q| = 1.6\\times10^{-19}$ C.`,
        `The sign of $q$ flips the direction of $\\vec{F} = q\\vec{v}\\times\\vec{B}$.`,
      ],
      reviewSection: 'examples',
      explanation: `Both have charge magnitude $|q| = 1.6\\times10^{-19}$ C, so $|\\vec{F}|=|q|vB$ is the same. But $q_{electron} < 0$ and $q_{proton} > 0$, so $\\vec{F}_{electron} = -\\vec{F}_{proton}$ — opposite directions. This is why electrons and protons curve opposite ways in a magnetic field.`,
    },
    {
      id: 'p1-ch1-016-q10',
      type: 'choice',
      question: `If no net torque acts on a system ($\\vec{\\tau}_{net}=\\vec{0}$), what is conserved?`,
      options: [
        `Kinetic energy`,
        `Linear momentum`,
        `Angular momentum $\\vec{L}=\\vec{r}\\times\\vec{p}$`,
        `The position vector $\\vec{r}$`,
      ],
      answer: `Angular momentum $\\vec{L}=\\vec{r}\\times\\vec{p}$`,
      hints: [
        `Newton's 2nd law for rotation: $\\vec{\\tau}_{net} = d\\vec{L}/dt$.`,
        `If $d\\vec{L}/dt = 0$, then $\\vec{L}$ is constant.`,
      ],
      reviewSection: 'rigor',
      explanation: `$\\vec{\\tau}_{net} = d\\vec{L}/dt = \\vec{0}$ implies $\\vec{L} = $ const. Conservation of angular momentum explains gyroscopes, orbital planes, and a figure skater spinning faster by pulling in their arms.`,
    },
  ],

  // ── Misconceptions ───────────────────────────────────────────────────────
  misconceptions: [
    {
      id: 'p1-ch1-016-m1',
      misconception: `Torque depends only on how hard you push — more force always means more torque.`,
      correction: `Torque is $|\\vec{\\tau}|=|\\vec{r}||\\vec{F}|\\sin\\phi$. It depends on force magnitude, distance from pivot, AND the angle between them. Pushing harder at the wrong angle (e.g., parallel to the lever) gives zero torque. Pushing gently at the end of a long lever at 90° can give more torque than pushing hard at the hinge.`,
      correctionExample: `Force 50 N along the handle ($\\phi=0°$): $\\tau = 0.5\\times50\\times\\sin0°=0$ N·m. Force 10 N perpendicular at the handle end ($\\phi=90°$): $\\tau = 0.5\\times10\\times1=5$ N·m. Less force, more torque — because of distance and angle.`,
    },
    {
      id: 'p1-ch1-016-m2',
      misconception: `Magnetic forces can speed up or slow down a charged particle.`,
      correction: `Magnetic forces are always perpendicular to velocity. Since work = $\\vec{F}\\cdot d\\vec{s}$ and the force is perpendicular to the displacement, the work done is always zero. The magnetic force can only change the direction of motion — it curves the path but cannot increase or decrease the particle's speed.`,
      correctionExample: `A proton at $2\\times10^6$ m/s in a 0.3 T field is curved into a circle. After one full orbit it returns to its starting point at exactly $2\\times10^6$ m/s — the field did no work and the kinetic energy is unchanged.`,
    },
  ],

  // ── Transfer Prompts ─────────────────────────────────────────────────────
  transferPrompts: [
    {
      id: 'p1-ch1-016-t1',
      prompt: `A sail on a sailboat has vertices at $(0,0,0)$, $(4,0,0)$ m, and $(2,3,1)$ m. (a) Find the area of the sail. (b) Find the unit normal. (c) If the wind blows in the direction $\\hat{w}=(0,-1,0)$, compute the wind pressure efficiency as $|\\hat{n}\\cdot\\hat{w}|$.`,
      hint: 'Use the cross product formula for triangle area. Efficiency = dot product of normal with wind direction.',
    },
    {
      id: 'p1-ch1-016-t2',
      prompt: `An electron ($q=-1.6\\times10^{-19}$ C) moves at $v=4\\times10^6$ m/s in the $+x$ direction in a field $\\vec{B}=(0,0,0.8)$ T. (a) Find the force. (b) Does the electron curve toward $+y$ or $-y$? (c) Explain why the force doesn't change the electron's speed.`,
      hint: 'Compute q*(v × B). The negative charge flips the direction. Work = F·v must be zero for any perpendicular force.',
    },
  ],

  // ── Debugging ────────────────────────────────────────────────────────────
  debugging: [
    {
      id: 'p1-ch1-016-d1',
      buggyCode:
`# Torque calculation
import numpy as np
r = np.array([0.3, 0.0, 0.0])
F = np.array([0.0, -15.0, 0.0])
tau = np.cross(F, r)   # BUG: wrong order
print("Torque:", tau)`,
      expectedOutput: `Torque: [0.  0.  4.5]`,
      actualOutput: `Torque: [0.  0. -4.5]`,
      explanation: `The student computed $\\vec{F}\\times\\vec{r}$ instead of $\\vec{\\tau}=\\vec{r}\\times\\vec{F}$. By anti-commutativity, this negates the result: $\\vec{F}\\times\\vec{r} = -(\\vec{r}\\times\\vec{F})$. Fix: swap the arguments to \`np.cross(r, F)\`. The torque should be $+4.5$ N·m (CCW), not $-4.5$ N·m (CW).`,
    },
    {
      id: 'p1-ch1-016-d2',
      buggyCode:
`% Triangle area in MATLAB
p1 = [0,0,0]; p2 = [3,0,0]; p3 = [1,2,1];
u = p2 - p1;
v = p3 - p1;
n = cross(u, v);
area = norm(n);  % BUG: forgot to divide by 2
fprintf('Area = %.4f m^2\\n', area)`,
      expectedOutput: `Area = 3.3541 m^2`,
      actualOutput: `Area = 6.7082 m^2`,
      explanation: `\`norm(cross(u,v))\` gives the PARALLELOGRAM area. A triangle is half a parallelogram, so the fix is \`area = norm(n) / 2\` or \`area = 0.5 * norm(n)\`. The student computed twice the correct answer.`,
    },
  ],

  // ── Mastery ───────────────────────────────────────────────────────────────
  mastery: {
    targetLevel: `Given any torque, magnetic force, angular momentum, or area problem, identify the two cross-product vectors, predict direction with the right-hand rule, compute using the determinant, and interpret the physical meaning of the result.`,
    coreSkill: `Recognise which two vectors "cross" in each physical context: $\\vec{r}$ and $\\vec{F}$ for torque; $\\vec{v}$ and $\\vec{B}$ for magnetic force; edge vectors for area. Then compute and verify perpendicularity.`,
    commonSticking: `Forgetting to divide by 2 for triangle area (the formula gives the parallelogram area); and swapping the order of $\\vec{r}\\times\\vec{F}$ vs $\\vec{F}\\times\\vec{r}$ (anti-commutativity flips the rotation direction).`,
    connections: `Torque → rotational dynamics, Newton's 2nd law for rotation; magnetic force → electromagnetism, Lorentz force law, circular motion; area → computer graphics, integration in multivariable calculus; angular momentum → conservation laws, orbital mechanics, quantum mechanics spin.`,
  },

  // ── Semantics ──────────────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: `\\vec{\\tau} = \\vec{r}\\times\\vec{F}`, meaning: 'Torque — rotational effect of force F applied at position r from a pivot' },
      { symbol: `\\vec{L} = \\vec{r}\\times\\vec{p}`, meaning: 'Angular momentum — cross product of position and linear momentum' },
      { symbol: `\\vec{F} = q\\vec{v}\\times\\vec{B}`, meaning: 'Lorentz magnetic force — force on charge q moving at v in field B; always perpendicular to v' },
      { symbol: `|\\vec{a}\\times\\vec{b}|`, meaning: 'Parallelogram area; divide by 2 for triangle area' },
      { symbol: `\\vec{A}\\cdot(\\vec{B}\\times\\vec{C}) = 0`, meaning: 'Coplanarity condition — three vectors lie in a common plane' },
    ],
    rulesOfThumb: [
      `Torque is zero when force is parallel to the lever arm ($\\phi=0°$ or $180°$) — you cannot rotate by pushing through the pivot.`,
      `Magnetic forces do no work: $\\vec{F}_{mag}\\perp\\vec{v}$ always, so $\\vec{F}\\cdot d\\vec{s}=0$. Magnetic forces curve paths without changing speed.`,
      `Triangle area = $\\tfrac{1}{2}$ parallelogram area. Don't forget the factor of 2.`,
      `Order matters in torque: $\\vec{r}\\times\\vec{F}\\ne\\vec{F}\\times\\vec{r}$ — swapping gives the wrong rotation direction.`,
      `The scalar triple product tests coplanarity: zero = flat (no 3D volume), non-zero = true 3D spread.`,
    ],
  },
}
