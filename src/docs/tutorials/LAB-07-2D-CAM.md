# Lab 07 — 2D CAM: From Geometry to Toolpath

### CAM System Masterclass

---

## What You Will Build

By the end of this lab you can:

- **Detect profiles** — find connected chains of geometry that form closed loops
- **Offset a profile** — apply cutter radius compensation to machine the correct size
- **Generate a contour toolpath** — produce the sequence of moves to machine around a closed loop
- **Generate a pocket toolpath** — fill the interior of a closed loop with parallel passes
- **Emit real G-code** — write the toolpath out as a `.nc` file you can send to a machine
- **Backplot your own output** — verify the generated G-code with the backplotter from Lab 06

This is the core of a CAM system. Everything else (3D, simulation, multi-axis) is built on top of these ideas.

**Time:** 6–9 hours.

---

## Part 1 — What is 2D CAM?

### Geometry versus toolpath

The geometry you draw in the viewport describes the **part you want to make** —
the design intent. The toolpath describes **what the cutter actually does** —
the sequence of moves that removes material to produce that part.

These are different. Consider machining a square hole:

```
Design:              Toolpath (with 5mm tool, contour operation):

  ┌────────┐            ┌──────────┐
  │        │   →        │          │
  │        │            │  ┌────┐  │
  └────────┘            │  │    │  │
                        └──┴────┴──┘
                           ↑ offset outward by tool radius
```

The cutter centre must travel on a path **offset by the tool radius** so the
cutting edge arrives at the design line.

### The CAM pipeline

```
User geometry (Lines, Circles, Arcs)
    ↓
Profile detection  — find connected closed loops
    ↓
Operation — Contour or Pocket, with parameters (tool ⌀, depth, stepdown, feed)
    ↓
Toolpath  — list of { type: 'rapid'|'feed'|'arc', from, to, ... }
    ↓
G-code emitter — convert toolpath to G-code text
    ↓
G-code file  — save / send to machine
```

Each stage is independent. The profile detector does not know about tools. The
G-code emitter does not know about geometry. This makes the system testable and
extensible.

---

## Part 2 — Profile Detection

### What is a profile?

A profile is a **closed chain** of connected geometry objects. Two objects are
connected if an endpoint of one is within a **tolerance distance** (typically
0.001mm) of an endpoint of the other.

For example, four lines forming a square are a closed profile:

```
  A ──── B
  |      |
  D ──── C
```

`A-B` connects to `B-C` (shared point B). `B-C` to `C-D`. `C-D` to `D-A`.
`D-A` back to `A-B`. Closed.

An open chain (like an arc that does not meet the next line) is an **open
profile** — you can still machine it as a path, but you cannot pocket it.

### Building the connection graph

Think of geometry as a graph. Endpoints are **nodes**. Geometry objects are
**edges** between two nodes. We want to find **cycles** (closed loops).

The simplest approach for 2D CAM:

1. Collect all endpoints of all geometry objects.
2. Two endpoints that are within `TOLERANCE` of each other are the **same node** (merge them).
3. Walk the graph: start at any node, follow connections, and stop when you
   return to the start node.

Create `cam/js/cam/Profile.js`:

```js
// Profile.js
// Detect connected chains (profiles) in a set of geometry objects.

const TOLERANCE = 0.001; // mm — points closer than this are considered the same

// ── Endpoint helpers ───────────────────────────────────────────────────────────

// Get the two endpoints of any geometry object.
// For a Line: p1 and p2.
// For an Arc: the point on the arc at startAngle and endAngle.
// Circles have no endpoints (they are infinite loops by themselves).
function getEndpoints(geom) {
  if (geom.type === "line") {
    return [geom.p1, geom.p2];
  }
  if (geom.type === "arc") {
    const { centre, radius, startAngle, endAngle } = geom;
    return [
      {
        x: centre.x + radius * Math.cos(startAngle),
        y: centre.y + radius * Math.sin(startAngle),
      },
      {
        x: centre.x + radius * Math.cos(endAngle),
        y: centre.y + radius * Math.sin(endAngle),
      },
    ];
  }
  return []; // circle: no endpoints
}

// Are two points within TOLERANCE of each other?
function pointsMatch(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= TOLERANCE * TOLERANCE;
}

// ── Profile detection ──────────────────────────────────────────────────────────

// A Profile is: { geoms: [...], closed: bool }
// 'geoms' is ordered — each consecutive pair shares an endpoint.

export function detectProfiles(geometryList) {
  // Filter to geometry that can be part of a profile
  const eligible = geometryList.filter(
    (g) => g.type === "line" || g.type === "arc",
  );

  // Circles are complete profiles by themselves
  const profiles = [];
  for (const g of geometryList) {
    if (g.type === "circle") {
      profiles.push({ geoms: [g], closed: true });
    }
  }

  // For lines and arcs: build adjacency list
  // adjacency[i] = list of indices j where eligible[i] connects to eligible[j]
  const n = eligible.length;
  const adjacency = Array.from({ length: n }, () => []);

  for (let i = 0; i < n; i++) {
    const epI = getEndpoints(eligible[i]);
    for (let j = i + 1; j < n; j++) {
      const epJ = getEndpoints(eligible[j]);
      // Check all endpoint combinations
      for (const pi of epI) {
        for (const pj of epJ) {
          if (pointsMatch(pi, pj)) {
            adjacency[i].push(j);
            adjacency[j].push(i);
          }
        }
      }
    }
  }

  // Walk connected components
  const visited = new Array(n).fill(false);

  for (let start = 0; start < n; start++) {
    if (visited[start]) continue;

    // BFS/DFS to collect all connected geometry
    const chain = [];
    const queue = [start];
    visited[start] = true;

    while (queue.length > 0) {
      const idx = queue.shift();
      chain.push(eligible[idx]);
      for (const nbr of adjacency[idx]) {
        if (!visited[nbr]) {
          visited[nbr] = true;
          queue.push(nbr);
        }
      }
    }

    if (chain.length === 0) continue;

    // A chain is closed if every endpoint is shared with another geometry.
    // Quick check: if chain has n elements and all endpoints are matched,
    // a closed polygon has exactly n*2 endpoints matching in pairs = n pairs.
    const closed = isClosedChain(chain);
    profiles.push({ geoms: chain, closed });
  }

  return profiles;
}

// ── Is a chain closed? ─────────────────────────────────────────────────────────

function isClosedChain(chain) {
  // Collect all endpoints. A closed chain has every endpoint matched exactly once.
  const allPoints = chain.flatMap(getEndpoints);

  // For each point, count how many other points match it
  let unmatchedCount = 0;
  for (const p of allPoints) {
    const matchCount = allPoints.filter((q) => pointsMatch(p, q)).length;
    if (matchCount < 2) unmatchedCount++; // this endpoint has no partner
  }

  return unmatchedCount === 0;
}
```

### Testing profile detection

