export default {
  id: 'gcp-04-bounding-boxes',
  slug: 'bounding-boxes',
  order: 4,
  title: 'Distance, Bounding Boxes, and Polyline Length',
  subtitle: 'Three geometry utilities every G-code toolpath analysis tool depends on — built from scratch in Python',
  tags: [
    'distance', 'Euclidean distance', 'bounding box', 'AABB', 'axis-aligned bounding box',
    'polyline', 'toolpath length', 'math.hypot', 'infinity', 'dataclass',
    'Python', 'G-code parser', 'CNC', 'toolpath analysis',
  ],

  semantics: {
    core: [
      {
        symbol: 'Euclidean Distance',
        meaning:
          'The straight-line distance between two points, computed from Pythagoras\'s theorem. ' +
          'In 2D: sqrt((x2-x1)² + (y2-y1)²). In 3D: sqrt((x2-x1)² + (y2-y1)² + (z2-z1)²). ' +
          'Python\'s math.hypot(dx, dy) computes the 2D version with better numerical stability than sqrt.',
      },
      {
        symbol: 'Axis-Aligned Bounding Box (AABB)',
        meaning:
          'The tightest box whose faces are parallel to the XY Z coordinate planes that completely contains a set of points. ' +
          'Defined by six scalars: min_x, min_y, min_z, max_x, max_y, max_z. ' +
          'Used in G-code interpreters to compute the part\'s extent, center, and whether the toolpath fits on the machine table.',
      },
      {
        symbol: '+inf / -inf initialization',
        meaning:
          'The correct starting state for a growing bounding box. min values start at +inf (positive infinity) — ' +
          'any real coordinate is smaller, so the first point always sets the minimum. ' +
          'max values start at -inf — any real coordinate is larger, so the first point always sets the maximum. ' +
          'Starting at 0 is wrong: it makes 0 a "phantom point" that contaminates every result.',
      },
      {
        symbol: 'expand(x, y, z)',
        meaning:
          'The method that grows a bounding box to include a new point. ' +
          'Compares each coordinate against the current min/max and updates if the new value is outside the current range. ' +
          'Call it once per point in the toolpath.',
      },
      {
        symbol: 'Polyline',
        meaning:
          'A sequence of points connected by straight-line segments. ' +
          'A G-code toolpath approximated as linear moves is a polyline. ' +
          'Its total length is the sum of the Euclidean distances between consecutive points: ' +
          'sum of dist(points[i], points[i+1]) for i in 0..len-2.',
      },
      {
        symbol: 'math.hypot',
        meaning:
          'Python\'s built-in function for computing sqrt(x² + y²). Numerically more stable than writing math.sqrt(x**2 + y**2) ' +
          'directly because it avoids intermediate overflow/underflow on very large or very small coordinates. ' +
          'Always prefer math.hypot for 2D distances.',
      },
      {
        symbol: 'BoundingBox3D.center',
        meaning:
          'The geometric center of the bounding box: the midpoint between min and max in each axis. ' +
          'center_x = (min_x + max_x) / 2, and similarly for Y and Z. ' +
          'Useful for centering a toolpath visualization on screen or for computing a part\'s centroid.',
      },
      {
        symbol: 'BoundingBox3D.merge',
        meaning:
          'An operation that combines two bounding boxes into one that contains both. ' +
          'The merged min is the component-wise minimum of both min values. ' +
          'The merged max is the component-wise maximum of both max values. ' +
          'Used when combining multiple G-code programs or fixture setups.',
      },
    ],
    rulesOfThumb: [
      'Always initialize bounding box min to +inf and max to -inf. Initializing to 0 is wrong for any toolpath with all-negative or all-positive coordinates.',
      'Polyline length iterates over len(points)-1 segments, not len(points). An off-by-one here silently skips the last segment.',
      'Default Z to 0.0, not None. Even "2D" toolpaths have a Z value — typically the cutting depth or safe height.',
      'Use math.hypot(dx, dy) for 2D distance — it is more numerically stable than math.sqrt(dx**2 + dy**2).',
      'Always check is_empty() before reading bounding box values. Reading min_x on an empty box gives +inf, which is a silent wrong result.',
    ],
  },

  hook: {
    question: 'A G-code program has thousands of moves. How do you know if the part fits on the machine table — and how far does the tool actually travel?',
    realWorldContext:
      'Before a machinist runs a CNC program, they need to verify two things: does the part fit inside the machine\'s travel limits, ' +
      'and approximately how long will the job take?\n\n' +
      'The first question is answered by computing the **axis-aligned bounding box** of the entire toolpath — ' +
      'the tightest rectangular volume that contains every point the tool visits. ' +
      'Compare it against the machine\'s X/Y/Z travel limits, and you immediately know if the program will crash into a hard stop.\n\n' +
      'The second question is answered by computing the **polyline length** of the toolpath — ' +
      'the sum of all segment lengths from rapid-to-rapid. Divide by the feed rate, and you get an estimated cycle time.\n\n' +
      'Both computations start from the same primitive: **Euclidean distance between two 3D points**. ' +
      'This lesson builds all three utilities — distance, bounding box, and polyline length — from scratch.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Distance from Pythagoras**: The distance between two points is just the hypotenuse of a right triangle. ' +
      'In 2D, draw a horizontal line of length |x2-x1| and a vertical line of length |y2-y1| — ' +
      'the distance is sqrt((x2-x1)² + (y2-y1)²). In 3D, add a third perpendicular leg for Z. ' +
      'Python\'s math.hypot(dx, dy) does this in one call, with better floating-point behaviour than the manual sqrt version.',

      '**Why +inf/-inf for the bounding box?** Imagine you are asked to record the tallest person who walks through a door, ' +
      'and you start your "current tallest" counter at 0. If everyone is 1.8 m tall, the answer is correct. ' +
      'But if you start at 0 for the minimum and the first person is 1.8 m, you\'d record a minimum of 0 — wrong. ' +
      'Starting at +inf means the very first real value always beats it, so the first point correctly sets both min and max. ' +
      'This is not a trick — it is the mathematically correct identity element for the min/max operation.',

      '**Polyline length is just repeated distance**: A toolpath is a list of points. ' +
      'The total travel distance is nothing more than the sum of the distances between consecutive pairs. ' +
      'Point [0] to point [1], then [1] to [2], and so on up to point [n-2] to point [n-1]. ' +
      'There are always n-1 segments for n points. If you iterate to n instead of n-1, you read off the end of the list and crash.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Never initialize min to 0 in a bounding box',
        body: 'If your toolpath has coordinates like (-50, -30, -15), a min initialized to 0 will report 0 instead of -50. The bounding box appears larger than the actual part, and the center calculation is completely wrong. Always use math.inf for min and -math.inf for max.',
      },
      {
        type: 'insight',
        title: 'is_empty() tells you whether the box has received any points',
        body: 'A freshly created BoundingBox3D with min_x == math.inf has no real data in it yet. Reading size_x on an empty box returns -inf - inf = -inf, which will quietly corrupt downstream calculations. Always guard with is_empty() before reading box properties.',
      },
      {
        type: 'sequencing',
        title: 'Build distance first, then bbox uses it, then polyline uses both',
        body: 'dist2d and dist3d are two lines each. BoundingBox3D is self-contained and does not call them. polyline_length_2d and polyline_length_3d call dist2d/dist3d. Write and test them in this order — each layer depends only on what came before.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'G-Code Interpreter — Lesson 4: Distance, Bounding Boxes, and Polyline Length',
        mathBridge: 'Run cells in order. Each cell builds on the definitions from previous cells — the kernel is shared.',
        caption: 'Build dist2d, dist3d, BoundingBox3D, and polyline_length functions used throughout the G-code interpreter.',
        props: {
          initialCells: [

            // ─── CELL 1: Why bounding boxes matter for CNC ────────────────────────
            {
              id: 1,
              cellTitle: 'Why bounding boxes matter — the machine travel problem',
              prose:
                'Before a CNC program runs, the interpreter needs to answer: does the toolpath fit inside the machine\'s ' +
                'physical travel limits? A bounding box gives you the answer in one comparison. ' +
                'Run this cell to see what information a bounding box provides.',
              code: [
                '# A typical CNC vertical machining centre has finite travel limits.',
                '# Before running any program, a smart interpreter checks that the toolpath fits.',
                '',
                '# Machine travel limits (example: a mid-size VMC)',
                'MACHINE_X_TRAVEL = 762.0   # mm  (30 inches)',
                'MACHINE_Y_TRAVEL = 508.0   # mm  (20 inches)',
                'MACHINE_Z_TRAVEL = 508.0   # mm  (20 inches)',
                '',
                '# A toolpath analysis function will report these values from the G-code:',
                'toolpath_info = {',
                '    "min_x": -5.0,   "max_x": 145.0,',
                '    "min_y": -5.0,   "max_y":  95.0,',
                '    "min_z": -25.0,  "max_z":   5.0,',
                '}',
                '',
                'size_x = toolpath_info["max_x"] - toolpath_info["min_x"]',
                'size_y = toolpath_info["max_y"] - toolpath_info["min_y"]',
                'size_z = toolpath_info["max_z"] - toolpath_info["min_z"]',
                '',
                'print("Toolpath bounding box:")',
                `print(f"  X extent: {toolpath_info['min_x']} to {toolpath_info['max_x']}  ({size_x:.1f} mm)")`,
                `print(f"  Y extent: {toolpath_info['min_y']} to {toolpath_info['max_y']}  ({size_y:.1f} mm)")`,
                `print(f"  Z extent: {toolpath_info['min_z']} to {toolpath_info['max_z']}  ({size_z:.1f} mm)")`,
                'print()',
                'fits_x = size_x <= MACHINE_X_TRAVEL',
                'fits_y = size_y <= MACHINE_Y_TRAVEL',
                'fits_z = size_z <= MACHINE_Z_TRAVEL',
                `print(f"Fits in X: {fits_x}  ({size_x:.0f} mm vs {MACHINE_X_TRAVEL:.0f} mm limit)")`,
                `print(f"Fits in Y: {fits_y}  ({size_y:.0f} mm vs {MACHINE_Y_TRAVEL:.0f} mm limit)")`,
                `print(f"Fits in Z: {fits_z}  ({size_z:.0f} mm vs {MACHINE_Z_TRAVEL:.0f} mm limit)")`,
                'print()',
                'if fits_x and fits_y and fits_z:',
                '    print("SAFE TO RUN: toolpath fits within machine travel.")',
                'else:',
                '    print("WARNING: toolpath exceeds machine travel — DO NOT RUN.")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 2: dist2d and dist3d ────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'dist2d and dist3d — Euclidean distance from Pythagoras',
              prose:
                'Every bounding box and polyline calculation starts here: the straight-line distance between two points. ' +
                'For 2D we use math.hypot(dx, dy) — Python\'s numerically stable sqrt(dx² + dy²). ' +
                'For 3D we use math.sqrt because hypot only accepts two arguments in Python 3.8 and earlier (3.11+ supports three).',
              code: [
                'import math',
                '',
                'def dist2d(x1, y1, x2, y2) -> float:',
                '    """Euclidean distance between (x1, y1) and (x2, y2).',
                '    math.hypot is preferred over sqrt(dx**2 + dy**2) for numerical stability.',
                '    """',
                '    return math.hypot(x2 - x1, y2 - y1)',
                '',
                'def dist3d(x1, y1, z1, x2, y2, z2) -> float:',
                '    """Euclidean distance between two 3D points."""',
                '    return math.sqrt((x2-x1)**2 + (y2-y1)**2 + (z2-z1)**2)',
                '',
                '# ── Sanity checks ────────────────────────────────────────────────',
                '# 3-4-5 right triangle',
                'd1 = dist2d(0, 0, 3, 4)',
                `print(f"dist2d(0,0  3,4)  = {d1:.6f}   expected 5.0")`,
                '',
                '# Unit diagonal in 3D',
                'd2 = dist3d(0, 0, 0, 1, 1, 1)',
                `print(f"dist3d(0,0,0  1,1,1) = {d2:.6f}   expected {math.sqrt(3):.6f}")`,
                '',
                '# Distance from a rapid-to-start position to a cutting position',
                '# G-code: tool at (0, 0, 5) rapids to (25, 15, 5)',
                'rapid_dist = dist2d(0, 0, 25, 15)',
                `print(f"Rapid XY distance: {rapid_dist:.4f} mm")`,
                '',
                '# A plunge from Z=5 to Z=-10 at X=25, Y=15 (3D because Z changes)',
                'plunge_dist = dist3d(25, 15, 5, 25, 15, -10)',
                `print(f"Plunge distance (dZ=15): {plunge_dist:.4f} mm   (should be 15.0 — pure Z move)")`,
                '',
                'assert math.isclose(d1, 5.0), "3-4-5 triangle check failed"',
                'assert math.isclose(d2, math.sqrt(3)), "unit diagonal check failed"',
                'print()',
                'print("All checks passed.")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 3: BoundingBox3D — construction and expand ──────────────────
            {
              id: 3,
              cellTitle: 'BoundingBox3D — the +inf/-inf trick and expand()',
              prose:
                'A bounding box starts empty — it has seen no points yet. We represent "empty" with ' +
                'min values set to +infinity and max values set to -infinity. ' +
                'The first call to expand() with any real coordinate always beats both sentinels, ' +
                'so the box immediately snaps to the correct tight bounds around that first point. ' +
                'Every subsequent expand() only updates a limit if the new point pushes further out.',
              code: [
                'import math',
                'from dataclasses import dataclass, field',
                '',
                '@dataclass',
                'class BoundingBox3D:',
                '    """Grows as you add points. Start empty (min=+inf, max=-inf).',
                '    Call .expand(x, y, z) for each point in the toolpath.',
                '    """',
                '    min_x: float = math.inf',
                '    min_y: float = math.inf',
                '    min_z: float = math.inf',
                '    max_x: float = -math.inf',
                '    max_y: float = -math.inf',
                '    max_z: float = -math.inf',
                '',
                '    def is_empty(self) -> bool:',
                '        """True if no points have been added yet."""',
                '        return self.min_x == math.inf',
                '',
                '    def expand(self, x, y, z=0.0) -> None:',
                '        """Grow the box to include the point (x, y, z)."""',
                '        if x < self.min_x: self.min_x = x',
                '        if y < self.min_y: self.min_y = y',
                '        if z < self.min_z: self.min_z = z',
                '        if x > self.max_x: self.max_x = x',
                '        if y > self.max_y: self.max_y = y',
                '        if z > self.max_z: self.max_z = z',
                '',
                '# ── Demo: watch the box grow ─────────────────────────────────────',
                'bb = BoundingBox3D()',
                `print(f"Empty box — is_empty: {bb.is_empty()}")`,
                `print(f"  min_x={bb.min_x}  max_x={bb.max_x}")`,
                'print()',
                '',
                'points = [(0, 0, 0), (5, 3, -1), (2, 8, 4)]',
                'for i, (x, y, z) in enumerate(points):',
                '    bb.expand(x, y, z)',
                `    print(f"After point {i+1} ({x}, {y}, {z}):")`,
                `    print(f"  X:[{bb.min_x:.1f}, {bb.max_x:.1f}]  Y:[{bb.min_y:.1f}, {bb.max_y:.1f}]  Z:[{bb.min_z:.1f}, {bb.max_z:.1f}]")`,
                '',
                'print()',
                `print(f"Final: is_empty={bb.is_empty()}")`,
                '',
                '# Why NOT starting at 0:',
                'bb_wrong = BoundingBox3D()',
                'bb_wrong.min_x = 0.0   # ← deliberately wrong',
                'bb_wrong.expand(-30, 0, 0)',
                `print(f"Wrong init: min_x={bb_wrong.min_x}   (should be -30, not 0!)")`,
                'bb_correct = BoundingBox3D()',
                'bb_correct.expand(-30, 0, 0)',
                `print(f"Correct init: min_x={bb_correct.min_x}   (correctly -30)")`,
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 4: BoundingBox3D properties and to_dict ─────────────────────
            {
              id: 4,
              cellTitle: 'BoundingBox3D — size, center, and to_dict()',
              prose:
                'Once the box is built, three derived properties are useful: the size in each axis (max - min), ' +
                'the center point (midpoint of min and max), and a dictionary representation for logging or display. ' +
                'We add these to the class now.',
              code: [
                '# Extend BoundingBox3D with properties and to_dict.',
                '# (Redefining the class replaces the previous definition in the kernel.)',
                '',
                '@dataclass',
                'class BoundingBox3D:',
                '    min_x: float = math.inf',
                '    min_y: float = math.inf',
                '    min_z: float = math.inf',
                '    max_x: float = -math.inf',
                '    max_y: float = -math.inf',
                '    max_z: float = -math.inf',
                '',
                '    def is_empty(self) -> bool:',
                '        return self.min_x == math.inf',
                '',
                '    def expand(self, x, y, z=0.0) -> None:',
                '        if x < self.min_x: self.min_x = x',
                '        if y < self.min_y: self.min_y = y',
                '        if z < self.min_z: self.min_z = z',
                '        if x > self.max_x: self.max_x = x',
                '        if y > self.max_y: self.max_y = y',
                '        if z > self.max_z: self.max_z = z',
                '',
                '    def expand_point(self, pt) -> None:',
                '        """Accepts any object with x, y, z attributes (e.g. Vec3, Point3D)."""',
                '        self.expand(pt.x, pt.y, getattr(pt, "z", 0.0))',
                '',
                '    @property',
                '    def size_x(self): return self.max_x - self.min_x',
                '',
                '    @property',
                '    def size_y(self): return self.max_y - self.min_y',
                '',
                '    @property',
                '    def size_z(self): return self.max_z - self.min_z',
                '',
                '    @property',
                '    def center(self):',
                '        return (',
                '            (self.min_x + self.max_x) / 2,',
                '            (self.min_y + self.max_y) / 2,',
                '            (self.min_z + self.max_z) / 2,',
                '        )',
                '',
                '    def to_dict(self) -> dict:',
                '        if self.is_empty():',
                '            return {"empty": True}',
                '        return {',
                '            "min":    [self.min_x, self.min_y, self.min_z],',
                '            "max":    [self.max_x, self.max_y, self.max_z],',
                '            "size":   [self.size_x, self.size_y, self.size_z],',
                '            "center": list(self.center),',
                '        }',
                '',
                '# Build the box for a small milled pocket',
                'pocket_pts = [(0,0,0), (50,0,0), (50,30,0), (0,30,0), (25,15,-8)]',
                'pocket_bb = BoundingBox3D()',
                'for (x, y, z) in pocket_pts:',
                '    pocket_bb.expand(x, y, z)',
                '',
                'import json',
                'print("Pocket bounding box:")',
                'print(json.dumps(pocket_bb.to_dict(), indent=2))',
                'print()',
                `print(f"Center of part: {pocket_bb.center}")`,
                `print(f"Part footprint: {pocket_bb.size_x:.1f} mm × {pocket_bb.size_y:.1f} mm, depth {pocket_bb.size_z:.1f} mm")`,
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 5: Challenge 1 — fill-in: build bbox from toolpath ─────────
            {
              id: 5,
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Build a bounding box from a list of toolpath points',
              difficulty: 'easy',
              cellTitle: 'Challenge 1 — Build a bounding box from a toolpath',
              prose:
                'A G-code program visits these XYZ positions (in the work frame):\n\n' +
                '```\n' +
                '(0, 0, 5)     ← rapid to safe height above part zero\n' +
                '(10, 0, 5)    ← rapid over first corner\n' +
                '(10, 0, -3)   ← plunge to cutting depth\n' +
                '(10, 20, -3)  ← cut along Y\n' +
                '(30, 20, -3)  ← cut along X\n' +
                '(30, 0, -3)   ← cut back along Y\n' +
                '(30, 0, 5)    ← retract\n' +
                '```\n\n' +
                'Build a BoundingBox3D that contains all of these points.',
              prompt: 'Create a BoundingBox3D called bb, then call bb.expand(x, y, z) for each point in the toolpath list. The list is provided — fill in the expand calls.',
              starterBlock: [
                'toolpath = [',
                '    (0,  0,  5),',
                '    (10, 0,  5),',
                '    (10, 0,  -3),',
                '    (10, 20, -3),',
                '    (30, 20, -3),',
                '    (30, 0,  -3),',
                '    (30, 0,  5),',
                ']',
                '',
                'bb = BoundingBox3D()',
                'for (x, y, z) in toolpath:',
                '    bb.expand(___, ___, ___)   # expand the box to include this point',
                '',
                'print(bb.to_dict())',
              ].join('\n'),
              code: [
                '# Paste the starter block here and fill in the ___ values.',
                '# toolpath = [ ... ]',
                '# bb = BoundingBox3D()',
                '# for (x, y, z) in toolpath:',
                '#     bb.expand(___, ___, ___)',
                '# print(bb.to_dict())',
              ].join('\n'),
              testCode: [
                'assert "bb" in dir(), "bb not defined — paste and complete the starter block"',
                'assert isinstance(bb, BoundingBox3D), "bb must be a BoundingBox3D"',
                'assert not bb.is_empty(), "bb is still empty — did you call bb.expand() for each point?"',
                '',
                'assert bb.min_x == 0,  f"min_x should be 0, got {bb.min_x}"',
                'assert bb.max_x == 30, f"max_x should be 30, got {bb.max_x}"',
                'assert bb.min_y == 0,  f"min_y should be 0, got {bb.min_y}"',
                'assert bb.max_y == 20, f"max_y should be 20, got {bb.max_y}"',
                'assert bb.min_z == -3, f"min_z should be -3, got {bb.min_z}"',
                'assert bb.max_z == 5,  f"max_z should be 5, got {bb.max_z}"',
                '',
                '"SUCCESS: Bounding box correctly spans X:[0,30] Y:[0,20] Z:[-3,5]."',
              ].join('\n'),
              hint: 'The loop already unpacks (x, y, z) from each tuple. Pass those same variables to bb.expand(x, y, z).',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 6: polyline_length_2d and polyline_length_3d ────────────────
            {
              id: 6,
              cellTitle: 'polyline_length_2d and polyline_length_3d — total toolpath travel distance',
              prose:
                'A polyline\'s total length is the sum of the distance between every pair of consecutive points. ' +
                'With n points there are n-1 segments — iterate from index 0 to n-2 inclusive. ' +
                'The unpacking trick `*points[i]` expands a tuple (x, y) or (x, y, z) into separate arguments, ' +
                'making the call to dist2d or dist3d read cleanly.',
              code: [
                'from typing import List, Tuple',
                '',
                'def polyline_length_2d(points: List[Tuple[float, float]]) -> float:',
                '    """Total length of a 2D polyline (list of (x, y) tuples)."""',
                '    if len(points) < 2:',
                '        return 0.0',
                '    total = 0.0',
                '    for i in range(len(points) - 1):',
                '        total += dist2d(*points[i], *points[i+1])',
                '    return total',
                '',
                'def polyline_length_3d(points: List[Tuple[float, float, float]]) -> float:',
                '    """Total length of a 3D polyline (list of (x, y, z) tuples)."""',
                '    if len(points) < 2:',
                '        return 0.0',
                '    total = 0.0',
                '    for i in range(len(points) - 1):',
                '        total += dist3d(*points[i], *points[i+1])',
                '    return total',
                '',
                '# ── Test: unit square perimeter ──────────────────────────────────',
                '# Four sides of length 1, returning to start → perimeter = 4.0',
                'square = [(0,0), (1,0), (1,1), (0,1), (0,0)]',
                'sq_len = polyline_length_2d(square)',
                `print(f"Unit square perimeter: {sq_len:.6f}   (expected 4.0)")`,
                '',
                '# ── Test: 3-4-5 triangle perimeter ──────────────────────────────',
                'triangle = [(0,0,0), (3,0,0), (3,4,0), (0,0,0)]',
                'tri_len = polyline_length_3d(triangle)',
                `print(f"3-4-5 triangle perimeter: {tri_len:.6f}   (expected 12.0)")`,
                '',
                '# ── Real example: the toolpath from Challenge 1 ──────────────────',
                'toolpath_3d = [',
                '    (0,  0,  5),',
                '    (10, 0,  5),',
                '    (10, 0,  -3),',
                '    (10, 20, -3),',
                '    (30, 20, -3),',
                '    (30, 0,  -3),',
                '    (30, 0,  5),',
                ']',
                'total_travel = polyline_length_3d(toolpath_3d)',
                `print(f"Total toolpath travel: {total_travel:.4f} mm")`,
                '',
                'feed_rate_mm_per_min = 800.0',
                'cut_time_min = total_travel / feed_rate_mm_per_min',
                `print(f"Estimated cut time at {feed_rate_mm_per_min:.0f} mm/min: {cut_time_min:.3f} min  ({cut_time_min*60:.1f} sec)")`,
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 7: Challenge 2 — write: implement merge() ──────────────────
            {
              id: 7,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Implement BoundingBox3D.merge(other)',
              difficulty: 'medium',
              cellTitle: 'Challenge 2 — Implement merge(other): combine two bounding boxes',
              prose:
                'A CNC job might have two G-code files — one for the top face of a part and one for the bottom. ' +
                'Each file produces its own bounding box. To check whether **both** operations together fit on the machine, ' +
                'you need to merge the two boxes into one that contains both.\n\n' +
                '**Rule**: the merged box\'s min is the component-wise minimum of both mins, ' +
                'and its max is the component-wise maximum of both maxes.\n\n' +
                '- merged.min_x = min(self.min_x, other.min_x)\n' +
                '- merged.max_x = max(self.max_x, other.max_x)\n' +
                '- (and the same pattern for Y and Z)',
              prompt: 'Add a merge(other) method to BoundingBox3D. It must return a NEW BoundingBox3D that is the smallest box containing both self and other. Do not modify self or other.',
              code: [
                '# Redefine BoundingBox3D with the merge() method added.',
                '# All previous methods must remain — write merge() below to_dict().',
                '',
                '@dataclass',
                'class BoundingBox3D:',
                '    min_x: float = math.inf',
                '    min_y: float = math.inf',
                '    min_z: float = math.inf',
                '    max_x: float = -math.inf',
                '    max_y: float = -math.inf',
                '    max_z: float = -math.inf',
                '',
                '    def is_empty(self) -> bool:',
                '        return self.min_x == math.inf',
                '',
                '    def expand(self, x, y, z=0.0) -> None:',
                '        if x < self.min_x: self.min_x = x',
                '        if y < self.min_y: self.min_y = y',
                '        if z < self.min_z: self.min_z = z',
                '        if x > self.max_x: self.max_x = x',
                '        if y > self.max_y: self.max_y = y',
                '        if z > self.max_z: self.max_z = z',
                '',
                '    def expand_point(self, pt) -> None:',
                '        self.expand(pt.x, pt.y, getattr(pt, "z", 0.0))',
                '',
                '    @property',
                '    def size_x(self): return self.max_x - self.min_x',
                '    @property',
                '    def size_y(self): return self.max_y - self.min_y',
                '    @property',
                '    def size_z(self): return self.max_z - self.min_z',
                '',
                '    @property',
                '    def center(self):',
                '        return (',
                '            (self.min_x + self.max_x) / 2,',
                '            (self.min_y + self.max_y) / 2,',
                '            (self.min_z + self.max_z) / 2,',
                '        )',
                '',
                '    def to_dict(self) -> dict:',
                '        if self.is_empty():',
                '            return {"empty": True}',
                '        return {',
                '            "min":    [self.min_x, self.min_y, self.min_z],',
                '            "max":    [self.max_x, self.max_y, self.max_z],',
                '            "size":   [self.size_x, self.size_y, self.size_z],',
                '            "center": list(self.center),',
                '        }',
                '',
                '    # YOUR CODE HERE',
                '    # def merge(self, other: "BoundingBox3D") -> "BoundingBox3D":',
                '    #     """Return a new BoundingBox3D that contains both self and other."""',
                '    #     ...',
              ].join('\n'),
              testCode: [
                'assert hasattr(BoundingBox3D, "merge"), "merge method not found on BoundingBox3D — did you define it?"',
                '',
                '# Box A: lower-left region',
                'a = BoundingBox3D()',
                'for (x, y, z) in [(0, 0, 0), (10, 5, 2)]:',
                '    a.expand(x, y, z)',
                '',
                '# Box B: upper-right region, different Z range',
                'b = BoundingBox3D()',
                'for (x, y, z) in [(8, 3, -5), (25, 20, 0)]:',
                '    b.expand(x, y, z)',
                '',
                'merged = a.merge(b)',
                '',
                'assert isinstance(merged, BoundingBox3D), "merge must return a BoundingBox3D"',
                '',
                '# min is component-wise minimum of both boxes',
                'assert merged.min_x == 0,  f"merged.min_x should be 0 (min of 0 and 8), got {merged.min_x}"',
                'assert merged.min_y == 0,  f"merged.min_y should be 0 (min of 0 and 3), got {merged.min_y}"',
                'assert merged.min_z == -5, f"merged.min_z should be -5 (min of 0 and -5), got {merged.min_z}"',
                '',
                '# max is component-wise maximum of both boxes',
                'assert merged.max_x == 25, f"merged.max_x should be 25 (max of 10 and 25), got {merged.max_x}"',
                'assert merged.max_y == 20, f"merged.max_y should be 20 (max of 5 and 20), got {merged.max_y}"',
                'assert merged.max_z == 2,  f"merged.max_z should be 2 (max of 2 and 0), got {merged.max_z}"',
                '',
                '# merge must not modify the originals',
                'assert a.max_x == 10, "merge must not modify box a"',
                'assert b.min_z == -5, "merge must not modify box b"',
                '',
                '"SUCCESS: merge() correctly returns the combined bounding box. Originals unchanged."',
              ].join('\n'),
              hint: 'Create a new BoundingBox3D and set its six fields directly: merged = BoundingBox3D(min_x=min(self.min_x, other.min_x), ...). Use min() for the three min fields and max() for the three max fields.',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 8: Full toolpath analysis ───────────────────────────────────
            {
              id: 8,
              cellTitle: 'Full toolpath analysis — bbox, travel distance, and cycle time estimate',
              prose:
                'All three tools together: build a bounding box from a realistic toolpath, compute total travel distance, ' +
                'and produce a simple pre-flight report that a G-code post-processor would generate before sending the program to the machine.',
              code: [
                '# A realistic pocket-milling toolpath — 18 points',
                '# Units: mm, work frame',
                'toolpath = [',
                '    (0.0,   0.0,  5.0),   # rapid to safe Z above origin',
                '    (5.0,   5.0,  5.0),   # rapid over pocket corner',
                '    (5.0,   5.0, -8.0),   # plunge to cutting depth',
                '    (45.0,  5.0, -8.0),   # cut — bottom edge',
                '    (45.0, 35.0, -8.0),   # cut — right edge',
                '    (5.0,  35.0, -8.0),   # cut — top edge',
                '    (5.0,   5.0, -8.0),   # cut — close rectangle',
                '    (15.0,  5.0, -8.0),   # inner pass start',
                '    (15.0, 10.0, -8.0),',
                '    (25.0, 10.0, -8.0),',
                '    (35.0, 10.0, -8.0),',
                '    (35.0, 20.0, -8.0),',
                '    (25.0, 20.0, -8.0),',
                '    (15.0, 20.0, -8.0),',
                '    (15.0, 30.0, -8.0),',
                '    (35.0, 30.0, -8.0),',
                '    (35.0, 35.0, -8.0),',
                '    (35.0, 35.0,  5.0),   # retract to safe Z',
                ']',
                '',
                '# ── Build bounding box ───────────────────────────────────────────',
                'bb = BoundingBox3D()',
                'for (x, y, z) in toolpath:',
                '    bb.expand(x, y, z)',
                '',
                '# ── Compute total travel ─────────────────────────────────────────',
                'total_travel = polyline_length_3d(toolpath)',
                '',
                '# ── Pre-flight report ────────────────────────────────────────────',
                'RAPID_RATE   = 5000.0   # mm/min',
                'CUTTING_RATE =  800.0   # mm/min',
                '# (simplified: treating all moves as cutting rate)',
                'est_time_min = total_travel / CUTTING_RATE',
                '',
                'print("=" * 50)',
                'print("  G-CODE PRE-FLIGHT REPORT")',
                'print("=" * 50)',
                'import json',
                'box = bb.to_dict()',
                `print(f"  X extent : {box['min'][0]:.2f} to {box['max'][0]:.2f}  ({box['size'][0]:.2f} mm)")`,
                `print(f"  Y extent : {box['min'][1]:.2f} to {box['max'][1]:.2f}  ({box['size'][1]:.2f} mm)")`,
                `print(f"  Z extent : {box['min'][2]:.2f} to {box['max'][2]:.2f}  ({box['size'][2]:.2f} mm)")`,
                `print(f"  Center   : ({box['center'][0]:.2f}, {box['center'][1]:.2f}, {box['center'][2]:.2f})")`,
                'print()',
                `print(f"  Total travel  : {total_travel:.2f} mm")`,
                `print(f"  Est. cut time : {est_time_min:.2f} min  ({est_time_min*60:.0f} sec)")`,
                `print(f"  Points in path: {len(toolpath)}")`,
                `print(f"  Segments      : {len(toolpath)-1}")`,
                'print("=" * 50)',
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
      'The **Euclidean distance** between two points $P_1 = (x_1, y_1, z_1)$ and $P_2 = (x_2, y_2, z_2)$ is:',

      '$$d(P_1, P_2) = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2 + (z_2-z_1)^2}$$',

      'This follows directly from the Pythagorean theorem applied in three dimensions. ' +
      'In 2D the formula simplifies to $\\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$.',

      'The **axis-aligned bounding box** of a set of points $\\{P_1, P_2, \\ldots, P_n\\}$ is defined by:',

      '$$\\text{min}_x = \\min_{i} x_i \\qquad \\text{max}_x = \\max_{i} x_i$$',

      'and the same for Y and Z. The identity element for the $\\min$ operation is $+\\infty$ ' +
      '(any real number is smaller), and for $\\max$ it is $-\\infty$ (any real number is larger). ' +
      'This makes the initialization mathematically correct: after the first point, ' +
      '$\\min(+\\infty, x_1) = x_1$ and $\\max(-\\infty, x_1) = x_1$.',

      'The **total polyline length** of an ordered sequence of $n$ points is:',

      '$$L = \\sum_{i=0}^{n-2} d(P_i, P_{i+1})$$',

      'There are $n-1$ segments. The loop index runs from $0$ to $n-2$ inclusive, ' +
      'which is why the code writes `range(len(points) - 1)`.',
    ],
  },

  rigor: {
    prose: [
      '**math.hypot vs. manual sqrt**: Python\'s math.hypot(dx, dy) is preferred for 2D distance because it ' +
      'guards against intermediate overflow and underflow. If dx or dy is very large (e.g. 1e200), then dx**2 ' +
      'overflows to inf before the sqrt is ever computed. math.hypot rescales internally to avoid this. ' +
      'For typical CNC coordinates (< 10,000 mm) this distinction is irrelevant, but using hypot costs nothing extra ' +
      'and is the professional choice.',

      '**Float comparison in bounding box init**: is_empty() checks `self.min_x == math.inf`. This is the one place ' +
      'in the codebase where comparing a float with == is correct — because math.inf is an exact IEEE-754 ' +
      'sentinel value, not the result of arithmetic. For any computed coordinate value, always use math.isclose().',

      '**Bounding box initialization is not a trick — it is a mathematical identity**: Starting with ' +
      '$\\min = +\\infty$ is the identity element of the min operation: $\\min(+\\infty, x) = x$ for all real $x$. ' +
      'Starting with 0 injects a phantom point at the origin. This is one of those cases where the correct solution ' +
      'looks strange until you understand the underlying math — then it is the only natural choice.',

      '**Off-by-one in polyline_length**: A list of $n$ points has $n-1$ segments. `range(len(points))` ' +
      'iterates $n$ times. `range(len(points) - 1)` iterates $n-1$ times, which is what we want. ' +
      'The off-by-one version would try to access `points[n]` on the last iteration, raising an IndexError — ' +
      'except it would not, because the loop index would be $n-1$, and then `points[(n-1)+1] = points[n]` ' +
      'raises IndexError. Catching this in testing rather than production is the purpose of the unit square test.',

      '**merge() must return a new box**: A merge that mutates self in place cannot be composed safely. ' +
      'Always return a new BoundingBox3D from merge(). This matches standard functional design: ' +
      'pure functions that produce new values rather than mutating their arguments are easier to reason about ' +
      'and test.',
    ],
  },

  examples: [
    {
      id: 'ex-bbox-trace',
      title: 'Tracing BoundingBox3D.expand() across three points',
      problem:
        'A toolpath visits (0, 0, 0), then (5, 3, -1), then (2, 8, 4). ' +
        'Trace the state of a BoundingBox3D after each call to expand().',
      steps: [
        {
          expression: 'Initial state',
          annotation: 'min_x=min_y=min_z=+inf, max_x=max_y=max_z=-inf. is_empty() returns True.',
        },
        {
          expression: 'expand(0, 0, 0)',
          annotation: 'Every component beats both sentinels: 0 < +inf sets all mins to 0; 0 > -inf sets all maxes to 0. Box: X:[0,0] Y:[0,0] Z:[0,0].',
        },
        {
          expression: 'expand(5, 3, -1)',
          annotation: 'x=5 > max_x=0 → max_x=5. y=3 > max_y=0 → max_y=3. z=-1 < min_z=0 → min_z=-1. Box: X:[0,5] Y:[0,3] Z:[-1,0].',
        },
        {
          expression: 'expand(2, 8, 4)',
          annotation: 'x=2 is inside [0,5] — no change. y=8 > max_y=3 → max_y=8. z=4 > max_z=0 → max_z=4. Box: X:[0,5] Y:[0,8] Z:[-1,4].',
        },
      ],
      conclusion:
        'Final box: min=(0,0,-1), max=(5,8,4), size=(5,8,5), center=(2.5, 4.0, 1.5). ' +
        'The expand() method only ever moves a boundary outward — it can never shrink the box.',
    },
    {
      id: 'ex-polyline-perimeter',
      title: 'Polyline length of a unit square',
      problem:
        'Points: (0,0) → (1,0) → (1,1) → (0,1) → (0,0). Compute total length.',
      steps: [
        {
          expression: 'Segment 0→1: dist2d(0,0, 1,0)',
          annotation: 'sqrt((1-0)² + (0-0)²) = sqrt(1) = 1.0',
        },
        {
          expression: 'Segment 1→2: dist2d(1,0, 1,1)',
          annotation: 'sqrt((1-1)² + (1-0)²) = sqrt(1) = 1.0',
        },
        {
          expression: 'Segment 2→3: dist2d(1,1, 0,1)',
          annotation: 'sqrt((0-1)² + (1-1)²) = sqrt(1) = 1.0',
        },
        {
          expression: 'Segment 3→4: dist2d(0,1, 0,0)',
          annotation: 'sqrt((0-0)² + (0-1)²) = sqrt(1) = 1.0',
        },
        {
          expression: 'Total = 1.0 + 1.0 + 1.0 + 1.0',
          annotation: '4 segments (n-1 = 5-1 = 4) for 5 points. Total = 4.0.',
        },
      ],
      conclusion:
        'The perimeter of a unit square is 4.0 — a clean known value that makes an ideal regression test. ' +
        'The five-point list has four segments, confirming the n-1 segment count.',
    },
  ],

  quiz: [
    {
      id: 'gcp-04-q1',
      type: 'choice',
      text: 'A BoundingBox3D is initialized with min_x = 0 instead of math.inf. A toolpath has all negative X coordinates. What goes wrong?',
      options: [
        'Nothing — 0 is the identity element for min, so the result is the same',
        'The box reports min_x = 0 instead of the true minimum negative value, making the box appear larger than the actual toolpath',
        'Python raises a ValueError because bounding box fields cannot be 0',
        'The is_empty() check returns True incorrectly',
      ],
      correct: 1,
    },
    {
      id: 'gcp-04-q2',
      type: 'choice',
      text: 'Why does polyline_length iterate range(len(points) - 1) rather than range(len(points))?',
      options: [
        'Python list indexing starts at 1, so we must subtract 1',
        'The last point is always a duplicate of the first, so we skip it',
        'n points define n-1 segments; iterating n times would access points[n] which is out of bounds',
        'range() is exclusive of the end, so subtracting 1 ensures we include the last point',
      ],
      correct: 2,
    },
    {
      id: 'gcp-04-q3',
      type: 'choice',
      text: 'math.hypot(dx, dy) is preferred over math.sqrt(dx**2 + dy**2) for 2D distance. Why?',
      options: [
        'math.hypot is faster by approximately 10× on modern CPUs',
        'math.sqrt cannot accept two arguments',
        'math.hypot avoids intermediate overflow/underflow on very large or very small values',
        'math.sqrt rounds to the nearest integer, while math.hypot returns a float',
      ],
      correct: 2,
    },
    {
      id: 'gcp-04-q4',
      type: 'choice',
      text: 'BoundingBox3D.is_empty() checks min_x == math.inf using ==. Why is == correct here when it is normally wrong for floats?',
      options: [
        'It is still wrong — you should use math.isclose(self.min_x, math.inf)',
        'math.inf is an exact IEEE-754 sentinel value, not the result of arithmetic, so == comparison is safe',
        'Bounding box fields are integers internally, so == is exact',
        'The == comparison is only safe because min_x was set to math.inf by the field default, never by arithmetic',
      ],
      correct: 1,
    },
    {
      id: 'gcp-04-q5',
      type: 'choice',
      text: 'merge(a, b) should combine two bounding boxes. What mathematical operations define the merged min and max?',
      options: [
        'merged.min = average(a.min, b.min) and merged.max = average(a.max, b.max)',
        'merged.min = component-wise min(a.min, b.min) and merged.max = component-wise max(a.max, b.max)',
        'merged.min = a.min + b.min and merged.max = a.max + b.max',
        'merged.min = min(a.min_x, b.min_x, a.min_y, b.min_y, a.min_z, b.min_z) as a scalar',
      ],
      correct: 1,
    },
    {
      id: 'gcp-04-q6',
      type: 'choice',
      text: 'A toolpath polyline has 100 points. How many distance calculations does polyline_length_3d perform?',
      options: [
        '100',
        '101',
        '99',
        '50',
      ],
      correct: 2,
    },
    {
      id: 'gcp-04-q7',
      type: 'choice',
      text: 'expand_point(pt) uses getattr(pt, "z", 0.0) instead of just pt.z. What problem does this solve?',
      options: [
        'It prevents a TypeError if pt.z is a string rather than a float',
        'It handles 2D point objects that have x and y but no z attribute, defaulting Z to 0.0',
        'getattr is faster than direct attribute access for large point objects',
        'It is required because Point3D stores z as a private attribute _z',
      ],
      correct: 1,
    },
    {
      id: 'gcp-04-q8',
      type: 'choice',
      text: 'The 3D distance from (0,0,0) to (1,1,1) is:',
      options: [
        '1.0',
        '1.5',
        'sqrt(2) ≈ 1.414',
        'sqrt(3) ≈ 1.732',
      ],
      correct: 3,
    },
  ],

  mentalModel: [
    'Euclidean distance is Pythagoras in 3D: sqrt(dx² + dy² + dz²). Use math.hypot(dx, dy) for 2D.',
    'Bounding box min starts at +inf so any real coordinate beats it. Max starts at -inf for the same reason.',
    'expand() only ever moves a boundary outward — a bounding box never shrinks.',
    'polyline_length iterates n-1 segments for n points. Off-by-one here silently drops the last segment.',
    'is_empty() checks min_x == math.inf. Reading any property on an empty box returns a meaningless result.',
    'merge(a, b) uses component-wise min for the lower corner and component-wise max for the upper corner.',
    'Total toolpath travel / feed rate = estimated cycle time. Bounding box = does the part fit the machine?',
    'Default Z to 0.0, never None. A None in a distance calculation raises TypeError at the worst possible time.',
  ],

  checkpoints: ['read-intuition'],
}
