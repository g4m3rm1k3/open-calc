export default {
  id: 'p1-ch1-007',
  slug: 'subtracting-vectors-graphically',
  chapter: 'p1',
  order: 7,
  title: 'Subtracting Vectors Graphically',
  subtitle: 'A − B is just A + (−B). Flip the arrow, then add.',
  tags: ['vector subtraction', 'negative vector', 'graphical method', 'difference vector'],
  aliases: 'subtract vectors flip negate difference graphical',

  hook: {
    question: `A ball moves from velocity 4 m/s east to 3 m/s north. What is the change in velocity — and why is it not simply 1 m/s?`,
    realWorldContext: `Acceleration is defined as change in velocity: $\\vec{a} = \\Delta\\vec{v}/\\Delta t = (\\vec{v}_f - \\vec{v}_i)/\\Delta t$. Every acceleration, every force diagram, every relative velocity problem uses vector subtraction. Getting the direction of $\\vec{A} - \\vec{B}$ wrong is one of the most common physics errors.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'vector-addition-chain' },
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (9 of 21) Subtracting Vectors Graphically',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      `A car drives 30 m/s east, then turns and drives 40 m/s north. Before reading on, predict: is the change in velocity 10 m/s (the difference of the speeds), 70 m/s (the sum), or something else entirely? The answer is 50 m/s pointing northwest — because $\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i$ is a vector operation, not a scalar one.`,
      `Subtraction is not a new operation — it is addition in disguise. $\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})$. The negative of a vector $-\\vec{B}$ has the **same magnitude** as $\\vec{B}$ but points in the **opposite direction**. Graphically: flip the arrow 180°.`,
      `The two-step recipe: (1) draw $-\\vec{B}$ by reversing $\\vec{B}$; (2) add $\\vec{A}$ and $-\\vec{B}$ using any addition method.`,
      `There is a useful shortcut: if $\\vec{A}$ and $\\vec{B}$ share a common tail, then $\\vec{A} - \\vec{B}$ is the arrow **from the tip of $\\vec{B}$ to the tip of $\\vec{A}$**. This is the tail-to-tail shortcut and it is especially useful for finding $\\Delta\\vec{v}$ in kinematics.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Graphical subtraction — 2 steps',
        body: `1. Flip \\vec{B} to get -\\vec{B} (same magnitude, reversed direction).\\quad 2. Add \\vec{A} and -\\vec{B} tip-to-toe. The resultant is \\vec{A} - \\vec{B}.`,
      },
      {
        type: 'definition',
        title: 'Negative vector',
        body: `-\\vec{B} = (-B_x,\\,-B_y)`,
      },
      {
        type: 'definition',
        title: 'Vector subtraction',
        body: `\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B}) = (A_x - B_x,\\;A_y - B_y)`,
      },
      {
        type: 'insight',
        title: 'Tail-to-tail shortcut',
        body: `Place $\\vec{A}$ and $\\vec{B}$ with tails at the same point. Then $\\vec{A} - \\vec{B}$ is the arrow from the tip of $\\vec{B}$ to the tip of $\\vec{A}$.`,
      },
      {
        type: 'warning',
        title: 'Subtraction is not commutative',
        body: `$\\vec{A} - \\vec{B}$ and $\\vec{B} - \\vec{A}$ point in opposite directions. Getting the order wrong reverses the acceleration.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Subtraction is addition in disguise',
        caption: 'A⃗ − B⃗ = A⃗ + (−B⃗). Step 1: flip B⃗ to get −B⃗ (same length, opposite direction). Step 2: chain A⃗ and −B⃗ tip-to-tail. The closing arrow is A⃗ − B⃗.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Flip-and-add vs tail-to-tail shortcut',
        caption: `Flip $\\vec{B}$ to get $-\\vec{B}$, then chain with $\\vec{A}$. Or: place tails together and draw from tip of $\\vec{B}$ to tip of $\\vec{A}$. Both give $\\vec{A} - \\vec{B}$.`,
      },
    ],
  },

  math: {
    prose: [
      'The change in velocity $\\Delta\\vec{v}$ is the most important application of vector subtraction. If an object moves from velocity $\\vec{v}_i$ to $\\vec{v}_f$: $\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i$.',
      'The magnitude $|\\Delta\\vec{v}|$ is **not** $|\\vec{v}_f| - |\\vec{v}_i|$ (scalar difference). It is the magnitude of the vector difference, computed with the Pythagorean theorem or law of cosines. This distinction is the source of countless errors in kinematics problems.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Change in velocity',
        body: `\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i`,
      },
      {
        type: 'warning',
        title: '|Δv| ≠ |v_f| − |v_i|',
        body: `The magnitude of the velocity change is the magnitude of the vector difference, not the scalar difference. Example: $\\vec{v}_i = 30$ m/s east and $\\vec{v}_f = 40$ m/s north gives $|\\Delta\\vec{v}| = 50$ m/s, not $10$ m/s.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: `Δv⃗ = v⃗_f − v⃗_i`,
        caption: `$\\Delta\\vec{v}$ points from the tip of $\\vec{v}_i$ to the tip of $\\vec{v}_f$ when tails are shared. Its magnitude is $|\\vec{v}_f - \\vec{v}_i|$, not $|\\vec{v}_f| - |\\vec{v}_i|$.`,
      },
    ],
  },

  rigor: {
    prose: [
      'Formally, $-\\vec{B}$ is the additive inverse of $\\vec{B}$ in the vector space $\\mathbb{R}^n$: it is the unique vector such that $\\vec{B} + (-\\vec{B}) = \\vec{0}$. The existence of additive inverses is one of the eight axioms defining a vector space. Without it, subtraction would not be defined.',
      'From an invariant viewpoint, the difference $\\vec{A} - \\vec{B}$ represents a relative displacement: how far and in what direction is the tip of $\\vec{A}$ from the tip of $\\vec{B}$ when both originate from the same point? This interpretation is coordinate-independent — it does not change when the axes are rotated.',
      'The tail-to-tail shortcut is a direct consequence of the component formula: $(A_x - B_x, A_y - B_y)$ is exactly the vector from point $(B_x, B_y)$ to point $(A_x, A_y)$. In other words, the difference of position vectors equals the displacement between their endpoints — a fact that underpins the entire kinematics framework.',
      'Vector subtraction is the gateway to the dot product (Lesson 10). The law of cosines for vectors is $|\\vec{A} - \\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}$, and the polarisation identity $\\vec{A}\\cdot\\vec{B} = \\tfrac{1}{4}(|\\vec{A}+\\vec{B}|^2 - |\\vec{A}-\\vec{B}|^2)$ recovers the dot product from the two diagonals of the parallelogram — sum and difference.',
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Additive inverse',
        body: `-\\vec{B} = (-B_x, -B_y), \\quad \\vec{B} + (-\\vec{B}) = \\vec{0}`,
      },
      {
        type: 'insight',
        title: 'Why flipping works',
        body: `Adding $\\vec{B}$ and $-\\vec{B}$: $B_x + (-B_x) = 0$ and $B_y + (-B_y) = 0$. The two equal-length, opposite arrows cancel to give the zero vector.`,
      },
    ],
    proofSteps: [
      {
        title: 'Define subtraction',
        expression: `\\vec{A} - \\vec{B} = \\vec{A} + (-\\vec{B})`,
        annotation: 'Subtraction is addition of the additive inverse. Everything we know about addition applies.',
      },
      {
        title: 'Negate B component-wise',
        expression: `-\\vec{B} = (-B_x, -B_y)`,
        annotation: 'Flipping all signs gives the same length, opposite direction.',
      },
      {
        title: 'Apply component addition',
        expression: `\\vec{A} + (-\\vec{B}) = (A_x+(-B_x),\\; A_y+(-B_y))`,
        annotation: 'Component-wise — the definition of addition, applied to A and −B.',
      },
      {
        title: 'Simplify',
        expression: `= (A_x-B_x,\\; A_y-B_y)`,
        annotation: 'Vector subtraction reduces to scalar subtraction on each axis.',
      },
      {
        title: 'Tail-to-tail geometric shortcut',
        expression: `\\text{Place tails at } \\mathbf{0} \\implies \\vec{A}-\\vec{B} \\text{ goes from tip}(\\vec{B}) \\text{ to tip}(\\vec{A})`,
        annotation: 'The arrow from (B_x,B_y) to (A_x,A_y) has exactly the components (A_x−B_x, A_y−B_y). Geometry and algebra agree.',
      },
    ],
    title: 'Proof: subtraction by component and the tail-to-tail shortcut',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Subtraction proof — flip then add',
        caption: `Step 1: $\\vec{A}-\\vec{B}=\\vec{A}+(-\\vec{B})$. Step 2: $-\\vec{B}=(-B_x,-B_y)$. Step 3: chain $\\vec{A}$ and $-\\vec{B}$. Step 4: closing arrow has components $(A_x-B_x, A_y-B_y)$.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-007-ex1',
      title: 'Graphical: flip-and-add for A⃗ − B⃗',
      problem: `\\vec{A} = 5\\,\\text{cm east},\\;\\vec{B} = 3\\,\\text{cm north. Find }\\vec{A}-\\vec{B}\\text{ graphically.}`,
      steps: [
        { expression: '-\\vec{B} = 3\\,\\text{cm south}', annotation: 'Step 1: flip B — same length (3 cm), reversed to south.' },
        { expression: '\\text{Chain: } \\vec{A}\\text{ (east)} \\to -\\vec{B}\\text{ (south)}', annotation: 'Step 2: tip-to-toe of A and −B.' },
        { expression: '|\\vec{A}-\\vec{B}| = \\sqrt{5^2+3^2} = \\sqrt{34} \\approx 5.83\\,\\text{cm}', annotation: 'Magnitude by Pythagorean theorem (perpendicular components).' },
        { expression: '\\theta = \\arctan(-3/5) \\approx -30.96°\\text{ (31° south of east)}', annotation: 'x-component = +5 (east), y-component = −3 (south) → Quadrant IV.' },
      ],
      conclusion: '$\\vec{A}-\\vec{B} \\approx 5.83$ cm at $31°$ south of east.',
    },
    {
      id: 'ch1-007-ex2',
      title: 'Change in velocity — Δv⃗',
      problem: `\\text{A car changes velocity from }\\vec{v}_i=30\\,\\text{m/s east to }\\vec{v}_f=40\\,\\text{m/s north. Find }\\Delta\\vec{v}\\text{ and }|\\Delta\\vec{v}|.`,
      steps: [
        { expression: '-\\vec{v}_i = 30\\,\\text{m/s west}', annotation: 'Negate the initial velocity.' },
        { expression: '\\Delta\\vec{v} = \\vec{v}_f + (-\\vec{v}_i)', annotation: 'Apply definition: $\\vec{v}_f - \\vec{v}_i = \\vec{v}_f + (-\\vec{v}_i)$.' },
        { expression: '\\Delta v_x = 0 + (-30) = -30\\,\\text{m/s},\\;\\Delta v_y = 40 + 0 = 40\\,\\text{m/s}', annotation: 'Components: x gets the westward contribution, y gets northward.' },
        { expression: '|\\Delta\\vec{v}| = \\sqrt{(-30)^2+40^2} = \\sqrt{2500} = 50\\,\\text{m/s}', annotation: '3-4-5 triple × 10. This is NOT |v_f|−|v_i| = 10 m/s.' },
        { expression: '\\theta = \\arctan(40/(-30)) + 180° \\approx 126.9°', annotation: '$R_x < 0, R_y > 0$ → Quadrant II. The change points northwest.' },
      ],
      conclusion: '$|\\Delta\\vec{v}| = 50$ m/s at $127°$ (northwest). The speed changed by only 10 m/s, but the velocity vector changed by 50 m/s.',
    },
    {
      id: 'ch1-007-ex3',
      title: 'Relative velocity: airplane in crosswind',
      problem: `\\text{A plane flies at }\\vec{v}_p = 200\\,\\text{m/s north (relative to air). Wind velocity is }\\vec{v}_w = 50\\,\\text{m/s east. Find the plane's ground velocity.}`,
      steps: [
        { expression: '\\vec{v}_{\\text{ground}} = \\vec{v}_p + \\vec{v}_w', annotation: 'Ground velocity = plane velocity relative to air + wind velocity (vector addition).' },
        { expression: 'v_x = 0 + 50 = 50\\,\\text{m/s},\\;v_y = 200 + 0 = 200\\,\\text{m/s}', annotation: 'Component sum.' },
        { expression: '|\\vec{v}_{\\text{ground}}| = \\sqrt{50^2+200^2} = \\sqrt{42500} \\approx 206.2\\,\\text{m/s}', annotation: 'Ground speed.' },
        { expression: '\\text{Drift} = \\vec{v}_{\\text{ground}} - \\vec{v}_p = (50, 0)\\,\\text{m/s}', annotation: 'The difference shows the wind\'s effect: 50 m/s east drift. Vector subtraction isolates the wind contribution.' },
      ],
      conclusion: 'Ground speed is $206.2$ m/s. The drift is the vector difference between actual and intended velocity — exactly $\\vec{v}_w = 50$ m/s east.',
    },
  ],

  challenges: [
    {
      id: 'ch1-007-ch1',
      difficulty: 'easy',
      problem: `\\vec{A}=(5,2),\\;\\vec{B}=(2,5).\\text{ Find }\\vec{A}-\\vec{B}\\text{ and }\\vec{B}-\\vec{A}.\\text{ What is the relationship?}`,
      hint: 'Subtract component-wise. Compare the two results.',
      walkthrough: [
        { expression: '\\vec{A}-\\vec{B}=(5-2,\\;2-5)=(3,-3)', annotation: 'Component subtraction.' },
        { expression: '\\vec{B}-\\vec{A}=(2-5,\\;5-2)=(-3,3)', annotation: 'Swap order.' },
        { expression: '\\vec{B}-\\vec{A} = -(\\vec{A}-\\vec{B})', annotation: 'The two results are negatives of each other — same magnitude (3√2), opposite direction.' },
      ],
      answer: `\\vec{A}-\\vec{B}=(3,-3),\\;\\vec{B}-\\vec{A}=(-3,3)\\text{ — antiparallel.}`,
    },
    {
      id: 'ch1-007-ch2',
      difficulty: 'medium',
      problem: `\\text{A projectile has }\\vec{v}_i=20\\,\\text{m/s at }60°\\text{ and }\\vec{v}_f=20\\,\\text{m/s at }120°.\\text{ Find }|\\Delta\\vec{v}|.`,
      hint: 'Both speeds are equal. Decompose each, subtract, find magnitude.',
      walkthrough: [
        { expression: 'v_{ix}=20\\cos60°=10,\\;v_{iy}=20\\sin60°=10\\sqrt{3}', annotation: 'Decompose v_i.' },
        { expression: 'v_{fx}=20\\cos120°=-10,\\;v_{fy}=20\\sin120°=10\\sqrt{3}', annotation: 'Decompose v_f.' },
        { expression: '\\Delta v_x=-10-10=-20,\\;\\Delta v_y=10\\sqrt{3}-10\\sqrt{3}=0', annotation: 'y-components cancel by symmetry.' },
        { expression: '|\\Delta\\vec{v}|=20\\,\\text{m/s west}', annotation: 'Pure horizontal change — the speed did not change, but the direction did.' },
      ],
      answer: `|\\Delta\\vec{v}|=20\\,\\text{m/s directed west.}`,
    },
    {
      id: 'ch1-007-ch3',
      difficulty: 'hard',
      problem: `\\text{Prove that } |\\vec{A} - \\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}, \\text{ where } \\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y.`,
      hint: 'Expand $|\\vec{A}-\\vec{B}|^2$ using components, then recognise the dot product.',
      walkthrough: [
        { expression: '|\\vec{A}-\\vec{B}|^2 = (A_x-B_x)^2+(A_y-B_y)^2', annotation: 'Definition of squared magnitude.' },
        { expression: '= A_x^2 - 2A_xB_x + B_x^2 + A_y^2 - 2A_yB_y + B_y^2', annotation: 'Expand each square.' },
        { expression: '= (A_x^2+A_y^2)+(B_x^2+B_y^2) - 2(A_xB_x+A_yB_y)', annotation: 'Regroup.' },
        { expression: '= |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}\\;\\checkmark', annotation: 'This is the vector law of cosines — the dot product captures the angle between vectors.' },
      ],
      answer: `|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Vector subtraction: flip-and-add',
          type: 'code',
          language: 'python',
          code: `import numpy as np

A = np.array([5.0, 2.0])
B = np.array([2.0, 5.0])

# Method 1: A - B directly
diff1 = A - B

# Method 2: A + (-B) — flip and add
diff2 = A + (-B)

print(f"A = {A}")
print(f"B = {B}")
print(f"A - B      = {diff1}")
print(f"A + (-B)   = {diff2}")
print(f"Same: {np.allclose(diff1, diff2)}")

# Non-commutativity
print(f"\\nB - A      = {B - A}")
print(f"-(A - B)   = {-(A - B)}")
print(f"B-A = -(A-B): {np.allclose(B - A, -(A - B))}")`,
          prose: [
            `\`A - B\` and \`A + (-B)\` produce identical results because NumPy's \`-\` operator IS addition of the negated array. Python's unary \`-B\` flips all components: $(-B_x, -B_y)$.`,
            `\`B - A\` is the negative of \`A - B\` — same magnitude, opposite direction. Non-commutativity of subtraction: $\\vec{A} - \\vec{B} \\ne \\vec{B} - \\vec{A}$. Check: $(3,-3)$ vs $(-3,3)$ — exact negatives.`,
            `\`np.allclose(B - A, -(A - B))\` returns True, confirming $\\vec{B} - \\vec{A} = -(\\vec{A} - \\vec{B})$. This is the algebraic proof of non-commutativity, verified numerically.`,
          ],
        },
        {
          cellTitle: 'Visualise subtraction: tail-to-tail shortcut',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt

A = np.array([5.0, 2.0])
B = np.array([2.0, 5.0])
diff = A - B

fig, axes = plt.subplots(1, 2, figsize=(10, 4))

# Left: flip-and-add
ax = axes[0]
ax.quiver(0, 0, *A, angles='xy', scale_units='xy', scale=1,
          color='royalblue', width=0.015, label=r'$\\vec{A}$')
ax.quiver(*A, *(-B), angles='xy', scale_units='xy', scale=1,
          color='darkorange', width=0.015, label=r'$-\\vec{B}$')
ax.quiver(0, 0, *diff, angles='xy', scale_units='xy', scale=1,
          color='crimson', width=0.018, label=r'$\\vec{A}-\\vec{B}$')
ax.set_title('Flip-and-add method')

# Right: tail-to-tail shortcut
ax = axes[1]
ax.quiver(0, 0, *A, angles='xy', scale_units='xy', scale=1,
          color='royalblue', width=0.015, label=r'$\\vec{A}$')
ax.quiver(0, 0, *B, angles='xy', scale_units='xy', scale=1,
          color='darkorange', width=0.015, label=r'$\\vec{B}$')
ax.quiver(*B, *(A-B), angles='xy', scale_units='xy', scale=1,
          color='crimson', width=0.018, label=r'tip(B)→tip(A)')
ax.set_title('Tail-to-tail shortcut')

for ax in axes:
    ax.set_xlim(-2, 8); ax.set_ylim(-4, 7)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3); ax.legend(fontsize=10)
