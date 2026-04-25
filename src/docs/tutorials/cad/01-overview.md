# CadPro — How The Code Works

## Entry Point

React calls one function: `export default function CADPro()`. Everything else
only runs because something inside that function calls it.

## The 8 Branches

From the entry point, the component sets up 8 things in order:

| Branch | What it does |
|--------|-------------|
| 1 — Theme | Watches dark/light mode, updates global colour object `C` |
| 2 — State | All React-watched data: features, mode, tool, camera HUD |
| 3 — Refs | Live data that changes too fast for React: camera, drag state |
| 4 — solids | Builds 3D geometry from the feature tree (useMemo) |
| 5 — draw | The entire renderer — canvas 2D, called by effects and handlers |
| 6 — Effects | Canvas sizing, state sync, redraw triggers, scroll zoom |
| 7 — Mouse | Orbit, pan, sketch tools, snap, hover detection |
| 8 — JSX | Layout, panels, wires handlers to canvas |

## The Data Pipeline

```
User draws a rectangle
  → onMouseDown creates 4 line entities
  → setState adds them to sketch.entities
  → state.features changed → solids useMemo re-runs
  → buildSolid finds the sketch, extracts profile, calls extrudeProfile
  → extrudeProfile returns {verts, faces, edges}
  → draw() re-runs via Effect 3
  → Projects every face vertex through proj3d
  → Sorts faces back-to-front (painter's algorithm)
  → Fills each face with Lambert lighting colour
  → Canvas shows the solid
```

## Known Bugs

### 1. Profile extraction (buildSolid, the main bug)

The code grabs `lines[0].x2, lines[1].x2, lines[2].x2` by array index.
It assumes lines are stored in connection order. They're not — they're stored
in draw order.

**Fix needed:** Trace the connection graph. Start at one endpoint, find which
line connects to it, follow to the far end, repeat until you're back at start.

### 2. Revolve never runs

`revolveProfile()` is written and correct. The useMemo checks for `"revolve"`
type but `buildSolid` has no revolve branch — it falls through silently.

**Fix needed:** Add `else if (feature.type === "revolve")` that calls `revolveProfile`.

### 3. Constraint solver is disconnected

`solveConstraints()` computes where constrained points should be but its
return value is never used. Sketches build geometry from raw click coordinates.

**Fix needed:** Call solver before profile extraction, use solved positions.