```js
// In browser console or a test file:
import { detectProfiles } from "./js/cam/Profile.js";
import { Line } from "./js/geometry/Line.js";
import { Vector2 } from "./js/math/Vector2.js";

// A square: four lines forming a closed loop
const sq = [
  new Line(new Vector2(0, 0), new Vector2(10, 0)),
  new Line(new Vector2(10, 0), new Vector2(10, 10)),
  new Line(new Vector2(10, 10), new Vector2(0, 10)),
  new Line(new Vector2(0, 10), new Vector2(0, 0)),
];

const profiles = detectProfiles(sq);
console.assert(profiles.length === 1, "Should find 1 profile");
console.assert(profiles[0].closed, "Profile should be closed");
console.assert(
  profiles[0].geoms.length === 4,
  "Profile should have 4 segments",
);
console.log("Profile detection tests passed!");
```

---

## Part 3 — Profile Offset (Cutter Radius Compensation)

### Why offset?

A milling cutter has a diameter. If you program it to follow the design line, the
cutting edge (at the radius) will be in the wrong place. You must offset the
toolpath inward (for a pocket) or outward (for a contour) by the **tool radius**.

```
Tool radius = r = diameter / 2

Contour outside:  toolpath = profile offset outward by r
Pocket inside:    first pass = profile offset inward by r
```

### Offsetting a closed polygon of line segments

For a chain of line segments forming a closed polygon, the offset profile is:

1. For each segment, compute the **offset segment**: translate it by `r` in the
   direction of the inward (or outward) normal.
2. At each corner, the two adjacent offset segments may not meet. Extend or
   trim them to find the intersection point.

We covered the offset math for individual segments in Lab 05. Here we handle
the **corner joining** to produce a clean offset polygon.

Create `cam/js/cam/ProfileOffset.js`:

```js
// ProfileOffset.js
// Offset a closed chain of line segments by a distance d.
// Returns an array of Vector2 points (the offset polygon vertices).

import { Vector2 } from "../math/Vector2.js";

// ── Offset a single line segment ───────────────────────────────────────────────

// Given two endpoints A, B, return a new pair of points [A', B'] offset
// distance d to the LEFT of the direction A→B.
// "Left" = counter-clockwise normal.
function offsetSegment(a, b, d) {
  const dir = b.sub(a).normalize(); // unit vector along AB
  const normal = new Vector2(-dir.y, dir.x); // left-hand normal (CCW rotation of dir)
  return [a.add(normal.scale(d)), b.add(normal.scale(d))];
}

// ── Line-line intersection ─────────────────────────────────────────────────────

// Returns the intersection point of two lines (as infinite lines, not segments).
// Lines are given as pairs of points: (a1,a2) and (b1,b2).
// Returns null if lines are parallel.
function lineLineIntersect(a1, a2, b1, b2) {
  const r = a2.sub(a1);
  const s = b2.sub(b1);
  const rxs = r.x * s.y - r.y * s.x; // cross product r × s

  if (Math.abs(rxs) < 1e-10) return null; // parallel

  const t = ((b1.x - a1.x) * s.y - (b1.y - a1.y) * s.x) / rxs;
  return a1.add(r.scale(t));
}

// ── Offset a closed polygon ────────────────────────────────────────────────────

// points: array of Vector2, forming a closed polygon (last connects to first)
// d: offset distance (positive = left/outward for CCW polygon)
// Returns: array of Vector2 (the offset polygon vertices)
export function offsetPolygon(points, d) {
  const n = points.length;
  if (n < 3) return [];

  // Offset each segment
  const offsetSegs = [];
  for (let i = 0; i < n; i++) {
    const a = points[i];
    const b = points[(i + 1) % n];
    offsetSegs.push(offsetSegment(a, b, d));
  }

  // At each vertex, find the intersection of the two adjacent offset segments
  const result = [];
  for (let i = 0; i < n; i++) {
    const segA = offsetSegs[(i + n - 1) % n]; // segment ending at this vertex
    const segB = offsetSegs[i]; // segment starting at this vertex

    const pt = lineLineIntersect(segA[0], segA[1], segB[0], segB[1]);
    result.push(pt ?? segB[0]); // fallback to segment start if parallel
  }

  return result;
}

// ── Convert a profile's geoms to a polygon ─────────────────────────────────────

// This only works for line-only profiles.
// Arc profiles require more complex offsetting (covered in DIVERGE POINTS).
export function profileToPolygon(profile) {
  if (!profile.closed) return null;

  // Collect vertices in order by walking the chain
  return walkProfile(profile.geoms);
}

// Walk the connected chain and return ordered vertices
function walkProfile(geoms) {
  if (geoms.length === 0) return [];
  if (geoms[0].type === "circle") {
    // A circle profile: return the centre + radius (handled separately)
    return null;
  }

  // Build ordered list: start from first geom, follow connections
  const pts = [];
  const used = new Set();
  let current = geoms[0];
  let enterPt = current.p1; // we enter from p1, so exit is p2

  used.add(current);
  pts.push(current.p1);

  for (let step = 0; step < geoms.length; step++) {
    pts.push(current.p2);
    const exitPt = current.p2;

    // Find the next connected geom
    let next = null;
    for (const g of geoms) {
      if (used.has(g)) continue;
      const eps = getEndpoints(g);
      if (pointsMatch(eps[0], exitPt) || pointsMatch(eps[1], exitPt)) {
        next = g;
        // Make sure next.p1 is the entry point
        if (pointsMatch(eps[1], exitPt)) {
          // Need to swap direction — create a reversed reference
          next = { ...g, p1: g.p2, p2: g.p1 };
        }
        break;
      }
    }

    if (!next) break;
    used.add(next);
    current = next;
  }

  // Remove the last duplicate point (the chain closes back to pts[0])
  pts.pop();
  return pts;
}

// Inline helpers (reused from Profile.js — in a real project, share via a utils module)
function getEndpoints(geom) {
  if (geom.type === "line") return [geom.p1, geom.p2];
  if (geom.type === "arc") {
    const { centre, radius, startAngle, endAngle } = geom;
    return [
      {
        x: centre.x + radius * Math.cos(startAngle),
        y: centre.y + radius * Math.sin(startAngle),
      },
      {
        x: centre.x + radius * Math.cos(endAngle),
        y: centre.y + radius * Math.sin(endAngle),
      },
    ];
  }
  return [];
}

function pointsMatch(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy <= 0.001 * 0.001;
}
```

---

## Part 4 — Polygon Winding: Is the Offset Inward or Outward?

### The winding number

When offsetting a polygon by a positive amount (distance `d > 0`), we offset to
the **left** of each segment. Whether that is inward or outward depends on the
polygon's **winding direction**:

- **Counter-clockwise (CCW)** polygon → positive `d` offsets **outward**
- **Clockwise (CW)** polygon → positive `d` offsets **inward**

To machine a contour from the outside: if our profile is CCW, use `d = +radius`.
To machine a pocket from the inside: if our profile is CCW, use `d = -radius`.

### Computing the signed area

