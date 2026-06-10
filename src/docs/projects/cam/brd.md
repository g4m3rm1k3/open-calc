# CAD/CAM Platform — Business Requirements Document
### Version 0.1 — MVP

---

## 1. What This Is

A browser-based CAD/CAM application for CNC milling. It runs in the browser with a
Python backend that handles geometry computation. The frontend is React, TypeScript,
and Three.js. The backend is Python with a geometry kernel built from scratch for
learning — wrapped with a production kernel (OpenCASCADE via pythonocc) when
complexity demands it.

The application teaches the complete CAD-to-machining workflow:
draw geometry → build solids → select geometry for machining → generate toolpaths →
simulate → output G-code.

This is a mill-only application. Turning is out of scope for MVP.

---

## 2. What This Is Not

- Not a general-purpose CAD tool (no assembly management, no drawing generation)
- Not a multi-axis machining platform (3-axis mill only for MVP)
- Not a file format converter
- Not a simulation tool (toolpath visualization is not material removal simulation)
- Not a cloud application (local server, local files)

---

## 3. Technical Decisions

### 3.1 Architecture

```
Browser (React + TypeScript + Three.js)
        ↕  HTTP / WebSocket
Python Backend (FastAPI)
        ↕
Geometry Kernel (Python, built from scratch)
        ↕  (future swap point)
OpenCASCADE via pythonocc (when kernel complexity exceeds what we build)
```

The frontend owns: rendering, UI state, user interaction, Three.js scene management.

The backend owns: all geometry computation, constraint solving, toolpath generation,
G-code generation, file import/export.

The frontend never does geometry math. It sends requests to the backend and renders
what comes back. This separation means the geometry kernel can be tested independently,
swapped out without touching the frontend, and eventually moved to a compiled language
without changing the API.

### 3.2 The Geometry Kernel — Build First, Wrap Later

We build the kernel from scratch because understanding it is the curriculum. The kernel
starts simple and grows until the complexity of a problem (Boolean operations, NURBS,
surface offsetting) exceeds what we can reasonably build — at that point that specific
operation is swapped to pythonocc. The rest stays as built.

The swap point is not a rewrite. The kernel has a clean internal API. Swapping one
operation means replacing one function behind that API. The frontend and the rest of
the kernel do not change.

**MVP kernel scope (built from scratch):**
- Point, Vector, Line, Circle, Arc, Bezier in 3D
- Transform (rotation, translation, scale) via 4×4 matrices
- Intersection math (line-line, line-plane, ray-triangle)
- Extrude a closed 2D profile into a solid (prismatic solids only)
- Create geometry on a face: sketch on a planar face, constrained to that plane
- Slice a solid with a plane, extract the cross-section as a wire
- Extract wireframe from a solid (edges as line/arc segments)
- Constraint solver (Newton-Raphson, 2D sketch constraints)
- Polygon offset (for tool radius compensation)
- 3D toolpath generation (contour following, drilling)

**Deferred to pythonocc wrap:**
- Boolean operations (union, difference, intersection of solids)
- Freeform surfaces (NURBS)
- STEP/IGES import parsing (use pythonocc reader, extract geometry back to our types)
- Shell, loft, sweep operations

### 3.3 The G-code Parser — Pluggable Architecture

The G-code parser is an independent module with a defined interface. It can be
replaced without touching anything else. It can be tested without the rest of the
application running.

```python
class GCodeParser(Protocol):
    def parse(self, source: str) -> GCodeProgram: ...
    def dialect(self) -> str: ...
```

MVP implements: Fanuc dialect parser.
Future: Siemens 840D, Haas, GRBL — each is a separate implementation of the protocol.

The G-code program object (the output of parsing) is dialect-independent. A Fanuc
parser and a Haas parser both produce the same `GCodeProgram` type. The simulator
and the toolpath renderer consume `GCodeProgram`, not the raw dialect.

### 3.4 Frontend — Built From Scratch

No component libraries. No CSS frameworks. The UI is built component by component.
This is deliberate: understanding why UI components are built the way they are is
part of the curriculum.

