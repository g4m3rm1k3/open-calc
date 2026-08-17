# Reference: Tool Geometry Data & Revolve Technique

Pulled from `cam project/cnc-web` (a separate, existing React/Three.js
CNC project) on 2026-08-17, for the Slice 10 (Three.js) lessons in
this curriculum. Copied for reference only — not part of this
project's own code.

## The database format

`Untitled.TOOLDB` (also pasted into this folder) is a **Mastercam**
tool-library SQLite file (manufacturers present: Mastercam, ISCAR,
MA Ford). Tables are prefixed `Tl*`. Sample data in this file: 4
tools, 8 assembly items, 4 holders, 20 tool types — small, real,
good lesson-sized data. No embedded CAD blobs (`TlGraphicsFile` is
empty in this copy) — geometry comes from profile data instead.

Key tables for 3D rendering:
- `TlProfileData` — a flattened 2D profile per tool: `x0,y0,x1,y1`
  (line segments) or `radius,StartAngle,SweepAngle` (arcs), keyed by
  `ItemID` + `Segment` order.
- `TlToolMill` / `TlToolEndmill` / `TlToolDrill` — dimensional fields:
  `OverallDiameter`, `OverallLength`, `CuttingDepth`, `ArborDiameter`,
  `FluteCount`, etc.
- `TlAssemblyItem.IsMetric` — inch vs. mm, per item.

## The profile convention (confirmed twice: DB values + working code)

**`x` = radius (distance from the tool's centerline), `y` = axial
position (distance along the tool's length).** This is not a
guess — `cnc-web/src/toolAssembly.ts` states it was confirmed by
hand-tracing a real holder profile and independently by scaling one in
real Mastercam and observing it render fatter.

## The revolve technique

A tool is a solid of revolution: take the 2D profile, revolve it
360° around its own axis. Three.js has a built-in geometry for exactly
this — `THREE.LatheGeometry` — and its `x`/`y` convention happens to
match the database's convention exactly, so no axis remapping is
needed:

```ts
import * as THREE from "three";

interface ProfilePoint { x: number; y: number; }

function revolveProfile(points: ProfilePoint[], segments = 32): THREE.LatheGeometry {
  const vector2Points = points.map((p) => new THREE.Vector2(p.x, p.y));
  return new THREE.LatheGeometry(vector2Points, segments);
}
```

When full profile data isn't needed/available, a simplified profile
can be built from just four dimensions (diameter, cutting depth, total
length, arbor/shank diameter) — cylinder at full diameter through the
cutting depth, stepped down to shank diameter for the rest, closed
back to the axis at both ends so the revolve produces a closed solid
(not a shape with a hole down the centerline):

```ts
interface ToolDimensions {
  diameter: number;
  cutting_depth: number;
  total_length: number;
  arbor_diameter: number;
}

function buildToolProfile(tool: ToolDimensions): ProfilePoint[] {
  const tipRadius = tool.diameter / 2;
  const shankRadius = tool.arbor_diameter / 2;
  return [
    { x: 0, y: 0 },
    { x: tipRadius, y: 0 },
    { x: tipRadius, y: tool.cutting_depth },
    { x: shankRadius, y: tool.cutting_depth },
    { x: shankRadius, y: tool.total_length },
    { x: 0, y: tool.total_length },
  ];
}
```

## A real gotcha worth teaching deliberately

`cnc-web` shipped with tool geometry and toolpath geometry in the same
Three.js scene, both assumed to be in the same units. Inch-based tools
weren't being converted to millimeters, so an inch tool rendered at
1/25.4 its correct size relative to everything else in the scene — a
bug invisible until geometry from two different sources shared one
coordinate space. Worth reproducing deliberately as a debugging moment
rather than just avoiding it by fiat:

```ts
const INCH_TO_MM = 25.4;
function toMillimeters(value: number, isMetric: boolean): number {
  return isMetric ? value : value * INCH_TO_MM;
}
```

## Note

`cam project` (the parent folder of `cnc-web`) turns out to be a much
larger, long-running project with its own extensive curriculum
(`CURRICULUM.md`, `LessonContract`, 100+ numbered build-log steps).
I did not explore beyond `cnc-web/src` — pulled only the tool-geometry
piece above, per the usual rule of keeping this project self-contained.
Say the word if you want anything else pulled from over there
(e.g. its actual `LessonContract` schema definition, since this
project has been citing that name without a copy of its own).