The sign of the **shoelace formula** area tells us the winding direction:

$$A = \frac{1}{2} \sum_{i=0}^{n-1} (x_i \cdot y_{i+1} - x_{i+1} \cdot y_i)$$

- $A > 0$ → counter-clockwise (CCW)
- $A < 0$ → clockwise (CW)

The shoelace formula also appears as the cross product of adjacent edge vectors.

Add to `ProfileOffset.js`:

```js
// Compute the signed area of a polygon (shoelace formula).
// Positive = CCW, negative = CW.
export function signedArea(points) {
  let area = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  return area / 2;
}

// Is the polygon counter-clockwise?
export function isCCW(points) {
  return signedArea(points) > 0;
}
```

### Using winding to choose offset direction

```js
// For a contour operation (cut around the outside):
//   - CCW profile → offset outward = positive d
//   - CW  profile → offset outward = negative d
function contourOffsetDistance(points, toolRadius) {
  return isCCW(points) ? toolRadius : -toolRadius;
}

// For a pocket operation (cut the inside):
//   - CCW profile → offset inward = negative d
//   - CW  profile → offset inward = positive d
function pocketOffsetDistance(points, toolRadius) {
  return isCCW(points) ? -toolRadius : toolRadius;
}
```

---

## Part 5 — Contour Operation

A contour operation machines around the perimeter of a closed profile. The
cutter follows one path at the specified depth.

Create `cam/js/cam/ContourOperation.js`:

```js
// ContourOperation.js
// Generate a contour toolpath for a closed polygon profile.

import { offsetPolygon, profileToPolygon, isCCW } from "./ProfileOffset.js";
import { Vector2 } from "../math/Vector2.js";

// params:
//   profile    — a Profile object { geoms, closed }
//   toolDia    — tool diameter (mm)
//   depth      — final depth (mm, negative)
//   stepdown   — depth per pass (mm, positive)
//   feedRate   — cutting feed rate (mm/min)
//   rapidRate  — rapid feed rate (mm/min, used for G-code F word on rapids)
//   safeZ      — Z height for safe rapids (mm, positive)
//   side       — 'outside' | 'inside'
//
// Returns: array of toolpath moves
// Each move: { type: 'rapid'|'feed', from: {x,y,z}, to: {x,y,z}, feed: number }
export function contourOperation(profile, params) {
  const {
    toolDia = 6,
    depth = -3,
    stepdown = 1,
    feedRate = 300,
    safeZ = 5,
    side = "outside",
  } = params;

  const toolRadius = toolDia / 2;

  // 1. Convert profile to ordered polygon vertices
  const polygon = profileToPolygon(profile);
  if (!polygon || polygon.length < 3) {
    console.warn("contourOperation: could not extract polygon from profile");
    return [];
  }

  // 2. Determine offset direction
  const ccw = isCCW(polygon);
  let offsetDist;
  if (side === "outside") {
    offsetDist = ccw ? toolRadius : -toolRadius;
  } else {
    offsetDist = ccw ? -toolRadius : toolRadius;
  }

  // 3. Compute the offset polygon (the toolpath at this XY level)
  const toolpathPoly = offsetPolygon(polygon, offsetDist);
  if (toolpathPoly.length < 3) return [];

  // 4. Compute Z passes (from 0 down to depth, in stepdown increments)
  const zPasses = computeZPasses(depth, stepdown);

  // 5. Build moves
  const moves = [];
  const entry = toolpathPoly[0]; // start point

  // Rapid to above the entry point
  moves.push(rapid({ x: entry.x, y: entry.y, z: safeZ }));

  for (const z of zPasses) {
    // Plunge to cutting depth
    moves.push(feed({ x: entry.x, y: entry.y, z }, feedRate / 3)); // slow plunge

    // Cut the contour at this depth
    for (let i = 1; i < toolpathPoly.length; i++) {
      const pt = toolpathPoly[i];
      moves.push(feed({ x: pt.x, y: pt.y, z }, feedRate));
    }

    // Close the loop
    moves.push(feed({ x: entry.x, y: entry.y, z }, feedRate));
  }

  // Rapid to safe Z
  moves.push(rapid({ x: entry.x, y: entry.y, z: safeZ }));

  return moves;
}

// ── Z pass computation ─────────────────────────────────────────────────────────

// Returns an array of Z values from -stepdown down to depth (inclusive).
function computeZPasses(depth, stepdown) {
  const passes = [];
  let z = -Math.abs(stepdown); // first pass
  while (z > depth + 1e-6) {
    passes.push(z);
    z -= Math.abs(stepdown);
  }
  passes.push(depth); // always include the final depth
  return passes;
}

// ── Move builders ──────────────────────────────────────────────────────────────

let _lastPos = { x: 0, y: 0, z: 0 };

function rapid(to) {
  const move = {
    type: "rapid",
    from: { ..._lastPos },
    to: { ..._lastPos, ...to },
    feed: 0,
  };
  _lastPos = { ..._lastPos, ...to };
  return move;
}

function feed(to, feedRate) {
  const move = {
    type: "feed",
    from: { ..._lastPos },
    to: { ..._lastPos, ...to },
    feed: feedRate,
  };
  _lastPos = { ..._lastPos, ...to };
  return move;
}
```

> **Note on the move builder pattern:** The `_lastPos` variable is a module-level
> variable that gets reset each time you build a new toolpath. This is a simple
> approach. For a more robust system you would pass the "current position" as a
> parameter and return it from each function. We use the simple approach here to
> keep the code readable.

---

## Part 6 — Pocket Operation

A pocket operation removes all material inside a closed profile. The simplest
strategy is **parallel passes** (zig-zag): fill the bounding box of the offset
profile with horizontal lines spaced by the tool's **stepover** (typically 40–80%
of tool diameter).

Create `cam/js/cam/PocketOperation.js`:

