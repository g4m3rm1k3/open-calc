# CAD/CAM — 3D Modelling, Toolpaths, and G-code

## What You Will Build

A browser-based CAD/CAM application: draw 2D geometry, extrude it into a 3D solid,
select geometry for machining, generate toolpaths, and export G-code that a real
CNC machine can run.

By the end you will:
- Navigate a 3D viewport you built with Three.js
- Draw constrained 2D sketches on planes and faces
- Extrude sketches into 3D solids
- Parse and visualise G-code as an animated 3D toolpath
- Generate contour and drill toolpaths from selected geometry
- Export a complete G-code program in Fanuc dialect

## Lesson Standard

Every lesson in this project must meet the [Lesson Contract](../../LESSON_CONTRACT.md).
Read it before writing or reviewing a lesson.

## How the Lessons Are Ordered

The 3D viewport exists from lesson one. The application shell — toolbar, panels,
status bar — is built before any geometry exists. React is introduced the moment
the UI becomes too complex to manage without a component model. The Python backend
is introduced the moment the computation becomes too complex for the frontend alone.
Nothing is built before it can be seen.

## Lessons

| # | Title | You Can See | SE | CS | Maths |
|---|---|---|---|---|---|
| 01 | The 3D Viewport | A Three.js canvas with a grid on the XY plane, orbit, pan, and zoom | HTML before CSS, CSS variables for the shell, Three.js as a managed dependency | The WebGL rendering pipeline, scene graphs as tree data structures | None |
| 02 | The Application Shell | A toolbar, a status bar, and a panel on each side surrounding the viewport | React introduced as a component model, CSS variables extended for theming | Component trees, declarative vs imperative rendering | None |
| 03 | Objects in 3D Space | A coloured box added to the scene, moved by typing coordinates | Scene graph manipulation, separation of data from rendering, immutable geometry types | Tree traversal, world space vs local space | 3D vectors, point translation |
| 04 | 4×4 Transforms | Translate, rotate, and scale the box using matrix operations applied in the scene | Transform as a composable value, the matrix stack | Homogeneous coordinates, matrix composition, order of operations | 4×4 transformation matrices, why a 4th dimension encodes translation |
| 05 | Raycasting and Selection | Click the box to select it — its edges highlight | Hit testing as a separate layer, selection state separate from geometry | Ray-triangle intersection (Möller–Trumbore algorithm) | Parametric rays: P = origin + t × direction, line-plane intersection |
| 06 | Sketch Mode | Click a coordinate plane — the camera locks to it, a 2D grid appears, drawing tools activate | Modal state machine, CSS variables switched by mode | Finite state machine, coordinate projection from 3D to 2D | Plane equations, projecting a 3D point onto a plane |
| 07 | Lines and Vectors | Click two points to draw a line — it appears on the sketch plane | Geometry as immutable data, the preview pattern (show before commit) | Parametric line equations, line-line intersection | Parametric line: P = A + t(B − A), 2D vector arithmetic |
| 08 | Circles and Arcs | Draw a circle by center then radius; an arc by center, start, and end | Two-click and three-click interaction patterns, input modes | Parametric curves, arc sweep direction | Circle equation, arc parametrisation by angle θ |
| 09 | Snapping | Cursor snaps to existing endpoints and to horizontal/vertical directions | Snap as a composable pre-processing step, tolerance as an explicit design decision | Nearest-neighbour search, angular tolerance | Distance between two points, angle from horizontal |
| 10 | Constraint Solving | Add a horizontal constraint — the line rotates to satisfy it | Constraints as equations, the solver as a service with a clean API | Newton-Raphson for a system of equations, Jacobian matrix | Systems of equations, the Jacobian, how Newton-Raphson converges in 2D |
| 11 | Dimension Constraints | Click a line, type `50` — it extends or shrinks to exactly 50mm | Dimensional constraints as a special case of the solver | Degrees of freedom, constraint counting, over- and under-constrained states | Distance as a scalar constraint equation |
| 12 | Extrusion | Select a closed sketch profile, type a depth — a solid appears in the viewport | Closed-loop detection, the feature tree as an ordered operation log | Half-edge mesh representation, face-edge-vertex data structure | Cross product for face normals, face area from vertices |
| 13 | Face Selection | Hover a solid face to highlight it — the properties panel shows its area and normal | Raycasting extended to mesh geometry, selection as a layer not a property | BVH (bounding volume hierarchy) for accelerated raycasting | Triangle mesh intersection, face normal as a unit vector |
| 14 | Sketch on a Face | Select a face, enter sketch mode — drawing is now constrained to that face's plane | Local coordinate frame as a reusable abstraction, change of basis as an SE pattern | Coordinate frame extraction from a face, UV mapping | Change of basis matrix, face normal as a coordinate axis |
| 15 | The Python Backend | Geometry computation moves to a Python server — the UI sends requests and renders responses | Why separate computation from rendering, REST API design, JSON as a protocol | Client-server architecture, serialising a geometry tree to JSON | None |
| 16 | What is G-code | Load a G-code file and see its raw lines displayed in a panel | Pluggable parser architecture, the Protocol pattern for swappable dialects | Domain-specific languages, modal state in a machine controller | None |
| 17 | The G-code Lexer | G-code tokenised and shown as a token list — builds directly on OpenMAT | Adapting an existing module to a new dialect, regression testing | Character classification for G-code syntax (word address format) | None |
| 18 | The G-code Parser | Parsed G-code shown as a structured list of blocks with modal state tracked | Modal state as accumulated context, dialect-independent output type | State machine parser, handling ambiguous syntax | None |
| 19 | The Toolpath Simulator | Parsed G-code converted to 3D moves and drawn as lines in the viewport | Simulation as a pure function, dialect-independence enforced by type | Arc interpolation for G02/G03 circular moves | Arc centre from I/J offsets, circular interpolation as parametric angle stepping |
| 20 | Tool Geometry | Define a cutting tool in a library — its profile rendered beside the viewport | Library as a persistent data store, JSON file as a simple database | None | Cylinder geometry, end mill cross-section |
| 21 | Polygon Offset | Offset a closed sketch profile inward by the tool radius — see the offset curve | Pure function transformation, tolerance handling in geometric algorithms | Polygon offset algorithm, vertex bisector method | Angle bisectors, perpendicular offset distance, handling convex and concave corners |
| 22 | Contour Toolpath | Select an edge, generate a contour toolpath — the path appears in the viewport | CAM operation as a pipeline: geometry → offset → sample → G-code | Curve following, arc vs linear segment decision | Arc length parameterisation, path tangent vectors |
| 23 | Drill Operation | Select circle centers, generate drill cycles — vertical lines appear at each point | Reusing the toolpath visualiser, canned cycle as a reusable abstraction | Canned cycle representation in the program model | Point geometry, depth as a Z-axis vector |
| 24 | G-code Export | All toolpaths exported as a downloadable Fanuc G-code file | Code generation as the inverse of parsing, validating output by parsing it back | AST-to-text generation, round-trip testing | Coordinate formatting, arc R vs I/J parameter trade-offs |

## Definition of Done

- Every lesson's tests pass
- A sketch can be drawn, constrained, and extruded into a 3D solid
- A G-code file can be loaded, simulated, and visualised as an animated toolpath
- A contour and drill toolpath can be generated from selected geometry and exported
- You can explain how the constraint solver works and what Newton-Raphson is doing
- You can explain the difference between parsing G-code and simulating it
- You can open the real OpenMAT engine and recognise the same patterns you built here
