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

  // ── Hook ──────────────────────────────────────────────────────
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
      '**Perspective 1: The Physics View.** To a physicist, a vector is an arrow pointing in space. It has a specific length (magnitude) and a specific direction. Importantly, an arrow is defined *only* by its length and direction — not by where it starts. If you pick up an arrow and move it without rotating it or stretching it, it is still the exact same vector. This is called **free vector** behavior. Two arrows are equal if and only if they have the same length and the same direction — no matter where they are drawn.',
      '**Perspective 2: The Computer Science View.** To a computer scientist, a vector is a list of numbers — an ordered array. `[3, 4]` is a 2D vector; `[1, 0, 0]` is a 3D vector. A house can be a vector: `[square_footage, bedrooms, bathrooms, price]`. Everything in data science is ultimately a vector, because lists of numbers are how computers represent the world.',
      '**Perspective 3: The Mathematics View.** To a mathematician, a vector is whatever you want it to be, as long as it satisfies two rules: you can add two of them and get another one (closure under addition), and you can multiply by a number and get another one (closure under scalar multiplication). Polynomials, functions, and even matrices are "vectors" under this definition.',
      '**The bridge between perspectives.** A list like `[3, 4]` algebraically defines an arrow that points 3 units right and 4 units up. The numbers are the DNA; the arrow is the physical manifestation. The physics view gives you geometric intuition; the CS view gives you computational tools; the math view gives you generality.',
      '**Scalars: the third ingredient.** A **scalar** is just a regular number from $\\mathbb{R}$. The word "scalar" comes from "scale" — when you multiply a vector by a scalar, you scale it. Multiply by $2$ → doubles in length. Multiply by $0.5$ → shrinks to half. Multiply by $-1$ → flips to exact opposite direction. Multiply by $0$ → collapses to the zero vector $\\mathbf{0}$.',
      '**CNC machines: vectors in your hands.** Every CNC machine operates on pure vector mathematics. The three axes — X, Y, Z — are the three basis vectors $\\hat{\\mathbf{i}}, \\hat{\\mathbf{j}}, \\hat{\\mathbf{k}}$. When a G-code program says `G00 X3.0 Y2.0 Z-1.5`, it is commanding the machine to move to the position described by the vector $\\begin{bmatrix}3.0\\\\2.0\\\\-1.5\\end{bmatrix}$.',
      '**Where this is heading:** Once we establish how to represent arrows and scale them, we will learn how to combine them (Linear Combinations), then how to measure alignment (Dot Product), then how to solve systems of equations with them.',
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
        type: 'warning',
        title: 'Common Mistake: Adding Components Instead of Using the Pythagorean Theorem',
        body: 'Students sometimes write $\\|\\mathbf{v}\\| = v_1 + v_2$ (just adding components). This is WRONG. The correct formula is $\\|\\mathbf{v}\\| = \\sqrt{v_1^2 + v_2^2}$ — square each component, sum, then take the square root. For $\\mathbf{v} = [3, 4]^T$: wrong answer is $3 + 4 = 7$; correct answer is $\\sqrt{9+16} = 5$. Always square first.',
      },
      {
        type: 'insight',
        title: 'When to Use This',
        body: 'Use vector **magnitude** when you need the length of a displacement, force, or velocity. Use a **unit vector** when you need direction alone — stripped of scale. Use **component form** when working algebraically with coordinates (solving systems, computing projections, matrix multiplication).',
      },
      {
        type: 'insight',
        title: 'Stop and Think: Can Two Vectors Have the Same Magnitude but Point Different Ways?',
        body: 'Yes — infinitely many. The vector $[3, 4]$ and the vector $[-3, 4]$ both have magnitude 5, yet they point in entirely different directions. **Magnitude alone does not determine a vector.** This is why we need both magnitude AND direction.',
      },
    ],
    visualizations: [
      {
        id: 'LALesson01_Vectors',
        title: 'Vector Components — Geometry meets Algebra',
        mathBridge: 'Drag the vector tip to change its direction and length. Watch how the coordinate list $[x, y]^T$ updates in real-time. This is the core connection: every geometric arrow has exactly one algebraic representation, and every list of numbers has exactly one geometric arrow.',
        caption: 'Moving the tip horizontally changes only the $x$ component. Moving vertically changes only $y$. They are independent.',
      },
      {
        id: 'VectorComponentDecomposer',
        title: 'Decomposing a Vector into Components',
        mathBridge: 'Any vector $\\mathbf{v} = [x, y]$ can be written as $x \\cdot \\hat{\\mathbf{i}} + y \\cdot \\hat{\\mathbf{j}}$ — the $x$-component along the horizontal axis, plus the $y$-component along the vertical. The dashed lines show the "shadow" of the vector onto each axis.',
        caption: 'Every 2D vector is a sum of a horizontal piece and a vertical piece.',
      },
      {
        id: 'ForceVectorIntuition',
        title: 'Application: Force Vectors in Physics',
        mathBridge: 'A force has both a magnitude (how strong) and a direction (which way). That makes it a vector. Drag the sliders to change the magnitude and direction of each force. The green arrow shows the resultant — the single vector that represents the combined effect of all forces.',
        caption: 'Force, velocity, acceleration, magnetic field, electric field — all vectors in physics.',
      },
      {
        id: 'LALesson11_OrthogonalProjections',
        title: 'Where This Is All Heading: Orthogonal Projection',
        mathBridge: 'This is a teaser from much later in the course (LA4). Every vector can be decomposed into two perpendicular pieces: the "shadow" onto a target direction, and the remainder perpendicular to it. This decomposition is the mathematical engine behind GPS, least-squares fitting, PCA in machine learning, and noise-canceling audio.',
        caption: 'The goal of LA4: decomposing vectors into orthogonal components.',
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
      'For example, the vector $\\vec{v} = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$ has a magnitude of $\\sqrt{3^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$. To turn it into a unit vector $\\hat{v}$, we divide the components by 5: $\\hat{v} = \\begin{bmatrix} 3/5 \\\\ 4/5 \\end{bmatrix}$.',
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
        title: 'Magnitude and the Pythagorean Theorem',
        mathBridge: 'The right triangle hidden inside every vector: the horizontal leg has length $|x|$, the vertical leg has length $|y|$, and the hypotenuse IS the vector. Its length is $\\sqrt{x^2 + y^2}$ by Pythagoras. Drag to $[3, 4]$ and confirm the hypotenuse = 5.',
        caption: 'Every vector contains a right triangle. Magnitude is always the hypotenuse.',
      },
      {
        id: 'UnitVectorBuilder',
        title: 'Unit Vectors — Pure Direction, Length 1',
        mathBridge: 'Drag the blue vector to any direction. The amber arrow is its unit vector — same direction, magnitude exactly 1. The unit vector $\\hat{v} = \\mathbf{v}/\\|\\mathbf{v}\\|$ strips away the "how long" and keeps only the "which way."',
        caption: 'The unit vector is the direction ambassador — it carries direction information with no length bias.',
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
                'The vector [3, 4] is the classic 3-4-5 right triangle. Its unit vector is [0.6, 0.8] — verify: 0.6² + 0.8² = 1.',
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
              id: 4,
              cellTitle: 'Application: CNC tool path as vectors',
              prose: [
                'A CNC machine moves a cutting tool between waypoints. Each waypoint is a position vector. The move from one point to the next is a displacement vector — vector subtraction.',
                'The total distance a tool travels is the sum of the magnitudes of all displacement vectors along the path.',
              ],
              code: `import numpy as np
from opencalc import Figure, BLUE, AMBER, GREEN, RED

# CNC waypoints (X, Y positions in mm)
waypoints = [
    np.array([0.0, 0.0]),
    np.array([50.0, 0.0]),
    np.array([50.0, 30.0]),
    np.array([0.0, 30.0]),
    np.array([0.0, 0.0]),
]

total_distance = 0
print("CNC Tool Path Analysis:")
print("=" * 40)
for i in range(len(waypoints) - 1):
    displacement = waypoints[i+1] - waypoints[i]
    dist = np.linalg.norm(displacement)
    direction = displacement / dist
    total_distance += dist
    print(f"Move {i+1}: {waypoints[i]} → {waypoints[i+1]}")
    print(f"  Displacement: {displacement}, Distance: {dist:.2f} mm")

print(f"\\nTotal tool travel: {total_distance:.2f} mm")

fig = Figure(xmin=-5, xmax=60, ymin=-5, ymax=40, title="CNC Tool Path")
fig.grid().axes()
colors = [BLUE, AMBER, GREEN, RED]
for i in range(len(waypoints) - 1):
    fig.segment(waypoints[i].tolist(), waypoints[i+1].tolist(), color=colors[i % 4])
fig.show()`,
            },
            {
              id: 'c1',
              challengeType: 'write',
              challengeNumber: 1,
              challengeTitle: 'Normalize a vector',
              difficulty: 'easy',
              prompt: 'Given w = [-6, 8], compute: (1) its magnitude (should be 10), (2) its unit vector, (3) verify the unit vector has magnitude 1. Then compute the angle with the positive x-axis using np.degrees(np.arctan2(y, x)).',
              code: `import numpy as np

w = np.array([-6.0, 8.0])

# 1. magnitude
# 2. unit vector
# 3. verify ‖unit‖ = 1
# 4. angle with x-axis
`,
              hint: 'np.linalg.norm(w) for magnitude. w / np.linalg.norm(w) for unit. np.arctan2 gives the angle directly.',
            },
          ],
        },
      },
      {
        id: 'OpenMatNotebook',
        title: 'Vectors in OpenMAT / MATLAB',
        mathBridge: 'MATLAB was designed for matrix math. Key syntax: a semicolon inside brackets starts a new row, so [3; 4] is a 2×1 column vector. norm(v) computes ‖v‖. Dividing by norm gives the unit vector.',
        caption: 'OpenMAT mirrors real MATLAB syntax. Master it here, use it in class.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Column vectors — the MATLAB syntax rule',
              prose: [
                'The key syntax: a **semicolon** inside `[]` starts a new row. So `[3; 4]` is a 2×1 column vector. A **comma** separates columns: `[3, 4]` is a 1×2 row vector.',
                'Linear algebra almost always uses column vectors.',
              ],
              code: `v = [3; 4]
vT = [3, 4]
disp('Column v is shape:'), size(v)
disp('Row vT is shape:'), size(vT)

a = [2; -1; 3];
b = [1;  4;  0];
disp('a + b ='), a + b
disp('3 * a ='), 3 * a`,
            },
            {
              id: 2,
              cellTitle: 'norm() — computing magnitude',
              prose: [
                '`norm(v)` is MATLAB\'s implementation of the Pythagorean theorem: ‖v‖ = √(v₁² + v₂² + …).',
                'To normalize (get a unit vector): divide v by `norm(v)`.',
              ],
              code: `v = [3; 4];
magnitude = norm(v)
unit_v = v / norm(v)
norm(unit_v)

w = [1; 2; 2];
norm(w)   % should be 3: sqrt(1+4+4)=3`,
            },
            {
              id: 3,
              cellTitle: 'Scalar multiplication — four behaviors',
              prose: [
                'c > 1 stretches. 0 < c < 1 shrinks. c = -1 flips. c = 0 collapses to zero.',
              ],
              code: `v = [1; 2; 1];
2.5 * v
0.4 * v
-1 * v
0 * v

% Key rule: ‖c·v‖ = |c| · ‖v‖
c = -3;
abs(c)*norm(v)
norm(c*v)`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC machine coordinates as vectors',
              prose: [
                'In CNC machining, G00 X3.5 Y2.0 Z-1.5 moves the tool to position [3.5, 2.0, -1.5]. That IS a 3D vector.',
                'Displacement = vector subtraction. Distance = norm of displacement.',
              ],
              code: `current = [1.0; 0.5; 0.0];
next = [3.5; 2.0; -1.5];

displacement = next - current
distance = norm(displacement)
direction = displacement / distance

X_axis = [1; 0; 0];
Y_axis = [0; 1; 0];
Z_axis = [0; 0; 1];

check = 3.5*X_axis + 2.0*Y_axis + (-1.5)*Z_axis`,
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────
  rigor: {
    prose: [
      '**Formal Definition of a Vector Space.** A vector space $V$ over a field $\\mathbb{F}$ is a set equipped with two operations — vector addition and scalar multiplication — satisfying ten axioms. We can group them into four families: closure, addition structure, behavior of zero and negatives, and scalar rules.',
      '**The ten axioms:**\n\n1. Closure under addition: $\\mathbf{u} + \\mathbf{v} \\in V$\n2. Closure under scalar multiplication: $c\\mathbf{v} \\in V$\n3. Commutativity: $\\mathbf{u} + \\mathbf{v} = \\mathbf{v} + \\mathbf{u}$\n4. Associativity: $(\\mathbf{u} + \\mathbf{v}) + \\mathbf{w} = \\mathbf{u} + (\\mathbf{v} + \\mathbf{w})$\n5. Zero vector: $\\exists\\, \\mathbf{0}$ with $\\mathbf{v} + \\mathbf{0} = \\mathbf{v}$\n6. Additive inverse: $\\exists\\, -\\mathbf{v}$ with $\\mathbf{v} + (-\\mathbf{v}) = \\mathbf{0}$\n7. Scalar identity: $1 \\cdot \\mathbf{v} = \\mathbf{v}$\n8. Scalar compatibility: $c(d\\mathbf{v}) = (cd)\\mathbf{v}$\n9. Distributivity over vector addition: $c(\\mathbf{u}+\\mathbf{v}) = c\\mathbf{u} + c\\mathbf{v}$\n10. Distributivity over scalar addition: $(c+d)\\mathbf{v} = c\\mathbf{v} + d\\mathbf{v}$',
      '**Why these axioms?** They guarantee that the familiar algebra you learned in school still works in any vector space. Every theorem in linear algebra is proved from exactly these ten rules — no pictures, no coordinates, just logic. Because the axioms say nothing about what vectors "look like," every proof applies universally: to arrows, polynomials, functions, matrices, and anything else satisfying the list.',
      '**Counter-example.** The first quadrant $\\{(x,y) : x \\geq 0, y \\geq 0\\}$ fails Axiom 6: $(-1)(1, 1) = (-1, -1)$ is outside the first quadrant. Not a vector space. Finding even one failing axiom is sufficient to disqualify.',
    ],
    callouts: [
      {
        type: 'theorem',
        title: 'The Ten Axioms of a Vector Space (Grouped)',
        body: '**Closure** (2): under $+$ and scalar $\\cdot$.\n**Addition structure** (4): commutativity, associativity, zero vector, additive inverse.\n**Scalar structure** (4): identity scalar, scalar compatibility, two distributivity rules.\n\nVerify all ten to prove something IS a vector space. Find one failure to prove it is NOT.',
      },
      {
        type: 'insight',
        title: 'The Power of Abstraction',
        body: 'The set of all polynomials of degree $\\leq 2$ is a vector space. This means every theorem we prove about $\\mathbb{R}^n$ automatically applies to polynomial spaces — without any new proof. Abstraction is a machine that multiplies your theorems.',
      },
      {
        type: 'warning',
        title: 'The Usual Mistake: Checking Only Closure',
        body: 'Students often check "is it closed under addition and scalar mult?" and declare victory. But there are 8 more axioms. The sneakiest failure points are: (1) Does a zero vector exist? (2) Does every element have an additive inverse? These fail in "almost vector spaces" like the positive reals or first-quadrant sets.',
      },
    ],
    visualizations: [
      {
        id: 'VectorEqualityProof',
        title: 'Vector Equality: Algebraic Proof vs. Geometric Proof',
        mathBridge: 'Two vectors are equal if and only if all corresponding components are equal: $[a, b] = [c, d]$ iff $a = c$ and $b = d$. This visualization shows what it means for two arrows to be "equal" — same length, same direction, regardless of where they are drawn.',
        caption: 'Equal vectors have the same components — even when drawn at different positions.',
      },
    ],
  },

  // ── Examples ───────────────────────────────────────────────────
  examples: [
    {
      id: 'ex-la1-001-1',
      title: 'Finding the Magnitude',
      problem: 'Calculate the magnitude of the vector $\\mathbf{v} = \\begin{bmatrix} -6 \\\\ 8 \\end{bmatrix}$.',
      steps: [
        {
          expression: '\\|\\mathbf{v}\\| = \\sqrt{(-6)^2 + 8^2}',
          annotation: 'Apply the magnitude formula where $\\mathbf{v} = [-6, 8]^T$, $v_1 = -6$ = horizontal component, $v_2 = 8$ = vertical component. Each component is squared (removing any negative sign) and summed under the radical.',
          strategyTitle: 'Step 1: Set up the magnitude formula',
          hints: ['Square the $x$-component: $(-6)^2 = 36$. Square the $y$-component: $8^2 = 64$. Squaring a negative always gives a positive — magnitude is never negative.'],
        },
        {
          expression: '\\|\\mathbf{v}\\| = \\sqrt{36 + 64} = \\sqrt{100}',
          annotation: 'Add the squared components: $36 + 64 = 100$.',
          strategyTitle: 'Step 2: Sum the squares',
          hints: [],
        },
        {
          expression: '\\|\\mathbf{v}\\| = 10',
          annotation: 'Take the square root. This is the 3-4-5 Pythagorean triple scaled by 2: $(6, 8, 10) = 2 \\times (3, 4, 5)$.',
          strategyTitle: 'Step 3: Take the square root',
          hints: ['Verify: $(6, 8, 10) = 2 \\times (3, 4, 5)$. Whenever you see components 6 and 8, expect magnitude 10.'],
        },
      ],
      conclusion: 'The magnitude is exactly 10 units. Magnitude is always non-negative, even when components are negative.',
    },
    {
      id: 'ex-la1-001-2',
      title: 'Creating a Unit Vector',
      problem: 'Find the unit vector $\\hat{u}$ in the same direction as $\\mathbf{v} = \\begin{bmatrix} 3 \\\\ -4 \\end{bmatrix}$.',
      steps: [
        {
          expression: '\\|\\mathbf{v}\\| = \\sqrt{3^2 + (-4)^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5',
          annotation: 'Compute the magnitude of $\\mathbf{v}$ where $v_1 = 3$, $v_2 = -4$. The classic 3-4-5 triple gives magnitude 5.',
          strategyTitle: 'Step 1: Compute the magnitude',
          hints: ['$(-4)^2 = 16$, not $-16$. Squaring removes the negative sign.'],
        },
        {
          expression: '\\hat{u} = \\frac{1}{\\|\\mathbf{v}\\|}\\mathbf{v} = \\frac{1}{5} \\begin{bmatrix} 3 \\\\ -4 \\end{bmatrix}',
          annotation: 'The unit vector formula: $\\hat{u} = \\mathbf{v} / \\|\\mathbf{v}\\|$ where $\\|\\mathbf{v}\\| = 5$ = the magnitude computed above. Dividing scales the vector so its new length is 1 while preserving direction.',
          strategyTitle: 'Step 2: Divide by magnitude',
          hints: ['Divide EVERY component by the magnitude 5, not just the first component.'],
        },
        {
          expression: '\\hat{u} = \\begin{bmatrix} 3/5 \\\\ -4/5 \\end{bmatrix} = \\begin{bmatrix} 0.6 \\\\ -0.8 \\end{bmatrix}',
          annotation: 'Distribute the scalar $1/5$ to each component. The result points in the exact same direction as $\\mathbf{v}$, but has length exactly 1.',
          strategyTitle: 'Step 3: Distribute to each component',
          hints: ['Verify: $\\|\\hat{u}\\| = \\sqrt{(3/5)^2 + (-4/5)^2} = \\sqrt{9/25 + 16/25} = \\sqrt{25/25} = 1$ ✓'],
        },
      ],
      conclusion: 'The unit vector $[3/5, -4/5]$ points in the exact same direction as $[3, -4]$, but its length is exactly 1.',
    },
    {
      id: 'ex-la1-001-3',
      title: 'Adding Two Vectors — the Tip-to-Tail Rule',
      problem: 'Compute $\\mathbf{a} + \\mathbf{b}$ where $\\mathbf{a} = \\begin{bmatrix} 3 \\\\ 1 \\end{bmatrix}$ and $\\mathbf{b} = \\begin{bmatrix} -1 \\\\ 4 \\end{bmatrix}$. Then find $\\|\\mathbf{a} + \\mathbf{b}\\|$.',
      steps: [
        {
          expression: '\\mathbf{a} + \\mathbf{b} = \\begin{bmatrix} 3 + (-1) \\\\ 1 + 4 \\end{bmatrix}',
          annotation: 'Add vectors component-by-component where $\\mathbf{a} = [3, 1]^T$ and $\\mathbf{b} = [-1, 4]^T$. The $x$-components add independently of the $y$-components. Geometrically: place the tail of $\\mathbf{b}$ at the tip of $\\mathbf{a}$; the sum runs from the original tail to the final tip.',
          strategyTitle: 'Step 1: Component-wise addition',
          hints: ['Each axis is independent. Moving right has no effect on moving up. Horizontal: $3 + (-1) = 2$. Vertical: $1 + 4 = 5$.'],
        },
        {
          expression: '\\mathbf{a} + \\mathbf{b} = \\begin{bmatrix} 2 \\\\ 5 \\end{bmatrix}',
          annotation: '$3 + (-1) = 2$ and $1 + 4 = 5$.',
          strategyTitle: 'Step 2: Compute the components',
          hints: [],
        },
        {
          expression: '\\|\\mathbf{a} + \\mathbf{b}\\| = \\sqrt{2^2 + 5^2} = \\sqrt{4 + 25} = \\sqrt{29} \\approx 5.39',
          annotation: 'Apply the magnitude formula to the result vector $[2, 5]^T$. Note: $\\|\\mathbf{a}\\| = \\sqrt{10} \\approx 3.16$ and $\\|\\mathbf{b}\\| = \\sqrt{17} \\approx 4.12$. So $\\sqrt{29} < \\sqrt{10} + \\sqrt{17}$ — the Triangle Inequality.',
          strategyTitle: 'Step 3: Magnitude of the sum',
          hints: ['The Triangle Inequality states $\\|\\mathbf{a} + \\mathbf{b}\\| \\leq \\|\\mathbf{a}\\| + \\|\\mathbf{b}\\|$. Equality holds only when both vectors point in exactly the same direction. The sum is always shorter than or equal to the sum of individual lengths.'],
        },
      ],
      conclusion: 'The sum is $[2, 5]$ with magnitude $\\sqrt{29} \\approx 5.39$. The Triangle Inequality confirms the sum is shorter than the sum of the individual lengths.',
    },
    {
      id: 'ex-la1-001-4',
      title: 'Magnitude and Unit Vector in 3D',
      problem: 'Find the unit vector $\\hat{v}$ in the direction of $\\mathbf{v} = \\begin{bmatrix} 2 \\\\ -1 \\\\ 2 \\end{bmatrix}$.',
      steps: [
        {
          expression: '\\|\\mathbf{v}\\| = \\sqrt{2^2 + (-1)^2 + 2^2} = \\sqrt{4 + 1 + 4} = \\sqrt{9} = 3',
          annotation: 'The magnitude formula extends to 3D by adding a third squared term where $v_1 = 2$, $v_2 = -1$, $v_3 = 2$. This is the Pythagorean theorem applied twice: $\\sqrt{(\\sqrt{v_1^2+v_2^2})^2 + v_3^2} = \\sqrt{v_1^2+v_2^2+v_3^2}$.',
          strategyTitle: 'Step 1: 3D magnitude',
          hints: ['All three components are squared and summed under one radical. The formula is identical to 2D with an extra term.'],
        },
        {
          expression: '\\hat{v} = \\frac{1}{3} \\begin{bmatrix} 2 \\\\ -1 \\\\ 2 \\end{bmatrix} = \\begin{bmatrix} 2/3 \\\\ -1/3 \\\\ 2/3 \\end{bmatrix}',
          annotation: 'Divide every component by the magnitude $\\|\\mathbf{v}\\| = 3$. The normalization formula $\\hat{v} = \\mathbf{v}/\\|\\mathbf{v}\\|$ is identical in any dimension.',
          strategyTitle: 'Step 2: Divide by magnitude',
          hints: ['Verify: $(2/3)^2 + (-1/3)^2 + (2/3)^2 = 4/9 + 1/9 + 4/9 = 9/9 = 1$ ✓'],
        },
      ],
      conclusion: 'Unit vector: $[2/3, -1/3, 2/3]$. The formulas — magnitude, unit vector, and beyond — extend to any number of dimensions by simply adding more squared terms.',
    },
  ],

  // ── Challenges ─────────────────────────────────────────────────
  challenges: [
    {
      id: 'ch-la1-001-1',
      difficulty: 'easy',
      problem: 'What is the magnitude of the vector $\\begin{bmatrix} 5 \\\\ 12 \\end{bmatrix}$?',
      hint: 'Apply the Pythagorean theorem: $\\sqrt{5^2 + 12^2}$. Does 5-12-? form a Pythagorean triple?',
      walkthrough: [
        '**Set up:** Apply $\\|\\mathbf{v}\\| = \\sqrt{v_1^2 + v_2^2}$ to $\\mathbf{v} = [5, 12]^T$.',
        '**Square each component:** $5^2 = 25$ and $12^2 = 144$.',
        '**Sum:** $25 + 144 = 169$.',
        '**Square root:** $\\sqrt{169} = 13$.',
        '**Pythagorean triple:** 5-12-13 is a classic triple, like 3-4-5. Recognizing these triples speeds up calculations: $5:12:13 = $ scaled versions all give integer magnitudes.',
      ],
      answer: '13',
    },
    {
      id: 'ch-la1-001-2',
      difficulty: 'medium',
      problem: 'A vector $\\mathbf{v}$ has magnitude $10$ and an $x$-component of $6$. If the $y$-component is negative, what is $\\mathbf{v}$ in column format?',
      hint: 'Use the magnitude formula in reverse: $\\sqrt{6^2 + y^2} = 10$. Square both sides and solve for $y$, then choose the negative root.',
      walkthrough: [
        '**Set up the equation:** $\\|\\mathbf{v}\\| = \\sqrt{6^2 + y^2} = 10$.',
        '**Square both sides:** $36 + y^2 = 100$.',
        '**Solve for $y^2$:** $y^2 = 100 - 36 = 64$.',
        '**Take the square root:** $y = \\pm 8$. Since the problem specifies $y < 0$, choose $y = -8$.',
        '**Verify:** $\\|[6, -8]^T\\| = \\sqrt{36 + 64} = \\sqrt{100} = 10$ ✓. This is the 3-4-5 triple scaled by 2.',
      ],
      answer: '\\begin{bmatrix} 6 \\\\ -8 \\end{bmatrix}',
    },
    {
      id: 'ch-la1-001-3',
      difficulty: 'hard',
      problem: 'A vector $\\mathbf{v}$ makes an angle of $120°$ with the positive $x$-axis and has magnitude $4$. Write $\\mathbf{v}$ as a column vector. Use $\\cos(120°) = -\\tfrac{1}{2}$ and $\\sin(120°) = \\tfrac{\\sqrt{3}}{2}$.',
      hint: 'For magnitude $r$ and angle $\\theta$: components are $(r\\cos\\theta, r\\sin\\theta)$. At $120°$, the vector is in the second quadrant — $x$ is negative, $y$ is positive.',
      walkthrough: [
        '**Formula:** For a vector of magnitude $r$ at angle $\\theta$: $v_x = r\\cos\\theta$ and $v_y = r\\sin\\theta$ (from the unit circle definitions of cosine and sine).',
        '**Horizontal component:** $v_x = 4\\cos(120°) = 4 \\cdot (-1/2) = -2$. Negative because $120°$ is in the second quadrant — the vector points left.',
        '**Vertical component:** $v_y = 4\\sin(120°) = 4 \\cdot (\\sqrt{3}/2) = 2\\sqrt{3}$. Positive because the angle is between $0°$ and $180°$ — the vector points upward.',
        '**Assemble:** $\\mathbf{v} = \\begin{bmatrix} -2 \\\\ 2\\sqrt{3} \\end{bmatrix}$.',
        '**Verify magnitude:** $\\|\\mathbf{v}\\| = \\sqrt{(-2)^2 + (2\\sqrt{3})^2} = \\sqrt{4 + 12} = \\sqrt{16} = 4$ ✓',
      ],
      answer: '\\begin{bmatrix} -2 \\\\ 2\\sqrt{3} \\end{bmatrix}',
    },
  ],

  // ── Semantic Layer ───────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: '\\mathbf{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix}', meaning: 'A 2D column vector with components $x$ (horizontal) and $y$ (vertical)' },
      { symbol: '\\|\\mathbf{v}\\|', meaning: 'The magnitude (length) of vector $\\mathbf{v}$ — always non-negative' },
      { symbol: '\\hat{u}', meaning: 'A unit vector (magnitude exactly 1) — represents pure direction' },
    ],
    rulesOfThumb: [
      'A vector is defined by length and direction; its starting position does not matter.',
      'Always write linear algebra vectors as vertical columns to prepare for matrix multiplication.',
      'To find a unit vector, compute length, then divide all components by that length.',
    ],
  },

  // ── Spiral Learning ──────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      { lessonId: 'algebra-pythagoras', label: 'The Pythagorean Theorem', note: 'Vector magnitude is just the Pythagorean theorem applied to the components. The hypotenuse of the triangle IS the length of the vector.' },
    ],
    futureLinks: [
      { lessonId: 'la1-003', label: 'Dot Products', note: 'Unit vectors and magnitudes learned here fuel the calculation of angles using the Dot Product.' },
    ],
  },

  // ── Assessment ───────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'assess-la1-001-1',
        type: 'input',
        text: 'What is the magnitude of the vector $[0, 7]^T$?',
        answer: '7',
        hint: '$\\sqrt{0^2 + 7^2} = \\sqrt{49} = 7$',
      },
    ],
  },

  // ── Mental Model ─────────────────────────────────────────────────
  mentalModel: [
    'Physics: Vectors are arrows — length and direction, not position.',
    'CS: Vectors are ordered lists of numbers.',
    'Math: Vectors are elements of a vector space — things you can add and scale.',
    'Magnitude = hypotenuse of the right triangle formed by components: $\\sqrt{v_1^2 + v_2^2}$.',
    'Unit vector = same direction, length 1. Formula: $\\hat{v} = \\mathbf{v}/\\|\\mathbf{v}\\|$.',
  ],

  // ── Checkpoints ──────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la1-001-1', question: 'What is the magnitude formula for a vector $[x, y]^T$?', answer: '$\\|\\mathbf{v}\\| = \\sqrt{x^2 + y^2}$ — the Pythagorean theorem applied to the components.' },
    { id: 'cp-la1-001-2', question: 'How do you create a unit vector from $\\mathbf{v}$?', answer: 'Divide every component by the magnitude: $\\hat{v} = \\mathbf{v} / \\|\\mathbf{v}\\|$.' },
    { id: 'cp-la1-001-3', question: 'What happens to the direction of $\\mathbf{v}$ when multiplied by a negative scalar?', answer: 'The direction reverses. Magnitude scales by the absolute value of the scalar.' },
  ],

  // ── Final Quiz ─────────────────────────────────────────────────
  quiz: [
    {
      id: 'quiz-la1-001-1',
      type: 'choice',
      text: 'Which of the following is NOT a standard perspective on vectors?',
      options: [
        'An arrow in space with length and direction',
        'A list of numbers (ordered array)',
        'An element satisfying vector space axioms',
        'A single unchangeable coordinate point',
      ],
      answer: 'A single unchangeable coordinate point',
      hints: ['Vectors are displacements (movements), not fixed destinations. A point is a location; a vector is an instruction for how to move.'],
      reviewSection: 'Intuition tab — Vectors vs. Points',
    },
    {
      id: 'quiz-la1-001-2',
      type: 'choice',
      text: 'What is the magnitude of the vector $[-3, 4]^T$?',
      options: ['1', '5', '7', '25'],
      answer: '5',
      hints: ['$\\|[-3, 4]^T\\| = \\sqrt{(-3)^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$. Squaring the negative component gives a positive value.'],
      reviewSection: 'Math tab — Vector Magnitude',
    },
    {
      id: 'quiz-la1-001-3',
      type: 'choice',
      text: 'What is the effect of multiplying a vector $\\mathbf{v}$ by the scalar $-3$?',
      options: [
        'The vector triples in length and keeps the same direction',
        'The vector triples in length and reverses direction',
        'The vector shrinks to one-third its length',
        'The vector becomes the zero vector',
      ],
      answer: 'The vector triples in length and reverses direction',
      hints: ['Magnitude becomes $|-3| \\times \\|\\mathbf{v}\\| = 3\\|\\mathbf{v}\\|$ (triples). The negative sign flips direction. Rule: $\\|c\\mathbf{v}\\| = |c|\\|\\mathbf{v}\\|$.'],
      reviewSection: 'Intuition tab — Scalar Multiplication',
    },
    {
      id: 'quiz-la1-001-4',
      type: 'choice',
      text: 'The zero vector $\\mathbf{0}$ is special. Which statement is TRUE?',
      options: [
        'The zero vector has direction pointing along the $x$-axis',
        'The zero vector has magnitude 0 and undefined direction',
        'The zero vector is not a valid vector',
        'The zero vector has magnitude 1',
      ],
      answer: 'The zero vector has magnitude 0 and undefined direction',
      hints: ['The zero vector results from scaling any vector by 0. It has zero length and no meaningful direction. It IS a valid vector — it is the additive identity $\\mathbf{v} + \\mathbf{0} = \\mathbf{v}$.'],
      reviewSection: 'Intuition tab — Scalar Multiplication',
    },
    {
      id: 'quiz-la1-001-5',
      type: 'choice',
      text: 'Which is the unit vector in the direction of $\\mathbf{v} = [0, -5]^T$?',
      options: ['$[0, -5]^T$', '$[0, -1]^T$', '$[0, 1]^T$', '$[-1, 0]^T$'],
      answer: '$[0, -1]^T$',
      hints: ['$\\|[0,-5]^T\\| = 5$. Unit vector: $[0,-5]^T / 5 = [0, -1]^T$. Direction (straight down) is preserved.'],
      reviewSection: 'Math tab — Unit Vectors',
    },
    {
      id: 'quiz-la1-001-6',
      type: 'choice',
      text: 'Two vectors $\\mathbf{u} = [3, 0]^T$ and $\\mathbf{w} = [-3, 0]^T$ satisfy which relationship?',
      options: [
        'They are equal because both have magnitude 3',
        'They are equal because they have the same number of components',
        'They are NOT equal because they point in opposite directions',
        'They are NOT equal because $\\mathbf{u}$ starts at the origin',
      ],
      answer: 'They are NOT equal because they point in opposite directions',
      hints: ['Vectors are equal only if ALL corresponding components are equal. $[3, 0] \\neq [-3, 0]$ because $3 \\neq -3$. Having the same magnitude is NOT sufficient for equality.'],
      reviewSection: 'Rigor tab — Vector Equality',
    },
  ],
};