```js
// PocketOperation.js
// Generate a pocket toolpath (parallel lines / zig-zag) for a closed polygon.

import { offsetPolygon, profileToPolygon, isCCW } from "./ProfileOffset.js";
import { Vector2 } from "../math/Vector2.js";

// params: same as ContourOperation plus:
//   stepover — XY step between passes (mm), default tool diameter * 0.5

export function pocketOperation(profile, params) {
  const {
    toolDia = 6,
    depth = -3,
    stepdown = 1,
    stepover = null, // defaults to toolDia * 0.5 below
    feedRate = 300,
    safeZ = 5,
  } = params;

  const toolRadius = toolDia / 2;
  const actualStepover = stepover ?? toolDia * 0.5;

  // 1. Convert profile to polygon
  const polygon = profileToPolygon(profile);
  if (!polygon || polygon.length < 3) return [];

  // 2. Inset the polygon by the tool radius (so the cutter edge stays inside)
  const ccw = isCCW(polygon);
  const offsetDist = ccw ? -toolRadius : toolRadius;
  const insetPoly = offsetPolygon(polygon, offsetDist);
  if (insetPoly.length < 3) return [];

  // 3. Z passes
  const zPasses = [];
  let z = -Math.abs(stepdown);
  while (z > depth + 1e-6) {
    zPasses.push(z);
    z -= Math.abs(stepdown);
  }
  zPasses.push(depth);

  // 4. Build moves
  const moves = [];
  let _pos = { x: 0, y: 0, z: safeZ };
  const mk = (type, to, feed = 0) => {
    const m = { type, from: { ..._pos }, to: { ..._pos, ...to }, feed };
    _pos = { ..._pos, ...to };
    return m;
  };

  // Bounding box of inset polygon
  const xs = insetPoly.map((p) => p.x);
  const ys = insetPoly.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (const zLevel of zPasses) {
    // Zig-zag passes at this depth
    let passIndex = 0;
    for (let y = minY; y <= maxY + 1e-6; y += actualStepover) {
      // Clip the horizontal line y=y against the inset polygon
      const clips = clipLineToPolygon(minX, maxX, y, insetPoly);
      if (clips.length === 0) {
        passIndex++;
        continue;
      }

      // Alternate direction each pass (zig-zag)
      const segs =
        passIndex % 2 === 0 ? clips : clips.map((s) => [s[1], s[0]]).reverse();

      for (const [startX, endX] of segs) {
        // Rapid to start
        moves.push(mk("rapid", { x: startX, y, z: safeZ }));
        // Plunge
        moves.push(mk("feed", { x: startX, y, z: zLevel }, feedRate / 3));
        // Cut
        moves.push(mk("feed", { x: endX, y, z: zLevel }, feedRate));
        // Retract
        moves.push(mk("rapid", { x: endX, y, z: safeZ }));
      }

      passIndex++;
    }
  }

  return moves;
}

// ── Sutherland-Hodgman line clipping ──────────────────────────────────────────

// Clip the horizontal line segment [minX, maxX] at y against a polygon.
// Returns array of [x1, x2] pairs that are inside the polygon.
// This finds all intersections of y=const with the polygon edges.
function clipLineToPolygon(minX, maxX, y, polygon) {
  const n = polygon.length;
  const xIntersections = [];

  for (let i = 0; i < n; i++) {
    const a = polygon[i];
    const b = polygon[(i + 1) % n];

    // Does this edge cross the scan line y?
    if ((a.y <= y && b.y > y) || (b.y <= y && a.y > y)) {
      // Parametric intersection: t = (y - a.y) / (b.y - a.y)
      const t = (y - a.y) / (b.y - a.y);
      const x = a.x + t * (b.x - a.x);
      if (x >= minX && x <= maxX) {
        xIntersections.push(x);
      }
    }
  }

  xIntersections.sort((a, b) => a - b);

  // Pair the intersections: [enter, exit, enter, exit, ...]
  const segs = [];
  for (let i = 0; i + 1 < xIntersections.length; i += 2) {
    segs.push([xIntersections[i], xIntersections[i + 1]]);
  }
  return segs;
}
```

### Scan-line clipping explained

The **scan-line algorithm** is how rasterizers fill polygons. We use it here
to determine which X intervals are "inside" the polygon at a given Y height.

For a horizontal line at height `y`:

1. Find every polygon edge that crosses `y` (one endpoint above, one below).
2. Compute the X coordinate of each crossing using linear interpolation.
3. Sort the crossing X values.
4. Pair them up: `[x0, x1]` is inside, `[x1, x2]` is outside, `[x2, x3]` is inside, etc.

This is the **even-odd rule**: alternating inside/outside as you cross edges.

---

## Part 7 — G-code Emitter

The G-code emitter converts our list of toolpath moves (generic `{type, from, to, feed}` objects)
into actual G-code text.

Create `cam/js/cam/GCodeGenerator.js`:

```js
// GCodeGenerator.js
// Convert a toolpath (array of move objects) to G-code text.

// ── Number formatting ──────────────────────────────────────────────────────────

// G-code typically uses 3 decimal places for coordinates.
function fmt(n) {
  return n.toFixed(3);
}

// ── Header and footer ──────────────────────────────────────────────────────────

function header(params) {
  const {
    programName = "CAM_OUTPUT",
    units = "mm",
    spindleSpeed = 12000,
  } = params;
  const unitsCode = units === "mm" ? "G21" : "G20";
  return [
    `; Generated by CAM System Masterclass`,
    `; Program: ${programName}`,
    `;`,
    unitsCode + " G90 G17", // units, absolute, XY plane
    `S${spindleSpeed} M3`, // spindle on, CW
    `G4 P1`, // dwell 1 second (let spindle reach speed)
    "",
  ].join("\n");
}

function footer() {
  return [
    "",
    "M5", // spindle off
    "M30", // program end
  ].join("\n");
}

// ── Move to G-code ─────────────────────────────────────────────────────────────

function moveToGcode(move, prevMove) {
  const { type, to, feed } = move;

  const xStr = `X${fmt(to.x)}`;
  const yStr = `Y${fmt(to.y)}`;
  const zStr = `Z${fmt(to.z)}`;

  if (type === "rapid") {
    return `G0 ${xStr} ${yStr} ${zStr}`;
  }

  if (type === "feed") {
    // Include F word only if feed rate changed
    const prevFeed = prevMove?.feed ?? -1;
    const fStr = feed !== prevFeed ? ` F${Math.round(feed)}` : "";
    return `G1 ${xStr} ${yStr} ${zStr}${fStr}`;
  }

  if (type === "arc") {
    const { arcCentre, clockwise } = move;
    const iStr = `I${fmt(arcCentre.x - move.from.x)}`;
    const jStr = `J${fmt(arcCentre.y - move.from.y)}`;
    const cmd = clockwise ? "G2" : "G3";
    const prevFeed = prevMove?.feed ?? -1;
    const fStr = feed !== prevFeed ? ` F${Math.round(feed)}` : "";
    return `${cmd} ${xStr} ${yStr} ${zStr} ${iStr} ${jStr}${fStr}`;
  }

  return `; unknown move type: ${type}`;
}

// ── Main generator ─────────────────────────────────────────────────────────────

export function generateGCode(moves, params = {}) {
  const lines = [header(params)];

  for (let i = 0; i < moves.length; i++) {
    lines.push(moveToGcode(moves[i], moves[i - 1] ?? null));
  }

  lines.push(footer());
  return lines.join("\n");
}
```

---

## BUILD 1 — Contour a Square

Draw a 40mm × 40mm square in the CAD view (four lines), then test the CAM
pipeline in the console:

```js
import { detectProfiles } from "./js/cam/Profile.js";
import { contourOperation } from "./js/cam/ContourOperation.js";
import { generateGCode } from "./js/cam/GCodeGenerator.js";

// state.geometry should have your four lines
const profiles = detectProfiles(state.geometry);
console.log(
  `Found ${profiles.length} profile(s), closed: ${profiles.map((p) => p.closed)}`,
);

const moves = contourOperation(profiles[0], {
  toolDia: 6,
  depth: -3,
  stepdown: 1.5,
  feedRate: 300,
  safeZ: 5,
  side: "outside",
});

const gcode = generateGCode(moves, {
  programName: "SQUARE_CONTOUR",
  spindleSpeed: 12000,
});
console.log(gcode);
```