plt.suptitle('Both methods give the same red arrow')
plt.tight_layout(); plt.show()`,
          prose: [
            `Left panel: flip-and-add. \`-B\` is drawn from the tip of \`A\`; the resultant (red) goes from origin to the final tip. Right panel: tail-to-tail shortcut. Both \`A\` and \`B\` originate from the origin; the red arrow goes from \`tip(B)\` to \`tip(A)\`.`,
            `Both methods produce the same red arrow — this is the visual proof that $\\vec{A} - \\vec{B} = $ "arrow from tip of $\\vec{B}$ to tip of $\\vec{A}$" when tails are shared. The shortcut saves a drawing step.`,
            `Change \`B = np.array([2, 5])\` to \`B = np.array([-1, 3])\` and observe how both panels update. The tail-to-tail shortcut always points "tip of B → tip of A", making $\\Delta\\vec{v}$ diagrams immediate.`,
          ],
        },
        {
          cellTitle: 'Change in velocity: |Δv| ≠ scalar difference',
          type: 'code',
          language: 'python',
          code: `v_i = np.array([30.0, 0.0])    # 30 m/s east
v_f = np.array([0.0, 40.0])    # 40 m/s north

delta_v = v_f - v_i
delta_v_mag = np.linalg.norm(delta_v)
delta_v_ang = np.degrees(np.arctan2(delta_v[1], delta_v[0]))

speed_i = np.linalg.norm(v_i)
speed_f = np.linalg.norm(v_f)

print(f"v_i = {v_i} m/s  (speed = {speed_i:.1f})")
print(f"v_f = {v_f} m/s  (speed = {speed_f:.1f})")
print(f"Δv  = {delta_v} m/s")
print(f"|Δv| = {delta_v_mag:.4f} m/s   <-- vector subtraction")
print(f"|v_f| - |v_i| = {speed_f - speed_i:.1f} m/s  <-- WRONG scalar difference")
print(f"Angle: {delta_v_ang:.2f} degrees")`,
          prose: [
            `\`delta_v = v_f - v_i\` computes $\\Delta\\vec{v}$ as a vector: $(-30, 40)$ m/s. \`np.linalg.norm(delta_v)\` = 50 m/s. This is the magnitude of the velocity CHANGE — not the change in speed.`,
            `\`speed_f - speed_i = 40 - 30 = 10\` m/s is the change in SPEED (magnitude). These are very different. The velocity changed by 50 m/s at 127° (northwest). The confusion between $|\\Delta\\vec{v}|$ and $\\Delta|\\vec{v}|$ causes errors in every acceleration and force problem.`,
            `Note: \`delta_v_ang ≈ 126.87°\` — northwest, not northwest-ish. The atan2 function gives the exact quadrant. With plain arctan you would get the wrong quadrant since $R_x < 0$.`,
          ],
        },
        {
          cellTitle: 'Challenge: projectile velocity change',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A projectile has:
# v_i = 20 m/s at 60 degrees
# v_f = 20 m/s at 120 degrees
# Compute delta_v and its magnitude and direction.

v_i = np.array([20*np.cos(np.radians(___)), 20*np.sin(np.radians(___))])
v_f = np.array([20*np.cos(np.radians(___)), 20*np.sin(np.radians(___))])
delta_v = ___ - ___
mag = np.linalg.norm(___)
ang = np.degrees(np.arctan2(___, ___))

print(f"|Δv| = {mag:.4f} m/s")
print(f"angle = {ang:.2f} degrees")`,
          prose: [
            `\`v_i = np.array([20*cos(60°), 20*sin(60°)]) = [10, 17.32]\`. \`v_f = np.array([20*cos(120°), 20*sin(120°)]) = [-10, 17.32]\`. The y-components are equal — they'll cancel in the subtraction.`,
            `\`delta_v = v_f - v_i = [-10-10, 17.32-17.32] = [-20, 0]\`. Expected: $|\\Delta\\vec{v}| = 20$ m/s at $180°$ (west). The speed stayed at 20 m/s, but the direction changed from 60° to 120° — purely a direction change, no speed change.`,
            `This is a key insight: even when speed is constant, there can be a non-zero $\\Delta\\vec{v}$ (and hence a non-zero acceleration). Uniform circular motion is the extreme case.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Vector subtraction: flip-and-add',
          type: 'code',
          language: 'matlab',
          code: `A = [5, 2]; B = [2, 5];

diff1 = A - B;
diff2 = A + (-B);

fprintf('A - B    = [%g, %g]\\n', diff1(1), diff1(2))
fprintf('A + (-B) = [%g, %g]\\n', diff2(1), diff2(2))
fprintf('Same: %d\\n', isequal(diff1, diff2))

fprintf('\\nB - A    = [%g, %g]\\n', (B-A)(1), (B-A)(2))
fprintf('-(A-B)   = [%g, %g]\\n', (-(A-B))(1), (-(A-B))(2))
fprintf('B-A=-(A-B): %d\\n', isequal(B-A, -(A-B)))`,
          prose: [
            `In MATLAB, \`A - B\` and \`A + (-B)\` are identical for arrays — the minus operator subtracts element-by-element: $A_x - B_x$ and $A_y - B_y$. The unary \`-B\` negates each component.`,
            `\`isequal(diff1, diff2)\` returns 1 (true). \`isequal(B-A, -(A-B))\` also returns 1 — confirming $\\vec{B}-\\vec{A} = -(\\vec{A}-\\vec{B})$. Subtraction is anti-commutative: reversing the order negates the result.`,
            `Change \`B = [2, 5]\` to \`B = [0, 4]\` and observe. The anti-commutativity property holds regardless of the specific values.`,
          ],
        },
        {
          cellTitle: 'Visualise subtraction: both methods',
          type: 'code',
          language: 'matlab',
          code: `A = [5, 2]; B = [2, 5]; D = A - B;

figure
subplot(1,2,1); hold on; axis equal; grid on
% Flip-and-add
quiver(0,0, A(1),A(2), 0, 'b', 'LineWidth',2, 'MaxHeadSize',0.4)
quiver(A(1),A(2), -B(1),-B(2), 0, 'r', 'LineWidth',2, 'MaxHeadSize',0.4)
quiver(0,0, D(1),D(2), 0, 'm', 'LineWidth',2.5, 'MaxHeadSize',0.4)
title('Flip-and-add'); xlabel('x'); ylabel('y')
legend('A','-B','A-B')

subplot(1,2,2); hold on; axis equal; grid on
% Tail-to-tail shortcut
quiver(0,0, A(1),A(2), 0, 'b', 'LineWidth',2, 'MaxHeadSize',0.4)
quiver(0,0, B(1),B(2), 0, 'r', 'LineWidth',2, 'MaxHeadSize',0.4)
quiver(B(1),B(2), D(1),D(2), 0, 'm', 'LineWidth',2.5, 'MaxHeadSize',0.4)
title('Tail-to-tail shortcut'); xlabel('x'); ylabel('y')
legend('A','B','tip(B)→tip(A)')

for k=1:2; subplot(1,2,k); xlim([-2 8]); ylim([-4 7]); end
sgtitle('Both give the same magenta arrow')`,
          prose: [
            `Left: flip-and-add. \`quiver(A(1),A(2), -B(1),-B(2), 0)\` draws $-\\vec{B}$ from the tip of $\\vec{A}$. Right: tail-to-tail. Both $\\vec{A}$ and $\\vec{B}$ start from the origin; the magenta arrow runs from \`B\`'s tip to \`A\`'s tip.`,
            `The two magenta arrows are identical — the visual proof that both methods are equivalent. The tail-to-tail shortcut is simply the geometric interpretation of $(A_x - B_x, A_y - B_y)$.`,
            `Modify \`B = [4, 1]\` and re-run. Note how the tail-to-tail arrow always points "from B's tip toward A's tip" — this is why $\\Delta\\vec{v}$ diagrams draw $\\vec{v}_i$ and $\\vec{v}_f$ from the same point and call the gap arrow "$\\Delta\\vec{v}$".`,
          ],
        },
        {
          cellTitle: 'Change in velocity: |Δv| ≠ scalar difference',
          type: 'code',
          language: 'matlab',
          code: `v_i = [30, 0];     % 30 m/s east
v_f = [0, 40];     % 40 m/s north

delta_v = v_f - v_i;
delta_v_mag = norm(delta_v);
delta_v_ang = atan2d(delta_v(2), delta_v(1));

speed_change_wrong = norm(v_f) - norm(v_i);

fprintf('v_i = [%g, %g] m/s\\n', v_i(1), v_i(2))
fprintf('v_f = [%g, %g] m/s\\n', v_f(1), v_f(2))
fprintf('delta_v = [%g, %g] m/s\\n', delta_v(1), delta_v(2))
fprintf('|delta_v| = %.4f m/s  <-- correct\\n', delta_v_mag)
fprintf('|v_f|-|v_i| = %.4f m/s  <-- WRONG for direction change\\n', speed_change_wrong)
fprintf('Angle: %.2f degrees\\n', delta_v_ang)`,
          prose: [
            `\`delta_v = v_f - v_i = [-30, 40]\`. \`norm(delta_v) = 50\` m/s. \`norm(v_f) - norm(v_i) = 10\` m/s. These numbers differ by a factor of 5 because the velocity change is dominated by the direction change, not the speed change.`,
            `\`atan2d(delta_v(2), delta_v(1)) ≈ 126.87°\` — northwest. The car decelerated in the east direction AND accelerated in the north direction simultaneously. The vector difference captures both.`,
            `MATLAB's \`norm\` function computes $\\sqrt{\\sum v_k^2}$ regardless of dimensionality. Add a z-component (e.g., \`v_i = [30, 0, 5]\`) and re-run — it works for 3D automatically.`,
          ],
        },
        {
          cellTitle: 'Challenge: projectile velocity change',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% v_i = 20 m/s at 60 degrees, v_f = 20 m/s at 120 degrees
% Find delta_v, its magnitude and direction.

v_i = [20*cosd(___), 20*sind(___)];
v_f = [20*cosd(___), 20*sind(___)];
delta_v = ___ - ___;
mag = norm(___);
ang = atan2d(___,___);

fprintf('|Dv| = %.4f m/s\\n', mag)
fprintf('angle = %.2f degrees\\n', ang)`,
          prose: [
            `\`v_i = [20*cosd(60), 20*sind(60)] = [10, 17.32]\`. \`v_f = [20*cosd(120), 20*sind(120)] = [-10, 17.32]\`. MATLAB's \`cosd\`/\`sind\` take degrees directly.`,
            `\`delta_v = v_f - v_i = [-20, 0]\`. Expected: \`mag = 20\`, \`ang = 180\` (west). The y-components were equal and cancelled — a symmetric velocity change about the 90° axis produces a purely horizontal $\\Delta\\vec{v}$.`,
            `This result means the acceleration (which is proportional to $\\Delta\\vec{v}$) pointed west during this interval — even though the projectile was moving mostly upward. Understanding this is the key to centripetal and tangential acceleration.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-007-q1',
      type: 'choice',
      question: `$-\\vec{B}$ has the same _____ as $\\vec{B}$ but points in the _____ direction.`,
      options: [
        `direction; same`,
        `magnitude; opposite`,
        `components; same`,
        `magnitude; same`,
      ],
      answer: `magnitude; opposite`,
      hints: [`The negative vector is the additive inverse.`, `$-\\vec{B} = (-B_x, -B_y)$ — what does negating both components do geometrically?`],
      reviewSection: 'intuition',
      explanation: `The negative vector is the additive inverse: same magnitude, opposite direction. Components: $-\\vec{B} = (-B_x, -B_y)$.`,
    },
    {
      id: 'p1-ch1-007-q2',
      type: 'choice',
      question: `$\\vec{A} = (5, 2)$, $\\vec{B} = (2, 5)$. What is $\\vec{A} - \\vec{B}$?`,
      options: [`$(3, -3)$`, `$(7, 7)$`, `$(-3, 3)$`, `$(3, 3)$`],
      answer: `$(3, -3)$`,
      hints: [`Subtract component-by-component: $(5-2, 2-5)$.`, `Note the sign of the y-component.`],
      reviewSection: 'examples',
      explanation: `$(5-2, 2-5) = (3, -3)$.`,
    },
    {
      id: 'p1-ch1-007-q3',
      type: 'choice',
      question: `Is $\\vec{A} - \\vec{B} = \\vec{B} - \\vec{A}$?`,
      options: [
        `Yes, subtraction is commutative`,
        `No — they are antiparallel (same magnitude, opposite direction)`,
        `Only when $|\\vec{A}| = |\\vec{B}|$`,
        `Only when the vectors are perpendicular`,
      ],
      answer: `No — they are antiparallel (same magnitude, opposite direction)`,
      hints: [`Try with $\\vec{A}=(3,0)$ and $\\vec{B}=(0,4)$.`, `$\\vec{B}-\\vec{A} = -(\\vec{A}-\\vec{B})$`],
      reviewSection: 'rigor',
      explanation: `$\\vec{B} - \\vec{A} = -(\\vec{A} - \\vec{B})$. The two results have the same magnitude but point in opposite directions.`,
    },
    {
      id: 'p1-ch1-007-q4',
      type: 'choice',
      question: `In the tail-to-tail shortcut, $\\vec{A} - \\vec{B}$ is the arrow from:`,
      options: [
        `Tip of $\\vec{A}$ to tip of $\\vec{B}$`,
        `Tip of $\\vec{B}$ to tip of $\\vec{A}$`,
        `Tail of $\\vec{A}$ to tail of $\\vec{B}$`,
        `Origin to tip of $\\vec{A}$`,
      ],
      answer: `Tip of $\\vec{B}$ to tip of $\\vec{A}$`,
      hints: [`The arrow tells you how to get FROM $\\vec{B}$'s endpoint TO $\\vec{A}$'s endpoint.`, `Think: $\\vec{B} + (\\vec{A}-\\vec{B}) = \\vec{A}$ — that equation shows the direction.`],
      reviewSection: 'intuition',
      explanation: `When tails are shared, $\\vec{A} - \\vec{B}$ points from the tip of $\\vec{B}$ to the tip of $\\vec{A}$.`,
    },
    {
      id: 'p1-ch1-007-q5',
      type: 'choice',
      question: `A car's velocity changes from 30 m/s east to 40 m/s north. What is $|\\Delta\\vec{v}|$?`,
      options: [`$10$ m/s`, `$70$ m/s`, `$50$ m/s`, `$\\sqrt{7}$ m/s`],
      answer: `$50$ m/s`,
      hints: [`$\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i = (0-30, 40-0)$.`, `This is a 3-4-5 triangle.`],
      reviewSection: 'examples',
      explanation: `$\\Delta\\vec{v} = (-30, 40)$ m/s. $|\\Delta\\vec{v}| = \\sqrt{900+1600} = 50$ m/s. NOT $|40-30| = 10$ m/s.`,
    },
    {
      id: 'p1-ch1-007-q6',
      type: 'choice',
      question: `Which equation correctly defines the change in velocity $\\Delta\\vec{v}$?`,
      options: [
        `$|\\vec{v}_f| - |\\vec{v}_i|$`,
        `$\\vec{v}_f - \\vec{v}_i$`,
        `$\\vec{v}_i - \\vec{v}_f$`,
        `$|\\vec{v}_f - \\vec{v}_i|$`,
      ],
      answer: `$\\vec{v}_f - \\vec{v}_i$`,
      hints: [`This must be a vector, not a scalar.`, `The order matters — final minus initial.`],
      reviewSection: 'math',
      explanation: `$\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i$ — a vector. $|\\vec{v}_f| - |\\vec{v}_i|$ is a scalar and gives the wrong magnitude when the direction changes.`,
    },
    {
      id: 'p1-ch1-007-q7',
      type: 'choice',
      question: `$\\vec{B} + (-\\vec{B}) = ?$`,
      options: [`$2\\vec{B}$`, `$\\vec{0}$`, `$\\vec{B}$`, `$-2\\vec{B}$`],
      answer: `$\\vec{0}$`,
      hints: [`$-\\vec{B}$ is the additive inverse.`, `Component check: $B_x + (-B_x) = ?$`],
      reviewSection: 'rigor',
      explanation: `$-\\vec{B}$ is the additive inverse: $\\vec{B} + (-\\vec{B}) = (B_x-B_x, B_y-B_y) = (0, 0) = \\vec{0}$.`,
    },
    {
      id: 'p1-ch1-007-q8',
      type: 'choice',
      question: `$\\vec{v}_i = 20$ m/s at 60°, $\\vec{v}_f = 20$ m/s at 120°. What is the direction of $\\Delta\\vec{v}$?`,
      options: [`$90°$ (north)`, `$180°$ (west)`, `$0°$ (east)`, `$270°$ (south)`],
      answer: `$180°$ (west)`,
      hints: [`Both speeds are equal; the angles are symmetric about 90°.`, `$\\Delta v_y = 20\\sin120° - 20\\sin60° = ?$`],
      reviewSection: 'challenges',
      explanation: `$\\Delta v_x = 20\\cos120° - 20\\cos60° = -10-10 = -20$. $\\Delta v_y = 20\\sin120° - 20\\sin60° = 0$. Direction is 180° (west).`,
    },
    {
      id: 'p1-ch1-007-q9',
      type: 'choice',
      question: `A plane travels at 200 m/s north but drifts to 206.2 m/s at a slight east angle due to crosswind. The drift vector (difference between actual and intended velocity) is:`,
      options: [
        `6.2 m/s north`,
        `50 m/s east`,
        `200 m/s north`,
        `206.2 m/s at the drift angle`,
      ],
      answer: `50 m/s east`,
      hints: [`Drift = actual velocity − intended velocity.`, `$\\vec{v}_{\\text{drift}} = \\vec{v}_{\\text{ground}} - \\vec{v}_{\\text{intended}}$`],
      reviewSection: 'examples',
      explanation: `$\\vec{v}_{\\text{drift}} = \\vec{v}_{\\text{ground}} - \\vec{v}_{\\text{intended}} = (50, 200) - (0, 200) = (50, 0)$ m/s = 50 m/s east. The wind contribution exactly.`,
    },
    {
      id: 'p1-ch1-007-q10',
      type: 'choice',
      question: `Which expression equals $|\\vec{A} - \\vec{B}|^2$?`,
      options: [
        `$|\\vec{A}|^2 - |\\vec{B}|^2$`,
        `$|\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}$`,
        `$(A_x - B_x)^2$`,
        `$|\\vec{A}|^2 + |\\vec{B}|^2$`,
      ],
      answer: `$|\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}$`,
      hints: [`Expand $(A_x-B_x)^2 + (A_y-B_y)^2$ and regroup.`, `The cross term $-2(A_xB_x + A_yB_y)$ is $-2\\vec{A}\\cdot\\vec{B}$.`],
      reviewSection: 'rigor',
      explanation: `Expanding the squared magnitude gives $|\\vec{A}|^2 + |\\vec{B}|^2 - 2(A_xB_x + A_yB_y) = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}$. This is the vector law of cosines.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-007-m1',
      title: 'Confusing |Δv⃗| with the change in speed',
      description: `Students compute $|\\vec{v}_f| - |\\vec{v}_i|$ (scalar difference of speeds) when the problem asks for $|\\Delta\\vec{v}| = |\\vec{v}_f - \\vec{v}_i|$ (magnitude of the vector difference). These are only equal when the direction does not change.`,
      correctionExample: `A car changes from 30 m/s east to 40 m/s north: $|\\vec{v}_f| - |\\vec{v}_i| = 10$ m/s (speed increased by 10). But $|\\Delta\\vec{v}| = \\sqrt{30^2+40^2} = 50$ m/s — the actual velocity change is 5 times larger. The direction change dominates.`,
    },
    {
      id: 'p1-ch1-007-m2',
      title: 'Reversing the subtraction order in Δv⃗',
      description: `Students write $\\Delta\\vec{v} = \\vec{v}_i - \\vec{v}_f$ instead of $\\vec{v}_f - \\vec{v}_i$. This reverses the direction of the acceleration vector, leading to the wrong force direction in Newton's second law.`,
      correctionExample: `Car from 30 m/s east to 40 m/s north: correct $\\Delta\\vec{v} = (-30, 40)$ m/s pointing northwest (the car is accelerating in that direction). Wrong order gives $(30, -40)$ m/s pointing southeast — the exact opposite. If you plug the wrong sign into $\\vec{F} = m\\vec{a}$, the force vector points the wrong way.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-007-t1',
      prompt: `In projectile motion, a ball is launched at 30 m/s at 45° and 2 seconds later moves at some velocity $\\vec{v}_f$. If gravity is 10 m/s² downward, what is $\\vec{v}_f = \\vec{v}_i + \\vec{a}\\,\\Delta t$? What is $\\Delta\\vec{v}$, and what is its direction? Should it point downward? Why?`,
    },
    {
      id: 'p1-ch1-007-t2',
      prompt: `A satellite in circular orbit has speed 7800 m/s at all times but constantly changes direction. At two points separated by 60° of arc, compute $|\\Delta\\vec{v}|$. Is $|\\Delta\\vec{v}|$ equal to zero (same speed), or is it something else? What does this say about the acceleration?`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-007-d1',
      title: 'Computing scalar difference instead of vector difference',
      buggyCode: `v_i_mag = np.linalg.norm(v_i)
v_f_mag = np.linalg.norm(v_f)
delta_v_wrong = v_f_mag - v_i_mag   # scalar — gives 10 m/s, not 50`,
      explanation: `This computes the change in speed, not the change in velocity. When the direction changes (as here from east to north), the scalar difference can be much smaller than the vector difference.`,
      fix: `delta_v = v_f - v_i                         # vector subtraction
delta_v_mag = np.linalg.norm(delta_v)   # magnitude of the vector difference`,
    },
    {
      id: 'p1-ch1-007-d2',
      title: 'Subtracting in the wrong order',
      buggyCode: `# Problem asks for change in velocity (final - initial)
# but student writes:
delta_v = v_i - v_f   # wrong order — gives -(correct answer)`,
      explanation: `$\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i$. Reversing to $\\vec{v}_i - \\vec{v}_f$ gives the negative of the correct vector — same magnitude, opposite direction. This reverses the acceleration in Newton's second law.`,
      fix: `delta_v = v_f - v_i   # final minus initial — always`,
    },
  ],

  mastery: {
    targetLevel: `Compute $\\vec{A} - \\vec{B}$ by negating and adding: flip all components of $\\vec{B}$, then apply tip-to-toe or DSMD. Distinguish $|\\Delta\\vec{v}|$ from $\\Delta|\\vec{v}|$. Apply the tail-to-tail shortcut to read $\\Delta\\vec{v}$ directly from velocity diagrams.`,
    prerequisites: [`Negative vectors and additive inverses`, `Tip-to-toe addition (Lesson 5)`, `DSMD numerical method (Lesson 6)`],
    enables: [`Numerical vector subtraction (Lesson 8)`, `Kinematics (acceleration as $\\Delta\\vec{v}/\\Delta t$)`, `Dot product (Lesson 10): $|\\vec{A}-\\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}$`],
    commonStuckPoints: [
      `Computing scalar speed difference instead of vector magnitude difference`,
      `Reversing the order of subtraction (initial minus final)`,
      `Confusing the tail-to-tail shortcut direction ($\\vec{B}$'s tip → $\\vec{A}$'s tip, not the other way)`,
    ],
  },

  semantics: {
    core: [
      { symbol: `-\\vec{B} = (-B_x, -B_y)`, meaning: `Additive inverse — same magnitude as B, opposite direction` },
      { symbol: `\\vec{A} - \\vec{B} = (A_x - B_x,\\; A_y - B_y)`, meaning: `Vector subtraction — component-wise scalar subtraction` },
      { symbol: `\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i`, meaning: `Change in velocity — vector difference, not scalar difference of speeds` },
      { symbol: `\\vec{B} + (-\\vec{B}) = \\vec{0}`, meaning: `Additive inverse property — the defining condition of the negative vector` },
      { symbol: `|\\vec{A} - \\vec{B}|^2 = |\\vec{A}|^2 + |\\vec{B}|^2 - 2\\vec{A}\\cdot\\vec{B}`, meaning: `Vector law of cosines — connects subtraction to the dot product` },
    ],
    rulesOfThumb: [
      `$\\vec{A} - \\vec{B}$ = flip $\\vec{B}$, then add to $\\vec{A}$.`,
      `Tail-to-tail shortcut: $\\vec{A} - \\vec{B}$ runs from tip of $\\vec{B}$ to tip of $\\vec{A}$.`,
      `$\\Delta\\vec{v} = \\vec{v}_f - \\vec{v}_i$ — always final minus initial.`,
      `$|\\Delta\\vec{v}| \\ne |\\vec{v}_f| - |\\vec{v}_i|$ unless the direction is unchanged.`,
      `$\\vec{B} - \\vec{A} = -(\\vec{A} - \\vec{B})$ — swapping the order negates the result.`,
    ],
  },
}
