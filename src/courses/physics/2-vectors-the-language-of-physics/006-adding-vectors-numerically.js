export default {
  id: 'p1-ch1-006',
  slug: 'adding-vectors-numerically',
  chapter: 'p1',
  order: 6,
  title: 'Adding Vectors Numerically',
  subtitle: 'The four-step method that works for any vectors, every time.',
  tags: ['vector addition', 'numerical method', 'components', 'resultant', 'systematic method'],
  aliases: 'component method vector sum adding analytically calculation',

  hook: {
    question: `Two forces: 40 N at 30° and 25 N at 145°. Graphical methods give only an estimate. How do you get the exact answer?`,
    realWorldContext: `Every real engineering calculation — bridge loads, satellite trajectories, robot forces — requires exact vector addition. The numerical (component) method is the workhorse: decompose, sum, reconstruct. Four steps, always works.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'vector-addition-chain' },
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (7 of 21) Adding Vectors Numerically: Example 1',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (8 of 21) Adding Vectors Numerically: Example 2',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'examples',
    },
  ],

  intuition: {
    prose: [
      `Take two forces: 40 N at 30° and 25 N at 145°. Before reading on, predict: is the resultant closer to 65 N, 37 N, or 15 N? The graphical answer depends on how well you draw. The numerical method gives you exactly 37.1 N — no ruler needed.`,
      `The graphical methods show you *what* the answer looks like. The numerical method tells you *exactly* what it is.`,
      `The four-step recipe, called DSMD, never fails: **Step 1 — Decompose** each vector into $x$- and $y$-components using $v_x = |\\vec{v}|\\cos\\theta$, $v_y = |\\vec{v}|\\sin\\theta$. **Step 2 — Sum** all $x$-components; sum all $y$-components. **Step 3 — Magnitude**: $|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}$. **Step 4 — Direction**: $\\theta = \\text{atan2}(R_y, R_x)$, then check the quadrant.`,
      `The method works because addition is done component-by-component, and components are just numbers — ordinary arithmetic applies.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'DSMD — four-step method',
        body: `\\text{1. Decompose: } v_{kx}=|\\vec{v}_k|\\cos\\theta_k,\\;v_{ky}=|\\vec{v}_k|\\sin\\theta_k\\quad\\text{2. Sum: }R_x=\\sum v_{kx},\\;R_y=\\sum v_{ky}\\quad\\text{3. Magnitude: }|\\vec{R}|=\\sqrt{R_x^2+R_y^2}\\quad\\text{4. Direction: }\\theta=\\operatorname{atan2}(R_y,R_x)`,
      },
      {
        type: 'warning',
        title: 'Check the quadrant every time',
        body: 'atan2 returns the correct quadrant automatically. Plain arctan does not — it only covers $(-90°, 90°)$. If $R_x < 0$, add $180°$ to the plain arctan result.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Step 1 — Decompose each vector',
        caption: 'Before you can add vectors numerically, each one becomes a right triangle: Aₓ = |A|cosθ and Ay = |A|sinθ. Then you add x-components together and y-components together. Pure arithmetic.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Two vectors — four steps live',
        caption: `Decompose each vector into components. Sum $x$-components and $y$-components separately. Apply $|\\vec{R}| = \\sqrt{R_x^2+R_y^2}$ and $\\theta = \\text{atan2}(R_y, R_x)$.`,
      },
    ],
  },

  math: {
    prose: [
      'The component table is the practical organiser for multi-vector problems. Set up one row per vector, one column per component, and sum the bottom row.',
      'A common exam trap: **sign errors in components**. Always write $v_{kx} = |\\vec{v}_k|\\cos\\theta_k$ where $\\theta_k$ is the standard angle (from $+x$, counterclockwise). If a problem gives "30° below the horizontal", convert to $\\theta = -30°$ before plugging in.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The component table',
        body: `\\begin{array}{c|c|c}\\text{Vector} & v_x & v_y\\\\\\hline\\vec{A} & A_x & A_y\\\\\\vec{B} & B_x & B_y\\\\\\hline\\vec{R} & R_x=A_x+B_x & R_y=A_y+B_y\\end{array}`,
      },
      {
        type: 'mnemonic',
        title: 'DSMD — the four-step acronym',
        body: 'Decompose → Sum → Magnitude → Direction. Say it before every problem.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Component table — the DSMD organiser',
        caption: `One row per vector, one column per component, sum the bottom row. Every sign error becomes visible before it propagates.`,
      },
    ],
  },

  rigor: {
    prose: [
      'The numerical method is exact — not an approximation — because it is literally the definition of vector addition in $\\mathbb{R}^2$: $(A_x, A_y) + (B_x, B_y) \\equiv (A_x+B_x, A_y+B_y)$. Any error is purely arithmetic, not methodological.',
      'The only source of genuine imprecision is rounding during the trigonometric steps. Carry at least 4 significant figures through intermediate calculations and round only at the final answer.',
      'From an invariant viewpoint, the components $v_x$ and $v_y$ depend on the choice of coordinate axes. Rotate the axes and every component changes — but the vector $\\vec{v}$ itself does not. The method remains correct in any right-handed coordinate system; only the numerical values of the components change. This invariance is why the method works in structural engineering regardless of how the reference frame is oriented.',
      'The DSMD method is the bridge to 3D and beyond. In $\\mathbb{R}^3$ a fifth step appears between Decompose and Sum: adding the $z$-components. In $\\mathbb{R}^n$ the pattern generalises trivially — $n$ component columns, one sum per column. The dot product (Lesson 10) takes this idea further: instead of summing components to get a new vector, it multiplies corresponding components to get a scalar.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Premature rounding',
        body: 'Rounding $\\cos 37° = 0.8$ (instead of $0.7986$) introduces a 0.17% error that compounds through every step. Always use full calculator precision in intermediate steps.',
      },
      {
        type: 'insight',
        title: 'The method is definition, not approximation',
        body: `$\\vec{A}+\\vec{B} \\equiv (A_x+B_x,\\;A_y+B_y)$. Decomposing and summing components is not an approximation — it IS the exact result expressed algebraically.`,
      },
    ],
    proofSteps: [
      {
        title: 'Input: magnitude-angle form',
        expression: `\\vec{A} = (|\\vec{A}|, \\theta_A), \\quad \\vec{B} = (|\\vec{B}|, \\theta_B)`,
        annotation: 'Problems often give magnitude and angle. We need to convert to component form to perform the addition.',
      },
      {
        title: 'Step 1 — Decompose',
        expression: `A_x = |\\vec{A}|\\cos\\theta_A,\\; A_y = |\\vec{A}|\\sin\\theta_A,\\quad B_x = |\\vec{B}|\\cos\\theta_B,\\; B_y = |\\vec{B}|\\sin\\theta_B`,
        annotation: 'Apply the component formulas. Watch for signs: 145° gives a negative x-component.',
      },
      {
        title: 'Step 2 — Sum',
        expression: `R_x = A_x+B_x, \\quad R_y = A_y+B_y`,
        annotation: 'This is vector addition by definition. The two component numbers combine to give the resultant\'s components.',
      },
      {
        title: 'Step 3 — Magnitude',
        expression: `|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}`,
        annotation: 'Pythagorean theorem on the resultant components. Always gives the correct magnitude regardless of quadrant.',
      },
      {
        title: 'Step 4 — Direction',
        expression: `\\theta_R = \\operatorname{atan2}(R_y, R_x)`,
        annotation: 'atan2 returns the correct quadrant. Plain arctan requires a manual quadrant check if $R_x < 0$.',
      },
    ],
    title: 'The four-step method — every step justified',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'DSMD proof — four steps, one diagram',
        caption: `Steps 1–2: decompose and sum → $R_x, R_y$. Steps 3–4: Pythagorean theorem and atan2 → magnitude and direction. The method is exact because it is the definition of $\\mathbb{R}^2$ addition.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-006-ex1',
      title: 'Two forces at non-right angles — full DSMD walkthrough',
      problem: `\\vec{A}=40\\,N\\text{ at }30°,\\;\\vec{B}=25\\,N\\text{ at }145°.\\text{ Find }\\vec{R}.`,
      steps: [
        { expression: 'A_x=40\\cos30°=40(0.8660)=34.64\\,N,\\;A_y=40\\sin30°=20.00\\,N', annotation: 'Step 1: decompose A. 30° is Quadrant I — both components positive.' },
        { expression: 'B_x=25\\cos145°=25(-0.8192)=-20.48\\,N,\\;B_y=25\\sin145°=25(0.5736)=14.34\\,N', annotation: 'Step 1: decompose B. 145° is Quadrant II — negative x, positive y.' },
        { expression: 'R_x=34.64+(-20.48)=14.16\\,N,\\;R_y=20.00+14.34=34.34\\,N', annotation: 'Step 2: sum each component column independently.' },
        { expression: '|\\vec{R}|=\\sqrt{14.16^2+34.34^2}=\\sqrt{200.5+1179.2}\\approx37.1\\,N', annotation: 'Step 3: magnitude via Pythagorean theorem.' },
        { expression: '\\theta=\\arctan(34.34/14.16)\\approx67.6°', annotation: 'Step 4: both components positive → Quadrant I. atan2 confirms 67.6°.' },
      ],
      conclusion: '$\\vec{R} \\approx 37.1\\,N$ at $67.6°$ from the positive $x$-axis.',
      visualizations: [
        { id: 'SVGDiagram', props: { type: 'vector-addition-chain' }, title: '40 N at 30° + 25 N at 145°', caption: `$\\vec{A}$ in Q-I, $\\vec{B}$ in Q-II. Their sum $\\vec{R}$ is in Q-I. The negative $x$-component of $\\vec{B}$ partially cancels $\\vec{A}$'s $x$-component.` },
      ],
    },
    {
      id: 'ch1-006-ex2',
      title: 'Subtracting vectors — negate and add',
      problem: `\\vec{A}=(5,3),\\;\\vec{B}=(2,-1).\\text{ Find }\\vec{A}-\\vec{B}.`,
      steps: [
        { expression: '-\\vec{B}=(-2,1)', annotation: 'Negate B by flipping all component signs. This reverses its direction.' },
        { expression: '\\vec{A}+(-\\vec{B})=(5+(-2),\\;3+1)=(3,4)', annotation: 'Add component-wise. Subtraction is just addition of $-\\vec{B}$.' },
        { expression: '|\\vec{A}-\\vec{B}|=\\sqrt{9+16}=5', annotation: 'Magnitude of the result.' },
      ],
      conclusion: '$\\vec{A}-\\vec{B} = (3,4)$, magnitude 5. Vector subtraction is just addition of the negated vector.',
    },
    {
      id: 'ch1-006-ex3',
      title: 'Three-force component table',
      problem: `\\text{Three forces: }\\vec{F}_1=50\\,N\\text{ at }0°,\\;\\vec{F}_2=30\\,N\\text{ at }120°,\\;\\vec{F}_3=20\\,N\\text{ at }240°.\\text{ Find }\\vec{R}.`,
      steps: [
        { expression: 'F_{1x}=50,\\;F_{1y}=0', annotation: 'Row 1: 0° → full magnitude east, no y.' },
        { expression: 'F_{2x}=30\\cos120°=-15,\\;F_{2y}=30\\sin120°=15\\sqrt{3}\\approx25.98', annotation: 'Row 2: 120° is Quadrant II.' },
        { expression: 'F_{3x}=20\\cos240°=-10,\\;F_{3y}=20\\sin240°=-10\\sqrt{3}\\approx-17.32', annotation: 'Row 3: 240° is Quadrant III — both components negative.' },
        { expression: 'R_x=50-15-10=25\\,N,\\;R_y=0+25.98-17.32=8.66\\,N', annotation: 'Sum columns.' },
        { expression: '|\\vec{R}|=\\sqrt{625+75}=\\sqrt{700}\\approx26.46\\,N', annotation: 'Magnitude.' },
        { expression: '\\theta=\\arctan(8.66/25)\\approx19.1°', annotation: 'Both positive → Quadrant I.' },
      ],
      conclusion: '$|\\vec{R}| \\approx 26.46\\,N$ at $19.1°$. The component table keeps every sign visible and prevents errors from compounding.',
    },
  ],

  challenges: [
    {
      id: 'ch1-006-ch1',
      difficulty: 'easy',
      problem: `\\vec{A}=10\\,N\\text{ at }0°,\\;\\vec{B}=10\\,N\\text{ at }90°.\\text{ Find }\\vec{R}\\text{ exactly.}`,
      hint: '0° is east, 90° is north. Components are trivial.',
      walkthrough: [
        { expression: 'R_x=10+0=10,\\;R_y=0+10=10', annotation: 'Direct from the angles — no trig required here.' },
        { expression: '|\\vec{R}|=\\sqrt{200}=10\\sqrt{2}\\approx14.1\\,N', annotation: 'Pythagorean theorem.' },
        { expression: '\\theta=45°', annotation: 'Equal x and y → 45°.' },
      ],
      answer: `10\\sqrt{2}\\,N\\text{ at }45°`,
    },
    {
      id: 'ch1-006-ch2',
      difficulty: 'medium',
      problem: `\\text{Three forces: }\\vec{F}_1=50\\,N\\text{ at }0°,\\;\\vec{F}_2=30\\,N\\text{ at }120°,\\;\\vec{F}_3=20\\,N\\text{ at }240°.\\text{ Find }\\vec{R}.`,
      hint: 'Use exact trig values: $\\cos120°=-\\frac{1}{2}$, $\\sin120°=\\frac{\\sqrt{3}}{2}$, $\\cos240°=-\\frac{1}{2}$, $\\sin240°=-\\frac{\\sqrt{3}}{2}$.',
      walkthrough: [
        { expression: 'F_{1x}=50,\\;F_{1y}=0', annotation: '0° — full east.' },
        { expression: 'F_{2x}=-15,\\;F_{2y}=15\\sqrt{3}', annotation: '120° Quadrant II.' },
        { expression: 'F_{3x}=-10,\\;F_{3y}=-10\\sqrt{3}', annotation: '240° Quadrant III.' },
        { expression: 'R_x=25\\,N,\\;R_y=5\\sqrt{3}\\approx8.66\\,N', annotation: 'Column sums.' },
        { expression: '|\\vec{R}|=10\\sqrt{7}\\approx26.5\\,N\\text{ at }19.1°', annotation: 'Final answer.' },
      ],
      answer: `|\\vec{R}|=10\\sqrt{7}\\approx26.5\\,N\\text{ at }19.1°`,
    },
    {
      id: 'ch1-006-ch3',
      difficulty: 'hard',
      problem: `\\text{Forces } \\vec{A}\\text{ at }\\alpha\\text{ and }\\vec{B}\\text{ at }-\\alpha\\text{ have equal magnitudes }F. \\text{Show that }|\\vec{R}|=2F\\cos\\alpha\\text{ and that }\\vec{R}\\text{ points along }+x.`,
      hint: 'By symmetry, the y-components cancel. Use $\\cos(-\\alpha)=\\cos\\alpha$ and $\\sin(-\\alpha)=-\\sin\\alpha$.',
      walkthrough: [
        { expression: 'A_x=F\\cos\\alpha,\\;A_y=F\\sin\\alpha', annotation: 'Decompose A.' },
        { expression: 'B_x=F\\cos(-\\alpha)=F\\cos\\alpha,\\;B_y=F\\sin(-\\alpha)=-F\\sin\\alpha', annotation: 'Cosine is even; sine is odd.' },
        { expression: 'R_y=F\\sin\\alpha-F\\sin\\alpha=0', annotation: 'y-components cancel by symmetry.' },
        { expression: 'R_x=2F\\cos\\alpha', annotation: 'x-components add.' },
        { expression: '|\\vec{R}|=2F\\cos\\alpha,\\;\\theta=0°', annotation: 'Resultant is purely along +x.' },
      ],
      answer: `|\\vec{R}|=2F\\cos\\alpha,\\text{ directed along }+x`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'DSMD step-by-step: 40 N at 30° + 25 N at 145°',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# Input: (magnitude, angle in degrees from +x)
vectors = [(40.0, 30.0), (25.0, 145.0)]

# Step 1 — Decompose
components = [(m*np.cos(np.radians(a)), m*np.sin(np.radians(a)))
              for m, a in vectors]
for i, (vx, vy) in enumerate(components):
    print(f"v{i+1}: x = {vx:+.4f} N    y = {vy:+.4f} N")

# Step 2 — Sum
Rx = sum(c[0] for c in components)
Ry = sum(c[1] for c in components)
print(f"\\nR_x = {Rx:.4f} N")
print(f"R_y = {Ry:.4f} N")

# Step 3 — Magnitude
R_mag = np.sqrt(Rx**2 + Ry**2)
print(f"|R| = {R_mag:.4f} N")

# Step 4 — Direction
theta = np.degrees(np.arctan2(Ry, Rx))
print(f"theta = {theta:.2f} degrees")`,
          prose: [
            `Step 1: \`np.cos(np.radians(a))\` converts degrees to radians then applies cosine — this is $v_x = |\\vec{v}|\\cos\\theta$. Notice the 145° vector gives a negative x-component ($-20.48$ N): Quadrant II has $\\cos\\theta < 0$.`,
            `Step 2: \`sum(c[0] for c in components)\` sums all x-components in one expression — this is $R_x = \\sum v_{kx}$. Each axis is treated as independent scalar arithmetic.`,
            `Steps 3–4: \`np.sqrt(Rx**2 + Ry**2)\` is the Pythagorean theorem; \`np.arctan2(Ry, Rx)\` returns the four-quadrant angle. Result: $|\\vec{R}| \\approx 37.1$ N at $67.6°$. Change either input and re-run — the same four-step code handles any angle.`,
          ],
        },
        {
          cellTitle: 'Generalised add_vectors function with matplotlib',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt

def add_vectors(mag_angle_list):
    """DSMD: (magnitude, degrees) pairs → (resultant mag, angle, Rx, Ry)."""
    xs = [m * np.cos(np.radians(a)) for m, a in mag_angle_list]
    ys = [m * np.sin(np.radians(a)) for m, a in mag_angle_list]
    Rx, Ry = sum(xs), sum(ys)
    return np.sqrt(Rx**2 + Ry**2), np.degrees(np.arctan2(Ry, Rx)), Rx, Ry

data = [(40, 30), (25, 145)]
mag, ang, Rx, Ry = add_vectors(data)

# Plot
fig, ax = plt.subplots(figsize=(6, 5))
origin = np.zeros(2)
colors = ['royalblue', 'darkorange']
tip = np.zeros(2)
for i, (m, a) in enumerate(data):
    v = np.array([m*np.cos(np.radians(a)), m*np.sin(np.radians(a))])
    ax.quiver(*tip, *v, angles='xy', scale_units='xy', scale=1,
              color=colors[i], width=0.012, label=f'v{i+1}: {m} N at {a}°')
    tip = tip + v
ax.quiver(0, 0, Rx, Ry, angles='xy', scale_units='xy', scale=1,
          color='crimson', width=0.015, label=f'R: {mag:.1f} N at {ang:.1f}°')
ax.set_xlim(-5, 50); ax.set_ylim(-5, 45)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3); ax.legend()
ax.set_title('DSMD result')
plt.tight_layout(); plt.show()`,
          prose: [
            `\`add_vectors\` encapsulates all four DSMD steps. The list comprehensions in lines 3–4 are Step 1 (decompose); \`sum(xs)\` is Step 2; the return statement handles Steps 3–4. One function, any number of vectors.`,
            `The matplotlib loop draws each vector tip-to-toe (advancing \`tip\` after each arrow), then draws the resultant from the origin. This pairs the visual (tip-to-toe chain) with the numerical (DSMD) — two representations of the same addition.`,
            `Call \`add_vectors([(50,0),(30,120),(20,240)])\` to solve the three-force problem from Example 3. The function returns $|\\vec{R}| \\approx 26.46$ N at $19.1°$ — verify it matches the hand calculation.`,
          ],
        },
        {
          cellTitle: 'Sign pitfall: angles below the horizontal',
          type: 'code',
          language: 'python',
          code: `# Problem states: "30 N at 40 degrees below the horizontal"
# Students often write cos(40) for Rx — wrong sign in Ry

angle_below_horizontal = -40   # correct: negative angle (below +x axis)
angle_wrong = 40               # common mistake: student forgets the sign

F_mag = 30.0

correct = np.array([F_mag * np.cos(np.radians(angle_below_horizontal)),
                    F_mag * np.sin(np.radians(angle_below_horizontal))])

wrong   = np.array([F_mag * np.cos(np.radians(angle_wrong)),
                    F_mag * np.sin(np.radians(angle_wrong))])

print(f"Correct (theta=-40°): Fx={correct[0]:.4f}, Fy={correct[1]:.4f}")
print(f"Wrong   (theta=+40°): Fx={wrong[0]:.4f},   Fy={wrong[1]:.4f}")
print(f"Ry error: {abs(correct[1] - wrong[1]):.4f} N")`,
          prose: [
            `"40° below the horizontal" means $\\theta = -40°$ in the standard convention (counterclockwise from $+x$). Using $+40°$ gives a positive $R_y$ instead of negative — the vector points UP-right instead of DOWN-right.`,
            `\`np.sin(np.radians(-40)) = -0.6428\`, giving $F_y = -19.28$ N (pointing south). Using $+40°$ gives $+19.28$ N — a $38.56$ N error in $R_y$ if this feeds into a sum with other vectors.`,
            `Rule: always convert the problem's verbal angle description to a standard-convention angle ($0°$ = east, counterclockwise positive) BEFORE computing components. This step prevents the most common sign error in the DSMD method.`,
          ],
        },
        {
          cellTitle: 'Challenge: satellite thruster net force',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

def add_vectors(mag_angle_list):
    xs = [m * np.cos(np.radians(a)) for m, a in mag_angle_list]
    ys = [m * np.sin(np.radians(a)) for m, a in mag_angle_list]
    Rx, Ry = sum(xs), sum(ys)
    return np.sqrt(Rx**2 + Ry**2), np.degrees(np.arctan2(Ry, Rx)), Rx, Ry

# Three thrusters fire simultaneously:
# 120 N at 0°, 80 N at 120°, 60 N at 250°
# Use add_vectors to find the net force magnitude and direction.

thrusters = [(___, ___), (___, ___), (___, ___)]
net_mag, net_ang, Rx, Ry = add_vectors(___)

print(f"|F_net| = {net_mag:.4f} N")
print(f"theta   = {net_ang:.2f} degrees")`,
          prose: [
            `\`thrusters = [(120, 0), (80, 120), (60, 250)]\`. The third thruster is at 250° — Quadrant III, so both components are negative. The DSMD function handles this automatically via \`cos(250°)\` and \`sin(250°)\`.`,
            `Pass the list to \`add_vectors(thrusters)\`. Expected: $|\\vec{F}_{net}| \\approx 87.5$ N at approximately $56°$. You can verify by computing $R_x$ and $R_y$ by hand: $R_x = 120 + 80\\cos120° + 60\\cos250° \\approx 99.5 + (-40) + (-20.5) \\approx 39$, $R_y \\approx 48.9$.`,
            `This is the pattern used in spacecraft attitude control: multiple thrusters fire simultaneously, and the flight computer uses exactly this four-step calculation to determine the net force vector 100 times per second.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'DSMD step-by-step: 40 N at 30° + 25 N at 145°',
          type: 'code',
          language: 'matlab',
          code: `% Input: [magnitude, angle_degrees]
vectors = [40, 30; 25, 145];

% Step 1 — Decompose
Vx = vectors(:,1) .* cosd(vectors(:,2));
Vy = vectors(:,1) .* sind(vectors(:,2));
fprintf('v1: x = %+.4f N  y = %+.4f N\\n', Vx(1), Vy(1))
fprintf('v2: x = %+.4f N  y = %+.4f N\\n', Vx(2), Vy(2))

% Step 2 — Sum
Rx = sum(Vx); Ry = sum(Vy);
fprintf('\\nR_x = %.4f N\\nR_y = %.4f N\\n', Rx, Ry)

% Step 3 — Magnitude
R_mag = sqrt(Rx^2 + Ry^2);
fprintf('|R| = %.4f N\\n', R_mag)

% Step 4 — Direction
theta = atan2d(Ry, Rx);
fprintf('theta = %.2f degrees\\n', theta)`,
          prose: [
            `\`vectors(:,1)\` extracts the magnitudes column; \`vectors(:,2)\` extracts the angles. \`cosd\` and \`sind\` take degrees directly — no conversion needed. The \`.*\` operator multiplies element-wise: $v_{kx} = |\\vec{v}_k|\\cos\\theta_k$ for every row at once.`,
            `\`sum(Vx)\` and \`sum(Vy)\` collapse the vectors to $R_x$ and $R_y$ — this is Step 2. The code structure mirrors the component table: each row is a vector, each column is a component, \`sum\` gives the bottom row.`,
            `\`atan2d(Ry, Rx)\` returns degrees directly (vs. \`atan2\` which returns radians). Result: $|\\vec{R}| \\approx 37.1$ N at $67.6°$. Add a third row to \`vectors\` and re-run — the code handles it with no changes.`,
          ],
        },
        {
          cellTitle: 'Generalised function and plot',
          type: 'code',
          language: 'matlab',
          code: `function [mag, ang, Rx, Ry] = add_vectors(mag_angles)
% DSMD: n×2 matrix [magnitude, degrees] → resultant
Vx = mag_angles(:,1) .* cosd(mag_angles(:,2));
Vy = mag_angles(:,1) .* sind(mag_angles(:,2));
Rx = sum(Vx); Ry = sum(Vy);
mag = sqrt(Rx^2 + Ry^2);
ang = atan2d(Ry, Rx);
end

data = [40, 30; 25, 145];
[mag, ang, Rx, Ry] = add_vectors(data);

% Plot tip-to-toe chain
figure; hold on; axis equal; grid on
tip = [0, 0]; clrs = {'b','r'};
for k = 1:size(data,1)
    v = [data(k,1)*cosd(data(k,2)), data(k,1)*sind(data(k,2))];
    quiver(tip(1),tip(2), v(1),v(2), 0, clrs{k}, 'LineWidth',2, 'MaxHeadSize',0.4)
    tip = tip + v;
end
quiver(0,0, Rx,Ry, 0, 'm', 'LineWidth',2.5, 'MaxHeadSize',0.4)
title(sprintf('|R|=%.1f N at %.1f deg', mag, ang))
xlabel('x (N)'); ylabel('y (N)')`,
          prose: [
            `The \`add_vectors\` function accepts an $n \\times 2$ matrix: each row is one vector (magnitude, angle). The \`.*\` element-wise product computes all components at once; \`sum\` collapses each column. This is the DSMD method vectorised.`,
            `The \`for\` loop draws each vector tip-to-toe by advancing \`tip\` after each \`quiver\` call. The magenta arrow is the resultant drawn from the origin. \`sprintf\` formats the title with the computed magnitude and angle.`,
            `Extend \`data\` with a third row \`[50, 200]\` and re-run. The function and plot both adapt automatically — this is the power of the generalised form.`,
          ],
        },
        {
          cellTitle: 'Sign pitfall: angles below the horizontal',
          type: 'code',
          language: 'matlab',
          code: `F_mag = 30;

% Problem: "30 N at 40 degrees below the horizontal"
theta_correct = -40;    % correct: below +x axis
theta_wrong   = +40;    % common error: student ignores "below"

Fx_c = F_mag * cosd(theta_correct);
Fy_c = F_mag * sind(theta_correct);

Fx_w = F_mag * cosd(theta_wrong);
Fy_w = F_mag * sind(theta_wrong);

fprintf('Correct (theta=-40): Fx=%.4f, Fy=%.4f\\n', Fx_c, Fy_c)
fprintf('Wrong   (theta=+40): Fx=%.4f, Fy=%.4f\\n', Fx_w, Fy_w)
fprintf('Ry error: %.4f N\\n', abs(Fy_c - Fy_w))`,
          prose: [
            `"40° below the horizontal" in MATLAB means \`theta = -40\` (standard convention: counterclockwise from +x is positive). \`sind(-40) = -0.6428\`, giving $F_y = -19.28$ N — pointing south, as the problem requires.`,
            `Using \`+40\` flips the sign: $F_y = +19.28$ N, pointing north instead of south. This 38.56 N error in $R_y$ propagates through the entire DSMD calculation.`,
            `MATLAB's \`cosd\` and \`sind\` make degree input convenient, but they cannot fix a conceptual error. Always map the verbal description to a standard-convention angle BEFORE calling the trig functions.`,
          ],
        },
        {
          cellTitle: 'Challenge: satellite thruster net force',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Three thrusters fire simultaneously:
% 120 N at 0°, 80 N at 120°, 60 N at 250°
% Build the n×2 matrix and call add_vectors.

thrusters = [___, ___; ___, ___; ___, ___];
[net_mag, net_ang, Rx, Ry] = add_vectors(___);

fprintf('|F_net| = %.4f N\\n', net_mag)
fprintf('theta   = %.2f degrees\\n', net_ang)`,
          prose: [
            `\`thrusters = [120, 0; 80, 120; 60, 250]\`. Each row is one thruster: magnitude in column 1, angle in column 2. The 250° thruster is in Quadrant III — \`cosd(250°)\` and \`sind(250°)\` are both negative.`,
            `\`add_vectors(thrusters)\` runs DSMD on all three rows. Expected: $|\\vec{F}_{net}| \\approx 87.5$ N. Verify the x- and y-components match the hand calculation: $R_x \\approx 39$ N, $R_y \\approx 78$ N.`,
            `In real spacecraft software this calculation runs in a real-time control loop at 100 Hz. The MATLAB code you wrote is structurally identical — the difference is the hardware reading sensor values and sending commands.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-006-q1',
      type: 'choice',
      question: `What are the four steps of the DSMD method in order?`,
      options: [
        `Direction → Sum → Magnitude → Decompose`,
        `Decompose → Sum → Magnitude → Direction`,
        `Magnitude → Decompose → Direction → Sum`,
        `Sum → Decompose → Direction → Magnitude`,
      ],
      answer: `Decompose → Sum → Magnitude → Direction`,
      hints: [`Think about what you must do first: you can't sum until you've broken vectors into components.`, `The acronym is D-S-M-D.`],
      reviewSection: 'intuition',
      explanation: `Decompose each vector into components, Sum the components, find the Magnitude, find the Direction. DSMD.`,
    },
    {
      id: 'p1-ch1-006-q2',
      type: 'choice',
      question: `A vector has magnitude 25 N at 145°. What is its $x$-component?`,
      options: [`$+20.48$ N`, `$-20.48$ N`, `$+14.34$ N`, `$-14.34$ N`],
      answer: `$-20.48$ N`,
      hints: [`145° is in Quadrant II — what sign does $\\cos\\theta$ have there?`, `$\\cos(145°) = \\cos(180°-35°) = -\\cos(35°) \\approx -0.8192$`],
      reviewSection: 'examples',
      explanation: `$A_x = 25\\cos145° = 25(-0.8192) \\approx -20.48$ N. Quadrant II → negative x-component.`,
    },
    {
      id: 'p1-ch1-006-q3',
      type: 'choice',
      question: `After decomposing three vectors, you get $R_x = -4$ N and $R_y = -3$ N. What is $|\\vec{R}|$?`,
      options: [`$7$ N`, `$5$ N`, `$1$ N`, `$\\sqrt{7}$ N`],
      answer: `$5$ N`,
      hints: [`The magnitude formula uses squared components — signs don't matter here.`, `Is $(-4)^2 + (-3)^2$ a perfect square?`],
      reviewSection: 'examples',
      explanation: `$|\\vec{R}| = \\sqrt{(-4)^2+(-3)^2} = \\sqrt{25} = 5$ N. The 3-4-5 triple.`,
    },
    {
      id: 'p1-ch1-006-q4',
      type: 'choice',
      question: `Why is atan2 preferred over plain arctan for finding the angle?`,
      options: [
        `atan2 gives the answer in radians`,
        `arctan returns angles only in $(-90°, 90°)$; atan2 covers all four quadrants`,
        `atan2 is more accurate for large numbers`,
        `They give the same result always`,
      ],
      answer: `arctan returns angles only in $(-90°, 90°)$; atan2 covers all four quadrants`,
      hints: [`What happens to $\\arctan(R_y/R_x)$ when $R_x < 0$?`, `Both $(-3,-4)$ and $(3,4)$ give the same ratio $R_y/R_x$ to plain arctan.`],
      reviewSection: 'intuition',
      explanation: `$\\arctan(R_y/R_x)$ cannot distinguish Quadrant I from III, or II from IV. atan2$(R_y, R_x)$ uses both signs separately to return the correct quadrant.`,
    },
    {
      id: 'p1-ch1-006-q5',
      type: 'choice',
      question: `$\\vec{A} = (5, 3)$ and $\\vec{B} = (2, -1)$. What is $\\vec{A} - \\vec{B}$?`,
      options: [`$(3, 4)$`, `$(7, 2)$`, `$(3, 2)$`, `$(7, 4)$`],
      answer: `$(3, 4)$`,
      hints: [`Subtraction = adding the negative: $\\vec{A} + (-\\vec{B})$.`, `$-\\vec{B} = (-2, +1)$`],
      reviewSection: 'examples',
      explanation: `$\\vec{A} - \\vec{B} = (5-2, 3-(-1)) = (3, 4)$.`,
    },
    {
      id: 'p1-ch1-006-q6',
      type: 'choice',
      question: `The numerical component method for vector addition is:`,
      options: [
        `An approximation, accurate to 3 significant figures`,
        `Exact — it is the definition of vector addition in $\\mathbb{R}^2$`,
        `Only valid for right-angle problems`,
        `Less accurate than the parallelogram method`,
      ],
      answer: `Exact — it is the definition of vector addition in $\\mathbb{R}^2$`,
      hints: [`What is the formal definition of vector addition?`, `Where does any imprecision actually come from?`],
      reviewSection: 'rigor',
      explanation: `Component-wise addition is the formal definition: $(A_x+B_x, A_y+B_y)$. Any numerical error comes only from arithmetic rounding, not the method.`,
    },
    {
      id: 'p1-ch1-006-q7',
      type: 'choice',
      question: `$\\vec{F}_1 = 50$ N at $0°$ and $\\vec{F}_2 = 50$ N at $180°$. What is the resultant?`,
      options: [`$100$ N at $0°$`, `$0$ N`, `$50$ N at $90°$`, `$50\\sqrt{2}$ N`],
      answer: `$0$ N`,
      hints: [`$\\cos(180°) = -1$. What does $R_x = 50\\cos0° + 50\\cos180°$ equal?`, `These two forces are anti-parallel and equal.`],
      reviewSection: 'examples',
      explanation: `$R_x = 50(1) + 50(-1) = 0$, $R_y = 0$. Anti-parallel equal forces cancel completely.`,
    },
    {
      id: 'p1-ch1-006-q8',
      type: 'choice',
      question: `A force of magnitude $F$ is described as "40° below the horizontal." What angle should you use in the component formulas?`,
      options: [`$40°$`, `$-40°$`, `$140°$`, `$320°$`],
      answer: `$-40°$`,
      hints: [`Standard convention: counterclockwise from $+x$ is positive.`, `"Below" means clockwise from $+x$.`],
      reviewSection: 'intuition',
      explanation: `"Below horizontal" means the vector points into the fourth quadrant. Standard convention ($0°$ = east, CCW positive) gives $\\theta = -40°$, so $F_y = F\\sin(-40°) < 0$ as expected.`,
    },
    {
      id: 'p1-ch1-006-q9',
      type: 'choice',
      question: `Two forces have equal magnitude $F$ and act at $+\\alpha$ and $-\\alpha$ from $+x$. What is the magnitude of their resultant?`,
      options: [`$2F$`, `$2F\\cos\\alpha$`, `$2F\\sin\\alpha$`, `$F\\sqrt{2}$`],
      answer: `$2F\\cos\\alpha$`,
      hints: [`The y-components cancel by symmetry.`, `$R_x = F\\cos\\alpha + F\\cos(-\\alpha) = 2F\\cos\\alpha$`],
      reviewSection: 'challenges',
      explanation: `By symmetry $R_y = 0$ and $R_x = 2F\\cos\\alpha$, so $|\\vec{R}| = 2F\\cos\\alpha$.`,
    },
    {
      id: 'p1-ch1-006-q10',
      type: 'choice',
      question: `In the component table method, you get $R_x = 25$ N and $R_y = 8.66$ N. What quadrant is $\\vec{R}$ in?`,
      options: [`Quadrant II`, `Quadrant III`, `Quadrant IV`, `Quadrant I`],
      answer: `Quadrant I`,
      hints: [`Which quadrant has positive x AND positive y?`, `What does $\\arctan(8.66/25) \\approx 19.1°$ tell you?`],
      reviewSection: 'examples',
      explanation: `Both components are positive ($R_x > 0$, $R_y > 0$) → Quadrant I. The angle is $\\arctan(8.66/25) \\approx 19.1°$.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-006-m1',
      title: 'Adding magnitudes instead of using the component method',
      description: `Students write $|\\vec{R}| = |\\vec{A}| + |\\vec{B}|$ as if vectors were scalars. This is only correct when both vectors point in the same direction (0° angle between them).`,
      correctionExample: `For $\\vec{A} = 40$ N at $30°$ and $\\vec{B} = 25$ N at $145°$: adding magnitudes gives $65$ N. The correct DSMD answer is $37.1$ N — a 75% overestimate. The triangle inequality guarantees $|\\vec{R}| \\le |\\vec{A}| + |\\vec{B}|$, with equality only when the vectors are parallel.`,
    },
    {
      id: 'p1-ch1-006-m2',
      title: 'Using plain arctan and getting the wrong quadrant',
      description: `Students use $\\arctan(R_y / R_x)$ and ignore the signs of $R_x$ and $R_y$. Plain arctan only returns angles in $(-90°, 90°)$, so Quadrant II and III angles come out wrong.`,
      correctionExample: `If $R_x = -3$ N and $R_y = -4$ N: plain $\\arctan(-4/-3) = \\arctan(1.33) \\approx 53.1°$ (Quadrant I). The correct answer is $180° + 53.1° = 233.1°$ (Quadrant III). Using \`atan2(-4, -3)\` gives the correct answer directly.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-006-t1',
      prompt: `A bridge has three cable forces acting on a joint: 120 kN at 30°, 80 kN at 150°, and a vertical reaction $R_y$ downward. If the joint must be in equilibrium ($\\vec{R}_{net} = \\vec{0}$), use the DSMD method to find the required vertical reaction force.`,
    },
    {
      id: 'p1-ch1-006-t2',
      prompt: `A GPS logger records three legs of a hike in bearing format: 250 m at bearing 045° (NE), 180 m at bearing 135° (SE), 300 m at bearing 270° (W). Convert bearings to standard angles (bearing = 90° − standard), then apply DSMD to find the straight-line displacement home.`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-006-d1',
      title: 'Forgetting to convert degrees to radians before calling sin/cos',
      buggyCode: `import numpy as np
Ax = 40 * np.cos(30)   # wrong: treats 30 as radians
Ay = 40 * np.sin(30)   # cos(30 rad) ≈ 0.1543, not 0.8660`,
      explanation: `\`np.cos\` and \`np.sin\` take radians. \`np.cos(30)\` evaluates the cosine of 30 radians (≈ 0.154), not 30 degrees (≈ 0.866). This produces completely wrong components with no error message.`,
      fix: `Ax = 40 * np.cos(np.radians(30))   # correct: 34.64 N
Ay = 40 * np.sin(np.radians(30))   # correct: 20.00 N`,
    },
    {
      id: 'p1-ch1-006-d2',
      title: 'Using plain arctan and getting the wrong quadrant in Q-III',
      buggyCode: `Rx, Ry = -3.0, -4.0
theta = np.degrees(np.arctan(Ry / Rx))   # gives +53.1° (Q-I) — wrong!`,
      explanation: `When both components are negative (Quadrant III), $R_y/R_x = (-4)/(-3) = +1.33$, so plain arctan returns $+53.1°$ (Quadrant I). The actual angle is $53.1° + 180° = 233.1°$.`,
      fix: `theta = np.degrees(np.arctan2(Ry, Rx))   # gives -126.9° = 233.1° ← correct`,
    },
  ],

  mastery: {
    targetLevel: `Execute the DSMD method for any number of vectors: decompose (with correct sign convention), sum component columns, compute magnitude via Pythagorean theorem, find direction via atan2. Detect and avoid the two most common errors: magnitude addition and plain-arctan quadrant mistakes.`,
    prerequisites: [`Vector components (Lesson 3)`, `Tip-to-toe method (Lesson 5)`, `Trigonometry: sin, cos, arctan2`],
    enables: [`Subtracting vectors (Lesson 8)`, `Adding force vectors in statics (Lesson 9)`, `Dot product computation (Lesson 10)`],
    commonStuckPoints: [
      `Adding magnitudes directly instead of summing components`,
      `Forgetting to convert degrees to radians in code (or vice versa)`,
      `Using plain arctan and getting the wrong quadrant for Q-II and Q-III vectors`,
      `Incorrect sign for "below horizontal" angles`,
    ],
  },

  semantics: {
    core: [
      { symbol: `v_x = |\\vec{v}|\\cos\\theta`, meaning: `x-component of a vector given its magnitude and standard angle` },
      { symbol: `v_y = |\\vec{v}|\\sin\\theta`, meaning: `y-component of a vector given its magnitude and standard angle` },
      { symbol: `R_x = \\sum v_{kx}`, meaning: `Step 2 of DSMD: x-component of resultant = sum of all x-components` },
      { symbol: `|\\vec{R}| = \\sqrt{R_x^2 + R_y^2}`, meaning: `Step 3 of DSMD: resultant magnitude via Pythagorean theorem` },
      { symbol: `\\theta = \\operatorname{atan2}(R_y, R_x)`, meaning: `Step 4 of DSMD: four-quadrant direction angle` },
    ],
    rulesOfThumb: [
      `DSMD order is fixed: Decompose → Sum → Magnitude → Direction.`,
      `Always use atan2, never plain arctan, to find the angle of a vector.`,
      `Convert verbal angles ("below horizontal", "from north") to standard-convention angles before computing components.`,
      `Carry 4+ significant figures through intermediate steps; round only the final answer.`,
      `Check: is $|\\vec{R}|$ between $\\bigl||\\vec{A}|-|\\vec{B}|\\bigr|$ and $|\\vec{A}|+|\\vec{B}|$?`,
    ],
  },
}