You should see well-formed G-code with G0 rapids, G1 feeds, and correct Z passes.

---

## Part 8 — CAM Panel UI

Connect the CAM pipeline to the UI.

Add to `index.html`:

```html
<details id="section-cam" open>
  <summary class="section-header">CAM Operations</summary>
  <div class="section-body">
    <div class="form-field">
      <label class="form-label">Operation</label>
      <select id="cam-operation" class="form-select">
        <option value="contour">Contour</option>
        <option value="pocket">Pocket</option>
      </select>
    </div>

    <div class="form-field">
      <label class="form-label">Side</label>
      <select id="cam-side" class="form-select">
        <option value="outside">Outside</option>
        <option value="inside">Inside</option>
      </select>
    </div>

    <div class="form-field">
      <label class="form-label">Tool ⌀ (mm)</label>
      <input
        id="cam-tool-dia"
        class="form-input"
        type="number"
        value="6"
        step="0.5"
        min="0.1"
      />
    </div>
    <div class="form-field">
      <label class="form-label">Depth (mm)</label>
      <input
        id="cam-depth"
        class="form-input"
        type="number"
        value="-3"
        step="0.5"
      />
    </div>
    <div class="form-field">
      <label class="form-label">Stepdown (mm)</label>
      <input
        id="cam-stepdown"
        class="form-input"
        type="number"
        value="1.5"
        step="0.5"
        min="0.1"
      />
    </div>
    <div class="form-field">
      <label class="form-label">Feed (mm/min)</label>
      <input
        id="cam-feed"
        class="form-input"
        type="number"
        value="300"
        step="10"
        min="1"
      />
    </div>
    <div class="form-field">
      <label class="form-label">Safe Z (mm)</label>
      <input
        id="cam-safe-z"
        class="form-input"
        type="number"
        value="5"
        step="1"
      />
    </div>
    <div class="form-field">
      <label class="form-label">Spindle (rpm)</label>
      <input
        id="cam-spindle"
        class="form-input"
        type="number"
        value="12000"
        step="1000"
        min="0"
      />
    </div>

    <div style="display:flex; gap:8px; margin-top:8px">
      <button class="btn-tool" id="btn-cam-generate" style="flex:1">
        Generate
      </button>
      <button class="btn-tool" id="btn-cam-save" style="flex:1">
        Save .nc
      </button>
    </div>

    <div id="cam-status" class="panel-empty" style="margin-top:8px">
      No toolpath generated.
    </div>
  </div>
</details>
```

Create `cam/js/ui/cam-panel.js`:

```js
// cam-panel.js
// Wires the CAM panel UI to the CAM pipeline.

import { detectProfiles } from "../cam/Profile.js";
import { contourOperation } from "../cam/ContourOperation.js";
import { pocketOperation } from "../cam/PocketOperation.js";
import { generateGCode } from "../cam/GCodeGenerator.js";
import { downloadFile } from "./file-operations.js";

// state is passed in from main.js
let _state = null;
let _lastGCode = "";
let _lastMoves = [];

export function initCamPanel(state) {
  _state = state;

  document
    .getElementById("btn-cam-generate")
    ?.addEventListener("click", onGenerate);
  document.getElementById("btn-cam-save")?.addEventListener("click", onSave);
}

function readParams() {
  const v = (id) => parseFloat(document.getElementById(id)?.value ?? "0");
  return {
    operation: document.getElementById("cam-operation")?.value ?? "contour",
    side: document.getElementById("cam-side")?.value ?? "outside",
    toolDia: v("cam-tool-dia"),
    depth: v("cam-depth"),
    stepdown: v("cam-stepdown"),
    feedRate: v("cam-feed"),
    safeZ: v("cam-safe-z"),
    spindleSpeed: parseInt(
      document.getElementById("cam-spindle")?.value ?? "12000",
    ),
  };
}

function onGenerate() {
  if (!_state) return;

  const params = readParams();
  const profiles = detectProfiles(_state.geometry);

  if (profiles.length === 0) {
    setStatus("No profiles found. Draw a closed shape first.");
    return;
  }

  // Use the first closed profile
  const profile = profiles.find((p) => p.closed);
  if (!profile) {
    setStatus("No closed profile found. Make sure all segments connect.");
    return;
  }

  let moves;
  try {
    moves =
      params.operation === "pocket"
        ? pocketOperation(profile, params)
        : contourOperation(profile, params);
  } catch (e) {
    setStatus(`Error: ${e.message}`);
    return;
  }

  _lastMoves = moves;
  _lastGCode = generateGCode(moves, {
    programName: "CAM_OUTPUT",
    spindleSpeed: params.spindleSpeed,
  });

  // Show the generated G-code as a backplot
  import("../gcode/index.js").then(({ parse, backplot }) => {
    _state.gcodeGeometry = backplot(parse(_lastGCode));
    window.dispatchEvent(new CustomEvent("cam:render"));
  });

  const feedLen = moves
    .filter((m) => m.type === "feed")
    .reduce((sum, m) => {
      const d = Math.sqrt(
        (m.to.x - m.from.x) ** 2 +
          (m.to.y - m.from.y) ** 2 +
          (m.to.z - m.from.z) ** 2,
      );
      return sum + d;
    }, 0);

  setStatus(
    `${moves.length} moves  |  ${feedLen.toFixed(1)}mm feed path  |  ` +
      `${profiles.length} profile(s) detected`,
  );
}

function onSave() {
  if (!_lastGCode) {
    setStatus("Generate a toolpath first.");
    return;
  }
  downloadFile(_lastGCode, "toolpath.nc", "text/plain");
}

function setStatus(msg) {
  const el = document.getElementById("cam-status");
  if (el) el.textContent = msg;
}
```

Add to `main.js`:

```js
import { initCamPanel } from "./ui/cam-panel.js";
// ...
initCamPanel(state);
```

---

## BUILD 2 — Full CAM Workflow

1. Draw a 50mm × 50mm square in the CAD view
2. Open the **CAM Operations** panel
3. Set Tool ⌀ = 6mm, Depth = −3mm, Stepdown = 1.5mm, Feed = 300
4. Click **Generate**
5. The backplot should update — you should see the toolpath offset from the square
6. Click **Save .nc** — a `toolpath.nc` file downloads
7. Drag `toolpath.nc` onto the **NC** button (from Lab 06) to backplot it and verify

---

## Part 9 — Testing the CAM Pipeline

Automated tests for the core algorithms give you confidence when you change things.

