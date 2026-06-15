export default {
  id: 'p1-ch1-012',
  slug: 'dot-product-orthogonality',
  chapter: 'p1',
  order: 12,
  title: 'Dot Product — Orthogonality',
  subtitle: 'Zero dot product = perpendicular vectors. The cleanest test in all of physics.',
  tags: ['dot product', 'orthogonality', 'perpendicular', 'zero work', 'normal vector'],
  aliases: 'orthogonal perpendicular dot product zero normal vector',

  hook: {
    question: 'Gravity pulls a block down the floor of a level table. How much work does gravity do? And why is the answer obvious once you think in vectors?',
    realWorldContext:
      `The normal force of a table always points perpendicular to the surface. The block's velocity along the surface is always perpendicular to the normal force. So the normal force does zero work — always — because perpendicular vectors have zero dot product. This is not a coincidence; it is a theorem. And the dot product test for perpendicularity is the simplest and most powerful tool for detecting it in any dimension.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'dot-product-projection' },
  },

  videos: [{
    title: 'Physics 1 – Vectors (14 of 21) Dot Product: Orthogonality and Perpendicularity',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      `$\\vec{A} = (3, 4)$ and $\\vec{B} = (4, -3)$. Before reading on, predict: are these vectors perpendicular? Compute $\\vec{A}\\cdot\\vec{B} = (3)(4) + (4)(-3)$ mentally and check your prediction below.`,

      `We know $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. When $\\phi = 90°$, $\\cos90° = 0$, so $\\vec{A}\\cdot\\vec{B} = 0$ exactly. The prediction above gives $12 - 12 = 0$ — yes, perpendicular. This is the most important perpendicularity test in mathematics: **two non-zero vectors are perpendicular if and only if their dot product is zero**.`,

      `Why is this powerful? Because you don't need to measure any angle. You don't need to sketch anything. You just compute $A_xB_x + A_yB_y + A_zB_z$ and check if it's zero. This works in any dimension — even in 10-dimensional space where you can't draw a picture.`,

      'This shows up everywhere in physics:',
      `**Normal force ⊥ surface motion** → normal force does zero work on a sliding object.`,
      `**Centripetal force ⊥ velocity** → centripetal force does zero work in circular motion. The speed stays constant — only the direction changes. This is exactly why.`,
      `**Magnetic force ⊥ velocity** → the magnetic force $\\vec{F} = q\\vec{v}\\times\\vec{B}$ is always perpendicular to $\\vec{v}$, so it changes direction but never speed.`,

      `A practical skill: **given $\\vec{A}$, find a vector perpendicular to it**. In 2D, the recipe is trivial: if $\\vec{A} = (A_x, A_y)$, then $\\vec{A}^\\perp = (-A_y, A_x)$ is always perpendicular to $\\vec{A}$. Verify: $\\vec{A}\\cdot\\vec{A}^\\perp = A_x(-A_y) + A_y(A_x) = -A_xA_y + A_xA_y = 0$. ✓ In 3D this becomes the cross product — the next chapter.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Orthogonality condition',
        body:
          '\\vec{A}\\perp\\vec{B} \\iff \\vec{A}\\cdot\\vec{B} = 0 \\quad (\\text{for non-zero }\\vec{A}, \\vec{B})',
      },
      {
        type: 'insight',
        title: 'The three regimes of the dot product',
        body:
          `$\\vec{A}\\cdot\\vec{B} > 0 \\Rightarrow$ acute angle ($\\phi < 90°$)\n$\\vec{A}\\cdot\\vec{B} = 0 \\Rightarrow$ right angle ($\\phi = 90°$) — orthogonal\n$\\vec{A}\\cdot\\vec{B} < 0 \\Rightarrow$ obtuse angle ($\\phi > 90°$)`,
      },
      {
        type: 'insight',
        title: 'Finding a perpendicular vector in 2D',
        body:
          `If $\\vec{A}=(A_x,A_y)$, then $(-A_y,\\,A_x)$ is perpendicular to $\\vec{A}$. Check: $A_x(-A_y)+A_y(A_x)=0$ ✓. This is simply a 90° counter-clockwise rotation.`,
      },
      {
        type: 'warning',
        title: 'The zero vector is trivially orthogonal to everything',
        body:
          `$\\vec{0}\\cdot\\vec{B} = 0$ for any $\\vec{B}$. But "orthogonal" requires both vectors to be non-zero — the zero vector has no direction, so "perpendicular to zero" is meaningless geometrically.`,
      },
      {
        type: 'procedure',
        title: 'Test and use orthogonality',
        body: `1. **Test:** Compute $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$. Zero → perpendicular; non-zero → not perpendicular\n2. **Find perp in 2D:** Given $\\vec{A}=(A_x,A_y)$, the perpendicular is $(-A_y, A_x)$\n3. **Solve for unknown component:** Set $\\vec{A}\\cdot\\vec{B}=0$ as an equation and solve for the unknown`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Zero projection = zero dot product = perpendicular',
        caption:
          `When $\\phi = 90°$, the projection of $\\vec{B}$ onto $\\vec{A}$ has length zero. Dot product = (projection length) × |A| = 0. This is the exact algebraic test for perpendicularity.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Dot product crosses zero at 90°',
        caption: `Rotate one vector slowly through 360°. The dot product crosses zero at exactly 90° and 270°.`,
      },
    ],
  },

  math: {
    prose: [
      `To test if two vectors are orthogonal: compute $\\vec{A}\\cdot\\vec{B} = A_xB_x+A_yB_y+A_zB_z$. If the result is zero: orthogonal. If non-zero: not orthogonal.`,
      `To find a vector $\\vec{B}$ orthogonal to a given $\\vec{A}$: solve $\\vec{A}\\cdot\\vec{B} = 0$ as a constraint. In 2D this has a one-parameter family of solutions (all multiples of $(-A_y, A_x)$). In 3D there is a two-parameter family — a whole plane of perpendicular vectors.`,
      `The **normal vector** to a surface is the vector perpendicular to every vector lying in the surface. It points "out of" the surface. The dot product test confirms a given vector $\\vec{n}$ is normal to surface vector $\\vec{s}$: just check $\\vec{n}\\cdot\\vec{s}=0$.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Basis orthonormality',
        body:
          `\\hat{\\imath}\\cdot\\hat{\\jmath}=0,\\quad \\hat{\\jmath}\\cdot\\hat{k}=0,\\quad \\hat{k}\\cdot\\hat{\\imath}=0\\n\\hat{\\imath}\\cdot\\hat{\\imath}=1,\\quad \\hat{\\jmath}\\cdot\\hat{\\jmath}=1,\\quad \\hat{k}\\cdot\\hat{k}=1`,
      },
      {
        type: 'insight',
        title: 'Why does zero work matter so much?',
        body:
          `If $\\vec{F}\\perp\\vec{d}$, then $W = \\vec{F}\\cdot\\vec{d} = 0$ — the force transfers no energy. This is why a satellite in circular orbit stays at constant altitude: gravity is always centripetal (toward centre), velocity is always tangential, they're perpendicular, so gravity does zero net work over one orbit.`,
      },
    ],
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Orthogonality test — the zero dot product',
      caption: `$\\vec{A}\\cdot\\vec{B} = 0$ if and only if $\\vec{A}\\perp\\vec{B}$ (assuming neither is the zero vector). The projection of one onto the other is exactly zero — no overlap.`,
    }],
  },

  rigor: {
    prose: [
      `The basis $\\{\\hat{\\imath}, \\hat{\\jmath}, \\hat{k}\\}$ is called **orthonormal**: mutually orthogonal (dot products of different basis vectors = 0) and each normalised (dot product with itself = 1). This is written compactly as $\\hat{e}_i \\cdot \\hat{e}_j = \\delta_{ij}$ where $\\delta_{ij}$ is the Kronecker delta (1 if $i=j$, 0 otherwise).`,
      `Orthonormal bases make decomposition automatic: when you expand a vector in an orthonormal basis, the components are extracted by taking dot products: $A_i = \\vec{A}\\cdot\\hat{e}_i$. For the standard basis, $A_x = \\vec{A}\\cdot\\hat{\\imath}$, $A_y = \\vec{A}\\cdot\\hat{\\jmath}$, $A_z = \\vec{A}\\cdot\\hat{k}$. You will use this constantly in Quantum Mechanics (projecting onto eigenstates) and Fourier Analysis (projecting onto frequency components).`,
      `A set of $n$ mutually orthogonal vectors in $\\mathbb{R}^n$ always spans the space and is automatically linearly independent. This is the basis of Principal Component Analysis (PCA) in data science: find $n$ orthogonal directions that best describe the data. The orthogonality test is $\\vec{u}_i\\cdot\\vec{u}_j = 0$ for $i \\ne j$ — the same formula.`,
      `The 2D perpendicular formula $\\vec{A}^\\perp = (-A_y, A_x)$ is the same as multiplying $\\vec{A}$ by the rotation matrix $R(90°)$. In general, any linear transformation that preserves all dot products (an isometry) also preserves all orthogonality relationships. Such transformations are called **orthogonal matrices** — another central concept of Linear Algebra.`,
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Kronecker delta notation',
        body:
          `$\\hat{e}_i\\cdot\\hat{e}_j = \\delta_{ij}$ where $\\delta_{ij} = 1$ if $i=j$, else $0$. This one formula replaces all six basis dot product rules at once: self-dots = 1, cross-dots = 0.`,
      },
      {
        type: 'insight',
        title: 'Extracting components using the dot product',
        body:
          `If $\\{\\hat{e}_i\\}$ is an orthonormal basis: $A_i = \\vec{A}\\cdot\\hat{e}_i$. For our standard basis: $A_x = \\vec{A}\\cdot\\hat{\\imath}$, $A_y = \\vec{A}\\cdot\\hat{\\jmath}$, etc. The dot product "reads off" one component at a time.`,
      },
    ],
    proofSteps: [
      {
        title: 'Orthogonality means 90°',
        expression: '\\phi = 90° \\Rightarrow \\cos\\phi = 0',
        annotation: 'At 90°, the cosine is exactly zero.',
      },
      {
        title: 'Substitute into dot product formula',
        expression: '\\vec{A}\\cdot\\vec{B} = |A||B|\\cos90° = |A||B|\\times0 = 0',
        annotation: 'Zero cosine makes the entire dot product zero.',
      },
      {
        title: 'Component confirmation',
        expression: '\\vec{A}=(A_x,A_y),\\quad\\vec{A}^\\perp=(-A_y,A_x)',
        annotation: 'The 90° rotation formula gives a vector perpendicular to A.',
      },
      {
        title: 'Verify by dot product',
        expression: '\\vec{A}\\cdot\\vec{A}^\\perp = A_x(-A_y)+A_y(A_x) = -A_xA_y+A_xA_y = 0\\;\\checkmark',
        annotation: 'Dot product is exactly zero — confirmed perpendicular.',
      },
    ],
    title: 'Orthogonality: geometric fact, algebraic test',
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Orthonormality of basis vectors',
      caption: `$\\hat{i}\\cdot\\hat{j} = 0$, $\\hat{i}\\cdot\\hat{k} = 0$, $\\hat{j}\\cdot\\hat{k} = 0$. The three basis vectors are mutually perpendicular — that is what "ortho-" means in orthonormal.`,
    }],
  },

  examples: [
    {
      id: 'ch1-012-ex1',
      title: 'Check orthogonality',
      problem: '\\text{Are }\\vec{A}=(3,4)\\text{ and }\\vec{B}=(-4,3)\\text{ orthogonal?}',
      steps: [
        { expression: '\\vec{A}\\cdot\\vec{B}=(3)(-4)+(4)(3)=-12+12=0', annotation: 'Component dot product.' },
        { expression: 'Result = 0 \\Rightarrow \\vec{A}\\perp\\vec{B}', annotation: 'Zero dot product confirms perpendicularity.' },
      ],
      conclusion:
        `Yes, orthogonal. Note that $|\\vec{A}|=5$ and $|\\vec{B}|=5$ — both are 5. $(-4,3)$ is just $(3,4)$ rotated 90°.`,
    },
    {
      id: 'ch1-012-ex2',
      title: 'Normal force does zero work',
      problem:
        `\\text{A block slides along a horizontal floor with velocity }\\vec{v}=(4,0)\\,m/s. \\text{The normal force is }\\vec{N}=(0,98)\\,N. \\text{What power does the normal force deliver to the block?}`,
      steps: [
        {
          expression: 'P = \\vec{F}\\cdot\\vec{v} = \\vec{N}\\cdot\\vec{v} = (0)(4)+(98)(0) = 0\\,\\text{W}',
          annotation: 'Power = force · velocity. Normal force is perpendicular to velocity → zero power.',
        },
      ],
      conclusion:
        `$P=0\\,\\text{W}$. The normal force does zero work and delivers zero power — always, for any surface. This is why a table can hold up a block indefinitely without expending energy.`,
    },
    {
      id: 'ch1-012-ex3',
      title: 'Find the unknown component for perpendicularity',
      problem: '\\text{Find }k\\text{ such that }\\vec{A}=(k,\\,3,\\,-1)\\text{ is perpendicular to }\\vec{B}=(2,\\,-1,\\,4).',
      steps: [
        {
          expression: '\\vec{A}\\cdot\\vec{B} = 2k + 3(-1) + (-1)(4) = 2k - 3 - 4 = 2k - 7',
          annotation: 'Apply the component formula. Leave $k$ as a symbol.',
        },
        {
          expression: '2k - 7 = 0 \\Rightarrow k = 3.5',
          annotation: 'Set the dot product equal to zero (perpendicularity condition) and solve.',
        },
        {
          expression: '\\vec{A}\\cdot\\vec{B} = (3.5)(2) + (3)(-1) + (-1)(4) = 7 - 3 - 4 = 0 \\;\\checkmark',
          annotation: 'Verify: substituting $k=3.5$ gives zero. Confirmed perpendicular.',
        },
      ],
      conclusion: '$k = 3.5$. The strategy: write the dot product with the unknown as a symbol, set it to zero, and solve the resulting linear equation.',
    },
  ],

  challenges: [
    {
      id: 'ch1-012-ch1',
      difficulty: 'easy',
      problem: '\\text{Find }k\\text{ such that }\\vec{A}=(k,2)\\text{ is orthogonal to }\\vec{B}=(3,-6).',
      hint: 'Set $\\vec{A}\\cdot\\vec{B}=0$: $3k+2(-6)=0$. Solve for $k$.',
      walkthrough: [
        { expression: '3k+2(-6)=3k-12=0', annotation: 'Dot product = 0 condition.' },
        { expression: 'k=4', annotation: 'So $(4,2)\\cdot(3,-6) = 12-12=0$ ✓.' },
      ],
      answer: 'k=4',
    },
    {
      id: 'ch1-012-ch2',
      difficulty: 'medium',
      problem:
        `\\text{A slope makes 30° with horizontal. The normal to the slope points at }120°.\\text{ A ball rolls down the slope with velocity at }210°.\\text{ Show the normal force does zero work.}`,
      hint:
        `Normal force $\\vec{N}$ is at 120°, velocity $\\vec{v}$ is at 210°. Angle between them = 210° − 120° = 90°. Check via dot product.`,
      walkthrough: [
        { expression: '\\hat{n}=(\\cos120°,\\sin120°)=(-0.5,\\;0.866)', annotation: 'Unit normal vector.' },
        { expression: '\\hat{v}=(\\cos210°,\\sin210°)=(-0.866,\\;-0.5)', annotation: 'Unit velocity vector.' },
        { expression: '\\hat{n}\\cdot\\hat{v}=(-0.5)(-0.866)+(0.866)(-0.5)=0.433-0.433=0', annotation: 'Dot product = 0 → orthogonal → zero work.' },
      ],
      answer: `\\vec{N}\\perp\\vec{v}\\Rightarrow W=0\\;\\forall\\text{ slopes}`,
    },
    {
      id: 'ch1-012-ch3',
      difficulty: 'hard',
      problem:
        `\\text{Three vectors: }\\vec{u}=(1,0,1),\\;\\vec{v}=(0,1,0).\\text{ Find all vectors }\\vec{w}=(a,b,c)\\text{ that are orthogonal to both }\\vec{u}\\text{ and }\\vec{v}\\text{ with }|\\vec{w}|=\\sqrt{2}.`,
      hint: 'Two orthogonality conditions: $\\vec{u}\\cdot\\vec{w}=0$ and $\\vec{v}\\cdot\\vec{w}=0$. Each gives one equation. Use the magnitude condition to fix the remaining freedom.',
      walkthrough: [
        { expression: '\\vec{u}\\cdot\\vec{w}=a+c=0 \\Rightarrow c=-a', annotation: 'First constraint from $\\vec{u}\\perp\\vec{w}$.' },
        { expression: '\\vec{v}\\cdot\\vec{w}=b=0 \\Rightarrow b=0', annotation: 'Second constraint from $\\vec{v}\\perp\\vec{w}$.' },
        { expression: '|\\vec{w}|^2 = a^2+0^2+(-a)^2 = 2a^2 = 2 \\Rightarrow a=\\pm1', annotation: 'Magnitude condition fixes $|a|=1$.' },
        { expression: '\\vec{w} = \\pm(1,0,-1)', annotation: 'Two solutions, both unit vectors scaled by $\\sqrt{2}$.' },
      ],
      answer: '\\vec{w} = (1,0,-1)\\text{ or }(-1,0,1)',
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Testing orthogonality — the zero dot product',
          type: 'code',
          language: 'python',
          code: `import numpy as np

def are_orthogonal(A, B, tol=1e-9):
    return np.isclose(np.dot(A, B), 0, atol=tol)

# Test several pairs
pairs = [
    (np.array([3, 4]),    np.array([-4, 3]),    "(-4,3) is (3,4) rotated 90°"),
    (np.array([1, 0]),    np.array([0, 1]),      "i-hat and j-hat"),
    (np.array([3, 4]),    np.array([3, 4]),      "same vector — never orthogonal to itself"),
    (np.array([1, 2, 3]), np.array([1, -5, 3]), "3D vectors"),
]

for A, B, label in pairs:
    dot = np.dot(A, B)
    print(f"{label}")
    print(f"  A·B = {dot:.4f},  orthogonal = {are_orthogonal(A, B)}")
    print()`,
          prose: [
            `\`np.isclose(np.dot(A, B), 0)\` is the correct orthogonality test — never use \`== 0\` with floating-point arithmetic. \`np.dot\` computes $A_xB_x + A_yB_y + A_zB_z$ and the result should be zero if the vectors are truly perpendicular.`,
            `The function works in any dimension: 2D, 3D, or beyond. The dot product formula $\\sum_i A_iB_i$ has the same meaning in all dimensions — it's still the "how much overlap?" question.`,
            `Note: a non-zero vector dotted with itself always gives $|\\vec{A}|^2 > 0$. No non-zero vector is orthogonal to itself. That should fail the test above — confirming the math is correct.`,
          ],
        },
        {
          cellTitle: 'Visualising perpendicular vectors — 2D rotation trick',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import numpy as np

def perp_2d(A):
    return np.array([-A[1], A[0]])   # 90° CCW rotation

test_vecs = [np.array([3.0, 4.0]), np.array([2.0, -1.0]), np.array([-1.0, 2.0])]

print("Perpendicular pairs:")
for A in test_vecs:
    Ap = perp_2d(A)
    dot = np.dot(A, Ap)
    print(f"  A={A}, A⊥={Ap}, A·A⊥={dot:.4f}")

# Plot the first pair
fig, ax = plt.subplots(figsize=(5, 5))
A  = np.array([3.0, 4.0])
Ap = perp_2d(A)
for v, c, lbl in [(A, 'steelblue', 'A=(3,4)'), (Ap, 'tomato', 'A⊥=(-4,3)')]:
    ax.quiver(0, 0, v[0], v[1], angles='xy', scale_units='xy', scale=1,
              color=c, width=0.05)
    ax.text(v[0]*1.1, v[1]*1.1, lbl, color=c, fontsize=11, fontweight='bold')
ax.set_xlim(-6, 5); ax.set_ylim(-5, 5.5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.set_title(f"A·A⊥ = {np.dot(A, Ap):.0f}  (perpendicular)")
plt.tight_layout(); plt.show()`,
          prose: [
            `\`perp_2d(A) = [-A[1], A[0]]\` rotates the vector 90° counter-clockwise. Check: $(A_x)(-A_y) + (A_y)(A_x) = -A_xA_y + A_xA_y = 0$ — always zero.`,
            `The plot shows $\\vec{A}=(3,4)$ and $\\vec{A}^\\perp=(-4,3)$ at a visible right angle. Both have magnitude 5 — the rotation doesn't change the length, only the direction.`,
            `This formula is the 2D special case of the cross product: in 3D, you'd use $\\vec{A}\\times\\hat{k}$ to get the perpendicular in the $xy$-plane. The 2D trick is just a shortcut.`,
          ],
        },
        {
          cellTitle: 'Zero work — centripetal force and circular motion',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

# Object in circular motion: position angle theta
# velocity is tangential (perpendicular to position)
# centripetal force is radial (points toward centre = -position direction)

thetas = np.linspace(0, 2*np.pi, 360)
works = []

for theta in thetas:
    # Position on circle of radius 5
    pos = np.array([5*np.cos(theta), 5*np.sin(theta)])
    # Velocity: tangential, 90° from position
    vel = np.array([-np.sin(theta), np.cos(theta)])  # unit tangent
    # Centripetal force: toward centre = -pos direction
    F_c = -pos / np.linalg.norm(pos)   # unit centripetal
    work = np.dot(F_c, vel)
    works.append(work)

print(f"Max |work| over full circle: {max(abs(w) for w in works):.2e}")
print("All essentially zero — centripetal force does NO work.")

# Visualise at one point
theta = np.pi / 4   # 45°
pos = np.array([5*np.cos(theta), 5*np.sin(theta)])
vel = np.array([-np.sin(theta), np.cos(theta)])
F_c = -pos / np.linalg.norm(pos)

print(f"\\nAt θ=45°: F_c·v = {np.dot(F_c, vel):.4f}")
print(f"Angle between F_c and v: {np.degrees(np.arccos(np.dot(F_c, vel))):.1f}°")`,
          prose: [
            `At every angle $\\theta$, the centripetal force $\\vec{F}_c = -\\hat{r}$ points inward (toward centre) while the velocity $\\vec{v} = \\hat{\\theta}$ is tangential. These are always perpendicular — $\\hat{r}\\cdot\\hat{\\theta} = \\cos\\theta(-\\sin\\theta)+\\sin\\theta(\\cos\\theta) = 0$ for all $\\theta$.`,
            `The loop confirms that $\\vec{F}_c \\cdot \\vec{v} = 0$ at every point in the orbit — not just at $45°$ but all the way around. This is why the speed of an object in circular motion is constant: zero work means no change in kinetic energy.`,
            `The maximum numerical value is essentially machine epsilon ($\\approx 10^{-16}$) — the tiny rounding errors from floating-point arithmetic, not physics. This confirms the analytical result: the work is mathematically exactly zero.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the unknown component',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# Find the value of k such that A = (k, 3, -1) is orthogonal to B = (2, -1, 4)
# Step 1: write the dot product as a function of k
# dot(A, B) = k*(2) + 3*(-1) + (-1)*(4) = 2k - 3 - 4 = 2k - 7
# Step 2: set equal to zero and solve: 2k - 7 = 0

# k_value = ___

# Verify: create A = [k_value, 3, -1] and check np.dot(A, B) == 0
# B = np.array([2, -1, 4])
# A = np.array([k_value, 3, -1])
# print(f"k = {k_value}, A·B = {np.dot(A, B):.4f}")`,
          prose: [
            `The orthogonality condition $\\vec{A}\\cdot\\vec{B} = 0$ becomes a linear equation in $k$: $2k - 7 = 0$. This is how you "design" perpendicular vectors — set up the dot product equation and solve.`,
            `Expected: $k = 3.5$. Verify with $\\vec{A} = (3.5, 3, -1)$ and $\\vec{B} = (2, -1, 4)$: $2(3.5)+3(-1)+(-1)(4) = 7-3-4 = 0$.`,
            `This pattern — "solve for an unknown to make a dot product zero" — appears throughout physics when you need to find directions perpendicular to a given constraint.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Testing orthogonality in MATLAB',
          type: 'code',
          language: 'matlab',
          code: `function result = are_orthogonal(A, B, tol)
    if nargin < 3; tol = 1e-9; end
    result = abs(dot(A, B)) < tol;
end

% Test several pairs
pairs = {[3,4], [-4,3],  '(-4,3) rotated 90 from (3,4)'; ...
         [1,0], [0,1],   'i-hat and j-hat'; ...
         [3,4], [3,4],   'same vector'; ...
         [1,2,3],[1,-5,3], '3D vectors'};

for k = 1:size(pairs,1)
    A = pairs{k,1}; B = pairs{k,2}; label = pairs{k,3};
    dp = dot(A, B);
    fprintf('%s\\n  A·B = %.4f, orthogonal = %d\\n\\n', label, dp, are_orthogonal(A,B));
end`,
          prose: [
            `The helper function \`are_orthogonal\` uses \`abs(dot(A,B)) < tol\` — floating-point safe comparison. Never write \`dot(A,B) == 0\` for floating-point vectors.`,
            `MATLAB's \`dot(A, B)\` works on vectors of any dimension — 2D, 3D, or larger. The formula is $\\sum_i A_iB_i$ regardless of size.`,
            `The same vector is never orthogonal to itself (for non-zero $\\vec{A}$): $\\vec{A}\\cdot\\vec{A} = |\\vec{A}|^2 > 0$. That test should return 0 (false), confirming the function works correctly.`,
          ],
        },
        {
          cellTitle: 'Visualising perpendicular vectors',
          type: 'code',
          language: 'matlab',
          code: `function Ap = perp_2d(A)
    Ap = [-A(2), A(1)];   % 90° CCW rotation
end

test_vecs = {[3,4], [2,-1], [-1,2]};

fprintf('Perpendicular pairs:\\n');
for k = 1:3
    A  = test_vecs{k};
    Ap = perp_2d(A);
    fprintf('  A=[%g,%g], A_perp=[%g,%g], A·A_perp=%.4f\\n', ...
            A(1),A(2), Ap(1),Ap(2), dot(A,Ap));
end

% Plot A and A_perp for the first vector
figure('Position', [100 100 400 400]);
A  = [3, 4];
Ap = perp_2d(A);
quiver(0,0,A(1),A(2), 0, 'b', 'LineWidth', 2); hold on;
quiver(0,0,Ap(1),Ap(2), 0, 'r', 'LineWidth', 2);
text(A(1)*1.1, A(2)*1.1, 'A=(3,4)', 'Color','b','FontSize',11,'FontWeight','bold');
text(Ap(1)*1.1, Ap(2)*1.1, 'A^\\perp=(-4,3)', 'Color','r','FontSize',11,'FontWeight','bold');
xlim([-6 5]); ylim([-5 5.5]); axis equal; grid on;
title(sprintf('A·A^{\\perp} = %.0f  (perpendicular)', dot(A,Ap)));`,
          prose: [
            `\`perp_2d(A) = [-A(2), A(1)]\` performs a 90° counter-clockwise rotation. MATLAB uses 1-based indexing: \`A(1)\` is $A_x$, \`A(2)\` is $A_y$.`,
            `The function definition at the top works as a local function in a script or a separate .m file. The formula $(-A_y, A_x)$ comes directly from the rotation matrix $R(90°) = \\begin{pmatrix}0 & -1 \\\\ 1 & 0\\end{pmatrix}$.`,
            `\`quiver(0,0,vx,vy,0)\` draws a vector from the origin with the \`0\` preventing auto-scaling. \`hold on\` allows drawing both arrows on the same axes.`,
          ],
        },
        {
          cellTitle: 'Zero work — centripetal force',
          type: 'code',
          language: 'matlab',
          code: `thetas = linspace(0, 2*pi, 360);
works = zeros(1, length(thetas));

for k = 1:length(thetas)
    theta = thetas(k);
    pos = [5*cos(theta), 5*sin(theta)];
    vel = [-sin(theta), cos(theta)];       % tangential unit vector
    F_c = -pos / norm(pos);                % centripetal unit vector
    works(k) = dot(F_c, vel);
end

fprintf('Max |work| over full circle: %.2e\\n', max(abs(works)));
fprintf('All essentially zero — centripetal force does NO work.\\n');

% Check at one specific point
theta = pi/4;
pos = [5*cos(theta), 5*sin(theta)];
vel = [-sin(theta), cos(theta)];
F_c = -pos / norm(pos);
fprintf('\\nAt theta=45 deg: F_c·v = %.4f\\n', dot(F_c, vel));
fprintf('Angle: %.1f deg\\n', rad2deg(acos(dot(F_c, vel))));`,
          prose: [
            `The loop computes $\\vec{F}_c\\cdot\\vec{v}$ at 360 equally spaced angles. At every point, the centripetal force (radially inward) and velocity (tangentially outward) are perpendicular.`,
            `\`max(abs(works))\` should be near machine epsilon ($\\approx 10^{-16}$) — not exactly zero due to floating-point rounding, but effectively zero. This is a key numerical analysis skill: know the difference between "mathematically zero" and "computationally zero."`,
            `\`rad2deg(acos(dot(F_c, vel)))\` confirms the angle is 90° at the sampled point. \`acos\` is MATLAB's inverse cosine function (returns radians).`,
          ],
        },
        {
          cellTitle: 'Challenge: find the unknown component',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% Find k such that A = [k, 3, -1] is orthogonal to B = [2, -1, 4]
% Equation: dot([k,3,-1], [2,-1,4]) = 2k + 3*(-1) + (-1)*4 = 2k - 7 = 0

% k_value = ___

% Verify:
% B = [2, -1, 4];
% A = [k_value, 3, -1];
% fprintf('k = %.4f, A·B = %.4f\\n', k_value, dot(A, B))`,
          prose: [
            `Set $\\vec{A}\\cdot\\vec{B} = 0$: the component formula gives $2k - 7 = 0$, so $k = 3.5$. This is a linear equation in $k$ — always the case when the unknown appears in only one component.`,
            `Verify by substituting back: \`dot([3.5, 3, -1], [2, -1, 4]) = 7 - 3 - 4 = 0\`. If the number is not exactly zero but is $< 10^{-10}$, that is floating-point rounding — treat it as zero.`,
            `This "solve for the missing component" pattern appears in physics when you need to find a force direction that does no work on a given motion, or a vector that lies in a specific plane.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-012-q1',
      type: 'choice',
      question: `Two non-zero vectors are orthogonal if and only if:`,
      options: [`Their magnitudes are equal`, `Their dot product is zero`, `They point in opposite directions`, `One is a unit vector`],
      answer: `Their dot product is zero`,
      hints: [
        'The word "orthogonal" literally means "right angle" — which angle makes $\\cos\\phi = 0$?',
        '$\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. For what $\\phi$ is this zero?',
      ],
      reviewSection: 'intuition',
      explanation: `$\\vec{A}\\perp\\vec{B} \\iff \\vec{A}\\cdot\\vec{B} = 0$. This is both necessary and sufficient for non-zero vectors.`,
    },
    {
      id: 'p1-ch1-012-q2',
      type: 'choice',
      question: `$\\vec{A} = (3, -4)$ and $\\vec{B} = (4, 3)$. Are they orthogonal?`,
      options: [`No — their magnitudes are not equal`, `Yes — their dot product is zero`, `No — they are in Quadrant I`, `Yes — they are unit vectors`],
      answer: `Yes — their dot product is zero`,
      hints: [
        'Compute $A_xB_x + A_yB_y = (3)(4) + (-4)(3)$.',
        'Magnitudes being equal is not the orthogonality condition.',
      ],
      reviewSection: 'intuition',
      explanation: `$\\vec{A}\\cdot\\vec{B} = (3)(4)+(-4)(3) = 12-12 = 0$. The vectors are perpendicular.`,
    },
    {
      id: 'p1-ch1-012-q3',
      type: 'choice',
      question: `A table normal force $\\vec{N}$ acts perpendicular to a surface. A box slides along the surface with velocity $\\vec{v}$. How much work does $\\vec{N}$ do?`,
      options: [`$|N||v|$`, `$-|N||v|$`, `$0$`, `Depends on the speed`],
      answer: `$0$`,
      hints: [
        'Work = $\\vec{N}\\cdot\\vec{v}$. What is the angle between $\\vec{N}$ and $\\vec{v}$?',
        'Perpendicular force, any speed: apply $W = |N||v|\\cos90°$.',
      ],
      reviewSection: 'math',
      explanation: `$W = \\vec{N}\\cdot\\vec{v} = |N||v|\\cos90° = 0$. Perpendicular vectors always have zero dot product — regardless of magnitudes or speed.`,
    },
    {
      id: 'p1-ch1-012-q4',
      type: 'choice',
      question: `The basis vectors $\\hat{i}$, $\\hat{j}$, $\\hat{k}$ are "orthonormal". What does "ortho" mean?`,
      options: [`Each has magnitude 1`, `They are mutually perpendicular`, `They point along coordinate axes`, `They form a right-hand system`],
      answer: `They are mutually perpendicular`,
      hints: [
        '"Ortho" comes from Greek "orthos" = straight/right.',
        '"Normal" in "orthonormal" refers to unit length; what does "ortho" refer to?',
      ],
      reviewSection: 'math',
      explanation: `"Ortho" = perpendicular ($\\hat{i}\\cdot\\hat{j}=0$ etc.). "Normal" = unit magnitude ($|\\hat{i}|=1$ etc.). Both together = orthonormal.`,
    },
    {
      id: 'p1-ch1-012-q5',
      type: 'choice',
      question: `For what value of $c$ is $(1, c)$ perpendicular to $(2, 3)$?`,
      options: [`$c = 3/2$`, `$c = -2/3$`, `$c = 2/3$`, `$c = -3/2$`],
      answer: `$c = -2/3$`,
      hints: [
        'Set up $\\vec{A}\\cdot\\vec{B} = 0$: $(1)(2) + (c)(3) = 0$.',
        'Solve $2 + 3c = 0$ for $c$.',
      ],
      reviewSection: 'examples',
      explanation: `$(1)(2)+(c)(3) = 0 \\Rightarrow 2 + 3c = 0 \\Rightarrow c = -2/3$.`,
    },
    {
      id: 'p1-ch1-012-q6',
      type: 'choice',
      question: `Circular motion: an object moves in a circle at constant speed. The velocity $\\vec{v}$ and centripetal acceleration $\\vec{a}_c$ are always:`,
      options: [`Parallel`, `Antiparallel`, `Perpendicular`, `At 45°`],
      answer: `Perpendicular`,
      hints: [
        'The centripetal acceleration points toward the centre; the velocity is tangent to the circle.',
        'What angle do "radial" and "tangential" directions make?',
      ],
      reviewSection: 'math',
      explanation: `The centripetal acceleration points toward the center (radially inward); the velocity is tangential (along the circle). They are perpendicular — so $\\vec{v}\\cdot\\vec{a}_c = 0$ and the centripetal force does zero work (speed does not change).`,
    },
    {
      id: 'p1-ch1-012-q7',
      type: 'choice',
      question: `$\\vec{A}\\cdot\\vec{B} = 0$ and $\\vec{A} \\ne \\vec{0}$, $\\vec{B} \\ne \\vec{0}$. What can we conclude?`,
      options: [`$\\vec{A}$ and $\\vec{B}$ are equal`, `$\\vec{A}$ and $\\vec{B}$ are perpendicular`, `One is a scalar multiple of the other`, `Their magnitudes are equal`],
      answer: `$\\vec{A}$ and $\\vec{B}$ are perpendicular`,
      hints: [
        'What does $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi = 0$ imply about $\\phi$?',
        'Neither $|A|$ nor $|B|$ is zero, so which factor must be zero?',
      ],
      reviewSection: 'intuition',
      explanation: `Zero dot product (with both vectors non-zero) means $\\cos\\phi = 0$, so $\\phi = 90°$ — perpendicular.`,
    },
    {
      id: 'p1-ch1-012-q8',
      type: 'choice',
      question: `In $n$-dimensional space, how many mutually orthogonal unit vectors can you have?`,
      options: [`At most 2`, `Exactly $n$`, `At most $n$`, `Infinitely many`],
      answer: `Exactly $n$`,
      hints: [
        'In 2D (the plane), how many mutually perpendicular unit vectors exist? In 3D?',
        'In $\\mathbb{R}^3$: $\\hat{i}$, $\\hat{j}$, $\\hat{k}$. Can you add a 4th?',
      ],
      reviewSection: 'rigor',
      explanation: `In $\\mathbb{R}^n$ you can have exactly $n$ mutually orthogonal unit vectors (an orthonormal basis). In $\\mathbb{R}^3$ that is exactly $\\{\\hat{i}, \\hat{j}, \\hat{k}\\}$.`,
    },
    {
      id: 'p1-ch1-012-q9',
      type: 'choice',
      question: `If $\\vec{A} = (A_x, A_y)$, which vector is perpendicular to $\\vec{A}$ in 2D?`,
      options: [`$(A_y, A_x)$`, `$(-A_y, A_x)$`, `$(A_x, -A_y)$`, `$(-A_x, -A_y)$`],
      answer: `$(-A_y, A_x)$`,
      hints: [
        'Compute the dot product of $\\vec{A}$ with each candidate and see which gives zero.',
        'Try $\\vec{A} = (3, 4)$: which candidate gives $\\vec{A}\\cdot\\vec{B} = 0$?',
      ],
      reviewSection: 'intuition',
      explanation: `$\\vec{A}\\cdot(-A_y, A_x) = A_x(-A_y) + A_y(A_x) = -A_xA_y + A_xA_y = 0$. This is the 90° counter-clockwise rotation of $\\vec{A}$.`,
    },
    {
      id: 'p1-ch1-012-q10',
      type: 'choice',
      question: `A satellite in circular orbit moves at constant speed. Why does gravity not change its speed?`,
      options: [
        `Gravity is too weak at orbital altitude`,
        `The satellite's momentum cancels gravity`,
        `Gravity is always perpendicular to velocity — it does zero work`,
        `The satellite moves too fast for gravity to act`,
      ],
      answer: `Gravity is always perpendicular to velocity — it does zero work`,
      hints: [
        'What direction does gravity point for a satellite? What direction does it move?',
        'Zero work means no change in kinetic energy, which means no change in speed.',
      ],
      reviewSection: 'math',
      explanation: `In circular orbit, gravity points radially inward (centripetal) while velocity is tangential. These directions are perpendicular ($\\phi=90°$), so $W = \\vec{F}_g\\cdot\\vec{v} = 0$. No work means no change in kinetic energy — constant speed.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-012-m1',
      wrong: 'Two vectors are perpendicular only if one of them has a zero component.',
      correction: 'Perpendicularity depends on the dot product, not on individual components. For example, $(3,4)$ and $(-4,3)$ have no zero components yet are perfectly perpendicular: $(3)(-4)+(4)(3) = -12+12 = 0$.',
      correctionExample: '$\\vec{A}=(3,4),\\;\\vec{B}=(-4,3):\\quad$ both fully 2D, yet $\\vec{A}\\cdot\\vec{B} = 0$',
    },
    {
      id: 'p1-ch1-012-m2',
      wrong: 'If $\\vec{A}\\cdot\\vec{B} = 0$, then $\\vec{A}$ and $\\vec{B}$ have equal magnitudes.',
      correction: 'Zero dot product says nothing about magnitudes — it only means the angle between the vectors is 90°. For example, $(1,0)$ and $(0,100)$ are perpendicular (dot product = 0) but have magnitudes 1 and 100.',
      correctionExample: '$\\vec{A}=(1,0),\\;\\vec{B}=(0,100):\\quad \\vec{A}\\cdot\\vec{B} = 0,\\;|\\vec{A}|=1,\\;|\\vec{B}|=100$',
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-012-t1',
      prompt: `In machine learning, two data vectors (feature vectors for two samples) are called "uncorrelated" when their dot product is zero. What does orthogonality of feature vectors mean in terms of the information they carry? Why is it useful to have orthogonal features?`,
    },
    {
      id: 'p1-ch1-012-t2',
      prompt: `In Quantum Mechanics, different energy states $|\\psi_1\\rangle$ and $|\\psi_2\\rangle$ of a hydrogen atom are "orthogonal" in the sense $\\langle\\psi_1|\\psi_2\\rangle = 0$ (where $\\langle\\psi_1|\\psi_2\\rangle$ is the inner product on function space). What physical quantity does this orthogonality correspond to? What does it tell us about measuring properties of the atom?`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-012-d1',
      buggyCode: `import numpy as np
A = np.array([3.0, 4.0])
B = np.array([-4.0, 3.0])
if np.dot(A, B) == 0:
    print("Perpendicular!")
else:
    print("Not perpendicular")   # This might print incorrectly`,
      language: 'python',
      issue: '`== 0` fails with floating-point arithmetic because rounding errors can make the dot product something like `1e-16` instead of exactly 0.',
      fix: `import numpy as np
A = np.array([3.0, 4.0])
B = np.array([-4.0, 3.0])
if np.isclose(np.dot(A, B), 0, atol=1e-9):
    print("Perpendicular!")   # Correctly handles floating-point near-zero`,
    },
    {
      id: 'p1-ch1-012-d2',
      buggyCode: `# Finding a perpendicular to A = (3, 4)
A = (3, 4)
A_perp = (-A[0], A[1])   # Wrong sign — this is NOT perpendicular
print(A[0]*A_perp[0] + A[1]*A_perp[1])  # prints 7, not 0`,
      language: 'python',
      issue: 'The perpendicular formula is $(-A_y, A_x)$ — swap components AND negate the first. Here only the sign was negated without swapping.',
      fix: `A = (3, 4)
A_perp = (-A[1], A[0])   # Correct: swap, then negate x
print(A[0]*A_perp[0] + A[1]*A_perp[1])  # prints 0 — correct`,
    },
  ],

  mastery: {
    targetLevel: 'You can test any two vectors for orthogonality using the dot product, find perpendicular vectors in 2D using the rotation formula, solve for unknown components that make vectors perpendicular, and apply the zero-work theorem to centripetal and normal forces.',
    prerequisites: ['Dot product component formula: $A_xB_x + A_yB_y + A_zB_z$', 'Work formula: $W = \\vec{F}\\cdot\\vec{d}$', 'The three regimes: positive/zero/negative dot product'],
    unlocks: ['Cross product (3D perpendicular vector)', 'Vector projection onto a direction', 'Normal vectors to planes (key for 3D geometry and mechanics)'],
    checkpoints: [
      'Can verify two given vectors are perpendicular by computing their dot product and getting zero',
      'Can find a vector perpendicular to a given 2D vector using $(-A_y, A_x)$ and verify algebraically',
      'Can solve "find $k$ such that $\\vec{A}(k)\\perp\\vec{B}$" by setting the dot product to zero',
      'Can explain why centripetal force and normal force always do zero work using the perpendicularity condition',
    ],
  },

  semantics: {
    core: [
      { symbol: '\\vec{A}\\perp\\vec{B}', meaning: 'Vectors are perpendicular (orthogonal) — the angle between them is exactly 90°' },
      { symbol: '\\vec{A}\\cdot\\vec{B} = 0', meaning: 'Algebraic test for perpendicularity — necessary and sufficient when both vectors are non-zero' },
      { symbol: '(-A_y, A_x)', meaning: '2D perpendicular to $(A_x, A_y)$ — 90° counter-clockwise rotation, same magnitude' },
      { symbol: '\\delta_{ij}', meaning: 'Kronecker delta: 1 if $i=j$, 0 if $i\\ne j$ — encodes orthonormality of basis vectors' },
      { symbol: 'W = \\vec{F}\\cdot\\vec{v} = 0', meaning: 'A force perpendicular to velocity does zero work and cannot change the object\'s speed' },
    ],
    rulesOfThumb: [
      'Zero dot product means perpendicular — not equal magnitude, not zero vectors, not any other special condition.',
      'The 2D perpendicular trick $(-A_y, A_x)$ is a 90° rotation — use it any time you need a vector at right angles to a given one.',
      'Normal force and centripetal force always do zero work: they are perpendicular to motion by construction.',
      'To find an unknown component for perpendicularity: set the dot product to zero, treat it as a linear equation, and solve.',
      'In $n$ dimensions, exactly $n$ mutually orthogonal unit vectors are needed to span the space — that is an orthonormal basis.',
    ],
  },
}
