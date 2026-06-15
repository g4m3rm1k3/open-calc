export default {
  id: 'gcp-03-transformations',
  slug: 'transformations',
  order: 3,
  title: 'Transformations',
  subtitle: 'How 3×3 and 4×4 matrices encode rotation, translation, and scale — and why order matters',
  tags: [
    'matrices', 'homogeneous coordinates', 'rotation', 'translation', 'scaling',
    'Transform2D', 'Transform3D', 'affine transforms', 'composition',
    'work offset', 'toolpath', 'Python', 'G-code parser',
  ],

  semantics: {
    core: [
      {
        symbol: 'Transformation',
        meaning:
          'A function that maps every point in space to a new point. ' +
          'Linear transformations (rotation, scale, shear) can be represented as matrix multiplications. ' +
          'Translation cannot be written as a matrix multiply on bare (x, y) coordinates — ' +
          'which is exactly why homogeneous coordinates were invented.',
      },
      {
        symbol: 'Homogeneous Coordinates',
        meaning:
          'A trick that adds one extra coordinate so that translation fits into a matrix multiply. ' +
          'A 2D point (x, y) becomes (x, y, 1). A 2D vector (x, y) becomes (x, y, 0). ' +
          'The 1 vs 0 is not arbitrary: it makes translations apply to points but ignore pure direction vectors. ' +
          'In 3D, points get a 4th coordinate w=1: (x, y, z, 1).',
      },
      {
        symbol: 'Rotation Matrix (2D)',
        meaning:
          'A 2×2 matrix (or 3×3 in homogeneous form) that rotates points CCW by angle θ: '
          + 'top row [cos θ, −sin θ], bottom row [sin θ, cos θ]. '
          + 'The columns are unit vectors: the first column is where +X goes, the second is where +Y goes.',
      },
      {
        symbol: 'Translation Matrix (Homogeneous)',
        meaning:
          'A 3×3 identity matrix with tx and ty placed in the last column, third row = [0,0,1]. '
          + 'Multiplying (x, y, 1) by this matrix produces (x+tx, y+ty, 1). '
          + 'Translation in pure (x,y) coordinates requires addition, not multiplication — '
          + 'homogeneous form unifies all affine ops into one matrix multiply.',
      },
      {
        symbol: 'Transform Composition',
        meaning:
          'Chaining transforms by multiplying their matrices together. '
          + 'If you want to apply transform A then B, the composed matrix is M = B × A '
          + '(rightmost = applied first). In the Transform2D class, `(B * A).apply(p)` is equivalent to `B.apply(A.apply(p))`.',
      },
      {
        symbol: 'Matrix3 / Matrix4',
        meaning:
          'Type aliases for List[List[float]]. Matrix3 is a 3×3 matrix stored as a list of 3 rows, each row a list of 3 floats. '
          + 'Matrix4 is 4×4. Row i, column j is accessed as M[i][j]. '
          + 'This representation is simple and explicit — no NumPy required for the interpreter.',
      },
      {
        symbol: 'rotate_about',
        meaning:
          'Rotating around an arbitrary pivot point (cx, cy), not the origin. '
          + 'Implemented by composing three transforms: translate(−cx, −cy), rotate(θ), translate(cx, cy). '
          + 'Move the pivot to the origin, rotate, move it back.',
      },
    ],
    rulesOfThumb: [
      'Rightmost matrix in a product is applied first. (B * A).apply(p) does A first, then B.',
      'Rotation-then-translate and translate-then-rotate produce DIFFERENT results. Always think about order.',
      'Use homogeneous w=1 for points (translations apply), w=0 for direction vectors (translations ignored).',
      'Rotate about a pivot by composing: translate(-pivot), rotate, translate(+pivot).',
      'In the G-code pipeline: raw coords → unit conversion → work offset translation → fixture rotation. Left to right.',
    ],
  },

  hook: {
    question: 'A CNC fixture is bolted at 30° to the table and shifted 50 mm right, 20 mm up. How does the interpreter map every programmed coordinate to the correct machine position?',
    realWorldContext:
      'When a machinist mounts a fixture at an angle, all subsequent G-code coordinates are relative to '
      + 'that rotated and shifted frame. The interpreter must apply the correct rotation and then translation '
      + '(in that order, because order matters) to every point before sending motor commands.\n\n'
      + 'The tool for encoding any combination of rotation, translation, and scale into a single, reusable object '
      + 'is the transformation matrix. Chapter 3 builds that tool from first principles: starting with the 2D rotation '
      + 'formula, adding homogeneous coordinates to handle translation, then composing multiple transforms cleanly '
      + 'via matrix multiplication.\n\n'
      + 'By the end you will have Transform2D and Transform3D classes that the toolpath pipeline uses to map '
      + 'programmed coordinates all the way to machine coordinates in one matrix multiply.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Why matrices?** Rotation and scaling are naturally written as matrix multiplications: '
      + 'multiplying a column vector [x, y] by a 2×2 rotation matrix gives the rotated [x\', y\']. '
      + 'But translation — "add 5 to x" — cannot be written that way. You cannot fit tx into a 2×2 matrix '
      + 'that multiplies a 2-component vector. The fix is to add one more coordinate (w), making the point '
      + '(x, y, 1) and using a 3×3 matrix. Now translation fits in the third column.',

      '**Homogeneous coordinates — points vs vectors**: The dummy coordinate w is 1 for points and 0 for '
      + 'direction vectors. This distinction is not a convention — it has a geometric consequence. '
      + 'When w=0, the translation columns of the matrix contribute nothing, so pure direction vectors are '
      + 'correctly unaffected by translation. When w=1, the translation terms are added. '
      + 'The same matrix, the same multiply, correct behavior for both.',

      '**Composition — why multiplication order matters**: Rotating a point 90° and then translating right '
      + 'produces a different result than translating right and then rotating. Convince yourself: start at '
      + '(3, 0). Rotate 90° CCW → (0, 3), then translate right 5 → (5, 3). '
      + 'But translate right 5 first → (8, 0), then rotate 90° CCW → (0, 8). Completely different destinations. '
      + 'When you multiply matrices, the rightmost is applied first. Keeping that rule in mind prevents the '
      + 'single most common bug in geometry code.',

      '**The G-code pipeline as a chain of transforms**: Every G-code move goes through several coordinate '
      + 'mappings: the programmed value is in the work coordinate system (WCS), the work offset translates to '
      + 'machine coordinates (MCS), a fixture rotation may apply on top, and finally a unit conversion scales '
      + 'from inches or mm to motor steps. Each of these is a Transform2D (or Transform3D). '
      + 'Composing them all into a single matrix means the interpreter does one matrix multiply per point '
      + 'instead of four sequential operations.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'The rotation matrix columns are just "where do the axes go?"',
        body: 'The first column of a rotation matrix is where the +X axis ends up after rotation. The second column is where +Y goes. If you rotate 90° CCW, +X goes to (0,1) and +Y goes to (-1,0). Read those as columns and you get the rotation matrix. This makes the matrix easy to reason about without memorizing formulas.',
      },
      {
        type: 'warning',
        title: 'Order of multiplication is the most common transform bug',
        body: 'In code, "apply A then B" is written `B * A` — the rightmost matrix is applied first. If you write `A * B` instead, you get B first then A. The compiler will not warn you. The numbers will be wrong in a way that is hard to trace. Always double-check composition order by testing with a known point.',
      },
      {
        type: 'insight',
        title: 'rotate_about is just three transforms composed',
        body: 'To rotate around point (cx, cy): first shift the pivot to the origin with translate(−cx, −cy), then rotate, then shift back with translate(cx, cy). You do not need a special formula — you just compose three transforms you already have.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'G-Code Interpreter — Lesson 3: Transformations',
        mathBridge: 'Run cells in order. The Transform2D and Transform3D classes built here are used in the full pipeline in later lessons.',
        caption: 'Build 2D and 3D transformation matrices from scratch, then compose them to handle the G-code coordinate pipeline.',
        props: {
          initialCells: [

            // ─── CELL 1: Why matrices? Raw formula vs matrix multiply ─────────────
            {
              id: 1,
              cellTitle: 'Why matrices? Rotation formula → matrix form',
              prose:
                'Before writing any classes, see where the rotation matrix comes from. '
                + 'The 2D rotation formulas are:\n\n'
                + '    x\' = cos(θ)·x − sin(θ)·y\n'
                + '    y\' = sin(θ)·x + cos(θ)·y\n\n'
                + 'These are just a linear combination of x and y — which is exactly what a matrix multiply does. '
                + 'But **translation** (x\' = x + tx) cannot be expressed this way on a 2-component vector. '
                + 'We will fix that in the next cell with homogeneous coordinates.',
              code: [
                'import math',
                'from typing import List, Tuple',
                '',
                '# ── Raw rotation formula ──────────────────────────────────────────────',
                'def rotate_raw(x: float, y: float, angle_rad: float) -> Tuple[float, float]:',
                '    """Rotate (x,y) CCW by angle_rad using the formulas directly."""',
                '    c = math.cos(angle_rad)',
                '    s = math.sin(angle_rad)',
                '    return c*x - s*y, s*x + c*y',
                '',
                '# ── Matrix form of the same rotation ──────────────────────────────────',
                'def mat2_apply(M: List[List[float]], x: float, y: float) -> Tuple[float, float]:',
                '    """Apply a 2×2 matrix to a 2D column vector."""',
                '    return M[0][0]*x + M[0][1]*y, M[1][0]*x + M[1][1]*y',
                '',
                'def mat2_rotate(angle_rad: float) -> List[List[float]]:',
                '    """Build a 2×2 CCW rotation matrix."""',
                '    c, s = math.cos(angle_rad), math.sin(angle_rad)',
                '    return [[c, -s],',
                '            [s,  c]]',
                '',
                '# ── Compare the two approaches on a 90° rotation ─────────────────────',
                'theta = math.pi / 2   # 90° CCW',
                'x, y = 3.0, 0.0       # starting point: (3, 0)',
                '',
                'raw_result = rotate_raw(x, y, theta)',
                'M = mat2_rotate(theta)',
                'mat_result = mat2_apply(M, x, y)',
                '',
                'print(f"Input point        : ({x}, {y})")',
                'print(f"Rotate 90° CCW (raw formula): ({raw_result[0]:.6f}, {raw_result[1]:.6f})")',
                'print(f"Rotate 90° CCW (matrix mult): ({mat_result[0]:.6f}, {mat_result[1]:.6f})")',
                'print()',
                'print("Both give the same result. The matrix is just a compact notation for the formula.")',
                'print()',
                'print(f"Rotation matrix:")',
                'print(f"  [{M[0][0]:7.4f}  {M[0][1]:7.4f}]")',
                'print(f"  [{M[1][0]:7.4f}  {M[1][1]:7.4f}]")',
                'print()',
                'print("Column 1 = where +X axis goes: (cos 90°, sin 90°) = (0, 1)")',
                'print("Column 2 = where +Y axis goes: (-sin 90°, cos 90°) = (-1, 0)")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 2: Homogeneous coordinates ─────────────────────────────────
            {
              id: 2,
              cellTitle: 'Homogeneous coordinates — adding w=1 to handle translation',
              prose:
                'Translation cannot be written as a 2×2 matrix multiply. '
                + 'The fix: add a third coordinate w and use 3×3 matrices.\n\n'
                + 'A 2D **point** becomes (x, y, **1**). '
                + 'A 2D **direction vector** becomes (x, y, **0**).\n\n'
                + 'The difference is crucial: w=1 means "apply translation," w=0 means "ignore translation." '
                + 'A direction like "move 10 units east" should not be shifted when the work origin moves.',
              code: [
                '# (math and List, Tuple are in scope from cell 1.)',
                '',
                'Matrix3 = List[List[float]]',
                '',
                'def mat3_identity() -> Matrix3:',
                '    return [[1,0,0],[0,1,0],[0,0,1]]',
                '',
                'def mat3_translate(tx: float, ty: float) -> Matrix3:',
                '    """Translation matrix. The tx, ty live in the rightmost column."""',
                '    return [[1, 0, tx],',
                '            [0, 1, ty],',
                '            [0, 0,  1]]',
                '',
                'def mat3_apply(M: Matrix3, x: float, y: float, w: float = 1.0) -> Tuple[float, float]:',
                '    """Apply 3×3 homogeneous matrix to (x, y, w). Returns the 2D result."""',
                '    xp = M[0][0]*x + M[0][1]*y + M[0][2]*w',
                '    yp = M[1][0]*x + M[1][1]*y + M[1][2]*w',
                '    wp = M[2][0]*x + M[2][1]*y + M[2][2]*w',
                '    if wp != 0.0 and abs(wp - 1.0) > 1e-9:',
                '        xp, yp = xp/wp, yp/wp',
                '    return xp, yp',
                '',
                '# ── Demonstrate: same matrix, point vs direction vector ───────────────',
                'T = mat3_translate(5.0, 0.0)   # "move right 5 units"',
                '',
                '# Point at (3, 0) — w=1, so translation applies',
                'point_result = mat3_apply(T, 3.0, 0.0, w=1.0)',
                'print(f"Translate point  (3,0) by (5,0): {point_result}   (expected (8.0, 0.0))")',
                '',
                '# Direction vector (1, 0) — w=0, so translation is ignored',
                'dir_result = mat3_apply(T, 1.0, 0.0, w=0.0)',
                'print(f"Translate vector (1,0) by (5,0): {dir_result}   (expected (1.0, 0.0))")',
                '',
                'print()',
                'print("The direction vector (1, 0) means east. Moving the origin does not")',
                'print("change what direction east is. w=0 enforces this automatically.")',
                'print()',
                'print("Translation matrix:")',
                'print(f"  [ 1  0  {T[0][2]:.1f} ]")',
                'print(f"  [ 0  1  {T[1][2]:.1f} ]")',
                'print(f"  [ 0  0  1   ]")',
                'print()',
                'print("Multiplying (x, y, 1) by this gives (x+5, y+0, 1). Translation lives in column 3.")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 3: mat3 helper functions + Transform2D class ─────────────────
            {
              id: 3,
              cellTitle: 'Building mat3 helpers and the Transform2D class',
              prose:
                'Now we have all three primitive matrices — translate, rotate, scale — '
                + 'plus a matrix multiply function and the Transform2D wrapper class.\n\n'
                + 'Transform2D stores a 3×3 matrix internally. Its `*` operator composes two transforms '
                + 'by multiplying their matrices. `apply(x, y)` transforms a point.',
              code: [
                '# (math, Matrix3, mat3_identity, mat3_translate, mat3_apply already in scope.)',
                '',
                'def mat3_mul(A: Matrix3, B: Matrix3) -> Matrix3:',
                '    """Multiply two 3×3 matrices. result[i][j] = sum over k of A[i][k]*B[k][j]."""',
                '    result = [[0.0]*3 for _ in range(3)]',
                '    for i in range(3):',
                '        for j in range(3):',
                '            for k in range(3):',
                '                result[i][j] += A[i][k] * B[k][j]',
                '    return result',
                '',
                'def mat3_rotate(angle_rad: float) -> Matrix3:',
                '    c, s = math.cos(angle_rad), math.sin(angle_rad)',
                '    return [[c, -s, 0],',
                '            [s,  c, 0],',
                '            [0,  0, 1]]',
                '',
                'def mat3_scale(sx: float, sy: float) -> Matrix3:',
                '    return [[sx,  0, 0],',
                '            [ 0, sy, 0],',
                '            [ 0,  0, 1]]',
                '',
                'def mat3_fmt(M: Matrix3) -> str:',
                '    rows = []',
                '    for row in M:',
                '        rows.append("  [" + "  ".join(f"{v:7.4f}" for v in row) + "]")',
                '    return "\\n".join(rows)',
                '',
                'class Transform2D:',
                '    """Immutable 2D affine transform stored as a 3×3 homogeneous matrix."""',
                '',
                '    def __init__(self, matrix=None):',
                '        self._m = matrix if matrix is not None else mat3_identity()',
                '',
                '    @classmethod',
                '    def identity(cls): return cls(mat3_identity())',
                '',
                '    @classmethod',
                '    def translate(cls, tx, ty): return cls(mat3_translate(tx, ty))',
                '',
                '    @classmethod',
                '    def rotate(cls, angle_rad): return cls(mat3_rotate(angle_rad))',
                '',
                '    @classmethod',
                '    def scale(cls, sx, sy=None):',
                '        sy = sy if sy is not None else sx',
                '        return cls(mat3_scale(sx, sy))',
                '',
                '    def __mul__(self, other: "Transform2D") -> "Transform2D":',
                '        """Compose: (self * other).apply(p) applies other first, then self."""',
                '        return Transform2D(mat3_mul(self._m, other._m))',
                '',
                '    def apply(self, x: float, y: float) -> Tuple[float, float]:',
                '        return mat3_apply(self._m, x, y)',
                '',
                '    def __repr__(self):',
                '        return f"Transform2D(\\n{mat3_fmt(self._m)}\\n)"',
                '',
                '# ── Quick sanity checks ───────────────────────────────────────────────',
                '# Identity: no change',
                'I = Transform2D.identity()',
                'print(f"Identity applied to (3, 4): {I.apply(3, 4)}")',
                '',
                '# Translate (5, 0)',
                'T = Transform2D.translate(5.0, 0.0)',
                'print(f"Translate(5,0) applied to (3, 4): {T.apply(3, 4)}  (expected (8, 4))")',
                '',
                '# Rotate 90° CCW',
                'R = Transform2D.rotate(math.pi / 2)',
                'rx, ry = R.apply(3.0, 0.0)',
                'print(f"Rotate 90° CCW applied to (3, 0): ({rx:.4f}, {ry:.4f})  (expected (0, 3))")',
                '',
                '# Scale by 2 in both axes',
                'S = Transform2D.scale(2.0)',
                'print(f"Scale(2) applied to (3, 4): {S.apply(3, 4)}  (expected (6, 8))")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 4: Order matters — translate-then-rotate vs rotate-then-translate
            {
              id: 4,
              cellTitle: 'Order matters — translate-then-rotate vs rotate-then-translate',
              prose:
                'This is the most common bug in transformation code: composing in the wrong order. '
                + 'Take point (3, 0), translate right by 5, then rotate 90° CCW. '
                + 'Now try rotate first, then translate. You get completely different results.\n\n'
                + 'Remember: in `R * T`, the **rightmost (T) is applied first**.',
              code: [
                '# (Transform2D, math in scope from earlier cells.)',
                '',
                'T = Transform2D.translate(5.0, 0.0)   # move right 5',
                'R = Transform2D.rotate(math.pi / 2)   # rotate 90° CCW',
                '',
                '# ── Order 1: translate first (T), then rotate (R) ───────────────────',
                '# Compose: R * T  (rightmost = applied first)',
                'RT = R * T',
                'p = (3.0, 0.0)',
                '',
                'x1, y1 = RT.apply(*p)',
                'print(f"Translate then Rotate: (3,0) → ({x1:.4f}, {y1:.4f})")',
                'print(f"  Step 1: T moves (3,0) → (8,0)")',
                'print(f"  Step 2: R rotates (8,0) 90° CCW → (0, 8)")',
                'print()',
                '',
                '# ── Order 2: rotate first (R), then translate (T) ───────────────────',
                '# Compose: T * R  (rightmost = applied first)',
                'TR = T * R',
                '',
                'x2, y2 = TR.apply(*p)',
                'print(f"Rotate then Translate: (3,0) → ({x2:.4f}, {y2:.4f})")',
                'print(f"  Step 1: R rotates (3,0) 90° CCW → (0, 3)")',
                'print(f"  Step 2: T moves (0,3) → (5, 3)")',
                'print()',
                '',
                '# ── Confirm they are different ───────────────────────────────────────',
                'same = (abs(x1 - x2) < 1e-9 and abs(y1 - y2) < 1e-9)',
                'print(f"Results are the same? {same}  ← should be False")',
                'print()',
                'print("G-code pipeline rule: raw coords → work offset translate → fixture rotate")',
                'print("Always translate first (move origin to part zero), THEN rotate.")',
                'print("In code: Rotate * Translate  (Translate is the rightmost, applied first).")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 5: Challenge 1 — fill-in: apply a transform to a toolpath ───
            {
              id: 5,
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Apply a work-offset transform to a toolpath point',
              difficulty: 'easy',
              cellTitle: 'Challenge 1 — Apply a work-offset transform to a toolpath point',
              prose:
                'The operator zeroed the part at machine position (100, 50). '
                + 'The G-code program says: move to (10, 20) in work coordinates.\n\n'
                + 'Build a Transform2D that translates by the work offset (100, 50), '
                + 'then apply it to the programmed point (10, 20) to find the machine coordinate.',
              prompt: 'Fill in the two blanks: one for the transform, one for the apply call.',
              starterBlock: [
                '# Work offset: part zero is at machine position (100, 50).',
                '# Programmed move: G0 X10 Y20 (in work coordinates)',
                '',
                'work_offset = ___               # Transform2D that translates by (100, 50)',
                'machine_pos = ___               # apply work_offset to the programmed point (10.0, 20.0)',
                '',
                'print(f"Programmed (work coords): (10.0, 20.0)")',
                'print(f"Machine position        : {machine_pos}")',
              ].join('\n'),
              code: [
                '# Paste the starter block, fill in the ___ values, then run.',
                '# work_offset = ___   # hint: Transform2D.translate(...)',
                '# machine_pos = ___   # hint: work_offset.apply(...)',
              ].join('\n'),
              testCode: [
                'assert "work_offset" in dir(), "work_offset not defined"',
                'assert isinstance(work_offset, Transform2D), "work_offset must be a Transform2D"',
                '',
                'assert "machine_pos" in dir(), "machine_pos not defined"',
                'assert isinstance(machine_pos, tuple) and len(machine_pos) == 2, "machine_pos must be a tuple of two floats"',
                '',
                'mx, my = machine_pos',
                'assert math.isclose(mx, 110.0, abs_tol=1e-9), f"machine X should be 110.0 (100+10), got {mx}"',
                'assert math.isclose(my, 70.0,  abs_tol=1e-9), f"machine Y should be 70.0 (50+20), got {my}"',
                '',
                '"SUCCESS: Work offset correctly maps (10, 20) in work coords to (110, 70) in machine coords."',
              ].join('\n'),
              hint: 'work_offset = Transform2D.translate(100.0, 50.0). machine_pos = work_offset.apply(10.0, 20.0). The result should be (110, 70) because 100+10=110 and 50+20=70.',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 6: rotate_about — rotating around an arbitrary pivot ─────────
            {
              id: 6,
              cellTitle: 'rotate_about — rotating around an arbitrary pivot point',
              prose:
                'All the rotation matrices rotate around the **origin**. '
                + 'But in a G-code program, arcs and fixture rotations often happen around a point other than (0,0).\n\n'
                + 'The trick: translate the pivot to the origin, rotate, translate back. '
                + 'Three transforms composed into one.',
              code: [
                '# (Transform2D, math, mat3_mul, mat3_translate, mat3_rotate in scope.)',
                '',
                '# Add rotate_about to the class by extending the classmethod list.',
                '# (We monkey-patch here for the notebook; in a real module it lives in the class definition.)',
                '',
                '@classmethod',
                'def _rotate_about(cls, angle_rad: float, cx: float, cy: float) -> "Transform2D":',
                '    """Rotate by angle_rad around pivot point (cx, cy)."""',
                '    t1 = mat3_translate(-cx, -cy)   # shift pivot to origin',
                '    r  = mat3_rotate(angle_rad)      # rotate around origin',
                '    t2 = mat3_translate(cx, cy)      # shift pivot back',
                '    return cls(mat3_mul(t2, mat3_mul(r, t1)))',
                '',
                'Transform2D.rotate_about = _rotate_about',
                '',
                '# ── Demo: rotate point (10, 5) by 90° about pivot (5, 5) ─────────────',
                'pivot = (5.0, 5.0)',
                'point = (10.0, 5.0)',
                'angle = math.pi / 2   # 90° CCW',
                '',
                'Ra = Transform2D.rotate_about(angle, *pivot)',
                'result = Ra.apply(*point)',
                '',
                'print(f"Point            : {point}")',
                'print(f"Pivot            : {pivot}")',
                'print(f"Angle            : 90° CCW")',
                'print(f"Result           : ({result[0]:.4f}, {result[1]:.4f})")',
                'print()',
                'print("Manual trace:")',
                'print(f"  Step 1: translate(-5,-5) → (10-5, 5-5) = (5, 0)")',
                'print(f"  Step 2: rotate 90° CCW   → (0, 5)")',
                'print(f"  Step 3: translate(+5,+5) → (0+5, 5+5) = (5, 10)")',
                'print()',
                'print(f"Expected: (5.0, 10.0) — matches result? {math.isclose(result[0], 5.0) and math.isclose(result[1], 10.0)}")',
                '',
                '# ── Verify: pivot itself never moves ─────────────────────────────────',
                'pivot_result = Ra.apply(*pivot)',
                'print()',
                'print(f"Pivot after rotation: ({pivot_result[0]:.6f}, {pivot_result[1]:.6f})")',
                'print(f"Pivot unchanged?      {math.isclose(pivot_result[0], pivot[0]) and math.isclose(pivot_result[1], pivot[1])}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 7: Transform3D with 4×4 matrices ────────────────────────────
            {
              id: 7,
              cellTitle: 'Transform3D — extending to 3D with 4×4 matrices',
              prose:
                'The same ideas scale to 3D. A 3D point becomes (x, y, z, 1) — four components. '
                + 'A 4×4 matrix holds all affine transforms: translation in the last column, '
                + 'rotation in the upper-left 3×3 block. The G-code pipeline uses Transform3D '
                + 'for full 5-axis machining where Z, A, and B axes all transform together.',
              code: [
                '# (math, List, Tuple in scope.)',
                '',
                'Matrix4 = List[List[float]]',
                '',
                'def mat4_identity() -> Matrix4:',
                '    return [[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]]',
                '',
                'def mat4_mul(A: Matrix4, B: Matrix4) -> Matrix4:',
                '    n = 4',
                '    result = [[0.0]*n for _ in range(n)]',
                '    for i in range(n):',
                '        for j in range(n):',
                '            for k in range(n):',
                '                result[i][j] += A[i][k] * B[k][j]',
                '    return result',
                '',
                'def mat4_apply(M: Matrix4, x: float, y: float, z: float) -> Tuple[float, float, float]:',
                '    xp = M[0][0]*x + M[0][1]*y + M[0][2]*z + M[0][3]',
                '    yp = M[1][0]*x + M[1][1]*y + M[1][2]*z + M[1][3]',
                '    zp = M[2][0]*x + M[2][1]*y + M[2][2]*z + M[2][3]',
                '    w  = M[3][0]*x + M[3][1]*y + M[3][2]*z + M[3][3]',
                '    if abs(w - 1.0) > 1e-9:',
                '        xp, yp, zp = xp/w, yp/w, zp/w',
                '    return xp, yp, zp',
                '',
                'def mat4_translate(tx: float, ty: float, tz: float) -> Matrix4:',
                '    m = mat4_identity()',
                '    m[0][3] = tx; m[1][3] = ty; m[2][3] = tz',
                '    return m',
                '',
                'def mat4_rotate_z(angle_rad: float) -> Matrix4:',
                '    """Rotation around the Z axis — same as 2D rotation in the XY plane."""',
                '    c, s = math.cos(angle_rad), math.sin(angle_rad)',
                '    return [[c, -s, 0, 0],',
                '            [s,  c, 0, 0],',
                '            [0,  0, 1, 0],',
                '            [0,  0, 0, 1]]',
                '',
                'class Transform3D:',
                '    """Immutable 3D affine transform stored as a 4×4 homogeneous matrix."""',
                '',
                '    def __init__(self, matrix=None):',
                '        self._m = matrix if matrix is not None else mat4_identity()',
                '',
                '    @classmethod',
                '    def identity(cls): return cls()',
                '',
                '    @classmethod',
                '    def translate(cls, tx, ty, tz=0.0):',
                '        return cls(mat4_translate(tx, ty, tz))',
                '',
                '    @classmethod',
                '    def rotate_z(cls, angle_rad):',
                '        return cls(mat4_rotate_z(angle_rad))',
                '',
                '    def __mul__(self, other: "Transform3D") -> "Transform3D":',
                '        return Transform3D(mat4_mul(self._m, other._m))',
                '',
                '    def apply(self, x: float, y: float, z: float = 0.0) -> Tuple[float, float, float]:',
                '        return mat4_apply(self._m, x, y, z)',
                '',
                '# ── Demo: translate then rotate in 3D ────────────────────────────────',
                'T3 = Transform3D.translate(5.0, 0.0, 10.0)',
                'R3 = Transform3D.rotate_z(math.pi / 2)',
                '',
                '# Translate first, then rotate Z',
                'RT3 = R3 * T3',
                'p3d = (3.0, 0.0, 0.0)',
                'result3 = RT3.apply(*p3d)',
                'print(f"3D translate(5,0,10) then rotate_z(90°): ({p3d}) → ({result3[0]:.4f}, {result3[1]:.4f}, {result3[2]:.4f})")',
                'print()',
                'print("Z coordinate (10.0) is unchanged because rotate_z does not affect Z.")',
                '',
                '# Verify Z is untouched by rotate_z',
                'assert math.isclose(result3[2], 10.0, abs_tol=1e-9), "Z should be 10.0 after rotate_z"',
                'print("Assertion passed: rotate_z leaves Z unchanged.")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 8: Challenge 2 — write: implement Transform2D.inverse() ──────
            {
              id: 8,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Implement Transform2D.inverse() for pure rotation',
              difficulty: 'medium',
              cellTitle: 'Challenge 2 — Implement inverse() for pure rotation',
              prose:
                'For a pure rotation by θ, the inverse is a rotation by −θ. '
                + 'In matrix terms, the inverse of a rotation matrix equals its transpose '
                + '(rotate the same angle the other way).\n\n'
                + 'Write a standalone function `inverse_rotation(t: Transform2D) -> Transform2D` '
                + 'that assumes the transform is a pure rotation and returns its inverse '
                + 'by constructing a new rotation of −θ.\n\n'
                + 'Hint: extract the angle from the matrix using `math.atan2`. '
                + 'The rotation matrix top row is [cos θ, −sin θ, 0], so the angle is `math.atan2(M[1][0], M[0][0])`.',
              prompt: 'Write inverse_rotation(t). Use math.atan2 to recover θ from the matrix, then return Transform2D.rotate(-θ).',
              code: [
                '# Write inverse_rotation(t: Transform2D) -> Transform2D.',
                '# The transform is a pure rotation. Recover θ from the matrix, return rotate(-θ).',
                '',
                '# Hint: the matrix top-left 2x2 is [[cos θ, -sin θ], [sin θ, cos θ]]',
                '# So θ = math.atan2(M[1][0], M[0][0])  where M is t._m',
                '',
                '# def inverse_rotation(t: Transform2D) -> Transform2D:',
                '#     ...',
              ].join('\n'),
              testCode: [
                'assert "inverse_rotation" in dir(), "inverse_rotation function not defined"',
                '',
                '# Test: inverse of rotate(30°) should be rotate(-30°)',
                'angle = math.radians(30)',
                'R = Transform2D.rotate(angle)',
                'R_inv = inverse_rotation(R)',
                'assert isinstance(R_inv, Transform2D), "inverse_rotation must return a Transform2D"',
                '',
                '# Composing R and its inverse should give the identity',
                'composed = R_inv * R',
                'x_test, y_test = composed.apply(7.0, 3.0)',
                'assert math.isclose(x_test, 7.0, abs_tol=1e-9), f"R_inv * R applied to (7,3) gave x={x_test}, expected 7.0"',
                'assert math.isclose(y_test, 3.0, abs_tol=1e-9), f"R_inv * R applied to (7,3) gave y={y_test}, expected 3.0"',
                '',
                '# Test with 90°',
                'R90 = Transform2D.rotate(math.pi / 2)',
                'R90_inv = inverse_rotation(R90)',
                'x2, y2 = (R90_inv * R90).apply(1.0, 0.0)',
                'assert math.isclose(x2, 1.0, abs_tol=1e-9), f"90° case: expected x=1.0, got {x2}"',
                'assert math.isclose(y2, 0.0, abs_tol=1e-9), f"90° case: expected y=0.0, got {y2}"',
                '',
                '# The inverse of a rotation by θ should itself be a rotation by -θ',
                'angle2 = math.radians(45)',
                'R45_inv = inverse_rotation(Transform2D.rotate(angle2))',
                'x3, y3 = R45_inv.apply(0.0, 1.0)',
                'expected_x3 = math.cos(-math.pi/2 + math.pi/2) * 0 - math.sin(-math.pi/2 + math.pi/2) * 1',
                '# simpler: rotate(-45°) applied to (0,1)',
                'ex, ey = Transform2D.rotate(-angle2).apply(0.0, 1.0)',
                'assert math.isclose(x3, ex, abs_tol=1e-9) and math.isclose(y3, ey, abs_tol=1e-9), f"inverse of rotate(45°) should match rotate(-45°): expected ({ex:.6f},{ey:.6f}), got ({x3:.6f},{y3:.6f})"',
                '',
                '"SUCCESS: inverse_rotation correctly inverts pure rotation transforms."',
              ].join('\n'),
              hint: 'Recover the angle with: theta = math.atan2(t._m[1][0], t._m[0][0]). Then return Transform2D.rotate(-theta). The composed R_inv * R should give identity, so applying it to any point returns the original point.',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 9: Full pipeline — work offset + fixture rotation ───────────
            {
              id: 9,
              cellTitle: 'Full pipeline — work offset + fixture rotation composed',
              prose:
                'A real G-code setup: the part is clamped in a fixture that is rotated 30° on the table, '
                + 'and the work origin is at machine position (80, 40). '
                + 'The correct composition is: **work offset translate first, then fixture rotate**.\n\n'
                + 'We compose the full pipeline into a single Transform2D and apply it to several toolpath points.',
              code: [
                '# (Transform2D, math in scope.)',
                '',
                '# ── Setup ─────────────────────────────────────────────────────────────',
                'WORK_ORIGIN_X = 80.0    # part zero in machine X',
                'WORK_ORIGIN_Y = 40.0    # part zero in machine Y',
                'FIXTURE_ANGLE = math.radians(30)   # fixture is rotated 30° on the table',
                '',
                '# ── Build the pipeline ────────────────────────────────────────────────',
                '# Step 1: translate work origin to machine coordinates',
                'work_offset = Transform2D.translate(WORK_ORIGIN_X, WORK_ORIGIN_Y)',
                '',
                '# Step 2: rotate by the fixture angle around the work origin',
                '#   (rotate_about the work origin after it has been translated)',
                '#   Equivalent to: T * R where T=work_offset, R=rotate, composed as R_around_origin * T',
                'fixture_rot = Transform2D.rotate(FIXTURE_ANGLE)',
                '',
                '# Compose: fixture_rot applied AFTER work_offset',
                '# In matrix form: fixture_rot * work_offset  (work_offset is rightmost = applied first)',
                'pipeline = fixture_rot * work_offset',
                '',
                '# ── Apply to toolpath points ──────────────────────────────────────────',
                'toolpath_work = [(0.0, 0.0), (10.0, 0.0), (10.0, 10.0), (0.0, 10.0)]',
                '',
                'print("Programmed (work coords) → Machine coords (after offset + fixture rotation)")',
                'print(f"  Work origin    : ({WORK_ORIGIN_X}, {WORK_ORIGIN_Y}) mm in machine frame")',
                'print(f"  Fixture angle  : 30°")',
                'print()',
                'print(f"  {"Work":>18s}  →  Machine")',
                'print(f"  {chr(45)*42}")',
                'for wp in toolpath_work:',
                '    mp = pipeline.apply(*wp)',
                '    print(f"  ({wp[0]:5.1f}, {wp[1]:5.1f})        →  ({mp[0]:8.4f}, {mp[1]:8.4f})")',
                '',
                'print()',
                'print("Verify: work origin (0,0) maps to machine origin (80, 40):")',
                'x0, y0 = pipeline.apply(0.0, 0.0)',
                'print(f"  (0, 0) → ({x0:.4f}, {y0:.4f})  expected (80.0, 40.0)")',
                'print()',
                'print("One matrix multiply per point — all transforms composed.")',
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
      'The **2D rotation matrix** for a counter-clockwise rotation by angle $\\theta$:',

      '$$R(\\theta) = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta \\\\ \\sin\\theta & \\cos\\theta \\end{pmatrix}$$',

      'Each column is a unit vector: the first column is where the $+X$ axis goes, the second column is where $+Y$ goes. For $\\theta = 90°$: $+X \\to (0,1)$, $+Y \\to (-1,0)$.',

      'In **homogeneous 2D** form (3×3 matrix), adding a dummy coordinate $w$:',

      '$$\\text{Point: } \\begin{pmatrix}x\\\\y\\\\1\\end{pmatrix}, \\qquad \\text{Vector: } \\begin{pmatrix}x\\\\y\\\\0\\end{pmatrix}$$',

      'The **homogeneous translation matrix**:',

      '$$T(t_x, t_y) = \\begin{pmatrix} 1 & 0 & t_x \\\\ 0 & 1 & t_y \\\\ 0 & 0 & 1 \\end{pmatrix}$$',

      'Multiplying a point $(x,y,1)^T$ by $T$ gives $(x+t_x,\\; y+t_y,\\; 1)^T$. Multiplying a vector $(x,y,0)^T$ leaves it unchanged.',

      'The **homogeneous rotation matrix** (3×3):',

      '$$R_h(\\theta) = \\begin{pmatrix} \\cos\\theta & -\\sin\\theta & 0 \\\\ \\sin\\theta & \\cos\\theta & 0 \\\\ 0 & 0 & 1 \\end{pmatrix}$$',

      '**Transform composition**: applying $A$ then $B$ is matrix product $M = B \\cdot A$ (rightmost applied first):',

      '$$M \\cdot \\mathbf{p} = B \\cdot (A \\cdot \\mathbf{p})$$',

      '**Rotation about pivot $(c_x, c_y)$** composes three transforms:',

      '$$R_{\\text{pivot}} = T(c_x, c_y) \\cdot R(\\theta) \\cdot T(-c_x, -c_y)$$',

      'In **homogeneous 3D** form (4×4 matrix), a point becomes $(x, y, z, 1)^T$. The 4×4 translation matrix has $t_x, t_y, t_z$ in the last column of the first three rows.',
    ],
  },

  rigor: {
    prose: [
      '**Why row-major vs column-major matters**: We store matrices as lists of rows: `M[i][j]` is row $i$, column $j$. '
      + 'We treat points as column vectors and multiply $M \\cdot \\mathbf{p}$. This is the standard mathematical convention '
      + 'and matches OpenGL, most textbooks, and numpy\'s default. '
      + 'Some older graphics APIs (Direct3D historically) used row vectors and $\\mathbf{p} \\cdot M$, '
      + 'which reverses the composition order. Our code is consistent: column vectors throughout.',

      '**Why homogeneous division (perspective divide) is in mat3_apply**: In a pure affine transform, '
      + 'the last row is always $[0, 0, 1]$, so $w$ always comes out as 1 and the divide never fires. '
      + 'But if someone passes in a projective matrix (last row not $[0,0,1]$), the result has $w \\neq 1$ '
      + 'and dividing by $w$ recovers the correct Euclidean point. '
      + 'We include the check as a defensive measure — it adds negligible cost and prevents silent corruption.',

      '**Why `mat3_rotate` and not Vec2.rotate**: Vec2.rotate from lesson 2 rotates a single vector. '
      + 'Transform2D.rotate stores the rotation in a matrix so it can be composed with translation and scale '
      + 'into a single object. This is the key architectural step: from "apply once" functions to "composable reusable transforms."',

      '**Why the order rule is B*A for "A then B"**: Think of a function pipeline. '
      + '`result = B(A(p))`. In mathematics, the innermost function is written rightmost. '
      + 'Matrix multiplication follows the same convention: $(B \\cdot A) \\cdot \\mathbf{p} = B \\cdot (A \\cdot \\mathbf{p})$. '
      + 'If you always test your composition with a known input before using it on real toolpaths, '
      + 'you will catch order bugs immediately.',

      '**Inverting a rotation**: The inverse of $R(\\theta)$ is $R(-\\theta)$, and also equals $R(\\theta)^T$ (the transpose). '
      + 'This is because rotation matrices are **orthogonal**: $R^T R = I$. '
      + 'For a general affine transform, inverting requires computing the full matrix inverse, '
      + 'which is more expensive. In the G-code pipeline, most transforms are pure rotation or translation, '
      + 'so the simple formula suffices.',
    ],
  },

  examples: [
    {
      id: 'ex-fixture-rotation',
      title: 'Mapping a programmed point through a rotated fixture',
      problem:
        'A fixture is rotated 45° on the CNC table. The part zero (work origin) is at machine position (60, 30). '
        + 'A G-code command programs a move to work coordinate (10, 0). '
        + 'Find the machine coordinate using transform composition.',
      steps: [
        {
          expression: 'Build work offset: T = Transform2D.translate(60, 30)',
          annotation: 'This shifts the work origin (0,0) to machine position (60, 30). Applied first.',
        },
        {
          expression: 'Build fixture rotation: R = Transform2D.rotate(π/4)',
          annotation: 'The fixture is tilted 45° CCW. This rotates all programmed points around the origin by 45°.',
        },
        {
          expression: 'Compose pipeline: M = R * T',
          annotation: 'Rightmost (T) is applied first: translate the work origin to machine frame, then rotate by the fixture angle.',
        },
        {
          expression: 'Apply to (10, 0): M.apply(10, 0)',
          annotation: 'Step 1 (T): (10+60, 0+30) = (70, 30). Step 2 (R): rotate (70, 30) by 45° CCW.',
        },
        {
          expression: 'Rotation result: x\' = cos(45°)·70 − sin(45°)·30, y\' = sin(45°)·70 + cos(45°)·30',
          annotation: 'cos(45°) = sin(45°) ≈ 0.7071. x\' ≈ 49.497 − 21.213 ≈ 28.28. y\' ≈ 49.497 + 21.213 ≈ 70.71.',
        },
      ],
      conclusion:
        'The programmed point (10, 0) in work coordinates maps to approximately (28.28, 70.71) in machine coordinates. '
        + 'Without the fixture rotation, it would map to (70, 30). '
        + 'This is why the work offset and fixture rotation must be composed in the correct order.',
    },
    {
      id: 'ex-translate-top-right',
      title: 'Verifying Exercise 3.1 — the top-right element of mat3_translate(10,0) × mat3_rotate(π/2)',
      problem:
        'Exercise 3.1 asks: what is the top-right element (M[0][2]) of the composed matrix translate(10,0) * rotate(π/2)?',
      steps: [
        {
          expression: 'R = mat3_rotate(π/2): [[0,-1,0],[1,0,0],[0,0,1]]',
          annotation: 'cos(90°)=0, sin(90°)=1. First row: [0, -1, 0]. Second row: [1, 0, 0].',
        },
        {
          expression: 'T = mat3_translate(10,0): [[1,0,10],[0,1,0],[0,0,1]]',
          annotation: 'Translation in the last column, rows 0 and 1. Third row always [0,0,1].',
        },
        {
          expression: 'M = T * R (compose: rotate first, then translate)',
          annotation: 'mat3_mul(T, R). M[0][2] = T[0][0]*R[0][2] + T[0][1]*R[1][2] + T[0][2]*R[2][2] = 1*0 + 0*0 + 10*1 = 10.',
        },
        {
          expression: 'Result: M[0][2] = 10',
          annotation: 'The translation offset 10 appears in the top-right element because T adds tx after the rotation is applied.',
        },
      ],
      conclusion:
        'M[0][2] = 10. The top-right element of the composed matrix holds the X-translation component. '
        + 'This confirms the translation survives composition and is applied after the rotation.',
    },
  ],

  quiz: [
    {
      id: 'gcp-03-q1',
      type: 'choice',
      text: 'Why does a 2D point become (x, y, 1) in homogeneous coordinates?',
      options: [
        'To make the vector three-dimensional so it can be cross-multiplied',
        'So that translation can be expressed as a matrix multiply — the 1 activates the translation column',
        'To normalize the coordinates so magnitude equals 1',
        'Python lists require a third element for indexing',
      ],
      correct: 1,
    },
    {
      id: 'gcp-03-q2',
      type: 'choice',
      text: 'A direction vector (x, y, 0) is multiplied by a translation matrix T(5, 3). What is the result?',
      options: [
        '(x+5, y+3, 0) — translation is always applied',
        '(x, y, 0) — translation is ignored for w=0 vectors',
        '(x+5, y+3, 1) — the w becomes 1',
        'An error — translation matrices do not accept w=0',
      ],
      correct: 1,
    },
    {
      id: 'gcp-03-q3',
      type: 'choice',
      text: 'You want to apply transform A first, then transform B. In Python: `M = ???`',
      options: [
        'M = A * B',
        'M = B * A',
        'M = A + B',
        'M = B + A',
      ],
      correct: 1,
    },
    {
      id: 'gcp-03-q4',
      type: 'choice',
      text: 'What does Transform2D.rotate_about(θ, cx, cy) do internally?',
      options: [
        'Calls mat3_rotate and then mat3_translate in sequence without composing',
        'Composes translate(-cx,-cy), rotate(θ), translate(cx,cy) into a single matrix',
        'Uses a special formula only valid for rotation angles under 360°',
        'Delegates to Transform3D for arbitrary pivot points',
      ],
      correct: 1,
    },
    {
      id: 'gcp-03-q5',
      type: 'choice',
      text: 'The rotation matrix R(90°) has top row [0, -1, 0] (homogeneous 3×3). What does the first column tell you?',
      options: [
        'The x-intercept of the rotation axis',
        'Where the +X axis goes after rotation: column 1 = (cos 90°, sin 90°, 0) = (0, 1, 0)',
        'The translation offset applied to x',
        'The determinant of the matrix',
      ],
      correct: 1,
    },
    {
      id: 'gcp-03-q6',
      type: 'choice',
      text: 'Point (3, 0) is translated right 5 (to (8, 0)), then rotated 90° CCW. What is the result?',
      options: [
        '(0, 8)',
        '(5, 3)',
        '(3, 5)',
        '(8, 3)',
      ],
      correct: 0,
    },
    {
      id: 'gcp-03-q7',
      type: 'choice',
      text: 'What is the inverse of a pure rotation by θ?',
      options: [
        'A rotation by 180° − θ',
        'A rotation by −θ (rotating the same angle in the opposite direction)',
        'A translation by (−cos θ, −sin θ)',
        'The identity transform',
      ],
      correct: 1,
    },
    {
      id: 'gcp-03-q8',
      type: 'choice',
      text: 'In the G-code pipeline, should the work offset translation or the fixture rotation be applied first (innermost)?',
      options: [
        'Fixture rotation first, then work offset translation',
        'Work offset translation first, then fixture rotation',
        'The order does not matter because they commute',
        'They should be applied as separate passes, never composed',
      ],
      correct: 0,
    },
  ],

  mentalModel: [
    'Rotation and scale are matrix multiplies on (x,y). Translation is not — it requires adding tx, ty.',
    'Homogeneous trick: add w=1 for points, w=0 for vectors. Translation column affects points only.',
    'mat3_mul(A, B) = compose. B is applied first, A is applied second. Rightmost = innermost.',
    '(R * T).apply(p) means: apply T to p first, then R. Read right to left.',
    'Columns of a rotation matrix = where the axes go. Column 1 = destination of +X axis.',
    'rotate_about(θ, cx, cy) = translate(-pivot) * rotate(θ) * translate(+pivot). Three composed.',
    'Transform3D is the same idea with 4×4 matrices. Points are (x, y, z, 1). w=0 for direction vectors.',
    'Always test composition with a known point. The compiler cannot catch order bugs.',
  ],

  checkpoints: ['read-intuition'],
}