**Key frontend components:**
- Ribbon bar (tool groups, active tool state)
- 3D viewport (Three.js, orbit controls, grid, axis indicator)
- Panel system (draggable, resizable, dockable panels)
- Feature tree (ordered list of modeling operations)
- Properties panel (context-sensitive, shows properties of selected entity)
- G-code editor panel (syntax-highlighted, line-number display)
- Toolpath visualizer (animated G-code playback in 3D viewport)

### 3.5 3D Viewport

Three.js handles all 3D rendering. The viewport renders:
- The coordinate grid (XY plane, major and minor grid lines)
- Sketch geometry (lines, circles, arcs — rendered as Line objects)
- Solid geometry (faces as meshes, edges as lines)
- Toolpath visualization (the G-code path as an animated line in 3D space)
- Construction geometry (planes, axes — rendered faded)
- Selection highlights

The viewport has three modes:
- **Model mode:** navigate the 3D scene, select solids and faces
- **Sketch mode:** constrained to a plane, 2D drawing tools active
- **CAM mode:** select geometry for machining, view toolpaths

### 3.6 Communication Protocol

Frontend → Backend: REST for operations (create entity, add constraint, run solver,
generate toolpath). WebSocket for streaming (toolpath animation, solver progress).

All geometry is transferred as JSON. The backend returns renderable data — vertices,
edges, faces as float arrays — not raw geometry objects. The frontend renders what
it receives. It does not recompute geometry.

---

## 4. User Stories

---

### Epic 1 — Application Shell

The application shell is the skeleton. Everything else plugs into it.
No geometry yet. No tools. The shell is the first visible thing.

---

**US-001 — Application loads with a 3D viewport**

As a user, when I open the application I see a 3D viewport with:
- A grid on the XY plane
- X (red), Y (green), Z (blue) axis indicators in the bottom-left corner
- Orbit, pan, and zoom controls working with mouse
- A dark background matching a professional CAD tool

Acceptance criteria:
- [ ] Viewport renders at full available size
- [ ] Left-click drag orbits the camera
- [ ] Right-click drag pans the camera
- [ ] Scroll wheel zooms toward the cursor
- [ ] Grid is visible and extends to ±500mm from origin
- [ ] Axis indicator always faces the camera (it does not orbit with the scene)
- [ ] No geometry yet — just the empty scene

---

**US-002 — Ribbon bar with tool groups**

As a user, I see a ribbon bar at the top of the application with tool groups.

MVP tool groups:
- **Sketch:** Line, Circle, Arc, Rectangle, Point, Dimension, Constraint
- **Model:** Extrude, (future: revolve, shell)
- **CAM:** Contour, Drill, (future: pocket, surface)
- **View:** Isometric, Front, Top, Right, Fit All

Acceptance criteria:
- [ ] Ribbon bar is visible at the top of the application
- [ ] Tool groups are visually separated
- [ ] Clicking a tool activates it (highlighted state)
- [ ] Active tool is shown in a status bar at the bottom
- [ ] Tools that are not yet implemented are visible but disabled (greyed out)
- [ ] Pressing Escape deactivates the current tool

---

**US-003 — Panel system**

As a user, I can see and manage panels alongside the viewport.

MVP panels:
- Feature tree (left side, default open)
- Properties (right side, default open)
- G-code editor (bottom, default closed)
- Console/output (bottom, default closed)

Acceptance criteria:
- [ ] Panels can be opened and closed
- [ ] Panels can be resized by dragging their edges
- [ ] Panel state (open/closed, size) persists across page refresh (localStorage)
- [ ] The viewport fills the remaining space when panels resize
- [ ] Panels do not overlap the viewport when resized to minimum

---

**US-004 — Status bar**

As a user, I see a status bar at the bottom of the application showing:
- Current active tool
- Cursor world coordinates (X, Y, Z) when hovering the viewport
- Current selection (what is selected and how many)
- Backend connection status (connected / disconnected)

Acceptance criteria:
- [ ] Coordinates update on every mouse move over the viewport
- [ ] Coordinates show in mm with 3 decimal places
- [ ] Connection status shows a colored indicator (green/red)
- [ ] Tool name updates immediately when a tool is activated

---

**US-005 — Backend connection**

As a user, the application connects to the Python backend on startup.

Acceptance criteria:
- [ ] Frontend shows "connected" status when backend is running
- [ ] Frontend shows "disconnected" status when backend is not running
- [ ] A disconnected state does not crash the frontend
- [ ] Reconnection is automatic when the backend comes back up

