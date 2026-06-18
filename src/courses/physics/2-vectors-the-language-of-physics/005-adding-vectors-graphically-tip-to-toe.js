export default {
  id: 'p1-ch1-005',
  slug: 'adding-vectors-graphically-tip-to-toe',
  chapter: 'p1',
  order: 5,
  title: 'Adding Vectors Graphically — Tip-to-Toe Method',
  subtitle: 'Chain arrows end-to-end; the shortcut from start to finish is the sum.',
  tags: ['vector addition', 'tip-to-toe', 'head-to-tail', 'triangle method', 'polygon method'],
  aliases: 'head to tail triangle rule polygon chain of vectors',

  hook: {
    question: `You walk 3 km east, then 4 km north, then 2 km at 30°. What single displacement takes you from start to finish?`,
    realWorldContext: `Navigation, animation rigs, robot arm kinematics — any time you chain a sequence of moves, you need the tip-to-toe method. It scales to any number of vectors, unlike the parallelogram which only handles two at a time.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'vector-addition-chain' },
  },

  videos: [
    {
      title: 'Physics 1 – Vectors (6 of 21) Adding Vectors Graphically — Tip-to-Toe Method',
      embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
  ],

  intuition: {
    prose: [
      `You drive 3 km east, then turn and drive 4 km north. Before reading on, predict: what single arrow would take you straight from your starting point to where you are now? The direction is northeast, but is the distance 7 km, 5 km, or something else? Draw the two arrows as a right triangle — the hypotenuse is 5 km at 53° north of east.`,
      `The **tip-to-toe** (head-to-tail) method: place the tail of $\\vec{B}$ at the tip of $\\vec{A}$. The resultant $\\vec{R}$ is the arrow from the tail of $\\vec{A}$ to the tip of $\\vec{B}$. It is the "shortcut" that replaces the whole journey.`,
      `The method generalises to any number of vectors: $\\vec{R} = \\vec{A} + \\vec{B} + \\vec{C} + \\cdots$ — chain them in sequence and draw the closing arrow. The order does not change the endpoint. Any permutation of the chain lands at the same final point.`,
      `The key difference from the parallelogram method: vectors are placed **tip-to-tail** (not tail-to-tail). You lose the visual symmetry of the parallelogram but gain the ability to add three or more vectors in a single diagram.`,
    ],
    callouts: [
      {
        type: 'procedure',
        title: 'Tip-to-toe method — 3 steps',
        body: `1. Place \\vec{A} starting from the origin.\\quad 2. Place the tail of \\vec{B} at the tip of \\vec{A}, then \\vec{C} at the tip of \\vec{B}, and so on.\\quad 3. Draw \\vec{R} from the first tail to the last tip.`,
      },
      {
        type: 'definition',
        title: 'Tip-to-toe rule',
        body: 'Place vectors in a chain, each tail touching the previous tip. The resultant goes from the first tail to the last tip.',
      },
      {
        type: 'insight',
        title: 'Order independence',
        body: `$\\vec{A}+\\vec{B}+\\vec{C} = \\vec{B}+\\vec{A}+\\vec{C} = \\vec{C}+\\vec{A}+\\vec{B}$. Rearranging the chain changes the path but not the endpoint.`,
      },
      {
        type: 'warning',
        title: 'Tip-to-toe ≠ tail-to-tail',
        body: 'In the parallelogram method, tails are shared. In tip-to-toe, each tail connects to the previous tip. Mixing these up is the most common graphical error.',
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Chain arrows end-to-end',
        caption: 'Place the tail of B⃗ at the tip of A⃗, then the tail of C⃗ at the tip of B⃗. The shortcut from first tail to last tip is R⃗. The path shape changes with order; the endpoint never does.',
      },
      {
        id: 'VectorKinematicsLab',
        title: 'Tip-to-toe chain — 3 vectors',
        caption: `Place the tail of $\\vec{B}$ at the tip of $\\vec{A}$, then $\\vec{C}$ at the tip of $\\vec{B}$. The resultant $\\vec{R}$ is the arrow from the very first tail to the very last tip — the shortcut. The path shape changes with order; the endpoint never does.`,
      },
    ],
  },

  math: {
    prose: [
      'For $n$ vectors, the resultant is found by summing each set of components independently: $R_x = \\sum v_{kx}$ and $R_y = \\sum v_{ky}$. Each axis is treated as ordinary scalar arithmetic.',
      'This is why component methods (Lesson 6) are the practical tool: the graphical method gives insight, but arithmetic gives precision.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Sum of n vectors',
        body: `\\vec{R} = \\sum_{k=1}^{n} \\vec{v}_k \\implies R_x = \\sum_{k=1}^n v_{kx},\\quad R_y = \\sum_{k=1}^n v_{ky}`,
      },
      {
        type: 'insight',
        title: 'Closing the polygon',
        body: `If $\\vec{R} = \\vec{0}$, the tip of the last vector lands exactly on the tail of the first. The vectors form a closed polygon — the condition for static equilibrium.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Reorder the chain — same resultant',
        caption: `$R_x = \\sum v_{kx}$ and $R_y = \\sum v_{ky}$ are independent of order because real-number addition is commutative. Two different chain orderings, same closing arrow.`,
      },
    ],
  },

  rigor: {
    prose: [
      'Vector addition is both **commutative** ($\\vec{A}+\\vec{B}=\\vec{B}+\\vec{A}$) and **associative** ($(\\vec{A}+\\vec{B})+\\vec{C}=\\vec{A}+(\\vec{B}+\\vec{C})$). Together these two properties mean the order and grouping of a chain of vectors is irrelevant — any permutation or bracketing yields the same $\\vec{R}$.',
      'From an invariant viewpoint, the resultant $\\vec{R}$ is a geometric object: the arrow from the origin of the chain to its endpoint. Permuting the order changes which path the chain takes through space, but the start point and end point are fixed. The invariant is the displacement from start to finish, not the path.',
      'The closed-polygon condition ($\\vec{R} = \\vec{0}$) is the geometric statement of Newton\'s first law in static equilibrium: if a rigid body is in equilibrium, the vector sum of all external forces is zero. This is more than a coincidence — it is why vectors became the language of mechanics.',
      'In a vector space $V$, the tip-to-toe construction is the definition of addition for free vectors. Any two elements $\\vec{u}, \\vec{v} \\in V$ have a unique sum $\\vec{u}+\\vec{v}$ that satisfies the eight vector space axioms, two of which are precisely commutativity and associativity. The tip-to-toe diagram is the concrete realisation of those axioms in $\\mathbb{R}^2$.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Commutativity of vector addition',
        body: `\\vec{A}+\\vec{B} = \\vec{B}+\\vec{A}`,
      },
      {
        type: 'theorem',
        title: 'Associativity of vector addition',
        body: `(\\vec{A}+\\vec{B})+\\vec{C} = \\vec{A}+(\\vec{B}+\\vec{C})`,
      },
    ],
    proofSteps: [
      {
        expression: '\\vec{A} + \\vec{B} = (A_x+B_x,\\;A_y+B_y)',
        annotation: 'Component addition is the fundamental definition. We will show that swapping the order results in the same vector.',
      },
      {
        expression: '\\vec{B} + \\vec{A} = (B_x+A_x,\\;B_y+A_y)',
        annotation: 'Applying the same definition with A and B exchanged.',
      },
      {
        expression: 'A_x+B_x = B_x+A_x \\quad \\text{and} \\quad A_y+B_y = B_y+A_y',
        annotation: 'Ordinary real-number addition is commutative — each component satisfies this independently.',
      },
      {
        expression: '\\therefore \\vec{A} + \\vec{B} = \\vec{B} + \\vec{A}',
        annotation: 'Vector addition is commutative because it reduces to adding real numbers component-by-component, which is itself commutative.',
      },
    ],
    title: 'Proof: vector addition is commutative',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Commutativity — two chains, same endpoint',
        caption: `Left chain: $\\vec{A}$ then $\\vec{B}$. Right chain: $\\vec{B}$ then $\\vec{A}$. Both arrive at the same point $\\vec{A}+\\vec{B}$.`,
      },
    ],
  },

  examples: [
    {
      id: 'ch1-005-ex1',
      title: 'Three-vector chain — displacement problem',
      problem: `\\text{Displacements: } \\vec{A}=3\\,\\text{km east},\\; \\vec{B}=4\\,\\text{km north},\\; \\vec{C}=2\\,\\text{km at }30°. \\text{ Find the resultant.}`,
      steps: [
        { expression: 'A_x=3,\\;A_y=0', annotation: 'East → positive x. No y component.' },
        { expression: 'B_x=0,\\;B_y=4', annotation: 'North → positive y. No x component.' },
        { expression: 'C_x=2\\cos30°=\\sqrt{3}\\approx1.73\\;\\text{km},\\;C_y=2\\sin30°=1.00\\;\\text{km}', annotation: 'Decompose the angled vector using trig.' },
        { expression: 'R_x=3+0+1.73=4.73\\,\\text{km},\\;R_y=0+4+1.00=5.00\\,\\text{km}', annotation: 'Sum each component column independently.' },
        { expression: '|\\vec{R}|=\\sqrt{4.73^2+5.00^2}\\approx6.88\\,\\text{km}', annotation: 'Resultant magnitude via Pythagorean theorem.' },
        { expression: '\\theta=\\arctan(5.00/4.73)\\approx46.6°\\text{ north of east}', annotation: 'Direction from +x axis. Both components positive → Quadrant I.' },
      ],
      conclusion: 'The resultant displacement is $\\approx 6.88$ km at $46.6°$ north of east, regardless of the order you walk the three legs.',
    },
    {
      id: 'ch1-005-ex2',
      title: 'Zero resultant — closed polygon / equilibrium',
      problem: `\\text{Vectors } \\vec{A}=(3,0),\\;\\vec{B}=(0,4),\\;\\vec{C}=(-3,-4). \\text{ Show that } \\vec{A}+\\vec{B}+\\vec{C}=\\vec{0}.`,
      steps: [
        { expression: 'R_x = 3+0+(-3) = 0', annotation: 'x-components sum to zero — east and west cancel.' },
        { expression: 'R_y = 0+4+(-4) = 0', annotation: 'y-components sum to zero — north and south cancel.' },
        { expression: '\\vec{R}=(0,0)=\\vec{0}\\;\\checkmark', annotation: 'The three vectors form a closed triangle — the tip of C⃗ returns exactly to the tail of A⃗.' },
      ],
      conclusion: 'When vectors form a closed polygon, their sum is zero. This is the graphical condition for static equilibrium.',
    },
    {
      id: 'ch1-005-ex3',
      title: 'Four-force equilibrium check',
      problem: `\\text{Four forces: 10 N east, 8 N north, 6 N west, 4 N south. Find } \\vec{R}.`,
      steps: [
        { expression: 'R_x = 10 + 0 + (-6) + 0 = 4\\,N', annotation: 'East = +x, west = −x. Net east is 4 N.' },
        { expression: 'R_y = 0 + 8 + 0 + (-4) = 4\\,N', annotation: 'North = +y, south = −y. Net north is 4 N.' },
        { expression: '|\\vec{R}| = \\sqrt{4^2+4^2} = 4\\sqrt{2} \\approx 5.66\\,N', annotation: 'Equal x and y components → 45° NE direction.' },
        { expression: '\\theta = \\arctan(4/4) = 45°\\text{ NE}', annotation: 'The system is NOT in equilibrium — there is a net force of 5.66 N northeast.' },
      ],
      conclusion: 'The net force is $4\\sqrt{2}\\approx5.66$ N at $45°$ NE. To achieve equilibrium, a fifth force of $5.66$ N southwest (225°) would be needed.',
    },
  ],

  challenges: [
    {
      id: 'ch1-005-ch1',
      difficulty: 'easy',
      problem: '\\text{A robot moves: 5 m east, then 5 m north, then 5 m west. What is the resultant displacement?}',
      hint: 'Sum the x-components and y-components separately.',
      walkthrough: [
        { expression: 'R_x = 5 + 0 + (-5) = 0\\,\\text{m}', annotation: 'East and west legs cancel.' },
        { expression: 'R_y = 0 + 5 + 0 = 5\\,\\text{m}', annotation: 'Only the north leg contributes to y.' },
        { expression: '|\\vec{R}| = 5\\,\\text{m north}', annotation: 'The three-step journey is equivalent to a single 5 m step north.' },
      ],
      answer: '\\vec{R} = 5\\,\\text{m north}',
    },
    {
      id: 'ch1-005-ch2',
      difficulty: 'medium',
      problem: '\\text{Four forces act on a pin: 10 N east, 8 N at 90°, 6 N at 180°, 4 N at 270°. Find } \\vec{R}.',
      hint: '90° = north, 180° = west, 270° = south.',
      walkthrough: [
        { expression: 'R_x = 10+0+(-6)+0 = 4\\,N', annotation: 'East = +x, west = −x.' },
        { expression: 'R_y = 0+8+0+(-4) = 4\\,N', annotation: 'North = +y, south = −y.' },
        { expression: '|\\vec{R}|=\\sqrt{16+16}=4\\sqrt{2}\\approx5.66\\,N\\text{ at }45°', annotation: 'Equal x and y → 45° northeast.' },
      ],
      answer: `|\\vec{R}| = 4\\sqrt{2}\\,N\\text{ at }45°`,
    },
    {
      id: 'ch1-005-ch3',
      difficulty: 'hard',
      problem: `\\text{Three forces are in equilibrium. Two are known: } \\vec{F}_1=(5,0)\\,N \\text{ and } \\vec{F}_2=(-2,3)\\,N. \\text{ Find } \\vec{F}_3.`,
      hint: 'Equilibrium means $\\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 = \\vec{0}$. Solve for $\\vec{F}_3$.',
      walkthrough: [
        { expression: '\\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 = \\vec{0}', annotation: 'Equilibrium condition: the tip-to-toe chain must close.' },
        { expression: '\\vec{F}_3 = -(\\vec{F}_1 + \\vec{F}_2)', annotation: 'Rearrange — the third force is the negative of the partial sum.' },
        { expression: '\\vec{F}_1 + \\vec{F}_2 = (5-2,\\;0+3) = (3,\\;3)\\,N', annotation: 'Add the two known forces component-wise.' },
        { expression: '\\vec{F}_3 = (-3,\\;-3)\\,N,\\quad |\\vec{F}_3| = 3\\sqrt{2}\\approx4.24\\,N\\text{ at }225°', annotation: 'The third force points southwest, equal and opposite to the partial sum.' },
      ],
      answer: `\\vec{F}_3 = (-3,-3)\\,N`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Three-vector chain addition',
          type: 'code',
          language: 'python',
          code: `import numpy as np

A = np.array([3.0, 0.0])
B = np.array([0.0, 4.0])
C = np.array([2*np.cos(np.radians(30)), 2*np.sin(np.radians(30))])

R = A + B + C
print(f"A = {A}")
print(f"B = {B}")
print(f"C = {C.round(4)}")
print(f"R = A + B + C = {R.round(4)}")
print(f"|R| = {np.linalg.norm(R):.4f} km")
print(f"theta = {np.degrees(np.arctan2(R[1], R[0])):.2f} degrees north of east")`,
          prose: [
            `\`C = np.array([2*cos(30°), 2*sin(30°)])\` decomposes the angled vector: $C_x = 2\\cos30° \\approx 1.73$ km and $C_y = 2\\sin30° = 1.00$ km. This is the same trig from Lesson 3 — decompose before you add.`,
            `\`R = A + B + C\` applies the tip-to-toe rule in one line: NumPy adds element-by-element, so $R_x = A_x + B_x + C_x$ and $R_y = A_y + B_y + C_y$ happen simultaneously. No loop needed.`,
            `Expected output: $|\\vec{R}| \\approx 6.88$ km at $\\approx 46.6°$ north of east. Change the order to \`R = C + A + B\` and re-run — the result must be identical (commutativity).`,
          ],
        },
        {
          cellTitle: 'Visualise the chain and verify commutativity',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import itertools

A = np.array([3.0, 0.0])
B = np.array([0.0, 4.0])
C = np.array([2*np.cos(np.radians(30)), 2*np.sin(np.radians(30))])
vectors = [A, B, C]
labels  = ['A', 'B', 'C']
colors  = ['royalblue', 'darkorange', 'green']

fig, axes = plt.subplots(1, 2, figsize=(10, 4))
for ax, order in zip(axes, [(0,1,2), (2,0,1)]):
    tip = np.zeros(2)
    for i in order:
        v = vectors[i]
        ax.quiver(*tip, *v, angles='xy', scale_units='xy', scale=1,
                  color=colors[i], width=0.012, label=labels[i])
        tip = tip + v
    R = sum(vectors)
    ax.quiver(0, 0, *R, angles='xy', scale_units='xy', scale=1,
              color='crimson', width=0.015, label='R')
    order_str = '+'.join(labels[i] for i in order)
    ax.set_title(f'Order: {order_str}')
    ax.set_xlim(-0.5, 7); ax.set_ylim(-0.5, 6)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3); ax.legend()

plt.suptitle('Same red arrow (R) regardless of chain order')
plt.tight_layout()
plt.show()`,
          prose: [
            `The left plot chains A→B→C; the right chains C→A→B. Both draw the red resultant arrow from the origin — and it's identical in both panels. This is commutativity made visible: change the path, not the destination.`,
            `\`tip = np.zeros(2)\` tracks the current tail position as we chain vectors. Each iteration advances tip by the current vector before drawing the next one — this is exactly the tip-to-toe construction.`,
            `Try adding a 4th vector \`D = np.array([-1, 0.5])\` to the chain. The diagram extends to 4 arrows, and the resultant just shifts. Tip-to-toe scales to any number of vectors with no new steps.`,
          ],
        },
        {
          cellTitle: 'Closed polygon — equilibrium detection',
          type: 'code',
          language: 'python',
          code: `# Three vectors that close: R = 0
P = np.array([3.0,  0.0])
Q = np.array([0.0,  4.0])
S = np.array([-3.0, -4.0])

total = P + Q + S
print(f"P + Q + S = {total}")
print(f"Equilibrium (R = 0): {np.allclose(total, 0)}")

# Now perturb S slightly — breaks equilibrium
S_off = np.array([-3.0, -3.5])
total_off = P + Q + S_off
print(f"\\nWith S = {S_off}:")
print(f"Residual = {total_off}  (not zero)")
print(f"|Residual| = {np.linalg.norm(total_off):.4f} N")`,
          prose: [
            `\`np.allclose(total, 0)\` checks whether all components are within floating-point tolerance of zero. This is the numerical test for the closed-polygon (equilibrium) condition: $\\vec{P} + \\vec{Q} + \\vec{S} = \\vec{0}$.`,
            `The second block perturbs $\\vec{S}$ by 0.5 units — the chain no longer closes, and the residual is the unbalanced force. In statics, this residual tells you how far the system is from equilibrium and in which direction.`,
            `This pattern — compute sum, check if zero — is used in every structural analysis program. The computer doesn't draw parallelograms; it checks if the residual vector is smaller than some tolerance.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the missing equilibrium force',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# Two forces act on an object:
F1 = np.array([5.0, 0.0])    # 5 N east
F2 = np.array([-2.0, 3.0])   # given

# Find F3 such that F1 + F2 + F3 = 0 (equilibrium).
# Then compute its magnitude and angle.

F3 = ___           # one line
mag = ___
angle = ___

print(f"F3 = {F3}")
print(f"|F3| = {mag:.4f} N")
print(f"angle = {angle:.2f} degrees")`,
          prose: [
            `Equilibrium means $\\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 = \\vec{0}$, so $\\vec{F}_3 = -(\\vec{F}_1 + \\vec{F}_2)$. In NumPy: \`F3 = -(F1 + F2)\`. The negative sign flips both components — pointing southwest.`,
            `\`np.linalg.norm(F3)\` gives the magnitude; \`np.degrees(np.arctan2(F3[1], F3[0]))\` gives the angle. Expect $|\\vec{F}_3| = 3\\sqrt{2} \\approx 4.24$ N at $225°$ (southwest).`,
            `Verify: add all three and confirm the total is (very close to) zero. This is the standard structural equilibrium check — find the reaction force that balances a given load.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Three-vector chain addition',
          type: 'code',
          language: 'matlab',
          code: `A = [3, 0];
B = [0, 4];
C = [2*cosd(30), 2*sind(30)];    % cosd/sind take degrees directly

R = A + B + C;
fprintf('A = [%g, %g]\\n', A(1), A(2))
fprintf('B = [%g, %g]\\n', B(1), B(2))
fprintf('C = [%.4f, %.4f]\\n', C(1), C(2))
fprintf('R = [%.4f, %.4f]\\n', R(1), R(2))
fprintf('|R| = %.4f km\\n', norm(R))
fprintf('theta = %.2f degrees\\n', atan2d(R(2), R(1)))`,
          prose: [
            `\`cosd(30)\` and \`sind(30)\` take degree arguments directly — no \`deg2rad\` needed in MATLAB. This decomposition follows the Lesson 3 formulas: $C_x = 2\\cos30°$ and $C_y = 2\\sin30°$.`,
            `\`R = A + B + C\` is element-wise addition of row vectors. MATLAB handles this identically to NumPy: $R_x = A_x + B_x + C_x$ and $R_y = A_y + B_y + C_y$ in one statement.`,
            `Run \`R2 = C + A + B\` and confirm \`R2 == R\` (or use \`isequal\`). The output must be identical — vector addition is commutative regardless of programming language.`,
          ],
        },
        {
          cellTitle: 'Visualise the chain with quiver',
          type: 'code',
          language: 'matlab',
          code: `A = [3, 0]; B = [0, 4]; C = [2*cosd(30), 2*sind(30)];
vecs   = {A, B, C};
clrs   = {'b','r','g'};
orders = {[1 2 3], [3 1 2]};

figure
for p = 1:2
    subplot(1,2,p); hold on; axis equal; grid on
    tip = [0, 0];
    ord = orders{p};
    for k = 1:3
        v = vecs{ord(k)};
        quiver(tip(1),tip(2), v(1),v(2), 0, clrs{ord(k)}, ...
               'LineWidth',2, 'MaxHeadSize',0.4)
        tip = tip + v;
    end
    R = A + B + C;
    quiver(0,0, R(1),R(2), 0, 'm', 'LineWidth',2.5, 'MaxHeadSize',0.4)
    lbl = cellfun(@(i) ['F',num2str(i)], num2cell(ord), 'UniformOutput',false);
    title(['Order: ' strjoin(lbl,'+')])
    xlim([-0.5 7]); ylim([-0.5 6])
end
sgtitle('Same R (magenta) regardless of chain order')`,
          prose: [
            `\`subplot(1,2,p)\` creates side-by-side panels. \`tip\` tracks the tail position as each vector is drawn; it advances by the current vector before the next draw — this is the tip-to-toe construction in code.`,
            `Both panels show the same magenta resultant arrow. The path (blue→red→green vs. green→blue→red) differs but the endpoint is identical. This is the MATLAB visual proof of commutativity.`,
            `Add \`D = [-1, 0.5]\` to the chain and observe the resultant shift. Tip-to-toe requires no new conceptual steps for the 4th vector — just extend the chain by one more \`quiver\` call.`,
          ],
        },
        {
          cellTitle: 'Closed polygon — equilibrium detection',
          type: 'code',
          language: 'matlab',
          code: `P = [3, 0]; Q = [0, 4]; S = [-3, -4];

total = P + Q + S;
fprintf('P + Q + S = [%g, %g]\\n', total(1), total(2))
fprintf('Equilibrium: %d\\n', all(abs(total) < 1e-10))

% Perturb S — breaks equilibrium
S_off = [-3, -3.5];
total_off = P + Q + S_off;
fprintf('\\nWith S = [-3, -3.5]:\\n')
fprintf('Residual = [%g, %g]\\n', total_off(1), total_off(2))
fprintf('|Residual| = %.4f N\\n', norm(total_off))`,
          prose: [
            `\`all(abs(total) < 1e-10)\` is MATLAB's floating-point check for zero — equivalent to \`np.allclose(total, 0)\` in Python. Both test whether all components are within machine-epsilon of zero.`,
            `The perturbed \`S_off\` makes the chain fail to close. The residual vector $[0,\\; 0.5]$ is the gap between the last tip and the first tail — in statics, this is the unbalanced load that must be supported.`,
            `In MATLAB structural codes, this equilibrium check is called the "residual force" or "out-of-balance force." If it exceeds a tolerance, the solver iterates. You've just seen the core of a finite-element solve step.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the missing equilibrium force',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Two forces act on an object:
F1 = [5, 0];      % 5 N east
F2 = [-2, 3];     % given

% Find F3 such that F1 + F2 + F3 = [0, 0] (equilibrium).
F3    = ___;
mag   = ___;
angle = ___;

fprintf('F3 = [%g, %g]\\n', F3(1), F3(2))
fprintf('|F3| = %.4f N\\n', mag)
fprintf('angle = %.2f degrees\\n', angle)`,
          prose: [
            `Equilibrium: $\\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 = \\vec{0}$, so \`F3 = -(F1 + F2)\`. MATLAB's unary minus negates each component simultaneously.`,
            `\`norm(F3)\` gives the magnitude; \`atan2d(F3(2), F3(1))\` gives the angle in degrees. Expected: $|\\vec{F}_3| \\approx 4.24$ N at $225°$ (southwest).`,
            `Verify with \`norm(F1 + F2 + F3)\` — it should return (essentially) zero. This is the standard reaction-force calculation used in every structural statics program.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-005-q1',
      type: 'choice',
      question: `In the tip-to-toe method, where does the resultant arrow start and end?`,
      options: [
        `From the tip of the last vector to the tail of the first`,
        `From the tail of the first vector to the tip of the last`,
        `From the origin to the tip of the first vector`,
        `From the midpoint of the chain`,
      ],
      answer: `From the tail of the first vector to the tip of the last`,
      hints: [`Think of it as a shortcut.`, `You start where the first vector starts and end where the last vector ends.`],
      reviewSection: 'intuition',
      explanation: `The resultant is the "shortcut" from where you started (tail of $\\vec{A}$) to where you ended (tip of the last vector).`,
    },
    {
      id: 'p1-ch1-005-q2',
      type: 'choice',
      question: `Why is tip-to-toe preferred over the parallelogram method when adding three or more vectors?`,
      options: [
        `It is more accurate`,
        `The parallelogram method only works for two vectors at a time`,
        `Tip-to-toe does not require components`,
        `Parallelogram is harder to draw`,
      ],
      answer: `The parallelogram method only works for two vectors at a time`,
      hints: [`The parallelogram method requires a shared tail — how many vectors can share one tail?`, `Tip-to-toe just keeps extending the chain.`],
      reviewSection: 'intuition',
      explanation: `The parallelogram method produces a single resultant from exactly two vectors. Tip-to-toe chains any number in sequence.`,
    },
    {
      id: 'p1-ch1-005-q3',
      type: 'choice',
      question: `Three vectors are added in two different orders and the resultants are compared. What must be true?`,
      options: [
        `They are always different`,
        `They are equal — vector addition is commutative and associative`,
        `Only the magnitudes match; directions differ`,
        `Results differ unless all vectors are parallel`,
      ],
      answer: `They are equal — vector addition is commutative and associative`,
      hints: [`Commutativity: $\\vec{A}+\\vec{B} = \\vec{B}+\\vec{A}$.`, `The path of the chain changes, not the endpoint.`],
      reviewSection: 'rigor',
      explanation: `Commutativity ($\\vec{A}+\\vec{B}=\\vec{B}+\\vec{A}$) and associativity guarantee the same result regardless of order or grouping.`,
    },
    {
      id: 'p1-ch1-005-q4',
      type: 'choice',
      question: `When does the tip-to-toe diagram form a closed polygon?`,
      options: [
        `When all vectors have equal magnitudes`,
        `When the resultant is zero — the last tip returns to the first tail`,
        `When all vectors point in the same direction`,
        `When there are exactly three vectors`,
      ],
      answer: `When the resultant is zero — the last tip returns to the first tail`,
      hints: [`A closed polygon means start = end.`, `What does start = end mean for the resultant vector?`],
      reviewSection: 'math',
      explanation: `$\\vec{R} = \\vec{0}$ means the chain closes on itself — the condition for static equilibrium.`,
    },
    {
      id: 'p1-ch1-005-q5',
      type: 'choice',
      question: `A robot walks 5 m east, 5 m north, 5 m west. What is the resultant displacement?`,
      options: [`$5\\sqrt{2}$ m NE`, `$5$ m north`, `$15$ m`, `$0$ m`],
      answer: `$5$ m north`,
      hints: [`Sum x-components: $+5 + 0 - 5 = ?$`, `Sum y-components: $0 + 5 + 0 = ?$`],
      reviewSection: 'examples',
      explanation: `$R_x = 5+0-5 = 0$, $R_y = 0+5+0 = 5$ m. The east and west legs cancel; only the 5 m north leg remains.`,
    },
    {
      id: 'p1-ch1-005-q6',
      type: 'choice',
      question: `Displacements: $\\vec{A}=(3,0)$, $\\vec{B}=(0,4)$, $\\vec{C}=(-3,-4)$. What is $\\vec{A}+\\vec{B}+\\vec{C}$?`,
      options: [`$(6, 8)$`, `$(0, 0)$`, `$(3, 4)$`, `$(-3, -4)$`],
      answer: `$(0, 0)$`,
      hints: [`Add each component column: $R_x = 3+0-3$, $R_y = 0+4-4$.`, `What does this tell you about equilibrium?`],
      reviewSection: 'examples',
      explanation: `$R_x = 3+0-3=0$, $R_y = 0+4-4=0$. The three vectors form a closed triangle.`,
    },
    {
      id: 'p1-ch1-005-q7',
      type: 'choice',
      question: `The resultant of $n$ vectors $\\vec{v}_1, \\ldots, \\vec{v}_n$ is:`,
      options: [
        `$|\\vec{v}_1| + |\\vec{v}_2| + \\cdots + |\\vec{v}_n|$`,
        `$(\\sum v_{kx})\\hat{i} + (\\sum v_{ky})\\hat{j}$`,
        `The magnitude of the longest vector`,
        `The average of all vectors`,
      ],
      answer: `$(\\sum v_{kx})\\hat{i} + (\\sum v_{ky})\\hat{j}$`,
      hints: [`Each axis is independent — x-components add to give $R_x$, y-components to give $R_y$.`, `Magnitudes cannot simply be summed unless all vectors are parallel.`],
      reviewSection: 'math',
      explanation: `Vector addition is component-wise. Sum all $x$-components for $R_x$, all $y$-components for $R_y$.`,
    },
    {
      id: 'p1-ch1-005-q8',
      type: 'choice',
      question: `What is the key difference between the tip-to-toe and parallelogram methods?`,
      options: [
        `Tip-to-toe requires trigonometry; parallelogram does not`,
        `Parallelogram places tails together; tip-to-toe places each tail at the previous tip`,
        `They are identical methods with different names`,
        `Parallelogram works for any number of vectors`,
      ],
      answer: `Parallelogram places tails together; tip-to-toe places each tail at the previous tip`,
      hints: [`Where do the tails go in each method?`, `How does placement change what you can add?`],
      reviewSection: 'intuition',
      explanation: `Parallelogram: tails at the same point, diagonal is the sum. Tip-to-toe: chain tails to tips, closing arrow is the sum.`,
    },
    {
      id: 'p1-ch1-005-q9',
      type: 'choice',
      question: `Two forces are in equilibrium: $\\vec{F}_1 = (4,0)$ N and $\\vec{F}_2 = (0,3)$ N act alongside a third unknown $\\vec{F}_3$. What is $\\vec{F}_3$?`,
      options: [`$(4,3)$ N`, `$(-4,-3)$ N`, `$(0,0)$ N`, `$(-4,3)$ N`],
      answer: `$(-4,-3)$ N`,
      hints: [`Equilibrium: $\\vec{F}_1 + \\vec{F}_2 + \\vec{F}_3 = \\vec{0}$.`, `$\\vec{F}_3 = -(\\vec{F}_1 + \\vec{F}_2)$`],
      reviewSection: 'challenges',
      explanation: `$\\vec{F}_3 = -(4+0, 0+3) = (-4,-3)$ N. This force closes the polygon and achieves equilibrium.`,
    },
    {
      id: 'p1-ch1-005-q10',
      type: 'choice',
      question: `Which property guarantees that $\\vec{A}+(\\vec{B}+\\vec{C}) = (\\vec{A}+\\vec{B})+\\vec{C}$?`,
      options: [`Commutativity`, `Associativity`, `Distributivity`, `The triangle inequality`],
      answer: `Associativity`,
      hints: [`Commutativity is about order; this property is about grouping.`, `Re-read the rigor section definition.`],
      reviewSection: 'rigor',
      explanation: `Associativity: the grouping (bracketing) of addition does not matter. Together with commutativity, it means any order AND any grouping gives the same result.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-005-m1',
      title: 'The resultant depends on which order you chain the vectors',
      description: `Students draw the vectors in a specific order and believe changing the order changes the resultant. They may even re-do a problem when they accidentally draw $\\vec{B}$ before $\\vec{A}$.`,
      correctionExample: `For $\\vec{A} = (3,0)$ km and $\\vec{B} = (0,4)$ km: whether you chain A then B or B then A, the closing arrow is $\\vec{R} = (3,4)$ km with $|\\vec{R}| = 5$ km. The path traces a different shape but both endpoints are the same. Chain order only matters for the picture, never for $\\vec{R}$.`,
    },
    {
      id: 'p1-ch1-005-m2',
      title: 'Confusing the tip-to-toe rule with the parallelogram rule',
      description: `Students who just learned the parallelogram method place both tails at a common point when they should place each tail at the previous tip. The result looks like a parallelogram but is not the tip-to-toe chain.`,
      correctionExample: `Tip-to-toe for $\\vec{A} = (3,0)$ and $\\vec{B} = (0,4)$: place $\\vec{B}$'s tail at $(3,0)$ — the tip of $\\vec{A}$. Draw $\\vec{R}$ from $(0,0)$ to $(3,4)$. If you had placed both tails at the origin (parallelogram), you'd draw the diagonal — and get the same $\\vec{R}$, but by a different construction. The confusion is harmless for two vectors but breaks down for three or more.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-005-t1',
      prompt: `A ship's GPS logs three consecutive legs: 40 km north, 30 km at 60° NE, 20 km east. Use the tip-to-toe component method to find the straight-line distance and bearing from port to current position. Then check: could you have added these in a different order and reached the same answer?`,
    },
    {
      id: 'p1-ch1-005-t2',
      prompt: `In a robot arm, joint 1 extends 0.5 m east, joint 2 extends 0.3 m at 45° NE, joint 3 extends 0.2 m north. Where is the end effector relative to the base? If you reverse the joint order, does the tip (end effector) move?`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-005-d1',
      title: 'Adding magnitudes instead of component vectors',
      buggyCode: `A_mag = np.linalg.norm(A)
B_mag = np.linalg.norm(B)
R_mag = A_mag + B_mag   # wrong: 7.0 km instead of 5.0 km`,
      explanation: `This adds scalar magnitudes. It only gives the correct resultant when vectors are parallel. For A = (3,0) and B = (0,4), the correct answer is 5 km, not 7 km.`,
      fix: `R = A + B                        # add the vectors
R_mag = np.linalg.norm(R)       # then take the magnitude`,
    },
    {
      id: 'p1-ch1-005-d2',
      title: 'Drawing tail-to-tail instead of tip-to-tail',
      buggyCode: `# Student placed both A and B starting from (0,0):
# A goes to (3, 0), B goes to (0, 4)
# Then drew the diagonal from (0,0) to (3,4)
# — this is actually the parallelogram method, not tip-to-toe`,
      explanation: `Placing both tails at the origin is the parallelogram method. For two vectors it happens to give the same result, but for three or more it fails: after A and B, the tail of C must go at the tip of B, not back at the origin.`,
      fix: `# Tip-to-toe: track the current tip
tip = np.zeros(2)
for v in [A, B, C]:
    # draw arrow from tip to tip+v
    tip = tip + v
# resultant: from (0,0) to final tip`,
    },
  ],

  mastery: {
    targetLevel: `Apply the tip-to-toe method to add any number of vectors: decompose each into components, sum all x-components and all y-components, compute magnitude and direction of the resultant. Detect the equilibrium condition ($\\vec{R} = \\vec{0}$) and find a missing equilibrium force.`,
    prerequisites: [`Vector components and magnitudes (Lesson 3)`, `Parallelogram method (Lesson 4)`],
    enables: [`Numerical vector addition (Lesson 6)`, `Adding force vectors (Lesson 9)`, `Static equilibrium (Statics chapter)`],
    commonStuckPoints: [
      `Adding magnitudes instead of components for non-parallel vectors`,
      `Confusing tip-to-toe with tail-to-tail (parallelogram)`,
      `Forgetting that commutativity means order never affects the resultant`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\vec{R} = \\sum_{k=1}^n \\vec{v}_k`, meaning: `Resultant — closing arrow from first tail to last tip in the chain` },
      { symbol: `R_x = \\sum v_{kx}`, meaning: `x-component of resultant = sum of all x-components` },
      { symbol: `R_y = \\sum v_{ky}`, meaning: `y-component of resultant = sum of all y-components` },
      { symbol: `\\vec{R} = \\vec{0}`, meaning: `Equilibrium condition — the tip-to-toe chain forms a closed polygon` },
      { symbol: `\\vec{A}+\\vec{B} = \\vec{B}+\\vec{A}`, meaning: `Commutativity — chain order does not change the resultant` },
    ],
    rulesOfThumb: [
      `Always decompose into components before adding — never add magnitudes directly.`,
      `Tip-to-toe: place each tail at the previous tip; resultant runs from first tail to last tip.`,
      `Any order of the chain gives the same resultant (commutativity).`,
      `If the chain closes ($\\vec{R} = \\vec{0}$), the system is in equilibrium.`,
      `To find a missing equilibrium force: $\\vec{F}_n = -(\\vec{F}_1 + \\cdots + \\vec{F}_{n-1})$.`,
    ],
  },
}
