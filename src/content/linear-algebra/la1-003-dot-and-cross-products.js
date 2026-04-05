export default {
  // ── Identity ───────────────────────────────────────────────────
  id: 'la1-003',
  slug: 'dot-and-cross-products',
  chapter: 'la1',
  order: 3,
  title: 'Dot and Cross Products',
  subtitle: 'How to multiply vectors to measure angles, projections, and perpendicular spaces.',
  tags: ['dot product', 'cross product', 'orthogonal', 'projection', 'angle', 'area'],
  aliases: 'inner product vector multiplication perpendicular normal vector scalar product',

  // ── Pedagogical Meta ───────────────────────────────────────────
  timeToComplete: 25,
  coreConcept: 'The dot product measures how much two vectors align (producing a scalar), while the cross product measures how perpendicular they are (producing a new vector in 3D).',
  prerequisites: ['la1-002'],
  nextLesson: 'matrices-as-transformations',

  // ── Hook ───────────────────────────────────────────────────────
  hook: {
    question: "If you push an object along a train track, does a force pushing sideways help you move the train forward?",
    realWorldContext: "Imagine you are pulling a heavy wagon. If you pull straight ahead, 100% of your energy goes into moving the wagon. If you pull at an upward angle, some of your energy is wasted lifting the wagon instead of pulling it forward. In physics, we need a mathematical tool to calculate exactly 'how much' of one vector points in the direction of another. Meanwhile, in 3D graphics, a computer constantly needs to know which way a polygon is facing (its 'normal') to calculate lighting and shadows. We need a tool that takes two edges of a polygon and generates a perfectly perpendicular arrow pointing directly out of the surface. These two tools are the Dot Product and the Cross Product.",
    previewVisualizationId: 'LALesson03_DotCross',
  },

  // ── Intuition ──────────────────────────────────────────────────
  intuition: {
    prose: [
      '**Where you are in the story:** Up to now, we\'ve learned how to add and scale basic arrows to build up entire spanning spaces. But vectors don\'t just add together; they also interact geometrically. We need a way to mathematically multiply them to measure angles, areas, and alignments. This lesson introduces the two fundamental ways to "multiply" spatial vectors.',
      'Think of the **Dot Product** as the ultimate measure of agreement. If two vectors point in exactly the same direction, their dot product is massive. If they point in opposite directions, it is massively negative. But most importantly, if they are perfectly perpendicular (orthogonal)—they have absolutely nothing in common, and their dot product is exactly zero. The dot product fundamentally crushes two vectors down into a single scalar number.',
      'Geometrically, you can think of the dot product as shining a flashlight down onto one vector, and seeing how long its shadow is on the other vector. This is called a *projection*. Multiplying the length of the shadow by the length of the vector it lies on gives the dot product.',
      'The **Cross Product** is the opposite: it measures disagreement. It is only defined in 3 Dimensions. When you cross two 3D arrows, the math does not spit out a scalar number; it spits out a brand new 3D vector. This new vector has two magical properties: (1) Its length is exactly equal to the area of the parallelogram formed by the original two vectors, and (2) it points completely perpendicular to BOTH original vectors.',
      '**Where this is heading:** The dot product is the foundation of Matrix Multiplication. When you multiply a row of a matrix by a column vector, you are just taking a massive dot product. The concepts of orthogonality (dot product = 0) will eventually lead us to the most powerful tool in data science: the Singular Value Decomposition (SVD).',
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 3 of 3 — Vectors & Spaces',
        body: '**Previous:** Linear combinations, Span, and Basis.\n**This lesson:** Multiplying vectors to find projections and perpendiculars.\n**Next:** Phase 2 starts! We leave static vectors and learn how to transform them using Matrices.',
      },
      {
        type: 'insight',
        title: 'Dot vs Cross Output',
        body: 'A Dot Product returns a NUMBER (scalar). A Cross Product returns an ARROW (vector). Never mix them up!',
      },
    ],
    visualizations: [
      {
        id: 'LALesson03_DotCross',
        title: 'The Shadow of the Dot Product',
        mathBridge: 'Step 1: Drag the vector $\\vec{w}$ closer to $\\vec{v}$. Watch the dot product value increase as they align. Step 2: Make them perfectly perpendicular (an $L$ shape) to see the dot product hit zero. Step 3: Drag them to face opposite directions and watch the value go negative. The key lesson: the dot product is a continuous measure of directional alignment.',
        caption: 'Visualizing the dot product as a projection (shadow) from one vector onto another.',
      },
    ],
  },

  // ── Math ───────────────────────────────────────────────────────
  math: {
    prose: [
      'The **Dot Product** (or inner product) is remarkably easy to calculate algebraically. You just multiply the matching components and add them all up. For two vectors $\\vec{v}$ and $\\vec{w}$:',
      '$$ \\vec{v} \\cdot \\vec{w} = v_1 w_1 + v_2 w_2 + \\dots + v_n w_n $$',
      'This simple arithmetic carries a profound geometric meaning. The exact same calculation is tied to the angle $\\theta$ between the vectors by this formula:',
      '$$ \\vec{v} \\cdot \\vec{w} = \\|\\vec{v}\\| \\|\\vec{w}\\| \\cos(\\theta) $$',
      'Because $\\cos(90^\\circ) = 0$, the dot product of any two perpendicular (orthogonal) vectors is always 0. This is the fastest way to check if two things are perpendicular in math.',
      'The **Cross Product** only works in $\\mathbb{R}^3$. The algebra is a bit messy (often memorized using a Matrix Determinant trick), but the geometric formula is clean:',
      '$$ \\|\\vec{v} \\times \\vec{w}\\| = \\|\\vec{v}\\| \\|\\vec{w}\\| \\sin(\\theta) $$',
      'The direction of $\\vec{v} \\times \\vec{w}$ is given by the Right-Hand Rule: point your index finger along $\\vec{v}$, your middle finger along $\\vec{w}$, and your thumb points exactly in the direction of the cross product.'
    ],
    callouts: [
      {
        type: 'strategy',
        title: 'Finding the Angle',
        body: 'You can rearrange the geometric dot product formula to instantly find the angle between any two vectors in any dimension:\n\n$$ \\cos(\\theta) = \\frac{\\vec{v} \\cdot \\vec{w}}{\\|\\vec{v}\\| \\|\\vec{w}\\|} $$',
      },
      {
        type: 'theorem',
        title: 'Cross Product Algebra',
        body: '$\\vec{v} \\times \\vec{w} = \\begin{bmatrix} v_2 w_3 - v_3 w_2 \\\\ v_3 w_1 - v_1 w_3 \\\\ v_1 w_2 - v_2 w_1 \\end{bmatrix}$',
      },
    ],
    visualizations: [
      {
        id: 'CrossProductViz',
        title: 'The Cross Product Area',
        mathBridge: 'Observe the two basis vectors on the floor of the 3D grid. As you drag them apart to form a larger parallelogram, the cross product vector (pointing straight up) grows taller. The key lesson: The height of the new vector is exactly the area of the ground parallelogram.',
        caption: 'The cross product generates a vector whose length equals the swept area.',
      },
      {
        id: 'PythonNotebook',
        title: 'Code: Dot Product, Angle, Cross Product',
        mathBridge: 'np.dot(a, b) = Σ aᵢbᵢ. Angle: θ = arccos(a·b / (‖a‖‖b‖)). Cross product (3D only): np.cross(a, b). Its magnitude = area of parallelogram = ‖a‖‖b‖ sin θ.',
        caption: 'Confirm the geometric meaning of both products with live computation.',
        props: {
          disableRunAll: true,
          initialCells: [
            {
              id: 1,
              cellTitle: 'Dot product — measuring alignment',
              prose: [
                '`np.dot(a, b)` computes the dot product: positive when vectors align, zero when perpendicular, negative when opposing.',
                'The geometric formula a · b = ‖a‖ ‖b‖ cos θ lets us recover the angle.',
              ],
              code: `import numpy as np

a = np.array([1.0, 0.0])   # x-axis
b = np.array([0.0, 1.0])   # y-axis (perpendicular)
c = np.array([1.0, 1.0])   # 45° diagonal

print(f"a · b = {np.dot(a, b)}  (orthogonal → 0)")
print(f"a · c = {np.dot(a, c)}  (partially aligned → positive)")
print(f"a · (-a) = {np.dot(a, -a)}  (opposing → negative)")
print()

# Recover the angle: cos θ = (a · b) / (‖a‖ ‖b‖)
def angle_deg(u, v):
    cos_t = np.dot(u, v) / (np.linalg.norm(u) * np.linalg.norm(v))
    return float(np.degrees(np.arccos(np.clip(cos_t, -1, 1))))

p = np.array([3.0, 1.0])
q = np.array([1.0, 3.0])
print(f"angle(p, q) = {angle_deg(p, q):.2f}°")
print(f"angle(a, b) = {angle_deg(a, b):.1f}°  (right angle confirmed)")`,
            },
            {
              id: 2,
              cellTitle: 'Cross product — perpendicular and area (3D)',
              prose: [
                '`np.cross(a, b)` produces a vector perpendicular to both a and b. Its magnitude equals the area of the parallelogram they span.',
                'The result is perpendicular to both inputs — verify with dot products.',
              ],
              code: `import numpy as np

a = np.array([3.0, 0.0, 0.0])
b = np.array([0.0, 4.0, 0.0])

axb = np.cross(a, b)
print(f"a × b = {axb}  (should point in z direction)")
print(f"‖a × b‖ = {np.linalg.norm(axb)}  (area of parallelogram = 3×4 = 12)")
print()

# Perpendicularity check
print(f"(a×b)·a = {np.dot(axb, a):.1f}  (should be 0)")
print(f"(a×b)·b = {np.dot(axb, b):.1f}  (should be 0)")
print()

# Anti-commutativity: a×b = -(b×a)
print(f"b × a = {np.cross(b, a)}  (sign flipped)")`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Orthogonality and projection',
              difficulty: 'medium',
              prompt: 'Given a = [4, 0] and b = [3, 3]: (1) compute the angle between them, (2) compute the vector projection of b onto a — the formula is (a·b / a·a) * a, (3) verify that b minus its projection is perpendicular to a.',
              code: `import numpy as np

a = np.array([4.0, 0.0])
b = np.array([3.0, 3.0])

# 1. angle between a and b
# 2. vector projection of b onto a
# 3. perpendicularity check: dot(b - proj, a) ≈ 0
`,
              hint: 'proj = (np.dot(a,b) / np.dot(a,a)) * a. Then check np.dot(b - proj, a) is close to zero.',
            },
          ]
        }
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      'In advanced mathematics, the "Dot Product" is just one specific example of a generalized concept called an **Inner Product**. An inner product space is a vector space equipped with an operation $\\langle u, v \\rangle$ that satisfies symmetry, linearity in the first argument, and positive-definiteness.',
      'Believe it or not, you can define an inner product for functions instead of arrows. For two functions $f(x)$ and $g(x)$, you can define their inner product as the integral $\\int f(x)g(x)dx$. If this integral evaluates to 0, mathematicians say the two functions are "orthogonal" to each other! This mind-bending concept is the entire foundation of Fourier Series and quantum mechanics—treating continuous waves as if they were perpendicular arrows in an infinite-dimensional space.',
    ],
    callouts: [],
    visualizations: [],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: "ex-1",
      title: "Calculating a Dot Product",
      problem: "Compute the dot product of $\\vec{v} = \\begin{bmatrix} 3 \\\\ -2 \\end{bmatrix}$ and $\\vec{w} = \\begin{bmatrix} 4 \\\\ 5 \\end{bmatrix}$.",
      steps: [
        {
          expression: "\\vec{v} \\cdot \\vec{w} = (3)(4) + (-2)(5)",
          annotation: "Multiply the x-components together, and multiply the y-components together.",
          strategyTitle: "Component multiplication",
          checkpoint: "What is 3 times 4?",
          hints: ["3 * 4 = 12", "-2 * 5 = -10"],
        },
        {
          expression: "\\vec{v} \\cdot \\vec{w} = 12 - 10",
          annotation: "Add the results together.",
          strategyTitle: "Sum",
          checkpoint: "What is 12 minus 10?",
          hints: [],
        },
        {
          expression: "\\vec{v} \\cdot \\vec{w} = 2",
          annotation: "The result is a single scalar number.",
          strategyTitle: "Final Scalar",
          checkpoint: "",
          hints: [],
        }
      ],
      conclusion: "The dot product is 2. Because the result is positive, the angle between the two vectors is acute (less than 90 degrees). They mostly point in the same direction."
    },
    {
      id: "ex-2",
      title: "Checking for Orthogonality",
      problem: "Determine if $\\vec{a} = \\begin{bmatrix} 6 \\\\ -3 \\end{bmatrix}$ and $\\vec{b} = \\begin{bmatrix} 1 \\\\ 2 \\end{bmatrix}$ are perpendicular.",
      steps: [
        {
          expression: "\\vec{a} \\cdot \\vec{b} = (6)(1) + (-3)(2)",
          annotation: "Set up the algebraic dot product.",
          strategyTitle: "Dot product algebraic test",
          checkpoint: "",
          hints: [],
        },
        {
          expression: "\\vec{a} \\cdot \\vec{b} = 6 - 6 = 0",
          annotation: "The dot product evaluates exactly to zero.",
          strategyTitle: "Zero Check",
          checkpoint: "What does a dot product of zero mean geometrically?",
          hints: ["It means the cos(theta) term in perfectly 0, which only happens at 90 degrees."],
        }
      ],
      conclusion: "Because the dot product is exactly 0, these two vectors are perfectly perpendicular (orthogonal). This test takes seconds and saves you from needing to use a protractor!"
    }
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: "ch-1",
      difficulty: "easy",
      problem: "Calculate the dot product of $\\begin{bmatrix} 0 \\\\ -7 \\end{bmatrix}$ and $\\begin{bmatrix} 4 \\\\ 2 \\end{bmatrix}$.",
      hint: "Multiply the top numbers, multiply the bottom numbers, and add the results.",
      walkthrough: [
        {
          expression: "(0)(4) + (-7)(2)",
          annotation: "Set up the component products."
        },
        {
          expression: "0 - 14",
          annotation: "Perform multiplication."
        },
        {
          expression: "-14",
          annotation: "Final scalar result."
        }
      ],
      answer: "-14"
    },
    {
      id: "ch-2",
      difficulty: "medium",
      problem: "Find the missing component $x$ so that $\\vec{v} = \\begin{bmatrix} x \\\\ 4 \\end{bmatrix}$ and $\\vec{w} = \\begin{bmatrix} 2 \\\\ -3 \\end{bmatrix}$ are orthogonal.",
      hint: "Set up the dot product equation exactly equal to 0, since orthogonal vectors have a dot product of 0. Then solve for x.",
      walkthrough: [
        {
          expression: "(x)(2) + (4)(-3) = 0",
          annotation: "Set the dot product to 0."
        },
        {
          expression: "2x - 12 = 0",
          annotation: "Simplify the equation."
        },
        {
          expression: "2x = 12",
          annotation: "Move 12 to the right."
        },
        {
          expression: "x = 6",
          annotation: "Divide by 2."
        }
      ],
      answer: "6"
    }
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      {
        symbol: "\\vec{v} \\cdot \\vec{w}",
        meaning: "The Dot Product. Measures alignment. Returns a scalar."
      },
      {
        symbol: "\\vec{v} \\times \\vec{w}",
        meaning: "The Cross Product. Measures perpendicular area. Returns a 3D vector."
      },
      {
        symbol: "\\vec{v} \\cdot \\vec{w} = 0",
        meaning: "The vectors are perfectly orthogonal (perpendicular)."
      }
    ],
    rulesOfThumb: [
      "Dot Product is algebra's fastest way to check for 90-degree angles.",
      "If you need a new axis pointing straight out of a 3D plane, use the Cross Product.",
      "A dot product of a vector with itself (v dot v) gives the magnitude squared (||v||^2)."
    ]
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      {
        lessonId: 'algebra-trig',
        label: 'Trigonometry: Cosine and Sine',
        note: 'Remember that cos(0) = 1 (complete alignment), cos(90) = 0 (orthogonal), and cos(180) = -1 (complete opposite). This maps perfectly to the behavior of the Dot Product.'
      }
    ],
    futureLinks: [
      {
        lessonId: 'la2-002',
        label: 'Matrix Multiplication',
        note: 'When you learn how to multiply two matrices together, you will realize you are just doing dozens of dot products simultaneously between rows and columns.'
      }
    ]
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: "assess-1",
        type: "input",
        text: "Are the vectors [5, 2] and [-2, 5] orthogonal? Type exactly 'Yes' or 'No'.",
        answer: "Yes",
        hint: "Calculate the dot product: (5*-2) + (2*5) = -10 + 10 = 0."
      }
    ]
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    "Dot Product = Alignment = Shadow length = Returns a Number",
    "Cross Product = Area = Perpendicular direction = Returns a Vector",
    "Orthogonal means Dot Product is ZERO."
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    'read-intuition',
    'read-math',
    'read-rigor',
    'completed-example-1',
    'completed-example-2',
    'attempted-challenge-easy',
    'attempted-challenge-medium',
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'quiz-1',
      type: 'choice',
      text: "What does the Dot Product mathematically tell you?",
      options: [
        "The exact area of the parallelogram between two vectors.",
        "A vector perpendicular to both inputs.",
        "A scalar number representing how much the two vectors align directionally.",
        "The distance between the tips of the two vectors."
      ],
      answer: "A scalar number representing how much the two vectors align directionally.",
      hints: ["The dot product is tied to the cosine of the angle between them."],
      reviewSection: 'Intuition tab — Shadow of the Dot Product'
    },
    {
      id: 'quiz-2',
      type: 'choice',
      text: "If you calculate the cross product of two vectors lying flat on your desk (the XY plane), where will the resulting vector point?",
      options: [
        "Also flat on the desk, cutting the angle in half.",
        "Straight up towards the ceiling (or straight down into the floor).",
        "It will become a dot (scalar 0).",
        "Along the x-axis."
      ],
      answer: "Straight up towards the ceiling (or straight down into the floor).",
      hints: ["The cross product creates a new vector that is perfectly orthogonal (perpendicular) to both original vectors."],
      reviewSection: 'Intuition tab — Cross Product perpendicularity'
    }
  ]
};
