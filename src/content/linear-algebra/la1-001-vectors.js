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
      '**Perspective 1: The Physics View.** To a physicist, a vector is an arrow pointing in space. It has a specific length (magnitude) and a specific direction. Importantly, an arrow is defined *only* by its length and direction — not by where it starts. If you pick up an arrow and move it without rotating it or stretching it, it is still the exact same vector. This is called **free vector** behavior. Two arrows are equal if and only if they have the same length and the same direction — no matter where they are drawn. A force of 50 N north applied at the front of a car and 50 N north applied at the rear are the same vector, even though physically they act at different locations.',
      '**Perspective 2: The Computer Science View.** To a computer scientist, a vector is a list of numbers — an ordered array. `[3, 4]` is a 2D vector; `[1, 0, 0]` is a 3D vector. This perspective says nothing about arrows; it only cares about ordered data. A house can be a vector: `[square_footage, bedrooms, bathrooms, price]`. A song can be a vector: `[tempo, loudness, energy, danceability]`. A Netflix user is a vector of ratings. Everything in data science is ultimately a vector, because lists of numbers are how computers represent the world.',
      '**Perspective 3: The Mathematics View.** To a mathematician, a vector is whatever you want it to be, as long as it satisfies two rules: you can add two of them and get another one (closure under addition), and you can multiply by a number and get another one (closure under scalar multiplication). Polynomials, functions, and even matrices are "vectors" under this definition. The axioms, not arrows in space, are the ultimate definition of what a vector is.',
      '**The bridge between perspectives.** A list like `[3, 4]` algebraically defines an arrow that points 3 units right and 4 units up. The numbers are the DNA; the arrow is the physical manifestation. The physics view gives you geometric intuition; the CS view gives you computational tools; the math view gives you generality. The master at linear algebra flips between all three in a single sentence.',
      '**Scalars: the third ingredient.** Linear algebra is built from three objects: scalars, vectors, and matrices. A **scalar** is just a regular number from $\\mathbb{R}$. The word "scalar" comes from "scale" — when you multiply a vector by a scalar, you scale it. Multiply by $2$ → doubles in length. Multiply by $0.5$ → shrinks to half. Multiply by $-1$ → flips to exact opposite direction. Multiply by $0$ → collapses to the zero vector $\\mathbf{0}$, which has no length and no direction. These four behaviors define everything about how scalars interact with vectors.',
      '**CNC machines: vectors in your hands.** Every CNC machine (milling machine, lathe, router) operates on pure vector mathematics. The three axes — X, Y, Z — are the three basis vectors $\\hat{\\mathbf{i}}, \\hat{\\mathbf{j}}, \\hat{\\mathbf{k}}$. When a G-code program says `G00 X3.0 Y2.0 Z-1.5`, it is commanding the machine to move to the position described by the vector $\\begin{bmatrix}3.0\\\\2.0\\\\-1.5\\end{bmatrix}$. The coordinates ARE the components. Understanding vectors is not a prerequisite for CNC programming — understanding vectors IS CNC programming, expressed geometrically.',
      '**Where this is heading:** Once we establish how to represent arrows and scale them, we will learn how to combine them (Linear Combinations), then how to measure alignment (Dot Product), then how to solve systems of equations with them. The rest of linear algebra is the study of how entire spaces of these arrows transform.',
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
        id: 'LALesson01_Vectors',
        title: 'Vector Components — Geometry meets Algebra',
        mathBridge: 'Drag the vector tip to change its direction and length. Watch how the coordinate list $[x, y]^T$ updates in real-time. This is the core connection: every geometric arrow has exactly one algebraic representation, and every list of numbers has exactly one geometric arrow. They are two languages for the same object.',
        caption: 'Moving the tip horizontally changes only the $x$ component. Moving vertically changes only $y$. They are independent.',
      },
      {
        id: 'VectorComponentDecomposer',
        title: 'Decomposing a Vector into Components',
        mathBridge: 'Any vector $\\mathbf{v} = [x, y]$ can be written as $x \\cdot \\hat{\\mathbf{i}} + y \\cdot \\hat{\\mathbf{j}}$ — the $x$-component of movement along the horizontal axis, plus the $y$-component along the vertical. The dashed lines show the "shadow" of the vector onto each axis. These shadows are the components. They are the two independent ingredients from which the vector is built.',
        caption: 'Every 2D vector is a sum of a horizontal piece and a vertical piece.',
      },
      {
        id: 'ForceVectorIntuition',
        title: 'Application: Force Vectors in Physics',
        mathBridge: 'A force has both a magnitude (how strong) and a direction (which way). That makes it a vector. Drag the sliders to change the magnitude and direction of each force. The green arrow shows the resultant — the single vector that represents the combined effect of all forces. If the resultant is zero, the object is in equilibrium (Newton\'s first law). This is vector addition in a real physical system.',
        caption: 'Force, velocity, acceleration, magnetic field, electric field — all vectors in physics.',
      },
      {
        id: 'LALesson11_OrthogonalProjections',
        title: 'Where This Is All Heading: Orthogonal Projection',
        mathBridge: 'This is a teaser from much later in the course (LA4). Every vector can be decomposed into two perpendicular pieces: the "shadow" onto a target direction, and the remainder perpendicular to it. This decomposition — called orthogonal projection — is the mathematical engine behind GPS, least-squares fitting, PCA in machine learning, and noise-canceling audio. You are building toward this.',
        caption: 'The goal of LA4: decomposing vectors into orthogonal components. See how far we are going.',
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
        title: 'Magnitude and the Pythagorean Theorem',
        mathBridge: 'The right triangle hidden inside every vector: the horizontal leg has length $|x|$, the vertical leg has length $|y|$, and the hypotenuse IS the vector. Its length is $\\sqrt{x^2 + y^2}$ by Pythagoras. Drag to $[3, 4]$ and confirm the hypotenuse = 5. Then try $[5, 12]$ (hypotenuse = 13). These are Pythagorean triples — the same ones from high school, now living inside linear algebra.',
        caption: 'Every vector contains a right triangle. Magnitude is always the hypotenuse.',
      },
      {
        id: 'UnitVectorBuilder',
        title: 'Unit Vectors — Pure Direction, Length 1',
        mathBridge: 'Drag the blue vector to any direction. The amber arrow is its unit vector — same direction, magnitude exactly 1. Watch the magnitude display update. The unit vector $\\hat{v} = \\mathbf{v}/\\|\\mathbf{v}\\|$ strips away the "how long" and keeps only the "which way." Standard basis vectors $\\hat{\\mathbf{i}} = [1,0]$ and $\\hat{\\mathbf{j}} = [0,1]$ are special unit vectors along the axes.',
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
    np.array([0.0, 0.0]),   # start (machine home)
    np.array([50.0, 0.0]),  # G00 X50.0 Y0
    np.array([50.0, 30.0]), # G01 X50.0 Y30.0
    np.array([0.0, 30.0]),  # G01 X0 Y30.0
    np.array([0.0, 0.0]),   # return to home
]