---

### Epic 2 — Sketch

A sketch is 2D geometry drawn on a plane. It is the starting point for all solid
modeling operations. Sketches are created on coordinate planes (XY, XZ, YZ) or on
planar faces of existing solids.

---

**US-010 — Create a sketch on a coordinate plane**

As a user, I can start a sketch on the XY, XZ, or YZ plane.

When I activate the sketch tool and select a plane, the viewport enters Sketch mode:
- The view rotates to look at the selected plane straight-on
- A 2D grid appears on the plane
- The cursor snaps to the grid
- 3D navigation is disabled (cannot orbit out of the sketch plane)
- The sketch plane is highlighted

Acceptance criteria:
- [ ] Three plane options are available: XY, XZ, YZ
- [ ] Entering sketch mode triggers a smooth camera transition to face the plane
- [ ] Grid appears on the selected plane at 1mm spacing (major lines at 10mm)
- [ ] Cursor coordinates are shown in the plane's local coordinate system (2D)
- [ ] Pressing Escape or clicking "Finish Sketch" exits sketch mode
- [ ] The sketch appears in the feature tree as "Sketch 1", "Sketch 2", etc.

---

**US-011 — Draw a line in a sketch**

As a user with the Line tool active in sketch mode, I can draw line segments.

Interaction:
- Click to place the start point
- Move the mouse — a preview line follows the cursor
- Click to place the end point — the line is created
- The tool immediately starts a new line from the end point (chain mode)
- Right-click or Escape ends the chain

Acceptance criteria:
- [ ] Preview line is visible while moving the mouse
- [ ] Line is created on click with correct start and end points
- [ ] Chain mode works: end of one line is start of next
- [ ] Lines appear immediately in the viewport after creation
- [ ] Lines appear in the feature tree under the current sketch
- [ ] Snap: cursor snaps to existing endpoints within 5 screen pixels
- [ ] Snap: cursor snaps to horizontal/vertical when within 3° of those directions (shown with a colored indicator)
- [ ] Undo (Ctrl+Z) removes the last placed line

---

**US-012 — Draw a circle in a sketch**

As a user with the Circle tool active, I can draw circles by center and radius.

Interaction:
- First click: places the center
- Move the mouse — a preview circle expands from the center
- Second click: sets the radius and creates the circle

Acceptance criteria:
- [ ] Preview circle is visible while moving after the center is placed
- [ ] Circle is created with correct center and radius
- [ ] Radius is displayed in the preview (e.g. "R: 15.000mm")
- [ ] Snap works: center snaps to existing geometry points

---

**US-013 — Draw an arc in a sketch**

As a user with the Arc tool active, I can draw arcs by center, start, and end.

Interaction:
- First click: places the center
- Second click: sets the radius and start angle
- Move the mouse — arc sweeps from start angle to cursor angle
- Third click: sets the end angle and creates the arc

Acceptance criteria:
- [ ] Three-click arc creation works correctly
- [ ] Arc direction (CW/CCW) follows the mouse movement direction
- [ ] Arc preview is visible and accurate throughout

---

**US-014 — Dimension constraints**

As a user, I can add dimensional constraints to sketch geometry.

Supported constraints for MVP:
- Horizontal distance between two points
- Vertical distance between two points
- Length of a line
- Radius of a circle or arc
- Angle between two lines

Interaction:
- Activate the Dimension tool
- Click the entity to dimension (a line, a circle, two points)
- A dimension line appears with an input field
- Type the desired value and press Enter
- The geometry updates to satisfy the constraint

Acceptance criteria:
- [ ] Clicking a line adds a length dimension
- [ ] Clicking a circle adds a radius dimension
- [ ] The input field appears near the geometry (not in a side panel)
- [ ] Pressing Enter applies the constraint and runs the solver
- [ ] The geometry moves to satisfy the constraint
- [ ] Over-constrained state is shown visually (red entities)
- [ ] Under-constrained entities are shown in blue
- [ ] Fully constrained entities are shown in black
- [ ] Dimension value is displayed on the dimension line after creation

---

**US-015 — Geometric constraints**

As a user, I can add geometric constraints between sketch entities.

