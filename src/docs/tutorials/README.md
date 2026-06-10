# CAM System Masterclass

## Building a Real CAD/CAM Application — From Zero to Expert

---

## What This Is

This masterclass synthesizes every tutorial in this workspace into a single,
coherent, build-first course. You build one application from the first line of
code to a working 3D-enabled CAM system with G-code export, toolpath simulation,
and a path toward a native C++ version.

**Nothing is theoretical.** Every concept is introduced at the exact moment
the project needs it. Every lab ends with a working, usable state of the app.

**You are always building the same app.** You are not switching projects. The
architecture you write in Lab 01 is the architecture running in Lab 10 — you
will have only added to it, never thrown it away.

---

## The Pedagogy

This series follows three rules:

**Rule 1 — Derive before you implement.**
When math appears, write the formula on paper before typing it. If you copy a
formula without understanding it, you will have working code and no knowledge.
The derivation is the learning.

**Rule 2 — Earn the abstraction.**
You will not use a library for something you haven't built by hand first. You
will not use a framework for layout until you understand what the framework does.
The moment you reach for a tool you don't understand, you've lost.

**Rule 3 — The app is the textbook.**
When something breaks, the break is the lesson. When a design decision turns
out to be wrong, redesigning it is the curriculum. This series does not prevent
you from making mistakes — it teaches you to make them deliberately, understand
them, and fix them.

---

## How to Use This Series

### The Diverge Point

Every lab contains **DIVERGE POINT** sections. These mark places where the app
can grow in a different direction than the lab covers. If you choose to explore
a diverge point, you will eventually diverge from the tutorial path.

**That is fine.** The tutorials are not a fixed rail. They are a reference. If
you've diverged, you can return to any later lab and compare your architecture
against the tutorial's — the concepts are the same, even if the code is not.

### The Build Steps

Every lab contains **BUILD** steps. Stop reading. Build the thing. Confirm it
works. Then continue. Skipping build steps is the fastest way to get stuck.

### The Failure Log

After each lab, write down what broke during development and why. This is not
busy work. When you build the C++ version in the expert track, your failure log
is the specification — every edge case your JavaScript version handled is a
test case for the native version.

---

## The Application in Plain Language

A CAM system does six things:

1. **Geometry definition** — the user defines the shape to be machined (lines,
   circles, arcs, rectangles, imported 3D models)
2. **Tool library** — the cutting tools available (diameter, type, material)
3. **Tool assignment** — which tool machines which geometry
4. **Toolpath generation** — the path the tool center follows (computed from
   geometry + tool diameter + operation type)
5. **Simulation** — animate the toolpath to verify it before cutting metal
6. **G-code export** — output the machine-readable program that controls the CNC

Every lab advances all six of these systems simultaneously. In Lab 01, each
system is a stub — the shape of the thing. By Lab 10, every stub is complete.

---

## File Structure — The Final Project

This is what you are building toward. Every lab adds files to this structure.
Do not create files in advance — let each lab tell you when to add them.

```
cam/
  index.html              ← App entry point. Grows every lab.
  styles/
    app.css               ← All CSS. Grows every lab.
  js/
    main.js               ← Orchestrates everything. Grows every lab.
    math/
      Vector2.js          ← Lab 03: 2D math primitives
    geometry/
      Geometry.js         ← Lab 03: base class + registry
      Line.js             ← Lab 03
      Circle.js           ← Lab 03
      Arc.js              ← Lab 03
      Rectangle.js        ← Lab 04
      Point.js            ← Lab 04
    renderer/
      Renderer2D.js       ← Lab 03: draws geometry from state
    ui/
      Toolbar.js          ← Lab 02: ribbon/toolbar system
      Panel.js            ← Lab 02: resizable dock panels
      StatusBar.js        ← Lab 02: status bar manager
    history/
      Command.js          ← Lab 04: command pattern, undo/redo
    tools/
      ToolLibrary.js      ← Lab 05: tool objects + management
    operations/
      Operation.js        ← Lab 05: geometry→tool assignment
      ToolpathEngine.js   ← Lab 07: generate toolpaths
    gcode/
      Parser.js           ← Lab 06: parse G-code text
      Backplotter.js      ← Lab 06: render parsed toolpath
      Exporter.js         ← Lab 07: geometry → G-code text
    scene3d/
      Scene3D.js          ← Lab 08: Three.js 3D scene
      Viewport3D.js       ← Lab 08: 3D camera + controls
```

