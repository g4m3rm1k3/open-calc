export default {
  id: 'p1-ch1-009',
  slug: 'adding-force-vectors-numerically',
  chapter: 'p1',
  order: 9,
  title: 'Adding Force Vectors',
  subtitle: 'Net force determines acceleration — and it is always a vector sum, never a scalar sum.',
  tags: ['force vectors', 'net force', 'resultant', 'Newton second law', 'equilibrium', 'free body diagram', 'DSMD'],
  aliases: 'force addition net force resultant statics equilibrium free body diagram',

  hook: {
    question: 'Three ropes pull a ring: 50 N at 0°, 70 N at 130°, 40 N at 250°. Will the ring move — and if so, which way?',
    realWorldContext: `This is the central calculation of structural engineering. Every bridge truss, every crane cable, every airplane in level flight is held in equilibrium by forces that vector-cancel to exactly zero. The moment that cancellation fails, the structure accelerates — or fails. Learning to add force vectors numerically gives you the single most powerful tool in applied physics.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'free-body-diagram' },
  },

  videos: [{
    title: 'Physics 1 – Vectors (11 of 21) Adding Force Vectors Numerically',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      `Before reading on, predict: three people pull a ring with 50 N east, 70 N at 130°, and 40 N at 250°. Does the ring move? If the forces are "almost balanced," a naive guess might be no. Run the numbers and you find a net force of 18.2 N at 119° — the ring definitely moves.`,
      `Here is the fundamental fact you must never forget: **forces are vectors**. Every force in the universe — gravity, friction, tension, normal force — has both a magnitude and a direction. Newton's second law says $\\vec{F}_{net} = m\\vec{a}$. The net force is the **vector sum** of every force. Not the sum of the magnitudes — the vector sum.`,
      `Why can't we just add magnitudes? Two people pulling a rope in opposite directions — 100 N each. Magnitude sum: 200 N. Actual net force: 0 N. Two people pulling at right angles — 3 N and 4 N. Magnitude sum: 7 N. Actual net force: 5 N (3-4-5 triangle). The direction matters completely. Components are the only honest bookkeeping method.`,
      `The procedure is DSMD with a free body diagram (FBD). Draw the isolated object. Label every force with a magnitude and angle. Then DSMD on all forces simultaneously. Equilibrium — $\\vec{F}_{net} = \\vec{0}$ — requires both $\\sum F_x = 0$ AND $\\sum F_y = 0$ simultaneously.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Force addition — 4 steps',
        body: `\\text{1. Draw free body diagram.}\\quad\\text{2. Decompose each force: }F_{ix}=|F_i|\\cos\\theta_i.\\quad\\text{3. Sum: }F_{net,x}=\\sum F_{ix}.\\quad\\text{4. Magnitude + direction via DSMD.}`,
      },
      {
        type: 'definition',
        title: "Newton's second law — vector form",
        body: `\\vec{F}_{\\text{net}} = \\sum_i \\vec{F}_i = m\\vec{a}`,
      },
      {
        type: 'definition',
        title: 'Equilibrium condition',
        body: `\\vec{a} = \\vec{0} \\iff \\sum F_x = 0 \\;\\text{AND}\\; \\sum F_y = 0`,
      },
      {
        type: 'warning',
        title: 'Never add magnitudes unless forces are parallel',
        body: `$|\\vec{F}_1| + |\\vec{F}_2| \\neq |\\vec{F}_1 + \\vec{F}_2|$ in general. Only when all forces point in exactly the same direction can you add magnitudes directly.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'free-body-diagram' },
        title: 'Free body diagram — forces as vectors on an isolated object',
        caption: `The free body diagram shows all forces on the isolated object. DSMD on all forces gives the net force vector and thus the acceleration.`,
      },
      {
        id: 'ForceBlockSim',
        title: 'Multiple forces — net force and acceleration',
        caption: `Each force is decomposed into components. The net force arrow is their vector sum. Try adjusting forces until the system reaches equilibrium ($\\vec{F}_{net} = \\vec{0}$).`,
      },
    ],
  },

  math: {
    prose: [
      `Every force $\\vec{F}_i$ with magnitude $|\\vec{F}_i|$ at standard angle $\\theta_i$ contributes: $F_{ix} = |\\vec{F}_i|\\cos\\theta_i$ and $F_{iy} = |\\vec{F}_i|\\sin\\theta_i$. Sum all x-components for $F_{net,x}$; sum all y-components for $F_{net,y}$. Then apply Newton's second law per axis: $a_x = F_{net,x}/m$ and $a_y = F_{net,y}/m$.`,
      `The component table is the standard organiser. One row per force, two component columns, sum at the bottom. Every sign error becomes visible before it propagates.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Net force by component sum',
        body: `F_{\\text{net},x} = \\sum_i |F_i|\\cos\\theta_i \\qquad F_{\\text{net},y} = \\sum_i |F_i|\\sin\\theta_i`,
      },
      {
        type: 'theorem',
        title: 'Newton 2 per axis (component form)',
        body: `\\sum F_x = ma_x \\qquad \\sum F_y = ma_y`,
      },
      {
        type: 'insight',
        title: 'The component table',
        body: `One row per force: magnitude, angle, $F_x = |F|\\cos\\theta$, $F_y = |F|\\sin\\theta$. Bottom row sums: $F_{net,x} = \\sum F_x$, $F_{net,y} = \\sum F_y$.`,
      },
    ],
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'free-body-diagram' },
      title: 'Free body diagram — component table',
      caption: `Fill the component table row by row. The bottom row $\\sum F_x$ and $\\sum F_y$ is the net force. Equilibrium means both sums equal zero.`,
    }],
  },

  rigor: {
    prose: [
      `Newton's second law $\\vec{F}_{net}=m\\vec{a}$ is a vector equation. In $\\mathbb{R}^2$, it is equivalent to two independent scalar equations: $\\sum F_x = ma_x$ and $\\sum F_y = ma_y$. Solving these two equations independently is both valid and powerful — no coupling between axes.`,
      `The independence of the coordinate axes is a deep fact: a horizontal force has absolutely no effect on vertical acceleration and vice versa. This decoupling comes from the orthogonality of $\\hat{\\imath}$ and $\\hat{\\jmath}$: the dot product $\\hat{\\imath}\\cdot\\hat{\\jmath} = 0$. It carries through to 3D: three orthogonal axes, three independent equations.`,
      `The superposition principle underpins the whole calculation: forces add as vectors because the physical effect of each force is independent. Two forces acting simultaneously produce the same acceleration as their vector sum acting alone. This is a non-trivial empirical fact — it has been verified to extraordinary precision in every domain from electrostatics to gravity. Without superposition, the component method would not work.`,
      `Equilibrium ($\\vec{F}_{net} = \\vec{0}$) is the condition for zero acceleration, not zero velocity. An object moving at constant velocity is in equilibrium just as much as one at rest. This is Newton's first law restated: objects in equilibrium continue doing whatever they were doing. The equilibrium equations $\\sum F_x = 0$ and $\\sum F_y = 0$ are a coupled pair of constraints that determine unknown forces in structural problems — the foundation of statics.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Newton 2 in component form',
        body: `\\sum F_x = ma_x \\qquad \\sum F_y = ma_y \\qquad (\\sum F_z = ma_z \\text{ in 3D})`,
      },
      {
        type: 'insight',
        title: 'Why the axes decouple',
        body: `The basis vectors $\\hat{\\imath}$ and $\\hat{\\jmath}$ are orthogonal: $\\hat{\\imath}\\cdot\\hat{\\jmath} = 0$. A force along $\\hat{\\imath}$ has zero component along $\\hat{\\jmath}$, so horizontal and vertical accelerations are fully independent.`,
      },
    ],
    proofSteps: [
      {
        title: 'Net force is a vector sum',
        expression: `\\vec{F}_{\\text{net}} = \\sum_i \\vec{F}_i`,
        annotation: 'Every force is a vector. Net force = their vector sum (superposition principle).',
      },
      {
        title: 'Expand into components',
        expression: `= \\sum_i (F_{ix}\\hat{\\imath} + F_{iy}\\hat{\\jmath})`,
        annotation: 'Each force written in component form.',
      },
      {
        title: 'Collect by axis',
        expression: `= \\left(\\sum_i F_{ix}\\right)\\hat{\\imath} + \\left(\\sum_i F_{iy}\\right)\\hat{\\jmath}`,
        annotation: 'Group î-terms and ĵ-terms. The axes are independent.',
      },
      {
        title: "Apply Newton's second law",
        expression: `\\vec{F}_{\\text{net}} = m\\vec{a} = m(a_x\\hat{\\imath} + a_y\\hat{\\jmath})`,
        annotation: 'Newton 2 is a vector equation — same law on both axes.',
      },
      {
        title: 'Match components',
        expression: `\\sum F_{ix} = ma_x \\quad \\text{and} \\quad \\sum F_{iy} = ma_y`,
        annotation: 'Matching î and ĵ coefficients gives two independent scalar equations.',
      },
    ],
    title: 'Newton 2 in component form',
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'free-body-diagram' },
      title: 'Newton 2 per axis',
      caption: `$\\sum F_x = ma_x$ and $\\sum F_y = ma_y$ are independent. A horizontal force has no effect on vertical acceleration. Orthogonal axes = decoupled equations.`,
    }],
  },

  examples: [
    {
      id: 'ch1-009-ex1',
      title: 'Three forces on a ring — component table',
      problem: `\\vec{F}_1=50\\,N\\text{ at }0°,\\;\\vec{F}_2=70\\,N\\text{ at }130°,\\;\\vec{F}_3=40\\,N\\text{ at }250°.\\text{ Find }\\vec{F}_{net}.`,
      steps: [
        { expression: 'F_{1x}=50\\cos0°=50.0\\,N,\\quad F_{1y}=0.0\\,N', annotation: '0° → full x, zero y.' },
        { expression: 'F_{2x}=70\\cos130°\\approx-45.0\\,N,\\quad F_{2y}=70\\sin130°\\approx53.6\\,N', annotation: 'Q-II: negative x, positive y.' },
        { expression: 'F_{3x}=40\\cos250°\\approx-13.7\\,N,\\quad F_{3y}=40\\sin250°\\approx-37.6\\,N', annotation: 'Q-III: both negative.' },
        { expression: 'F_{net,x}=50.0-45.0-13.7=-8.7\\,N,\\quad F_{net,y}=0+53.6-37.6=+16.0\\,N', annotation: 'Sum each column.' },
        { expression: '|\\vec{F}_{net}|=\\sqrt{(-8.7)^2+(16.0)^2}\\approx18.2\\,N', annotation: 'Pythagorean theorem.' },
        { expression: '\\theta=180°-\\arctan(16.0/8.7)\\approx118.5°', annotation: '$F_x<0$, $F_y>0$ → Q-II. $\\theta = 180° - 61.5° = 118.5°$.' },
      ],
      conclusion: '$\\vec{F}_{net}\\approx18.2\\,N$ at $118.5°$. The ring accelerates in that direction.',
    },
    {
      id: 'ch1-009-ex2',
      title: 'Finding the equilibrant — third force for equilibrium',
      problem: `\\text{Two forces: } \\vec{F}_1=40\\,N\\text{ at }30°\\text{ and }\\vec{F}_2=60\\,N\\text{ at }150°. \\text{What third force }\\vec{F}_3\\text{ produces equilibrium?}`,
      steps: [
        { expression: 'F_{1x}=34.6\\,N,\\;F_{1y}=20.0\\,N', annotation: 'Decompose F₁.' },
        { expression: 'F_{2x}=-51.9\\,N,\\;F_{2y}=30.0\\,N', annotation: 'Decompose F₂.' },
        { expression: 'F_{3x}=-(34.6-51.9)=17.3\\,N', annotation: 'Equilibrium: $F_{3x} = -(F_{1x}+F_{2x})$.' },
        { expression: 'F_{3y}=-(20.0+30.0)=-50.0\\,N', annotation: 'Equilibrium: $F_{3y} = -(F_{1y}+F_{2y})$.' },
        { expression: '|\\vec{F}_3|=\\sqrt{17.3^2+50^2}\\approx52.9\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta_3=\\arctan(-50/17.3)\\approx-70.9°\\text{ (Q-IV)}', annotation: '$F_{3x}>0$, $F_{3y}<0$.' },
      ],
      conclusion: `$\\vec{F}_3\\approx52.9\\,N$ at $-70.9°$ (289°). This is the equilibrant — the single force that balances all others.`,
    },
    {
      id: 'ch1-009-ex3',
      title: 'Block on a surface — net force and acceleration',
      problem: `\\text{A 5 kg block has four forces: 20 N east, 15 N north, 10 N west, 25 N south. Find the acceleration.}`,
      steps: [
        { expression: 'F_{net,x}=20-10=+10\\,N', annotation: 'East minus West.' },
        { expression: 'F_{net,y}=15-25=-10\\,N', annotation: 'North minus South.' },
        { expression: '|\\vec{F}_{net}|=\\sqrt{10^2+10^2}=10\\sqrt{2}\\approx14.1\\,N', annotation: 'Magnitude.' },
        { expression: 'a=|\\vec{F}_{net}|/m=14.1/5=2.83\\,m/s^2', annotation: `Newton's second law: divide by mass.` },
        { expression: '\\theta=\\arctan(-10/10)=-45°=315°', annotation: 'Q-IV: southeast.' },
      ],
      conclusion: 'The block accelerates at $2.83$ m/s² southeast. The north-south imbalance (−10 N net) makes it drift south despite the larger northward force.',
    },
  ],

  challenges: [
    {
      id: 'ch1-009-ch1',
      difficulty: 'easy',
      problem: `\\vec{F}_1=30\\,N\\text{ east and }\\vec{F}_2=40\\,N\\text{ north. Find }|\\vec{F}_{net}|\\text{ and direction.}`,
      hint: `East = 0°, North = 90°. Perpendicular forces — Pythagorean theorem.`,
      walkthrough: [
        { expression: 'F_{net,x}=30\\,N,\\quad F_{net,y}=40\\,N', annotation: 'Already components — no trig needed.' },
        { expression: '|\\vec{F}_{net}|=\\sqrt{30^2+40^2}=50\\,N', annotation: '3-4-5 triple.' },
        { expression: '\\theta=\\arctan(40/30)\\approx53.1°', annotation: 'Q-I — both positive.' },
      ],
      answer: '50\\,N\\text{ at }53.1°\\text{ NE}',
    },
    {
      id: 'ch1-009-ch2',
      difficulty: 'medium',
      problem: `\\text{A 5 kg block: 20 N east, 15 N north, 10 N west, 25 N south. Acceleration?}`,
      hint: `Combine east-west (x-axis) and north-south (y-axis) first.`,
      walkthrough: [
        { expression: 'F_{net,x}=20-10=10\\,N,\\quad F_{net,y}=15-25=-10\\,N', annotation: 'Component sums.' },
        { expression: '|\\vec{F}_{net}|=10\\sqrt{2}\\approx14.1\\,N', annotation: 'Pythagorean.' },
        { expression: 'a=14.1/5=2.83\\,m/s^2\\text{ at }315°', annotation: `$\\theta=\\arctan(-10/10)=-45°$ → 315° (SE).` },
      ],
      answer: `a\\approx2.83\\,m/s^2\\text{ southeast}`,
    },
    {
      id: 'ch1-009-ch3',
      difficulty: 'hard',
      problem: `\\text{A traffic light (20 kg) hangs from two cables at 30° and 45° to horizontal. Find the tension in each cable.}`,
      hint: `Equilibrium: $\\sum F_x = 0$ and $\\sum F_y = 0$. Cable 1 pulls at 150°, Cable 2 pulls at 45°. Weight = 196 N at 270°.`,
      walkthrough: [
        { expression: 'W=20\\times9.8=196\\,N', annotation: 'Weight downward.' },
        { expression: '\\sum F_x=0:\\; -T_1\\cos30°+T_2\\cos45°=0 \\Rightarrow T_1=T_2\\sqrt{2/3}', annotation: 'Horizontal balance.' },
        { expression: '\\sum F_y=0:\\; T_1\\sin30°+T_2\\sin45°=196', annotation: 'Vertical balance.' },
        { expression: '0.5(0.816\\,T_2)+0.707\\,T_2=196 \\Rightarrow T_2\\approx175.8\\,N', annotation: 'Substitute and solve.' },
        { expression: 'T_1\\approx0.816\\times175.8\\approx143.5\\,N', annotation: 'Back-substitute.' },
      ],
      answer: `T_1\\approx143.5\\,N,\\quad T_2\\approx175.8\\,N`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Force decomposition and net force',
          type: 'code',
          language: 'python',
          code: `import numpy as np

def to_components(mag, angle_deg):
    a = np.radians(angle_deg)
    return np.array([mag * np.cos(a), mag * np.sin(a)])

def net_force(forces_polar):
    """forces_polar: list of (magnitude, degrees). Returns (vector, mag, angle, is_equil)."""
    comps = [to_components(m, a) for m, a in forces_polar]
    F = sum(comps)
    mag = np.linalg.norm(F)
    ang = np.degrees(np.arctan2(F[1], F[0]))
    return F, mag, ang, mag < 0.1

# Three-rope problem from the hook
forces = [(50, 0), (70, 130), (40, 250)]
for i, (m, a) in enumerate(forces, 1):
    v = to_components(m, a)
    print(f"F{i}: {m} N @ {a}° → ({v[0]:+.2f}, {v[1]:+.2f}) N")

F_net, mag, ang, eq = net_force(forces)
print(f"\\nF_net = ({F_net[0]:+.2f}, {F_net[1]:+.2f}) N")
print(f"|F_net| = {mag:.2f} N at {ang:.1f} degrees")
print(f"Equilibrium: {eq}")`,
          prose: [
            `\`to_components\` applies the DSMD Step 1 formula: $F_x = |F|\\cos\\theta$ and $F_y = |F|\\sin\\theta$. \`net_force\` applies Steps 2–4: \`sum(comps)\` adds all component arrays element-wise (Step 2), then magnitude (Step 3) and atan2 (Step 4).`,
            `F₂ at 130° gives $F_x < 0$ (negative: Q-II) and F₃ at 250° gives both negative (Q-III). These signs are critical — the whole point of the component method is that these signs are captured automatically.`,
            `Result: $|\\vec{F}_{net}| \\approx 18.2$ N at $\\approx 119°$. NOT zero — the ring accelerates. Change the three forces to a symmetric set (e.g., 120° apart with equal magnitudes) and verify equilibrium.`,
          ],
        },
        {
          cellTitle: 'Free body diagram with matplotlib',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt

forces = [(50, 0), (70, 130), (40, 250)]
F_net, mag, ang, eq = net_force(forces)

fig, ax = plt.subplots(figsize=(6, 6))
colors = ['royalblue', 'darkorange', 'green']
labels = ['F₁ 50N @0°', 'F₂ 70N @130°', 'F₃ 40N @250°']

scale = 0.05   # scale factor for arrows
for (m, a), color, label in zip(forces, colors, labels):
    v = to_components(m, a)
    ax.quiver(0, 0, v[0]*scale, v[1]*scale, angles='xy', scale_units='xy', scale=1,
              color=color, width=0.012, label=label)

ax.quiver(0, 0, F_net[0]*scale, F_net[1]*scale, angles='xy', scale_units='xy', scale=1,
          color='crimson', width=0.018, label=f'F_net {mag:.1f}N @{ang:.0f}°')

circle = plt.Circle((0, 0), 0.15, color='grey', fill=False, lw=2)
ax.add_patch(circle)
ax.set_xlim(-4, 4); ax.set_ylim(-3, 5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3); ax.legend(fontsize=9)
ax.set_title('Free Body Diagram — Three Ropes on a Ring')
plt.tight_layout(); plt.show()`,
          prose: [
            `\`scale = 0.05\` converts Newtons to plot-coordinate units. Each \`quiver\` call draws one force arrow from the origin. The crimson arrow is the net force — it points where the ring will accelerate.`,
            `The free body diagram here is automated by the same \`to_components\` function used in the calculation. This is not coincidental: the FBD and the calculation are the same operation — one is geometric, one is numeric.`,
            `Try setting all three forces to 60 N at 0°, 120°, 240° (symmetric). The three arrows point outward equally, and the red net force arrow should collapse to nearly zero — equilibrium.`,
          ],
        },
        {
          cellTitle: 'Bridge equilibrium and Newton 2',
          type: 'code',
          language: 'python',
          code: `# Bridge joint: two cables + weight
bridge = [(1200, 60), (1200, 120), (2000, 270)]
F_b, mag_b, ang_b, eq_b = net_force(bridge)
print(f"Bridge joint: |F_net| = {mag_b:.2f} N, equilibrium = {eq_b}")

# Block sliding on surface: push + friction + normal + gravity
# 5 kg block, 20 N push east, 8 N friction west
m_block = 5.0
block_forces = [(20, 0), (8, 180), (49, 90), (49, 270)]
F_block, mag_block, ang_block, eq_block = net_force(block_forces)
a_vec = F_block / m_block
a_mag = np.linalg.norm(a_vec)
print(f"\\nBlock: F_net = {F_block.round(2)}, |F| = {mag_block:.2f} N")
print(f"Acceleration = {a_vec.round(2)} m/s², |a| = {a_mag:.2f} m/s²")`,
          prose: [
            `The bridge joint has symmetric cables at 60° and 120°. Their x-components are $1200\\cos60° = 600$ N (right) and $1200\\cos120° = -600$ N (left) — they cancel. Their y-components both equal $1200\\sin60° \\approx 1039$ N upward. Total upward: 2078 N. Weight: 2000 N. The net is small (not exactly zero because $\\sin60° \\ne 1$).`,
            `For the block: normal ($+y$) and gravity ($-y$) cancel exactly. Net force is purely horizontal: $20 - 8 = 12$ N east. \`a_vec = F_block / m_block\` applies Newton's second law: $a_x = F_{net,x}/m$, $a_y = F_{net,y}/m$ simultaneously.`,
            `Notice: dividing a numpy array by a scalar applies Newton's law to both components at once. This is the power of the vector representation — $\\vec{a} = \\vec{F}_{net}/m$ in one line.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the equilibrant force',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# Two forces act on a knot:
# F1 = 40 N at 30 degrees
# F2 = 60 N at 150 degrees
# Find F3 such that the knot is in equilibrium.
# Compute F3 as a numpy array, then find its magnitude and angle.

F1 = to_components(40, 30)
F2 = to_components(60, 150)

F3 = ___            # the equilibrant
mag3 = ___
ang3 = ___

print(f"F3 = {F3.round(4)}")
print(f"|F3| = {mag3:.4f} N")
print(f"angle = {ang3:.2f} degrees")`,
          prose: [
            `Equilibrium: $\\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 = \\vec{0}$, so $\\vec{F}_3 = -(\\vec{F}_1 + \\vec{F}_2)$. In NumPy: \`F3 = -(F1 + F2)\`. The negative sign applies element-wise to both components.`,
            `Expected: $|\\vec{F}_3| \\approx 52.9$ N at $\\approx -70.9°$ (289°). Verify by adding all three: \`np.linalg.norm(F1 + F2 + F3)\` should return essentially zero.`,
            `This is the equilibrant — the single force that balances all others. In structural engineering, this calculation finds the reaction force at a support: given all applied loads, the support must provide exactly the negative of their sum.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Force decomposition and net force',
          type: 'code',
          language: 'matlab',
          code: `function [F_net, mag, ang, is_eq] = net_force(forces)
% forces: n×2 matrix [magnitude, degrees]
Fx = forces(:,1) .* cosd(forces(:,2));
Fy = forces(:,1) .* sind(forces(:,2));
F_net = [sum(Fx), sum(Fy)];
mag = norm(F_net);
ang = atan2d(F_net(2), F_net(1));
is_eq = (mag < 0.1);
end

forces = [50, 0; 70, 130; 40, 250];
for k = 1:size(forces,1)
    v = [forces(k,1)*cosd(forces(k,2)), forces(k,1)*sind(forces(k,2))];
    fprintf('F%d: %g N @ %g° -> (%+.2f, %+.2f) N\\n', k, forces(k,1), forces(k,2), v(1), v(2))
end

[F_net, mag, ang, eq] = net_force(forces);
fprintf('\\nF_net = (%+.2f, %+.2f) N\\n', F_net(1), F_net(2))
fprintf('|F_net| = %.2f N at %.1f degrees\\n', mag, ang)
fprintf('Equilibrium: %d\\n', eq)`,
          prose: [
            `The \`net_force\` function: \`forces(:,1)\` extracts magnitudes, \`forces(:,2)\` extracts angles. \`.*\` applies \`cosd\` element-wise to all rows at once — DSMD Steps 1–2 in two lines.`,
            `Result: $|\\vec{F}_{net}| \\approx 18.2$ N at $\\approx 119°$. Not zero — the ring accelerates. The negative signs on F₂'s x-component ($-45$) and F₃'s both components are handled automatically by \`cosd(130°)\` and \`cosd(250°)\`.`,
            `Test equilibrium: change to \`forces = [60,0; 60,120; 60,240]\` (symmetric). \`mag\` should return nearly zero — the function correctly detects equilibrium for this symmetric configuration.`,
          ],
        },
        {
          cellTitle: 'Free body diagram with quiver',
          type: 'code',
          language: 'matlab',
          code: `forces = [50, 0; 70, 130; 40, 250];
[F_net, mag, ang] = net_force(forces);

scale = 0.05;
clrs = {'b','r','g'};
labels = {'F1 50N@0°','F2 70N@130°','F3 40N@250°'};

figure; hold on; axis equal; grid on
for k = 1:3
    v = [forces(k,1)*cosd(forces(k,2)), forces(k,1)*sind(forces(k,2))];
    quiver(0,0, v(1)*scale,v(2)*scale, 0, clrs{k}, 'LineWidth',2, 'MaxHeadSize',0.4, ...
           'DisplayName', labels{k})
end
quiver(0,0, F_net(1)*scale,F_net(2)*scale, 0, 'm', 'LineWidth',3, 'MaxHeadSize',0.5, ...
       'DisplayName', sprintf('F_{net} %.1fN@%.0f°', mag, ang))

theta = linspace(0, 2*pi, 100);
plot(0.15*cos(theta), 0.15*sin(theta), 'k-', 'LineWidth',1.5, 'HandleVisibility','off')
xlim([-4 4]); ylim([-3 5])
legend('Location','best'); title('Free Body Diagram — Three Ropes')`,
          prose: [
            `\`quiver(0,0, dx,dy, 0, ...)\` draws each force from the origin. The \`0\` argument disables auto-scaling so each arrow length is proportional to the force magnitude (×scale factor).`,
            `The magenta arrow is \`F_net\` — the net force. It points to where the ring will accelerate. When you switch to a symmetric force set, the magenta arrow should shrink nearly to zero.`,
            `The \`plot\` call draws the ring as a circle. This is a minimal but functional free body diagram — exactly what you'd sketch on paper, now automated in code.`,
          ],
        },
        {
          cellTitle: 'Bridge equilibrium and Newton 2',
          type: 'code',
          language: 'matlab',
          code: `% Bridge joint: two symmetric cables + weight
bridge = [1200, 60; 1200, 120; 2000, 270];
[F_b, mag_b, ang_b, eq_b] = net_force(bridge);
fprintf('Bridge: |F_net| = %.2f N, equilibrium = %d\\n', mag_b, eq_b)

% Block on surface: push + friction + normal + gravity
m_block = 5.0;
block = [20, 0; 8, 180; 49, 90; 49, 270];
[F_block, mag_F, ang_F] = net_force(block);
a_vec = F_block / m_block;
a_mag = norm(a_vec);
fprintf('\\nBlock: F_net = [%.2f, %.2f] N\\n', F_block(1), F_block(2))
fprintf('a = [%.2f, %.2f] m/s²  |a| = %.2f m/s²\\n', a_vec(1), a_vec(2), a_mag)`,
          prose: [
            `Bridge: cables at 60° and 120° cancel in x (symmetry: $1200\\cos60° + 1200\\cos120° = 600-600=0$) and add in y ($2\\times1200\\sin60° \\approx 2078$ N up vs. 2000 N down). The small residual comes from $\\sin60° \\ne 1$.`,
            `Block: \`F_block / m_block\` divides both components by 5 simultaneously — Newton's second law for both axes in one line. Normal and gravity (49 N each, opposite) cancel exactly; net is $20-8=12$ N east.`,
            `\`a_mag = norm(a_vec)\` gives the acceleration magnitude: $12/5 = 2.4$ m/s² east. In MATLAB, dividing a row vector by a scalar applies element-wise — $a_x = F_x/m$ and $a_y = F_y/m$ simultaneously.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the equilibrant force',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Two forces on a knot:
% F1 = 40 N at 30 degrees
% F2 = 60 N at 150 degrees
% Find F3 for equilibrium.

F1 = [40*cosd(30), 40*sind(30)];
F2 = [60*cosd(150), 60*sind(150)];

F3    = ___;    % equilibrant
mag3  = ___;
ang3  = ___;

fprintf('F3 = [%.4f, %.4f]\\n', F3(1), F3(2))
fprintf('|F3| = %.4f N\\n', mag3)
fprintf('angle = %.2f degrees\\n', ang3)`,
          prose: [
            `\`F3 = -(F1 + F2)\`. MATLAB's unary minus negates each element of the row vector. This is $\\vec{F}_3 = -(\\vec{F}_1 + \\vec{F}_2)$, the equilibrant.`,
            `Expected: \`|F3| ≈ 52.9\` N at \`≈ -70.9°\` (289°). Verify with \`norm(F1 + F2 + F3)\` — should return essentially zero.`,
            `In structural analysis, this calculation is called finding the "reaction force." Given all applied loads on a joint, the support (wall, pin, cable) must supply exactly $-\\vec{F}_{net,applied}$ to maintain equilibrium.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-009-q1',
      type: 'choice',
      question: `Three forces act on an object: 10 N east, 6 N north, 4 N south. What is $F_{net,y}$?`,
      options: [`$10$ N`, `$6$ N`, `$2$ N`, `$-2$ N`],
      answer: `$2$ N`,
      hints: [`x and y are independent — ignore the 10 N east for the y-calculation.`, `$6 - 4 = ?$`],
      reviewSection: 'math',
      explanation: `$F_{net,y} = 6 - 4 = 2$ N north. The 10 N east contributes only to $F_{net,x}$.`,
    },
    {
      id: 'p1-ch1-009-q2',
      type: 'choice',
      question: `An object is in equilibrium. What must be true?`,
      options: [
        `It is at rest`,
        `$\\vec{F}_{net} = \\vec{0}$ (both $\\sum F_x = 0$ and $\\sum F_y = 0$)`,
        `All forces are equal in magnitude`,
        `There are at most two forces`,
      ],
      answer: `$\\vec{F}_{net} = \\vec{0}$ (both $\\sum F_x = 0$ and $\\sum F_y = 0$)`,
      hints: [`Can an object be in equilibrium while moving?`, `Both component equations must be satisfied simultaneously.`],
      reviewSection: 'rigor',
      explanation: `Equilibrium means zero net force in every direction — both $\\sum F_x = 0$ and $\\sum F_y = 0$. The object may be moving at constant velocity.`,
    },
    {
      id: 'p1-ch1-009-q3',
      type: 'choice',
      question: `A 50 N force acts at 37° above horizontal. What is $F_y$?`,
      options: [`$40$ N`, `$30$ N`, `$50$ N`, `$10$ N`],
      answer: `$30$ N`,
      hints: [`Use $F_y = |F|\\sin\\theta$.`, `$\\sin 37° \\approx 0.6$ (3-4-5 approximate).`],
      reviewSection: 'math',
      explanation: `$F_y = 50\\sin37° \\approx 50 \\times 0.6 = 30$ N.`,
    },
    {
      id: 'p1-ch1-009-q4',
      type: 'choice',
      question: `$\\vec{F}_{net} = (4, -3)$ N on a 2 kg object. What is $a_x$?`,
      options: [`$2$ m/s²`, `$-1.5$ m/s²`, `$5$ m/s²`, `$-3$ m/s²`],
      answer: `$2$ m/s²`,
      hints: [`Apply Newton's second law per axis: $a_x = F_{net,x}/m$.`, `$a_x = 4/2 = ?$`],
      reviewSection: 'rigor',
      explanation: `$a_x = F_{net,x}/m = 4/2 = 2$ m/s². The $y$-component gives $a_y = -3/2 = -1.5$ m/s² independently.`,
    },
    {
      id: 'p1-ch1-009-q5',
      type: 'choice',
      question: `Why does a horizontal force have no effect on vertical acceleration?`,
      options: [
        `Because horizontal forces are weaker`,
        `Because the axes are orthogonal — $\\hat{i}$ and $\\hat{j}$ are independent`,
        `This is only true for small forces`,
        `It affects vertical acceleration through friction`,
      ],
      answer: `Because the axes are orthogonal — $\\hat{i}$ and $\\hat{j}$ are independent`,
      hints: [`What is $\\hat{\\imath}\\cdot\\hat{\\jmath}$?`, `A force along $\\hat{\\imath}$ has zero component along $\\hat{\\jmath}$.`],
      reviewSection: 'rigor',
      explanation: `Orthogonal axes are completely independent. A force along $\\hat{\\imath}$ has zero component along $\\hat{\\jmath}$, so it contributes zero to $a_y$.`,
    },
    {
      id: 'p1-ch1-009-q6',
      type: 'choice',
      question: `Two cables pull a mass: cable 1 at 60°, cable 2 at 120°, each with tension $T$. What is the direction of the net cable force?`,
      options: [`$0°$ (east)`, `$90°$ (north)`, `$45°$ (NE)`, `$60°$`],
      answer: `$90°$ (north)`,
      hints: [`By symmetry about 90°, the x-components cancel.`, `$T\\cos60° + T\\cos120° = ?$`],
      reviewSection: 'examples',
      explanation: `$T\\cos60° + T\\cos120° = T/2 - T/2 = 0$. $T\\sin60° + T\\sin120° = T\\sqrt{3}$. Net force is straight up (90°).`,
    },
    {
      id: 'p1-ch1-009-q7',
      type: 'choice',
      question: `Newton's second law $\\vec{F}_{net} = m\\vec{a}$ in 2D gives how many scalar equations?`,
      options: [`One`, `Two`, `Three`, `Four`],
      answer: `Two`,
      hints: [`Each vector component gives one equation.`, `How many independent directions are there in 2D?`],
      reviewSection: 'rigor',
      explanation: `One vector equation = two scalar equations: $\\sum F_x = ma_x$ and $\\sum F_y = ma_y$. In 3D it gives three.`,
    },
    {
      id: 'p1-ch1-009-q8',
      type: 'choice',
      question: `A free body diagram is useful because it:`,
      options: [
        `Shows the object's trajectory`,
        `Isolates one object and shows ALL forces acting on it as vectors`,
        `Shows forces the object exerts on others`,
        `Requires only one force to be drawn`,
      ],
      answer: `Isolates one object and shows ALL forces acting on it as vectors`,
      hints: [`"Free body" means the object is isolated from its surroundings.`, `What makes it different from a picture of the whole system?`],
      reviewSection: 'intuition',
      explanation: `A free body diagram isolates one object and shows every external force acting on it. This makes DSMD systematic and prevents missing forces.`,
    },
    {
      id: 'p1-ch1-009-q9',
      type: 'choice',
      question: `Forces 30 N east and 40 N north act on a 5 kg block. What is the acceleration magnitude?`,
      options: [`$14$ m/s²`, `$10$ m/s²`, `$2$ m/s²`, `$7$ m/s²`],
      answer: `$10$ m/s²`,
      hints: [`Find $|\\vec{F}_{net}|$ first (3-4-5 triple), then divide by mass.`, `$|\\vec{F}_{net}| = \\sqrt{30^2+40^2} = ?$`],
      reviewSection: 'examples',
      explanation: `$|\\vec{F}_{net}| = \\sqrt{900+1600} = 50$ N. $a = 50/5 = 10$ m/s².`,
    },
    {
      id: 'p1-ch1-009-q10',
      type: 'choice',
      question: `Two forces $\\vec{F}_1 = (10, 0)$ N and $\\vec{F}_2 = (-4, 3)$ N act on an object. What is the equilibrant (the third force needed for equilibrium)?`,
      options: [`$(6, 3)$ N`, `$(-6, -3)$ N`, `$(14, -3)$ N`, `$(-6, 3)$ N`],
      answer: `$(-6, -3)$ N`,
      hints: [`The equilibrant is $-(\\vec{F}_1 + \\vec{F}_2)$.`, `$\\vec{F}_1 + \\vec{F}_2 = (10-4, 0+3) = (6, 3)$. Negate it.`],
      reviewSection: 'examples',
      explanation: `$\\vec{F}_1 + \\vec{F}_2 = (6, 3)$. The equilibrant is $-(6, 3) = (-6, -3)$ N.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-009-m1',
      title: 'Adding force magnitudes to get net force',
      description: `Students write $F_{net} = F_1 + F_2 + F_3$ (scalar sum of magnitudes) instead of computing the vector sum. This ignores direction entirely.`,
      correctionExample: `Forces 50 N at 0°, 70 N at 130°, 40 N at 250°: scalar sum = 160 N. Actual net force ≈ 18.2 N. The scalar sum is 8.8× larger than the actual net force! The component method is mandatory whenever forces are not all parallel.`,
    },
    {
      id: 'p1-ch1-009-m2',
      title: 'Confusing equilibrium with being at rest',
      description: `Students think "equilibrium" means the object is stationary. Actually, equilibrium means zero acceleration — the object can be moving at any constant velocity.`,
      correctionExample: `An airplane in level flight at 900 km/h is in equilibrium: $\\vec{F}_{net} = \\vec{0}$, so $\\vec{a} = \\vec{0}$. The lift equals the weight; the thrust equals the drag. The plane is moving fast, but not accelerating. Rest is just one special case of equilibrium.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-009-t1',
      prompt: `A 10 kg traffic light hangs from three cables arranged symmetrically: one straight up, two at 60° to the left and right. Find the tension in each cable. (Hint: what must the upward components sum to?)`,
    },
    {
      id: 'p1-ch1-009-t2',
      prompt: `A 2 kg drone has four motor thrusters: each produces 6 N. Two point up, two are angled 20° from vertical outward. Find the net upward force. Is the drone accelerating upward, downward, or in equilibrium?`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-009-d1',
      title: 'Applying Newton 2 to magnitude instead of components',
      buggyCode: `F_net_mag = np.linalg.norm(F_net)
a = F_net_mag / m           # wrong: scalar
# student then uses this single value as the acceleration`,
      explanation: `Dividing the net force magnitude by mass gives only the acceleration magnitude — it loses the direction. Newton's second law is a vector equation: $\\vec{a} = \\vec{F}_{net}/m$. The direction of acceleration matches the direction of net force.`,
      fix: `a_vec = F_net / m                   # vector acceleration
a_mag = np.linalg.norm(a_vec)    # magnitude
a_ang = np.degrees(np.arctan2(a_vec[1], a_vec[0]))  # direction`,
    },
    {
      id: 'p1-ch1-009-d2',
      title: 'Forgetting to include all forces in the free body diagram',
      buggyCode: `# Student only includes the applied push, forgetting normal force, weight, friction
push = to_components(20, 0)
F_net = push    # wrong: only one of four forces`,
      explanation: `On a horizontal surface, a pushed block also experiences gravity (down), normal force (up), and friction (opposing motion). Forgetting gravity and normal means the y-component of net force is wrong — the object would appear to accelerate downward through the floor.`,
      fix: `push     = to_components(20, 0)
friction = to_components(8, 180)
normal   = to_components(49, 90)     # mg = 5*9.8 = 49 N
gravity  = to_components(49, 270)
F_net = push + friction + normal + gravity  # all four`,
    },
  ],

  mastery: {
    targetLevel: `Draw a free body diagram with all forces labeled. Apply DSMD to compute the net force vector. Use Newton's second law per axis to find acceleration. Solve equilibrium problems by setting component sums to zero and solving for unknown forces.`,
    prerequisites: [`DSMD numerical method (Lesson 6)`, `Vector subtraction (Lesson 8)`, `Component table organisation`],
    enables: [`Newton's laws applications (Chapter 2)`, `Static equilibrium / statics`, `Projectile motion (horizontal and vertical axes decoupled)`],
    commonStuckPoints: [
      `Adding force magnitudes instead of using components`,
      `Forgetting one or more forces in the free body diagram (especially normal force or friction)`,
      `Confusing equilibrium with being at rest`,
      `Applying Newton 2 to net force magnitude instead of the component form`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\vec{F}_{net} = \\sum_i \\vec{F}_i = m\\vec{a}`, meaning: `Newton's second law — net force equals vector sum of all forces, equals mass × acceleration` },
      { symbol: `F_{net,x} = \\sum_i |F_i|\\cos\\theta_i`, meaning: `x-component of net force — sum of all x-components` },
      { symbol: `\\sum F_x = 0\\;\\text{and}\\;\\sum F_y = 0`, meaning: `Equilibrium condition — zero acceleration in every direction` },
      { symbol: `a_x = F_{net,x}/m`, meaning: `Newton 2 per axis — x-acceleration from x-force, independently of y` },
      { symbol: `\\vec{F}_{equilibrant} = -\\vec{F}_{net}`, meaning: `The single force that balances all others` },
    ],
    rulesOfThumb: [
      `Always draw a free body diagram first — never skip it.`,
      `Forces in opposite directions reduce each other along that axis only.`,
      `Equilibrium: $\\sum F_x = 0$ AND $\\sum F_y = 0$ — both simultaneously.`,
      `$a_x = F_{net,x}/m$ independently of $a_y$ — axes never mix.`,
      `An object moving at constant velocity is in equilibrium just like one at rest.`,
    ],
  },
}
