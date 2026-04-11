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
    visualizations: [],
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

  // ── Python Notebook ──────────────────────────────────────────────────────
  python: {
    title: 'Vector Notation in Python — all forms, one object',
    description: `We represent vectors with NumPy arrays and practice converting between every notation form: component, unit-vector, magnitude-angle, and unit vector.`,
    placement: 'after_rigor',
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'Notation Lab — One Vector, Five Representations',
        caption: 'Run each cell to see all five notations for the same vector.',
        props: {
          initialCells: [
            {
              id: 1,
              cellTitle: '1 · Define a vector and display all notations',
              prose: `In physics we write $\\vec{F} = 3\\hat{\\imath} + 4\\hat{\\jmath}$ N. In Python: \`F = np.array([3.0, 4.0])\`.\n\nLet us compute every notation form from this single array.`,
              code: [
                'import numpy as np',
                '',
                '# Define the vector',
                'F = np.array([3.0, 4.0])   # F_x = 3 N, F_y = 4 N',
                '',
                '# (a) Component notation: just print the array',
                'print(f"(a) Component form:       F = ({F[0]}, {F[1]}) N")',
                '',
                '# (b) Unit-vector notation',
                'print(f"(b) Unit-vector form:     F = {F[0]}*i_hat + {F[1]}*j_hat  N")',
                '',
                '# (c) Magnitude',
                'mag = np.linalg.norm(F)',
                'print(f"(c) Magnitude:            |F| = {mag:.4f} N")',
                '',
                '# (d) Angle (physics convention: CCW from +x)',
                'angle = np.degrees(np.arctan2(F[1], F[0]))',
                'print(f"(d) Magnitude-angle form: |F|∠θ = {mag:.2f} N ∠ {angle:.2f}°")',
                '',
                '# (e) Unit vector',
                'F_hat = F / mag',
                'print(f"(e) Unit vector:          F_hat = ({F_hat[0]:.4f}, {F_hat[1]:.4f})")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 2,
              cellTitle: '2 · Verify the unit vector has magnitude 1',
              prose: `A unit vector must have magnitude exactly 1 — that is its defining property. Let us verify and also show that $\\hat{F}$ points in the same direction as $\\vec{F}$.`,
              code: [
                '# The unit vector computed above',
                'print(f"|F_hat| = {np.linalg.norm(F_hat):.10f}  (should be exactly 1)")',
                '',
                '# Same direction check: angle should match F',
                'angle_hat = np.degrees(np.arctan2(F_hat[1], F_hat[0]))',
                'print(f"Angle of F_hat = {angle_hat:.2f}°  (matches F at {angle:.2f}°)")',
                '',
                '# Scaling: F = |F| * F_hat',
                'F_reconstructed = mag * F_hat',
                'print(f"mag * F_hat = ({F_reconstructed[0]:.4f}, {F_reconstructed[1]:.4f})  (should be (3, 4))")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 3,
              cellTitle: '3 · Convert from magnitude-angle to components',
              prose: `Starting from magnitude-angle form $|\\vec{A}| = 13$, $\\theta = 112.6°$, recover the components.\n\n$A_x = |\\vec{A}|\\cos\\theta$,  $A_y = |\\vec{A}|\\sin\\theta$.`,
              code: [
                'mag_A = 13.0',
                'theta_deg = 112.6',
                'theta_rad = np.radians(theta_deg)',
                '',
                'Ax = mag_A * np.cos(theta_rad)',
                'Ay = mag_A * np.sin(theta_rad)',
                '',
                'print(f"A_x = {Ax:.3f}")',
                'print(f"A_y = {Ay:.3f}")',
                '',
                '# Round-trip check: recover magnitude and angle',
                'mag_check = np.linalg.norm([Ax, Ay])',
                'angle_check = np.degrees(np.arctan2(Ay, Ax))',
                'print(f"Round-trip: |A| = {mag_check:.4f}, θ = {angle_check:.2f}°")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 4,
              cellTitle: '4 · 3-D vectors: unit-vector notation with î ĵ k̂',
              prose: `In 3-D we add a $z$-component and a third basis vector $\\hat{k}$:\n$\\vec{B} = B_x\\hat{\\imath} + B_y\\hat{\\jmath} + B_z\\hat{k}$\n\nThe Pythagorean theorem extends: $|\\vec{B}| = \\sqrt{B_x^2 + B_y^2 + B_z^2}$.`,
              code: [
                'B = np.array([2.0, -6.0, 3.0])   # same vector as in lesson challenges',
                '',
                'mag_B = np.linalg.norm(B)',
                'B_hat = B / mag_B',
                '',
                'print(f"B = {B[0]}*i + {B[1]}*j + {B[2]}*k")',
                'print(f"|B| = sqrt({B[0]**2:.0f} + {B[1]**2:.0f} + {B[2]**2:.0f}) = {mag_B:.4f}")',
                'print(f"B_hat = ({B_hat[0]:.4f}, {B_hat[1]:.4f}, {B_hat[2]:.4f})")',
                'print(f"|B_hat| = {np.linalg.norm(B_hat):.10f}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
            },
            {
              id: 5,
              cellTitle: '5 · Challenge: unit vector for a 3-D force',
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Find the unit vector for a 3-D force',
              difficulty: 'medium',
              prompt: `A cable pulls with force $\\vec{T} = 6\\hat{\\imath} - 2\\hat{\\jmath} + 9\\hat{k}$ N. Find its magnitude and unit vector.`,
              starterBlock: [
                'T = np.array([___, ___, ___])   # fill in 6, -2, 9',
                'T_mag = np.linalg.norm(___)',
                'T_hat = ___ / ___',
              ].join('\n'),
              code: [
                'T = np.array([6.0, -2.0, 9.0])',
                'T_mag = np.linalg.norm(T)',
                'T_hat = T / T_mag',
                '',
                'print(f"|T| = {T_mag:.4f} N")',
                'print(f"T_hat = ({T_hat[0]:.4f}, {T_hat[1]:.4f}, {T_hat[2]:.4f})")',
                'print(f"Verify |T_hat| = {np.linalg.norm(T_hat):.6f}")',
              ].join('\n'),
              output: '',
              status: 'idle',
              figureJson: null,
              testCode: [
                'import numpy as np',
                'assert "T" in dir(), "Define T"',
                'assert "T_mag" in dir(), "Compute T_mag"',
                'assert "T_hat" in dir(), "Compute T_hat"',
                'assert np.isclose(T_mag, 11.0, atol=0.01), f"|T| should be 11.0, got {T_mag:.4f}"',
                'assert np.isclose(np.linalg.norm(T_hat), 1.0, atol=1e-6), "T_hat must have magnitude 1"',
                '"SUCCESS: |T| = 11.0 N; T_hat = (6/11, -2/11, 9/11)"',
              ].join('\n'),
              hint: `T = np.array([6.0, -2.0, 9.0]). |T| = sqrt(36+4+81) = sqrt(121) = 11. T_hat = T / 11.`,
            },
          ],
        },
      },
    ],
  },

  // ── Quiz ─────────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'p1-ch1-002-q1',
      question: `Which notation represents a unit vector?`,
      options: [`$\\vec{A}$`, `$\\mathbf{A}$`, `$\\hat{A}$`, `$|\\vec{A}|$`],
      answer: 2,
      explanation: `The hat (^) symbol indicates a unit vector — magnitude exactly 1, direction only.`,
    },
    {
      id: 'p1-ch1-002-q2',
      question: `The expression $|\\vec{F}|$ represents:`,
      options: [
        `A vector in the direction of $\\vec{F}$`,
        `The magnitude of $\\vec{F}$ — a scalar`,
        `The unit vector of $\\vec{F}$`,
        `The components of $\\vec{F}$`,
      ],
      answer: 1,
      explanation: `Vertical bars strip the direction, leaving only the magnitude — a non-negative scalar.`,
    },
    {
      id: 'p1-ch1-002-q3',
      question: `A force vector has $F_x = 3$ N, $F_y = 4$ N. What is the unit vector $\\hat{F}$?`,
      options: [`$(3, 4)$`, `$(0.6, 0.8)$`, `$(3/7, 4/7)$`, `$(1.5, 2)$`],
      answer: 1,
      explanation: `$|\\vec{F}| = \\sqrt{9+16} = 5$. $\\hat{F} = (3/5, 4/5) = (0.6, 0.8)$.`,
    },
    {
      id: 'p1-ch1-002-q4',
      question: `In 3-D, what is $\\hat{k}$?`,
      options: [
        `A unit vector along $+y$`,
        `A unit vector along $+z$`,
        `A unit vector along $+x$`,
        `The imaginary unit`,
      ],
      answer: 1,
      explanation: `$\\hat{k} = (0, 0, 1)$ — a unit vector pointing in the $+z$ direction.`,
    },
    {
      id: 'p1-ch1-002-q5',
      question: `Which expression is a SCALAR?`,
      options: [
        `$F_x\\hat{\\imath} + F_y\\hat{\\jmath}$`,
        `$\\vec{F}$`,
        `$\\sqrt{F_x^2+F_y^2}$`,
        `$(F_x, F_y)$`,
      ],
      answer: 2,
      explanation: `$\\sqrt{F_x^2+F_y^2} = |\\vec{F}|$ is the magnitude — a non-negative number with no direction.`,
    },
    {
      id: 'p1-ch1-002-q6',
      question: `A 3-D vector $\\vec{B} = 2\\hat{\\imath} - 6\\hat{\\jmath} + 3\\hat{k}$. What is $|\\vec{B}|$?`,
      options: [`$-1$`, `$7$`, `$11$`, `$\\sqrt{49}$`],
      answer: 1,
      explanation: `$|\\vec{B}| = \\sqrt{4+36+9} = \\sqrt{49} = 7$. Options B and D are the same answer.`,
    },
    {
      id: 'p1-ch1-002-q7',
      question: `If $\\hat{A} = (0.6, 0.8)$, what is $|\\hat{A}|$?`,
      options: [`$1.4$`, `$1.0$`, `$0.7$`, `$0.6$`],
      answer: 1,
      explanation: `$|\\hat{A}| = \\sqrt{0.36 + 0.64} = \\sqrt{1.00} = 1.0$. A unit vector always has magnitude 1.`,
    },
    {
      id: 'p1-ch1-002-q8',
      question: `The magnitude-angle form $|\\vec{A}|\\angle\\theta$ is equivalent to which component form when $|\\vec{A}|=5$ and $\\theta=53.1°$?`,
      options: [`$(3, 4)$`, `$(4, 3)$`, `$(5, 0)$`, `$(2.5, 2.5)$`],
      answer: 0,
      explanation: `$A_x = 5\\cos53.1° \\approx 3$, $A_y = 5\\sin53.1° \\approx 4$. The 3-4-5 triangle.`,
    },
  ],
}