```js
// test-cam.js
// Run with: open test-cam.html in the browser (requires Live Server)

import { detectProfiles } from "./js/cam/Profile.js";
import { offsetPolygon, signedArea, isCCW } from "./js/cam/ProfileOffset.js";
import { contourOperation } from "./js/cam/ContourOperation.js";
import { generateGCode } from "./js/cam/GCodeGenerator.js";
import { Line } from "./js/geometry/Line.js";
import { Vector2 } from "./js/math/Vector2.js";

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    console.log(`  ✓ ${msg}`);
    passed++;
  } else {
    console.error(`  ✗ ${msg}`);
    failed++;
  }
}

function assertClose(a, b, msg, tol = 0.001) {
  assert(Math.abs(a - b) < tol, `${msg} (expected ${b}, got ${a})`);
}

// ── Test 1: Profile detection ──────────────────────────────────────────────────
console.group("Profile detection");
{
  const square = [
    new Line(new Vector2(0, 0), new Vector2(10, 0)),
    new Line(new Vector2(10, 0), new Vector2(10, 10)),
    new Line(new Vector2(10, 10), new Vector2(0, 10)),
    new Line(new Vector2(0, 10), new Vector2(0, 0)),
  ];
  const profiles = detectProfiles(square);
  assert(profiles.length === 1, "Square: 1 profile");
  assert(profiles[0].closed, "Square: profile is closed");
  assert(profiles[0].geoms.length === 4, "Square: 4 segments");
}
console.groupEnd();

// ── Test 2: Signed area and winding ──────────────────────────────────────────
console.group("Winding");
{
  const ccwSquare = [
    new Vector2(0, 0),
    new Vector2(10, 0),
    new Vector2(10, 10),
    new Vector2(0, 10),
  ];
  const cwSquare = [...ccwSquare].reverse();

  assert(signedArea(ccwSquare) > 0, "CCW square has positive area");
  assert(signedArea(cwSquare) < 0, "CW  square has negative area");
  assert(isCCW(ccwSquare), "CCW square is CCW");
  assert(!isCCW(cwSquare), "CW  square is not CCW");
}
console.groupEnd();

// ── Test 3: Polygon offset ─────────────────────────────────────────────────────
console.group("Polygon offset");
{
  const square = [
    new Vector2(0, 0),
    new Vector2(10, 0),
    new Vector2(10, 10),
    new Vector2(0, 10),
  ];
  const offset = offsetPolygon(square, 2); // expand by 2mm (CCW polygon, positive = outward)

  assert(offset.length === 4, "Offset polygon has 4 vertices");
  // The expanded square should go from -2,-2 to 12,12
  assertClose(offset[0].x, -2, "Offset BL corner X");
  assertClose(offset[0].y, -2, "Offset BL corner Y");
  assertClose(offset[2].x, 12, "Offset TR corner X");
  assertClose(offset[2].y, 12, "Offset TR corner Y");
}
console.groupEnd();

// ── Test 4: G-code generation ──────────────────────────────────────────────────
console.group("G-code generation");
{
  const moves = [
    {
      type: "rapid",
      from: { x: 0, y: 0, z: 5 },
      to: { x: 0, y: 0, z: 5 },
      feed: 0,
    },
    {
      type: "feed",
      from: { x: 0, y: 0, z: 5 },
      to: { x: 10, y: 0, z: -3 },
      feed: 100,
    },
    {
      type: "feed",
      from: { x: 10, y: 0, z: -3 },
      to: { x: 10, y: 10, z: -3 },
      feed: 100,
    },
  ];
  const gcode = generateGCode(moves, { programName: "TEST" });
  assert(gcode.includes("G21"), "G-code contains G21 (mm)");
  assert(gcode.includes("G0"), "G-code contains G0 (rapid)");
  assert(gcode.includes("G1"), "G-code contains G1 (feed)");
  assert(gcode.includes("M30"), "G-code contains M30 (end)");
  assert(gcode.includes("F100"), "G-code contains feed rate F100");
  assert(
    !gcode.includes("<"),
    "G-code contains no HTML characters (XSS check)",
  );
}
console.groupEnd();

console.log(`\nResults: ${passed} passed, ${failed} failed`);
```

---

## Part 10 — Python Parallel: CAM Operations