Supported constraints for MVP:
- Horizontal (line is horizontal)
- Vertical (line is vertical)
- Coincident (two points share the same location)
- Perpendicular (two lines are at 90°)
- Parallel (two lines are parallel)
- Equal (two lines have the same length, or two circles have the same radius)
- Fixed (a point cannot move)
- Tangent (a line meets a circle tangentially)

Acceptance criteria:
- [ ] Each constraint is accessible from the ribbon Sketch group
- [ ] Applying a constraint runs the solver immediately
- [ ] Conflicting constraints show an error state visually
- [ ] Constraints are listed in the properties panel when a constrained entity is selected
- [ ] Constraints can be deleted (select in properties panel, press Delete)

---

**US-016 — Sketch solver**

The sketch solver runs automatically whenever constraints change.
This is powered by the Python backend.

Acceptance criteria:
- [ ] Solver runs within 50ms for sketches with fewer than 50 constraints
- [ ] Solver result updates the geometry in the viewport immediately
- [ ] Solver failure (no solution) shows a clear error state, does not crash
- [ ] DOF count is shown in the status bar while in sketch mode
- [ ] A sketch with DOF = 0 is considered fully defined

---

**US-017 — Finish sketch**

As a user, I can finish a sketch and return to 3D model mode.

Acceptance criteria:
- [ ] Clicking "Finish Sketch" or pressing Escape from the sketch tool exits sketch mode
- [ ] The camera returns to the previous 3D view with a smooth transition
- [ ] The sketch geometry is visible in the 3D viewport as a flat profile on its plane
- [ ] The sketch appears in the feature tree and can be selected
- [ ] Double-clicking the sketch in the feature tree re-enters sketch mode for editing

---

### Epic 3 — Solid Modeling

Solid modeling creates 3D objects from sketch profiles.
MVP supports extrude only. The kernel builds solids from wireframe — faces are
constructed from closed wire loops, and the solid is the volume they enclose.

---

**US-020 — Extrude a sketch profile**

As a user, I can extrude a closed sketch profile into a solid.

Interaction:
- Select a closed sketch profile (or the sketch itself if it contains one closed profile)
- Activate the Extrude tool
- A properties panel appears: depth, direction (positive/negative Z), symmetric
- A preview solid appears in the viewport, updating live as depth changes
- Click OK or press Enter to confirm

Acceptance criteria:
- [ ] Only closed profiles can be extruded (open sketches show an error)
- [ ] Preview updates in real time as the depth value changes
- [ ] The resulting solid is rendered with flat shading and visible edges
- [ ] The solid appears in the feature tree as "Extrude 1", "Extrude 2", etc.
- [ ] The solid can be selected in the viewport
- [ ] Selecting the solid shows its properties: depth, volume (estimated), bounding box

---

**US-021 — Select faces and edges of a solid**

As a user, I can select faces and edges of a solid for downstream operations.

Acceptance criteria:
- [ ] Hovering over a face highlights it
- [ ] Hovering over an edge highlights it
- [ ] Clicking a face selects it (shown in properties panel: face area, normal direction)
- [ ] Clicking an edge selects it (shown in properties panel: length, adjacent faces)
- [ ] Shift+click adds to selection
- [ ] Selected entities are shown in the properties panel
- [ ] Pressing Escape clears selection

---

**US-022 — Create a sketch on a solid face**

As a user, I can start a new sketch on a planar face of an existing solid.

Interaction:
- Select a planar face of a solid
- Click "New Sketch" in the ribbon (or right-click the face → New Sketch)
- The viewport enters sketch mode, constrained to the selected face's plane

Acceptance criteria:
- [ ] Only planar faces can be used as sketch planes (curved faces show an error)
- [ ] The sketch plane is the face's plane — the local coordinate system is shown
- [ ] Sketch geometry drawn on this plane appears on the face surface in 3D
- [ ] The sketch appears in the feature tree as a child of the solid

---

**US-023 — Extract wireframe from a solid**

As a user, I can extract the wireframe (all edges) from a solid as geometry.

Use case: import a solid (from a future STEP import feature) and get its edges as
sketch geometry to use for CAM operations.

Acceptance criteria:
- [ ] Selecting a solid and running "Extract Wireframe" produces a set of edges
- [ ] Each edge is a Line, Arc, or Bezier entity in world space
- [ ] The extracted wireframe appears in the feature tree
- [ ] The extracted edges can be used as CAM geometry

