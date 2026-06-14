export default {
  id: 'gcp-01-coordinate-frames',
  slug: 'coordinate-frames',
  order: 1,
  title: 'Coordinate Systems & Frames',
  subtitle: 'Three number systems that coexist in every G-code machine — and how to implement them in Python',
  tags: [
    'coordinate systems', 'frames', 'MCS', 'WCS', 'world frame',
    'G54', 'work offset', 'dataclass', 'enum', 'right-hand rule',
    'Python', 'G-code parser', 'CNC', 'transform pipeline',
  ],

  semantics: {
    core: [
      {
        symbol: 'Coordinate System',
        meaning:
          'A rule for assigning numbers to points in space. Every coordinate system needs three things: ' +
          'an origin (the zero point), a set of axes (perpendicular directions with a scale), and a ' +
          'handedness (which way the axes are oriented relative to each other).',
      },
      {
        symbol: 'Machine Coordinate System (MCS)',
        meaning:
          'The fixed frame whose origin is the machine\'s physical home position, defined by hardware limit switches. ' +
          'It never changes — it is hardwired by the machine manufacturer. All motor position commands ' +
          'are ultimately expressed in this frame.',
      },
      {
        symbol: 'Work Coordinate System (WCS)',
        meaning:
          'The programmer\'s local frame. Its origin is wherever the operator declares the workpiece "zero" to be — ' +
          'the corner of a part, the centre of a bore, a datum feature. Set by G54–G59 offsets stored in the ' +
          'controller. Every coordinate in a G-code program lives in the active WCS.',
      },
      {
        symbol: 'World Frame',
        meaning:
          'The renderer\'s frame, used only by visualization software (three.js, a CAM backplot, our interpreter\'s ' +
          'display). Its origin is wherever the screen renderer chooses to put (0,0,0). Converting machine ' +
          'coordinates to world coordinates is the final step before drawing a toolpath on screen.',
      },
      {
        symbol: 'Right-Hand Rule',
        meaning:
          'Point the right-hand fingers along +X, curl them toward +Y — the thumb points toward +Z. This defines ' +
          'the orientation of a right-handed coordinate system. Standard CNC machines and the EIA RS-274 G-code ' +
          'standard both use right-handed XYZ coordinates.',
      },
      {
        symbol: 'Work Offset (G54–G59)',
        meaning:
          'A stored 3D displacement vector (offset_x, offset_y, offset_z) that describes where the workpiece ' +
          'zero is, measured in machine coordinates. Applying it converts a work-frame point to a machine-frame ' +
          'point: machine = work + offset. Each G54 through G59 is a separate slot.',
      },
      {
        symbol: 'Transform Pipeline',
        meaning:
          'The ordered sequence of conversions that turns a raw G-code number into a world-frame position: ' +
          'parse → unit conversion → absolute/incremental resolution → work offset → world frame. ' +
          'Every step must happen in exactly this order.',
      },
      {
        symbol: 'Python Enum',
        meaning:
          'A set of named constants. Frame.WORK, Frame.MACHINE, and Frame.WORLD are valid Frame values. ' +
          'An Enum makes typos fail immediately (AttributeError) rather than silently producing a wrong value. ' +
          'auto() assigns unique integer values automatically.',
      },
      {
        symbol: 'Python Dataclass',
        meaning:
          'A class decorated with @dataclass that automatically generates __init__, __repr__, and __eq__ from ' +
          'field annotations. You declare fields as "name: type" or "name: type = default" and Python writes ' +
          'the boilerplate constructor and equality check for you.',
      },
    ],
    rulesOfThumb: [
      'Always tag every coordinate with its frame. A bare (10, 5, 0) with no frame label is a future bug.',
      'Machine = truth (motors go here). Work = programming convenience (what you write). World = display only.',
      'apply() adds the offset: machine = work + offset. unapply() subtracts it: work = machine - offset.',
      '+Z is up on a vertical mill (away from the part). A plunge move has a negative Z.',
      'Never use == to compare floats. Use math.isclose(a, b, abs_tol=1e-9) for all coordinate comparisons.',
    ],
  },

  hook: {
    question: 'If a G-code block says G1 X10 Y5, where exactly does the tool go?',
    realWorldContext:
      'The answer depends entirely on which coordinate frame X=10 Y=5 lives in.\n\n' +
      'A G-code coordinate always lives in the work frame — the programmer\'s local coordinate system. ' +
      'But the CNC controller must convert it to the machine frame (the hardware\'s coordinate system) ' +
      'to actually command the servo drives. And if we\'re building a visualizer, we also need the ' +
      'world frame (the screen renderer\'s coordinate system).\n\n' +
      'In this course we build a complete G-code interpreter in Python — a program that reads G-code text, ' +
      'resolves all coordinate frames, and produces a 3D toolpath. This first lesson builds the foundation: ' +
      'the three frames, the transforms between them, and the Python types that represent them cleanly.\n\n' +
      'Every hard-to-find bug in a G-code interpreter traces to one root cause: forgetting which frame a coordinate is in.',
    previewVisualizationId: 'PythonNotebook',
  },

  intuition: {
    prose: [
      '**Why three coordinate systems?** Every time a CNC machine runs a program, three frames are in play simultaneously. ' +
      'The **machine frame (MCS)** is the hardware\'s fixed reference — origin at home, set by the factory, never changes. ' +
      'The **work frame (WCS)** is the programmer\'s reference — origin where you touched off the part, different every job. ' +
      'The **world frame** is the renderer\'s reference — origin wherever the display puts (0,0,0), used only for visualization. ' +
      'You program in the work frame. The machine moves in the machine frame. The visualizer renders in the world frame. ' +
      'The interpreter converts between all three.',

      '**The right-hand rule**: Hold your right hand so your fingers point along +X. Curl them toward +Y. ' +
      'Your thumb now points toward +Z. This is the right-hand rule, and it defines the orientation of standard CNC coordinate systems. ' +
      'On a vertical milling machine: +X moves the table right, +Y moves it toward the back, +Z moves the spindle upward (away from the part). ' +
      'A cutting plunge move has a negative Z — you are moving into the part, below part zero.',

      '**The transform pipeline**: When G-code says G1 X10 Y5 Z-3, the interpreter runs five steps before it knows the physical position. ' +
      'First, parse: extract X=10, Y=5, Z=-3 from the text. ' +
      'Second, unit conversion: G21 keeps mm as-is; G20 multiplies inches by 25.4. ' +
      'Third, absolute/incremental resolution: G90 means the value IS the target; G91 means add to current position. ' +
      'Fourth, apply work offset: add the active G54 offset to get machine coordinates. ' +
      'Fifth, world transform: apply any display transform for the renderer. ' +
      'Apply these in any other order and the toolpath will be wrong.',
    ],
    callouts: [
      {
        type: 'insight',
        title: 'Tag every coordinate with its frame from the very start',
        body: 'The most common G-code interpreter bug is applying a transform twice, or skipping it entirely, because nobody knew which frame a variable was already in. A Point3D labeled Frame.WORK cannot be confused with a machine-frame point. Write the frame tag everywhere, from the first line of code.',
      },
      {
        type: 'warning',
        title: 'Z = None is always wrong — even in "2D" programs',
        body: 'G-code is always 3D. Even if a program only moves in X and Y, Z still has a value — it just stays constant. Default Z to 0.0, never None. Carrying None through your pipeline causes silent errors or wrong depth in the output.',
      },
      {
        type: 'sequencing',
        title: 'Define the types before the parser',
        body: 'This lesson defines Frame (enum), Point3D (labeled coordinate), and WCSEntry (work offset). Every other part of the interpreter imports and relies on these. Getting them right first makes the rest of the project straightforward.',
      },
    ],
    visualizations: [
      {
        id: 'PythonNotebook',
        title: 'G-Code Interpreter — Lesson 1: Coordinate Frames',
        mathBridge: 'Run cells in order. The kernel is shared — types defined in earlier cells are available in later ones.',
        caption: 'Build the Frame enum, Point3D, and WCSEntry types that underpin the entire G-code interpreter.',
        props: {
          initialCells: [

            // ─── CELL 1: The three frames — reference card ───────────────────────────
            {
              id: 1,
              cellTitle: 'The three frames — a live reference card',
              prose:
                'Before writing any Python, map out the three coordinate frames: who owns each one, where its origin is, ' +
                'and what it is used for. Run this cell and keep the output in mind as you work through the rest of the lesson.',
              code: [
                '# Three coordinate frames that every G-code interpreter must handle.',
                '# Run this cell — keep the output open as a reference.',
                '',
                'frames = {',
                '    "Machine (MCS)": {',
                '        "owner":   "Machine builder",',
                '        "origin":  "Home position — hardware limit switch",',
                '        "set by":  "Factory. Never changes.",',
                '        "used for":"Motor commands. The true physical position.",',
                '    },',
                '    "Work (WCS)": {',
                '        "owner":   "Programmer / operator",',
                '        "origin":  "Workpiece zero (corner of part, bore centre, datum)",',
                '        "set by":  "Operator before every job via G54–G59 offsets",',
                '        "used for":"Every coordinate in the G-code program",',
                '    },',
                '    "World (display)": {',
                '        "owner":   "Renderer (three.js / canvas / our visualizer)",',
                '        "origin":  "Wherever the display puts (0, 0, 0)",',
                '        "set by":  "Visualization code",',
                '        "used for":"Drawing toolpaths on screen",',
                '    },',
                '}',
                '',
                'for name, info in frames.items():',
                '    print(f"=== {name} ===")',
                '    for key, val in info.items():',
                '        print(f"  {key:8s}: {val}")',
                '    print()',
                '',
                'print("Transform pipeline (apply in this order):")',
                'for i, step in enumerate([',
                '    "1. Parse G-code text  → raw coordinate numbers",',
                '    "2. Unit conversion    → G20 (inch*25.4) or G21 (keep mm)",',
                '    "3. Abs/incremental    → G90 absolute or G91 relative to current",',
                '    "4. Work offset (G54)  → machine-frame position",',
                '    "5. World transform    → screen position for the renderer",',
                '], start=1):',
                '    print(" ", step)',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 2: Python Enums ────────────────────────────────────────────────
            {
              id: 2,
              cellTitle: 'Python Enums — named constants that cannot be misspelled',
              prose:
                'An **enum** (enumeration) is a set of named constants. Instead of tagging a point with a raw string ' +
                'like "WORK" — which can be silently misspelled — an enum makes only valid values possible. ' +
                'If you type Frame.WRORK, Python raises an AttributeError immediately. If you type "WRORK", there is no error: the bug hides. ' +
                'The auto() function assigns unique integer values automatically — we only care that each name is distinct.',
              code: [
                'from enum import Enum, auto',
                '',
                '# ── Why enums beat raw strings ──────────────────────────────────────',
                '# Raw string version — fragile:',
                'frame_str = "WORK"',
                'if frame_str == "WRORK":   # typo — evaluates False silently, no error',
                '    print("Would reach here if the typo matched")',
                '',
                '# Enum version — safe:',
                'class Frame(Enum):',
                '    MACHINE = auto()   # the hardware frame (motors live here)',
                '    WORK    = auto()   # the programmer frame (G54–G59)',
                '    WORLD   = auto()   # the renderer frame (screen display)',
                '',
                '# Using the enum:',
                'f = Frame.WORK',
                'print(f"Name : {f.name}")     # WORK',
                'print(f"Value: {f.value}")    # 2  (auto-assigned integer)',
                '',
                '# Comparison is by identity, not by string matching:',
                'print(Frame.WORK == Frame.WORK)      # True',
                'print(Frame.WORK == Frame.MACHINE)   # False',
                '',
                '# See all valid values at once:',
                'print("All frames:", [f.name for f in Frame])',
                '',
                '# Trying Frame.WRORK would raise: AttributeError: WRORK is not a valid Frame',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 3: Python Dataclasses ──────────────────────────────────────────
            {
              id: 3,
              cellTitle: 'Python Dataclasses — auto-generated constructors from field annotations',
              prose:
                'A **dataclass** is a class decorated with @dataclass. You declare the fields and their types, ' +
                'and Python automatically writes the __init__ constructor, the __repr__ (how the object prints), ' +
                'and the __eq__ (equality check) for you. Compare the two versions below — they produce identical results. ' +
                'The @dataclass version is what professional Python looks like.',
              code: [
                'from dataclasses import dataclass',
                '',
                '# ── WITHOUT @dataclass — lots of boilerplate to write by hand ────────',
                'class Point2D_Manual:',
                '    def __init__(self, x: float, y: float):',
                '        self.x = x',
                '        self.y = y',
                '',
                '    def __repr__(self):',
                '        return f"Point2D_Manual(x={self.x}, y={self.y})"',
                '',
                '    def __eq__(self, other):',
                '        if not isinstance(other, Point2D_Manual):',
                '            return NotImplemented',
                '        return self.x == other.x and self.y == other.y',
                '',
                '',
                '# ── WITH @dataclass — same thing, Python writes it for you ───────────',
                '@dataclass',
                'class Point2D:',
                '    x: float   # field declaration: name + type annotation',
                '    y: float   # Python generates __init__(self, x, y) from these',
                '',
                '# Both work identically:',
                'p1 = Point2D(3.0, 4.0)',
                'p2 = Point2D(3.0, 4.0)',
                'p3 = Point2D(1.0, 2.0)',
                '',
                'print(p1)           # Point2D(x=3.0, y=4.0)  ← __repr__ auto-generated',
                'print(p1 == p2)     # True   ← __eq__ auto-generated',
                'print(p1 == p3)     # False',
                'print(p1.x, p1.y)  # 3.0  4.0',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 4: Point3D with Frame tag ──────────────────────────────────────
            {
              id: 4,
              cellTitle: 'Point3D — a 3D coordinate labeled with its frame',
              prose:
                'Now combine both ideas: a @dataclass for the coordinate values plus a Frame field that records ' +
                'which coordinate system this point lives in. The default frame is Frame.WORK because most G-code ' +
                'coordinates are in the work frame. The as_tuple() method is a convenience for math operations ' +
                'that expect a plain (x, y, z) tuple.',
              code: [
                '# Frame is already defined in cell 2 — the kernel carries it forward.',
                'from dataclasses import dataclass',
                'from typing import Tuple',
                '',
                '@dataclass',
                'class Point3D:',
                '    x: float',
                '    y: float',
                '    z: float',
                '    frame: Frame = Frame.WORK   # default: G-code coords live in work frame',
                '',
                '    def as_tuple(self) -> Tuple[float, float, float]:',
                '        """Return (x, y, z) as a plain tuple — useful for math."""',
                '        return (self.x, self.y, self.z)',
                '',
                '    def __repr__(self) -> str:',
                '        return f"Point3D({self.x:.4f}, {self.y:.4f}, {self.z:.4f}, frame={self.frame.name})"',
                '',
                '# Create labeled points:',
                'work_pt    = Point3D(10.0,   5.0,  0.0, Frame.WORK)',
                'machine_pt = Point3D(110.0, 205.0, -50.0, Frame.MACHINE)',
                'default_pt = Point3D(3.0,   4.0,  0.0)  # defaults to Frame.WORK',
                '',
                'print(work_pt)',
                'print(machine_pt)',
                'print(default_pt)',
                '',
                '# The frame label makes confusion impossible:',
                'print(f"work_pt frame    : {work_pt.frame.name}")',
                'print(f"machine_pt frame : {machine_pt.frame.name}")',
                'print(f"Same object?     : {work_pt == machine_pt}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 5: Challenge 1 — fill-in Point3D ───────────────────────────────
            {
              id: 5,
              challengeType: 'fill-in',
              challengeNumber: 1,
              challengeTitle: 'Create labeled work-frame points',
              difficulty: 'easy',
              cellTitle: 'Challenge 1 — Create labeled work-frame points',
              prose:
                'A G-code program commands three positions:\n' +
                '- **Rapid to safe height**: X=0, Y=0, Z=5 (5 mm above part zero)\n' +
                '- **Plunge start**: X=20, Y=10, Z=0 (exactly at part zero)\n' +
                '- **Cutting depth**: X=20, Y=10, Z=-6.5 (6.5 mm into the part)\n\n' +
                'Create a correctly labeled Point3D for each one.',
              prompt: 'Fill in the x, y, z values. Each point must carry the Frame.WORK tag (G-code coordinates always live in the work frame).',
              starterBlock: [
                '# Fill in the ___ values — Frame.WORK tag is required on each point',
                'safe_height  = Point3D(___, ___, ___, Frame.WORK)   # X=0,  Y=0,  Z=5',
                'plunge_start = Point3D(___, ___, ___, Frame.WORK)   # X=20, Y=10, Z=0',
                'cut_depth    = Point3D(___, ___, ___, Frame.WORK)   # X=20, Y=10, Z=-6.5',
              ].join('\n'),
              code: [
                '# Paste the starter block above here, fill in the ___ values, then run.',
                '# safe_height  = Point3D(___, ___, ___, Frame.WORK)',
                '# plunge_start = Point3D(___, ___, ___, Frame.WORK)',
                '# cut_depth    = Point3D(___, ___, ___, Frame.WORK)',
              ].join('\n'),
              testCode: [
                'assert "safe_height" in dir(), "safe_height not defined — paste and fill in the starter block"',
                'assert isinstance(safe_height, Point3D), "safe_height must be a Point3D"',
                'assert safe_height.frame == Frame.WORK, "safe_height must have frame=Frame.WORK"',
                'assert abs(safe_height.x - 0.0) < 1e-9, f"safe_height.x should be 0.0, got {safe_height.x}"',
                'assert abs(safe_height.y - 0.0) < 1e-9, f"safe_height.y should be 0.0, got {safe_height.y}"',
                'assert abs(safe_height.z - 5.0) < 1e-9, f"safe_height.z should be 5.0, got {safe_height.z}"',
                '',
                'assert "plunge_start" in dir(), "plunge_start not defined"',
                'assert plunge_start.frame == Frame.WORK, "plunge_start must have frame=Frame.WORK"',
                'assert abs(plunge_start.x - 20.0) < 1e-9, f"plunge_start.x should be 20.0"',
                'assert abs(plunge_start.y - 10.0) < 1e-9, f"plunge_start.y should be 10.0"',
                'assert abs(plunge_start.z - 0.0)  < 1e-9, f"plunge_start.z should be 0.0"',
                '',
                'assert "cut_depth" in dir(), "cut_depth not defined"',
                'assert cut_depth.frame == Frame.WORK, "cut_depth must have frame=Frame.WORK"',
                'assert abs(cut_depth.x - 20.0)  < 1e-9, f"cut_depth.x should be 20.0"',
                'assert abs(cut_depth.y - 10.0)  < 1e-9, f"cut_depth.y should be 10.0"',
                'assert abs(cut_depth.z - (-6.5)) < 1e-9, f"cut_depth.z should be -6.5, got {cut_depth.z}"',
                '',
                '"SUCCESS: All three points are correctly labeled work-frame coordinates."',
              ].join('\n'),
              hint: 'Point3D takes (x, y, z, frame). safe_height is 5mm above part zero so Z=5. cut_depth is 6.5mm below part zero so Z=-6.5 (negative = into the material).',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 6: WCSEntry — the work offset ──────────────────────────────────
            {
              id: 6,
              cellTitle: 'WCSEntry — the G54 work offset, and the apply() transform',
              prose:
                'A **work offset** (G54, G55, etc.) is a stored 3D displacement. It records where part zero is, ' +
                'measured from machine home. The apply() method performs the fundamental transform: ' +
                'take a work-frame point, add the offset, and return a machine-frame point.\n\n' +
                '**Formula**: machine = work + offset\n' +
                '- machine.x = work.x + offset_x\n' +
                '- machine.y = work.y + offset_y\n' +
                '- machine.z = work.z + offset_z',
              code: [
                '# Point3D and Frame are in scope from earlier cells.',
                '@dataclass',
                'class WCSEntry:',
                '    """One G54-style work offset stored in the machine controller."""',
                '    name: str               # e.g. "G54" — for display and debugging',
                '    offset_x: float = 0.0  # machine X position of part zero',
                '    offset_y: float = 0.0  # machine Y position of part zero',
                '    offset_z: float = 0.0  # machine Z position of part zero',
                '',
                '    def apply(self, pt: Point3D) -> Point3D:',
                '        """Convert a WORK-frame point to the MACHINE frame."""',
                '        return Point3D(',
                '            pt.x + self.offset_x,',
                '            pt.y + self.offset_y,',
                '            pt.z + self.offset_z,',
                '            frame=Frame.MACHINE,',
                '        )',
                '',
                '# The workpiece is fixtured so its zero is at machine position (100, 200, -50):',
                'g54 = WCSEntry("G54", offset_x=100.0, offset_y=200.0, offset_z=-50.0)',
                '',
                '# G-code command: G1 X10 Y5 Z0 (in the work frame)',
                'cmd = Point3D(10.0, 5.0, 0.0, Frame.WORK)',
                '',
                '# Apply the offset — where does the machine actually go?',
                'machine_pos = g54.apply(cmd)',
                '',
                'print(f"Work command : {cmd}")',
                'print(f"Machine pos  : {machine_pos}")',
                'print()',
                'print(f"  X: {cmd.x} + {g54.offset_x} = {machine_pos.x}")',
                'print(f"  Y: {cmd.y} + {g54.offset_y} = {machine_pos.y}")',
                'print(f"  Z: {cmd.z} + {g54.offset_z} = {machine_pos.z}")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 7: Challenge 2 — apply G55 offset ──────────────────────────────
            {
              id: 7,
              challengeType: 'fill-in',
              challengeNumber: 2,
              challengeTitle: 'Apply a G55 work offset',
              difficulty: 'easy',
              cellTitle: 'Challenge 2 — Apply a G55 work offset',
              prose:
                '**Scenario**: A second fixture has its part zero at machine position (50, 75, -10). ' +
                'The G-code commands a move to X=20, Y=15, Z=-3 in the work frame. ' +
                'Where does the tool actually go in machine coordinates?',
              prompt: 'Create the G55 WCSEntry with the correct offsets, create the work-frame command point, then call apply() to get the machine position.',
              starterBlock: [
                '# Fill in the offset values and coordinate values',
                'g55     = WCSEntry("G55", offset_x=___, offset_y=___, offset_z=___)  # (50, 75, -10)',
                'cmd_g55 = Point3D(___, ___, ___, Frame.WORK)                          # X=20, Y=15, Z=-3',
                'result  = g55.apply(___)                                               # apply the offset',
                'print(result)',
              ].join('\n'),
              code: [
                '# Paste the starter block here and fill in the ___ values.',
                '# g55     = WCSEntry("G55", offset_x=___, offset_y=___, offset_z=___)',
                '# cmd_g55 = Point3D(___, ___, ___, Frame.WORK)',
                '# result  = g55.apply(___)',
                '# print(result)',
              ].join('\n'),
              testCode: [
                'assert "g55" in dir(), "g55 not defined"',
                'assert isinstance(g55, WCSEntry), "g55 must be a WCSEntry"',
                'assert abs(g55.offset_x - 50.0)   < 1e-9, f"g55.offset_x should be 50.0, got {g55.offset_x}"',
                'assert abs(g55.offset_y - 75.0)   < 1e-9, f"g55.offset_y should be 75.0, got {g55.offset_y}"',
                'assert abs(g55.offset_z - (-10.0)) < 1e-9, f"g55.offset_z should be -10.0, got {g55.offset_z}"',
                '',
                'assert "result" in dir(), "result not defined — call g55.apply(cmd_g55)"',
                'assert isinstance(result, Point3D), "result must be a Point3D"',
                'assert result.frame == Frame.MACHINE, f"result must be in Frame.MACHINE, got {result.frame}"',
                'assert abs(result.x - 70.0)   < 1e-9, f"result.x should be 70.0 (20+50), got {result.x}"',
                'assert abs(result.y - 90.0)   < 1e-9, f"result.y should be 90.0 (15+75), got {result.y}"',
                'assert abs(result.z - (-13.0)) < 1e-9, f"result.z should be -13.0 (-3+-10), got {result.z}"',
                '',
                '"SUCCESS: G55 offset applied correctly. Machine position: (70.0, 90.0, -13.0)."',
              ].join('\n'),
              hint: 'machine = work + offset. X: 20 + 50 = 70. Y: 15 + 75 = 90. Z: -3 + (-10) = -13. Pass cmd_g55 as the argument to g55.apply().',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 8: Same command, different offset → different position ──────────
            {
              id: 8,
              cellTitle: 'Same G-code, different offset — completely different machine position',
              prose:
                'This is the whole point of the WCS system: the programmer writes coordinates ' +
                'relative to the part, not relative to the machine. ' +
                'The exact same G-code coordinate produces two completely different machine positions ' +
                'depending on which G54/G55 offset is active.',
              code: [
                '# g54 and g55 are both in scope from cells 6 and 7.',
                '',
                'same_cmd = Point3D(10.0, 5.0, 0.0, Frame.WORK)',
                '',
                'with_g54 = g54.apply(same_cmd)',
                'with_g55 = g55.apply(same_cmd)',
                '',
                'print("Same G-code command: G1 X10 Y5 Z0")',
                'print()',
                'print(f"  With G54 (offset 100, 200, -50): {with_g54}")',
                'print(f"  With G55 (offset  50,  75, -10): {with_g55}")',
                'print()',
                '',
                'dx = with_g54.x - with_g55.x',
                'dy = with_g54.y - with_g55.y',
                'dz = with_g54.z - with_g55.z',
                'print(f"  Difference in machine position: dX={dx:.1f}  dY={dy:.1f}  dZ={dz:.1f}")',
                'print("  (Equals the difference between the two work offsets — exactly as expected.)")',
              ].join('\n'),
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 9: Challenge 3 — implement unapply() ───────────────────────────
            {
              id: 9,
              challengeType: 'write',
              challengeNumber: 3,
              challengeTitle: 'Implement WCSEntry.unapply()',
              difficulty: 'medium',
              cellTitle: 'Challenge 3 — Implement unapply(): machine → work frame',
              prose:
                'apply() goes work → machine (adds the offset). The inverse — unapply() — goes machine → work (subtracts the offset). ' +
                'This is needed when a probing cycle reports its machine position and you need to express it back in the work frame.\n\n' +
                '**Formula**: work = machine - offset',
              prompt: 'Add an unapply() method to WCSEntry by completing the class below. It takes a Frame.MACHINE point and returns a Frame.WORK point by subtracting the offset. The apply() method is already written for you — write unapply() in the same style.',
              code: [
                '# Redefine WCSEntry with the new unapply() method added.',
                '# (Redefining a class in Pyodide replaces the previous definition.)',
                '',
                '@dataclass',
                'class WCSEntry:',
                '    name: str',
                '    offset_x: float = 0.0',
                '    offset_y: float = 0.0',
                '    offset_z: float = 0.0',
                '',
                '    def apply(self, pt: Point3D) -> Point3D:',
                '        """WORK-frame point → MACHINE-frame point (adds offset)."""',
                '        return Point3D(',
                '            pt.x + self.offset_x,',
                '            pt.y + self.offset_y,',
                '            pt.z + self.offset_z,',
                '            frame=Frame.MACHINE,',
                '        )',
                '',
                '    # YOUR CODE HERE',
                '    # def unapply(self, pt: Point3D) -> Point3D:',
                '    #     """MACHINE-frame point → WORK-frame point (subtracts offset)."""',
                '    #     ...',
              ].join('\n'),
              testCode: [
                'import math',
                '',
                'g54_test = WCSEntry("G54", offset_x=100.0, offset_y=200.0, offset_z=-50.0)',
                '',
                'assert hasattr(g54_test, "unapply"), "unapply method not found on WCSEntry — did you define it?"',
                '',
                '# unapply must be the exact inverse of apply',
                'original = Point3D(10.0, 5.0, 0.0, Frame.WORK)',
                'machine  = g54_test.apply(original)',
                'recovered = g54_test.unapply(machine)',
                '',
                'assert isinstance(recovered, Point3D), "unapply must return a Point3D"',
                'assert recovered.frame == Frame.WORK, f"unapply must return Frame.WORK, got {recovered.frame}"',
                'assert math.isclose(recovered.x, original.x, abs_tol=1e-9), f"x: expected {original.x}, got {recovered.x}"',
                'assert math.isclose(recovered.y, original.y, abs_tol=1e-9), f"y: expected {original.y}, got {recovered.y}"',
                'assert math.isclose(recovered.z, original.z, abs_tol=1e-9), f"z: expected {original.z}, got {recovered.z}"',
                '',
                '# Test with a second offset',
                'g55_test = WCSEntry("G55", offset_x=50.0, offset_y=75.0, offset_z=-10.0)',
                'pt2 = Point3D(20.0, 15.0, -3.0, Frame.WORK)',
                'recovered2 = g55_test.unapply(g55_test.apply(pt2))',
                'assert math.isclose(recovered2.x, pt2.x, abs_tol=1e-9)',
                'assert math.isclose(recovered2.y, pt2.y, abs_tol=1e-9)',
                'assert math.isclose(recovered2.z, pt2.z, abs_tol=1e-9)',
                '',
                '"SUCCESS: unapply() is the correct inverse of apply(). Round-trip test passed."',
              ].join('\n'),
              hint: 'apply() returns Point3D(pt.x + offset_x, ..., Frame.MACHINE). unapply() does the reverse: return Point3D(pt.x - self.offset_x, pt.y - self.offset_y, pt.z - self.offset_z, frame=Frame.WORK).',
              output: '', status: 'idle', figureJson: null,
            },

            // ─── CELL 10: Full pipeline demo ─────────────────────────────────────────
            {
              id: 10,
              cellTitle: 'The complete transform pipeline — all five stages',
              prose:
                'This is the full coordinate resolution pipeline the interpreter runs for every coordinate in every G-code block. ' +
                'Each stage converts the raw number into a more specific form. Run it and trace each step.',
              code: [
                '# Full pipeline simulation.',
                '# G-code block: G21 G90 G1 X10 Y5 Z-3 with G54 active.',
                '',
                '# ── Stage 1: Parse ───────────────────────────────────────────────────',
                'raw_x, raw_y, raw_z = 10.0, 5.0, -3.0',
                'print(f"1. Parsed         : X={raw_x}, Y={raw_y}, Z={raw_z}")',
                '',
                '# ── Stage 2: Unit conversion (G21 = mm, no change) ──────────────────',
                'inch_mode = False  # G21 is active',
                'if inch_mode:',
                '    raw_x, raw_y, raw_z = raw_x * 25.4, raw_y * 25.4, raw_z * 25.4',
                'print(f"2. After units    : X={raw_x}, Y={raw_y}, Z={raw_z} mm")',
                '',
                '# ── Stage 3: Absolute/incremental (G90 = absolute) ──────────────────',
                'incremental = False  # G90 is active',
                'current = Point3D(0.0, 0.0, 5.0, Frame.WORK)  # last known position',
                'if incremental:',
                '    abs_x = current.x + raw_x',
                '    abs_y = current.y + raw_y',
                '    abs_z = current.z + raw_z',
                'else:',
                '    abs_x, abs_y, abs_z = raw_x, raw_y, raw_z',
                'work_pt = Point3D(abs_x, abs_y, abs_z, Frame.WORK)',
                'print(f"3. Work frame     : {work_pt}")',
                '',
                '# ── Stage 4: Work offset (G54 active) ───────────────────────────────',
                '# Re-create g54 using the new WCSEntry definition from cell 9.',
                'active_wcs = WCSEntry("G54", offset_x=100.0, offset_y=200.0, offset_z=-50.0)',
                'machine_pt = active_wcs.apply(work_pt)',
                'print(f"4. Machine frame  : {machine_pt}")',
                '',
                '# ── Stage 5: World frame (identity transform here) ───────────────────',
                'world_pt = Point3D(machine_pt.x, machine_pt.y, machine_pt.z, Frame.WORLD)',
                'print(f"5. World frame    : {world_pt}")',
                '',
                'print()',
                'print("Pipeline complete. The renderer draws the tool at this world position.")',
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
      'The work-to-machine transform is a **pure translation** — addition of a constant offset vector. ' +
      'For a work-frame point $P_w = (x_w, y_w, z_w)$ and offset $O = (O_x, O_y, O_z)$, the machine-frame point is:',

      '$$P_m = P_w + O$$',

      'That is: $x_m = x_w + O_x$, $y_m = y_w + O_y$, $z_m = z_w + O_z$.',

      'The inverse — going from machine back to work — simply subtracts the offset:',

      '$$P_w = P_m - O$$',

      'This is the unapply() operation in Challenge 3. **Round-trip correctness** requires:',

      '$$\\text{unapply}(\\text{apply}(P_w)) = P_w \\quad \\text{for all } P_w$$',

      'Verifying this identity (apply then unapply recovers the original) is the minimal sanity check ' +
      'for any coordinate transform. If it fails, the transform is wrong. ' +
      'Note that we use floating-point numbers, so "equality" means ' +
      '$|x_{\\text{recovered}} - x_{\\text{original}}| < 10^{-9}$ — not exact equality.',
    ],
  },

  rigor: {
    prose: [
      '**Float equality: always use a tolerance.** Coordinate arithmetic accumulates tiny rounding errors. ' +
      'After a chain of additions and subtractions, two values that should be identical by math may differ by ' +
      '$10^{-15}$. Always compare with math.isclose(a, b, abs_tol=1e-9). ' +
      'We use abs_tol=1e-9 (one nanometre), which is far below any physically meaningful CNC precision (1 micrometre = $10^{-6}$ m).',

      '**Why @dataclass over namedtuple?** collections.namedtuple is immutable and provides field names, ' +
      'but it cannot carry methods, does not support default values cleanly, and cannot be extended later. ' +
      '@dataclass with frozen=True gives immutable semantics with all of those capabilities. ' +
      'We use mutable dataclasses here because future lessons will add cached derived values to Point3D.',

      '**Why Enum over strings or integer constants?** Raw strings ("WORK") are fragile — typos fail silently. ' +
      'Integer constants (FRAME_WORK = 1) have no discoverability and no type checking. ' +
      'Enum provides IDE autocompletion, clear error messages on invalid values, isinstance() checking, ' +
      'and iteration over all valid values with list(Frame). It is always the right choice for a fixed set of named states.',

      '**Frame confusion is the hardest class of bug.** In a multi-stage pipeline, every variable holding ' +
      'a coordinate should either be a tagged Point3D or be exhaustively documented with a comment. ' +
      'The majority of non-trivial G-code interpreter bugs are "applied the work offset twice" or ' +
      '"forgot to apply the work offset" — both invisible at runtime without the frame tag.',
    ],
  },

  examples: [
    {
      id: 'ex-pipeline-trace',
      title: 'Tracing one G-code coordinate through all five pipeline stages',
      problem:
        'G-code block: G21 G90 G1 X25.0 Y12.5 Z-5.0, with G54 offset (150, 80, -45). Trace the coordinate through all five stages.',
      steps: [
        {
          expression: '1. Parse',
          annotation: 'Extract X=25.0, Y=12.5, Z=-5.0 from the text. These are raw dimensionless numbers at this stage.',
        },
        {
          expression: '2. Units (G21)',
          annotation: 'G21 = millimetres. Values remain unchanged: (25.0, 12.5, -5.0) mm.',
        },
        {
          expression: '3. Absolute (G90)',
          annotation: 'G90 = absolute. The values ARE the target position, not a delta. Work-frame point = Point3D(25.0, 12.5, -5.0, Frame.WORK).',
        },
        {
          expression: '4. Work offset (G54)',
          annotation: 'Add G54 offset: X=25+150=175, Y=12.5+80=92.5, Z=-5+(-45)=-50. Machine-frame point = Point3D(175.0, 92.5, -50.0, Frame.MACHINE).',
        },
        {
          expression: '5. World frame',
          annotation: 'Identity transform here. World-frame point = Point3D(175.0, 92.5, -50.0, Frame.WORLD). The renderer draws the tool at this position.',
        },
      ],
      conclusion:
        'The tool physically travels to machine position (175.0, 92.5, -50.0). ' +
        'The programmer only ever writes (25.0, 12.5, -5.0) — they work entirely in the work frame ' +
        'and never need to know where machine home is.',
    },
  ],

  quiz: [
    {
      id: 'gcp-01-q1',
      type: 'choice',
      text: 'A G-code line says G1 X10 Y5. Which frame do X=10 and Y=5 live in?',
      options: [
        'Machine frame — the hardware\'s absolute position',
        'Work frame — the programmer\'s local coordinate system',
        'World frame — the renderer\'s display coordinate system',
        'It depends entirely on whether G90 or G91 is active',
      ],
      correct: 1,
    },
    {
      id: 'gcp-01-q2',
      type: 'choice',
      text: 'G54 has offset (100, 200, -50). A work-frame point is X=10 Y=5 Z=0. What is the machine-frame position?',
      options: [
        '(10, 5, 0)',
        '(90, 195, 50)',
        '(110, 205, -50)',
        '(100, 200, -50)',
      ],
      correct: 2,
    },
    {
      id: 'gcp-01-q3',
      type: 'choice',
      text: 'Why use Frame.WORK (an Enum value) instead of the string "WORK" to tag a point\'s frame?',
      options: [
        'Enums are faster than strings at runtime',
        'Strings cannot store coordinate frame information in Python',
        'A misspelled Enum value raises an AttributeError immediately; a misspelled string fails silently',
        'Python dataclasses only accept Enum values, not strings',
      ],
      correct: 2,
    },
    {
      id: 'gcp-01-q4',
      type: 'choice',
      text: 'What does @dataclass automatically generate for a class?',
      options: [
        '__init__, __repr__, and __eq__ from the field annotations',
        'Only __init__ — you must write __repr__ yourself',
        'A frozen (immutable) object that cannot be modified after creation',
        'Type checking at runtime for all field values',
      ],
      correct: 0,
    },
    {
      id: 'gcp-01-q5',
      type: 'choice',
      text: 'What does WCSEntry.unapply() do and when would you use it?',
      options: [
        'It cancels the active work offset on the CNC controller',
        'It converts a machine-frame point back to a work-frame point by subtracting the offset',
        'It applies the work offset in reverse order (Z first, then Y, then X)',
        'It resets the work offset to (0, 0, 0)',
      ],
      correct: 1,
    },
    {
      id: 'gcp-01-q6',
      type: 'choice',
      text: 'In the transform pipeline, which step comes immediately AFTER applying the work offset?',
      options: [
        'Unit conversion (G20/G21)',
        'Absolute/incremental resolution (G90/G91)',
        'Parsing the G-code text',
        'World-frame transform for visualization',
      ],
      correct: 3,
    },
    {
      id: 'gcp-01-q7',
      type: 'choice',
      text: 'On a standard right-handed vertical milling machine, which direction is +Z?',
      options: [
        '+Z moves the spindle down (into the part)',
        '+Z moves the spindle up (away from the part)',
        '+Z moves the table to the right',
        '+Z is undefined — lathes define Z, not mills',
      ],
      correct: 1,
    },
    {
      id: 'gcp-01-q8',
      type: 'choice',
      text: 'G54 has Y offset 200. G55 has Y offset 75. The same command Y=5 runs once with G54 and once with G55. What is the difference in machine Y position?',
      options: [
        '5',
        '75',
        '125',
        '275',
      ],
      correct: 2,
    },
  ],

  mentalModel: [
    'Three frames, three owners: Machine = hardware. Work = programmer (G54 offset). World = renderer.',
    'apply() goes work → machine (adds offset). unapply() goes machine → work (subtracts offset).',
    'Every coordinate you write in G-code lives in the work frame. The machine never sees it directly.',
    'Tag every point with its frame. A bare (10, 5, 0) with no frame label is a future bug.',
    'Float equality with == will fail. Use math.isclose(a, b, abs_tol=1e-9) for coordinate comparisons.',
    'Pipeline order: parse → units → abs/incr → offset → world. Any other order produces wrong output.',
    'Enums make typos fail loudly. @dataclass writes the constructor for you. Both are worth using.',
    '+Z is away from the part (up) on a vertical mill. Plunge cuts have negative Z.',
  ],

  checkpoints: ['read-intuition'],
}
