export default {
  id: 'gcp-05-lines-and-arcs',
  slug: 'lines-and-arcs',
  order: 5,
  title: 'Lines and Arcs',
  subtitle: 'Parametric segments, G-code arc representations, and the sampling pipeline that turns arcs into renderable polylines',
  tags: [
    'parametric line', 'arc segment', 'G2', 'G3', 'clockwise', 'counter-clockwise',
    'IJ offset', 'R notation', 'arc_to_polyline', 'arc_length', 'helical arc',
    'angular span', 'full circle', 'Python', 'G-code parser', 'toolpath',
  ],

  semantics: {
    core: [
      {
        symbol: 'P(t) = A + t·(B − A)',
        meaning:
          'The parametric equation of a line segment. At t=0 the result is A. At t=1 the result is B. ' +
          'At t=0.5 the result is the midpoint. t outside [0,1] extrapolates beyond the segment. ' +
          'This is the same as lerp(A, B, t) — parametric lines and linear interpolation are the same operation.',
      },
      {
        symbol: 'ArcSegment',
        meaning:
          'A complete description of an arc in the XY plane: start point, end point, center (cx, cy), ' +
          'radius, clockwise flag, and optional start/end Z for helical arcs. ' +
          'All arc representations (IJ or R) are converted into this canonical form before further processing.',
      },
      {
        symbol: 'I, J offsets',
        meaning:
          'G-code parameters that specify the arc center as an offset from the start point: ' +
          'I = center_x − start_x, J = center_y − start_y. ' +
          'The center is found by adding (I, J) to the start point. ' +
          'This is the most common arc representation in CNC G-code.',
      },
      {
        symbol: 'R notation',
        meaning:
          'An alternative G-code arc representation. R specifies the radius directly. ' +
          'Because two circles of radius R can pass through any two points, the sign of R disambiguates: ' +
          'R positive → short arc (less than 180°), R negative → long arc (greater than 180°). ' +
          'The center is computed geometrically using the perpendicular bisector of the chord.',
      },
      {
        symbol: 'G2 / G3',
        meaning:
          'G2 = clockwise arc, G3 = counter-clockwise arc, both as viewed from above (+Z looking down). ' +
          'In right-handed math coordinates (Y points up), clockwise means the angle decreases. ' +
          'In screen coordinates (Y points down), CW and CCW are flipped — the renderer must account for this.',
      },
      {
        symbol: 'Angular span',
        meaning:
          'The total angle swept by the arc, always a positive value in (0, 2π]. ' +
          'Computed as (start_angle − end_angle) mod 2π for CW arcs, ' +
          'or (end_angle − start_angle) mod 2π for CCW arcs. ' +
          'If start and end points are identical (full circle), the naive span is 0 — it must be forced to 2π.',
      },
      {
        symbol: 'arc_to_polyline',
        meaning:
          'Converts an arc into a list of (x, y, z) tuples by sampling it at evenly-spaced angular intervals. ' +
          'The number of segments controls the approximation quality. ' +
          'Start and end points are forced to exact values to prevent floating-point drift from accumulating.',
      },
      {
        symbol: 'Helical arc',
        meaning:
          'An arc where Z changes linearly from start_z to end_z as the tool sweeps through the arc angle. ' +
          'The XY motion is circular; the Z motion is linear. ' +
          'The true length of a helical arc is hypot(xy_arc_length, dz) — longer than the 2D arc alone.',
      },
    ],
    rulesOfThumb: [
      'Always convert IJ or R arcs into ArcSegment (canonical form) before any processing. Never pass raw I/J/R values downstream.',
      'Full circle detection: if start == end, angular span would be 0 — force it to 2π immediately.',
      'IJ tolerance: validate that r_start and r_end agree within 1% + 0.001 mm, not exact equality (float rounding).',
      'R sign rule: R positive = short arc (< 180°), R negative = long arc (> 180°). Easy to remember: positive = the "normal" short way around.',
      'G2/G3 are math-convention (Y-up). Screen renderers with Y-down must flip CW and CCW when drawing.',
      'arc_to_polyline: force points[0] and points[-1] to exact start/end — do not trust the trigonometry alone.',
    ],
  },

  hook: {
    question: 'A G-code file says G3 X0 Y10 I-10 J0. How does the interpreter find the arc center, compute the sweep angle, and turn this into geometry it can render?',
    realWorldContext:
      'Every curved move in a G-code program is an arc command — a G2 (clockwise) or G3 (counter-clockwise) block ' +
      'that specifies where the tool ends up and either the center offset (I, J) or the radius (R).\n\n' +
      'The interpreter must decode this into a canonical ArcSegment: center coordinates, radius, clockwise flag, ' +
      'angular span. Then it must approximate the arc as a series of short line segments so the renderer, ' +
      'the bounding-box calculator, and the feed-rate planner can all work with simple polylines.\n\n' +
      'This lesson builds every piece of that pipeline — from the parametric line equation through the two arc ' +
      'representations, the angle computation, the polyline sampler, and the CW/CCW coordinate-system trap ' +
      'that catches many first-time implementers.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Parametric lines — t as a "progress parameter"**: The equation P(t) = A + t·(B−A) describes ' +
      'every point on the segment from A to B. Think of t as a percentage: 0% at A, 100% at B. ' +
      'This is identical to lerp(A, B, t). The parametric form makes it trivial to find any point on the ' +
      'segment, divide it at any ratio, or test whether a parameter value is inside [0, 1].',

      '**Two ways to specify an arc in G-code**: The IJ form says "the center is this many mm from where I am now." ' +
      'The R form says "the radius is this value — figure out the center yourself." Both encode the same arc; ' +
      'the interpreter must handle either. The canonical output is always an ArcSegment with an explicit center.',

      '**Angular span — the one detail that breaks naive implementations**: ' +
      'Computing the start and end angles with atan2 is straightforward. ' +
      'But subtracting them naively can give the wrong sign, the wrong magnitude, or zero for a full circle. ' +
      'The correct approach: compute (end − start) mod 2π for CCW, (start − end) mod 2π for CW, ' +
      'and then special-case: if start == end, span = 2π, not 0.',

      '**arc_to_polyline — sampling the arc**: The renderer does not draw arcs natively; it draws line segments. ' +
      'To render an arc, we sample it at evenly-spaced angles and return the points. More segments = smoother curve. ' +
      'A formula exists for the minimum number of segments to stay within a given chord error: ' +
      'n ≥ π / arccos(1 − ε/r), where ε is the maximum allowed deviation.',
    ],
    callouts: [
      {
        type: 'warning',
        title: 'Full circle trap: start == end gives span = 0',
        body: 'If a G-code arc has the same start and end point (a full circle), atan2 gives the same angle for both. The difference is 0, not 2π. You must detect this case and set span = 2π. The arc_angles() function handles this by checking if span < 1e-9 after the modulo computation.',
      },
      {
        type: 'warning',
        title: 'G2/G3 flips between math and screen coordinates',
        body: 'G2 = clockwise as viewed from above, which is the standard machinist convention. In right-handed math coordinates (Y-up), clockwise means the angle decreases. But in screen coordinates (Y-down, as used by SVG, HTML Canvas, and most 2D graphics APIs), the Y axis is flipped — so what is CW in math coords is CCW on screen. Our interpreter stores arcs in math convention. The renderer is responsible for the flip.',
      },
      {
        type: 'insight',
        title: 'R sign picks which of two possible arc centers to use',
        body: 'Given two points and a radius, there are exactly two circles of that radius that pass through both points — their centers lie on opposite sides of the chord. R positive selects the center on the short-arc side (arc sweeps less than 180°). R negative selects the center on the long-arc side. The geometric construction uses the perpendicular bisector of the chord and Pythagoras to find the distance from the midpoint to the center.',
      },
      {
        type: 'insight',
        title: 'Helical arcs: Z rides along for free',
        body: 'A helical arc is just an XY arc with Z changing linearly. The ArcSegment stores start_z and end_z. arc_to_polyline interpolates Z with the same t parameter used for the angle. arc_length uses hypot(xy_arc_length, dz) — the Pythagorean theorem applied to the arc unrolled flat.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'G-Code Interpreter — Lesson 5: Lines and Arcs',
        mathBridge: 'Run cells in order. The ArcSegment class and all arc functions built here are used by the toolpath renderer and feed-rate planner.',
        caption: 'Build the complete arc pipeline: parametric lines, IJ arcs, R arcs, angle computation, polyline sampling, and arc length.',
        props: {
          initialCells: [

            // ─── CELL 1: Parametric line segment ─────────────────────────────────────
            {
              id: 1,
              cellTitle: 'Parametric line segments — P(t) = A + t·(B − A)',
              prose:
                'A **parametric line segment** describes every point on the segment using a single number t. ' +
                'At t=0 you are at A. At t=1 you are at B. At t=0.5 you are at the midpoint. ' +
                'This is the same formula as lerp — parametric lines and linear interpolation are identical.\n\n' +
                'In the G-code interpreter, this is used to subdivide a linear move (G1) into fine steps ' +
                'for the motion controller, and to find the point at any fraction of the segment length.',
              code: [
                'import math',
                'from dataclasses import dataclass',
                '',
                '# ── Minimal Vec2 for this lesson ────────────────────────────────────',
                '@dataclass',
                'class Vec2:',
                '    x: float',
                '    y: float',
                '    def __add__(self, o):  return Vec2(self.x + o.x, self.y + o.y)',
                '    def __sub__(self, o):  return Vec2(self.x - o.x, self.y - o.y)',
                '    def __mul__(self, s):  return Vec2(self.x * s,   self.y * s)',
                '    def __rmul__(self, s): return self.__mul__(s)',
                '    def __repr__(self):    return f"Vec2({self.x:.6g}, {self.y:.6g})"',
                '',
                '# ── Parametric point on a segment ───────────────────────────────────',
                'def point_on_segment(A: Vec2, B: Vec2, t: float) -> Vec2:',
                '    """P(t) = A + t*(B - A). t=0 → A, t=1 → B, t=0.5 → midpoint."""',
                '    return A + (B - A) * t',
                '',
                '# G-code move: tool travels from (0,0) to (40,30)',
                'A = Vec2(0.0, 0.0)',
                'B = Vec2(40.0, 30.0)',
                '',
                'print("Parametric samples along segment (0,0) → (40,30):")',
                'for t in [0.0, 0.25, 0.5, 0.75, 1.0]:',
                '    p = point_on_segment(A, B, t)',
                '    print(f"  t={t:.2f}  →  {p}")',
                '',
                'print()',
                '# Connection to lerp: identical formula',
                'def lerp(a: Vec2, b: Vec2, t: float) -> Vec2:',
                '    return a + (b - a) * t',
                '',
                'mid_parametric = point_on_segment(A, B, 0.5)',
                'mid_lerp       = lerp(A, B, 0.5)',
                'print(f"point_on_segment(A,B,0.5) = {mid_parametric}")',
                'print(f"lerp(A, B, 0.5)           = {mid_lerp}")',
                'print(f"Same result: {math.isclose(mid_parametric.x, mid_lerp.x) and math.isclose(mid_parametric.y, mid_lerp.y)}")',
                '',
                '# Segment length via magnitude',
                'length = math.hypot(B.x - A.x, B.y - A.y)',
                'print(f"Segment length: {length:.4f} mm  (3-4-5 scaled by 10: sqrt(40²+30²) = 50)")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 2: Arc representations — IJ vs R ───────────────────────────────
            {
              id: 2,
              cellTitle: 'G-code arc representations — IJ offsets and R radius',
              prose:
                'G-code has two ways to specify an arc. Both must specify: ' +
                'start point (the current tool position), end point (X Y in the block), ' +
                'and direction (G2=CW, G3=CCW). They differ only in how the center is encoded.\n\n' +
                '**IJ form**: center = start + (I, J). The offsets I and J are signed distances from start to center.\n\n' +
                '**R form**: center is computed from the chord. R positive = short arc, R negative = long arc.',
              code: [
                '# ── IJ form: center is explicit via offset from start ────────────────',
                '# Example G-code block: G3 X0 Y10 I-10 J0',
                '# Tool starts at (10, 0), ends at (0, 10), CCW arc.',
                '# I = -10 means center_x = start_x + I = 10 + (-10) = 0',
                '# J =  0  means center_y = start_y + J = 0  +   0   = 0',
                '',
                'start_x, start_y = 10.0, 0.0',
                'end_x,   end_y   = 0.0,  10.0',
                'I, J             = -10.0, 0.0',
                '',
                'center_x = start_x + I',
                'center_y = start_y + J',
                'radius   = math.hypot(center_x - start_x, center_y - start_y)',
                '',
                'print("=== IJ form: G3 X0 Y10 I-10 J0  (starting at (10,0)) ===")',
                'print(f"  Start  : ({start_x}, {start_y})")',
                'print(f"  End    : ({end_x}, {end_y})")',
                'print(f"  I, J   : ({I}, {J})")',
                'print(f"  Center : ({center_x}, {center_y})")',
                'print(f"  Radius : {radius:.4f}")',
                '',
                '# ── R form: center computed geometrically ────────────────────────────',
                '# Same arc, R form: G3 X0 Y10 R10',
                '# R = 10 (positive → short arc, < 180°)',
                '',
                'R = 10.0',
                'mx = (start_x + end_x) / 2',
                'my = (start_y + end_y) / 2',
                'half_chord = math.hypot(end_x - start_x, end_y - start_y) / 2',
                'd = math.sqrt(R**2 - half_chord**2)   # distance from midpoint to center',
                '',
                'print()',
                'print("=== R form: G3 X0 Y10 R10  (same arc) ===")',
                'print(f"  Chord midpoint : ({mx}, {my})")',
                'print(f"  Half-chord     : {half_chord:.4f}")',
                'print(f"  d (mid→center) : {d:.4f}")',
                'print()',
                'print("Sign of R selects which side of the chord the center lies on:")',
                'print("  R > 0  →  short arc (<180°)  →  center on the left of the chord direction")',
                'print("  R < 0  →  long  arc (>180°)  →  center on the right of the chord direction")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 3: ArcSegment dataclass + arc_from_ij ──────────────────────────
            {
              id: 3,
              cellTitle: 'ArcSegment dataclass and arc_from_ij',
              prose:
                'The **ArcSegment** dataclass is the canonical internal representation of an arc. ' +
                'All incoming G-code arc blocks — whether they use IJ or R notation — are immediately ' +
                'converted to ArcSegment before any further processing. This isolates the parsing logic ' +
                'from the geometry logic.\n\n' +
                '**arc_from_ij** builds an ArcSegment from the IJ representation. ' +
                'It validates that the computed radius from the start point matches the radius from the end point ' +
                '(within 1% + 0.001 mm tolerance) to catch malformed G-code.',
              code: [
                'from typing import List, Tuple',
                '',
                'TWO_PI = 2 * math.pi',
                '',
                '@dataclass',
                'class ArcSegment:',
                '    """Full description of an arc in the XY plane (or helix if start_z != end_z)."""',
                '    start_x: float',
                '    start_y: float',
                '    end_x: float',
                '    end_y: float',
                '    cx: float        # Center X',
                '    cy: float        # Center Y',
                '    radius: float    # Always positive',
                '    clockwise: bool  # True = G2 (CW), False = G3 (CCW)',
                '    start_z: float = 0.0',
                '    end_z: float   = 0.0  # For helical arcs (Z changes linearly along arc)',
                '',
                '',
                'def arc_from_ij(sx, sy, ex, ey, i, j, clockwise, sz=0.0, ez=0.0) -> ArcSegment:',
                '    """Build ArcSegment from G2/G3 I/J representation. Center = (sx+I, sy+J)."""',
                '    cx = sx + i',
                '    cy = sy + j',
                '    r       = math.hypot(cx - sx, cy - sy)',
                '    r_end   = math.hypot(cx - ex, cy - ey)',
                '    if abs(r - r_end) > r * 0.01 + 0.001:',
                '        raise ValueError(f"Arc not circular: r_start={r:.6f}, r_end={r_end:.6f}")',
                '    return ArcSegment(sx, sy, ex, ey, cx, cy, r, clockwise, sz, ez)',
                '',
                '',
                '# Build the quarter arc from lesson 2: G3 X0 Y10 I-10 J0 starting at (10,0)',
                'arc = arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=False)',
                'print("Quarter CCW arc: G3 X0 Y10 I-10 J0  (start at (10,0))")',
                'print(f"  Start   : ({arc.start_x}, {arc.start_y})")',
                'print(f"  End     : ({arc.end_x}, {arc.end_y})")',
                'print(f"  Center  : ({arc.cx}, {arc.cy})")',
                'print(f"  Radius  : {arc.radius}")',
                'print(f"  CW?     : {arc.clockwise}  (False = G3 CCW)")',
                '',
                '# Full circle: start == end',
                'arc_full = arc_from_ij(10, 0, 10, 0, i=-10, j=0, clockwise=False)',
                'print()',
                'print("Full CCW circle: G3 X10 Y0 I-10 J0  (start == end)")',
                'print(f"  Radius  : {arc_full.radius}")',
                'print(f"  Start==End: ({arc_full.start_x},{arc_full.start_y}) == ({arc_full.end_x},{arc_full.end_y})")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 4: Fill-in challenge — arc_from_ij for a real G-code block ──────
            {
              id: 4,
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Build an arc from IJ notation',
              difficulty: 'easy',
              cellTitle: 'Challenge 1 — Build an arc from IJ notation',
              prose:
                'A G-code program issues: **G3 X0 Y10 I-10 J0** while the tool is at **(10, 0)**.\n\n' +
                'Use `arc_from_ij` to build the ArcSegment for this block. ' +
                'Then verify the center is at the origin (0, 0) and the radius is 10.',
              prompt: 'Fill in the arc_from_ij call. Start is (10, 0), end is (0, 10), I=-10, J=0, CCW (G3).',
              starterBlock: [
                '# G3 X0 Y10 I-10 J0, tool currently at (10, 0)',
                'arc = arc_from_ij(',
                '    sx=___, sy=___,   # start point (current tool position)',
                '    ex=___, ey=___,   # end point (X, Y from the G-code block)',
                '    i=___,  j=___,    # offsets to center',
                '    clockwise=___     # G3 = CCW',
                ')',
                '',
                'print(f"Center  : ({arc.cx}, {arc.cy})")',
                'print(f"Radius  : {arc.radius}")',
                'print(f"CW?     : {arc.clockwise}")',
              ].join('\n'),
              code: [
                '# Fill in the arc_from_ij call above, then run.',
              ].join('\n'),
              testCode: [
                'assert "arc" in dir(), "arc not defined"',
                'assert isinstance(arc, ArcSegment), "arc must be an ArcSegment"',
                'assert math.isclose(arc.start_x, 10.0, abs_tol=1e-9), f"start_x should be 10, got {arc.start_x}"',
                'assert math.isclose(arc.start_y,  0.0, abs_tol=1e-9), f"start_y should be 0, got {arc.start_y}"',
                'assert math.isclose(arc.end_x,    0.0, abs_tol=1e-9), f"end_x should be 0, got {arc.end_x}"',
                'assert math.isclose(arc.end_y,   10.0, abs_tol=1e-9), f"end_y should be 10, got {arc.end_y}"',
                'assert math.isclose(arc.cx,       0.0, abs_tol=1e-9), f"cx should be 0.0, got {arc.cx}"',
                'assert math.isclose(arc.cy,       0.0, abs_tol=1e-9), f"cy should be 0.0, got {arc.cy}"',
                'assert math.isclose(arc.radius,  10.0, abs_tol=1e-9), f"radius should be 10.0, got {arc.radius}"',
                'assert arc.clockwise == False, f"G3 is CCW (clockwise=False), got {arc.clockwise}"',
                '"SUCCESS: ArcSegment built correctly — center (0,0), radius 10, CCW."',
              ].join('\n'),
              hint: 'sx=10, sy=0 (the start position), ex=0, ey=10 (from X0 Y10 in the block), i=-10, j=0 (the I J offsets), clockwise=False (G3 = CCW).',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 5: arc_from_r — R notation ─────────────────────────────────────
            {
              id: 5,
              cellTitle: 'arc_from_r — building an arc from radius notation',
              prose:
                'The R representation is more compact but requires geometric work: ' +
                'given two points and a radius, find the center.\n\n' +
                'The algorithm: (1) find the midpoint of the chord, (2) find the perpendicular direction, ' +
                '(3) use Pythagoras to find the distance from the midpoint to the center, ' +
                '(4) step that distance along the perpendicular — choosing the side based on the sign of R ' +
                'and the arc direction.',
              code: [
                'def arc_from_r(sx, sy, ex, ey, r_signed, clockwise, sz=0.0, ez=0.0) -> ArcSegment:',
                '    """Build ArcSegment from G2/G3 R representation. Sign of R selects short/long arc."""',
                '    r        = abs(r_signed)',
                '    long_arc = r_signed < 0',
                '    mx       = (sx + ex) / 2',
                '    my       = (sy + ey) / 2',
                '    half_chord = math.hypot(ex - sx, ey - sy) / 2',
                '    if half_chord > r + 1e-9:',
                '        raise ValueError(f"R={r} too small for chord {2*half_chord:.6f}")',
                '    if half_chord < 1e-12:',
                '        raise ValueError("Start and end points are the same — use IJ notation for full circles")',
                '    d = math.sqrt(max(0.0, r*r - half_chord*half_chord))',
                '    cdx = ex - sx',
                '    cdy = ey - sy',
                '    perp_x = -cdy / (2 * half_chord)',
                '    perp_y =  cdx / (2 * half_chord)',
                '    if (not clockwise) ^ long_arc:',
                '        cx = mx + d * perp_x',
                '        cy = my + d * perp_y',
                '    else:',
                '        cx = mx - d * perp_x',
                '        cy = my - d * perp_y',
                '    return ArcSegment(sx, sy, ex, ey, cx, cy, r, clockwise, sz, ez)',
                '',
                '',
                '# Verify: same quarter arc as before, now via R',
                '# G3 X0 Y10 R10  (start at (10,0))',
                'arc_r = arc_from_r(10, 0, 0, 10, r_signed=10, clockwise=False)',
                'print("Quarter CCW arc via R notation: G3 X0 Y10 R10  (start at (10,0))")',
                'print(f"  Center  : ({arc_r.cx:.6f}, {arc_r.cy:.6f})  (expected: (0, 0))")',
                'print(f"  Radius  : {arc_r.radius:.6f}          (expected: 10.0)")',
                '',
                '# Long arc (R negative): same endpoints, goes the long way around',
                'arc_long = arc_from_r(10, 0, 0, 10, r_signed=-10, clockwise=False)',
                'print()',
                'print("Long CCW arc: G3 X0 Y10 R-10  (start at (10,0))")',
                'print(f"  Center  : ({arc_long.cx:.6f}, {arc_long.cy:.6f})")',
                'print(f"  Note: different center — the arc goes the long way around (270°)")',
                '',
                '# Verify IJ and R give the same result for the short arc',
                'arc_ij = arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=False)',
                'print()',
                'same_cx = math.isclose(arc_r.cx, arc_ij.cx, abs_tol=1e-6)',
                'same_cy = math.isclose(arc_r.cy, arc_ij.cy, abs_tol=1e-6)',
                'print(f"IJ and R give same center: cx match={same_cx}, cy match={same_cy}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 6: arc_angles — angular span, full-circle detection ────────────
            {
              id: 6,
              cellTitle: 'arc_angles — start angle, end angle, and angular span',
              prose:
                'Once we have the arc center, we can compute the angles using atan2. ' +
                'The **angular span** is the total angle swept — always positive, in (0, 2π].\n\n' +
                'The key subtlety: for CW arcs (G2), the angle *decreases*, so span = (start − end) mod 2π. ' +
                'For CCW arcs (G3), angle *increases*, so span = (end − start) mod 2π. ' +
                'The modulo ensures we always get a value in [0, 2π). ' +
                'But if the result is near 0 (start == end, full circle), we force it to 2π.',
              code: [
                'def arc_angles(arc: ArcSegment):',
                '    """Returns (start_angle, end_angle, angular_span) in radians.',
                '    Span is always positive in (0, 2π].  Full circle if start==end."""',
                '    start_angle = math.atan2(arc.start_y - arc.cy, arc.start_x - arc.cx)',
                '    end_angle   = math.atan2(arc.end_y   - arc.cy, arc.end_x   - arc.cx)',
                '    if arc.clockwise:',
                '        span = (start_angle - end_angle) % TWO_PI',
                '    else:',
                '        span = (end_angle - start_angle) % TWO_PI',
                '    if span < 1e-9:',
                '        span = TWO_PI   # full circle: start == end',
                '    return start_angle, end_angle, span',
                '',
                '',
                '# Quarter CCW arc (10,0) → (0,10) center (0,0)',
                'arc_q = arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=False)',
                'sa, ea, span = arc_angles(arc_q)',
                'print("Quarter CCW arc (10,0) → (0,10):")',
                'print(f"  Start angle : {math.degrees(sa):.2f}°  (expected: 0°)")',
                'print(f"  End angle   : {math.degrees(ea):.2f}°  (expected: 90°)")',
                'print(f"  Span        : {math.degrees(span):.2f}°  (expected: 90°)")',
                '',
                '# Full circle: same start and end',
                'arc_full = arc_from_ij(10, 0, 10, 0, i=-10, j=0, clockwise=False)',
                'sa_f, ea_f, span_f = arc_angles(arc_full)',
                'print()',
                'print("Full circle (10,0) → (10,0):")',
                'print(f"  Start angle : {math.degrees(sa_f):.2f}°")',
                'print(f"  End angle   : {math.degrees(ea_f):.2f}°")',
                'print(f"  Span        : {math.degrees(span_f):.2f}°  (expected: 360° — not 0!)")',
                '',
                '# Half circle CW: (10,0) → (-10,0) center (0,0)',
                'arc_half_cw = arc_from_ij(10, 0, -10, 0, i=-10, j=0, clockwise=True)',
                'sa_h, ea_h, span_h = arc_angles(arc_half_cw)',
                'print()',
                'print("Half CW arc (10,0) → (-10,0):")',
                'print(f"  Span        : {math.degrees(span_h):.2f}°  (expected: 180°)")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 7: arc_to_polyline and arc_length ───────────────────────────────
            {
              id: 7,
              cellTitle: 'arc_to_polyline and arc_length — sampling and exact length',
              prose:
                '**arc_to_polyline** converts the arc into a list of (x, y, z) tuples by sampling at ' +
                'evenly-spaced angular intervals. The start and end points are forced to exact values ' +
                'at the end to prevent floating-point drift from corrupting the tool path.\n\n' +
                '**arc_length** computes the exact length of the arc. For a flat arc, this is r * span. ' +
                'For a helical arc, the formula uses the Pythagorean theorem: hypot(r * span, dz).',
              code: [
                'def arc_to_polyline(arc: ArcSegment, num_segments: int = 64) -> List[Tuple[float, float, float]]:',
                '    """Approximate arc as num_segments line segments.',
                '    Returns list of (x, y, z) tuples. Forces exact start/end."""',
                '    start_angle, _, span = arc_angles(arc)',
                '    points = []',
                '    for i in range(num_segments + 1):',
                '        t = i / num_segments',
                '        if arc.clockwise:',
                '            angle = start_angle - span * t',
                '        else:',
                '            angle = start_angle + span * t',
                '        x = arc.cx + arc.radius * math.cos(angle)',
                '        y = arc.cy + arc.radius * math.sin(angle)',
                '        z = arc.start_z + (arc.end_z - arc.start_z) * t',
                '        points.append((x, y, z))',
                '    points[0]  = (arc.start_x, arc.start_y, arc.start_z)',
                '    points[-1] = (arc.end_x,   arc.end_y,   arc.end_z)',
                '    return points',
                '',
                '',
                'def arc_length(arc: ArcSegment) -> float:',
                '    """Exact arc length = r * span (helix-aware via hypot with dz)."""',
                '    _, _, span = arc_angles(arc)',
                '    xy_length = arc.radius * span',
                '    dz = arc.end_z - arc.start_z',
                '    return math.hypot(xy_length, dz)',
                '',
                '',
                '# Quarter arc polyline — spot-check a few points',
                'arc_q = arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=False)',
                'pts = arc_to_polyline(arc_q, num_segments=4)',
                'print("Quarter CCW arc sampled into 4 segments (5 points):")',
                'for i, p in enumerate(pts):',
                '    print(f"  [{i}] ({p[0]:.4f}, {p[1]:.4f}, {p[2]:.4f})")',
                '',
                '# Arc length checks',
                'arc_full = arc_from_ij(10, 0, 10, 0, i=-10, j=0, clockwise=False)',
                'print()',
                'print(f"Full circle length : {arc_length(arc_full):.6f}  (expected: {2*math.pi*10:.6f})")',
                'print(f"Quarter arc length : {arc_length(arc_q):.6f}  (expected: {math.pi*10/2:.6f})")',
                '',
                '# Helical arc: same XY quarter arc, Z goes from 0 to 5',
                'arc_helix = arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=False, sz=0.0, ez=5.0)',
                'xy_len = arc_length(arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=False))',
                'helix_len = arc_length(arc_helix)',
                'print()',
                'print(f"Helical arc (dz=5): {helix_len:.6f}")',
                'print(f"  = hypot({xy_len:.4f}, 5.0) = {math.hypot(xy_len, 5.0):.6f}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 8: Write challenge — arc_midpoint ───────────────────────────────
            {
              id: 8,
              challengeType: 'write',
              challengeNumber: 2,
              challengeTitle: 'Implement arc_midpoint(arc)',
              difficulty: 'medium',
              cellTitle: 'Challenge 2 — Implement arc_midpoint(arc)',
              prose:
                'The **midpoint of an arc** is the point at parameter t=0.5 — the exact halfway point ' +
                'along the angular sweep.\n\n' +
                'To find it: compute the start angle and the angular span using `arc_angles()`, ' +
                'then step half the span in the correct direction (subtract span/2 for CW, add span/2 for CCW). ' +
                'The point is at `(cx + r*cos(mid_angle), cy + r*sin(mid_angle))`.\n\n' +
                'Do **not** use `arc_to_polyline` — compute the midpoint directly from the angle formula.',
              prompt: 'Write arc_midpoint(arc) → (x, y). Use arc_angles() and the trig formula. Handle both CW and CCW.',
              code: [
                '# Write arc_midpoint(arc) here.',
                '# It should return (x, y) — the exact point at the angular midpoint.',
                '# Steps:',
                '#   1. Get start_angle and span from arc_angles(arc)',
                '#   2. mid_angle = start_angle - span/2  (CW) or start_angle + span/2  (CCW)',
                '#   3. x = arc.cx + arc.radius * cos(mid_angle)',
                '#   4. y = arc.cy + arc.radius * sin(mid_angle)',
                '',
                '# def arc_midpoint(arc: ArcSegment) -> tuple:',
                '#     ...',
              ].join('\n'),
              testCode: [
                'assert "arc_midpoint" in dir(), "arc_midpoint not defined"',
                '',
                '# Quarter CCW arc (10,0) → (0,10) center (0,0) radius 10',
                '# Midpoint should be at 45°: (10*cos45, 10*sin45) = (√2/2 * 10, √2/2 * 10)',
                'arc_q = arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=False)',
                'mx, my = arc_midpoint(arc_q)',
                'expected_x = 10 * math.cos(math.pi / 4)',
                'expected_y = 10 * math.sin(math.pi / 4)',
                'assert math.isclose(mx, expected_x, abs_tol=1e-6), f"midpoint x: expected {expected_x:.6f}, got {mx:.6f}"',
                'assert math.isclose(my, expected_y, abs_tol=1e-6), f"midpoint y: expected {expected_y:.6f}, got {my:.6f}"',
                '',
                '# Half CW arc (10,0) → (-10,0) center (0,0) — midpoint should be (0, -10)',
                'arc_half_cw = arc_from_ij(10, 0, -10, 0, i=-10, j=0, clockwise=True)',
                'mx2, my2 = arc_midpoint(arc_half_cw)',
                'assert math.isclose(mx2,  0.0, abs_tol=1e-6), f"CW half arc midpoint x: expected 0, got {mx2:.6f}"',
                'assert math.isclose(my2, -10.0, abs_tol=1e-6), f"CW half arc midpoint y: expected -10, got {my2:.6f}"',
                '',
                '# Midpoint must lie on the circle: distance from center == radius',
                'arc_test = arc_from_ij(5, 0, 0, 5, i=-5, j=0, clockwise=False)',
                'mx3, my3 = arc_midpoint(arc_test)',
                'dist = math.hypot(mx3 - arc_test.cx, my3 - arc_test.cy)',
                'assert math.isclose(dist, arc_test.radius, abs_tol=1e-6), f"Midpoint must be on the circle, dist={dist:.6f} != r={arc_test.radius}"',
                '',
                '"SUCCESS: arc_midpoint returns the exact angular midpoint on the arc."',
              ].join('\n'),
              hint: 'Get start_angle and span from arc_angles(arc). For CW: mid_angle = start_angle - span/2. For CCW: mid_angle = start_angle + span/2. Then x = arc.cx + arc.radius * math.cos(mid_angle), y = arc.cy + arc.radius * math.sin(mid_angle). Return (x, y).',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 9: The CW/CCW trap ──────────────────────────────────────────────
            {
              id: 9,
              cellTitle: 'The CW/CCW trap — G2/G3, math coords, and screen coords',
              prose:
                'G2 and G3 follow the **machinist convention**: clockwise and counter-clockwise ' +
                'as seen from above the part, with Z pointing up. ' +
                'This matches the **right-handed math coordinate system** (Y points up).\n\n' +
                'But most 2D graphics systems — HTML Canvas, SVG, pygame — use **screen coordinates** ' +
                'where Y points *down*. In this flipped system, what is drawn as clockwise ' +
                'is actually counter-clockwise in G-code terms. The interpreter stores arcs in math convention. ' +
                'The renderer must flip the direction when drawing.',
              code: [
                '# Demonstrate: G3 X0 Y10 I-10 J0 from (10,0) is CCW in math coords',
                '# (positive angles increase counter-clockwise)',
                '',
                'arc_ccw = arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=False)',
                'sa, ea, span = arc_angles(arc_ccw)',
                '',
                'print("G3 arc (CCW in G-code / math coords):")',
                'print(f"  Start angle: {math.degrees(sa):.1f}°  →  End angle: {math.degrees(ea):.1f}°")',
                'print(f"  Span: {math.degrees(span):.1f}°  in the CCW (positive) direction")',
                'print()',
                '',
                '# The same arc as G2 would go the OTHER way (270° CW instead of 90° CCW)',
                'arc_cw = arc_from_ij(10, 0, 0, 10, i=-10, j=0, clockwise=True)',
                'sa2, ea2, span2 = arc_angles(arc_cw)',
                'print("Same endpoints but G2 (CW) — goes the long way around:")',
                'print(f"  Span: {math.degrees(span2):.1f}°  in the CW (negative angle) direction")',
                'print()',
                '',
                '# The screen-coords flip',
                'print("=== CW/CCW convention summary ===")',
                'print("  Math coords (Y-up, right-handed):  G3=CCW = angle increases")',
                'print("  Screen coords (Y-down):             G3=CCW draws as CW on screen")',
                'print()',
                'print("  Our interpreter: stores clockwise=True for G2, clockwise=False for G3.")',
                'print("  Renderer rule: if drawing with Y-down, flip: draw_ccw = arc.clockwise")',
                'print()',
                '',
                '# Verification: polyline of CCW arc should go from angle 0° toward 90°',
                'pts = arc_to_polyline(arc_ccw, num_segments=4)',
                'angles_deg = [math.degrees(math.atan2(p[1], p[0])) for p in pts]',
                'print("CCW polyline sample angles (should increase from 0° to 90°):")',
                'print(f"  {[f\"{a:.1f}\" for a in angles_deg]}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 10: Fill-in challenge — G2 arc, clockwise ──────────────────────
            {
              id: 10,
              challengeType: 'fill-in',
              challengeNumber: 3,
              challengeTitle: 'Build a G2 (clockwise) arc and verify it',
              difficulty: 'medium',
              cellTitle: 'Challenge 3 — Build a G2 arc from IJ and verify clockwise',
              prose:
                'A G-code program issues: **G2 X5 Y0 I-5 J0** while the tool is at **(5, 5)**.\n\n' +
                'This is a **clockwise arc**. Build the ArcSegment with `arc_from_ij`, then:\n' +
                '1. Confirm `arc.clockwise == True`\n' +
                '2. Confirm the angular span is exactly **90°** (π/2 radians)\n' +
                '3. Confirm all polyline points lie on the circle (distance from center == radius)',
              prompt: 'Fill in the arc_from_ij call. Start=(5,5), End=(5,0), I=-5, J=0 — wait, I and J offset to the center from the start. Center = start + (I,J). Work out I and J first.',
              starterBlock: [
                '# G2 X5 Y0 I-5 J0, tool currently at (5, 5)',
                '# Center = start + (I, J) = (5,5) + (I,J)',
                '# End point from block: X=5, Y=0  →  end = (5, 0)',
                '# What I,J puts the center equidistant from start (5,5) and end (5,0)?',
                '# Hint: a center at (0,5) is radius=5 from (5,5) and radius=5 from (5,0)',
                '# So I = center_x - start_x = 0 - 5 = -5',
                '#    J = center_y - start_y = 5 - 5 = 0',
                '',
                'arc = arc_from_ij(',
                '    sx=___, sy=___,  # start point',
                '    ex=___, ey=___,  # end point (X5 Y0 from block)',
                '    i=___,  j=___,   # offsets to center',
                '    clockwise=___    # G2 = CW',
                ')',
                '',
                'print(f"Center  : ({arc.cx}, {arc.cy})")',
                'print(f"Radius  : {arc.radius}")',
                'print(f"CW?     : {arc.clockwise}")',
              ].join('\n'),
              code: [
                '# Fill in the arc_from_ij call above, then run.',
              ].join('\n'),
              testCode: [
                'assert "arc" in dir(), "arc not defined"',
                'assert isinstance(arc, ArcSegment), "arc must be an ArcSegment"',
                'assert math.isclose(arc.start_x,  5.0, abs_tol=1e-9), f"start_x should be 5, got {arc.start_x}"',
                'assert math.isclose(arc.start_y,  5.0, abs_tol=1e-9), f"start_y should be 5, got {arc.start_y}"',
                'assert math.isclose(arc.end_x,    5.0, abs_tol=1e-9), f"end_x should be 5, got {arc.end_x}"',
                'assert math.isclose(arc.end_y,    0.0, abs_tol=1e-9), f"end_y should be 0, got {arc.end_y}"',
                'assert math.isclose(arc.cx,       0.0, abs_tol=1e-6), f"cx should be 0.0, got {arc.cx}"',
                'assert math.isclose(arc.cy,       5.0, abs_tol=1e-6), f"cy should be 5.0, got {arc.cy}"',
                'assert math.isclose(arc.radius,   5.0, abs_tol=1e-9), f"radius should be 5.0, got {arc.radius}"',
                'assert arc.clockwise == True, f"G2 is CW (clockwise=True), got {arc.clockwise}"',
                '',
                '# Verify span is 90°',
                '_, _, span = arc_angles(arc)',
                'assert math.isclose(span, math.pi / 2, abs_tol=1e-6), f"Span should be 90° (pi/2), got {math.degrees(span):.4f}°"',
                '',
                '# Verify all polyline points lie on the circle',
                'pts = arc_to_polyline(arc, num_segments=8)',
                'for i, p in enumerate(pts):',
                '    d = math.hypot(p[0] - arc.cx, p[1] - arc.cy)',
                '    assert math.isclose(d, arc.radius, abs_tol=1e-4), f"Point {i} at dist {d:.6f} != radius {arc.radius}"',
                '',
                '"SUCCESS: G2 arc built correctly — CW, 90° span, center (0,5), all points on circle."',
              ].join('\n'),
              hint: 'sx=5, sy=5 (start). ex=5, ey=0 (end from X5 Y0). Center must be equidistant from both — try (0, 5). I = center_x - start_x = 0-5 = -5. J = center_y - start_y = 5-5 = 0. clockwise=True for G2.',
              output: '', status: 'idle', figureJson: null,
            },

          ],
        },
      },
    ],
  },

  math: {
    prose: [
      'The **parametric line segment** from $A$ to $B$:',

      '$$P(t) = A + t(B - A), \\quad t \\in [0, 1]$$',

      'This is equivalent to linear interpolation: $\\text{lerp}(A, B, t) = (1-t)A + tB$.',

      'Given an arc with center $C = (c_x, c_y)$ and radius $r$, the **start and end angles** are:',

      '$$\\theta_s = \\text{atan2}(s_y - c_y,\\; s_x - c_x), \\quad \\theta_e = \\text{atan2}(e_y - c_y,\\; e_x - c_x)$$',

      'The **angular span** (always positive):',

      '$$\\Delta\\theta = \\begin{cases} (\\theta_s - \\theta_e) \\bmod 2\\pi & \\text{CW (G2)} \\\\ (\\theta_e - \\theta_s) \\bmod 2\\pi & \\text{CCW (G3)} \\end{cases}$$',

      'If $\\Delta\\theta < 10^{-9}$ and start $=$ end, force $\\Delta\\theta = 2\\pi$ (full circle).',

      'A point at parameter $t \\in [0,1]$ along the arc sweep:',

      '$$x(t) = c_x + r\\cos(\\theta_s \\pm \\Delta\\theta \\cdot t), \\quad y(t) = c_y + r\\sin(\\theta_s \\pm \\Delta\\theta \\cdot t)$$',

      'where $-$ is for CW and $+$ is for CCW.',

      'The **flat arc length** is $L_{xy} = r \\cdot \\Delta\\theta$. For a **helical arc** with $\\Delta z = e_z - s_z$:',

      '$$L = \\sqrt{L_{xy}^2 + \\Delta z^2}$$',

      'The **R-form center construction** uses the perpendicular bisector of the chord $(S, E)$. ' +
      'Let $M$ be the chord midpoint and $h$ the half-chord length $= |SE|/2$. ' +
      'The distance from $M$ to the center is:',

      '$$d = \\sqrt{r^2 - h^2}$$',

      'The perpendicular unit vector to the chord is $\\hat{n} = (-\\Delta y, \\Delta x) / |SE|$. ' +
      'The center lies at $M \\pm d\\hat{n}$, with the sign determined by the combination of $\\text{sign}(R)$ and arc direction.',

      'For a given chord error tolerance $\\varepsilon$, the minimum number of polyline segments is:',

      '$$n \\geq \\frac{\\pi}{\\arccos\\!\\left(1 - \\dfrac{\\varepsilon}{r}\\right)}$$',
    ],
  },

  rigor: {
    prose: [
      '**Why 1% + 0.001 mm tolerance for IJ validation?** When the G-code file was generated by CAM software, ' +
      'the I/J values are typically rounded to 3–4 decimal places. For large-radius arcs this rounding ' +
      'can cause the radius computed from the start point to differ from the radius computed from the end point ' +
      'by several microns. A fixed absolute tolerance (like 0.001 mm) is too tight for large arcs; ' +
      'a pure relative tolerance (1%) is too loose for tiny arcs. The combined tolerance `r * 0.01 + 0.001` ' +
      'scales correctly across the entire range of CNC arc sizes.',

      '**Why force span = 2π when start == end?** `atan2` returns the same value for both points, ' +
      'so the naive difference is exactly 0. A span of 0 would produce a single point, not a full circle. ' +
      'The correct interpretation is always "a full circle was intended" because any other interpretation ' +
      '(zero-length arc) would be meaningless G-code. The check `if span < 1e-9: span = TWO_PI` catches ' +
      'both the exact-equality case and near-equality cases caused by floating-point rounding of the start/end coordinates.',

      '**Why `max(0.0, r*r - half_chord*half_chord)` inside the sqrt in arc_from_r?** ' +
      'If `half_chord` equals `r` within floating-point precision, the subtraction can produce a tiny ' +
      'negative number (e.g., -1e-28) due to rounding. Taking the square root of a negative number raises ' +
      'a ValueError. The `max(0.0, ...)` clamp prevents this for the valid case where half_chord ≈ r ' +
      '(a 180° arc). The explicit guard `if half_chord > r + 1e-9: raise ValueError` catches the truly invalid case.',

      '**Why force points[0] and points[-1] in arc_to_polyline?** ' +
      'For a 360° arc sampled at 64 segments, the final angle is start_angle + 2π. Due to floating-point ' +
      'accumulation in `span * t`, the last computed point may differ from the true end point by a small ' +
      'amount — often 1e-14 mm, but occasionally more for arcs with large radii or many segments. ' +
      'Toolpath chaining requires exact point equality between the end of one segment and the start of the next. ' +
      'Forcing the exact values eliminates this class of bug entirely.',

      '**Why does arc_length use math.hypot(xy_length, dz)?** A helical arc, when unrolled flat, ' +
      'becomes a straight line of length xy_length horizontally and dz vertically. ' +
      'The true distance along the helix is the hypotenuse. This is the correct arc length for feed-rate ' +
      'control: the CNC controller must move the tool at a constant spatial speed, so it needs the ' +
      'true 3D path length, not just the XY arc length.',
    ],
  },

  examples: [
    {
      id: 'ex-ij-quarter-arc',
      title: 'Decoding G3 X0 Y10 I-10 J0 from start (10, 0)',
      problem:
        'A G-code block reads: G3 X0 Y10 I-10 J0. The tool is currently at (10, 0). ' +
        'Find the arc center, radius, angular span, and arc length.',
      steps: [
        {
          expression: 'Center = start + (I, J)',
          annotation: '(10, 0) + (−10, 0) = (0, 0). The center is at the origin.',
        },
        {
          expression: 'radius = hypot(center − start)',
          annotation: 'hypot(0−10, 0−0) = hypot(−10, 0) = 10. Verify from end: hypot(0−0, 0−10) = 10. Match.',
        },
        {
          expression: 'start_angle = atan2(start_y − cy, start_x − cx)',
          annotation: 'atan2(0−0, 10−0) = atan2(0, 10) = 0 radians = 0°.',
        },
        {
          expression: 'end_angle = atan2(end_y − cy, end_x − cx)',
          annotation: 'atan2(10−0, 0−0) = atan2(10, 0) = π/2 radians = 90°.',
        },
        {
          expression: 'span (CCW) = (end_angle − start_angle) mod 2π',
          annotation: '(π/2 − 0) mod 2π = π/2. This is 90°, which confirms a quarter arc.',
        },
        {
          expression: 'arc_length = radius × span',
          annotation: '10 × π/2 ≈ 15.708 mm. This is one quarter of the circumference 2π·10 ≈ 62.832.',
        },
      ],
      conclusion:
        'G3 X0 Y10 I-10 J0 from (10,0) is a CCW quarter-circle of radius 10, center at the origin, ' +
        'sweeping 90° from 0° to 90°, with arc length π·10/2 ≈ 15.708 mm.',
    },
    {
      id: 'ex-r-notation',
      title: 'Choosing the right arc center from R notation: R10 vs R-10',
      problem:
        'Two G-code blocks use the same start (10, 0), end (0, 10), and direction (G3 CCW): ' +
        'one uses R10, the other uses R-10. What is the difference?',
      steps: [
        {
          expression: 'Chord midpoint M',
          annotation: '((10+0)/2, (0+10)/2) = (5, 5).',
        },
        {
          expression: 'half_chord = |end − start| / 2',
          annotation: 'hypot(0−10, 10−0) / 2 = hypot(−10, 10) / 2 = 14.142 / 2 = 7.071.',
        },
        {
          expression: 'd = sqrt(R² − half_chord²)',
          annotation: 'sqrt(100 − 50) = sqrt(50) = 7.071. This is the distance from M to either possible center.',
        },
        {
          expression: 'R10 (positive) → short arc',
          annotation: 'Center is placed on the side that creates an arc less than 180°. Result: cx ≈ 0, cy ≈ 0.',
        },
        {
          expression: 'R-10 (negative) → long arc',
          annotation: 'Center is placed on the opposite side, creating an arc greater than 180° (270° in this case).',
        },
      ],
      conclusion:
        'R positive and R negative are not errors — they select two geometrically valid arcs. ' +
        'The CAM system chooses the sign to get the arc the machinist intended. ' +
        'The interpreter must respect the sign; ignoring it produces arcs that go the wrong way.',
    },
  ],

  quiz: [
    {
      id: 'gcp-05-q1',
      type: 'choice',
      text: 'P(t) = A + t·(B − A). What is P(0.25)?',
      options: [
        'A point one-quarter of the way from A to B',
        'A point one-quarter of the way from B to A',
        'The midpoint of A and B',
        'A point 25 units past B',
      ],
      correct: 0,
    },
    {
      id: 'gcp-05-q2',
      type: 'choice',
      text: 'A G-code block reads: G3 X20 Y0 I-10 J0. The tool is at (10, 0). Where is the arc center?',
      options: [
        '(−10, 0)',
        '(0, 0)',
        '(20, 0)',
        '(10, 10)',
      ],
      correct: 1,
    },
    {
      id: 'gcp-05-q3',
      type: 'choice',
      text: 'A G-code arc uses R notation with R = −15. What does the negative sign mean?',
      options: [
        'The arc goes clockwise regardless of G2/G3',
        'The arc is longer than a semicircle (greater than 180°)',
        'The arc is shorter than a semicircle (less than 180°)',
        'The radius is measured from the end point, not the start',
      ],
      correct: 1,
    },
    {
      id: 'gcp-05-q4',
      type: 'choice',
      text: 'A full-circle arc has the same start and end point. What is its angular span?',
      options: [
        '0 radians, because the angles are identical',
        'π radians (180°)',
        '2π radians (360°)',
        'It depends on the radius',
      ],
      correct: 2,
    },
    {
      id: 'gcp-05-q5',
      type: 'choice',
      text: 'arc_to_polyline forces points[0] and points[-1] to the exact start and end values. Why?',
      options: [
        'To reduce memory usage',
        'To prevent floating-point drift from breaking toolpath chaining at segment boundaries',
        'Because atan2 can return negative values',
        'To handle helical arcs correctly',
      ],
      correct: 1,
    },
    {
      id: 'gcp-05-q6',
      type: 'choice',
      text: 'G2 is defined as clockwise as viewed from above (+Z looking down). In a screen coordinate system where Y points down, how does a G2 arc appear?',
      options: [
        'It still appears clockwise — screen coordinates do not affect arc direction',
        'It appears counter-clockwise because Y is flipped',
        'It appears as a straight line',
        'It depends on the radius',
      ],
      correct: 1,
    },
    {
      id: 'gcp-05-q7',
      type: 'choice',
      text: 'An arc has radius 10, angular span π/2, and a Z change of 5 mm (helical). What is its true length?',
      options: [
        '10 × π/2 ≈ 15.708 mm',
        'sqrt((10 × π/2)² + 5²) ≈ 16.484 mm',
        '10 × π/2 + 5 ≈ 20.708 mm',
        '5 mm, because Z dominates',
      ],
      correct: 1,
    },
    {
      id: 'gcp-05-q8',
      type: 'choice',
      text: 'For a CCW arc (G3), the angular span is computed as (end_angle − start_angle) mod 2π. Why mod 2π?',
      options: [
        'To convert from degrees to radians',
        'To ensure the span is always positive even when end_angle < start_angle',
        'To detect full circles',
        'To handle the IJ tolerance check',
      ],
      correct: 1,
    },
  ],

  mentalModel: [
    'Parametric line: P(t) = A + t*(B-A). t=0 at A, t=1 at B, t=0.5 at midpoint. Same as lerp.',
    'IJ form: center = start + (I, J). Direct. Always validate r_start ≈ r_end within tolerance.',
    'R form: center computed from perpendicular bisector. R positive = short arc, R negative = long arc.',
    'Angular span: always positive (0, 2π]. Use mod 2π. Full circle trap: span=0 → force to 2π.',
    'G2 = clockwise (angle decreases). G3 = CCW (angle increases). Both in math convention (Y-up).',
    'Screen coords have Y-down: G3 (CCW in G-code) draws as CW on screen. Renderer must flip.',
    'arc_to_polyline: sample at evenly-spaced angles, force exact start/end to prevent drift.',
    'Helical arc length = hypot(r * span, dz). Not just r * span — the Z travel adds real distance.',
  ],

  checkpoints: ['read-intuition'],
}
