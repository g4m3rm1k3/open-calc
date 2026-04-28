export default {
  id: 'gcp-02-vectors-and-points',
  slug: 'vectors-and-points',
  order: 2,
  title: 'Vectors and Points',
  subtitle: 'The two types of geometric object — and every operation the toolpath engine needs',
  tags: [
    'vectors', 'points', 'Vec2', 'Vec3', 'magnitude', 'normalize',
    'dot product', 'cross product', 'lerp', 'dunder methods',
    'Python', 'G-code parser', 'toolpath', 'arc direction',
  ],

  semantics: {
    core: [
      {
        symbol: 'Point',
        meaning:
          'A location in space. Answers "where am I?" Has position but no intrinsic direction or length. ' +
          'In Python we represent a point as a Vec2 or Vec3 — the same data structure, but with the understanding ' +
          'that it is anchored at an absolute location, not a displacement.',
      },
      {
        symbol: 'Vector',
        meaning:
          'A displacement in space. Answers "which direction, and how far?" Has direction and magnitude but no ' +
          'fixed position. Subtracting two points produces a vector: B - A = "the displacement from A to reach B."',
      },
      {
        symbol: 'Magnitude (Length)',
        meaning:
          'The scalar length of a vector. Computed as sqrt(x² + y² + z²). ' +
          'In Python: math.hypot(x, y) for 2D (numerically more stable than sqrt), ' +
          'math.sqrt(x**2 + y**2 + z**2) for 3D. Used in toolpaths to compute segment lengths and feed-rate scaling.',
      },
      {
        symbol: 'Unit Vector (Normalize)',
        meaning:
          'A vector scaled so its magnitude equals exactly 1.0. Direction preserved, length discarded. ' +
          'Computed by dividing each component by the magnitude. Must guard against zero vectors (magnitude < 1e-12) ' +
          'which would produce division by zero.',
      },
      {
        symbol: 'Dot Product',
        meaning:
          'a · b = ax*bx + ay*by (+ az*bz in 3D). Equals |a||b|cos(θ) where θ is the angle between the vectors. ' +
          'If the dot product is 0, the vectors are perpendicular. If positive, the angle between them is less than 90°. ' +
          'Used in toolpaths to detect whether consecutive segments change direction sharply.',
      },
      {
        symbol: 'Cross Product (2D: cross_z)',
        meaning:
          'In 3D, a × b produces a new vector perpendicular to both, with magnitude |a||b|sin(θ). ' +
          'In 2D, we compute only the Z-component: cross_z = ax*by - ay*bx. ' +
          'Positive means b is CCW from a. Negative means b is CW from a. ' +
          'Critical for G-code arc parsing: determines whether an arc is G2 (CW) or G3 (CCW).',
      },
      {
        symbol: 'Linear Interpolation (lerp)',
        meaning:
          'lerp(a, b, t) = a + (b - a) * t. At t=0 the result is a. At t=1 the result is b. ' +
          'At t=0.5 the result is the midpoint. Used in the interpolation pipeline to compute intermediate ' +
          'positions along a straight-line move at each controller time step.',
      },
      {
        symbol: 'Dunder Method',
        meaning:
          'A Python special method whose name starts and ends with double underscores: __add__, __sub__, __mul__, __eq__, __repr__. ' +
          'Defining __add__ on a class makes the + operator work on instances of that class. ' +
          '"Dunder" is short for "double underscore." These methods are not called directly — Python calls them automatically.',
      },
    ],
    rulesOfThumb: [
      'Subtract two points to get a vector. Add a vector to a point to get a new point. Adding two points is meaningless.',
      'Always guard normalize(): check magnitude < 1e-12 before dividing, or raise a descriptive ValueError.',
      'Dot product = 0 means perpendicular. cross_z > 0 means CCW. cross_z < 0 means CW.',
      'Never compare float vectors with ==. Implement __eq__ with math.isclose(abs_tol=1e-9).',
      'magnitude_sq() skips the sqrt and is faster when you only need to compare lengths.',
    ],
  },

  hook: {
    question: 'When a G-code arc moves from point A to point B, how does the interpreter know whether to go clockwise or counter-clockwise?',
    realWorldContext:
      'G2 commands a clockwise arc. G3 commands a counter-clockwise arc. To validate, visualize, or re-generate ' +
      'arcs programmatically, the interpreter must be able to determine the arc direction from the geometry alone — ' +
      'without relying on the G2/G3 keyword. The answer is the 2D cross product.\n\n' +
      'More broadly, every operation the toolpath engine needs — computing segment lengths, detecting direction changes, ' +
      'finding perpendiculars, interpolating intermediate positions — requires a small library of vector math. ' +
      'This lesson builds that library from scratch, explaining every method and every operator from first principles.\n\n' +
      'By the end you will have Vec2 and Vec3 classes that the rest of the interpreter will import and use everywhere.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Point vs vector — the core distinction**: A point answers "where?" A vector answers "which way, how far?" ' +
      'These sound similar but behave differently in math. ' +
      'Subtracting two points (B - A) gives a vector: the displacement from A to B. ' +
      'Adding a vector to a point gives a new point: the destination after moving. ' +
      'Adding two points together has no physical meaning — you cannot add "London" and "Paris."',

      '**Dunder methods — how Python operators work**: ' +
      'When you write `v1 + v2` in Python, Python actually calls `v1.__add__(v2)`. ' +
      'When you write `v * 3.0`, Python calls `v.__mul__(3.0)`. ' +
      'When you write `3.0 * v`, Python calls `v.__rmul__(3.0)` (the reflected version). ' +
      'By defining these methods on our Vec2 and Vec3 classes, we make `+`, `-`, `*`, `-` (negation), and `==` ' +
      'all work naturally with our types. This is called operator overloading.',

      '**The operations toolpaths actually need**: The full Vec2 and Vec3 classes look large, but every method ' +
      'exists because the parser needs it for a specific reason. ' +
      'magnitude() computes segment length and is used for feed-rate scaling. ' +
      'normalize() produces a direction vector and is used for arc normals. ' +
      'dot() detects angle changes at cornering and is used in lookahead smoothing. ' +
      'cross_z() determines G2 vs G3 arc direction. ' +
      'rotate() applies rotation transforms to entire toolpaths. ' +
      'lerp() interpolates positions for the motion controller.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Same class, two roles: point and vector',
        body: 'We use Vec2 and Vec3 for both points (positions) and vectors (displacements). The type is the same — the distinction is in how you use it. This is practical Python. If you want formal type safety, you would add a tag (like the Frame enum from lesson 1), but for the interpreter\'s math layer, the same class works for both.',
      },
      {
        type: 'warning',
        title: 'Normalizing a near-zero vector crashes or explodes',
        body: 'If a segment has zero length (two identical points), its vector has magnitude 0. Dividing by 0 produces inf or NaN, which silently corrupts every subsequent calculation. Always check magnitude < 1e-12 and raise a descriptive ValueError so the bug surfaces immediately at the right place.',
      },
      {
        type: 'insight',
        title: 'cross_z sign tells you the arc direction — G2 vs G3',
        body: 'For a CW arc (G2), the start-to-center vector crossed with the end-to-center vector gives a negative cross_z. For a CCW arc (G3), cross_z is positive. This is how the interpreter verifies arc direction without relying on the G2/G3 keyword being present.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'G-Code Interpreter — Lesson 2: Vectors and Points',
        mathBridge: 'Run cells in order. Vec2 and Vec3 built here are used in every later lesson.',
        caption: 'Build a complete 2D and 3D vector library with all the operations the toolpath engine needs.',
        props: {
          initialCells: [

            // ─── CELL 1: Point vs Vector — conceptual ────────────────────────────────
            {
              id: 1,
              cellTitle: 'Points vs Vectors — the key distinction',
              prose:
                'Before writing any code, internalize the difference. ' +
                'A **point** is a location. A **vector** is a displacement. ' +
                'They use the same (x, y) numbers, but they mean different things. ' +
                'The rule: subtract two points → get a vector. Add a vector to a point → get a new point.',
              code: [
                'import math',
                '',
                '# ── What you CAN do ────────────────────────────────────────────────',
                '# Subtract two points → vector (the displacement from A to B)',
                'A = (1.0, 2.0)',
                'B = (4.0, 6.0)',
                'v = (B[0] - A[0], B[1] - A[1])   # "go from A to reach B"',
                'print(f"A = {A}")',
                'print(f"B = {B}")',
                'print(f"B - A = {v}  ← this is a vector (displacement)")',
                '',
                '# Add a vector to a point → new point',
                'v_move = (10.0, 0.0)',
                'C = (A[0] + v_move[0], A[1] + v_move[1])',
                'print(f"A + (10, 0) = {C}  ← new point after moving right 10 units")',
                '',
                '# ── What you CANNOT do meaningfully ────────────────────────────────',
                'bad = (A[0] + B[0], A[1] + B[1])   # "adding" two points',
                'print()',
                'print(f"A + B = {bad}  ← this has no geometric meaning")',
                'print("Adding two position points produces nonsense.")',
                'print("(What is New York + Los Angeles?)")',
                '',
                '# ── Magnitude of a vector ──────────────────────────────────────────',
                'length = math.hypot(v[0], v[1])   # same as sqrt(vx² + vy²)',
                'print()',
                'print(f"Length of vector {v}: {length:.4f}")',
                'print("(The distance from A to B is the magnitude of B - A.)")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 2: Dunder methods — how Python operators work ──────────────────
            {
              id: 2,
              cellTitle: 'Dunder methods — making + and * work on your own classes',
              prose:
                'Python\'s `+`, `-`, `*`, and `==` operators are just shorthand for special method calls. ' +
                'If you define `__add__` on your class, writing `a + b` calls `a.__add__(b)` automatically. ' +
                'These are called **dunder methods** (double underscore). ' +
                'By defining them on Vec2 and Vec3, we get natural math syntax for free.',
              code: [
                '# Without dunders, you have to call methods explicitly:',
                'class NoDunderVec:',
                '    def __init__(self, x, y):',
                '        self.x = x',
                '        self.y = y',
                '    def add(self, other):',
                '        return NoDunderVec(self.x + other.x, self.y + other.y)',
                '',
                'a = NoDunderVec(1, 2)',
                'b = NoDunderVec(3, 4)',
                'result = a.add(b)    # ugly — must use method name',
                'print(f"Without dunders: a.add(b) = ({result.x}, {result.y})")',
                '',
                '# With dunders, + just works:',
                'class DunderVec:',
                '    def __init__(self, x, y):',
                '        self.x = x',
                '        self.y = y',
                '',
                '    def __add__(self, other):      # called by v1 + v2',
                '        return DunderVec(self.x + other.x, self.y + other.y)',
                '',
                '    def __mul__(self, scalar):     # called by v * 3.0',
                '        return DunderVec(self.x * scalar, self.y * scalar)',
                '',
                '    def __rmul__(self, scalar):    # called by 3.0 * v (reversed order)',
                '        return self.__mul__(scalar)',
                '',
                '    def __repr__(self):',
                '        return f"DunderVec({self.x}, {self.y})"',
                '',
                'p = DunderVec(1, 2)',
                'q = DunderVec(3, 4)',
                'print(f"With dunders: p + q = {p + q}")       # Python calls p.__add__(q)',
                'print(f"With dunders: p * 2.0 = {p * 2.0}")   # Python calls p.__mul__(2.0)',
                'print(f"With dunders: 2.0 * p = {2.0 * p}")   # Python calls p.__rmul__(2.0)',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 3: Vec2 — arithmetic operators ────────────────────────────────
            {
              id: 3,
              cellTitle: 'Vec2 — a 2D vector with full operator support',
              prose:
                'Now we build the real Vec2 class. Every operator is a dunder method. ' +
                '`__eq__` uses `math.isclose` instead of `==` so float rounding does not cause false negatives. ' +
                '`__neg__` makes `-v` work (negating a vector reverses its direction).',
              code: [
                'from dataclasses import dataclass',
                '',
                '@dataclass',
                'class Vec2:',
                '    x: float',
                '    y: float',
                '',
                '    def __add__(self, other: "Vec2") -> "Vec2":',
                '        return Vec2(self.x + other.x, self.y + other.y)',
                '',
                '    def __sub__(self, other: "Vec2") -> "Vec2":',
                '        return Vec2(self.x - other.x, self.y - other.y)',
                '',
                '    def __mul__(self, scalar: float) -> "Vec2":',
                '        return Vec2(self.x * scalar, self.y * scalar)',
                '',
                '    def __rmul__(self, scalar: float) -> "Vec2":',
                '        return self.__mul__(scalar)',
                '',
                '    def __neg__(self) -> "Vec2":',
                '        return Vec2(-self.x, -self.y)',
                '',
                '    def __eq__(self, other: object) -> bool:',
                '        if not isinstance(other, Vec2):',
                '            return NotImplemented',
                '        return (math.isclose(self.x, other.x, abs_tol=1e-9) and',
                '                math.isclose(self.y, other.y, abs_tol=1e-9))',
                '',
                '    def __repr__(self) -> str:',
                '        return f"Vec2({self.x:.6g}, {self.y:.6g})"',
                '',
                '# Test all arithmetic operators:',
                'a = Vec2(3.0, 0.0)',
                'b = Vec2(0.0, 4.0)',
                '',
                'print(f"a         = {a}")',
                'print(f"b         = {b}")',
                'print(f"a + b     = {a + b}")',
                'print(f"b - a     = {b - a}")',
                'print(f"a * 2.0   = {a * 2.0}")',
                'print(f"3.0 * b   = {3.0 * b}")',
                'print(f"-a        = {-a}")',
                'print(f"a == Vec2(3,0): {a == Vec2(3.0, 0.0)}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 4: Vec2 — geometry methods ─────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Vec2 — magnitude, normalize, and dot product',
              prose:
                '**magnitude()** computes the length using `math.hypot` — this is numerically more stable than ' +
                '`math.sqrt(x**2 + y**2)` for very small or very large numbers.\n\n' +
                '**normalize()** returns a unit vector (length = 1) pointing in the same direction. ' +
                'It must check for near-zero magnitude first — dividing by zero produces inf or NaN.\n\n' +
                '**dot()** computes the dot product: `ax*bx + ay*by`. ' +
                'Geometrically this equals `|a| * |b| * cos(θ)`. ' +
                'If dot = 0, the vectors are perpendicular. If dot > 0, they point in roughly the same direction.',
              code: [
                '# (Vec2 and math are in scope from earlier cells.)',
                '',
                '# Add geometry methods to Vec2 by redefining the class.',
                '# All the arithmetic dunders are included again so the class is complete.',
                '',
                '@dataclass',
                'class Vec2:',
                '    x: float',
                '    y: float',
                '',
                '    def __add__(self, o):  return Vec2(self.x+o.x, self.y+o.y)',
                '    def __sub__(self, o):  return Vec2(self.x-o.x, self.y-o.y)',
                '    def __mul__(self, s):  return Vec2(self.x*s, self.y*s)',
                '    def __rmul__(self, s): return self.__mul__(s)',
                '    def __neg__(self):     return Vec2(-self.x, -self.y)',
                '    def __eq__(self, o):',
                '        if not isinstance(o, Vec2): return NotImplemented',
                '        return math.isclose(self.x,o.x,abs_tol=1e-9) and math.isclose(self.y,o.y,abs_tol=1e-9)',
                '    def __repr__(self): return f"Vec2({self.x:.6g}, {self.y:.6g})"',
                '',
                '    def magnitude(self) -> float:',
                '        """Length of the vector. math.hypot is more stable than sqrt(x²+y²)."""',
                '        return math.hypot(self.x, self.y)',
                '',
                '    def magnitude_sq(self) -> float:',
                '        """Squared length. Faster when you only need to compare lengths."""',
                '        return self.x * self.x + self.y * self.y',
                '',
                '    def normalize(self) -> "Vec2":',
                '        """Unit vector in the same direction. Raises if zero vector."""',
                '        m = self.magnitude()',
                '        if m < 1e-12:',
                '            raise ValueError(f"Cannot normalize zero vector: {self}")',
                '        return Vec2(self.x / m, self.y / m)',
                '',
                '    def dot(self, other: "Vec2") -> float:',
                '        """Dot product: ax*bx + ay*by. Equals |a||b|cos(angle)."""',
                '        return self.x * other.x + self.y * other.y',
                '',
                '# Demonstrate with a 3-4-5 right triangle:',
                'a = Vec2(3.0, 0.0)',
                'b = Vec2(0.0, 4.0)',
                '',
                'print(f"a = {a},  |a| = {a.magnitude()}")',
                'print(f"b = {b},  |b| = {b.magnitude()}")',
                'print(f"|a + b| = {(a + b).magnitude():.4f}  (3-4-5 triangle: should be 5.0)")',
                '',
                'n = a.normalize()',
                'print(f"a.normalize() = {n},  |n| = {n.magnitude():.12f}  (should be 1.0)")',
                '',
                'print()',
                'print(f"a · b = {a.dot(b)}  (perpendicular vectors: should be 0.0)")',
                'print(f"a · a = {a.dot(a)}   (dot with itself = |a|² = 9.0)")',
                '',
                '# What does dot product sign tell us?',
                'forward  = Vec2(1.0, 0.0)',
                'sharp_turn = Vec2(-0.5, 0.5).normalize()',
                'print()',
                'print(f"forward   = {forward}")',
                'print(f"sharp_turn = {sharp_turn}")',
                'print(f"dot = {forward.dot(sharp_turn):.4f}  (negative: angle > 90° — a sharp reverse)")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 5: Vec2 — cross_z, angle, rotate ───────────────────────────────
            {
              id: 5,
              cellTitle: 'Vec2 — cross_z (arc direction), angle_to, and rotate',
              prose:
                '**cross_z** computes the Z-component of the 3D cross product for two 2D vectors: ' +
                '`ax*by - ay*bx`. A positive result means `other` is CCW from `self`. ' +
                'A negative result means CW. This is how arc direction (G2 vs G3) is determined from geometry.\n\n' +
                '**angle_to** uses `math.atan2` to compute the signed angle from `self` to `other`. ' +
                'Positive angles are CCW.\n\n' +
                '**rotate** rotates the vector CCW by an angle in radians using the 2D rotation formula.',
              code: [
                '# Redefine Vec2 with all methods. (Replaces the version from cell 4.)',
                '',
                '@dataclass',
                'class Vec2:',
                '    x: float',
                '    y: float',
                '',
                '    def __add__(self, o):  return Vec2(self.x+o.x, self.y+o.y)',
                '    def __sub__(self, o):  return Vec2(self.x-o.x, self.y-o.y)',
                '    def __mul__(self, s):  return Vec2(self.x*s, self.y*s)',
                '    def __rmul__(self, s): return self.__mul__(s)',
                '    def __neg__(self):     return Vec2(-self.x, -self.y)',
                '    def __eq__(self, o):',
                '        if not isinstance(o, Vec2): return NotImplemented',
                '        return math.isclose(self.x,o.x,abs_tol=1e-9) and math.isclose(self.y,o.y,abs_tol=1e-9)',
                '    def __repr__(self): return f"Vec2({self.x:.6g}, {self.y:.6g})"',
                '    def magnitude(self):    return math.hypot(self.x, self.y)',
                '    def magnitude_sq(self): return self.x*self.x + self.y*self.y',
                '    def normalize(self):',
                '        m = self.magnitude()',
                '        if m < 1e-12: raise ValueError(f"Cannot normalize zero vector: {self}")',
                '        return Vec2(self.x/m, self.y/m)',
                '    def dot(self, o): return self.x*o.x + self.y*o.y',
                '',
                '    def cross_z(self, other: "Vec2") -> float:',
                '        """Z-component of 3D cross product. >0 means other is CCW from self."""',
                '        return self.x * other.y - self.y * other.x',
                '',
                '    def angle_to(self, other: "Vec2") -> float:',
                '        """Signed angle in radians from self to other (CCW positive)."""',
                '        return math.atan2(self.cross_z(other), self.dot(other))',
                '',
                '    def rotate(self, angle_rad: float) -> "Vec2":',
                '        """Rotate CCW by angle_rad. Uses 2D rotation matrix."""',
                '        c = math.cos(angle_rad)',
                '        s = math.sin(angle_rad)',
                '        return Vec2(c * self.x - s * self.y, s * self.x + c * self.y)',
                '',
                '# ── cross_z and arc direction ────────────────────────────────────────',
                'right = Vec2(1.0, 0.0)',
                'up    = Vec2(0.0, 1.0)',
                'down  = Vec2(0.0, -1.0)',
                '',
                'print(f"right.cross_z(up)   = {right.cross_z(up):.1f}   (positive → up is CCW from right)")',
                'print(f"right.cross_z(down)  = {right.cross_z(down):.1f}  (negative → down is CW from right)")',
                'print()',
                'print("G-code arc rule: cross_z > 0 → CCW arc (G3). cross_z < 0 → CW arc (G2).")',
                '',
                '# ── angle_to ────────────────────────────────────────────────────────',
                'angle_deg = math.degrees(right.angle_to(up))',
                'print(f"Angle from right to up: {angle_deg:.1f}°  (should be 90.0)")',
                '',
                '# ── rotate ──────────────────────────────────────────────────────────',
                'rotated = Vec2(1.0, 0.0).rotate(math.pi / 2)  # 90° CCW',
                'print(f"Vec2(1,0) rotated 90° CCW: {rotated}  (should be near Vec2(0, 1))")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 6: Challenge 1 — fill-in toolpath operations ──────────────────
            {
              id: 6,
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Compute toolpath segment data',
              difficulty: 'easy',
              cellTitle: 'Challenge 1 — Compute toolpath segment data',
              prose:
                'A G-code program moves the tool from **P1 = (0, 0)** to **P2 = (30, 40)**.\n\n' +
                'Use Vec2 to compute:\n' +
                '- The **displacement vector** from P1 to P2\n' +
                '- The **segment length** (distance the tool travels)\n' +
                '- The **direction** (unit vector along the segment)',
              prompt: 'Fill in the three blanks. Use Vec2 subtraction, .magnitude(), and .normalize().',
              starterBlock: [
                'p1 = Vec2(0.0, 0.0)',
                'p2 = Vec2(30.0, 40.0)',
                '',
                'displacement = ___          # p2 - p1: displacement vector from p1 to p2',
                'length       = ___          # length of the segment',
                'direction    = ___          # unit vector along the segment',
                '',
                'print(f"Displacement : {displacement}")',
                'print(f"Length       : {length:.4f}  (should be 50.0)")',
                'print(f"Direction    : {direction}")',
              ].join('\n'),
              code: [
                '# Paste the starter block, fill in the ___ values, then run.',
                '# p1 = Vec2(0.0, 0.0)',
                '# p2 = Vec2(30.0, 40.0)',
                '# displacement = ___',
                '# length       = ___',
                '# direction    = ___',
              ].join('\n'),
              testCode: [
                'assert "displacement" in dir(), "displacement not defined"',
                'assert isinstance(displacement, Vec2), "displacement must be a Vec2"',
                'assert displacement == Vec2(30.0, 40.0), f"displacement should be Vec2(30, 40), got {displacement}"',
                '',
                'assert "length" in dir(), "length not defined"',
                'assert math.isclose(length, 50.0, abs_tol=1e-9), f"length should be 50.0, got {length}"',
                '',
                'assert "direction" in dir(), "direction not defined"',
                'assert isinstance(direction, Vec2), "direction must be a Vec2"',
                'assert math.isclose(direction.magnitude(), 1.0, abs_tol=1e-9), f"direction must be a unit vector, magnitude={direction.magnitude()}"',
                'assert direction == Vec2(0.6, 0.8), f"direction should be Vec2(0.6, 0.8), got {direction}"',
                '',
                '"SUCCESS: Segment displacement, length, and direction all correct."',
              ].join('\n'),
              hint: 'displacement = p2 - p1. length = displacement.magnitude(). direction = displacement.normalize(). The 3-4-5 rule: sqrt(30² + 40²) = sqrt(900+1600) = sqrt(2500) = 50.',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 7: Vec3 — 3D vectors and cross product ─────────────────────────
            {
              id: 7,
              cellTitle: 'Vec3 — 3D vectors and the cross product',
              prose:
                'Vec3 extends the same ideas to three dimensions. The key addition is **cross()** — ' +
                'the 3D cross product. Unlike dot() which returns a scalar, cross() returns a new vector ' +
                'perpendicular to both inputs. Its direction follows the right-hand rule: ' +
                'curl the fingers from `self` toward `other` — the thumb points in the cross product direction.\n\n' +
                'The **to_vec2_xy()** method drops the Z component, projecting into the XY plane. ' +
                'Useful when you need to classify arc direction from 3D coordinates.',
              code: [
                'from typing import Tuple',
                '',
                '@dataclass',
                'class Vec3:',
                '    x: float',
                '    y: float',
                '    z: float',
                '',
                '    def __add__(self, o):  return Vec3(self.x+o.x, self.y+o.y, self.z+o.z)',
                '    def __sub__(self, o):  return Vec3(self.x-o.x, self.y-o.y, self.z-o.z)',
                '    def __mul__(self, s):  return Vec3(self.x*s, self.y*s, self.z*s)',
                '    def __rmul__(self, s): return self.__mul__(s)',
                '    def __neg__(self):     return Vec3(-self.x, -self.y, -self.z)',
                '    def __eq__(self, o):',
                '        if not isinstance(o, Vec3): return NotImplemented',
                '        return (math.isclose(self.x,o.x,abs_tol=1e-9) and',
                '                math.isclose(self.y,o.y,abs_tol=1e-9) and',
                '                math.isclose(self.z,o.z,abs_tol=1e-9))',
                '    def __repr__(self): return f"Vec3({self.x:.6g}, {self.y:.6g}, {self.z:.6g})"',
                '',
                '    def magnitude(self) -> float:',
                '        return math.sqrt(self.x**2 + self.y**2 + self.z**2)',
                '',
                '    def normalize(self) -> "Vec3":',
                '        m = self.magnitude()',
                '        if m < 1e-12: raise ValueError(f"Cannot normalize zero vector: {self}")',
                '        return Vec3(self.x/m, self.y/m, self.z/m)',
                '',
                '    def dot(self, o) -> float:',
                '        return self.x*o.x + self.y*o.y + self.z*o.z',
                '',
                '    def cross(self, other: "Vec3") -> "Vec3":',
                '        """Right-hand rule cross product. Returns a vector perpendicular to both."""',
                '        return Vec3(',
                '            self.y * other.z - self.z * other.y,',
                '            self.z * other.x - self.x * other.z,',
                '            self.x * other.y - self.y * other.x,',
                '        )',
                '',
                '    def to_vec2_xy(self) -> Vec2:',
                '        """Drop Z — project onto the XY plane."""',
                '        return Vec2(self.x, self.y)',
                '',
                '# Right-hand rule demonstration with unit basis vectors:',
                'i = Vec3(1, 0, 0)   # pointing right (+X)',
                'j = Vec3(0, 1, 0)   # pointing up (+Y)',
                'k = Vec3(0, 0, 1)   # pointing out (+Z)',
                '',
                'print(f"i × j = {i.cross(j)}  (should be k = Vec3(0, 0, 1))")',
                'print(f"j × i = {j.cross(i)}  (should be -k = Vec3(0, 0, -1))")',
                'print(f"j × k = {j.cross(k)}  (should be i = Vec3(1, 0, 0))")',
                'print()',
                'print("Swapping order negates the cross product — order matters!")',
                '',
                '# Perpendicularity check:',
                'cross = i.cross(j)',
                'print(f"i · (i × j) = {i.dot(cross):.1f}  (should be 0 — cross is perpendicular to i)")',
                'print(f"j · (i × j) = {j.dot(cross):.1f}  (should be 0 — cross is perpendicular to j)")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 8: Challenge 2 — implement lerp for Vec2 ───────────────────────
            {
              id: 8,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Implement lerp() for Vec2',
              difficulty: 'easy',
              cellTitle: 'Challenge 2 — Implement lerp(): linear interpolation',
              prose:
                'The motion controller uses linear interpolation to compute intermediate positions ' +
                'along a straight-line segment. At parameter `t=0` the result is the start point. ' +
                'At `t=1` the result is the end point. At `t=0.5` the result is the midpoint.\n\n' +
                '**Formula**: `lerp(a, b, t) = a + (b - a) * t`\n\n' +
                'Write a standalone function `lerp(a, b, t)` that takes two Vec2 objects and a float t.',
              prompt: 'Write the lerp function. Use Vec2 subtraction and multiplication — do not compute x and y components separately.',
              code: [
                '# Write the lerp function here.',
                '# It takes two Vec2 objects and a float t (0.0 to 1.0).',
                '# Formula: a + (b - a) * t',
                '',
                '# def lerp(a: Vec2, b: Vec2, t: float) -> Vec2:',
                '#     ...',
              ].join('\n'),
              testCode: [
                'assert "lerp" in dir(), "lerp function not defined"',
                '',
                'start = Vec2(0.0, 0.0)',
                'end   = Vec2(10.0, 20.0)',
                '',
                '# t=0.0 → start',
                'r0 = lerp(start, end, 0.0)',
                'assert isinstance(r0, Vec2), "lerp must return a Vec2"',
                'assert r0 == Vec2(0.0, 0.0), f"lerp(start,end,0) should be start, got {r0}"',
                '',
                '# t=1.0 → end',
                'r1 = lerp(start, end, 1.0)',
                'assert r1 == Vec2(10.0, 20.0), f"lerp(start,end,1) should be end, got {r1}"',
                '',
                '# t=0.5 → midpoint',
                'r5 = lerp(start, end, 0.5)',
                'assert r5 == Vec2(5.0, 10.0), f"lerp(start,end,0.5) should be Vec2(5,10), got {r5}"',
                '',
                '# t=0.3 → 30% of the way',
                'r3 = lerp(start, end, 0.3)',
                'assert r3 == Vec2(3.0, 6.0), f"lerp(start,end,0.3) should be Vec2(3,6), got {r3}"',
                '',
                '# Non-origin start',
                'ra = lerp(Vec2(2.0, 4.0), Vec2(8.0, 10.0), 0.5)',
                'assert ra == Vec2(5.0, 7.0), f"midpoint of (2,4)→(8,10) should be Vec2(5,7), got {ra}"',
                '',
                '"SUCCESS: lerp() correctly interpolates between two Vec2 points."',
              ].join('\n'),
              hint: 'Use the formula directly: return a + (b - a) * t. Vec2 already supports subtraction and scalar multiplication, so this is a one-liner.',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 9: Challenge 3 — verify normalize ──────────────────────────────
            {
              id: 9,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Verify the normalize identity: v.normalize() · v.normalize() == 1',
              difficulty: 'medium',
              cellTitle: 'Challenge 3 — Write a unit vector test',
              prose:
                'A unit vector, by definition, has magnitude exactly 1.0. ' +
                'The dot product of any unit vector with itself equals 1.0 (since `|u|² = u · u = 1`).\n\n' +
                'Write a function `is_unit(v, tol=1e-9)` that returns `True` if `v` is a unit vector ' +
                '(i.e. its magnitude is within `tol` of 1.0). ' +
                'Then use it to verify that normalizing ANY non-zero Vec2 always produces a unit vector.',
              prompt: 'Write is_unit(), then test it on at least three different normalized vectors. Also verify that normalizing a zero vector raises a ValueError.',
              code: [
                '# Write is_unit(v, tol=1e-9) and verify normalize() behavior.',
                '',
                '# def is_unit(v: Vec2, tol: float = 1e-9) -> bool:',
                '#     ...',
                '',
                '# Then test:',
                '# - Vec2(3, 4).normalize()   → unit?',
                '# - Vec2(1, 0).normalize()   → unit?',
                '# - Vec2(7, -24).normalize() → unit?',
                '# - Vec2(0, 0).normalize()   → should raise ValueError',
              ].join('\n'),
              testCode: [
                'assert "is_unit" in dir(), "is_unit function not defined"',
                '',
                '# Test is_unit on known unit vectors',
                'assert is_unit(Vec2(1.0, 0.0)) == True,  "Vec2(1,0) is a unit vector"',
                'assert is_unit(Vec2(0.0, 1.0)) == True,  "Vec2(0,1) is a unit vector"',
                'assert is_unit(Vec2(0.6, 0.8)) == True,  "Vec2(0.6, 0.8) is a unit vector (3-4-5)"',
                '',
                '# Test is_unit on non-unit vectors',
                'assert is_unit(Vec2(3.0, 4.0)) == False, "Vec2(3,4) is NOT a unit vector"',
                'assert is_unit(Vec2(2.0, 0.0)) == False, "Vec2(2,0) is NOT a unit vector"',
                '',
                '# The core property: normalizing any non-zero vector produces a unit vector',
                'test_vectors = [Vec2(3, 4), Vec2(7, -24), Vec2(1, 1), Vec2(-5, 0), Vec2(0.1, 99.9)]',
                'for v in test_vectors:',
                '    n = v.normalize()',
                '    assert is_unit(n), f"normalize({v}) = {n} is not a unit vector — magnitude={n.magnitude()}"',
                '',
                '# Normalizing a zero vector must raise ValueError',
                'raised = False',
                'try:',
                '    Vec2(0.0, 0.0).normalize()',
                'except ValueError:',
                '    raised = True',
                'assert raised, "Vec2(0,0).normalize() should raise ValueError"',
                '',
                '"SUCCESS: is_unit works correctly and normalize() always produces a unit vector."',
              ].join('\n'),
              hint: 'is_unit checks that abs(v.magnitude() - 1.0) < tol. The core test is: for any non-zero v, v.normalize().magnitude() should equal 1.0 within tolerance. For the zero-vector test, wrap Vec2(0,0).normalize() in a try/except ValueError block.',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 10: Toolpath usage summary ─────────────────────────────────────
            {
              id: 10,
              cellTitle: 'Where each operation is used in the G-code interpreter',
              prose:
                'Every method we built has a specific job in the interpreter pipeline. ' +
                'Run this cell to see the operations applied to a realistic toolpath segment.',
              code: [
                '# A concrete toolpath example: tool moves from start to end,',
                '# then turns to a new direction. We compute everything the interpreter needs.',
                '',
                'start   = Vec2(0.0, 0.0)',
                'end     = Vec2(30.0, 40.0)',
                'next_pt = Vec2(60.0, 40.0)',
                '',
                '# ── Segment 1: start → end ──────────────────────────────────────────',
                'seg1 = end - start',
                'print(f"Segment 1 vector   : {seg1}")',
                'print(f"Segment 1 length   : {seg1.magnitude():.4f} mm")',
                'print(f"Segment 1 direction: {seg1.normalize()}")',
                '',
                '# ── Segment 2: end → next_pt ────────────────────────────────────────',
                'seg2 = next_pt - end',
                'print()',
                'print(f"Segment 2 direction: {seg2.normalize()}")',
                '',
                '# ── Corner analysis ─────────────────────────────────────────────────',
                'd1 = seg1.normalize()',
                'd2 = seg2.normalize()',
                'dot_val   = d1.dot(d2)',
                'cross_val = d1.cross_z(d2)',
                'angle_deg = math.degrees(d1.angle_to(d2))',
                '',
                'print()',
                'print(f"Corner dot product : {dot_val:.4f}  (1.0 = straight, 0 = 90°, -1 = U-turn)")',
                'print(f"Corner cross_z     : {cross_val:.4f}  (>0 = CCW turn, <0 = CW turn)")',
                'print(f"Turn angle         : {angle_deg:.1f}°")',
                '',
                '# ── Midpoint via lerp ────────────────────────────────────────────────',
                'mid = lerp(start, end, 0.5)',
                'print()',
                'print(f"Midpoint of segment 1: {mid}  (used by controller for lookahead)")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'The **magnitude** (length) of a 2D vector $\\mathbf{v} = (v_x, v_y)$ is:',

      '$$|\\mathbf{v}| = \\sqrt{v_x^2 + v_y^2}$$',

      'The **unit vector** in the same direction is:',

      '$$\\hat{\\mathbf{v}} = \\frac{\\mathbf{v}}{|\\mathbf{v}|}$$',

      'This has the property $|\\hat{\\mathbf{v}}| = 1$ and $\\hat{\\mathbf{v}} \\cdot \\hat{\\mathbf{v}} = 1$.',

      'The **dot product** of two 2D vectors:',

      '$$\\mathbf{a} \\cdot \\mathbf{b} = a_x b_x + a_y b_y = |\\mathbf{a}||\\mathbf{b}|\\cos\\theta$$',

      'where $\\theta$ is the angle between them. If $\\mathbf{a} \\cdot \\mathbf{b} = 0$, the vectors are perpendicular.',

      'The **2D cross product** (Z-component of the 3D cross):',

      '$$\\text{cross\\_z}(\\mathbf{a}, \\mathbf{b}) = a_x b_y - a_y b_x = |\\mathbf{a}||\\mathbf{b}|\\sin\\theta$$',

      'Positive means $\\mathbf{b}$ is counter-clockwise from $\\mathbf{a}$. Negative means clockwise.',

      'The **rotation** of $\\mathbf{v}$ by angle $\\theta$ (counter-clockwise):',

      '$$\\begin{pmatrix} v_x\' \\\\ v_y\' \\end{pmatrix} = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix} \\begin{pmatrix} v_x \\\\ v_y \\end{pmatrix}$$',

      'Linear interpolation between points $A$ and $B$:',

      '$$\\text{lerp}(A, B, t) = A + (B - A) \\cdot t = (1-t)A + tB, \\quad t \\in [0, 1]$$',
    ],
  },

  rigor: {
    prose: [
      '**Why math.hypot instead of math.sqrt(x**2 + y**2)?** For very large values, `x**2` can overflow to `inf`. ' +
      'For very small values, `x**2` can underflow to zero, producing a magnitude of 0 for a non-zero vector. ' +
      '`math.hypot` is implemented using a numerically stable algorithm that avoids both overflow and underflow. ' +
      'For typical CNC coordinate values (millimetres, 4 decimal places), the difference is irrelevant, but we ' +
      'use `math.hypot` as a matter of professional habit.',

      '**Why 1e-12 for the zero-vector guard?** The tolerance 1e-12 is roughly the square root of machine epsilon ' +
      'for 64-bit floats. A vector with magnitude below this has essentially no direction — any normalization result ' +
      'would be dominated by floating-point noise. In CNC coordinates (where 1e-9 mm is sub-atomic precision), ' +
      'a magnitude of 1e-12 mm means the two points are effectively identical. Raising an exception is correct: ' +
      'normalizing such a vector is a logical error in the caller, not a recoverable condition.',

      '**Why __eq__ with math.isclose?** The `@dataclass` decorator generates `__eq__` that compares fields with `==`. ' +
      'For floats, `a == b` returns False even when `a` and `b` differ only by floating-point rounding. ' +
      'We override `__eq__` to use `math.isclose(abs_tol=1e-9)`. This means Vec2(1.0, 0.0) == Vec2(1.0, 1e-10) ' +
      'is True — sensible for geometric equality in CNC precision. ' +
      'A consequence: this Vec2 is not hashable by default (Python unhashes objects with custom __eq__). ' +
      'If you need to use Vec2 in a set or as a dict key, add `unsafe_hash=True` to the @dataclass decorator.',

      '**Dot product vs cross_z for angle detection**: The dot product gives `cos(θ)` — it tells you the magnitude ' +
      'of the angle but not its sign (CW vs CCW). The cross_z gives `sin(θ)` with sign — it tells you the direction ' +
      'of the turn. For full angle computation, use `math.atan2(cross_z, dot)` which handles all four quadrants correctly. ' +
      'This is exactly what `angle_to` does.',
    ],
  },

  examples: [
    {
      id: 'ex-arc-direction',
      title: 'Determining G2 vs G3 from geometry alone',
      problem:
        'An arc goes from start (5, 0) to end (0, 5) via center (0, 0). ' +
        'Use cross_z to determine whether this arc is G2 (CW) or G3 (CCW).',
      steps: [
        {
          expression: 'Start-to-center vector',
          annotation: 'center - start = (0,0) - (5,0) = (-5, 0). This is the vector from the start point toward the arc center.',
        },
        {
          expression: 'End-to-center vector',
          annotation: 'center - end = (0,0) - (0,5) = (0, -5). This is the vector from the end point toward the arc center.',
        },
        {
          expression: 'cross_z(start_to_center, end_to_center)',
          annotation: 'cross_z((-5,0), (0,-5)) = (-5)*(-5) - (0)*(0) = 25. Positive cross_z means the arc is CCW.',
        },
        {
          expression: 'Result',
          annotation: 'cross_z > 0 → CCW → this arc is G3. Visually: going from (5,0) to (0,5) counter-clockwise around the origin is indeed a CCW quarter-circle.',
        },
      ],
      conclusion:
        'cross_z of the start-to-center and end-to-center vectors encodes arc direction. ' +
        'Positive = CCW = G3. Negative = CW = G2. ' +
        'This is used in the arc parser to validate programmed G2/G3 against the actual geometry.',
    },
  ],

  quiz: [
    {
      id: 'gcp-02-q1',
      type: 'choice',
      text: 'What does subtracting two points produce?',
      options: [
        'A new point at the average of the two positions',
        'A vector representing the displacement from the first point to the second',
        'A scalar (the distance between them)',
        'It is not valid to subtract two points',
      ],
      correct: 1,
    },
    {
      id: 'gcp-02-q2',
      type: 'choice',
      text: 'Why must normalize() guard against vectors with magnitude < 1e-12?',
      options: [
        'Python raises a ZeroDivisionError automatically for small numbers',
        'Dividing by a near-zero magnitude produces inf or NaN, silently corrupting all subsequent calculations',
        'math.hypot cannot handle near-zero inputs',
        'The @dataclass decorator requires it',
      ],
      correct: 1,
    },
    {
      id: 'gcp-02-q3',
      type: 'choice',
      text: 'Vec2(3, 0) and Vec2(0, 4) are perpendicular. What is their dot product?',
      options: ['12', '5', '0', '7'],
      correct: 2,
    },
    {
      id: 'gcp-02-q4',
      type: 'choice',
      text: 'cross_z(a, b) returns a negative value. What does this mean?',
      options: [
        'b is counter-clockwise from a',
        'b is clockwise from a',
        'a and b are perpendicular',
        'the vectors point in the same direction',
      ],
      correct: 1,
    },
    {
      id: 'gcp-02-q5',
      type: 'choice',
      text: 'What does __rmul__ do on Vec2?',
      options: [
        'It reverses the vector (multiplies by -1)',
        'It handles the case where the scalar is on the left: 3.0 * v calls v.__rmul__(3.0)',
        'It multiplies component-wise with another Vec2',
        'It is the same as __mul__ and is never needed',
      ],
      correct: 1,
    },
    {
      id: 'gcp-02-q6',
      type: 'choice',
      text: 'lerp(Vec2(0,0), Vec2(10,20), 0.3) = ?',
      options: [
        'Vec2(3, 6)',
        'Vec2(5, 10)',
        'Vec2(7, 14)',
        'Vec2(0.3, 0.6)',
      ],
      correct: 0,
    },
    {
      id: 'gcp-02-q7',
      type: 'choice',
      text: 'i.cross(j) where i=(1,0,0) and j=(0,1,0) gives:',
      options: [
        'Vec3(0, 0, 1)',
        'Vec3(0, 0, -1)',
        'Vec3(1, 1, 0)',
        '0 (they are perpendicular)',
      ],
      correct: 0,
    },
    {
      id: 'gcp-02-q8',
      type: 'choice',
      text: 'A unit vector v satisfies v.dot(v) == ?',
      options: ['0', '0.5', '1', 'v.magnitude()'],
      correct: 2,
    },
  ],

  mentalModel: [
    'Point = position (where). Vector = displacement (which way, how far). Subtract points → vector.',
    'magnitude() = length. normalize() = same direction, length 1. Always guard against zero-length.',
    'dot = 0 means perpendicular. dot > 0 means same-ish direction. dot = |a||b|cos(θ).',
    'cross_z > 0 means CCW (G3). cross_z < 0 means CW (G2). This is how arc direction is validated.',
    'lerp(a, b, t) = a + (b-a)*t. t=0 → start. t=1 → end. Used by the motion controller at every time step.',
    'Dunder methods (__add__, __sub__, __mul__) make + - * work. __eq__ with math.isclose makes == safe.',
    'Vec3.cross() is the 3D version. i × j = k. Swapping order negates: j × i = -k.',
    'magnitude_sq() skips the sqrt — faster when you just need to compare distances, not measure them.',
  ],

  checkpoints: ['read-intuition'],
}
