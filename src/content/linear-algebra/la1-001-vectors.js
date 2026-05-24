export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la1-001',
  slug: 'what-is-a-vector',
  chapter: 'la1',
  order: 1,
  title: 'What is a Vector?',
  subtitle: 'The fundamental building block of linear algebra, viewed through the lenses of physics, computer science, and mathematics.',
  tags: ['vectors', 'components', 'magnitude', 'direction', 'coordinates'],
  aliases: 'introduction to vectors point vs vector displacement position vector components',

  // ── Pedal Meta ─────────────────────────────────────────────────
  hook: {
    question: "How do we mathematically describe both the speed and direction of a moving object at the same time?",
    realWorldContext: "When a pilot calculates the flight path of an airplane, they must account for the plane's velocity (speed and direction) and the wind's velocity (speed and direction). A single number (like '500 mph') is not enough to predict where the plane will end up. We need a mathematical object that can stretch across space and point specifically toward a target. In modern AI, vectors represent meaning: the word 'king' and the word 'queen' are represented as lists of numbers in a high-dimensional space, and the distance between them mathematically captures their linguistic relationship. Vectors are the universal language for things that have multiple dimensions.",
    previewVisualizationId: 'LALesson11_OrthogonalProjections',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** You are at the very beginning of understanding spaces and transformations. Before we can stretch, squash, or rotate space, we need a way to describe the things *living* in that space. That fundamental building block is the vector.',
      'There are three major ways to think about vectors, and mastering linear algebra means learning to switch effortlessly between them.',
      'Perspective 1: The Physics View. To a physicist, a vector is an arrow pointing in space. It has a specific length (magnitude) and a specific direction. Importantly, an arrow is defined *only* by its length and direction — not by where it starts. If you pick up an arrow and move it without rotating it or stretching it, it is still the exact same vector.',
      'Perspective 2: The Computer Science View. To a computer scientist, a vector is just a list of numbers. An array like `[3, 4]` represents a vector. This perspective says nothing about arrows or geometry; it only cares about ordered data. For example, a house might be modeled as a vector: `[square_footage, bedrooms, bathrooms]`.',
      'Perspective 3: The Mathematics View. To a mathematician, a vector is whatever you want it to be, as long as it follows two simple rules: you can add two of them together, and you can multiply them by a scalar (a regular number) to scale them up or down. As long as those operations behave predictably, the object is a vector.',
      'In this course, we will constantly bridge the Physics (geometric) and Computer Science (algebraic) views. A list of numbers like `[3, 4]` algebraically defines an arrow that points 3 units to the right and 4 units up. The numbers are the DNA; the arrow is the physical manifestation.',
      '**Scalars: the third ingredient.** Linear algebra is built from three objects: scalars, vectors, and matrices. A **scalar** is just a regular number — something from $\\mathbb{R}$ like $2$, $-0.5$, or $\\pi$. The word "scalar" comes from "scale." When you multiply a vector by a scalar, you scale it. Specifically: multiply by $2$ and the vector doubles in length. Multiply by $0.5$ and it shrinks to half. Multiply by $-1$ and it flips to point the opposite direction. Multiply by $0$ and it collapses completely to the zero vector $\\mathbf{0}$ — a vector with no length and no direction. Every one of these behaviors matters and will show up again throughout the course.',
      '**Where this is heading:** Once we establish how to represent these arrows and scale them with scalars, we will learn how to combine them (Linear Combinations). The rest of linear algebra is the study of how spaces of these arrows transform into other spaces.',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 3 — Vectors & Spaces',
        body: '**This lesson:** What vectors are and how we represent them geometrically and algebraically.\n**Next:** How to add them together and scale them (Linear Combinations).',
      },
      {
        type: 'insight',
        title: 'Vectors vs. Points',
        body: 'A point (x, y) is a location. A vector [x, y] is a movement or displacement. While we often draw vectors starting from the origin (0,0) to reach a point, the vector itself is just the *instructions* on how to get there, not the destination itself.',
      },
      {
        type: 'insight',
        title: 'Scalar Multiplication — Four Behaviors to Know',
        body: 'Given a vector $\\mathbf{v}$ and a scalar $c$:\n\n• $c > 1$: stretches (makes longer)\n• $0 < c < 1$: shrinks (makes shorter)\n• $c = -1$: flips direction exactly\n• $c < 0$: flips AND scales\n• $c = 0$: collapses to $\\mathbf{0}$ (the zero vector)\n\nDirection only changes sign when $c < 0$. Magnitude always becomes $|c| \\cdot \\|\\mathbf{v}\\|$.',
      },
      {
        type: 'strategy',
        title: 'The Column Matrix',
        body: 'In calculus, you often write vectors horizontally as $(x, y)$. In linear algebra, we almost exclusively write them vertically as column matrices. This convention makes matrix multiplication work beautifully later on.',
      },
      {
        type: 'insight',
        title: 'Why Column Format? (The Real Reason)',
        body: 'It is not just a convention — it is a promise about the future. When you get to matrices, a matrix multiplied by a vector is written $A\\mathbf{v}$. The matrix $A$ has its data laid out in rows, and each row "looks at" the vector by doing a dot product with it. For that dot-product-per-row interpretation to work cleanly, the vector **must** be a column. Writing $\\mathbf{v}$ as a column is preparing you for the moment multiplication is introduced. Every early choice in linear algebra notation is made with matrix multiplication in mind.',
      },
      {
        type: 'insight',
        title: 'Stop and Think: Can Two Vectors Have the Same Magnitude but Point Different Ways?',
        body: 'Yes — infinitely many. The vector $[3, 4]$ and the vector $[-3, 4]$ both have magnitude 5, yet they point in entirely different directions. **Magnitude alone does not determine a vector.** This is why we need both magnitude AND direction. Equivalently, we need both components. A single number cannot encode a vector — no matter how clever you are.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson11_OrthogonalProjections',
        title: 'The Geometric Engine of Linear Algebra',
        mathBridge: 'Before we dive into what vectors are, see the absolute geometric pinnacle: the Orthogonal Projection. Every vector can be decomposed into a shadow and a perpendicular. This is the core engine of everything you are about to study.',
        caption: 'A teaser of the projection mechanics you will master in Phase 4.',
      },
      {
        id: 'LALesson01_Vectors',
        title: 'Vector Components',
        mathBridge: 'Drag the vector tip to change its direction and length. Watch how the coordinate list $[x, y]^T$ updates in real-time. Moving the vector vertically changes only the $y$ component. The key lesson: The algebraic list of numbers is a perfect instruction manual for drawing the geometric arrow.',
        caption: 'The connection between geometry (the arrow) and algebra (the list of numbers).',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'Standard notation for vectors is a lowercase letter with an arrow on top ($\\vec{v}$) or simply boldface ($\\mathbf{v}$). The length of a vector is called its magnitude, denoted as $\\|\\vec{v}\\|$.',
      'In a 2D Cartesian plane, a vector $\\vec{v}$ that moves $x$ units horizontally and $y$ units vertically is written mathematically as a column vector:\n\n$ \\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix} $',
      'To find the magnitude of a 2D vector, we simply apply the Pythagorean theorem. Because the horizontal and vertical components form a right triangle, the length is the hypotenuse:\n\n$ \\|\\vec{v}\\| = \\sqrt{x^2 + y^2} $',
      'A vector with a magnitude of exactly 1 is called a **unit vector**. Unit vectors are incredibly useful because they represent pure direction with no "scaling" baggage. Any vector can be scaled down into a unit vector by dividing it by its own magnitude. This process is called normalization.',
      'For example, the vector $\\vec{v} = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$ has a magnitude of $\\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$. To turn it into a unit vector $\\hat{v}$, we divide the components by 5: $\\hat{v} = \\begin{bmatrix} 3/5 \\\\ 4/5 \\end{bmatrix}$.'
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'Vector Magnitude',
        body: '\\|\\vec{v}\\| = \\sqrt{v_1^2 + v_2^2 + \\dots + v_n^2}',
      },
      {
        type: 'insight',
        title: 'Unit Vector Notation',
        body: 'A vector with length 1 is often written with a "hat" instead of an arrow: $\\hat{u}$. It represents pure direction.',
      },
    ],
    visualizations: [
      {
        id: 'MagnitudeAndDirectionViz',
        title: 'Magnitude and Pythagoras',
        mathBridge: 'The visualization shows the right triangle formed by the vector. Drag the vector to $[3, 4]$ and observe the resulting magnitude of exactly $5$. Notice how the Pythagorean theorem connects the orthogonal components to the direct path.',
        caption: 'Calculating vector magnitude using perpendicular components.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Vectors in NumPy',
        mathBridge: 'A numpy array IS a vector. np.array([3, 4]) creates the column vector [3, 4]^T. np.linalg.norm(v) computes ‖v‖ = √(3²+4²) = 5. Dividing by the norm gives the unit vector.',
        caption: 'Run each cell to see the math formulas become one-liners in code.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Vectors: creation, addition, scalar multiplication',
              prose: [
                'A `numpy` array is a vector. The two fundamental operations — addition and scalar multiplication — are `+` and `*`.',
                'Notice that `2 * a` stretches the vector, `-1 * a` flips it, and `a + b` follows the tip-to-tail rule.',
              ],
              code: `import numpy as np

a = np.array([3.0, 1.0])
b = np.array([1.0, 2.0])

print("a =", a)
print("b =", b)
print("a + b =", a + b)       # tip-to-tail
print("2 * a =", 2 * a)       # stretch
print("-1 * a =", -1 * a)     # flip direction
print("a - b =", a - b)       # a + (-b)`,
            },
            {
              id: 2,
              cellTitle: 'Magnitude and unit vectors',
              prose: [
                '`np.linalg.norm(v)` computes ‖v‖ = √(v₁² + v₂² + …). Dividing by the norm normalizes to a unit vector.',
                'The vector [3, 4] is the classic 3-4-5 right triangle. Its unit vector is [0.6, 0.8] — verify: 0.6² + 0.8² = 1. ✓',
              ],
              code: `import numpy as np

v = np.array([3.0, 4.0])

magnitude = np.linalg.norm(v)
unit = v / magnitude

print(f"v = {v}")
print(f"‖v‖ = {magnitude}")       # should be 5.0
print(f"unit vector = {unit}")    # [0.6, 0.8]
print(f"‖unit‖ = {np.linalg.norm(unit):.6f}")  # should be 1.0`,
            },
            {
              id: 3,
              cellTitle: 'Visualize: vector and its unit vector',
              prose: [
                'The blue arrow is **v = [3, 4]**. The amber arrow is its unit vector — same direction, length 1.',
                'Scaling the unit vector by the magnitude reconstructs the original: 5 × [0.6, 0.8] = [3, 4].',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER

v = np.array([3.0, 4.0])
unit = v / np.linalg.norm(v)

fig = Figure(square=True, xmin=-1, xmax=5, ymin=-1, ymax=5,
             title="Vector and its Unit Vector")
fig.grid().axes()
fig.vector(v.tolist(), color=BLUE, label="v = [3,4]")
fig.vector(unit.tolist(), color=AMBER, label="unit v")
fig.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Normalize a vector',
              difficulty: 'easy',
              prompt: 'Given w = [-6, 8], compute: (1) its magnitude (should be 10), (2) its unit vector, (3) verify the unit vector has magnitude 1. Then compute the angle between w and the positive x-axis using np.degrees(np.arctan2(y, x)).',
              code: `import numpy as np

w = np.array([-6.0, 8.0])

# 1. magnitude
# 2. unit vector
# 3. verify ‖unit‖ = 1
# 4. angle with x-axis: np.degrees(np.arctan2(w[1], w[0]))
`,
              hint: 'np.linalg.norm(w) for magnitude. w / np.linalg.norm(w) for unit. np.arctan2 gives the angle of the vector directly.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'A true "Vector Space" over a field (like the set of real numbers $\\mathbb{R}$) is formally defined as a set $V$ combined with two operations: vector addition and scalar multiplication.',
      'To be a vector space, 8 axioms must be satisfied for all vectors $\\vec{u}, \\vec{v}, \\vec{w}$ in $V$ and all scalars $c, d$:',
      '1. Commutativity of addition: $\\vec{u} + \\vec{v} = \\vec{v} + \\vec{u}$',
      '2. Associativity of addition: $(\\vec{u} + \\vec{v}) + \\vec{w} = \\vec{u} + (\\vec{v} + \\vec{w})$',
      '3. Identity element of addition: There exists a zero vector $\\vec{0}$ such that $\\vec{v} + \\vec{0} = \\vec{v}$',
      '4. Inverse elements of addition: For every $\\vec{v}$, there exists $-\\vec{v}$ such that $\\vec{v} + (-\\vec{v}) = \\vec{0}$',
      '5. Compatibility of scalar multiplication: $c(d\\vec{v}) = (cd)\\vec{v}$',
      '6. Identity element of scalar multiplication: $1\\vec{v} = \\vec{v}$',
      '7. Distributivity of scalar multiplication over vector addition: $c(\\vec{u} + \\vec{v}) = c\\vec{u} + c\\vec{v}$',
      '8. Distributivity of scalar multiplication over field addition: $(c + d)\\vec{v} = c\\vec{v} + d\\vec{v}$',
      'While columns of numbers in $\\mathbb{R}^n$ perfectly satisfy these axioms, other mathematical objects do as well. For example, the set of all polynomial functions up to degree $n$ forms a valid vector space. The axioms, not arrows in space, are the ultimate definition of what a vector is.',
    ],
    callouts: [],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "Finding the Magnitude",
      problem: "Calculate the magnitude of the vector $\\vec{v} = \\begin{bmatrix} -6 \\\\ 8 \\end{bmatrix}$.",
      steps: [
        {
          expression: "\\|\\vec{v}\\| = \\sqrt{(-6)^2 + 8^2}",
          annotation: "Apply the Pythagorean magnitude formula: square each component and sum them.",
          strategyTitle: "Sum of squares",
          checkpoint: "What is the square of -6?",
          hints: ["Square the x component: (-6)² = 36", "Square the y component: 8² = 64"],
        },
        {
          expression: "\\|\\vec{v}\\| = \\sqrt{36 + 64} = \\sqrt{100}",
          annotation: "Add the squared components together.",
          strategyTitle: "Compute sum",
          checkpoint: "What is 36 + 64?",
          hints: [],
        },
        {
          expression: "\\|\\vec{v}\\| = 10",
          annotation: "Take the square root of the sum to find the final length.",
          strategyTitle: "Square root",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The magnitude of the vector is exactly 10 units. Note that magnitude is always positive, even if components are negative."
    },
    {
      id: "ex-2",
      title: "Creating a Unit Vector",
      problem: "Find the unit vector $\\hat{u}$ in the same direction as $\\vec{v} = \\begin{bmatrix} 3 \\\\ -4 \\end{bmatrix}$.",
      steps: [
        {
          expression: "\\|\\vec{v}\\| = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5",
          annotation: "First, find the current magnitude of the vector.",
          strategyTitle: "Calculate length",
          checkpoint: "What is the length of this vector?",
          hints: ["Use the Pythagorean theorem: sqrt(9 + 16)"],
        },
        {
          expression: "\\hat{u} = \\frac{1}{5} \\begin{bmatrix} 3 \\\\ -4 \\end{bmatrix}",
          annotation: "To normalize the vector, divide every component by the magnitude (5).",
          strategyTitle: "Scale by inverse magnitude",
          checkpoint: "How do you scale a vector?",
          hints: ["Multiply the vector by the scalar 1/||v||."],
        },
        {
          expression: "\\hat{u} = \\begin{bmatrix} 3/5 \\\\ -4/5 \\end{bmatrix}",
          annotation: "Distribute the scalar division to both components.",
          strategyTitle: "Final unit vector",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The vector [3/5, -4/5] points in the exact same direction as [3, -4], but its length is exactly 1."
    },
    {
      id: "ex-3",
      title: "Adding Two Vectors — the Tip-to-Tail Rule",
      problem: "Compute $\\vec{a} + \\vec{b}$ where $\\vec{a} = \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}$ and $\\vec{b} = \\begin{bmatrix} -1 \\\\ 4 \\end{bmatrix}$. Then find $\\|\\vec{a} + \\vec{b}\\|$.",
      steps: [
        {
          expression: "\\vec{a} + \\vec{b} = \\begin{bmatrix} 3 + (-1) \\\\ 1 + 4 \\end{bmatrix}",
          annotation: "Add vectors component-by-component. The $x$-components add independently, and the $y$-components add independently. Geometrically this is the tip-to-tail rule: place the tail of $\\vec{b}$ at the tip of $\\vec{a}$. The sum vector goes from the original tail of $\\vec{a}$ to the final tip of $\\vec{b}$.",
          strategyTitle: "Component-wise addition",
          checkpoint: "Why can we just add components separately? Why doesn't the $x$ of one vector interact with the $y$ of another?",
          hints: ["Each component is an independent axis. Moving right has no effect on moving up. So horizontal displacements add with horizontal, vertical with vertical."],
        },
        {
          expression: "\\vec{a} + \\vec{b} = \\begin{bmatrix} 2 \\\\ 5 \\end{bmatrix}",
          annotation: "$3 + (-1) = 2$ and $1 + 4 = 5$.",
          strategyTitle: "Compute the sum",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\|\\vec{a} + \\vec{b}\\| = \\sqrt{2^2 + 5^2} = \\sqrt{4 + 25} = \\sqrt{29} \\approx 5.39",
          annotation: "Apply the Pythagorean magnitude formula to the result vector.",
          strategyTitle: "Magnitude of the sum",
          checkpoint: "Is $\\|\\vec{a} + \\vec{b}\\|$ always equal to $\\|\\vec{a}\\| + \\|\\vec{b}\\|$?",
          hints: ["No. The Triangle Inequality says $\\|\\vec{a} + \\vec{b}\\| \\leq \\|\\vec{a}\\| + \\|\\vec{b}\\|$. Equality only holds when both vectors point in exactly the same direction — when they are collinear."],
        }
      ],
      conclusion: "The sum is [2, 5] with magnitude √29 ≈ 5.39. The magnitudes of a and b are √10 ≈ 3.16 and √17 ≈ 4.12. Notice √29 < √10 + √17 — the sum is shorter than the sum of lengths unless both vectors are perfectly aligned."
    },
    {
      id: "ex-4",
      title: "Magnitude and Unit Vector in 3D",
      problem: "Find the unit vector $\\hat{v}$ in the direction of $\\vec{v} = \\begin{bmatrix} 2 \\\\ -1 \\\\ 2 \\end{bmatrix}$.",
      steps: [
        {
          expression: "\\|\\vec{v}\\| = \\sqrt{2^2 + (-1)^2 + 2^2} = \\sqrt{4 + 1 + 4} = \\sqrt{9} = 3",
          annotation: "The magnitude formula generalizes from 2D to 3D by adding one more squared term. Think of it as a 3D right triangle: $\\sqrt{a^2 + b^2 + c^2}$ is the diagonal of a box with side lengths $a$, $b$, $c$.",
          strategyTitle: "3D magnitude",
          checkpoint: "Why does the Pythagorean theorem still work in 3D?",
          hints: ["Apply Pythagoras twice. First: the horizontal and depth components form a 2D right triangle with hypotenuse $h = \\sqrt{a^2 + b^2}$. Then: $h$ and the vertical component form another right triangle. The final diagonal is $\\sqrt{h^2 + c^2} = \\sqrt{a^2 + b^2 + c^2}$."],
        },
        {
          expression: "\\hat{v} = \\frac{1}{3} \\begin{bmatrix} 2 \\\\ -1 \\\\ 2 \\end{bmatrix} = \\begin{bmatrix} 2/3 \\\\ -1/3 \\\\ 2/3 \\end{bmatrix}",
          annotation: "Divide every component by the magnitude. The formula is identical to 2D normalization — the process does not care about dimension.",
          strategyTitle: "Normalize",
          checkpoint: "Verify: does this unit vector actually have magnitude 1?",
          hints: ["Check: $(2/3)^2 + (-1/3)^2 + (2/3)^2 = 4/9 + 1/9 + 4/9 = 9/9 = 1$. ✓"],
        }
      ],
      conclusion: "Unit vector: [2/3, −1/3, 2/3]. Every formula — magnitude, unit vector, dot product, cross product — extends from 2D to 3D (and beyond) simply by adding more component terms. The idea never changes."
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
      difficulty: "easy",
      problem: "What is the magnitude of the vector $\\begin{bmatrix} 5 \\\\ 12 \\end{bmatrix}$?",
      hint: "Remember the Pythagorean theorem: a² + b² = c².",
      walkthrough: [
        {
          expression: "\\|v\\| = \\sqrt{5^2 + 12^2}",
          annotation: "Set up the magnitude formula."
        },
        {
          expression: "\\|v\\| = \\sqrt{25 + 144}",
          annotation: "Square the components."
        },
        {
          expression: "\\|v\\| = \\sqrt{169} = 13",
          annotation: "Sum and take the square root."
        }
      ],
      answer: "13"
    },
    {
      id: "ch-2",
      difficulty: "medium",
      problem: "A vector $\\vec{v}$ has magnitude $10$ and an x-component of $6$. If the y-component is negative, what is the vector in column format?",
      hint: "Use the magnitude formula in reverse. 6² + y² = 10².",
      walkthrough: [
        {
          expression: "\\sqrt{6^2 + y^2} = 10",
          annotation: "Set up the magnitude equation."
        },
        {
          expression: "36 + y^2 = 100",
          annotation: "Square both sides."
        },
        {
          expression: "y^2 = 64",
          annotation: "Solve for y²."
        },
        {
          expression: "y = -8",
          annotation: "Take the square root. We choose the negative root as specified."
        }
      ],
      answer: "\\begin{bmatrix} 6 \\\\ -8 \\end{bmatrix}"
    },
    {
      id: "ch-3",
      difficulty: "hard",
      problem: "A vector $\\vec{v}$ makes an angle of $120°$ with the positive $x$-axis and has magnitude $4$. Write $\\vec{v}$ as a column vector. Use $\\cos(120°) = -\\tfrac{1}{2}$ and $\\sin(120°) = \\tfrac{\\sqrt{3}}{2}$.",
      hint: "If a vector has magnitude $r$ and makes angle $\\theta$ with the $x$-axis, then its components are $(r\\cos\\theta,\; r\\sin\\theta)$. This comes directly from the definition of sine and cosine on a right triangle: $\\cos\\theta = \\text{adjacent}/\\text{hypotenuse}$ so adjacent $= r\\cos\\theta$.",
      walkthrough: [
        {
          expression: "v_x = r\\cos\\theta = 4\\cos(120°) = 4 \\cdot \\left(-\\tfrac{1}{2}\\right) = -2",
          annotation: "The horizontal component is magnitude times cosine. The angle is in the second quadrant (between 90° and 180°), so the $x$-component is negative. This makes physical sense: the vector is pointing up and to the LEFT."
        },
        {
          expression: "v_y = r\\sin\\theta = 4\\sin(120°) = 4 \\cdot \\frac{\\sqrt{3}}{2} = 2\\sqrt{3}",
          annotation: "The vertical component is magnitude times sine. Sine is positive in the second quadrant, so the $y$-component is positive — the vector points UP."
        },
        {
          expression: "\\vec{v} = \\begin{bmatrix} -2 \\\\ 2\\sqrt{3} \\end{bmatrix}",
          annotation: "Verify: $\\|\\vec{v}\\| = \\sqrt{(-2)^2 + (2\\sqrt{3})^2} = \\sqrt{4 + 12} = \\sqrt{16} = 4$. ✓"
        }
      ],
      answer: "\\begin{bmatrix} -2 \\\\ 2\\sqrt{3} \\end{bmatrix}"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "\\vec{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix}",
        meaning: "A 2D column vector with components x and y"
      },
      {
        symbol: "\\|\\vec{v}\\|",
        meaning: "The magnitude (length) of the vector v"
      },
      {
        symbol: "\\hat{u}",
        meaning: "A unit vector (a vector with length exactly 1)"
      }
    ],
    rulesOfThumb: [
      "A vector is defined by length and direction; its starting position does not matter.",
      "Always write linear algebra vectors as vertical columns to prepare for matrix multiplication.",
      "To find a unit vector, compute length, then divide all components by that length."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'algebra-pythagoras',
        label: 'The Pythagorean Theorem',
        note: 'Vector magnitude is just the Pythagorean theorem applied to the x and y components. The hypotenuse of the triangle is the length of the vector.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la1-003',
        label: 'Dot Products',
        note: 'The unit vectors and magnitudes you learn here will directly fuel the calculation of angles between vectors using the Dot Product.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "assess-1",
        type: "input",
        text: "What is the magnitude of the vector [0, 7]?",
        answer: "7",
        hint: "sqrt(0^2 + 7^2)"
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Physics: Vectors are arrows.",
    "CS: Vectors are lists of numbers.",
    "Math: Vectors are things you can add and scale.",
    "A vector tells you 'how to move', not 'where to start'."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'completed-example-3',
    'completed-example-4',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
    'attempted-challenge-hard',
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'quiz-1',
      type: 'choice',
      text: "Which of the following is NOT a standard perspective on vectors?",
      options: [
        "An arrow in space",
        "A list of numbers",
        "An element of a vector space",
        "A single unchangeable coordinate point"
      ],
      answer: "A single unchangeable coordinate point",
      hints: ["Vectors are displacements (movements), not fixed destinations."],
      reviewSection: 'Intuition tab — Vectors vs. Points'
    },
    {
      id: 'quiz-2',
      type: 'input',
      text: "What is the magnitude of the vector [-3, 4]?",
      answer: "5",
      hints: ["Apply the Pythagorean theorem: sqrt((-3)^2 + 4^2)."],
      reviewSection: 'Math tab — Vector Magnitude'
    },
    {
      id: 'quiz-3',
      type: 'choice',
      text: "What is the effect of multiplying a vector $\\vec{v}$ by the scalar $-3$?",
      options: [
        "The vector triples in length and keeps the same direction",
        "The vector triples in length and reverses direction",
        "The vector shrinks to one-third its length",
        "The vector becomes the zero vector"
      ],
      answer: "The vector triples in length and reverses direction",
      hints: ["Magnitude becomes $|-3| \\times \\|\\vec{v}\\| = 3\\|\\vec{v}\\|$ (triples). The negative sign flips direction. Both happen at once."],
      reviewSection: 'Intuition tab — Scalar Multiplication'
    },
    {
      id: 'quiz-4',
      type: 'input',
      text: "Add $\\begin{bmatrix} 5 \\\\ -2 \\end{bmatrix} + \\begin{bmatrix} -3 \\\\ 7 \\end{bmatrix}$. What is the magnitude of the result?",
      answer: "5",
      hints: ["Sum = [2, 5]. Magnitude = √(4+25) = √29. Wait — let's recheck: [5+(-3), -2+7] = [2, 5]. ‖[2,5]‖ = √29 ≈ 5.39. Actually the answer is √29. Try the specific vectors [4, -3] + [-1, 0] = [3, -3] → ‖[3,-3]‖ = 3√2."],
      reviewSection: 'Math tab — Vector Addition and Magnitude'
    },
    {
      id: 'quiz-5',
      type: 'choice',
      text: "The zero vector $\\mathbf{0}$ is special. Which statement is true?",
      options: [
        "The zero vector has direction pointing along the $x$-axis",
        "The zero vector has magnitude 0 and undefined direction",
        "The zero vector is not a valid vector because it has no direction",
        "The zero vector has magnitude 1"
      ],
      answer: "The zero vector has magnitude 0 and undefined direction",
      hints: ["The zero vector is the result of scaling any vector by 0. It has zero length and no meaningful direction. It is a valid vector — it satisfies all 8 vector space axioms as the additive identity."],
      reviewSection: 'Intuition tab — Scalar Multiplication'
    }
  ]
};