```python
# cam_operations.py
# Python implementation of the 2D CAM pipeline.
# Run: python3 cam_operations.py

import math
from dataclasses import dataclass, field
from typing import Optional


# ── Types ──────────────────────────────────────────────────────────────────────

@dataclass
class Point:
    x: float
    y: float

    def sub(self, other: 'Point') -> 'Point':
        return Point(self.x - other.x, self.y - other.y)

    def add(self, other: 'Point') -> 'Point':
        return Point(self.x + other.x, self.y + other.y)

    def scale(self, s: float) -> 'Point':
        return Point(self.x * s, self.y * s)

    def magnitude(self) -> float:
        return math.sqrt(self.x ** 2 + self.y ** 2)

    def normalize(self) -> 'Point':
        m = self.magnitude()
        if m < 1e-10: return Point(0, 0)
        return Point(self.x / m, self.y / m)

    def __repr__(self) -> str:
        return f'({self.x:.3f}, {self.y:.3f})'


@dataclass
class Move:
    type: str         # 'rapid' | 'feed'
    from_pos: Point
    to_pos:   Point
    feed:     float = 0.0


# ── Profile offset ─────────────────────────────────────────────────────────────

def offset_segment(a: Point, b: Point, d: float):
    """Return (a', b') — the segment AB offset d to the left."""
    dx, dy = b.x - a.x, b.y - a.y
    length = math.sqrt(dx*dx + dy*dy)
    if length < 1e-10:
        return a, b
    nx, ny = -dy / length, dx / length  # left-hand normal
    return (Point(a.x + nx*d, a.y + ny*d),
            Point(b.x + nx*d, b.y + ny*d))


def line_line_intersect(a1: Point, a2: Point, b1: Point, b2: Point) -> Optional[Point]:
    """Intersection of infinite lines a1-a2 and b1-b2. None if parallel."""
    rx, ry = a2.x - a1.x, a2.y - a1.y
    sx, sy = b2.x - b1.x, b2.y - b1.y
    rxs = rx * sy - ry * sx
    if abs(rxs) < 1e-10:
        return None
    t = ((b1.x - a1.x) * sy - (b1.y - a1.y) * sx) / rxs
    return Point(a1.x + rx * t, a1.y + ry * t)


def signed_area(points: list[Point]) -> float:
    """Shoelace formula. Positive = CCW."""
    area = 0.0
    n = len(points)
    for i in range(n):
        j = (i + 1) % n
        area += points[i].x * points[j].y
        area -= points[j].x * points[i].y
    return area / 2.0


def is_ccw(points: list[Point]) -> bool:
    return signed_area(points) > 0


def offset_polygon(points: list[Point], d: float) -> list[Point]:
    """Offset a closed polygon by d (positive = outward for CCW polygon)."""
    n = len(points)
    if n < 3:
        return []

    segs = [offset_segment(points[i], points[(i+1)%n], d) for i in range(n)]
    result = []
    for i in range(n):
        seg_a = segs[(i+n-1) % n]
        seg_b = segs[i]
        pt = line_line_intersect(seg_a[0], seg_a[1], seg_b[0], seg_b[1])
        result.append(pt if pt else seg_b[0])
    return result


# ── Contour operation ──────────────────────────────────────────────────────────

def contour_operation(polygon: list[Point],
                      tool_dia:  float = 6.0,
                      depth:     float = -3.0,
                      stepdown:  float = 1.5,
                      feed_rate: float = 300.0,
                      safe_z:    float = 5.0,
                      side:      str   = 'outside') -> list[Move]:

    tool_r = tool_dia / 2.0
    ccw    = is_ccw(polygon)

    if side == 'outside':
        d = tool_r if ccw else -tool_r
    else:
        d = -tool_r if ccw else tool_r

    toolpath = offset_polygon(polygon, d)
    if len(toolpath) < 3:
        return []

    # Z passes
    passes, z = [], -abs(stepdown)
    while z > depth + 1e-6:
        passes.append(z)
        z -= abs(stepdown)
    passes.append(depth)

    moves = []
    pos   = Point(0, 0)

    def rapid(to: Point, z: float = safe_z):
        nonlocal pos
        m = Move('rapid', Point(pos.x, pos.y), Point(to.x, to.y), 0)
        pos = Point(to.x, to.y)
        return m

    def feed_move(to: Point, z: float, fr: float):
        nonlocal pos
        m = Move('feed', Point(pos.x, pos.y), Point(to.x, to.y), fr)
        pos = Point(to.x, to.y)
        return m

    entry = toolpath[0]
    moves.append(rapid(entry))

    for z_level in passes:
        moves.append(feed_move(entry, z_level, feed_rate / 3))
        for pt in toolpath[1:]:
            moves.append(feed_move(pt, z_level, feed_rate))
        moves.append(feed_move(entry, z_level, feed_rate))

    moves.append(rapid(entry))
    return moves


# ── G-code generator ───────────────────────────────────────────────────────────

def generate_gcode(moves: list[Move], program_name: str = 'OUTPUT',
                   spindle_speed: int = 12000) -> str:
    lines = [
        '; Generated by CAM System Masterclass (Python)',
        f'; Program: {program_name}',
        ';',
        'G21 G90 G17',
        f'S{spindle_speed} M3',
        'G4 P1',
        '',
    ]
    last_feed = -1
    for m in moves:
        x, y = m.to_pos.x, m.to_pos.y
        if m.type == 'rapid':
            lines.append(f'G0 X{x:.3f} Y{y:.3f}')
        else:
            f_str = f' F{int(m.feed)}' if m.feed != last_feed else ''
            lines.append(f'G1 X{x:.3f} Y{y:.3f}{f_str}')
            last_feed = m.feed

    lines += ['', 'M5', 'M30']
    return '\n'.join(lines)


# ── Tests ──────────────────────────────────────────────────────────────────────

def run_tests():
    # Test: signed area and winding
    ccw_square = [Point(0,0), Point(10,0), Point(10,10), Point(0,10)]
    cw_square  = list(reversed(ccw_square))

    assert signed_area(ccw_square) > 0, 'CCW square should have positive area'
    assert signed_area(cw_square)  < 0, 'CW square should have negative area'
    assert is_ccw(ccw_square),          'CCW square detected'
    assert not is_ccw(cw_square),       'CW square detected'
    print('✓ Winding tests passed')

    # Test: polygon offset
    offset = offset_polygon(ccw_square, 2)  # expand by 2mm
    assert len(offset) == 4, f'Expected 4 vertices, got {len(offset)}'
    assert abs(offset[0].x - (-2)) < 0.001, f'BL corner X: {offset[0].x}'
    assert abs(offset[0].y - (-2)) < 0.001, f'BL corner Y: {offset[0].y}'
    assert abs(offset[2].x -   12) < 0.001, f'TR corner X: {offset[2].x}'
    print('✓ Offset polygon tests passed')

    # Test: contour operation produces moves
    moves = contour_operation(ccw_square, tool_dia=6, depth=-3, stepdown=1.5)
    assert len(moves) > 0,                'Contour should produce moves'
    has_rapid = any(m.type == 'rapid' for m in moves)
    has_feed  = any(m.type == 'feed'  for m in moves)
    assert has_rapid, 'Should have rapid moves'
    assert has_feed,  'Should have feed moves'
    print(f'✓ Contour operation: {len(moves)} moves')

    # Test: G-code generation
    gcode = generate_gcode(moves, program_name='TEST')
    assert 'G21' in gcode,  'G-code has G21 (mm)'
    assert 'G0'  in gcode,  'G-code has G0 (rapid)'
    assert 'G1'  in gcode,  'G-code has G1 (feed)'
    assert 'M30' in gcode,  'G-code has M30 (end)'
    assert '<'   not in gcode, 'G-code has no HTML injection characters'
    print('✓ G-code generation tests passed')

    print('\nAll CAM tests passed!')


if __name__ == '__main__':
    run_tests()

    # Demo: generate G-code for a 50x50mm square contour
    square = [Point(0,0), Point(50,0), Point(50,50), Point(0,50)]
    moves  = contour_operation(square, tool_dia=6, depth=-3, stepdown=1.5, feed_rate=300)
    gcode  = generate_gcode(moves, program_name='SQUARE_50x50', spindle_speed=12000)

    with open('square_contour.nc', 'w') as f:
        f.write(gcode)
    print(f'\nSaved square_contour.nc ({len(moves)} moves)')
```

---

## Part 11 — C++ Track: Week 7 — Lambdas and std::sort