---

**US-024 — Slice a solid with a plane**

As a user, I can slice a solid with a coordinate plane or an offset plane and get
the cross-section as a 2D sketch profile.

Use case: inspect the internal geometry of a solid; extract a profile at a specific
Z height for 2.5D CAM operations.

Interaction:
- Select a solid
- Activate Slice tool
- Choose the cutting plane (XY at Z=10, for example)
- The cross-section is shown as a highlighted profile on the plane
- Click OK to extract it as a new sketch

Acceptance criteria:
- [ ] Slicing produces the correct closed wire at the intersection
- [ ] The result is a new sketch in the feature tree
- [ ] The slice preview updates when the plane position changes
- [ ] Multiple closed loops (e.g. a hollow solid) each produce separate closed profiles

---

### Epic 4 — File Import

---

**US-030 — Import STEP file**

As a user, I can import a STEP file and see the solid in the 3D viewport.

This uses pythonocc on the backend to read the STEP file. The geometry is extracted
back to our internal types (edges as Line/Arc, faces as planar or curved meshes)
and sent to the frontend for rendering.

Acceptance criteria:
- [ ] STEP files up to 50MB load within 10 seconds
- [ ] The solid is displayed in the viewport after import
- [ ] Faces are selectable
- [ ] Edges are selectable
- [ ] The solid appears in the feature tree as "Imported: filename"
- [ ] Import errors show a clear message (not a stack trace)

---

**US-031 — Import DXF file**

As a user, I can import a DXF file and get its geometry as sketch entities.

Acceptance criteria:
- [ ] Lines, circles, arcs, and polylines from the DXF appear as sketch geometry
- [ ] The geometry is placed on the XY plane by default
- [ ] The user can specify a plane before import
- [ ] Scale is preserved (DXF units are respected)
- [ ] Import errors show a clear message

---

### Epic 5 — G-code Parser and Visualizer

The G-code system is three independent pieces:
1. **Parser** — text → structured program object (dialect-specific, swappable)
2. **Simulator** — program object → sequence of 3D moves (dialect-independent)
3. **Visualizer** — sequence of moves → animated Three.js rendering (frontend)

---

**US-040 — Parse a G-code file (Fanuc dialect)**

As a user, I can load a G-code file and have it parsed into a structured program.

The Fanuc parser handles:
- G00 (rapid move), G01 (linear feed), G02/G03 (circular arc CW/CCW)
- G17/G18/G19 (plane selection)
- G20/G21 (inch/mm)
- G90/G91 (absolute/incremental)
- G43 (tool length compensation), G49 (cancel TLC)
- G54–G59 (work coordinate systems)
- M03/M04/M05 (spindle on/off), M08/M09 (coolant), M30 (program end)
- T (tool number), S (spindle speed), F (feed rate)
- Comments in parentheses and semicolons
- Line numbers (N words)
- Subprograms (M98/M99) — MVP: flatten into main program

Acceptance criteria:
- [ ] Valid Fanuc G-code parses without errors
- [ ] Parser errors identify the line number and the unexpected token
- [ ] Parsed program is a structured object: list of blocks, each block has G/M/axis words
- [ ] Modal state is tracked: active plane, units, positioning mode, active WCS
- [ ] Parser output can be serialized to JSON for the frontend
- [ ] Parser is tested independently with a test suite (no frontend required)

---

**US-041 — Simulate a parsed G-code program**

As a user, the simulator converts a parsed G-code program into a sequence of 3D moves.

The simulator is dialect-independent — it consumes the structured program object,
not raw G-code text. Swapping the parser does not affect the simulator.

Each move is one of:
- Rapid move: start point, end point, feed rate = infinity
- Linear move: start point, end point, feed rate
- Arc move: start point, end point, center point, radius, direction (CW/CCW), plane

Acceptance criteria:
- [ ] All G00, G01, G02, G03 blocks produce the correct move type
- [ ] Arc center and radius are computed correctly from I/J/K or R parameters
- [ ] WCS offsets (G54–G59) are applied correctly to all positions
- [ ] Tool length compensation is tracked and reported (but not applied to positions in MVP)
- [ ] Simulation output is a flat list of moves with 3D start/end/center coordinates
- [ ] Total program statistics: number of moves, estimated time (at face value feed rates), total path length

