export default {
  id: 'p1-ch1-010',
  slug: 'dot-product-intro',
  chapter: 'p1',
  order: 10,
  title: 'The Dot Product',
  subtitle: 'Multiply two vectors to get a number that measures how much they point in the same direction.',
  tags: ['dot product', 'scalar product', 'projection', 'work', 'alignment', 'cosine'],
  aliases: 'dot product scalar product inner product projection work energy alignment',

  hook: {
    question: 'You push a heavy box with 40 N — but at an angle. How much of that force is actually moving the box?',
    realWorldContext:
      `This is the core question behind the concept of **work** in physics. Only the component of force in the direction of motion does useful work. If you push perpendicular to the motion, you do zero work — no matter how hard you push. The dot product is the mathematical tool that extracts exactly this "component in a given direction." It appears in work ($W = \\vec{F}\\cdot\\vec{d}$), power ($P = \\vec{F}\\cdot\\vec{v}$), electric potential, magnetic flux, and almost every other "how much overlap is there?" question in physics.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'dot-product-projection' },
  },

  videos: [{
    title: 'Physics 1 – Vectors (12 of 21) Product of Vectors: Dot Product: Scalar Product',
    embedCode: '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
    placement: 'intuition',
  }],

  intuition: {
    prose: [
      `You push a box with force $\\vec{F} = (60, 0)$ N while it slides along displacement $\\vec{d} = (4, 3)$ m. Before reading on, predict: does the 3 m vertical component of the displacement affect the work done by this purely horizontal force?`,

      `The dot product answers this question: **how much of vector $\\vec{A}$ is in the direction of $\\vec{B}$?** The answer is a single number — a scalar, not a vector. That's why it's also called the **scalar product**. When you compute $\\vec{F}\\cdot\\vec{d} = (60)(4) + (0)(3) = 240$ J, the vertical component simply drops out — it contributes nothing, exactly as predicted.`,

      `Imagine you're pulling a suitcase on wheels. You grab the handle and pull at an angle $\\phi$ above the horizontal. The suitcase moves horizontally — it doesn't care about the vertical component of your pull. Only the horizontal part of your force does work. That horizontal component is $|\\vec{F}|\\cos\\phi$ — the magnitude of the force multiplied by the cosine of the angle. Multiply that by the distance moved, and you have the work done. That multiplication is the dot product: $W = \\vec{F}\\cdot\\vec{d} = |\\vec{F}||\\vec{d}|\\cos\\phi$.`,

      'Three cases to memorise:',
      `**Parallel** ($\\phi = 0°$): $\\cos0°=1$, so $\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|$. Maximum overlap — the vectors point exactly the same way.`,
      `**Perpendicular** ($\\phi = 90°$): $\\cos90°=0$, so $\\vec{A}\\cdot\\vec{B} = 0$. Zero overlap — the vectors are completely crosswise. A perpendicular force does zero work.`,
      `**Anti-parallel** ($\\phi = 180°$): $\\cos180°=-1$, so $\\vec{A}\\cdot\\vec{B} = -|\\vec{A}||\\vec{B}|$. Maximum negative overlap — the vectors fight each other. Friction does negative work on a moving object.`,

      `The geometric picture: draw both vectors tail-to-tail. Drop a perpendicular from the tip of $\\vec{B}$ onto the line of $\\vec{A}$. The foot of that perpendicular is the **projection** of $\\vec{B}$ onto $\\vec{A}$. The dot product is: (length of that projection) × (magnitude of $\\vec{A}$). Or equivalently: (length of projection of $\\vec{A}$ onto $\\vec{B}$) × (magnitude of $\\vec{B}$). Both give the same number — the dot product is commutative.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Dot product — geometric definition',
        body: `\\vec{A} \\cdot \\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi`,
      },
      {
        type: 'insight',
        title: 'The result is always a scalar',
        body:
          `Two vectors go in, one number comes out. The "vector-ness" is consumed by the operation — there is no direction in the result. This is fundamentally different from multiplying a vector by a scalar (which gives a vector) and from the cross product (which gives a vector).`,
      },
      {
        type: 'definition',
        title: 'Three landmark cases',
        body:
          `\\phi = 0°:\\; \\vec{A}\\cdot\\vec{B} = |A||B| \\quad (\\text{maximum, parallel})\\n\\phi = 90°:\\; \\vec{A}\\cdot\\vec{B} = 0 \\quad\\quad (\\text{zero, perpendicular})\\n\\phi = 180°:\\; \\vec{A}\\cdot\\vec{B} = -|A||B| \\quad (\\text{minimum, anti-parallel})`,
      },
      {
        type: 'insight',
        title: 'Physics application: Work',
        body:
          `$W = \\vec{F}\\cdot\\vec{d} = |F||d|\\cos\\phi$ where $\\phi$ is the angle between force and displacement. If you push perpendicular to motion ($\\phi=90°$), you do zero work — the force transfers no energy. This is why a centripetal force (always perpendicular to motion in circular paths) does no work.`,
      },
      {
        type: 'procedure',
        title: 'Two ways to compute the dot product',
        body: `1. **Component method:** Multiply matching components and sum — $\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$ (no angle needed)\n2. **Geometric method:** Use $|\\vec{A}||\\vec{B}|\\cos\\phi$ when you know the angle between the vectors\n3. **Sign check:** Result > 0 means acute angle ($\\phi < 90°$); = 0 means perpendicular; < 0 means obtuse ($\\phi > 90°$)`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'The projection picture',
        caption:
          `Geometric meaning: $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$. The dashed line is the perpendicular from $\\vec{B}$'s tip to $\\vec{A}$'s line. The foot is the projection of $\\vec{B}$ onto $\\vec{A}$. Dot product = (projection length) × |A|. When φ = 90°, projection = 0.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'dot-product-projection' },
        title: 'Dot product — projection and sign',
        caption: `Rotate one vector through 360°. The dot product is positive for acute angles ($\\phi < 90°$), zero at exactly 90°, and negative for obtuse angles ($\\phi > 90°$). The projection of $\\vec{B}$ onto $\\vec{A}$ is $|B|\\cos\\phi$.`,
      },
    ],
  },

  math: {
    prose: [
      `The geometric formula $\\vec{A}\\cdot\\vec{B} = |A||B|\\cos\\phi$ is elegant but requires knowing the angle between the vectors. There is an equivalent formula that works directly from components — no angle needed:`,
      '$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y$ (in 2D)',
      '$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z$ (in 3D)',
      `Multiply matching components and sum. That's the entire calculation. This works because the basis vectors $\\hat{\\imath}$, $\\hat{\\jmath}$, $\\hat{k}$ are orthonormal: $\\hat{\\imath}\\cdot\\hat{\\imath}=1$, $\\hat{\\jmath}\\cdot\\hat{\\jmath}=1$, $\\hat{k}\\cdot\\hat{k}=1$, and $\\hat{\\imath}\\cdot\\hat{\\jmath}=0$, etc. The cross-terms vanish and we're left with just the matching pairs.`,
      `Both formulas give the same number — and equating them is how we'll find the angle between any two vectors in the next lesson.`,
      `A special case worth memorising: $\\vec{A}\\cdot\\vec{A} = |\\vec{A}|^2$. The dot product of a vector with itself equals its magnitude squared. This means $|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}}$ — another way to compute magnitude.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Dot product — component formula',
        body:
          `\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y \\;\\text{(2D)}\\n\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y + A_zB_z \\;\\text{(3D)}`,
      },
      {
        type: 'theorem',
        title: 'Self-dot = magnitude squared',
        body: '\\vec{A}\\cdot\\vec{A} = A_x^2 + A_y^2 + A_z^2 = |\\vec{A}|^2',
      },
      {
        type: 'theorem',
        title: 'Properties (commutativity, distributivity)',
        body:
          `\\vec{A}\\cdot\\vec{B} = \\vec{B}\\cdot\\vec{A} \\quad \\text{(commutative)}\\n\\vec{A}\\cdot(\\vec{B}+\\vec{C}) = \\vec{A}\\cdot\\vec{B} + \\vec{A}\\cdot\\vec{C} \\quad \\text{(distributive)}\\n(c\\vec{A})\\cdot\\vec{B} = c(\\vec{A}\\cdot\\vec{B}) \\quad \\text{(scalar associative)}`,
      },
      {
        type: 'warning',
        title: 'The dot product is NOT associative',
        body:
          `$(\\vec{A}\\cdot\\vec{B})\\cdot\\vec{C}$ is **undefined** — $\\vec{A}\\cdot\\vec{B}$ is a scalar, and you cannot dot a scalar with a vector. There is no "triple dot product" in the same way there is no "triple regular product".`,
      },
    ],
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Dot Product Explorer — magnitudes and angles',
      caption: `$\\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y = |A||B|\\cos\\phi$. Maximum when fully aligned ($\\phi=0$); zero when perpendicular ($\\phi=90°$); minimum when anti-aligned ($\\phi=180°$).`,
    }],
  },

  rigor: {
    prose: [
      `The dot product is the unique bilinear form on $\\mathbb{R}^n$ that is symmetric and positive-definite. "Bilinear" means linear in each argument separately: $\\vec{A}\\cdot(\\lambda\\vec{B}+\\mu\\vec{C}) = \\lambda(\\vec{A}\\cdot\\vec{B})+\\mu(\\vec{A}\\cdot\\vec{C})$. "Symmetric" means $\\vec{A}\\cdot\\vec{B}=\\vec{B}\\cdot\\vec{A}$. "Positive-definite" means $\\vec{A}\\cdot\\vec{A}\\ge 0$ with equality only when $\\vec{A}=\\vec{0}$.`,
      `The dot product is coordinate-independent: if you rotate your entire coordinate system, every vector's components change, but all pairwise dot products remain the same. This is because the angle $\\phi$ between two vectors is a geometric quantity — it doesn't depend on which axes you chose. The value $|\\vec{A}||\\vec{B}|\\cos\\phi$ is therefore an invariant of the pair of vectors, not of the coordinate frame. This invariance is why the dot product is the right tool for physics: a physical relationship like $W = \\vec{F}\\cdot\\vec{d}$ must be the same regardless of which way you orient your coordinate axes.`,
      `Geometrically, the dot product measures the signed area of the rectangle whose sides are $|\\vec{A}|$ and the scalar projection of $\\vec{B}$ onto $\\vec{A}$, where $\\text{comp}_{\\vec{A}}\\vec{B} = |\\vec{B}|\\cos\\phi$. The Cauchy-Schwarz inequality $|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|$ is simply the statement that $|\\cos\\phi| \\le 1$ for all angles — the dot product can never exceed the product of the magnitudes. Equality holds when the vectors are parallel ($\\phi=0°$ or $\\phi=180°$).`,
      `The dot product defines the notion of **angle** and **distance** in $\\mathbb{R}^n$: $\\cos\\phi = \\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}$ and $|\\vec{A}| = \\sqrt{\\vec{A}\\cdot\\vec{A}}$. In Linear Algebra, you will generalise this to abstract inner product spaces — function spaces, complex vector spaces, and even infinite-dimensional Hilbert spaces. The Fourier series representation of a function is literally the "dot product" of that function with each basis wave. The physics intuition ("how much does one thing point in the direction of another?") carries through every generalisation.`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Cauchy-Schwarz inequality',
        body: `|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|`,
      },
      {
        type: 'insight',
        title: 'The dot product is the inner product for Euclidean space',
        body:
          `All of Euclidean geometry — distances, angles, projections, perpendicularity — can be expressed using only the dot product. This is why the inner product is so central to Linear Algebra: it is the minimal structure needed to do geometry.`,
      },
    ],
    proofSteps: [
      {
        title: 'Geometric definition',
        expression: '\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi',
        annotation: 'Start from the geometric definition. We want to show this equals $A_xB_x + A_yB_y$.',
      },
      {
        title: 'Expand in unit vectors',
        expression: '\\vec{A}\\cdot\\vec{B} = (A_x\\hat{\\imath}+A_y\\hat{\\jmath})\\cdot(B_x\\hat{\\imath}+B_y\\hat{\\jmath})',
        annotation: 'Write both vectors in component form.',
      },
      {
        title: 'Distribute (FOIL)',
        expression:
          '= A_xB_x(\\hat{\\imath}\\cdot\\hat{\\imath}) + A_xB_y(\\hat{\\imath}\\cdot\\hat{\\jmath}) + A_yB_x(\\hat{\\jmath}\\cdot\\hat{\\imath}) + A_yB_y(\\hat{\\jmath}\\cdot\\hat{\\jmath})',
        annotation: 'Dot product distributes over addition — four terms.',
      },
      {
        title: 'Apply orthonormality of basis',
        expression: '\\hat{\\imath}\\cdot\\hat{\\imath}=1,\\quad \\hat{\\jmath}\\cdot\\hat{\\jmath}=1,\\quad \\hat{\\imath}\\cdot\\hat{\\jmath}=0',
        annotation: 'Basis vectors have magnitude 1 (so self-dot = 1) and are perpendicular (cross-dot = 0). Cross-terms vanish.',
      },
      {
        title: 'Result',
        expression: '\\therefore\\; \\vec{A}\\cdot\\vec{B} = A_xB_x + A_yB_y',
        annotation:
          `The component formula follows. Both formulas produce the same number — use whichever is more convenient for the problem at hand.`,
      },
    ],
    title: 'Geometric = Component: The two dot product formulas agree',
    visualizations: [{
      id: 'SVGDiagram',
      props: { type: 'dot-product-projection' },
      title: 'Proof: geometric = component formula',
      caption: `Expanding $(A_x\\hat{i}+A_y\\hat{j})\\cdot(B_x\\hat{i}+B_y\\hat{j})$ and applying orthonormality ($\\hat{i}\\cdot\\hat{j}=0$, $\\hat{i}\\cdot\\hat{i}=1$) leaves only $A_xB_x + A_yB_y$. The two formulas are identical.`,
    }],
  },

  examples: [
    {
      id: 'ch1-010-ex1',
      title: 'Dot product from magnitudes and angle',
      problem: '|\\vec{A}|=5,\\; |\\vec{B}|=8,\\; \\phi=60°.\\text{ Find }\\vec{A}\\cdot\\vec{B}.',
      steps: [
        {
          expression: '\\vec{A}\\cdot\\vec{B} = |\\vec{A}||\\vec{B}|\\cos\\phi = 5\\times8\\times\\cos60°',
          annotation: 'Apply the geometric definition. $\\cos60°=0.5$ exactly.',
        },
        {
          expression: '\\vec{A}\\cdot\\vec{B} = 40\\times0.5 = 20',
          annotation: 'The vectors are at a 60° angle — their dot product is half the product of their magnitudes.',
        },
      ],
      conclusion: '$\\vec{A}\\cdot\\vec{B} = 20$. Positive because the angle is acute (less than 90°).',
    },
    {
      id: 'ch1-010-ex2',
      title: 'Work done by a force',
      problem:
        '\\text{A force } \\vec{F}=(6,\\,-3)\\,\\text{N acts as an object moves along } \\vec{d}=(2,\\,5)\\,\\text{m. Find the work done.}',
      steps: [
        {
          expression: 'W = \\vec{F}\\cdot\\vec{d} = F_xd_x + F_yd_y',
          annotation: 'Work is the dot product of force and displacement.',
        },
        {
          expression: 'W = (6)(2) + (-3)(5) = 12 - 15 = -3\\,\\text{J}',
          annotation:
            `Negative work! The $y$-component of force $(−3\\,N)$ opposes the $y$-component of displacement $(+5\\,m)$. The force takes more energy from the $y$-direction than it adds in the $x$-direction.`,
        },
      ],
      conclusion:
        `$W=-3\\,\\text{J}$. The force does negative work — it removes kinetic energy from the object. The negative sign tells you the force and displacement are more anti-aligned than aligned.`,
    },
    {
      id: 'ch1-010-ex3',
      title: 'Checking the sign',
      problem:
        '\\text{Vectors }\\vec{A}=(3,4)\\text{ and }\\vec{B}=(-1,2).\\text{ Without computing, predict the sign of }\\vec{A}\\cdot\\vec{B}.',
      steps: [
        {
          expression: '\\vec{A}\\text{ points into Quadrant I (northeast). }\\vec{B}\\text{ points into Quadrant II (northwest-ish).}',
          annotation: 'Sketch both vectors. $\\vec{A}$ has positive $x$ and $y$; $\\vec{B}$ has negative $x$ and positive $y$.',
        },
        {
          expression: '\\text{Both vectors have positive }y\\text{-components — they both lean upward. Angle likely acute.}',
          annotation: 'Both vectors are in the upper half-plane. A shared upward component suggests the angle between them is less than 90°.',
        },
        {
          expression: '\\vec{A}\\cdot\\vec{B} = (3)(-1)+(4)(2) = -3+8 = +5',
          annotation: 'Positive result confirms: the angle is less than 90°. The $y$-term dominates and makes the dot product positive.',
        },
      ],
      conclusion:
        `$\\vec{A}\\cdot\\vec{B}=+5>0$. Acute angle. The strategy: sketch first, predict the sign, then compute to confirm.`,
    },
  ],

  challenges: [
    {
      id: 'ch1-010-ch1',
      difficulty: 'easy',
      problem: '\\text{Find }\\vec{A}\\cdot\\vec{B}\\text{ for }\\vec{A}=(3,-2)\\text{ and }\\vec{B}=(4,6).\\text{ Predict the sign first.}',
      hint: '$\\vec{A}$ points right and down; $\\vec{B}$ points right and up. The $y$-terms fight. Which component pair dominates?',
      walkthrough: [
        {
          expression: 'x\\text{-term: }3\\times4=+12,\\quad y\\text{-term: }(-2)\\times6=-12',
          annotation: 'Compute each term before summing.',
        },
        {
          expression: '\\vec{A}\\cdot\\vec{B} = 12+(-12) = 0',
          annotation: 'Zero dot product! The vectors are perpendicular — and neither is zero.',
        },
      ],
      answer: '\\vec{A}\\cdot\\vec{B}=0\\;\\Rightarrow\\;\\text{perpendicular}',
    },
    {
      id: 'ch1-010-ch2',
      difficulty: 'medium',
      problem:
        '\\text{A rope pulls a crate at }40°\\text{ above horizontal with }80\\,\\text{N. The crate slides }5\\,\\text{m horizontally. Find the work done by the rope and by gravity.}',
      hint:
        'Rope work: $W = |F||d|\\cos40°$. Gravity acts downward, displacement is horizontal — what angle between them?',
      walkthrough: [
        {
          expression: 'W_{\\text{rope}} = 80\\times5\\times\\cos40°=400\\times0.766\\approx306\\,\\text{J}',
          annotation: 'Only the horizontal component of the rope force does work.',
        },
        {
          expression: '\\vec{F}_{\\text{gravity}}=(0,-mg)\\text{ and }\\vec{d}=(5,0)\\Rightarrow W_{\\text{gravity}}=0',
          annotation: 'Gravity is perpendicular to horizontal displacement. $\\cos90°=0$. Gravity does no work here.',
        },
      ],
      answer: 'W_{\\text{rope}}\\approx306\\,\\text{J},\\quad W_{\\text{gravity}}=0',
    },
    {
      id: 'ch1-010-ch3',
      difficulty: 'hard',
      problem:
        `\\text{A ball moves along the path }\\vec{d}=(3,4,0)\\,\\text{m while gravity acts as }\\vec{F}_g=(0,-mg,0)=(0,-49,0)\\,\\text{N } (m=5\\,\\text{kg}). \\text{Also, a horizontal force }\\vec{F}_h=(20,0,0)\\,\\text{N acts. Find the total work done.}`,
      hint: 'Total work = $W_g + W_h = \\vec{F}_g\\cdot\\vec{d} + \\vec{F}_h\\cdot\\vec{d} = (\\vec{F}_g+\\vec{F}_h)\\cdot\\vec{d}$.',
      walkthrough: [
        {
          expression: 'W_g = \\vec{F}_g\\cdot\\vec{d} = (0)(3)+(-49)(4)+(0)(0) = -196\\,\\text{J}',
          annotation: 'Gravity does negative work — the ball gains height (4 m upward component), so gravity takes away energy.',
        },
        {
          expression: 'W_h = \\vec{F}_h\\cdot\\vec{d} = (20)(3)+(0)(4)+(0)(0) = 60\\,\\text{J}',
          annotation: 'Horizontal force does positive work — it\'s partially aligned with the displacement.',
        },
        {
          expression: 'W_{\\text{total}} = -196+60 = -136\\,\\text{J}',
          annotation: 'Net work is negative — the ball loses kinetic energy (it\'s going uphill).',
        },
      ],
      answer: `W_{\\text{total}} = -136\\,\\text{J}`,
    },
  ],

  notebooks: {
    python: {
      type: 'PythonNotebook',
      cells: [
        {
          cellTitle: 'Both dot product formulas — verify they agree',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# Two vectors at 60° to each other
A = np.array([4.0, 0.0])           # points right, magnitude 4
B = np.array([3.0, 3*np.sqrt(3)]) # magnitude 6, at 60° from A

# Method 1: geometric formula — need the angle
phi = np.radians(60)
dot_geometric = np.linalg.norm(A) * np.linalg.norm(B) * np.cos(phi)

# Method 2: component formula — multiply matching pairs and sum
dot_component = A[0]*B[0] + A[1]*B[1]

# Method 3: numpy shorthand (use this in practice)
dot_numpy = np.dot(A, B)

print(f"Geometric:  {dot_geometric:.4f}")
print(f"Component:  {dot_component:.4f}")
print(f"np.dot:     {dot_numpy:.4f}")
print(f"All equal?  {np.allclose([dot_geometric, dot_component], dot_numpy)}")`,
          prose: [
            `\`np.dot(A, B)\` computes $A_xB_x + A_yB_y$ — the component formula in one call. The result is a scalar (a plain float), not a vector. This is what "scalar product" means in code.`,
            `The geometric formula requires knowing $\\phi$ in advance; the component formula does not. In practice, use \`np.dot\` and only reach for $|A||B|\\cos\\phi$ when the angle is given directly.`,
            `Both methods return 12.0, confirming they are the same formula derived two different ways — as the proof in the rigor section shows by expanding $(A_x\\hat{i}+A_y\\hat{j})\\cdot(B_x\\hat{i}+B_y\\hat{j})$ and applying orthonormality.`,
          ],
        },
        {
          cellTitle: 'Visualising the three landmark cases',
          type: 'code',
          language: 'python',
          code: `import matplotlib.pyplot as plt
import numpy as np

fig, axes = plt.subplots(1, 3, figsize=(12, 4))
A = np.array([3.0, 0.0])
cases = [
    ("Parallel\\nφ=0°, dot>0",       np.array([2.0,  0.0]),  "tab:green"),
    ("Perpendicular\\nφ=90°, dot=0",  np.array([0.0,  2.0]),  "tab:orange"),
    ("Anti-parallel\\nφ=180°, dot<0", np.array([-2.0, 0.0]),  "tab:red"),
]

for ax, (title, B, color) in zip(axes, cases):
    ax.quiver(0,0,A[0],A[1], angles='xy', scale_units='xy', scale=1,
              color='steelblue', width=0.04)
    ax.quiver(0,0,B[0],B[1], angles='xy', scale_units='xy', scale=1,
              color=color, width=0.04)
    dot = np.dot(A, B)
    ax.set_title(f"{title}\\nA·B = {dot:.1f}", fontsize=10)
    ax.set_xlim(-3.5, 3.5); ax.set_ylim(-1, 3.5)
    ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
    ax.set_aspect('equal'); ax.grid(True, alpha=0.3)
    ax.text(A[0]/2+0.1, 0.15, 'A', color='steelblue', fontsize=12)
    ax.text(B[0]/2+0.1, B[1]/2+0.1, 'B', color=color, fontsize=12)

plt.suptitle("Three landmark dot product cases", fontsize=13)
plt.tight_layout()
plt.show()`,
          prose: [
            `The left panel shows parallel vectors: both point right, so $A_xB_x > 0$ and $A_yB_y = 0$, giving a positive dot product equal to $|A||B|$. This is the maximum possible value.`,
            `The middle panel shows perpendicular vectors: $A$ horizontal, $B$ vertical. $(3)(0)+(0)(2) = 0$. Each component pair contributes nothing — perpendicular directions are completely independent.`,
            `The right panel shows anti-parallel vectors: $B$ points left while $A$ points right, so $A_xB_x = (3)(-2) = -6 < 0$. Friction on a sliding object is anti-parallel to displacement — that is why friction does negative work.`,
          ],
        },
        {
          cellTitle: 'Work done by force — real application',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# A rope pulls a crate at 30° above horizontal with 60 N
F_mag, angle = 60.0, np.radians(30)
F = np.array([F_mag * np.cos(angle), F_mag * np.sin(angle)])
d = np.array([10.0, 0.0])   # 10 m horizontal displacement

W_rope = np.dot(F, d)
print(f"Force vector: ({F[0]:.2f}, {F[1]:.2f}) N")
print(f"Displacement: {d} m")
print(f"Work by rope: {W_rope:.2f} J")
print(f"Check: only F_x * d_x = {F[0]:.2f} * 10 = {F[0]*10:.2f} J")

# Gravity acts downward — does zero work on horizontal motion
g, m = 9.8, 20.0
F_gravity = np.array([0.0, -m*g])
W_gravity = np.dot(F_gravity, d)
print(f"\\nGravity: {F_gravity} N")
print(f"Work by gravity: {W_gravity:.2f} J  (perpendicular to d → zero)")

# Sweep angles to find which angle maximises work
angles = np.linspace(0, np.pi, 200)
works = [np.dot(np.array([60*np.cos(a), 60*np.sin(a)]), d) for a in angles]
best = np.degrees(angles[np.argmax(works)])
print(f"\\nAngle maximising work: {best:.0f}° (force aligned with displacement)")`,
          prose: [
            `$W = \\vec{F}\\cdot\\vec{d}$ extracts only the component of force along the displacement. Since $d_y=0$, the term $F_yd_y = 0$ regardless of how large the vertical component of force is — the rope's upward pull does zero work.`,
            `Gravity and horizontal displacement are perpendicular ($\\phi=90°$), confirming $W_{\\text{gravity}} = 0$. The centripetal force in circular motion works the same way — always perpendicular to velocity, so it never changes speed.`,
            `The sweep shows work = $60 \\times 10 \\times \\cos\\phi$. Maximum at $\\phi=0°$ when force is fully aligned with motion. This is why you push a car horizontally, not at an angle.`,
          ],
        },
        {
          cellTitle: 'Challenge: solar panel efficiency',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# The sun is at 40° above the horizon
sun_angle = np.radians(40)
# sun_hat = np.array([___, ___])   # x = cos(angle from horizontal), y = sin(...)

# Three panel orientations — define their unit normal vectors
# n1: flat panel — normal points straight up:   n1 = np.array([___, ___])
# n2: tilted 40° from vertical:                 n2 = np.array([sin(40°), cos(40°)])
# n3: tilted 80° from vertical:                 n3 = np.array([___, ___])

# Efficiency = dot(n_hat, sun_hat) for each panel
# efficiencies = [np.dot(n1, sun_hat), np.dot(n2, sun_hat), np.dot(n3, sun_hat)]

# print your results here`,
          prose: [
            `A panel's power output is proportional to $\\hat{n}\\cdot\\hat{s}$ — the dot product of the panel's unit normal and the sun's unit direction. When the panel faces the sun directly, $\\phi=0°$ and efficiency = 1 (100%).`,
            `\`sun_hat = np.array([np.cos(sun_angle), np.sin(sun_angle)])\`. For n2 tilted 40° from vertical: its normal is 40° away from straight-up, so x-component = $\\sin40°$, y-component = $\\cos40°$.`,
            `When the panel's normal exactly faces the sun, $\\hat{n}\\cdot\\hat{s} = 1$. This is why solar panels are angled — not flat — to maximise the dot product with the sun's direction. This is the dot product as a real engineering design tool.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      cells: [
        {
          cellTitle: 'Both dot product formulas in MATLAB',
          type: 'code',
          language: 'matlab',
          code: `% Two vectors at 60° to each other
A = [4.0, 0.0];           % points right, magnitude 4
B = [3.0, 3*sqrt(3)];     % magnitude 6, at 60° from A

% Method 1: geometric formula — need the angle
phi = deg2rad(60);
dot_geometric = norm(A) * norm(B) * cos(phi);

% Method 2: component formula — manual
dot_component = A(1)*B(1) + A(2)*B(2);

% Method 3: MATLAB built-in (use this in practice)
dot_matlab = dot(A, B);

fprintf('Geometric:  %.4f\\n', dot_geometric);
fprintf('Component:  %.4f\\n', dot_component);
fprintf('dot():      %.4f\\n', dot_matlab);
all_equal = abs(dot_geometric - dot_matlab) < 1e-10 && ...
            abs(dot_component - dot_matlab) < 1e-10;
fprintf('All equal?  %d\\n', all_equal);`,
          prose: [
            `MATLAB's \`dot(A, B)\` computes the dot product directly — identical to NumPy's \`np.dot(A, B)\`. Both implement $A_xB_x + A_yB_y$. Note that MATLAB uses 1-based indexing: \`A(1)\` is $A_x$, \`A(2)\` is $A_y$.`,
            `\`norm(A)\` returns the Euclidean magnitude $|A| = \\sqrt{A_x^2+A_y^2}$; \`deg2rad\` converts degrees to radians for \`cos()\`. The geometric formula needs the angle in radians — a common source of bugs.`,
            `All three methods return 12.0, confirming that the geometric definition and the component formula are identical. The proof works by expanding the component sum using the orthonormality of $\\hat{i}$ and $\\hat{j}$.`,
          ],
        },
        {
          cellTitle: 'Visualising the three landmark cases',
          type: 'code',
          language: 'matlab',
          code: `A = [3, 0];
B_cases = {[2, 0], [0, 2], [-2, 0]};
titles = {'Parallel (φ=0°)', 'Perpendicular (φ=90°)', 'Anti-parallel (φ=180°)'};
colors = {'b', [0.9 0.5 0], 'r'};

figure('Position', [100 100 900 300]);
for k = 1:3
    subplot(1, 3, k);
    B = B_cases{k};
    quiver(0, 0, A(1), A(2), 0, 'b', 'LineWidth', 2); hold on;
    quiver(0, 0, B(1), B(2), 0, 'Color', colors{k}, 'LineWidth', 2);
    dp = dot(A, B);
    title(sprintf('%s\\nA·B = %.1f', titles{k}, dp));
    xlim([-3.5 3.5]); ylim([-1 3.5]);
    axis equal; grid on;
    text(A(1)/2+0.1, 0.2, 'A', 'Color', 'b', 'FontSize', 12);
    text(B(1)/2+0.1, B(2)/2+0.1, 'B', 'Color', colors{k}, 'FontSize', 12);
end
sgtitle('Three landmark dot product cases');`,
          prose: [
            `\`quiver(0,0,Ax,Ay,0)\` draws a vector from the origin with the final \`0\` disabling auto-scaling so arrows appear at their true length. \`hold on\` allows drawing multiple arrows in the same subplot.`,
            `\`dot(A,B)\` returns the scalar dot product. The three panels confirm: parallel → positive, perpendicular → zero, anti-parallel → negative. These three cases determine the sign of any dot product.`,
            `\`sgtitle\` adds a title spanning all subplots — useful for grouped comparisons. \`subplot(1,3,k)\` creates a 1×3 panel grid. \`axis equal\` ensures vectors look geometrically correct.`,
          ],
        },
        {
          cellTitle: 'Work done by force — real application',
          type: 'code',
          language: 'matlab',
          code: `% Rope pulls crate at 30° above horizontal with 60 N force
F_mag = 60;
angle = deg2rad(30);
F = [F_mag * cos(angle), F_mag * sin(angle)];
d = [10, 0];   % 10 m horizontal displacement

W_rope = dot(F, d);
fprintf('Force: (%.2f, %.2f) N\\n', F(1), F(2));
fprintf('Work by rope: %.2f J\\n', W_rope);
fprintf('Check F_x*d_x = %.2f * 10 = %.2f J\\n', F(1), F(1)*10);

% Gravity perpendicular to horizontal displacement
g = 9.8; m = 20;
F_gravity = [0, -m*g];
W_gravity = dot(F_gravity, d);
fprintf('\\nWork by gravity: %.2f J (perpendicular to d -> zero)\\n', W_gravity);

% Sweep angles to find which maximises work
angles = linspace(0, pi, 200);
works = 60 * 10 * cos(angles);   % |F||d|cos(phi), |d|=10
[max_W, idx] = max(works);
fprintf('\\nMax work %.2f J at angle %.0f degrees\\n', max_W, rad2deg(angles(idx)));`,
          prose: [
            `$W = \\vec{F}\\cdot\\vec{d}$ in MATLAB is \`dot(F, d)\`. Since $d_y = 0$, the term $F_y d_y = 0$ and only the horizontal force component does work — the vertical rope pull lifts but doesn't move the crate forward.`,
            `Gravity and horizontal displacement are perpendicular ($\\phi=90°$), confirming $W_{\\text{gravity}} = 0$. This is a standard physics sanity check: if two vectors are perpendicular, \`dot\` must return zero.`,
            `The sweep uses $|F||d|\\cos\\phi$ directly. \`linspace(0,pi,200)\` samples all angles. Maximum work is at $\\phi=0°$ — force fully aligned with displacement. \`max()\` returns both the value and its index.`,
          ],
        },
        {
          cellTitle: 'Challenge: solar panel efficiency',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% The sun is at 40° above the horizon
sun_angle = deg2rad(40);
% sun_hat = [___, ___]   % [cos(angle), sin(angle)]

% Three panel unit normals
% n1: flat panel — straight up:     n1 = [___, ___]
% n2: tilted 40° from vertical:     n2 = [sin(deg2rad(40)), cos(deg2rad(40))]
% n3: tilted 80° from vertical:     n3 = [___, ___]

% Efficiency = dot(n_i, sun_hat) for each
% eff1 = dot(n1, sun_hat);
% eff2 = ___
% eff3 = ___

% fprintf('Flat: %.3f, Tilted 40: %.3f, Tilted 80: %.3f\\n', eff1, eff2, eff3)`,
          prose: [
            `Panel power output is proportional to $\\hat{n}\\cdot\\hat{s}$ — the dot product of the panel's unit normal with the sun's unit direction. When the normal faces the sun directly, $\\phi=0°$ and efficiency = 1.`,
            `\`sun_hat = [cos(sun_angle), sin(sun_angle)]\`. For n2 tilted 40° from vertical: its normal points 40° away from straight-up, so \`n2 = [sin(deg2rad(40)), cos(deg2rad(40))]\`.`,
            `The panel aligned with the sun achieves \`dot(n2, sun_hat) = 1.0\` because $\\phi=0°$. This is the dot product as engineering: maximise $\\hat{n}\\cdot\\hat{s}$ to maximise power. Real solar trackers do exactly this calculation.`,
          ],
        },
      ],
    },
  },

  quiz: [
    {
      id: 'p1-ch1-010-q1',
      type: 'choice',
      question: `The dot product $\\vec{A}\\cdot\\vec{B}$ produces:`,
      options: [`A vector perpendicular to both`, `A scalar (a number)`, `A unit vector`, `A vector in the same direction as $\\vec{A}$`],
      answer: `A scalar (a number)`,
      hints: [
        'Think about what "scalar product" means.',
        'The cross product gives a vector; the dot product gives a...',
      ],
      reviewSection: 'intuition',
      explanation: `The dot product (scalar product) takes two vectors and produces a single number — a scalar. This distinguishes it from the cross product.`,
    },
    {
      id: 'p1-ch1-010-q2',
      type: 'choice',
      question: `$\\vec{A} = (3, 4)$ and $\\vec{B} = (4, -3)$. What is $\\vec{A}\\cdot\\vec{B}$?`,
      options: [`$25$`, `$0$`, `$7$`, `$-7$`],
      answer: `$0$`,
      hints: [
        'Use the component formula: $A_xB_x + A_yB_y$.',
        '$x$-terms: $3\\times4 = 12$; $y$-terms: $4\\times(-3) = ?$',
      ],
      reviewSection: 'math',
      explanation: `$\\vec{A}\\cdot\\vec{B} = (3)(4) + (4)(-3) = 12 - 12 = 0$. The vectors are perpendicular!`,
    },
    {
      id: 'p1-ch1-010-q3',
      type: 'choice',
      question: `Work is defined as $W = \\vec{F}\\cdot\\vec{d}$. If $\\vec{F}$ is perpendicular to $\\vec{d}$, the work done is:`,
      options: [`$|F||d|$`, `$-|F||d|$`, `$0$`, `$|F|+|d|$`],
      answer: `$0$`,
      hints: [
        'What is $\\cos90°$?',
        '$W = |F||d|\\cos\\phi$ — substitute $\\phi=90°$.',
      ],
      reviewSection: 'intuition',
      explanation: `$W = |F||d|\\cos90° = |F||d|(0) = 0$. A force perpendicular to motion does no work — no matter how large the force.`,
    },
    {
      id: 'p1-ch1-010-q4',
      type: 'choice',
      question: `$\\vec{A}\\cdot\\vec{A} = ?$`,
      options: [`$1$`, `$|\\vec{A}|^2$`, `$0$`, `$2|\\vec{A}|$`],
      answer: `$|\\vec{A}|^2$`,
      hints: [
        'What is the angle between a vector and itself?',
        '$\\vec{A}\\cdot\\vec{A} = A_x^2 + A_y^2 + A_z^2$ — does that look familiar?',
      ],
      reviewSection: 'math',
      explanation: `$\\vec{A}\\cdot\\vec{A} = A_x^2+A_y^2+A_z^2 = |\\vec{A}|^2$. The angle between a vector and itself is 0°, so $\\cos0° = 1$.`,
    },
    {
      id: 'p1-ch1-010-q5',
      type: 'choice',
      question: `The dot product is positive when the angle $\\phi$ between the vectors is:`,
      options: [`$\\phi > 90°$`, `$\\phi = 90°$`, `$\\phi < 90°$`, `Always`],
      answer: `$\\phi < 90°$`,
      hints: [
        'The sign of the dot product equals the sign of $\\cos\\phi$.',
        '$\\cos\\phi$ is positive, zero, or negative for what ranges of $\\phi$?',
      ],
      reviewSection: 'intuition',
      explanation: `$\\cos\\phi > 0$ for $\\phi < 90°$ (acute). $\\cos\\phi = 0$ at $90°$. $\\cos\\phi < 0$ for $\\phi > 90°$ (obtuse).`,
    },
    {
      id: 'p1-ch1-010-q6',
      type: 'choice',
      question: `Is $\\vec{A}\\cdot\\vec{B} = \\vec{B}\\cdot\\vec{A}$?`,
      options: [`No — order matters`, `Yes — the dot product is commutative`, `Only when vectors are parallel`, `Only in 2D`],
      answer: `Yes — the dot product is commutative`,
      hints: [
        'Try the component formula: does $A_xB_x + A_yB_y = B_xA_x + B_yA_y$?',
        'Ordinary multiplication of numbers is commutative — and the component formula is just sums of products.',
      ],
      reviewSection: 'math',
      explanation: `$A_xB_x + A_yB_y = B_xA_x + B_yA_y$. The dot product is commutative.`,
    },
    {
      id: 'p1-ch1-010-q7',
      type: 'choice',
      question: `$(\\vec{A}\\cdot\\vec{B})\\cdot\\vec{C}$ is:`,
      options: [
        `A vector in the direction of $\\vec{C}$`,
        `Undefined — you cannot dot a scalar with a vector`,
        `Equal to $\\vec{A}\\cdot(\\vec{B}\\cdot\\vec{C})$`,
        `Always zero`,
      ],
      answer: `Undefined — you cannot dot a scalar with a vector`,
      hints: [
        'What type of object is $\\vec{A}\\cdot\\vec{B}$?',
        'The dot product requires two vectors as inputs — check what the second dot product here is trying to dot.',
      ],
      reviewSection: 'math',
      explanation: `$\\vec{A}\\cdot\\vec{B}$ is a scalar. Scalars cannot be dotted with vectors. The dot product is not associative in this sense.`,
    },
    {
      id: 'p1-ch1-010-q8',
      type: 'choice',
      question: `The Cauchy-Schwarz inequality states $|\\vec{A}\\cdot\\vec{B}| \\le |\\vec{A}||\\vec{B}|$. When does equality hold?`,
      options: [
        `When $\\vec{A} = \\vec{B}$`,
        `When $\\vec{A}$ and $\\vec{B}$ are parallel (same or opposite directions)`,
        `When $\\vec{A}$ and $\\vec{B}$ are perpendicular`,
        `Always`,
      ],
      answer: `When $\\vec{A}$ and $\\vec{B}$ are parallel (same or opposite directions)`,
      hints: [
        'Cauchy-Schwarz follows from $|\\cos\\phi| \\le 1$. When is $|\\cos\\phi| = 1$?',
        '$|\\cos\\phi| = 1$ at $\\phi = 0°$ or $\\phi = 180°$ — what do those angles mean geometrically?',
      ],
      reviewSection: 'rigor',
      explanation: `Equality holds when $|\\cos\\phi| = 1$, i.e. $\\phi = 0°$ (same direction) or $\\phi = 180°$ (opposite). In both cases the vectors are parallel.`,
    },
    {
      id: 'p1-ch1-010-q9',
      type: 'choice',
      question: `$\\vec{A} = (1, 0, 0)$ and $\\vec{B} = (0, 1, 0)$. What is $\\vec{A}\\cdot\\vec{B}$, and what does this tell you?`,
      options: [
        `$1$ — the vectors are parallel`,
        `$0$ — the vectors are perpendicular`,
        `$-1$ — the vectors are anti-parallel`,
        `$\\sqrt{2}$ — the sum of their magnitudes`,
      ],
      answer: `$0$ — the vectors are perpendicular`,
      hints: [
        'Apply the 3D component formula: $A_xB_x + A_yB_y + A_zB_z$.',
        'These are the $x$ and $y$ unit vectors $\\hat{i}$ and $\\hat{j}$ — they point in perpendicular directions.',
      ],
      reviewSection: 'math',
      explanation: `$\\vec{A}\\cdot\\vec{B} = (1)(0) + (0)(1) + (0)(0) = 0$. This confirms that the basis vectors $\\hat{i}$ and $\\hat{j}$ are orthogonal (perpendicular) — a fact used in the proof that the component formula equals the geometric definition.`,
    },
    {
      id: 'p1-ch1-010-q10',
      type: 'choice',
      question: `A particle experiences force $\\vec{F} = (3, -4)$ N and moves along $\\vec{d} = (8, 6)$ m. What is the work done?`,
      options: [`$0$ J`, `$-24$ J`, `$50$ J`, `$25$ J`],
      answer: `$0$ J`,
      hints: [
        'Apply $W = \\vec{F}\\cdot\\vec{d} = F_xd_x + F_yd_y$.',
        'Compute $x$-term and $y$-term separately before summing.',
      ],
      reviewSection: 'examples',
      explanation: `$W = (3)(8) + (-4)(6) = 24 - 24 = 0$ J. The force and displacement are perpendicular — no net work is done despite both being non-zero. This is a common surprise: large forces and large displacements don't guarantee work.`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-010-m1',
      wrong: 'The dot product of two non-zero vectors can never be zero.',
      correction: 'It can — and it is zero precisely when the vectors are perpendicular. $\\vec{A}=(3,-2)$ and $\\vec{B}=(4,6)$ have dot product $12-12=0$ even though both are non-zero vectors.',
      correctionExample: '$\\vec{A}=(3,-2),\\;\\vec{B}=(4,6):\\quad \\vec{A}\\cdot\\vec{B} = 12-12 = 0$',
    },
    {
      id: 'p1-ch1-010-m2',
      wrong: 'If $\\vec{A}\\cdot\\vec{B} = \\vec{A}\\cdot\\vec{C}$, then $\\vec{B} = \\vec{C}$.',
      correction: 'False. The dot product is not one-to-one — many different vectors $\\vec{B}$ can give the same dot product with a fixed $\\vec{A}$. For example, with $\\vec{A}=(1,0)$: $\\vec{B}=(5,0)$ and $\\vec{C}=(5,99)$ both give $\\vec{A}\\cdot\\vec{B} = \\vec{A}\\cdot\\vec{C} = 5$. You cannot cancel $\\vec{A}$ from both sides.',
      correctionExample: '$\\vec{A}=(1,0),\\;\\vec{B}=(5,0),\\;\\vec{C}=(5,99):\\quad \\vec{A}\\cdot\\vec{B}=5=\\vec{A}\\cdot\\vec{C}$ but $\\vec{B}\\ne\\vec{C}$',
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-010-t1',
      prompt: `In signal processing, two discrete signals $x[n]$ and $y[n]$ are called "uncorrelated" if $\\sum_n x[n]y[n] = 0$. How does this relate to the dot product, and why is a zero correlation physically meaningful?`,
    },
    {
      id: 'p1-ch1-010-t2',
      prompt: `In machine learning, the "cosine similarity" between two vectors is $\\frac{\\vec{A}\\cdot\\vec{B}}{|\\vec{A}||\\vec{B}|}$. What does a cosine similarity of 1 mean? Of 0? Of −1? Why divide by the magnitudes?`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-010-d1',
      buggyCode: `A = [3, 4]
B = [2, -1]
dot = A * B
print(dot)`,
      language: 'python',
      issue: 'In Python, `A * B` with lists gives an error or element-wise multiplication with NumPy arrays — it does NOT compute the dot product.',
      fix: `import numpy as np
A = np.array([3, 4])
B = np.array([2, -1])
dot = np.dot(A, B)   # or A @ B
print(dot)  # Should print 2`,
    },
    {
      id: 'p1-ch1-010-d2',
      buggyCode: `import numpy as np
A = np.array([1, 2, 3])
B = np.array([4, 5, 6])
dot = A[0]*B[0] + A[1]*B[1]   # forgot z-term
print(dot)`,
      language: 'python',
      issue: 'For 3D vectors the component formula needs all three terms: $A_xB_x + A_yB_y + A_zB_z$. The code drops the $z$-term, giving 14 instead of the correct 32.',
      fix: `import numpy as np
A = np.array([1, 2, 3])
B = np.array([4, 5, 6])
dot = np.dot(A, B)   # handles any dimension automatically
print(dot)  # 1*4 + 2*5 + 3*6 = 4+10+18 = 32`,
    },
  ],

  mastery: {
    targetLevel: 'You can compute the dot product both ways (component and geometric), identify the angle range from its sign, and apply $W = \\vec{F}\\cdot\\vec{d}$ in multi-force problems.',
    prerequisites: ['Vector components and magnitude', 'Trigonometry: $\\cos0°=1$, $\\cos90°=0$, $\\cos180°=-1$'],
    unlocks: ['Finding the angle between two vectors (dot product ÷ product of magnitudes)', 'Scalar projection and vector projection', 'Cross product'],
    checkpoints: [
      'Can compute $\\vec{A}\\cdot\\vec{B}$ from components and from magnitudes + angle — and get the same answer',
      'Can identify perpendicular vectors using the dot product test (result = 0)',
      'Can compute work done by a force using $W = \\vec{F}\\cdot\\vec{d}$ and explain why a perpendicular force does zero work',
      'Can predict the sign of a dot product from a sketch before computing',
    ],
  },

  semantics: {
    core: [
      { symbol: '\\vec{A}\\cdot\\vec{B}', meaning: 'Dot product (scalar product) — a single number measuring "overlap" between $\\vec{A}$ and $\\vec{B}$' },
      { symbol: '\\phi', meaning: 'Angle between the two vectors measured tail-to-tail, always in $[0°, 180°]$' },
      { symbol: '|\\vec{A}||\\vec{B}|\\cos\\phi', meaning: 'Geometric form — requires knowing the angle between vectors' },
      { symbol: 'A_xB_x + A_yB_y', meaning: 'Component form — requires only the $x$ and $y$ components, no angle needed' },
      { symbol: 'W = \\vec{F}\\cdot\\vec{d}', meaning: 'Work = dot product of force and displacement; only the component of force along $\\vec{d}$ contributes' },
      { symbol: '\\vec{A}\\cdot\\vec{A} = |\\vec{A}|^2', meaning: 'Self-dot equals magnitude squared — connects the dot product to vector length' },
    ],
    rulesOfThumb: [
      'Dot product positive → vectors are more aligned than opposed ($\\phi < 90°$); negative → more opposed ($\\phi > 90°$); zero → perfectly perpendicular.',
      'The dot product is a scalar — it has no direction. If your answer is a vector, you made an error.',
      'Use the component formula when you know $x$,$y$,$z$; use the geometric formula when you know magnitudes and angle.',
      'A force perpendicular to motion does zero work — no matter how large the force is.',
      'The dot product is the inner product: it defines angle and length in any $n$-dimensional space, not just 2D and 3D.',
    ],
  },
}