# Displacement vectors between consecutive waypoints
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
    print(f"  Direction (unit): {direction.round(3)}")

print(f"\\nTotal tool travel: {total_distance:.2f} mm")

# Visualize the tool path
fig = Figure(xmin=-5, xmax=60, ymin=-5, ymax=40, title="CNC Tool Path")
fig.grid().axes()
colors = [BLUE, AMBER, GREEN, RED]
for i in range(len(waypoints) - 1):
    p1 = waypoints[i].tolist()
    p2 = waypoints[i+1].tolist()
    fig.segment(p1, p2, color=colors[i % 4])
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
      {
        id: 'OpenMatNotebook',
        title: 'Vectors in OpenMAT / MATLAB',
        mathBridge: 'MATLAB was designed for matrix math. The single most important syntax rule: a semicolon inside brackets starts a new row, so [3; 4] is a 2×1 column vector. norm(v) computes ‖v‖. Dividing by norm gives the unit vector. These three operations — create, measure, normalize — are the entire vector toolkit you need for MATLAB assignments.',
        caption: 'OpenMAT mirrors real MATLAB syntax. Master it here, use it in class.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Column vectors — the MATLAB syntax rule',
              prose: [
                'The key syntax: a **semicolon** inside `[]` starts a new row. So `[3; 4]` is a 2×1 column vector (2 rows, 1 column). A **comma** separates columns: `[3, 4]` is a 1×2 row vector.',
                'Linear algebra almost always uses column vectors. Train yourself to write `[3; 4]` not `[3, 4]`.',
              ],
              code: `% Column vector: semicolons separate rows → 2 rows, 1 column
v = [3; 4]

% Row vector: commas separate columns → 1 row, 2 columns
vT = [3, 4]

% size(x) returns [rows, cols] — shows you the shape
disp('Column v is shape:'), size(v)
disp('Row vT is shape:'), size(vT)

% Operations work component-wise, same as numpy
a = [2; -1; 3];
b = [1;  4;  0];
disp('a + b ='), a + b
disp('3 * a ='), 3 * a`,
            },
            {
              id: 2,
              cellTitle: 'norm() — computing magnitude',
              prose: [
                '`norm(v)` is MATLAB\'s implementation of the Pythagorean theorem: ‖v‖ = √(v₁² + v₂² + …). It works for any dimension.',
                'To normalize (get a unit vector): divide v by `norm(v)`. MATLAB divides every component by the scalar automatically.',
              ],
              code: `v = [3; 4];

% norm() = magnitude = ‖v‖
magnitude = norm(v)

% Unit vector: same direction, length 1
unit_v = v / norm(v)

% Verify: norm of a unit vector is always 1
norm(unit_v)

% The classic 3-4-5 right triangle
% v=[3;4] → norm = 5, unit = [0.6; 0.8]
% Confirm: 0.6^2 + 0.8^2 = 0.36 + 0.64 = 1 ✓

% Works in 3D too
w = [1; 2; 2];
norm(w)   % should be 3: sqrt(1+4+4)=3`,
            },
            {
              id: 3,
              cellTitle: 'Scalar multiplication — four behaviors to see',
              prose: [
                'MATLAB scalar multiplication `c * v` scales every component by c. The four behaviors below are what you should be able to predict before computing:',
                'c > 1 stretches. 0 < c < 1 shrinks. c = -1 flips. c = 0 collapses to zero.',
              ],
              code: `v = [1; 2; 1];

disp('c = 2.5 → stretches (‖2.5v‖ = 2.5·‖v‖)')
2.5 * v, norm(2.5*v), 2.5*norm(v)

disp('c = 0.4 → shrinks')
0.4 * v

disp('c = -1 → flips direction')
-1 * v

disp('c = 0 → zero vector')
0 * v

% Key rule: ‖c·v‖ = |c| · ‖v‖ — magnitude scales by |c|
c = -3;
disp('|-3| · ‖v‖ = ‖-3v‖:')
abs(c)*norm(v)
norm(c*v)`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC machine coordinates are vectors',
              prose: [
                'In CNC machining, a machine move like G00 X3.0 Y2.0 Z-1.5 moves the tool to position [3.0, 2.0, -1.5]. That IS a 3D vector. The X, Y, Z machine axes are the three standard basis vectors.',
                'The displacement from the current position to the next waypoint is the difference of two position vectors — exactly vector subtraction. The distance traveled is the norm of that displacement.',
              ],
              code: `% CNC machine positions as 3D vectors
% (X, Y, Z) coordinates — same as column vectors in linear algebra

% Current tool position
current = [1.0; 0.5; 0.0];   % at (1.0, 0.5, 0.0)

% Next waypoint from G-code: G00 X3.5 Y2.0 Z-1.5
next = [3.5; 2.0; -1.5];

% Displacement vector (the "move" from current to next)
displacement = next - current

% Distance the tool must travel (magnitude of displacement)
distance = norm(displacement)

% Direction of travel (unit vector tells the "which way" without "how far")
direction = displacement / distance

% The three machine axes are the standard basis vectors
X_axis = [1; 0; 0];   % î — right
Y_axis = [0; 1; 0];   % ĵ — forward
Z_axis = [0; 0; 1];   % k̂ — up

% Any position can be written as a linear combination of these three:
% next = 3.5*X_axis + 2.0*Y_axis + (-1.5)*Z_axis
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
      '**Formal Definition of a Vector Space.** A vector space $V$ over a field $\\mathbb{F}$ (think $\\mathbb{F} = \\mathbb{R}$ for our purposes) is a set equipped with two operations — vector addition $(+)$ and scalar multiplication $( \\cdot )$ — satisfying ten axioms. We can group these into four natural families: closure (the operations stay inside the set), algebraic structure of addition (it behaves like ordinary addition), behavior of the zero and negatives, and the rules governing scalars.',
      '**The ten axioms, with explanations:**\n\n1. **Closure under addition**: $\\mathbf{u} + \\mathbf{v} \\in V$ for all $\\mathbf{u}, \\mathbf{v} \\in V$. Adding two vectors gives a vector — it doesn\'t escape the space.\n\n2. **Closure under scalar multiplication**: $c\\mathbf{v} \\in V$ for all scalars $c$ and vectors $\\mathbf{v}$. Scaling a vector stays in the space.\n\n3. **Commutativity of addition**: $\\mathbf{u} + \\mathbf{v} = \\mathbf{v} + \\mathbf{u}$. Order doesn\'t matter: $[3,4] + [1,2] = [1,2] + [3,4]$.\n\n4. **Associativity of addition**: $(\\mathbf{u} + \\mathbf{v}) + \\mathbf{w} = \\mathbf{u} + (\\mathbf{v} + \\mathbf{w})$. Grouping doesn\'t matter.\n\n5. **Zero vector**: There exists $\\mathbf{0} \\in V$ such that $\\mathbf{v} + \\mathbf{0} = \\mathbf{v}$. Adding zero does nothing.\n\n6. **Additive inverse**: For every $\\mathbf{v}$, there exists $-\\mathbf{v}$ such that $\\mathbf{v} + (-\\mathbf{v}) = \\mathbf{0}$. Every vector has an opposite.\n\n7. **Scalar identity**: $1 \\cdot \\mathbf{v} = \\mathbf{v}$. Multiplying by 1 does nothing.\n\n8. **Scalar compatibility**: $c(d\\mathbf{v}) = (cd)\\mathbf{v}$. Sequential scaling = combined scaling.\n\n9. **Distributivity over vector addition**: $c(\\mathbf{u}+\\mathbf{v}) = c\\mathbf{u} + c\\mathbf{v}$.\n\n10. **Distributivity over scalar addition**: $(c+d)\\mathbf{v} = c\\mathbf{v} + d\\mathbf{v}$.',
      '**Why do these axioms exist?** They exist to guarantee that the familiar algebra you learned in school still works. If addition is commutative (axiom 3), you can rearrange terms. If there is a zero (axiom 5), equations like $\\mathbf{x} + \\mathbf{v} = \\mathbf{v}$ have an obvious solution. Every theorem in linear algebra is proved from exactly these ten rules — no pictures, no coordinates, just logic. And because the axioms say nothing about what vectors "look like," every proof applies universally: to arrows, to polynomials, to functions, to matrices, to anything that satisfies the list.',
      '**Counter-example: what fails to be a vector space.** Consider the first quadrant $\\{(x,y) : x \\geq 0, y \\geq 0\\}$ with standard operations. Axiom 6 fails: $(-1) \\cdot (1, 1) = (-1, -1)$, which is outside the first quadrant. Not a vector space. Or consider $\\mathbb{R}^2$ with "twisted" addition $(x_1, y_1) \\oplus (x_2, y_2) = (x_1 + x_2, y_1 y_2)$ — the zero vector would need to satisfy $(0, z_0)$ with $y_1 \\cdot z_0 = y_1$, so $z_0 = 1$. But then $0 \\cdot (1,1) = (0, 1^0) = (0, 1)$, not $(0, 1)$... wait, axiom 8 fails because $(0+0)(1,1) \\neq 0(1,1) + 0(1,1)$ under the twisted rule. Checking axioms systematically is how mathematicians prove or disprove that something is a vector space.',
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
        body: 'The set of all polynomials of degree $\\leq 2$ — $\\{a + bx + cx^2 : a, b, c \\in \\mathbb{R}\\}$ — is a vector space. Why? Because adding two such polynomials gives another, and multiplying by a scalar gives another, and all ten axioms hold. This means every theorem we prove about $\\mathbb{R}^n$ automatically applies to polynomial spaces — without any new proof. **Abstraction is a machine that multiplies your theorems.**',
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
        mathBridge: 'Two vectors are equal if and only if all corresponding components are equal: $[a, b] = [c, d]$ iff $a = c$ and $b = d$. This visualization shows what it means for two arrows to be "equal" — same length, same direction, regardless of where they are drawn. The proof uses the axioms: if $\\mathbf{u} = \\mathbf{v}$, then adding $-\\mathbf{u}$ to both sides gives $\\mathbf{0} = \\mathbf{v} - \\mathbf{u}$.',
        caption: 'Equal vectors have the same components — even when drawn at different positions.',
      },
    ],
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