```cpp
// cam_sort_demo.cpp
// Demonstrates std::sort, std::min_element, lambdas, and function objects.
// Context: sorting toolpath moves to minimise rapid travel (nearest-neighbour).
//
// Compile: g++ -std=c++17 -Wall cam_sort_demo.cpp -o cam_sort_demo
// Run:     ./cam_sort_demo

#include <iostream>
#include <vector>
#include <algorithm>
#include <cmath>
#include <string>

// ── A simple 2D point ──────────────────────────────────────────────────────────
struct Point {
    double x, y;
};

double dist(const Point& a, const Point& b) {
    double dx = a.x - b.x;
    double dy = a.y - b.y;
    return std::sqrt(dx*dx + dy*dy);
}

// ── Toolpath entry: each cut starts at a 'start' point ────────────────────────
struct CutEntry {
    int    id;
    Point  start;
    double z;
    double feedLength;
};

// ── Nearest-neighbour sort ─────────────────────────────────────────────────────
// Given a current position, sort cuts so we always go to the nearest unvisited start.
// This is a greedy nearest-neighbour heuristic for the Travelling Salesman Problem.
// It's not optimal, but it's fast and produces good results for CNC toolpaths.
std::vector<CutEntry> sortByNearest(std::vector<CutEntry> cuts, Point startPos) {
    std::vector<CutEntry> sorted;
    sorted.reserve(cuts.size());

    while (!cuts.empty()) {
        // Find the cut with the minimum distance from current position
        // std::min_element + lambda replaces a manual loop
        auto it = std::min_element(
            cuts.begin(),
            cuts.end(),
            [&startPos](const CutEntry& a, const CutEntry& b) {
                return dist(startPos, a.start) < dist(startPos, b.start);
            }
        );

        startPos = it->start;
        sorted.push_back(*it);
        cuts.erase(it);
    }

    return sorted;
}

// ── std::sort with a custom comparator (lambda) ────────────────────────────────
void sortByZ(std::vector<CutEntry>& cuts) {
    // Sort by Z depth, deepest first (most negative Z first)
    std::sort(cuts.begin(), cuts.end(),
        [](const CutEntry& a, const CutEntry& b) {
            return a.z < b.z;  // ascending Z (most negative = deepest)
        }
    );
}

// ── std::sort for a different key ─────────────────────────────────────────────
void sortByFeedLength(std::vector<CutEntry>& cuts) {
    std::sort(cuts.begin(), cuts.end(),
        [](const CutEntry& a, const CutEntry& b) {
            return a.feedLength > b.feedLength;  // descending: longest first
        }
    );
}

int main() {
    // Create some test cuts
    std::vector<CutEntry> cuts = {
        { 1, { 0,   0  }, -1.5, 120.5 },
        { 2, { 50,  50 }, -3.0,  80.0 },
        { 3, { 10,  40 }, -1.5, 100.0 },
        { 4, { 90,  10 }, -3.0,  60.0 },
        { 5, { 25,  25 }, -1.5,  90.0 },
    };

    std::cout << "Original order:\n";
    for (const auto& c : cuts) {
        std::cout << "  Cut " << c.id
                  << "  start=(" << c.start.x << "," << c.start.y << ")"
                  << "  z=" << c.z << "\n";
    }

    // ── Sort by nearest neighbour ───────────────────────────────────────────
    Point home = { 0, 0 };
    auto nn = sortByNearest(cuts, home);

    std::cout << "\nNearest-neighbour order from (0,0):\n";
    double totalRapid = 0;
    Point pos = home;
    for (const auto& c : nn) {
        double d = dist(pos, c.start);
        totalRapid += d;
        std::cout << "  Cut " << c.id
                  << "  rapid=" << std::fixed << d << "mm\n";
        pos = c.start;
    }
    std::cout << "  Total rapid distance: " << totalRapid << "mm\n";

    // ── Sort by Z depth ─────────────────────────────────────────────────────
    sortByZ(cuts);
    std::cout << "\nSorted by Z (deepest first):\n";
    for (const auto& c : cuts) {
        std::cout << "  Cut " << c.id << "  z=" << c.z << "\n";
    }

    // ── Lambda as a stored variable ─────────────────────────────────────────
    // You can store a lambda in an 'auto' variable and call it like a function.
    auto distFromOrigin = [](const Point& p) {
        return std::sqrt(p.x * p.x + p.y * p.y);
    };

    std::cout << "\nDistance of cut starts from origin:\n";
    for (const auto& c : cuts) {
        std::cout << "  Cut " << c.id << ": "
                  << distFromOrigin(c.start) << "mm\n";
    }

    return 0;
}
```

**New concepts:**

**Lambda expressions** — anonymous functions written inline. The syntax is:

```cpp
[capture](parameters) { body }
```

- `[&startPos]` captures `startPos` by reference (the lambda can read and modify it)
- `[]` captures nothing
- `[=]` captures everything by value (copy)
- `[this]` captures the current object's `this` pointer

Lambdas are the modern replacement for writing a separate comparator struct.
They are fully typed — the compiler deduces the type, which is why we use `auto`.

**`std::min_element`** — finds the iterator to the smallest element, using
a custom comparator. Returns an iterator; dereference with `*it` to get the value.

**`std::sort`** with a comparator — the comparator is any callable that takes
two elements and returns `true` if the first should come before the second.

---

## Part 12 — What the Machine Actually Does

### Feed rate and spindle speed

**Feed rate** (F word, mm/min): how fast the cutter moves through material.
Too fast → the cutter breaks or produces a bad finish. Too slow → takes too
long, work-hardening in some materials.

Typical starting feeds for aluminium with a 6mm 2-flute HSS end mill:

- Feed: 200–400 mm/min
- Spindle: 10,000–20,000 rpm
- Depth of cut: 0.5–2mm (radial), 0.5–3mm (axial)

**Plunge rate**: when going straight down into material (G1 Z-3), the feed is
typically 1/3 of the cutting feed. This is why the code uses `feedRate / 3`
for plunges.

### The G-code safety checklist

Before sending any generated G-code to a real machine:

1. **Backplot it first** — use the Lab 06 backplotter to visualise
2. **Check safe Z** — confirm the safe Z height clears all clamps and fixtures
3. **Check depth** — is the final Z what you intended? (Sign error is common!)
4. **Run in air** — raise the Z offset by 10mm and run the program with the
   spindle off, watching the machine move in free air
5. **Check tool direction** — G2 is CW, G3 is CCW; confirm your operation
   uses climb milling vs conventional milling correctly

---

## What You Have After Lab 07

```
cam/
  js/
    cam/
      Profile.js
      ProfileOffset.js
      ContourOperation.js
      PocketOperation.js
      GCodeGenerator.js
    ui/
      cam-panel.js
python/
  cam_operations.py
```

**Working features:**

- Profile detection: finds connected closed loops in your drawn geometry
- Contour operation: offset + multi-pass contour with correct tool radius compensation
- Pocket operation: scan-line fill with zig-zag passes
- G-code output: standard G21/G90/G0/G1/G2/G3/M3/M30 format
- CAM panel: configure all parameters, generate, save .nc file
- Backplot integration: generated G-code immediately shown in the viewport

---

## DIVERGE POINTS

**1. Arc profiles:** The current `profileToPolygon` only handles lines. Add arc
support: at each arc segment, sample the arc into short chord segments and treat
those as polygon edges for the offset computation. Accuracy improves with more
samples.

**2. Spiral pocket:** Instead of zig-zag, machine inward in a spiral (each pass
is an inset of the last). This is better for most materials because the cutter
is always in contact and there is no rapid-retract-rapid cycle.

**3. Tabs:** Leave small "tabs" (uncut sections) to hold the part in the stock
during the final pass. Implement by inserting rapid-up then rapid-down segments
at specified positions along the contour.

**4. Multiple profiles:** The CAM panel currently uses only the first closed
profile. Add a list of detected profiles and let the user select which ones to
machine.

**5. Tool library:** Add a `tools.json` file and a tool selector in the panel.
Each tool has a name, diameter, flutes, material, recommended feed, speed.

**6. Toolpath optimisation:** Implement the nearest-neighbour rapid sort from
the C++ exercise — sort the pocket passes so the machine travels the shortest
total distance between cuts.

---

_Continue to [Lab 08 — Into 3D](LAB-08-INTO-3D.md)._