---

## Lab Roadmap

| Lab    | Title                   | You Build                                                          | New Concepts                                              |
| ------ | ----------------------- | ------------------------------------------------------------------ | --------------------------------------------------------- |
| **01** | **The Viewport**        | Canvas, grid, coordinate transforms, pan/zoom, status bar          | Coordinate spaces, render loop, CSS design tokens         |
| **02** | **The App Shell**       | Full UI: toolbar, dock panels, layout system                       | CSS Grid layout, design systems, PySide6 mapping          |
| **03** | **The Geometry Engine** | ES modules, Vector2, all geometry types, renderer                  | Module system, dispatch tables, separation of concerns    |
| **04** | **Interaction**         | Click-to-select, hit testing, edit, delete, undo/redo              | Command pattern, parametric hit testing, state machines   |
| **05** | **Tools & Operations**  | Tool library, tool assignment, visibility by tool                  | Object relationships, observer pattern                    |
| **06** | **G-code Backplotter**  | G-code parser, toolpath visualization, hover-to-inspect            | Modal state machines, arc math, backplotting              |
| **07** | **2D CAM**              | Offset geometry, profile toolpaths, pocket clearing, G-code export | Polygon offset, lead-in/out, G-code generation            |
| **08** | **Into 3D**             | Three.js scene, 3D viewport tab, basic 3D geometry                 | Scene graph, 3D coordinate systems, GPU pipeline concepts |
| **09** | **Simulation**          | Toolpath animation, machine position indicator, time scrubber      | Animation loop, linear interpolation, event-driven UI     |
| **10** | **Expert Path**         | C++ geometry kernel intro, Python bridge, performance profiling    | Compilation model, FFI, profiling, native vs scripted     |

---

## Prerequisites

**You need:**

- A text editor (VS Code strongly recommended)
- A browser (Chrome or Edge — for DevTools)
- Live Server VS Code extension (installed, not yet running)
- Basic JavaScript: variables, functions, arrays. If shaky, read
  **javascript.info** Chapters 1–5 before starting.

**You do not need:**

- Any framework knowledge
- Node.js (until Lab 10)
- Any CAD/CAM background — it is explained when it matters

---

## The Parallel C++ Track

Starting in Lab 01, a sidebar appears in each lab labeled **C++ TRACK**. These
are small, weekly exercises in C++ that run alongside the JavaScript work. They
are not connected to the app yet — they build the language fluency you need for
Lab 10 and beyond.

One exercise per lab. One hour per week. By Lab 10, C++ will feel like a familiar
tool rather than a foreign language.

---

## The Connection to Your Other Tutorials

This series synthesizes content from all files in this workspace. Where specific
source material is particularly strong, it is noted:

- **Coordinate transforms, grid math** → best source: CAM-LAB-1.md
- **ES modules architecture** → best source: CAM-LAB-2.md
- **Pan/zoom, hit testing** → best source: CAM-LAB-3.md, Cad cam labs 2 4.md
- **UI shell, dock system** → best source: front_end_ui_mastercalss.md
- **UX philosophy** → best source: UX UI MASTERCLASS.md
- **G-code parsing** → best source: Cad cam labs 2 4.md (Lab 2)
- **3D scene, Three.js** → best source: Cad cam labs 5 9.md (Lab 5)
- **CAM toolpaths, scallop math** → best source: Cad cam labs 10 12.md
- **Pedagogy, build loops** → best source: CADCAM_LEARNING_GUIDE.md
- **C++ track** → best source: Curriculum full.md, Phase 3.md

The original tutorials are unchanged. This masterclass is a synthesis.

---

_Start with [Lab 01 — The Viewport](LAB-01-THE-VIEWPORT.md)._