---

**US-042 — Visualize a toolpath in the 3D viewport**

As a user, I can see the parsed G-code program as a 3D toolpath in the viewport.

Visualization:
- Rapid moves: dashed line in a distinct color (e.g. red)
- Feed moves: solid line in a distinct color (e.g. green)
- Arc moves: arc curve in a distinct color (e.g. blue)
- The tool position indicator moves along the path during playback

Acceptance criteria:
- [ ] All three move types are visually distinct
- [ ] The toolpath renders in 3D space at the correct coordinates
- [ ] Playback controls: play, pause, step forward, step backward, slider to scrub
- [ ] Current tool position is shown as a small 3D indicator (cone or cylinder)
- [ ] Current block is highlighted in the G-code editor panel during playback
- [ ] Speed control: 0.1x to 10x playback speed
- [ ] Clicking a line in the G-code editor jumps the toolpath to that position

---

**US-043 — G-code editor panel**

As a user, I have a G-code editor panel where I can view and edit G-code text.

Acceptance criteria:
- [ ] G-code text is displayed with line numbers
- [ ] Syntax highlighting: G/M words in one color, axis words in another, comments in another
- [ ] The panel is scrollable and resizable
- [ ] Editing the text and pressing "Parse" re-parses the program
- [ ] Parse errors are shown inline (red underline on the problematic line)
- [ ] The current playback position is highlighted during toolpath animation
- [ ] Load from file: file picker opens the system file dialog

---

### Epic 6 — CAM

CAM operations take selected geometry and produce toolpaths.
The toolpath is a G-code program in the internal format, which can then be
simulated and exported.

MVP: Contour (3D), Drill.
All CAM computation happens in the Python backend.

---

**US-050 — Define a tool library**

As a user, I can define cutting tools used in CAM operations.

Tool parameters:
- Tool number (T01, T02, etc.)
- Tool type: end mill, ball mill, drill
- Diameter
- Flute length
- Overall length
- Number of flutes
- Material (HSS, carbide)
- Notes

Acceptance criteria:
- [ ] Tool library is accessible from the CAM ribbon group
- [ ] Tools can be added, edited, and deleted
- [ ] Tool library persists to a JSON file in the project
- [ ] A tool must be selected before a CAM operation can be created
- [ ] Tool library can be exported and imported as JSON

---

**US-051 — 3D Contour operation**

As a user, I can create a 3D contour toolpath that follows a selected edge or curve
in 3D space.

Interaction:
- Select one or more edges/curves in the viewport
- Activate Contour tool
- Set parameters: tool, feed rate, spindle speed, step down, passes, approach height
- Preview appears in the viewport
- Click OK to generate the toolpath

Parameters:
- Cutting tool (from tool library)
- Feed rate (mm/min)
- Spindle speed (RPM)
- Approach height (rapid height above part, mm)
- Depth of cut (how far below the edge to cut, for contours along top edges = 0)
- Number of passes (for roughing: multiple depth passes)
- Tool side: left / right / center (tool radius compensation direction)

Acceptance criteria:
- [ ] Toolpath follows the selected geometry in 3D space
- [ ] Tool radius compensation offset is applied correctly
- [ ] Multiple depth passes are generated when specified
- [ ] Approach and retract moves are generated at the approach height
- [ ] Toolpath is shown as a preview in the viewport before confirmation
- [ ] Confirmed toolpath appears in the feature tree
- [ ] Toolpath can be simulated (US-042)

---

**US-052 — Drill operation**

As a user, I can create a drilling toolpath at selected points.

Interaction:
- Select one or more points (sketch points, circle centers, arc centers)
- Activate Drill tool
- Set parameters: tool, feed rate, spindle speed, depth, peck depth, approach height
- Click OK to generate

Parameters:
- Cutting tool (drill from tool library)
- Drill depth (from the top of the hole to the bottom, mm)
- Peck depth (0 = no peck, >0 = peck drilling cycle)
- Approach height
- Feed rate
- Spindle speed

G-code output uses G81 (drill) or G83 (peck drill) canned cycles.

