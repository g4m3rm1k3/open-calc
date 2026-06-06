export default {

  // ── Identity ────────────────────────────────────────────────────────────
  id: 'p1-ch1-002',
  slug: 'vector-notation',
  chapter: 'p1',
  order: 2,
  title: 'Vector Notation',
  subtitle: 'Every symbol physicists use for vectors — and why there are so many.',
  tags: ['vector notation', 'unit vector', 'hat notation', 'component form', 'bold notation'],
  aliases: 'arrow hat i j k notation bracket angle',

  // ── Hook ────────────────────────────────────────────────────────────────
  hook: {
    question: `You open three different physics textbooks. One writes $\\vec{F}$, one writes $\\mathbf{F}$, one writes $F_x\\hat{i} + F_y\\hat{j}$. Are they talking about the same thing?`,
    realWorldContext: `Physics uses several notational systems for vectors — each invented for a different context. Handwriting uses arrows, print uses bold, engineering uses unit-vector notation. Not knowing the equivalences leads to confusion on every exam and in every textbook.`,
    previewVisualizationId: 'SVGDiagram',
    previewVisualizationProps: { type: 'vector-components' },
  },

  // ── YouTube ─────────────────────────────────────────────────────────────
  videos: [
    {
      title: 'Physics 1 – Vectors (2 of 21) Vector Notation',
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'intuition',
    },
    {
      title: 'Physics 1 – Vectors (3 of 21) Components and Magnitudes of a Vector',
      embedCode:
        '<iframe width="560" height="315" src="" frameborder="0" allowfullscreen></iframe>',
      placement: 'math',
    },
  ],

  // ── Intuition ────────────────────────────────────────────────────────────
  intuition: {
    prose: [
      `A vector is a single mathematical idea — but it gets dressed in different clothes depending on the context. Think of it like a person's name: "Elizabeth", "Liz", and "Dr. Smith" all refer to the same person.`,
      `In handwriting you draw a small arrow over the symbol: $\\vec{F}$. Arrows are slow to typeset, so printed textbooks use bold: $\\mathbf{F}$. In engineering and computation, you write out the components explicitly using unit vectors $\\hat{i}$, $\\hat{j}$, $\\hat{k}$.`,
      `The magnitude of a vector — its size stripped of direction — is written with vertical bars: $|\\vec{A}|$ or sometimes just $A$ (no arrow, no bold). Context always tells you which is meant.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Unit vector',
        body: `A vector of magnitude exactly 1. Written with a "hat": $\\hat{u}$. Unit vectors only carry direction — no size. $\\hat{i}$ points along $+x$, $\\hat{j}$ along $+y$, $\\hat{k}$ along $+z$.`,
      },
      {
        type: 'insight',
        title: 'All notations are the same object',
        body: `$\\vec{A}$, $\\mathbf{A}$, $(A_x,A_y)$, $A_x\\hat{i}+A_y\\hat{j}$, and $|\\vec{A}|\\angle\\theta$ all describe the same vector. The notation choice is a matter of context, not meaning.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'All three notations, one vector',
        caption: `The vector shown can be written as $\\vec{A}$ (arrow notation), $\\mathbf{A}$ (bold), or $A_x\\hat{i}+A_y\\hat{j}$ (component form). Same object, three outfits. The right triangle shows how $A_x$ and $A_y$ relate to magnitude $|A|$ and angle $\\theta$.`,
      },
      {
        id: 'SVGDiagram',
        props: { type: 'vector-addition-chain' },
        title: 'Unit vectors: the building blocks',
        caption: `Every vector is a combination of unit vectors along each axis. $\\vec{A} = A_x\\hat{i} + A_y\\hat{j}$. The chain diagram shows how two scaled unit-vector contributions combine into one arrow — the final vector $\\vec{A}$.`,
      },
    ],
  },

  // ── Math ─────────────────────────────────────────────────────────────────
  math: {
    prose: [
      `The **unit vector** in the direction of $\\vec{A}$ is found by dividing $\\vec{A}$ by its magnitude:`,
      `This works because dividing each component by $|\\vec{A}|$ shrinks the arrow to length 1 without changing its direction.`,
      `In 3-D, we add a third component and a third basis vector $\\hat{k}$ along the $z$-axis:`,
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Unit vector in the direction of $\\vec{A}$',
        body: `\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|} = \\frac{A_x\\hat{i} + A_y\\hat{j}}{\\sqrt{A_x^2+A_y^2}}`,
      },
      {
        type: 'theorem',
        title: '3-D unit-vector notation',
        body: `\\vec{A} = A_x\\hat{i} + A_y\\hat{j} + A_z\\hat{k}`,
      },
      {
        type: 'definition',
        title: 'Standard basis vectors',
        body: `\\hat{i} = (1,0,0),\\quad \\hat{j} = (0,1,0),\\quad \\hat{k} = (0,0,1). \\text{ Each has magnitude 1 and points along one coordinate axis.}`,
      },
      {
        type: 'warning',
        title: `Don't confuse $\\hat{i}$ with $i = \\sqrt{-1}$`,
        body: `In physics, $\\hat{i}$ is the unit vector along $+x$. In mathematics, $i$ is the imaginary unit. Context (and the hat) distinguishes them.`,
      },
    ],
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'vector-components' },
        title: 'Unit vector: same direction, length 1',
        caption: `Given any vector $\\vec{A} = (A_x, A_y)$, the unit vector $\\hat{A} = \\vec{A}/|\\vec{A}|$ has the same direction but magnitude exactly 1. The right-triangle diagram shows why dividing by $|\\vec{A}|$ rescales the hypotenuse to 1 without rotating the angle.`,
      },
    ],
  },

  // ── Rigor ─────────────────────────────────────────────────────────────────
  rigor: {
    prose: [
      `The basis vectors $\\hat{i}$, $\\hat{j}$, $\\hat{k}$ are special because they are **orthonormal**: mutually perpendicular (orthogonal) and each of unit length (normal). Any vector in 3-D space can be written uniquely as a linear combination of them.`,
      `The uniqueness of the representation is what makes component form so powerful: there is exactly one set of numbers $(A_x, A_y, A_z)$ for each vector $\\vec{A}$ relative to a given orthonormal basis.`,
    ],
    callouts: [
      {
        type: 'definition',
        title: 'Orthonormal basis',
        body: `A set of vectors $\\{\\hat{e}_1, \\hat{e}_2, \\hat{e}_3\\}$ is orthonormal if $\\hat{e}_i \\cdot \\hat{e}_j = \\delta_{ij}$, where $\\delta_{ij}=1$ if $i=j$ and $0$ otherwise.`,
      },
      {
        type: 'insight',
        title: 'Why orthonormal?',
        body: `Any other basis works mathematically but makes arithmetic messy. Orthonormal bases make dot products, magnitudes, and projections clean — which is why $\\hat{i},\\hat{j},\\hat{k}$ are used everywhere in physics.`,
      },
    ],
    proofSteps: [
      {
        expression: `\\vec{A} = A_x \\hat{i} + A_y \\hat{j}`,
        annotation: `We start with a vector in its standard unit-vector expansion. We want to find its unit vector $\\hat{A}$.`,
      },
      {
        expression: `\\hat{A} = \\frac{\\vec{A}}{|\\vec{A}|}`,
        annotation: `The definition of a unit vector: divide the vector by its own magnitude to keep the direction but set length to 1.`,
      },
      {
        expression: `|\\vec{A}| = \\sqrt{A_x^2 + A_y^2}`,
        annotation: `Calculate the magnitude using the Pythagorean theorem on the components.`,
      },
      {
        expression: `\\hat{A} = \\left(\\frac{A_x}{|\\vec{A}|}\\right) \\hat{i} + \\left(\\frac{A_y}{|\\vec{A}|}\\right) \\hat{j}`,
        annotation: `Divide each component by the magnitude. The arrow shrinks to unit length on the diagram.`,
      },
      {
        expression: `|\\hat{A}|^2 = \\left(\\frac{A_x}{|\\vec{A}|}\\right)^2 + \\left(\\frac{A_y}{|\\vec{A}|}\\right)^2 = \\frac{A_x^2+A_y^2}{|\\vec{A}|^2} = 1`,
        annotation: `The Pythagorean identity confirms the resulting magnitude is exactly 1. $\\hat{A}$ is now a valid unit vector.`,
      },
    ],
    title: 'Proof: dividing by magnitude gives a unit vector',
    visualizations: [
      {
        id: 'SVGDiagram',
        props: { type: 'unit-vector-normalization' },
        title: 'Normalizing a vector — dividing by magnitude gives length 1',
        mathBridge:
          'The diagram shows vector A and its unit vector Â side by side. A has arbitrary length; Â has the same direction but length exactly 1. The dashed unit circle confirms |Â| = 1. Drag the tip of A to change its length and direction — Â always stays on the unit circle. This is the geometric meaning of normalization: project the vector onto the unit circle.',
        caption: 'Â = A/|A| — same direction, length 1. Every unit vector lies on the unit circle.',
      },
      {
        id: 'SVGDiagram',
        props: { type: 'basis-vectors-ijk' },
        title: 'Basis vectors î, ĵ, k̂ — the standard frame',
        mathBridge:
          'The three unit basis vectors are shown in 3D. î points along +x (length 1). ĵ points along +y (length 1). k̂ points along +z (length 1). They are orthogonal (î·ĵ = 0, etc.) and unit length (|î|=1). Any vector in 3D can be written as a linear combination: A = Ax·î + Ay·ĵ + Az·k̂. The components (Ax, Ay, Az) are just scalars telling you how much of each basis vector to include.',
        caption: 'î, ĵ, k̂ form an orthonormal basis. Any 3D vector is a unique combination of these three.',
      },
    ],
  },

  // ── Examples ────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'ch1-002-ex1',
      title: 'Writing a vector in every notation',
      problem: `\\text{A force } \\vec{F} \\text{ has components } F_x = 3\\,N,\\; F_y = 4\\,N. \\text{ Write it in (a) component notation, (b) unit-vector notation, (c) magnitude–angle form, (d) as a unit vector.}`,
      steps: [
        {
          expression: `\\text{(a) } \\vec{F} = (3,\\,4)\\,N`,
          annotation: `Component/bracket notation.`,
        },
        {
          expression: `\\text{(b) } \\vec{F} = 3\\hat{i} + 4\\hat{j}\\,N`,
          annotation: `Unit-vector notation — write each component times its basis vector.`,
        },
        {
          expression: `\\text{(c) } |\\vec{F}| = \\sqrt{9+16} = 5\\,N,\\quad \\theta = \\arctan(4/3) \\approx 53.1°`,
          annotation: `Magnitude–angle form. Both components positive → Quadrant I, no correction needed.`,
        },
        {
          expression: `\\text{(d) } \\hat{F} = \\frac{\\vec{F}}{|\\vec{F}|} = \\frac{3\\hat{i}+4\\hat{j}}{5} = 0.6\\hat{i}+0.8\\hat{j}`,
          annotation: `Divide each component by the magnitude. The result has magnitude 1.`,
        },
      ],
      conclusion: `Any vector can be translated between all four notations. Practice until the conversions are automatic.`,
    },
    {
      id: 'ch1-002-ex2',
      title: 'Identifying notation in the wild',
      problem: `\\text{Match each expression to its notation type: }(a)\\;\\mathbf{v},\\;(b)\\;|\\vec{v}|,\\;(c)\\;v_x\\hat{i}+v_y\\hat{j},\\;(d)\\;(v_x,v_y),\\;(e)\\;\\hat{v}.`,
      steps: [
        {
          expression: `\\text{(a) } \\mathbf{v} \\Rightarrow \\text{bold notation (vector)}`,
          annotation: `Bold in print = arrow in handwriting.`,
        },
        {
          expression: `\\text{(b) } |\\vec{v}| \\Rightarrow \\text{magnitude (scalar)}`,
          annotation: `Vertical bars strip the direction — result is a positive number.`,
        },
        {
          expression: `\\text{(c) } v_x\\hat{i}+v_y\\hat{j} \\Rightarrow \\text{unit-vector notation (vector)}`,
          annotation: `Expanded into basis vectors.`,
        },
        {
          expression: `\\text{(d) } (v_x,v_y) \\Rightarrow \\text{component notation (vector)}`,
          annotation: `Ordered pair of components.`,
        },
        {
          expression: `\\text{(e) } \\hat{v} \\Rightarrow \\text{unit vector (magnitude = 1)}`,
          annotation: `The hat signals direction only, magnitude = 1.`,
        },
      ],
      conclusion: `Notation fluency is a prerequisite for every subsequent topic. If any of these felt slow, drill the pattern viz.`,
    },
  ],

  // ── Challenges ────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch1-002-ch1',
      difficulty: 'easy',
      problem: `\\text{Find the unit vector in the direction of } \\vec{A} = (-5,\\,12).`,
      hint: `Compute $|\\vec{A}|$ first, then divide each component.`,
      walkthrough: [
        {
          expression: `|\\vec{A}| = \\sqrt{(-5)^2 + 12^2} = \\sqrt{25+144} = \\sqrt{169} = 13`,
          annotation: `The 5-12-13 Pythagorean triple.`,
        },
        {
          expression: `\\hat{A} = \\frac{(-5,\\,12)}{13} = \\bigl(-\\tfrac{5}{13},\\;\\tfrac{12}{13}\\bigr)`,
          annotation: `Divide each component by 13.`,
        },
        {
          expression: `\\text{Verify: } \\bigl|\\hat{A}\\bigr| = \\sqrt{(5/13)^2+(12/13)^2} = \\sqrt{25/169+144/169} = \\sqrt{169/169} = 1\\checkmark`,
          annotation: `Always verify the result has magnitude 1.`,
        },
      ],
      answer: `\\hat{A} = \\bigl(-\\tfrac{5}{13},\\;\\tfrac{12}{13}\\bigr)`,
    },
    {
      id: 'ch1-002-ch2',
      difficulty: 'medium',
      problem: `\\text{A 3-D vector is given as } \\vec{B} = 2\\hat{i} - 6\\hat{j} + 3\\hat{k}. \\text{ Find } |\\vec{B}| \\text{ and } \\hat{B}.`,
      hint: `The Pythagorean theorem extends to 3-D: $|\\vec{B}| = \\sqrt{B_x^2+B_y^2+B_z^2}$.`,
      walkthrough: [
        {
          expression: `|\\vec{B}| = \\sqrt{2^2+(-6)^2+3^2} = \\sqrt{4+36+9} = \\sqrt{49} = 7`,
          annotation: `3-D Pythagorean theorem.`,
        },
        {
          expression: `\\hat{B} = \\frac{2\\hat{i}-6\\hat{j}+3\\hat{k}}{7} = \\tfrac{2}{7}\\hat{i} - \\tfrac{6}{7}\\hat{j} + \\tfrac{3}{7}\\hat{k}`,
          annotation: `Divide each component by 7.`,
        },
      ],
      answer: `|\\vec{B}| = 7,\\quad \\hat{B} = \\tfrac{2}{7}\\hat{i} - \\tfrac{6}{7}\\hat{j} + \\tfrac{3}{7}\\hat{k}`,
    },
  ],

  misconceptions: [
    {
      id: 'p1-ch1-002-mis1',
      misconception: `$\\hat{i}$ (the unit vector along $+x$) is the same as $i = \\sqrt{-1}$ (the imaginary unit).`,
      why: `Both symbols look identical when written without context. Students who have seen complex numbers first sometimes confuse them when switching to physics.`,
      correction: `In physics, $\\hat{\\imath}$ (with a hat) is a unit vector along the $+x$ axis with magnitude 1. The imaginary unit $i = \\sqrt{-1}$ has nothing to do with direction. Context and the hat symbol distinguish them. Many physics texts use $\\hat{e}_x$ instead to avoid any ambiguity.`,
      correctionExample: `$\\vec{F} = 3\\hat{\\imath} + 4\\hat{\\jmath}$ means a force 3 N in the $+x$ direction plus 4 N in the $+y$ direction. No imaginary numbers involved.`,
    },
    {
      id: 'p1-ch1-002-mis2',
      misconception: `The unit vector $\\hat{A}$ is just $\\vec{A}$ with its magnitude set to 1 — so a unit vector has magnitude 1 N (or m/s, etc.).`,
      why: `Students see that $\\hat{A}$ has magnitude 1 and assume "1" carries the units of the original vector.`,
      correction: `Unit vectors are dimensionless — they have no physical units. $\\hat{A} = \\vec{A}/|\\vec{A}|$ is a pure direction indicator. The units cancel: if $\\vec{F}$ is in N and $|\\vec{F}|$ is in N, then $\\hat{F} = \\vec{F}/|\\vec{F}|$ is in N/N = dimensionless.`,
      correctionExample: `$\\vec{F} = (3, 4)$ N has $|\\vec{F}| = 5$ N. The unit vector $\\hat{F} = (0.6, 0.8)$ — no units. To reconstruct: $\\vec{F} = 5\\,\\text{N} \\times (0.6, 0.8) = (3, 4)$ N.`,
    },
  ],

  transferPrompts: [
    {
      id: 'p1-ch1-002-tp1',
      prompt: `In computer graphics, every surface has a "normal vector" $\\hat{n}$ — a unit vector pointing perpendicular to the surface. Why must it be a unit vector (not just any perpendicular vector)? How would a lighting calculation break if $|\\hat{n}| \\neq 1$?`,
      connection: `Lighting calculations use the dot product $\\hat{n} \\cdot \\hat{L}$ (where $\\hat{L}$ is the light direction) to compute how bright a surface appears. Both must be unit vectors for the result to be a cosine between 0 and 1. If $|\\hat{n}| = 2$, the brightness calculation gives values up to 2, producing physically impossible "over-bright" surfaces.`,
    },
    {
      id: 'p1-ch1-002-tp2',
      prompt: `A GPS navigation system receives signals from three satellites at positions $\\vec{r}_1$, $\\vec{r}_2$, $\\vec{r}_3$ relative to you. To find your position, it needs to know the direction from you to each satellite — but not the distance. How would you compute those direction unit vectors, and why are unit vectors sufficient for the direction information?`,
      connection: `Direction from origin to satellite $i$: $\\hat{r}_i = \\vec{r}_i / |\\vec{r}_i|$. The unit vector carries only directional information (angular position of the satellite), which is what matters for computing the direction of the signal received. The distance $|\\vec{r}_i|$ is given by the signal travel time. Separating direction from magnitude is exactly what unit vectors are designed for.`,
    },
  ],

  debugging: [
    {
      id: 'p1-ch1-002-dbg1',
      error: `A student computes the unit vector of $\\vec{F} = (3, 4)$ as $\\hat{F} = (3, 4) / (3+4) = (3/7, 4/7)$.`,
      explanation: `The denominator is the SUM of components ($3 + 4 = 7$), not the MAGNITUDE ($\\sqrt{9+16} = 5$). The unit vector formula divides by $|\\vec{F}| = \\sqrt{F_x^2 + F_y^2}$, not by $F_x + F_y$. Adding components has no geometric meaning.`,
      fix: `$|\\vec{F}| = \\sqrt{3^2 + 4^2} = 5$. $\\hat{F} = (3/5, 4/5) = (0.6, 0.8)$. Verify: $\\sqrt{0.6^2 + 0.8^2} = \\sqrt{0.36 + 0.64} = \\sqrt{1} = 1$ ✓.`,
    },
    {
      id: 'p1-ch1-002-dbg2',
      error: `A student is given $\\vec{B} = 2\\hat{\\imath} - 6\\hat{\\jmath} + 3\\hat{k}$ and writes: $|\\vec{B}| = 2 - 6 + 3 = -1$.`,
      explanation: `Magnitude is NOT the sum of components. Summing signed components can give a negative number — but magnitude is always non-negative. This error would make the unit vector undefined (dividing by $-1$ would flip the direction).`,
      fix: `$|\\vec{B}| = \\sqrt{2^2 + (-6)^2 + 3^2} = \\sqrt{4 + 36 + 9} = \\sqrt{49} = 7$. Square each component (making negatives positive), add, then take the square root.`,
    },
  ],

  mastery: {
    targetLevel: `Recognize all standard vector notations ($\\vec{A}$, $\\mathbf{A}$, $(A_x, A_y)$, $A_x\\hat{\\imath}+A_y\\hat{\\jmath}$, $|\\vec{A}|\\angle\\theta$), compute unit vectors by dividing by magnitude, and extend to 3D.`,
    checklistItems: [
      `Can identify and translate between arrow, bold, component, unit-vector, and magnitude-angle notations`,
      `Can compute $\\hat{A} = \\vec{A}/|\\vec{A}|$ for any 2D or 3D vector`,
      `Can verify a unit vector by confirming its magnitude equals 1`,
      `Understands that unit vectors are dimensionless direction indicators`,
      `Can reconstruct any vector as $\\vec{A} = |\\vec{A}|\\hat{A}$ (magnitude × direction)`,
    ],
    commonStruggles: [
      `Dividing by the sum of components instead of the magnitude when computing unit vectors`,
      `Confusing $\\hat{\\imath}$ (unit vector) with $i$ (imaginary unit)`,
      `Thinking unit vectors carry the units (N, m/s, etc.) of the original vector`,
    ],
    nextSteps: [
      `03-components-magnitudes.js — deeper practice with the two conversion directions`,
      `04-adding-vectors-parallelogram.js — adding vectors using components`,
      `10-dot-product-intro.js — unit vectors appear in the dot product definition`,
    ],
  },

  semantics: {
    core: [
      { symbol: `\\hat{A}`, meaning: `Unit vector in the direction of $\\vec{A}$; dimensionless, magnitude exactly 1` },
      { symbol: `\\hat{A} = \\vec{A}/|\\vec{A}|`, meaning: `How to compute a unit vector: divide by magnitude` },
      { symbol: `\\hat{\\imath},\\, \\hat{\\jmath},\\, \\hat{k}`, meaning: `Standard basis unit vectors along $+x$, $+y$, $+z$ axes respectively` },
      { symbol: `\\vec{A} = A_x\\hat{\\imath} + A_y\\hat{\\jmath}`, meaning: `Unit-vector notation: every 2D vector is a sum of scaled basis vectors` },
      { symbol: `|\\vec{A}|`, meaning: `Magnitude (scalar) — always $\\geq 0$; same as $\\|\\vec{A}\\|$` },
    ],
    rulesOfThumb: [
      `Unit vector = same direction, magnitude exactly 1; verify by computing $\\sqrt{\\hat{A}_x^2 + \\hat{A}_y^2} = 1$.`,
      `All notation forms ($\\vec{A}$, $\\mathbf{A}$, $(A_x, A_y)$, $A_x\\hat{\\imath}+A_y\\hat{\\jmath}$) describe the same object.`,
      `$|\\vec{A}|$ is always non-negative; you cannot have a negative magnitude.`,
      `Unit vectors are dimensionless — the units of $\\vec{A}$ cancel when you divide by $|\\vec{A}|$.`,
      `Any vector decomposes as $\\vec{A} = |\\vec{A}|\\hat{A}$ — magnitude times direction unit vector.`,
    ],
  },

  notebooks: {
    python: {
      type: 'PythonNotebook',
      title: 'Vector Notation in Python',
      cells: [
        {
          cellTitle: 'All five notations for one vector',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# F = 3 N east + 4 N north  →  five equivalent descriptions
F = np.array([3.0, 4.0])   # component form

mag = np.linalg.norm(F)                          # |F| = sqrt(3^2+4^2)
angle = np.degrees(np.arctan2(F[1], F[0]))       # theta = atan2(y,x)
F_hat = F / mag                                   # unit vector = F / |F|

print("All five notations for the same vector F = (3, 4) N:")
print(f"  (a) Component:       ({F[0]}, {F[1]}) N")
print(f"  (b) Unit-vector:     {F[0]}*i_hat + {F[1]}*j_hat  N")
print(f"  (c) Bold:            F = (equivalent to the above)")
print(f"  (d) Magnitude-angle: {mag:.2f} N at {angle:.2f} deg")
print(f"  (e) Unit vector:     F_hat = ({F_hat[0]:.4f}, {F_hat[1]:.4f})")
print()
print(f"Verify F_hat magnitude: {np.linalg.norm(F_hat):.10f}  (must be 1)")
print(f"Reconstruct F = |F| * F_hat: {mag * F_hat}  (must match original)")`,
          prose: [
            `\`F = np.array([3.0, 4.0])\` is the component form — the foundation from which all other notations are computed. The unit-vector form $3\\hat{\\imath} + 4\\hat{\\jmath}$ is just a human-readable way of writing the same array.`,
            `\`F_hat = F / mag\` computes the unit vector $\\hat{F} = \\vec{F}/|\\vec{F}|$ — element-wise division divides each component by the magnitude. The result has the same direction but length 1.`,
            `The reconstruction \`mag * F_hat\` verifies the decomposition $\\vec{F} = |\\vec{F}|\\hat{F}$: magnitude times unit vector gives back the original. All five notations carry identical information — they're just different ways of writing the same arrow.`,
          ],
        },
        {
          cellTitle: 'Visualizing a vector and its unit vector',
          type: 'code',
          language: 'python',
          code: `import numpy as np
import matplotlib.pyplot as plt

F = np.array([3.0, 4.0])
mag = np.linalg.norm(F)
F_hat = F / mag   # unit vector: same direction, length 1

fig, ax = plt.subplots(figsize=(6, 6))
ax.set_aspect('equal')

# Draw original vector F (blue, full length)
ax.annotate('', xy=F, xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='blue', lw=2.5))
ax.text(F[0]/2 - 0.5, F[1]/2 + 0.2, f'F = {mag:.1f} N', color='blue', fontsize=12)

# Draw unit vector F_hat (red, length 1, same direction)
ax.annotate('', xy=F_hat, xytext=(0, 0),
            arrowprops=dict(arrowstyle='->', color='red', lw=2.5))
ax.text(F_hat[0] + 0.05, F_hat[1] - 0.25, r'$\\hat{F}$' + f' = 1 (no units)', color='red', fontsize=11)

# Draw the "shrunk" scale factor
ax.annotate('', xy=F, xytext=F_hat,
            arrowprops=dict(arrowstyle='<->', color='purple', lw=1.5))
ax.text((F[0] + F_hat[0])/2 + 0.15, (F[1] + F_hat[1])/2, f'× {mag:.0f}', color='purple', fontsize=10)

ax.set_xlim(-0.5, 4.5); ax.set_ylim(-0.5, 5.5)
ax.axhline(0, color='k', lw=0.7); ax.axvline(0, color='k', lw=0.7)
ax.set_xlabel('x'); ax.set_ylabel('y')
ax.set_title('Vector F (blue) and its unit vector F_hat (red)')
ax.grid(True, alpha=0.3)
plt.tight_layout(); plt.savefig('unit_vector.png', dpi=120); plt.show()`,
          prose: [
            `The blue arrow is $\\vec{F} = (3, 4)$ N with length 5. The red arrow is $\\hat{F} = (0.6, 0.8)$ with length 1 — same direction, just scaled down by a factor of $|\\vec{F}| = 5$.`,
            `The purple double-arrow marks the "× 5" scaling between $\\hat{F}$ and $\\vec{F}$. This visualizes the decomposition $\\vec{F} = |\\vec{F}|\\hat{F}$: start with the unit vector, scale it by the magnitude, and you get the original vector back.`,
            `Both arrows have the same angle — that is what "same direction" means. The only difference is length. This is why unit vectors are useful: they carry pure directional information, separated from the magnitude.`,
          ],
        },
        {
          cellTitle: '3D vectors: extending to x, y, z with hat-k',
          type: 'code',
          language: 'python',
          code: `import numpy as np

# 3D vector from lesson challenge: B = 2*i_hat - 6*j_hat + 3*k_hat
B = np.array([2.0, -6.0, 3.0])

mag_B = np.linalg.norm(B)   # |B| = sqrt(Bx^2 + By^2 + Bz^2)
B_hat = B / mag_B            # unit vector in 3D

print(f"B = {B[0]}*i_hat + {B[1]}*j_hat + {B[2]}*k_hat")
print(f"|B| = sqrt({B[0]**2:.0f} + {(B[1])**2:.0f} + {B[2]**2:.0f})")
print(f"    = sqrt({B[0]**2 + B[1]**2 + B[2]**2:.0f}) = {mag_B:.4f}")
print(f"B_hat = ({B_hat[0]:.4f}, {B_hat[1]:.4f}, {B_hat[2]:.4f})")
print(f"|B_hat| = {np.linalg.norm(B_hat):.10f}  (must be 1)")
print()

# Show the orthonormal basis vectors
i_hat = np.array([1, 0, 0])
j_hat = np.array([0, 1, 0])
k_hat = np.array([0, 0, 1])
print("Standard basis magnitudes:", np.linalg.norm(i_hat), np.linalg.norm(j_hat), np.linalg.norm(k_hat))
print("Verify B = Bx*i + By*j + Bz*k:", B[0]*i_hat + B[1]*j_hat + B[2]*k_hat)`,
          prose: [
            `In 3D, \`B = np.array([2.0, -6.0, 3.0])\` stores all three components. \`np.linalg.norm(B)\` computes $|B| = \\sqrt{B_x^2 + B_y^2 + B_z^2} = \\sqrt{4+36+9} = 7$ — the Pythagorean theorem in 3D.`,
            `The last block constructs the standard basis vectors explicitly and verifies $\\vec{B} = B_x\\hat{\\imath} + B_y\\hat{\\jmath} + B_z\\hat{k}$ by linear combination. This shows that the unit-vector notation is just a compact way of writing a weighted sum of basis vectors.`,
            `Notice $-6$ squared is $36$ (positive) — squaring removes the sign, which is why magnitude is always non-negative. A common mistake is adding signed components instead of squaring them: $2 + (-6) + 3 = -1 \\neq 7$.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the unit vector for a 3D cable force',
          type: 'code',
          language: 'python',
          challengeType: 'write',
          starterCode: `import numpy as np

# A cable exerts force T = 6*i_hat - 2*j_hat + 9*k_hat  N
# 1. Create the numpy array T
# 2. Compute T_mag = |T|
# 3. Compute T_hat = unit vector of T
# 4. Verify |T_hat| = 1

T = np.array([___, ___, ___])   # fill in 6, -2, 9
T_mag = ___                     # magnitude formula
T_hat = ___                     # unit vector formula

print(f"|T| = {T_mag:.4f} N  (expected 11.0)")
print(f"T_hat = ({T_hat[0]:.4f}, {T_hat[1]:.4f}, {T_hat[2]:.4f})")
print(f"|T_hat| = {np.linalg.norm(T_hat):.10f}  (must be 1.0)")`,
          prose: [
            `Fill in three blanks: the array values \`[6, -2, 9]\`, the magnitude \`np.linalg.norm(T)\`, and the unit vector \`T / T_mag\`. Expected: $|T| = \\sqrt{36+4+81} = \\sqrt{121} = 11$ N.`,
            `The unit vector $\\hat{T} = T/11 = (6/11, -2/11, 9/11) \\approx (0.545, -0.182, 0.818)$. It tells you which direction the cable pulls — useful in statics where you need to decompose a cable force into components.`,
            `The verification \`np.linalg.norm(T_hat)\` should print exactly 1.0 (or very close due to floating point). If it doesn't, your \`T_hat\` formula is wrong. This round-trip check is a habit worth building.`,
          ],
        },
      ],
    },
    matlab: {
      type: 'OpenMatNotebook',
      title: 'Vector Notation in MATLAB/Octave',
      cells: [
        {
          cellTitle: 'All five notations for one vector',
          type: 'code',
          language: 'matlab',
          code: `% F = 3 N east + 4 N north — five equivalent descriptions
F = [3.0, 4.0];   % component form (row vector)

mag = norm(F);                          % |F| = sqrt(Fx^2 + Fy^2)
angle_deg = rad2deg(atan2(F(2), F(1))); % theta using atan2(y,x)
F_hat = F / mag;                        % unit vector = F / |F|

fprintf('All five notations for F = (3, 4) N:\\n');
fprintf('  (a) Component:       (%.1f, %.1f) N\\n', F(1), F(2));
fprintf('  (b) Unit-vector:     %.1f*i_hat + %.1f*j_hat  N\\n', F(1), F(2));
fprintf('  (d) Magnitude-angle: %.2f N at %.2f deg\\n', mag, angle_deg);
fprintf('  (e) Unit vector:     F_hat = (%.4f, %.4f)\\n', F_hat(1), F_hat(2));
fprintf('\\n');
fprintf('Verify |F_hat| = %.10f  (must be 1)\\n', norm(F_hat));
fprintf('Reconstruct |F|*F_hat = (%.4f, %.4f)  (must match original)\\n', (mag*F_hat)(1), (mag*F_hat)(2));`,
          prose: [
            `In MATLAB, \`F = [3.0, 4.0]\` is a row vector with the same two components as the Python \`np.array([3.0, 4.0])\`. \`norm(F)\` computes the Euclidean magnitude and \`F / mag\` divides each element by the scalar magnitude to give the unit vector.`,
            `\`atan2(F(2), F(1))\` — note 1-based indexing: \`F(1)\` is x, \`F(2)\` is y. The function signature is \`atan2(y, x)\`, same as Python's \`arctan2\`. \`rad2deg\` converts radians to degrees.`,
            `The reconstruction \`mag * F_hat\` uses scalar-times-vector multiplication. In MATLAB this broadcasts the scalar across all elements. The result should exactly match \`F = [3.0, 4.0]\`, confirming the decomposition $\\vec{F} = |\\vec{F}|\\hat{F}$.`,
          ],
        },
        {
          cellTitle: 'Visualizing a vector and its unit vector',
          type: 'code',
          language: 'matlab',
          code: `F = [3.0, 4.0];
mag = norm(F);
F_hat = F / mag;

figure; hold on; axis equal;
xlim([-0.5, 4.5]); ylim([-0.5, 5.5]);

% Original vector F (blue)
quiver(0, 0, F(1), F(2), 'b', 'LineWidth', 2.5, 'MaxHeadSize', 0.4, ...
       'DisplayName', sprintf('|F| = %.1f N', mag));

% Unit vector F_hat (red, same direction, length 1)
quiver(0, 0, F_hat(1), F_hat(2), 'r', 'LineWidth', 2.5, 'MaxHeadSize', 0.4, ...
       'DisplayName', sprintf('|F_hat| = 1 (dimensionless)'));

% Scale factor annotation
quiver(F_hat(1), F_hat(2), F(1)-F_hat(1), F(2)-F_hat(2), 'm', ...
       'LineWidth', 1.5, 'MaxHeadSize', 0.3, 'DisplayName', sprintf('x %.0f', mag));

xline(0, 'k-', 'LineWidth', 0.7); yline(0, 'k-', 'LineWidth', 0.7);
xlabel('x'); ylabel('y');
title('Vector F (blue) and unit vector F-hat (red)');
legend('Location', 'northwest'); grid on;`,
          prose: [
            `Three \`quiver\` calls draw: (1) the full vector $\\vec{F}$ from origin to $(3, 4)$; (2) the unit vector $\\hat{F}$ from origin to $(0.6, 0.8)$; (3) a magenta arrow from the tip of $\\hat{F}$ to the tip of $\\vec{F}$, representing the "× 5" scaling.`,
            `Both arrows have identical angles — same direction. The only difference is length: 5 for the blue, 1 for the red. This is the visual proof that $\\hat{F}$ contains all directional information from $\\vec{F}$, with magnitude stripped out.`,
            `\`'MaxHeadSize', 0.4\` scales the arrowhead relative to the arrow length. Without this, MATLAB auto-scales arrowheads and the short unit-vector arrow would look disproportionate.`,
          ],
        },
        {
          cellTitle: '3D vectors: extending to x, y, z with hat-k',
          type: 'code',
          language: 'matlab',
          code: `% 3D vector: B = 2*i_hat - 6*j_hat + 3*k_hat
B = [2.0, -6.0, 3.0];

mag_B = norm(B);     % |B| = sqrt(Bx^2 + By^2 + Bz^2)
B_hat = B / mag_B;   % 3D unit vector

fprintf('B = %.1f*i_hat + %.1f*j_hat + %.1f*k_hat\\n', B(1), B(2), B(3));
fprintf('|B| = sqrt(%.0f + %.0f + %.0f) = sqrt(%.0f) = %.4f\\n', ...
        B(1)^2, B(2)^2, B(3)^2, B(1)^2+B(2)^2+B(3)^2, mag_B);
fprintf('B_hat = (%.4f, %.4f, %.4f)\\n', B_hat(1), B_hat(2), B_hat(3));
fprintf('|B_hat| = %.10f  (must be 1)\\n', norm(B_hat));

% Standard basis vectors
i_hat = [1, 0, 0]; j_hat = [0, 1, 0]; k_hat = [0, 0, 1];
fprintf('Basis magnitudes: %.0f, %.0f, %.0f\\n', norm(i_hat), norm(j_hat), norm(k_hat));
fprintf('Verify B = Bx*i + By*j + Bz*k: (%.1f, %.1f, %.1f)\\n', ...
        B(1)*i_hat + B(2)*j_hat + B(3)*k_hat);`,
          prose: [
            `In MATLAB, 3D vectors are just longer arrays: \`B = [2.0, -6.0, 3.0]\`. \`norm(B)\` applies the 3D Pythagorean formula $\\sqrt{B_x^2+B_y^2+B_z^2}$ automatically regardless of the array length.`,
            `The basis construction \`B(1)*i_hat + B(2)*j_hat + B(3)*k_hat\` confirms that the unit-vector notation is literally scalar multiplication and vector addition. MATLAB performs this as element-wise arithmetic on row vectors.`,
            `Note \`B(2)^2 = (-6)^2 = 36\` — MATLAB's \`^\` operator squares the value, not the sign. This is why magnitude is always positive even when components are negative.`,
          ],
        },
        {
          cellTitle: 'Challenge: find the unit vector for a 3D cable force',
          type: 'code',
          language: 'matlab',
          challengeType: 'write',
          starterCode: `% A cable exerts force T = 6*i_hat - 2*j_hat + 9*k_hat  N
% 1. Create row vector T = [6, -2, 9]
% 2. Compute T_mag = norm(T)
% 3. Compute T_hat = T / T_mag
% 4. Verify norm(T_hat) = 1

T = [___, ___, ___];    % fill in 6, -2, 9
T_mag = ___;             % magnitude
T_hat = ___;             % unit vector

fprintf('|T| = %.4f N  (expected 11.0)\\n', T_mag);
fprintf('T_hat = (%.4f, %.4f, %.4f)\\n', T_hat(1), T_hat(2), T_hat(3));
fprintf('|T_hat| = %.10f  (must be 1.0)\\n', norm(T_hat));`,
          prose: [
            `Fill in \`T = [6, -2, 9]\`, \`T_mag = norm(T)\`, and \`T_hat = T / T_mag\`. Expected: $|T| = \\sqrt{36+4+81} = \\sqrt{121} = 11$ N, $\\hat{T} \\approx (0.5455, -0.1818, 0.8182)$.`,
            `The unit vector $\\hat{T}$ tells a structural engineer which direction the cable force acts. Once you know $\\hat{T}$, you can write the full force as $\\vec{T} = 11\\hat{T}$ — factoring magnitude from direction is exactly what unit vectors enable.`,
            `\`norm(T_hat)\` should print 1.0000000000 (10 decimal places). Any deviation beyond floating-point precision ($\\sim 10^{-15}$) indicates a formula error.`,
          ],
        },
      ],
    },
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-002-q1',
      type: 'choice',
      question: `Which notation represents a unit vector?`,
      options: [`$\\vec{A}$`, `$\\mathbf{A}$`, `$\\hat{A}$`, `$|\\vec{A}|$`],
      answer: `$\\hat{A}$`,
      hints: [`A "hat" ($\\hat{\\ }$) on a symbol signals a unit vector — magnitude exactly 1.`, `$\\vec{A}$ and $\\mathbf{A}$ are full vectors; $|\\vec{A}|$ is the magnitude (scalar).`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-002-q2',
      type: 'choice',
      question: `The expression $|\\vec{F}|$ represents:`,
      options: [
        `A vector in the direction of $\\vec{F}$`,
        `The magnitude of $\\vec{F}$ — a non-negative scalar`,
        `The unit vector of $\\vec{F}$`,
        `The components of $\\vec{F}$`,
      ],
      answer: `The magnitude of $\\vec{F}$ — a non-negative scalar`,
      hints: [`Vertical bars around a vector notation always indicate magnitude.`, `The result is a single non-negative number — no direction information.`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-002-q3',
      type: 'choice',
      question: `A force has $F_x = 3$ N, $F_y = 4$ N. What is the unit vector $\\hat{F}$?`,
      options: [`$(3, 4)$`, `$(0.6, 0.8)$`, `$(3/7, 4/7)$`, `$(1.5, 2)$`],
      answer: `$(0.6, 0.8)$`,
      hints: [`$|\\vec{F}| = \\sqrt{9+16} = 5$ N. Then $\\hat{F} = \\vec{F}/|\\vec{F}|$.`, `$(3/5, 4/5) = (0.6, 0.8)$. Verify: $\\sqrt{0.6^2 + 0.8^2} = 1$. ✓`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-002-q4',
      type: 'choice',
      question: `In 3D, what is $\\hat{k}$?`,
      options: [
        `A unit vector along $+y$`,
        `A unit vector along $+z$`,
        `A unit vector along $+x$`,
        `The imaginary unit $\\sqrt{-1}$`,
      ],
      answer: `A unit vector along $+z$`,
      hints: [`$\\hat{\\imath}$ = x-axis, $\\hat{\\jmath}$ = y-axis, $\\hat{k}$ = z-axis.`, `$\\hat{k} = (0, 0, 1)$ — the third axis. It is NOT the imaginary unit (which has no hat).`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-002-q5',
      type: 'choice',
      question: `Which of the following is a scalar?`,
      options: [
        `$F_x\\hat{\\imath} + F_y\\hat{\\jmath}$`,
        `$\\vec{F}$`,
        `$\\sqrt{F_x^2+F_y^2}$`,
        `$(F_x, F_y)$`,
      ],
      answer: `$\\sqrt{F_x^2+F_y^2}$`,
      hints: [`Magnitude $= \\sqrt{F_x^2+F_y^2} = |\\vec{F}|$ — a non-negative number with no direction.`, `All other options are vectors (they have directional content).`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-002-q6',
      type: 'choice',
      question: `$\\vec{B} = 2\\hat{\\imath} - 6\\hat{\\jmath} + 3\\hat{k}$. What is $|\\vec{B}|$?`,
      options: [`$-1$`, `$7$`, `$11$`, `$49$`],
      answer: `$7$`,
      hints: [`$|\\vec{B}| = \\sqrt{2^2 + (-6)^2 + 3^2}$. Squaring removes the sign from $-6$.`, `$\\sqrt{4+36+9} = \\sqrt{49} = 7$.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-002-q7',
      type: 'choice',
      question: `If $\\hat{A} = (0.6, 0.8)$, what is $|\\hat{A}|$?`,
      options: [`$1.4$`, `$1.0$`, `$0.7$`, `$0.6$`],
      answer: `$1.0$`,
      hints: [`Unit vectors have magnitude exactly 1, by definition.`, `$\\sqrt{0.6^2+0.8^2} = \\sqrt{0.36+0.64} = \\sqrt{1.0} = 1.0$.`],
      reviewSection: 'intuition',
    },
    {
      id: 'p1-ch1-002-q8',
      type: 'choice',
      question: `$|\\vec{A}|=5$, $\\theta=53.1°$. Which component form matches?`,
      options: [`$(3, 4)$`, `$(4, 3)$`, `$(5, 0)$`, `$(2.5, 2.5)$`],
      answer: `$(3, 4)$`,
      hints: [`$A_x = 5\\cos53.1° \\approx 3$; $A_y = 5\\sin53.1° \\approx 4$.`, `The 3-4-5 triangle: $\\cos(53.1°) \\approx 0.6$, $\\sin(53.1°) \\approx 0.8$.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-002-q9',
      type: 'choice',
      question: `A student computes $|\\vec{A}| = A_x + A_y$ for $\\vec{A} = (3, -4)$ and gets $-1$. What is the error?`,
      options: [
        `Magnitude should be $|A_x| + |A_y| = 7$`,
        `Magnitude uses the Pythagorean formula: $\\sqrt{3^2+(-4)^2} = 5$`,
        `The negative component makes the magnitude negative`,
        `Magnitude equals $A_x - A_y = 7$`,
      ],
      answer: `Magnitude uses the Pythagorean formula: $\\sqrt{3^2+(-4)^2} = 5$`,
      hints: [`Magnitude is NEVER a sum of components — it is always $\\sqrt{\\sum A_i^2}$.`, `Squaring removes the negative: $(-4)^2 = 16$, so $|\\vec{A}| = \\sqrt{9+16} = 5$.`],
      reviewSection: 'math',
    },
    {
      id: 'p1-ch1-002-q10',
      type: 'choice',
      question: `What are the units of the unit vector $\\hat{F}$ if $\\vec{F}$ is measured in Newtons?`,
      options: [
        `Newtons (N)`,
        `Meters (m)`,
        `Dimensionless (no units)`,
        `N/m`,
      ],
      answer: `Dimensionless (no units)`,
      hints: [`$\\hat{F} = \\vec{F}/|\\vec{F}|$. Units of numerator: N. Units of denominator: N. N/N = dimensionless.`, `Unit vectors are pure direction indicators — they carry no physical units.`],
      reviewSection: 'intuition',
    },
  ],
}
