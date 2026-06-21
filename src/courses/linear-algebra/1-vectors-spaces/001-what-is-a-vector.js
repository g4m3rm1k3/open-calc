import droneDisplacementUrl from '../diagrams/la-drone-displacement.svg?url'
import scalarMultiplicationUrl from '../diagrams/la-scalar-multiplication.svg?url'
import threePerspectivesUrl from '../diagrams/la-three-perspectives.svg?url'
import magnitudeTriangleUrl from '../diagrams/la-magnitude-triangle.svg?url'
import unitVectorUrl from '../diagrams/la-unit-vector.svg?url'

export default {
  // ── Identity ───────────────────────────────────────────────────────────────
  id: 'la1-001',
  slug: 'what-is-a-vector',
  chapter: 'la1',
  order: 1,
  title: 'What is a Vector?',
  subtitle: 'The fundamental building block of linear algebra, viewed through the lenses of physics, computer science, and mathematics.',
  tags: ['vectors', 'components', 'magnitude', 'direction', 'coordinates'],
  aliases: 'introduction to vectors point vs vector displacement position vector components',
  timeToComplete: 20,
  coreConcept: 'A vector is a list of numbers encoding direction and magnitude. The magnitude equals the hypotenuse of the right triangle formed by the components. Dividing by the magnitude produces a unit vector of length 1.',
  prerequisites: [],
  nextLesson: 'linear-combinations',

  // ── Hook ───────────────────────────────────────────────────────────────────
  hook: {
    question: "How do we mathematically describe both the speed and direction of a moving object at the same time?",
    realWorldContext: "When a pilot calculates the flight path of an airplane, they must account for the plane's velocity (speed and direction) and the wind's velocity (speed and direction). A single number (like '500 mph') is not enough to predict where the plane will end up. We need a mathematical object that can stretch across space and point specifically toward a target. In modern AI, vectors represent meaning: the word 'king' and the word 'queen' are represented as lists of numbers in a high-dimensional space, and the distance between them mathematically captures their linguistic relationship. Vectors are the universal language for things that have multiple dimensions.",
    previewVisualizationId: 'LALesson11_OrthogonalProjections',
  },

  // ── Intuition ──────────────────────────────────────────────────────────────
  intuition: {
    blocks: [
      {
        type: 'prose',
        paragraphs: [
          '**Start with a movement.** A delivery drone must move 3 meters east and 4 meters north to reach the next package. We record that as $[3,\\; 4]$ — two numbers, one per axis. The first says "go this far east"; the second says "go this far north." That list, encoding both a direction and a distance, is a **vector**. The total distance traveled is the straight-line diagonal: $\\sqrt{3^2 + 4^2} = \\sqrt{25} = 5$ meters (the Pythagorean theorem).',
        ],
      },
      {
        type: 'image',
        src: droneDisplacementUrl,
        alt: 'A vector arrow from the origin to (3,4) on a grid, with dashed legs labeled 3 m east and 4 m north forming a right triangle',
        caption: 'The drone\'s displacement [3, 4]: the vector is the hypotenuse of the right triangle formed by its components.',
      },
      {
        type: 'viz',
        id: 'LALesson01_Vectors',
        title: 'Vector Components — Geometry meets Algebra',
        mathBridge: 'Drag the vector tip to change its direction and length. Watch how the coordinate list $[x, y]^T$ updates in real-time. This is the core connection: every geometric arrow has exactly one algebraic representation, and every list of numbers has exactly one geometric arrow.',
        caption: 'Moving the tip horizontally changes only the $x$ component. Moving vertically changes only $y$. They are independent.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Before reading on, predict:** if you doubled the movement — same direction, twice as far — what would the new vector be, and how far would the drone travel? Work it out before continuing.',
          '**The doubled movement is $[6,\\; 8]$**, and the total distance is $\\sqrt{6^2 + 8^2} = \\sqrt{100} = 10$ meters — exactly twice the original 5. This is **scalar multiplication**: multiplying a vector by 2 stretches it by 2 while keeping the same direction. The distance (magnitude) scales by the same factor.',
        ],
      },
      {
        type: 'prose',
        paragraphs: [
          '**Three perspectives on the same object.** The vector $[3, 4]$ can be read three ways:\n\n**Physics:** an arrow pointing 3 right and 4 up — length 5, angle about 53°. Sliding the arrow to a new position does not change it.\n**Computer science:** an ordered list `[3, 4]`. A house might be `[1200, 3, 2, 450000]` (sqft, bedrooms, bathrooms, price). Every dataset is a collection of vectors.\n**Mathematics:** anything you can add to another and scale by a number — polynomials and functions qualify too.',
        ],
      },
      {
        type: 'image',
        src: threePerspectivesUrl,
        alt: 'Three panels: Physics shows an arrow, Computer Science shows the list [3, 4], Mathematics shows u+v and c·v',
        caption: 'Same vector, three vocabularies: an arrow, a list of numbers, and an object you can add and scale.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Scalars change size, not shape.** A **scalar** is a single real number from $\\mathbb{R}$. Multiplying vector $\\mathbf{v}$ by scalar $c$ produces these four behaviors:\n\n• $c > 1$: stretches $\\mathbf{v}$ (longer, same direction)\n• $0 < c < 1$: shrinks it\n• $c = -1$: reverses direction exactly\n• $c = 0$: collapses to $\\mathbf{0}$ (the zero vector — length 0, no direction)',
        ],
      },
      {
        type: 'image',
        src: scalarMultiplicationUrl,
        alt: 'One vector v shown alongside 2v (stretched), 0.5v (shrunk), and -v (reversed), all drawn from the same origin',
        caption: 'The same vector v under four scalars: stretch, shrink, reverse — and (not shown) collapse to 0 when c = 0.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**The magnitude formula.** The length of a vector is called its **magnitude**, written $\\|\\mathbf{v}\\|$. For $\\mathbf{v} = [x, y]^\\top$, the formula comes directly from the Pythagorean theorem — the components form the two legs of a right triangle, and the vector is the hypotenuse:\n$$\\|\\mathbf{v}\\| = \\sqrt{x^2 + y^2}$$\nFor our drone: $\\|[3,4]^\\top\\| = \\sqrt{9+16} = 5$.',
        ],
      },
      {
        type: 'image',
        src: magnitudeTriangleUrl,
        alt: 'A generic right triangle with horizontal leg x, vertical leg y, and hypotenuse labeled magnitude of v equals square root of x squared plus y squared',
        caption: 'Every vector hides a right triangle — magnitude is always the hypotenuse, by the Pythagorean theorem.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**Unit vectors: pure direction.** Divide any nonzero vector by its own magnitude. The result has length exactly 1. It is called the **unit vector** $\\hat{u} = \\mathbf{v}/\\|\\mathbf{v}\\|$. For $\\mathbf{v} = [3,4]^\\top$: $\\hat{u} = [3/5,\\; 4/5]^\\top = [0.6,\\; 0.8]^\\top$. Same direction as $\\mathbf{v}$, length exactly 1.',
        ],
      },
      {
        type: 'image',
        src: unitVectorUrl,
        alt: 'Vector v = [3,4] with magnitude 5, and its unit vector u-hat = [0.6, 0.8] with magnitude 1, both drawn from the origin pointing the same direction',
        caption: 'v and its unit vector û point the same way — û is just v scaled down to length exactly 1.',
      },
      {
        type: 'prose',
        paragraphs: [
          '**CNC connection.** The command $G00\\; X3.0\\; Y2.0\\; Z{-1.5}$ moves a cutting tool to position $[3.0, 2.0, -1.5]^\\top$. Distance traveled: $\\sqrt{3^2+2^2+1.5^2} \\approx 3.9$ mm. Every displacement between waypoints is vector subtraction; every feed distance is a magnitude.',
        ],
      },
      {
        type: 'viz',
        id: 'LALesson11_OrthogonalProjections',
        title: 'Where This Is All Heading: Orthogonal Projection',
        mathBridge: 'This is a teaser from much later in the course (LA4). Every vector can be decomposed into two perpendicular pieces: the "shadow" onto a target direction, and the remainder perpendicular to it. This decomposition is the mathematical engine behind GPS, least-squares fitting, PCA in machine learning, and noise-canceling audio.',
        caption: 'The goal of LA4: decomposing vectors into orthogonal components.',
      },
    ],
    callouts: [
      {
        type: 'sequencing',
        title: 'Lesson 1 of 6 — Vectors & Spaces',
        body: '**Previous:** (start of chapter)\n**This lesson:** What vectors are — direction, magnitude, scalar multiplication, unit vectors.\n**Next:** Linear Combinations — how to build any vector by scaling and adding basis vectors.',
      },
      {
        type: 'procedure',
        title: 'Procedure: Magnitude and Unit Vector',
        body: 'Given $\\mathbf{v} = [x, y]^\\top$ (extends to 3D by adding $z^2$):\n\nStep 1. Square each component: $x^2$ and $y^2$.\nStep 2. Add the squares: $x^2 + y^2$.\nStep 3. Take the square root: $\\|\\mathbf{v}\\| = \\sqrt{x^2 + y^2}$.\nStep 4. To normalize: divide every component by $\\|\\mathbf{v}\\|$. Result $\\hat{v} = \\mathbf{v}/\\|\\mathbf{v}\\|$ has magnitude exactly 1.',
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
        type: 'definition',
        title: 'What is a Vector? (One-Sentence Definition)',
        body: 'A **vector** is an ordered list of numbers that encodes both a **magnitude** (size) and a **direction**. Written as a column:\n$$\\mathbf{v} = \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$$\nThe top number is the horizontal component (east/west). The bottom is the vertical component (north/south). Together they tell you exactly where to go.',
      },
      {
        type: 'insight',
        title: 'What does the ᵀ mean? (Transpose Notation)',
        body: 'Column vectors take up vertical space on a page. To save space, we often write them sideways with a superscript $^\\top$ (or $^T$):\n$$[3,\\; 4]^\\top \\;\\text{ means }\\; \\begin{bmatrix} 3 \\\\ 4 \\end{bmatrix}$$\nThe $^\\top$ symbol means "transpose" — turn this row into a column. Whenever you see $[a, b]^\\top$, mentally rotate it 90° to stand vertically. The numbers and their order do not change, only the layout on the page. You will see this notation constantly: $[x, y, z]^\\top$ is just a 3D column vector written compactly.',
      },
      {
        type: 'strategy',
        title: 'Why We Use Column Vectors',
        body: 'In calculus, you may have written vectors as $(x, y)$ (row form). In linear algebra, we write them as vertical columns:\n$$\\mathbf{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix}$$\nThis column convention makes **matrix multiplication** work correctly: multiplying a matrix (rows of numbers) by a column vector produces a new column vector. Rows times columns = the standard rule. Always use columns.',
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
  },

  // ── Math ───────────────────────────────────────────────────────────────────
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
        id: 'PythonNotebook',
        title: 'Code: Vectors in NumPy',
        mathBridge: 'A numpy array IS a vector. np.array([3, 4]) creates the column vector [3, 4]^T. np.linalg.norm(v) computes ‖v‖ = √(3²+4²) = 5. Dividing by the norm gives the unit vector.',
        caption: 'Run each cell to see the math formulas become one-liners in code.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Vectors: creation, addition, scalar multiplication',
              prose: [
                '`np.array([3.0, 1.0])` creates the column vector $[3, 1]^\\top$ in code. The list inside is read top-to-bottom, matching how you write a column vector on paper. Use floats (3.0, not 3) so NumPy stores the values as decimals, avoiding integer-division surprises later.',
                '`a + b` adds component-by-component: $[3,1] + [1,2] = [3+1,\\; 1+2] = [4,3]$. NumPy does this automatically for arrays of the same shape — you never write a loop. This is exactly the vector addition definition from the lesson.',
                '`2 * a` multiplies EVERY component by 2: $2[3,1] = [6,2]$. This is scalar multiplication: the vector stretches by factor 2 but keeps its direction. The scalar goes on the LEFT in both math and code.',
                '`-1 * a` negates every component: $[3,1] \\to [-3,-1]$. Same magnitude, reversed direction — the flip behavior from the scalar multiplication callout in the lesson.',
                '`a - b` is shorthand for `a + (-1)*b`: subtract corresponding components. The result is the vector FROM $b$ TO $a$ — geometrically, the arrow that takes you from the tip of $b$ back to the tip of $a$.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

a = np.array([3.0, 1.0])
b = np.array([1.0, 2.0])

print("a =", a)
print("b =", b)
print("a + b =", a + b)       # tip-to-tail
print("2 * a =", 2 * a)       # stretch
print("-1 * a =", -1 * a)     # flip direction
print("a - b =", a - b)       # a + (-b)

fig, axes = plt.subplots(1, 2, figsize=(10, 4))

# Left: show a, b, and their sum
ax = axes[0]
ax.set_title("Vector Addition: a + b")
origin = np.zeros(2)
vectors = {'a': (a, 'steelblue'), 'b': (b, 'darkorange'), 'a+b': (a+b, 'green')}
for label, (v, color) in vectors.items():
    ax.annotate('', xy=v, xytext=origin,
                arrowprops=dict(arrowstyle='->', color=color, lw=2))
    ax.text(v[0]*0.55, v[1]*0.55, label, fontsize=11, color=color, fontweight='bold')
ax.set_xlim(-1, 5); ax.set_ylim(-1, 4)
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.set_aspect('equal'); ax.grid(True, alpha=0.3)

# Right: scalar multiplication effects
ax2 = axes[1]
ax2.set_title("Scalar Multiplication of a")
for scalar, color, label in [(2, 'steelblue', '2a'), (1, 'green', 'a'), (-1, 'red', '-a')]:
    v = scalar * a
    ax2.annotate('', xy=v, xytext=origin,
                 arrowprops=dict(arrowstyle='->', color=color, lw=2))
    ax2.text(v[0]*0.6+0.1, v[1]*0.6+0.1, label, fontsize=11, color=color, fontweight='bold')
ax2.set_xlim(-4, 7); ax2.set_ylim(-2, 3)
ax2.axhline(0, color='k', lw=0.5); ax2.axvline(0, color='k', lw=0.5)
ax2.set_aspect('equal'); ax2.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 2,
              cellTitle: 'Magnitude and unit vectors',
              prose: [
                '`np.linalg.norm(v)` computes $\\|v\\| = \\sqrt{v_1^2 + v_2^2 + \\cdots}$ — the Euclidean magnitude (Pythagorean theorem) from the lesson. For $v = [3, 4]^\\top$ this is $\\sqrt{9+16} = 5$. Works for any number of dimensions: 2D, 3D, or 100D.',
                '`v / magnitude` divides EVERY component by the scalar magnitude: $[3, 4] / 5 = [3/5,\\; 4/5] = [0.6,\\; 0.8]$. This is the unit vector formula $\\hat{v} = \\mathbf{v}/\\|\\mathbf{v}\\|$ applied directly. NumPy broadcasts the scalar division across every element automatically.',
                '`np.linalg.norm(unit)` verifies the result is 1. Always check after normalizing — this confirms $(0.6)^2 + (0.8)^2 = 0.36 + 0.64 = 1.0$. If you get something like $1.0000000000000002$, that is floating-point rounding error: correct to 15 decimal places.',
              ],
              code: `import numpy as np
import matplotlib.pyplot as plt

v = np.array([3.0, 4.0])

magnitude = np.linalg.norm(v)
unit = v / magnitude

print(f"v = {v}")
print(f"||v|| = {magnitude}")       # should be 5.0
print(f"unit vector = {unit}")    # [0.6, 0.8]
print(f"||unit|| = {np.linalg.norm(unit):.6f}")  # should be 1.0

fig, ax = plt.subplots(figsize=(6, 5))
ax.set_title("Vector v and its Unit Vector", fontsize=13)
origin = np.zeros(2)

# Draw the original vector v
ax.annotate('', xy=v, xytext=origin,
            arrowprops=dict(arrowstyle='->', color='steelblue', lw=2.5))
ax.text(v[0]*0.5 + 0.15, v[1]*0.5, f'v = {v}\\n||v|| = {magnitude}',
        color='steelblue', fontsize=10)

# Draw the unit vector
ax.annotate('', xy=unit, xytext=origin,
            arrowprops=dict(arrowstyle='->', color='darkorange', lw=2.5))
ax.text(unit[0]*0.5 - 0.6, unit[1]*0.5 + 0.1, f'unit = {unit}\\n||unit|| = 1',
        color='darkorange', fontsize=10)

# Draw right-triangle components
ax.plot([0, v[0]], [0, 0], 'k--', lw=1, alpha=0.5)
ax.plot([v[0], v[0]], [0, v[1]], 'k--', lw=1, alpha=0.5)
ax.text(v[0]/2, -0.3, f'x={v[0]}', ha='center', fontsize=9, color='gray')
ax.text(v[0]+0.1, v[1]/2, f'y={v[1]}', fontsize=9, color='gray')

ax.set_xlim(-0.5, 4); ax.set_ylim(-0.5, 5)
ax.set_aspect('equal')
ax.axhline(0, color='k', lw=0.5); ax.axvline(0, color='k', lw=0.5)
ax.grid(True, alpha=0.3)

plt.tight_layout()
plt.show()`,
            },
            {
              id: 3,
              cellTitle: 'Visualize: vector and its unit vector',
              prose: [
                '`from opencalc import Figure` loads the course visualization engine. `Figure(square=True, ...)` creates a 2D coordinate grid with equal axis scales — important so arrows do not appear stretched.',
                '`fig.vector(v.tolist(), color=BLUE, label="v")` draws an arrow from the origin to the tip of $v$. The `.tolist()` call converts the NumPy array to a plain Python list because the opencalc API expects standard Python lists, not NumPy arrays.',
                'Run this cell and compare the two arrows visually: the BLUE vector reaches $(3, 4)$ with length $5$. The AMBER unit vector points in exactly the same direction but only reaches $(0.6, 0.8)$ — length 1. This confirms what the formula says: dividing by magnitude preserves direction and sets length to 1.',
                'Key connection: $5 \\times [0.6, 0.8] = [3, 4]$ — you can always reconstruct the original vector as (magnitude) × (unit vector). This decomposition appears constantly in dot products and projections.',
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
                'Each entry in `waypoints` is a 2D position vector: `np.array([50.0, 0.0])` means the tool is at $x = 50\\text{ mm}$, $y = 0$. The machine\'s workspace is just a 2D (or 3D) vector space, and every tool position is a vector from the origin.',
                '`waypoints[i+1] - waypoints[i]` is vector subtraction — the **displacement vector** from the current position to the next waypoint. It is the arrow you would draw between the two points. Components are subtracted: $(x_2 - x_1,\\; y_2 - y_1)$.',
                '`np.linalg.norm(displacement)` gives the straight-line length of that move in mm. Summing all move distances gives `total_distance` — the total tool travel distance, which a CNC programmer uses to estimate machining time at a given feed rate.',
                '`direction = displacement / dist` normalizes the displacement to a unit vector. This unit vector encodes the pure direction of travel. In 5-axis CNC, the controller uses this to keep the tool tip aligned with the cutting direction — pure direction, no distance information needed.',
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
    fig.arrow(waypoints[i].tolist(), waypoints[i+1].tolist(), color=colors[i % 4], label=f"Move {i+1}")
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
# 3. verify ||unit|| = 1
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
        mathBridge: 'MATLAB was designed for matrix math. Key syntax: a semicolon inside brackets starts a new row, so [3; 4] is a 2×1 column vector. Use sqrt(dot(v,v)) to compute ‖v‖. Dividing by the magnitude gives the unit vector.',
        caption: 'OpenMAT mirrors real MATLAB syntax. Master it here, use it in class.',
        initialProps: {
          initialCells: [
            {
              id: 1,
              cellTitle: 'Column vectors — the MATLAB syntax rule',
              prose: [
                'The one syntax rule you must memorize: a **semicolon** inside `[]` starts a new row, making a column. `v = [3; 4]` creates a $2 \\times 1$ column vector $\\begin{bmatrix}3\\\\4\\end{bmatrix}$. A **comma** separates columns: `vT = [3, 4]` creates a $1 \\times 2$ row vector — the transpose.',
                '`size(v)` returns `[2  1]` (2 rows, 1 column). `size(vT)` returns `[1  2]`. Always confirm your vector is a column (first dimension larger) before doing matrix operations. Most bugs in MATLAB linear algebra come from accidentally using row vectors where column vectors are expected.',
                '`a + b` and `3 * a` work exactly as the math defines: component-by-component addition and scalar multiplication. MATLAB applies them element-by-element to every component simultaneously — no loops needed, just as with NumPy.',
              ],
              code: `v = [3; 4];
disp('v (column vector):');  disp(v)
vT = [3, 4];
disp('vT (row vector):');  disp(vT)
fprintf('size(v) = [%d %d],  size(vT) = [%d %d]\\n', size(v,1), size(v,2), size(vT,1), size(vT,2))

a = [2; -1; 3];
b = [1;  4;  0];
apb = a + b;
fprintf('a + b = [%g; %g; %g]\\n', apb(1), apb(2), apb(3))
ta = 3 * a;
fprintf('3 * a = [%g; %g; %g]\\n', ta(1), ta(2), ta(3))`,
            },
            {
              id: 2,
              cellTitle: 'Magnitude and unit vectors',
              prose: [
                '`dot(v, v)` computes the dot product of $v$ with itself: $v_1^2 + v_2^2 + \\cdots$. For `[3; 4]` this is $3^2 + 4^2 = 9 + 16 = 25$. Taking `sqrt` gives $\\sqrt{25} = 5$ — the magnitude formula from the lesson, directly derived from the Pythagorean theorem.',
                'Why write `sqrt(dot(v, v))` instead of just `norm(v)`? Both work in MATLAB/Octave. But `dot(v, v)` makes the connection to the math formula explicit: magnitude is the square root of the sum of squared components. Using it helps you understand WHY the formula works, not just that it works.',
                '`unit_v = v / sqrt(dot(v, v))` is the unit vector formula $\\hat{v} = \\mathbf{v}/\\|\\mathbf{v}\\|$ in code. MATLAB divides every component by the scalar: $[3; 4] / 5 = [0.6; 0.8]$.',
                'The final `sqrt(dot(unit_v, unit_v))` should print `1` (or $1.0000\\ldots$ due to floating-point). This is your verification: a correctly normalized vector always has dot product 1 with itself.',
              ],
              code: `v = [3; 4];
magnitude = sqrt(dot(v, v));
fprintf('||v|| = %.4f  (should be 5)\\n', magnitude)
unit_v = v / sqrt(dot(v, v));
fprintf('unit_v = [%.4f; %.4f]\\n', unit_v(1), unit_v(2))
fprintf('||unit_v|| = %.10f  (should be 1)\\n', sqrt(dot(unit_v, unit_v)))

w = [1; 2; 2];
fprintf('||w|| = %.4f  (should be 3 = sqrt(1+4+4))\\n', sqrt(dot(w, w)))`,
            },
            {
              id: 3,
              cellTitle: 'Scalar multiplication — four behaviors',
              prose: [
                'These four lines demonstrate the four distinct behaviors of scalar multiplication from the lesson. Run each line and compare the output to the vector `v = [1; 2; 1]` to see the effect on every component.',
                '`2.5 * v` stretches: every component multiplied by $2.5$, same direction. `0.4 * v` shrinks: same direction, shorter. `-1 * v` flips: every component negated, opposite direction, same length. `0 * v` collapses: all zeros — the zero vector.',
                'The formula $\\|c \\cdot v\\| = |c| \\cdot \\|v\\|$ is verified by the last two lines: `abs(c)*sqrt(dot(v,v))` computes $|c|\\|v\\|$ and `sqrt(dot(c*v, c*v))` computes $\\|cv\\|$ — they must match for any scalar $c$. Try changing `c` to confirm.',
              ],
              code: `v = [1; 2; 1];
disp('2.5 * v:');  disp(2.5 * v)
disp('0.4 * v:');  disp(0.4 * v)
disp('-1 * v:');   disp(-1 * v)
disp('0 * v:');    disp(0 * v)

% Key rule: ||c·v|| = |c| * ||v||
c = -3;
rule_rhs = abs(c) * sqrt(dot(v, v));
rule_lhs = sqrt(dot(c*v, c*v));
fprintf('|c|*||v|| = %.4f  and  ||c*v|| = %.4f  (equal -> rule verified)\\n', rule_rhs, rule_lhs)`,
            },
            {
              id: 4,
              cellTitle: 'Application: CNC machine coordinates as vectors',
              prose: [
                'The G-code command `G00 X3.5 Y2.0 Z-1.5` moves the tool to position $[3.5, 2.0, -1.5]^\\top$ — that coordinate triple IS a 3D vector from the machine origin. `current` and `next` store two such position vectors.',
                '`displacement = next - current` is vector subtraction: $(3.5 - 1.0,\\; 2.0 - 0.5,\\; -1.5 - 0.0) = (2.5, 1.5, -1.5)$. This displacement vector describes the exact move the machine must execute — direction and distance in one object.',
                '`distance = sqrt(dot(displacement, displacement))` computes $\\|\\text{displacement}\\|$ in mm — how far the tool physically travels. The controller divides distance by the programmed feed rate to calculate move duration.',
                '`direction = displacement / distance` gives the unit vector along the tool path — pure direction stripped of distance. Notice the last expression: $3.5 \\cdot \\hat{X} + 2.0 \\cdot \\hat{Y} + (-1.5) \\cdot \\hat{Z}$ reconstructs the destination position. This is a **linear combination** of the axis unit vectors — the central idea of the next lesson.',
              ],
              code: `current = [1.0; 0.5; 0.0];
next = [3.5; 2.0; -1.5];

displacement = next - current;
fprintf('displacement = [%.2f; %.2f; %.2f]\\n', displacement(1), displacement(2), displacement(3))
distance = sqrt(dot(displacement, displacement));
fprintf('distance = %.4f mm\\n', distance)
direction = displacement / distance;
fprintf('direction = [%.4f; %.4f; %.4f]\\n', direction(1), direction(2), direction(3))

X_axis = [1; 0; 0];
Y_axis = [0; 1; 0];
Z_axis = [0; 0; 1];
check = 3.5*X_axis + 2.0*Y_axis + (-1.5)*Z_axis;
fprintf('Reconstructed pos: [%.2f; %.2f; %.2f]  (= next)\\n', check(1), check(2), check(3))`,
            },
          ],
        },
      },
    ],
  },

  // ── Rigor ──────────────────────────────────────────────────────────────────
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
        id: 'LALesson01_Vectors',
        title: 'Vector Equality: Same Components, Different Positions',
        mathBridge: 'Two vectors are equal if and only if all corresponding components are equal: $[a, b] = [c, d]$ iff $a = c$ and $b = d$. Drag the same vector to different positions in the plane — it remains the same vector. A vector is defined by its components, not where it is drawn.',
        caption: 'Equal vectors have the same components — even when drawn at different positions.',
      },
    ],
  },

  // ── Examples ───────────────────────────────────────────────────────────────
  examples: [
    {
      id: 'la1-001-ex1',
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
      id: 'la1-001-ex2',
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
      id: 'la1-001-ex3',
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
      id: 'la1-001-ex4',
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

  // ── Challenges ─────────────────────────────────────────────────────────────
  challenges: [
    {
      id: 'la1-001-ch1',
      difficulty: 'easy',
      problem: 'What is the magnitude of the vector $\\begin{bmatrix} 5 \\\\ 12 \\end{bmatrix}$?',
      hint: 'Apply the Pythagorean theorem: $\\sqrt{5^2 + 12^2}$. Does 5-12-? form a Pythagorean triple?',
      walkthrough: [
        { expression: '\\|\\mathbf{v}\\| = \\sqrt{5^2 + 12^2}', annotation: 'Apply the magnitude formula (Step 1–3 of the procedure): square each component, add, take the square root.' },
        { expression: '= \\sqrt{25 + 144} = \\sqrt{169}', annotation: '$5^2 = 25$, $12^2 = 144$. Sum: 169.' },
        { expression: '= 13', annotation: '$\\sqrt{169} = 13$. The 5-12-13 Pythagorean triple — like 3-4-5 scaled up.' },
      ],
      answer: 'The magnitude of $[5, 12]^\\top$ is 13 — it forms the Pythagorean triple 5-12-13, a scaled version of 3-4-5.',
    },
    {
      id: 'la1-001-ch2',
      difficulty: 'medium',
      problem: 'A vector $\\mathbf{v}$ has magnitude $10$ and an $x$-component of $6$. The $y$-component is negative. Find $\\mathbf{v}$ in column format.',
      hint: 'Use the magnitude formula in reverse: $\\sqrt{6^2 + y^2} = 10$. Square both sides and solve for $y$, then choose the negative root.',
      walkthrough: [
        { expression: '\\sqrt{6^2 + y^2} = 10', annotation: 'Set up the magnitude formula with the known component $x=6$ and unknown $y$.' },
        { expression: '36 + y^2 = 100 \\implies y^2 = 64', annotation: 'Square both sides to eliminate the radical. Subtract 36.' },
        { expression: 'y = -8 \\;\\text{(negative root chosen)}', annotation: '$y = \\pm 8$; the problem specifies $y < 0$, so $y = -8$.' },
        { expression: '\\mathbf{v} = \\begin{bmatrix}6 \\\\ -8\\end{bmatrix}, \\quad \\|\\mathbf{v}\\| = \\sqrt{36+64} = 10 \\checkmark', annotation: 'Verify: magnitude is indeed 10. This is the 3-4-5 triple scaled by 2.' },
      ],
      answer: 'The vector is $[6, -8]^\\top$ — found by solving the magnitude equation in reverse for the unknown component.',
    },
    {
      id: 'la1-001-ch3',
      difficulty: 'hard',
      problem: 'A vector $\\mathbf{v}$ makes an angle of $120°$ with the positive $x$-axis and has magnitude $4$. Write $\\mathbf{v}$ as a column vector using $\\cos(120°) = -\\tfrac{1}{2}$ and $\\sin(120°) = \\tfrac{\\sqrt{3}}{2}$.',
      hint: 'For magnitude $r$ and angle $\\theta$: components are $(r\\cos\\theta,\\, r\\sin\\theta)$. At $120°$, the vector is in the second quadrant — $x$ is negative, $y$ is positive.',
      walkthrough: [
        { expression: 'v_x = 4\\cos(120°) = 4 \\cdot (-1/2) = -2', annotation: 'Horizontal component: magnitude times cosine of the angle. Negative because $120°$ puts the vector in the second quadrant (pointing left).' },
        { expression: 'v_y = 4\\sin(120°) = 4 \\cdot (\\sqrt{3}/2) = 2\\sqrt{3}', annotation: 'Vertical component: magnitude times sine of the angle. Positive because $0° < 120° < 180°$ (vector points upward).' },
        { expression: '\\mathbf{v} = \\begin{bmatrix}-2 \\\\ 2\\sqrt{3}\\end{bmatrix}', annotation: 'Assemble the column vector.' },
        { expression: '\\|\\mathbf{v}\\| = \\sqrt{4 + 12} = \\sqrt{16} = 4 \\checkmark', annotation: 'Verify: $(-2)^2 + (2\\sqrt{3})^2 = 4 + 12 = 16$. Magnitude is 4 as required.' },
      ],
      answer: 'The vector is $[-2,\\; 2\\sqrt{3}]^\\top$, found by multiplying the magnitude by the cosine and sine of the given angle.',
    },
  ],

  // ── Semantic Layer ─────────────────────────────────────────────────────────
  semantics: {
    core: [
      { symbol: '\\mathbf{v} = \\begin{bmatrix} x \\\\ y \\end{bmatrix}', meaning: 'A 2D column vector — an ordered list of numbers encoding a displacement of $x$ units horizontally and $y$ units vertically' },
      { symbol: '\\|\\mathbf{v}\\|', meaning: 'The magnitude (Euclidean length) of vector $\\mathbf{v}$ — computed as $\\sqrt{x^2+y^2}$, always non-negative' },
      { symbol: '\\hat{u}', meaning: 'A unit vector — has magnitude exactly 1, representing pure direction with no scale information' },
      { symbol: 'c\\mathbf{v}', meaning: 'Scalar multiplication — stretches $\\mathbf{v}$ by $|c|$; flips direction if $c < 0$; collapses to $\\mathbf{0}$ if $c = 0$' },
      { symbol: '\\mathbf{0}', meaning: 'The zero vector — all components are 0, magnitude is 0, direction is undefined; it is the additive identity $\\mathbf{v} + \\mathbf{0} = \\mathbf{v}$' },
    ],
    rulesOfThumb: [
      'A vector is defined by length and direction; its starting position does not matter.',
      'Always write linear algebra vectors as vertical columns to prepare for matrix multiplication.',
      'To find a unit vector: compute the magnitude, then divide every component by that magnitude.',
      'Magnitude is always non-negative — squaring removes the sign of each component before summing.',
      'When a scalar is negative, it flips direction; magnitude scales by the absolute value of the scalar.',
    ],
  },

  // ── Spiral Learning ────────────────────────────────────────────────────────
  spiral: {
    recoveryPoints: [
      { lessonId: 'algebra-pythagoras', label: 'The Pythagorean Theorem', note: 'Vector magnitude is just the Pythagorean theorem applied to the components. The hypotenuse of the triangle IS the length of the vector.' },
    ],
    futureLinks: [
      { lessonId: 'la1-003', label: 'Dot Products', note: 'Unit vectors and magnitudes learned here fuel the calculation of angles using the Dot Product.' },
    ],
  },

  // ── Assessment ─────────────────────────────────────────────────────────────
  assessment: {
    questions: [
      {
        id: 'la1-001-assess-1',
        type: 'choice',
        text: 'What is the magnitude of the vector $[0, 7]^\\top$?',
        options: ['$\\sqrt{7}$', '$7$', '$14$', '$49$'],
        answer: '$7$',
        hint: '$\\sqrt{0^2 + 7^2} = \\sqrt{49} = 7$. When one component is 0, the formula reduces to the absolute value of the other component.',
      },
      {
        id: 'la1-001-assess-2',
        type: 'choice',
        text: 'The notation $[2, -5, 3]^\\top$ represents which of the following?',
        options: [
          'A 1×3 row vector (one row, three columns)',
          'A 3×1 column vector (three rows, one column)',
          'A scalar equal to $2 - 5 + 3 = 0$',
          'An invalid expression because of the superscript $T$',
        ],
        answer: 'A 3×1 column vector (three rows, one column)',
        hint: 'The $^\\top$ (transpose) notation means "turn this row into a column." $[2, -5, 3]^\\top$ is just a shorthand for the column $\\begin{bmatrix}2\\\\-5\\\\3\\end{bmatrix}$.',
      },
      {
        id: 'la1-001-assess-3',
        type: 'choice',
        text: 'What is the unit vector in the direction of $\\mathbf{v} = [5, 0]^\\top$?',
        options: ['$[5, 0]^\\top$', '$[1, 0]^\\top$', '$[0, 1]^\\top$', '$[0.5, 0]^\\top$'],
        answer: '$[1, 0]^\\top$',
        hint: '$\\|[5,0]^\\top\\| = 5$. Unit vector: $[5,0]^\\top / 5 = [1, 0]^\\top$. This is the standard x-axis unit vector, often written $\\hat{e}_1$.',
      },
      {
        id: 'la1-001-assess-4',
        type: 'choice',
        text: 'A vector $\\mathbf{v}$ has $\\|\\mathbf{v}\\| = 6$. After computing $-\\tfrac{1}{2}\\mathbf{v}$, what is the magnitude of the result?',
        options: ['$-3$', '$3$', '$6$', '$12$'],
        answer: '$3$',
        hint: '$\\|c\\mathbf{v}\\| = |c| \\cdot \\|\\mathbf{v}\\| = |-\\tfrac{1}{2}| \\cdot 6 = 3$. Magnitude is always non-negative; the $|c|$ removes any negative sign.',
      },
    ],
  },

  // ── Mental Model ───────────────────────────────────────────────────────────
  mentalModel: [
    'Physics: Vectors are arrows — length and direction, not position.',
    'CS: Vectors are ordered lists of numbers.',
    'Math: Vectors are elements of a vector space — things you can add and scale.',
    'Magnitude = hypotenuse of the right triangle formed by components: $\\sqrt{v_1^2 + v_2^2}$.',
    'Unit vector = same direction, length 1. Formula: $\\hat{v} = \\mathbf{v}/\\|\\mathbf{v}\\|$.',
  ],

  misconceptions: [
    {
      falseBelief: 'The magnitude of $[-3, 4]$ is $-3 + 4 = 1$ because you just add the components.',
      whyStudentsThinkIt: 'Students transfer "distance = sum of parts" thinking from everyday contexts (driving 3 miles then 4 miles = 7 miles total) to vectors, forgetting that vector components are perpendicular.',
      correctionExample: '$\\|[-3, 4]^\\top\\| = \\sqrt{(-3)^2 + 4^2} = \\sqrt{9+16} = 5$, not 1. You must square, sum, then root — never add directly.',
      contrastCase: 'If the two vectors were parallel (same direction), THEN you could add magnitudes. For perpendicular components, you always need the Pythagorean theorem.',
    },
    {
      falseBelief: 'Multiplying a vector by $-2$ gives a vector with magnitude $-2$ times the original.',
      whyStudentsThinkIt: 'Students confuse the scalar value (which can be negative) with the magnitude (which is always non-negative).',
      correctionExample: 'For $\\mathbf{v} = [3, 4]^\\top$ with $\\|\\mathbf{v}\\| = 5$: $(-2)\\mathbf{v} = [-6, -8]^\\top$ and $\\|(-2)\\mathbf{v}\\| = 10 = |{-2}| \\cdot 5$. The magnitude is always $|c| \\cdot \\|\\mathbf{v}\\|$, never $c \\cdot \\|\\mathbf{v}\\|$.',
      contrastCase: 'The direction of $(-2)\\mathbf{v}$ is reversed (opposite to $\\mathbf{v}$), but the magnitude is positive 10.',
    },
  ],

  transferPrompts: [
    {
      situation: 'You are given the magnitude and direction angle of a vector and need to write it as a column.',
      competingTechniques: 'Guess the components from context vs. use $v_x = r\\cos\\theta$, $v_y = r\\sin\\theta$',
      whyThisTechniqueWins: 'The component formula is exact and works for any angle. Guessing only works for 0°, 90°, 180°, 270°.',
    },
    {
      situation: 'You need a vector pointing north-east with length exactly 1.',
      competingTechniques: 'Write $[1, 1]$ (wrong — length is $\\sqrt{2}$) vs. write $[1/\\sqrt{2},\\; 1/\\sqrt{2}]$ (unit vector at 45°)',
      whyThisTechniqueWins: 'Always normalize: compute $[1,1]$, find its magnitude $\\sqrt{2}$, divide each component. The result $[0.707, 0.707]$ has length exactly 1.',
    },
  ],

  debugging: [
    {
      commonError: 'Computing $\\|[3, 4]\\| = 3 + 4 = 7$ instead of $\\sqrt{3^2+4^2} = 5$.',
      symptom: 'The magnitude is too large and does not match the visual length of the arrow.',
      whyItHappened: 'Students forget to square the components before adding. The Pythagorean theorem requires squaring; straight addition has no geometric meaning for perpendicular components.',
      repairStrategy: 'Write out the formula explicitly before computing: $\\sqrt{(\\_\\_)^2 + (\\_\\_)^2}$. Fill in the blanks, square each number, then add, then root.',
    },
    {
      commonError: 'Finding the unit vector of $[0, 0]$ by dividing by 0.',
      symptom: 'Division by zero error or `nan` output in code.',
      whyItHappened: 'The zero vector has magnitude 0. Dividing by 0 is undefined. The zero vector has no direction, so no unit vector exists.',
      repairStrategy: 'Always check $\\|\\mathbf{v}\\| \\neq 0$ before normalizing. In code: `if np.linalg.norm(v) > 1e-12: unit = v / np.linalg.norm(v)`.',
    },
  ],

  mastery: {
    targetLevel: 2,
    solveIndependently: 'Compute the magnitude and unit vector of any 2D or 3D vector without referring to a formula sheet.',
    explainVerbally: 'Explain why magnitude uses the Pythagorean theorem and why you cannot just add components.',
    detectIncorrectApplication: 'Identify when a student has added components instead of using the Pythagorean theorem, and describe the correction.',
    transferToUnfamiliar: 'Given a force of magnitude 10 N at 135°, write the force vector in component form and verify its magnitude.',
  },

  // ── Checkpoints ────────────────────────────────────────────────────────────
  checkpoints: [
    { id: 'cp-la1-001-1', label: 'Read the magnitude formula derivation in the Math tab', type: 'read' },
    { id: 'cp-la1-001-2', label: 'Read the Procedure: Magnitude and Unit Vector callout', type: 'read' },
    { id: 'cp-la1-001-3', label: 'Read the scalar multiplication behaviors callout', type: 'read' },
    { id: 'cp-la1-001-4', label: 'Run the NumPy magnitude and unit vector notebook cells', type: 'lab' },
    { id: 'cp-la1-001-5', label: 'Run the CNC tool path notebook cells', type: 'lab' },
    { id: 'cp-la1-001-6', label: 'Complete Example 1 — compute magnitude of [-6, 8]', type: 'example' },
    { id: 'cp-la1-001-7', label: 'Complete Example 2 — find unit vector of [3, -4]', type: 'example' },
    { id: 'cp-la1-001-8', label: 'Attempt Challenge 3 — construct a vector from angle and magnitude', type: 'challenge' },
  ],

  // ── Final Quiz ─────────────────────────────────────────────────────────────
  quiz: [
    {
      id: 'la1-001-quiz-1',
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
      id: 'la1-001-quiz-2',
      type: 'choice',
      text: 'What is the magnitude of the vector $[-3, 4]^T$?',
      options: ['1', '5', '7', '25'],
      answer: '5',
      hints: ['$\\|[-3, 4]^T\\| = \\sqrt{(-3)^2 + 4^2} = \\sqrt{9 + 16} = \\sqrt{25} = 5$. Squaring the negative component gives a positive value.'],
      reviewSection: 'Math tab — Vector Magnitude',
    },
    {
      id: 'la1-001-quiz-3',
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
      id: 'la1-001-quiz-4',
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
      id: 'la1-001-quiz-5',
      type: 'choice',
      text: 'Which is the unit vector in the direction of $\\mathbf{v} = [0, -5]^T$?',
      options: ['$[0, -5]^T$', '$[0, -1]^T$', '$[0, 1]^T$', '$[-1, 0]^T$'],
      answer: '$[0, -1]^T$',
      hints: ['$\\|[0,-5]^T\\| = 5$. Unit vector: $[0,-5]^T / 5 = [0, -1]^T$. Direction (straight down) is preserved.'],
      reviewSection: 'Math tab — Unit Vectors',
    },
    {
      id: 'la1-001-quiz-6',
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