Acceptance criteria:
- [ ] One drill cycle is generated per selected point
- [ ] G81 is used when peck depth = 0
- [ ] G83 is used when peck depth > 0
- [ ] Approach and retract moves connect the drill cycles
- [ ] Tool center is positioned exactly at the selected point
- [ ] Toolpath is shown as vertical lines in the viewport preview

---

**US-053 — Export G-code**

As a user, I can export the generated toolpaths as a G-code file.

Acceptance criteria:
- [ ] All CAM operations in the feature tree are combined into one G-code program
- [ ] Output dialect is Fanuc (MVP — more dialects in future releases)
- [ ] The G-code file can be downloaded from the browser
- [ ] The exported file includes: a preamble (units, absolute mode, safe height),
      each operation in sequence, and a safe end (spindle off, coolant off, M30)
- [ ] Tool changes (M06) are inserted between operations that use different tools
- [ ] The exported file parses correctly in the application's own G-code parser

---

### Epic 7 — Project Management

---

**US-060 — Project file**

As a user, I can save and load a project.

A project contains:
- All sketches (entities and constraints)
- All solid modeling operations (extrude, etc.)
- All imported geometry
- All CAM operations and tool library
- All viewport state (camera position, visible layers)

Acceptance criteria:
- [ ] Save project writes a JSON file to the local filesystem
- [ ] Load project restores the complete state
- [ ] Project file version is stored — future versions can detect old files
- [ ] Save is triggered by Ctrl+S
- [ ] Unsaved changes are indicated in the window title (asterisk)
- [ ] Closing with unsaved changes prompts the user

---

**US-061 — Undo / Redo**

As a user, I can undo and redo any modeling operation.

Acceptance criteria:
- [ ] Ctrl+Z undoes the last operation
- [ ] Ctrl+Shift+Z (or Ctrl+Y) redoes the last undone operation
- [ ] Undo/redo works for: sketch entity creation, constraint addition, extrude, CAM operation
- [ ] The feature tree updates correctly after undo/redo
- [ ] Undo stack is limited to 100 operations

---

## 5. What Is Out of Scope for MVP

The following are explicitly out of scope. They are listed here so they do not
get built accidentally or asked about during MVP development.

- Turning / lathe operations
- Multi-axis machining (4th and 5th axis)
- Surface machining strategies (scallop, parallel passes over freeform surfaces)
- Boolean operations on solids (union, difference, intersection)
- Loft, sweep, revolve modeling operations
- Assembly management (multiple parts in one scene)
- Drawing / drafting output (2D engineering drawings)
- Cloud storage or collaboration
- Real machine connection (DNC, drip feeding)
- Post-processor customization (beyond the Fanuc default)
- Material removal simulation (visual chip clearing)
- Collision detection between tool and workpiece
- Feeds and speeds calculator (values are entered manually)

---

## 6. System Constraints

- The frontend runs in a modern browser (Chrome/Edge latest, Firefox latest)
- The backend runs locally on the user's machine (Python 3.11+)
- No internet connection required after initial setup
- The application must function on Windows, macOS, and Linux
- All geometry is in millimeters internally. Display units are user-configurable.
- The Python backend starts on port 8000 by default (configurable)
- The frontend is served by Vite dev server on port 5173 (configurable)

---

## 7. Open Questions

These are unresolved decisions that will be answered during development:

1. **WebSocket vs polling for solver updates:** the constraint solver is fast enough
   for REST (< 50ms) for simple sketches. At what sketch complexity do we switch
   to WebSocket streaming?

2. **Kernel geometry transfer format:** sending vertices as JSON arrays has parsing
   overhead. At what geometry size does binary transfer (ArrayBuffer over WebSocket)
   become necessary?

3. **Three.js geometry lifecycle:** who is responsible for disposing Three.js
   geometry when entities are deleted? Define the ownership model before the
   first geometry entity is created.

4. **Feature tree ordering and dependency tracking:** when the user edits Sketch1
   which is the basis for Extrude1, the extrude must rebuild. How is this dependency
   tracked, and what is the rebuild order for complex feature trees?

5. **Arc representation in G-code export:** G02/G03 with I/J vs R parameter.
   I/J is unambiguous but more complex to compute. R is simpler but ambiguous for
   arcs > 180°. Decision needed before G-code export is implemented.