# Lesson 53: A Foreign Key Without a Database

**What you will build:** a real Layers tab, toggled from the ribbon like
every other panel, that gives Lesson 52's sketch entities somewhere to
live besides "all of them, all the time, on screen." Every entity is
tagged with which layer it belongs to; a layer can be hidden (its
entities stop rendering, without being deleted), renamed, or deleted
(which takes its own entities with it). The transferable problem this
lesson is actually about: what a foreign key gives you for free in a
real database, and what you personally have to write by hand the moment
there isn't one.

**What you need to know first:** Lesson 52's `sketch.ts` (`SketchEntity`,
the discriminated union) and `useSketch.ts` (the hook that owns
`sketchEntities`/`drawPoints`); Lesson 46's `useMemo` (`eligibleIndices`,
`revealedPoints`); Lesson 14's foreign keys
(`concepts/sql-create-table-and-schema.md`) and Lesson 47/48's real use
of them in `core/tools.py` (`ForeignKey("TlTool.ID")`, etc.); Lesson
47's `concepts/uuid-byte-order.md`; `concepts/orm-cascade-delete-vs-
core-delete.md`; the panel/ribbon toggle system from Lessons 22/23/45/46
(`ViewId`, `VIEW_LABELS`, `RibbonToolbar`, `SidePanel`).

---

## Concept Unit: Minting a Real Identity, Client-Side

### The Problem

A new layer needs a real, stable identity the moment "Add Layer" is
clicked — something `layerId` on a `SketchEntity` can point at, and
something React can key on. Every id this project has minted so far — a
tool's `id`, a holder's `id` — arrived already-made from the backend
(`core/tools.py`'s `uuid.uuid4()`, or a real GUID read out of an
imported `.TOOLDB` file). Nothing on the client has ever had to invent a
brand-new unique identifier itself. Can a browser tab safely make one up
on its own, with no server involved at all?

### Introduce the Concept in Isolation

First appearance of this exact construct in this project — full
standalone treatment: `concepts/browser-crypto-randomuuid.md`. Read that
first; its own isolated example (two calls to `crypto.randomUUID()`,
confirmed different, with no coordination between them) is the real
shape this project needed.

### Discard

That two-line script never becomes part of this project — it existed
only to prove `crypto.randomUUID()` produces a real, distinct value on
every call, with no server round-trip. It is not reused below.

### Project Change

- **Reference Source** — none. The reference's own `geoms` array
  (`cnc-sim/cnc/components/ObjectsList.jsx`, read this session — see
  the last unit of this lesson) never gives a shape an id at all; it
  identifies each one by its position in the array (`onSelect(i)`,
  `onDelete(i)`). There is nothing to port here because the reference
  never needed a real, stable identity for anything it drew.
- **Files affected** — `cnc-web/src/useSketch.ts`.
- **Change type** — add.
- **Location** — new `makeLayer()` helper above the hook; new state
  inside `useSketch()`, right after the existing `sketchEntities`/
  `drawPoints` declarations; new `addLayer()` alongside
  `handleFinishContour()`.
- **Dependencies** — `concepts/browser-crypto-randomuuid.md`.

### The New Code

```ts
function makeLayer(name: string): Layer {
  return { id: crypto.randomUUID(), name, visible: true };
}
```

`useSketch()` needs somewhere to keep the layers this produces, and a
real starting layer to exist before any click ever happens:

```ts
  const [layers, setLayers] = useState<Layer[]>(() => [makeLayer("Layer 1")]);
  const [activeLayerId, setActiveLayerId] = useState<string>(() => layers[0].id);
  const layerCounterRef = useRef(1);
```

And the one real action that calls `makeLayer` again, after mount —
clicking "Add Layer":

```ts
  function addLayer() {
    layerCounterRef.current += 1;
    const layer = makeLayer(`Layer ${layerCounterRef.current}`);
    setLayers((prev) => [...prev, layer]);
    setActiveLayerId(layer.id);
  }
```

### The Updated Project

`useSketch.ts`'s own imports and the top of the hook, with everything
new marked:

```ts
import { useEffect, useMemo, useRef, useState } from "react"; // ← changed: useMemo, useRef added
import type { DrawPlane, DrawTool } from "./viewport.ts";
import { PLANE_AXES, circumcircle, rectCorners, type Layer, type Point3, type SketchEntity } from "./sketch.ts"; // ← changed: Layer added

function makeLayer(name: string): Layer { // ← new
  return { id: crypto.randomUUID(), name, visible: true }; // ← new
} // ← new

export function useSketch(plane: DrawPlane) {
  const [drawTool, setDrawToolState] = useState<DrawTool>("select");
  const [sketchEntities, setSketchEntities] = useState<SketchEntity[]>([]);
  const [drawPoints, setDrawPoints] = useState<Point3[]>([]);

  const [layers, setLayers] = useState<Layer[]>(() => [makeLayer("Layer 1")]); // ← new
  const [activeLayerId, setActiveLayerId] = useState<string>(() => layers[0].id); // ← new
  const layerCounterRef = useRef(1); // ← new
```

`useSketch()` now starts its life with exactly one real layer already
in place — `layers[0]` — and `activeLayerId` already pointing at it, so
the very first click of the very first session has somewhere real to
land.

`addLayer` shown in its real location, alongside the hook's other
mutating functions:

```ts
  function handleFinishContour() {
    if (drawTool === "contour" && drawPoints.length > 1) {
      setSketchEntities((entities) => [
        ...entities,
        { type: "polyline", points: drawPoints, closed: true, layerId: activeLayerId },
      ]);
    }
    setDrawPoints([]);
  }

  function addLayer() { // ← new
    layerCounterRef.current += 1; // ← new
    const layer = makeLayer(`Layer ${layerCounterRef.current}`); // ← new
    setLayers((prev) => [...prev, layer]); // ← new
    setActiveLayerId(layer.id); // ← new
  } // ← new
```

Clicking "Add Layer" now does two real things in sequence: mint a fresh
`Layer` (a real id, a name nobody else currently has, `visible: true`),
append it to `layers`, and immediately make it the active one — so the
very next shape drawn lands on the layer that was just created, not the
one that was active a moment ago.

### Mechanical Walkthrough

- `makeLayer(name)` — **(a) first appearance** — a plain function
  returning a fresh `Layer` object literal. `crypto.randomUUID()` is
  covered in full by `browser-crypto-randomuuid.md`; nothing more to add
  here.
- `useState<Layer[]>(() => [makeLayer("Layer 1")])` — **(b) hard concept
  reappearing** (the lazy initializer, per the Repetition Rule) — this
  project already relies on a `useState` initializer function running
  exactly once, at mount, in `App.tsx`'s own `themeId` state (Lesson 12):
  the same guarantee is what makes it safe to call `makeLayer` here
  without minting a brand-new, wasted UUID on every re-render.
- `useState<string>(() => layers[0].id)` — the second lazy initializer
  reads `layers`, a `const` already assigned by the *previous* line in
  this same render — a plain, sequential JavaScript read, not a React
  feature; both initializers run once, together, at mount.
- `useRef(1)` — **(b) hard concept reappearing** — `react-useref-hook.md`
  already established that a ref's `.current` persists across renders
  without ever causing one. This is a different *use* of that same
  guarantee than this project's earlier ref (`Viewport.tsx`'s callback-
  mirror refs, Lesson 50): there, a ref stood in for a DOM node and a
  prop snapshot; here, it's a plain incrementing counter, read and
  written only inside an event handler, with no DOM and no callback
  involved at all — the same underlying property (survives a render,
  never triggers one), a narrower application of it.
- `layerCounterRef.current += 1` — already-established syntax (`+=` on a
  ref's `.current`, the same shape `viewport.ts`'s own mutable fields
  already use) — no restatement owed.
- `` `Layer ${layerCounterRef.current}` `` — already-established syntax
  (template literal).
- `setLayers((prev) => [...prev, layer])` — **(b) hard concept
  reappearing** — the same functional-updater-plus-spread shape this
  project has used since Lesson 46's `setSketchEntities`.
- `setActiveLayerId(layer.id)` — already-established syntax (a plain
  state setter).

### CS Lens

Not a hard CS concept on its own beyond what `browser-crypto-
randomuuid.md` already covers — but worth naming the *second* identity
problem this unit solves alongside the id: `layerCounterRef` exists
because naming new layers by the current count (`` `Layer
${layers.length + 1}` ``) would hand out "Layer 2" a second time the
moment the first "Layer 2" is deleted and a new layer is added — the
exact same *collision* concern `crypto.randomUUID()`'s 122 random bits
solve for the machine id, solved here for the human-readable name with
an ever-incrementing counter instead of a re-derived count. Different
mechanism, same underlying worry: never hand out an identifier — machine
or human-facing — that something else might already be using.

### SE Lens

The real alternative rejected here: naming layers `` `Layer
${layers.length + 1}` ``, which reads as simpler (no extra `ref`, no
extra state) and is correct right up until the first deletion. The
`layerCounterRef` version costs one extra piece of state for a scenario
(delete a layer, add a new one) that will not be rare in real use — this
project's own `deleteLayer` (later in this lesson) makes deleting a
layer a first-class, expected action, not an edge case, so the counter
earns its keep immediately rather than defending against something
unlikely.

### Commands

None new — `crypto` is a real global, no install.

### Run It

```
This fragment doesn't run standalone yet — layers exist but nothing
reads layerId to decide what's visible, and no UI can add or select one.
Connects to the next three units.
```

### Connection

`makeLayer`'s minted id is what every later unit in this lesson actually
hangs off of: `layerId` (next unit) names one, `toggleLayerVisibility`
and `deleteLayer` (later units) look one up.

---

## Concept Unit: A Layer Is a Foreign Key Without a Database

### The Problem

Given a real layer with a real id, how does a *shape* actually say which
layer it lives on? Two real shapes are possible: nest each layer's
shapes inside it (`layer.entities: SketchEntity[]`), or keep the single
flat `sketchEntities` array Lesson 52 already built and tag each shape
with which layer it belongs to.

### Project Change

- **Reference Source** — none. The reference's own `geoms` array has no
  concept of grouping at all — every drawn shape sits in one flat,
  ungrouped list, forever, which is the exact limitation this whole
  lesson exists to fix, per direct instruction ("we can't have all
  geometry on the screen at all times").
- **Files affected** — `cnc-web/src/sketch.ts`.
- **Change type** — add (a field on an existing type; a new type).
- **Location** — `SketchEntity`'s three variants; a new `Layer`
  interface, directly below it.
- **Dependencies** — none.

### The New Code

```ts
export type SketchEntity =
  | { type: "polyline"; points: Point3[]; closed: boolean; layerId: string }
  | { type: "circle"; center: Point3; radius: number; plane: DrawPlane; layerId: string }
  | {
      type: "arc";
      center: Point3;
      radius: number;
      startAngle: number;
      endAngle: number;
      ccw: boolean;
      plane: DrawPlane;
      layerId: string;
    };

export interface Layer {
  id: string;
  name: string;
  visible: boolean;
}
```

### The Updated Project

`sketch.ts`'s full `SketchEntity` union and its new neighbor, in place
(`sketch.ts:24-55`):

```ts
// A single, real, closed-or-open polyline covers the reference's own
// "line" (2 points), "rect" (4 real corners, closed), and "contour" (N
// points, optionally closed) -- all three are really the identical real
// shape, just built from different click counts.
export type SketchEntity =
  | { type: "polyline"; points: Point3[]; closed: boolean; layerId: string } // ← changed: layerId added
  | { type: "circle"; center: Point3; radius: number; plane: DrawPlane; layerId: string } // ← changed: layerId added
  | {
      type: "arc";
      center: Point3;
      radius: number;
      startAngle: number;
      endAngle: number;
      ccw: boolean;
      plane: DrawPlane;
      layerId: string; // ← new
    };

export interface Layer { // ← new
  id: string; // ← new
  name: string; // ← new
  visible: boolean; // ← new
} // ← new
```

Every real shape this project can draw — polyline, circle, arc — now
carries a `layerId` no matter which of the three it is; `SketchEntity`
still means exactly what Lesson 52 built (one of three real shapes), it
just now also always says which layer it's on.

Immediately, `useSketch.ts`'s four entity-creating call sites gain the
identical new field (`useSketch.ts:59-127`), each one tagging its new
shape with `activeLayerId`:

```ts
  function handlePointClick(point: Point3) {
    if (drawTool === "select") return;

    if (drawTool === "line") {
      if (drawPoints.length === 0) {
        setDrawPoints([point]);
      } else {
        setSketchEntities((entities) => [
          ...entities,
          { type: "polyline", points: [drawPoints[0], point], closed: false, layerId: activeLayerId }, // ← changed
        ]);
        setDrawPoints([]);
      }
    } else if (drawTool === "rect") {
      if (drawPoints.length === 0) {
        setDrawPoints([point]);
      } else {
        setSketchEntities((entities) => [
          ...entities,
          {
            type: "polyline",
            points: rectCorners(drawPoints[0], point, plane),
            closed: true,
            layerId: activeLayerId, // ← new
          },
        ]);
        setDrawPoints([]);
      }
    } else if (drawTool === "circle") {
      if (drawPoints.length === 0) {
        setDrawPoints([point]);
      } else {
        const [axisA, axisB] = PLANE_AXES[plane];
        const center = drawPoints[0];
        const radius = Math.hypot(point[axisA] - center[axisA], point[axisB] - center[axisB]);
        setSketchEntities((entities) => [
          ...entities,
          { type: "circle", center, radius, plane, layerId: activeLayerId }, // ← changed
        ]);
        setDrawPoints([]);
      }
    } else if (drawTool === "arc") {
      const next = [...drawPoints, point];
      if (next.length < 3) {
        setDrawPoints(next);
      } else {
        const result = circumcircle(next[0], next[1], next[2], plane);
        if (result) {
          setSketchEntities((entities) => [
            ...entities,
            { type: "arc", plane, layerId: activeLayerId, ...result }, // ← changed
          ]);
        }
        setDrawPoints([]);
      }
    } else if (drawTool === "contour") {
      setDrawPoints((prev) => [...prev, point]);
    }
  }

  function handleFinishContour() {
    if (drawTool === "contour" && drawPoints.length > 1) {
      setSketchEntities((entities) => [
        ...entities,
        { type: "polyline", points: drawPoints, closed: true, layerId: activeLayerId }, // ← changed
      ]);
    }
    setDrawPoints([]);
  }
```

Every shape this hook can produce is now created with a real,
non-optional `layerId` already attached — there is no code path left
that creates a `SketchEntity` without one, because TypeScript's own
compiler rejects an object literal missing a field the union's variants
require.

### Mechanical Walkthrough

- `layerId: string` — **(a) first appearance of the idea itself, in this
  project's own frontend** — a plain string field, syntactically nothing
  new (every other field on these variants is already a plain,
  already-taught type). What's new is its *role*: it exists purely to
  name a *different* object, elsewhere, that this one relates to.
- Everywhere `layerId: activeLayerId` appears in `useSketch.ts` — already
  established syntax (reading a variable, an object-literal shorthand
  the earlier ones use explicitly `layerId: activeLayerId` rather than
  the `{ layerId }` shorthand, matching this file's existing style of
  always naming the field even when it would match the variable name).

### CS Lens

This is a **foreign key**, restated: `entity.layerId` names which
`Layer` a shape belongs to, the identical structural role
`Book.author_id` plays for `Author` in `sql-create-table-and-schema.md`
(Lesson 14), and the identical role `TlToolMill.ID`'s own
`ForeignKey("TlTool.ID")` plays in this project's real backend schema
(`core/tools.py`, Lessons 47–48). Same idea, restated for the third real
time in this curriculum — deepened here by what's missing: every earlier
appearance had a real database underneath, actively enforcing that the
referenced row exists. Nothing here does that. `sql-create-table-and-
schema.md`'s own database would reject an `INSERT` naming a nonexistent
`author_id`, at the moment it happened, with a real constraint
violation. A bug that assigned an entity a `layerId` belonging to no
real `Layer` would raise no error anywhere, ever — it would simply never
render (the next unit's filter would silently exclude it) and never be
deletable through the UI (nothing points a delete button at a layer that
isn't listed). This is the real, honest cost of a foreign key without a
database: the *shape* of the idea is free to copy; the *enforcement* is
not, and has to be built by hand or not at all.

Also recognized in: any in-memory cache keyed by a database id without
a live foreign-key constraint backing it (Redis storing `session:
{user_id}` with no guarantee `user_id` still exists); a browser's own
bookmarks storing a `folderId` per bookmark, in `localStorage`, with
nothing but application code ever checking that folder still exists;
any distributed system passing a plain id across a network boundary
where the receiving side has no database to validate it against at all.

### SE Lens

The real alternative not chosen: `layer.entities: SketchEntity[]`, shapes
nested directly inside the layer that owns them. Nested storage makes
"how many shapes does this layer have" and "delete this layer and
everything on it" both a single field access — no separate accounting
needed. It makes "everything currently visible, regardless of layer"
(exactly what `Viewport` needs, every render) the *expensive* operation
instead — flattening every layer's array back into one list, every time.
This project's real choice — one flat list, a tag field — inverts that
tradeoff on purpose: `Viewport` needs "what's visible" far more often
(every render) than the Layers panel needs "how many things are on
Layer 2" (once, when that number changes) — so the flat shape optimizes
for the read that actually happens most, at the real cost (paid in the
next two units) of computing membership and counts by filtering instead
of reading a length.

### Commands

None new.

### Run It

Running the one real command this change affects:

```
$ npx tsc --noEmit
Clean — every SketchEntity-producing call site in useSketch.ts already
supplies layerId (previous unit's activeLayerId), so the new required
field breaks nothing.
```

### Connection

The previous unit minted a real layer id; this unit is what makes that
id mean something to a shape — every polyline, circle, and arc Lesson 52
already knew how to build now also says, permanently, which layer it's
on.

---

## Concept Unit: What the Viewport Actually Sees — Filtering By a Linked Flag

### The Problem

Hiding a layer must not delete its shapes — toggling it back on has to
show exactly what was there before, undamaged. `Viewport` (Lesson 52)
currently receives every entity in `sketchEntities`, unconditionally.

### Project Change

- **Reference Source** — none. The reference's `ObjectsList.jsx` has no
  visibility concept of any kind — every drawn shape renders,
  permanently, until individually deleted. There is nothing to port;
  this capability doesn't exist anywhere in the reference.
- **Files affected** — `cnc-web/src/useSketch.ts`, `cnc-web/src/App.tsx`.
- **Change type** — add (new derived state); replace (one prop value).
- **Location** — `useSketch.ts`, after `deleteLayer` (shown in the next
  unit, since `visibleEntities` and `layerEntityCounts` sit right after
  it in the real file — shown here first since it's the concept this
  unit teaches); `App.tsx`'s `<Viewport>` element, its `sketchEntities`
  prop.
- **Dependencies** — Lesson 46's `useMemo`.

### The New Code

```ts
  function toggleLayerVisibility(id: string) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l)));
  }
```

That flips one layer's own `visible` flag; the second piece is what
actually reads it back, every render:

```ts
  const visibleEntities = useMemo(
    () => sketchEntities.filter((e) => layers.find((l) => l.id === e.layerId)?.visible ?? true),
    [sketchEntities, layers],
  );
```

### The Updated Project

`useSketch.ts`'s `renameLayer`/`toggleLayerVisibility` pair (the second
shown once, in full, then reused by exact repetition — `renameLayer`
maps over `layers` updating one field by id; `toggleLayerVisibility`
maps over `layers` flipping one field by id; the same shape, twice):

```ts
  function renameLayer(id: string, name: string) {
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, name } : l)));
  }

  function toggleLayerVisibility(id: string) { // ← new
    setLayers((prev) => prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))); // ← new
  } // ← new
```

`App.tsx`'s `<Viewport>` element, with the one changed prop marked
(`App.tsx:439-453`):

```tsx
          <Viewport
            ref={viewportHandleRef}
            points={revealedPoints}
            themeId={themeId}
            activeTool={activeToolDisplay}
            showHolder={showHolder}
            drawPlane={drawPlane}
            planeDepth={planeDepth}
            onCursorMove={setCursorPosition}
            drawTool={sketch.drawTool}
            sketchEntities={sketch.visibleEntities} // ← changed: was sketch.sketchEntities
            drawPoints={sketch.drawPoints}
            onPointClick={sketch.handlePointClick}
            onFinishContour={sketch.handleFinishContour}
          />
```

`Viewport` itself is untouched — it still just renders whatever array
its `sketchEntities` prop hands it, exactly as Lesson 52 built it; only
*which* array reaches that prop changed.

### Mechanical Walkthrough
- `prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))` —
- **(b) hard concept reappearing** — the identical `.map`-plus-spread
  "update one item in an array by id" shape `renameLayer` (directly
  above it) already used for `name`; no new syntax, a different field.
- `!l.visible` — already-established syntax (logical NOT on a boolean
  field).
- `sketchEntities.filter((e) => ...)` — **(b) hard concept reappearing**
- — `.filter` returning a new array, the same construct `App.tsx`'s own
  `revealedPoints` (Lesson 46) already uses.
- `layers.find((l) => l.id === e.layerId)` — **(b) hard concept
- reappearing** — `.find`, already used identically in `ToolCardList.tsx` (Lesson 48, `tools.find((t) => t.id === assemblyToolId)`) — look up the

  one related object by id, exactly the "read the foreign key, then look
  up the row it points at" step `sqlalchemy-relationship-back-
- populates.md` named for `book.author` — done here by hand, with a
  linear scan, instead of a real index or an ORM's own query.
- `?.visible` — already-established syntax (optional chaining) — `find`
  returns `undefined` if no layer matches; without `?.` this would throw
  reading `.visible` off `undefined`.
- `?? true` — already-established syntax (nullish coalescing) — if the
  lookup itself came back `undefined` (a genuinely malformed entity, per
  the previous unit's own CS Lens), this defaults to *showing* it rather
  than hiding it, since silently hiding a shape with no explanation is a
  worse failure than showing one that shouldn't strictly exist.
- `useMemo(() => ..., [sketchEntities, layers])` — **(b) hard concept
  reappearing** — Lesson 46's own dependency-array pattern: recomputed
  only when either input actually changes, not on every render.

### CS Lens

Not repeated as its own new lens — this is the direct, practical
consequence of the previous unit's foreign key: reading a related
object's flag through the link (`layers.find(...)`) instead of storing
the flag redundantly on the entity itself, the same single-source-of-
truth reasoning any foreign key relies on (change a layer's visibility
once, every entity pointing at it reflects it immediately, with nothing
to keep in sync by hand).

### SE Lens

Filtering for rendering, rather than deleting, is the same real
principle `SidePanel.tsx` already established for a completely different
substrate (Lesson 46: an inactive tab stays mounted, hidden via CSS
`display: none`, specifically so its own component state survives a
switch away and back). There, the DOM stayed real but invisible; here,
the *data* stays real but excluded from the array Viewport ever sees —
"hidden" and "gone" read as the same thing to a user glancing at the
screen, but they must never be the same thing in the code, or toggling a
layer back on would show nothing.

### Commands

```
npx vitest run
```

### Run It

```
18/18 passing, unaffected -- no test exercises visibleEntities directly
yet; confirmed live in the browser instead (this unit's own real proof
is visual): drew a shape on Layer 1, added Layer 2, drew a circle on it,
unchecked Layer 1's visibility checkbox -- the line and rect vanished
from the 3D scene, the circle stayed. Re-checking the box brought the
line and rect back, unchanged.
```

### Connection

The foreign key the previous unit added now has a real reader:
`visibleEntities` is the first code in this project that ever asks
"which layer is this on, and is that layer visible" — and `Viewport`
never has to know layers exist at all, because it only ever sees the
already-filtered result.

---

## Concept Unit: Deleting What a Layer Owns — Cascading By Hand

### The Problem

Deleting a layer that still has real shapes on it — what happens to
them? Left alone, `layerId` would keep naming a layer that no longer
exists: exactly the dangling-reference failure the previous unit's CS
Lens named as a real, honest cost of doing this without a database.

### Project Change

- **Reference Source** — `cnc-sim/cnc/components/ObjectsList.jsx:32-40`
  (read this session, quoted below) — the reference's own `onDelete(i)`
  removes exactly one shape, by array index. There is no reference
  behavior for deleting a *group* of shapes at once, because the
  reference has no grouping at all:

  ```jsx
  <button
    style={{ background: "none", border: "none", color: C.txt3, cursor: "pointer", fontSize: 11 }}
    onClick={(e) => {
      e.stopPropagation();
      onDelete(i);
    }}
  >
    ✕
  </button>
  ```

- **Files affected** — `cnc-web/src/useSketch.ts`.
- **Change type** — add.
- **Location** — `deleteLayer`, alongside `toggleLayerVisibility`;
  `layerEntityCounts`, alongside `visibleEntities`.
- **Dependencies** — none.

### The New Code

```ts
  function deleteLayer(id: string) {
    if (layers.length <= 1) return;
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setSketchEntities((prev) => prev.filter((e) => e.layerId !== id));
    if (activeLayerId === id) {
      const fallback = layers.find((l) => l.id !== id);
      if (fallback) setActiveLayerId(fallback.id);
    }
  }
```

The second piece isn't part of the cascade itself — it's what the
Layers panel reads to show a real "how many shapes" number per row:

```ts
  const layerEntityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const e of sketchEntities) counts[e.layerId] = (counts[e.layerId] ?? 0) + 1;
    return counts;
  }, [sketchEntities]);
```

### The Updated Project

`useSketch.ts`'s final block — `deleteLayer`, `visibleEntities`,
`layerEntityCounts`, and the hook's own return statement, in place
(`useSketch.ts:150-190`):

```ts
  function deleteLayer(id: string) { // ← new
    if (layers.length <= 1) return; // ← new
    setLayers((prev) => prev.filter((l) => l.id !== id)); // ← new
    setSketchEntities((prev) => prev.filter((e) => e.layerId !== id)); // ← new
    if (activeLayerId === id) { // ← new
      const fallback = layers.find((l) => l.id !== id); // ← new
      if (fallback) setActiveLayerId(fallback.id); // ← new
    } // ← new
  } // ← new

  const visibleEntities = useMemo(
    () => sketchEntities.filter((e) => layers.find((l) => l.id === e.layerId)?.visible ?? true),
    [sketchEntities, layers],
  );

  const layerEntityCounts = useMemo(() => { // ← new
    const counts: Record<string, number> = {}; // ← new
    for (const e of sketchEntities) counts[e.layerId] = (counts[e.layerId] ?? 0) + 1; // ← new
    return counts; // ← new
  }, [sketchEntities]); // ← new

  return {
    drawTool,
    setDrawTool,
    visibleEntities,
    drawPoints,
    handlePointClick,
    handleFinishContour,
    layers, // ← new
    activeLayerId, // ← new
    setActiveLayerId, // ← new
    addLayer, // ← new
    renameLayer, // ← new
    toggleLayerVisibility, // ← new
    deleteLayer, // ← new
    layerEntityCounts, // ← new
  };
}
```

`useSketch()` now exposes everything the coming Layers panel needs to
both display layers (`layers`, `activeLayerId`, `layerEntityCounts`) and
mutate them (`setActiveLayerId`, `addLayer`, `renameLayer`,
`toggleLayerVisibility`, `deleteLayer`) — the hook's own public surface,
not spread across separate return statements.

### Mechanical Walkthrough
- `if (layers.length <= 1) return;` — **(a) first appearance of this
  exact guard in this project** — a plain early return preventing the
  function from doing anything at all once only one real layer remains;
  `<=` rather than `===` defensively covers an unreachable `0` case the
  same way, at no extra cost.
- `setLayers((prev) => prev.filter((l) => l.id !== id))` — **(b) hard
- concept reappearing** — `.filter` excluding one item by id, the same
  construct `removeFromPanel` (`App.tsx`, Lesson 45) already uses to
  drop a closed tab from a panel's own `tabs` array.
- `setSketchEntities((prev) => prev.filter((e) => e.layerId !== id))` —
  the cascade itself: every entity whose `layerId` matches the layer
  being deleted is excluded from the *entities* array, in the same
- statement, using the identical already-taught `.filter` construct —
  no new syntax, the entire "cascade" is one already-familiar method
  call pointed at a second array.
- `if (activeLayerId === id) { ... }` — already-established syntax (an
  equality check) guarding real, new logic: reassigning `activeLayerId`
  only when the deleted layer was the one currently selected.
- `layers.find((l) => l.id !== id)` — **(b) hard concept reappearing** —
  `.find`, this time locating *any* remaining layer (the first one that
  isn't the one being deleted) rather than one specific id.
- `for (const e of sketchEntities) counts[e.layerId] = (counts[e.layerId] ?? 0) + 1;`
- — **(b) hard concept reappearing** — `for...of` (already used in
  `viewport.ts`'s own cleanup functions, Lesson 52) building up a plain
  object used as a lookup table, keyed by string — the same "object as
  a map" shape this project's `VIEW_LABELS` (`App.tsx`, Lesson 22) and
  `INFO_ICONS` (`BlockList.tsx`, Lesson 41) already rely on, just built
  incrementally here instead of written as one literal.
- `counts[e.layerId] ?? 0) + 1` — already-established syntax (nullish
  coalescing, arithmetic) — the standard "count occurrences" idiom:
  default a missing key to zero, then add one.

### Execution Trace

For `sketchEntities = [{layerId: "A", ...}, {layerId: "B", ...},
{layerId: "A", ...}]`:

```
Start: counts = {}
Entity 1 (layerId "A"): counts["A"] undefined → 0 + 1 → counts = { A: 1 }
Entity 2 (layerId "B"): counts["B"] undefined → 0 + 1 → counts = { A: 1, B: 1 }
Entity 3 (layerId "A"): counts["A"] is 1 → 1 + 1 → counts = { A: 2, B: 1 }
Final: counts = { A: 2, B: 1 }
```

### CS Lens

This is **cascading delete** / **referential integrity**, the concept
`orm-cascade-delete-vs-core-delete.md` already covers for a real,
SQLAlchemy-specific failure mode — restated here in a genuinely new
context: that file's whole subject is an ORM's automatic cascade
*inference* going wrong for a shared-primary-key relationship, and the
fix was explicit, ordered SQL `delete()` statements instead of trusting
`session.delete()`'s own guesswork. This project's own real
`delete_tool` (`core/tools.py:615-633`) is exactly that fix in
production: five explicit deletes, in dependency order, deepest table
first. `deleteLayer` is the same idea taken one step further — there is
no ORM here at all, so there is no inference to go wrong in the first
place. Cascading is a single, explicit `.filter()` call, visible in its
entirety in one function, doing by hand exactly what a real database's
`ON DELETE CASCADE` clause (a real SQL feature this project's own schema
does not use anywhere — `core/storage.py`'s tables rely on explicit code
instead, per that same concept file) would otherwise do automatically.

Also recognized in: deleting a filesystem directory removing every file
inside it; deleting a GitHub repository removing every issue and pull
request filed against it; deleting a Kubernetes namespace removing
every resource created inside it — the same "the container's deletion
is also its contents' deletion" rule, enforced by whatever system owns
the containment, or, here, written by hand because nothing else does.

### SE Lens

The real alternative not chosen: orphan instead of cascade — deleting a
layer but leaving its entities in place with a now-dangling `layerId`,
either hidden permanently or silently reassigned to some default layer.
Orphaning is more forgiving (nothing is ever truly lost, a mis-click
deleting the wrong layer doesn't destroy geometry) at the real cost of
clutter and confusion (shapes existing on no visible layer, invisible
and unreachable, for as long as the session runs). This project's real
choice — cascade, per direct instruction ("a place for geometry to
live" — deleting the place removes what's in it) — trades recoverability
for a simpler, more honest mental model: a layer really is where its
shapes live, not a label that can be peeled off leaving them stranded.
The honest, named cost: there is currently no undo. Deleting a layer
with real work on it is real data loss, with no confirmation step in
front of it yet.

### Commands

```
npx vitest run
npx vite build
```

### Run It

```
18/18 passing.
vite build: succeeds.
Confirmed live in the browser, both real cases: deleting a non-active
layer (its own entities disappeared from the scene, the active layer
was unaffected) and deleting the currently-active layer (its entities
disappeared, and the remaining layer became active automatically, with
no user action needed to pick a new one).
```

### Connection

`deleteLayer` is the foreign key from two units ago paying its real
cost back: every entity this project can create already carries a
`layerId` (Concept Unit 2), and hiding by that link already works
(Concept Unit 3) — deleting by that same link is the last real operation
the relationship needs to support, and it needed exactly one new
`.filter()` call to get it, because the link itself was already there.

---

## Concept Unit: Exposing It — Wiring Into the Existing Panel System

**No new concept.** Every construct below is a repeated, exact
application of the panel/ribbon system Lessons 22, 23, 45, and 46
already built — per the Repetition Rule, basic syntax and already-
matched patterns are shown and used without further comment, not
re-explained. This unit exists so every real line of this feature's UI
actually appears in this lesson, per this project's own standing rule
that no code — front or back — goes untaught.

### Project Change

- **Reference Source** — `cnc-sim/cnc/components/ObjectsList.jsx:1-45`
  (read in full this session, quoted below) — the reference's real
  closest counterpart to "a panel that manages drawn geometry": a flat
  list, one row per shape, click-to-select, a per-row delete button, a
  live count in the section header (`Objects ({geoms.length})`), and a
  real empty state. This project's `LayersManager.tsx` reuses that exact
  shape (row, click-to-select, per-row delete, live count, `.sec` header)
  one level up — rows are layers, not shapes — a deliberate, named
  choice, not an oversight: per-shape select/delete/highlight (what the
  reference actually provides) is a real, remaining gap, named directly
  below in Known Incomplete.

  ```jsx
  export default function ObjectsList({ geoms, selectedIndex, onSelect, onDelete }) {
    return (
      <>
        <div className="sec">Objects ({geoms.length})</div>
        {geoms.length === 0 && (
          <div style={{ color: C.txt3, fontSize: 9 }}>
            No geometry yet. Select a draw tool and click in the viewport, or use
            coordinate entry above.
          </div>
        )}
        {geoms.map((g, i) => (
          <div
            key={i}
            className={`geom-item${selectedIndex === i ? " on" : ""}`}
            onClick={() => onSelect(selectedIndex === i ? null : i)}
          >
  ```

  Worth naming directly: the reference keys and addresses every row by
  `i`, its own array index (`key={i}`, `onSelect(... ? null : i)`,
  `onDelete(i)`). `LayersManager.tsx` keys and addresses every row by
  `layer.id` — this project's own Concept Unit 1 identity, minted once
  and never recomputed — which is not a stylistic difference: deleting
  the *first* shape in the reference's own `geoms` array silently shifts
  every subsequent index down by one, so a `selectedIndex` captured
  before the delete now names the wrong shape if nothing re-derives it.
  A real, minted id can't suffer that failure by construction — it
  never depended on position in the first place.

- **Files affected** — `cnc-web/src/LayersManager.tsx` (new),
  `cnc-web/src/App.tsx`, `cnc-web/src/theme.css`.
- **Change type** — add (new file, new CSS rules); replace (`ViewId`,
  `VIEW_LABELS`, `renderViewContent`).
- **Location** — `App.tsx`'s `ViewId` type and `VIEW_LABELS` record;
  a new branch in `renderViewContent`; `theme.css`, after `.tcard-meta`.
- **Dependencies** — none.

### The New Code

The complete new file:

```tsx
import type { Layer } from "./sketch.ts";

interface LayersManagerProps {
  layers: Layer[];
  activeLayerId: string;
  entityCounts: Record<string, number>;
  onSelect: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

function LayersManager({
  layers,
  activeLayerId,
  entityCounts,
  onSelect,
  onToggleVisibility,
  onRename,
  onAdd,
  onDelete,
}: LayersManagerProps) {
  const canDelete = layers.length > 1;

  return (
    <>
      <div className="sec">Layers</div>
      {layers.map((layer) => (
        <div
          key={layer.id}
          className={`layer-row${layer.id === activeLayerId ? " active" : ""}`}
          onClick={() => onSelect(layer.id)}
        >
          <input
            type="checkbox"
            checked={layer.visible}
            onChange={() => onToggleVisibility(layer.id)}
            onClick={(e) => e.stopPropagation()}
            title={layer.visible ? "Hide this layer" : "Show this layer"}
          />
          <input
            className="layer-row-name"
            value={layer.name}
            onChange={(e) => onRename(layer.id, e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="layer-row-count">{entityCounts[layer.id] ?? 0}</span>
          <button
            style={{
              background: "none",
              border: "none",
              color: "var(--color-muted)",
              cursor: canDelete ? "pointer" : "not-allowed",
              opacity: canDelete ? 1 : 0.4,
            }}
            disabled={!canDelete}
            onClick={(e) => {
              e.stopPropagation();
              onDelete(layer.id);
            }}
            title={canDelete ? "Delete this layer" : "The last layer can't be deleted"}
          >
            ✕
          </button>
        </div>
      ))}
      <button className="btn full" style={{ marginTop: 6 }} onClick={onAdd}>
        + Add Layer
      </button>
    </>
  );
}

export default LayersManager;
```

`App.tsx`'s `ViewId`/`VIEW_LABELS` (`App.tsx:113-131`):

```ts
type ViewId = "dro" | "tools" | "code" | "blocks" | "layers"; // ← changed: layers added

const VIEW_LABELS: Record<ViewId, string> = {
  dro: "DRO",
  tools: "Tools",
  code: "Code",
  blocks: "Operations",
  layers: "Layers", // ← new
};
```

`App.tsx`'s `renderViewContent`, in full (`App.tsx:326-393`):

```tsx
  function renderViewContent(id: ViewId) {
    if (id === "dro") {
      return (
        <>
          <PlaybackControls
            isPlaying={playback.isPlaying}
            isReset={playback.isReset}
            onToggleCycle={playback.toggleCycle}
            onStep={playback.step}
            sbk={playback.sbk}
            onToggleSbk={playback.toggleSbk}
            onReset={playback.reset}
            speedMode={playback.speedMode}
            onSetSpeedMode={playback.setSpeedMode}
            custSpeed={playback.custSpeed}
            onSetCustSpeed={playback.setCustSpeed}
          />
          <label className="assembly-toggle-row">
            <input
              type="checkbox"
              checked={showHolder}
              onChange={(e) => setShowHolder(e.target.checked)}
            />
            Show Holder
          </label>
          <MachineStatus state={currentState} />
        </>
      );
    }
    if (id === "code") {
      return (
        <div className="code-editor-panel">
          <FileActionToolbar currentFileName={fileName} onUploadFile={handleUploadFile} />
          {programError && <div className="code-error">{programError}</div>}
          <CodeEditor code={code} onChange={setCode} themeId={themeId} />
        </div>
      );
    }
    if (id === "blocks") {
      return (
        <BlockList
          program={debouncedCode}
          onProgramChange={setCode}
          onSelectionChange={setSelectedCommandIndices}
          toolsRefreshKey={toolsRefreshKey}
        />
      );
    }
    if (id === "layers") { // ← new
      return ( // ← new
        <LayersManager // ← new
          layers={sketch.layers} // ← new
          activeLayerId={sketch.activeLayerId} // ← new
          entityCounts={sketch.layerEntityCounts} // ← new
          onSelect={sketch.setActiveLayerId} // ← new
          onToggleVisibility={sketch.toggleLayerVisibility} // ← new
          onRename={sketch.renameLayer} // ← new
          onAdd={sketch.addLayer} // ← new
          onDelete={sketch.deleteLayer} // ← new
        /> // ← new
      ); // ← new
    } // ← new
    return (
      <>
        <ToolCardList refreshKey={toolsRefreshKey} />
        <ToolImportPanel onImported={() => setToolsRefreshKey((k) => k + 1)} />
      </>
    );
  }
```

`renderViewContent` now handles five real tab ids instead of four; the
new branch is a fifth, ordinary `if`, reading and calling `useSketch`'s
own new return values (all built across the previous three units) —
nothing about `RibbonToolbar` or `SidePanel` had to change at all, since
both already only ever iterate whatever `VIEW_LABELS` contains
(`RibbonToolbar`'s own `Object.keys(VIEW_LABELS)`, Lesson 22).

The complete new CSS (`theme.css:342-392`):

```css
.layer-row {
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 4px;
  cursor: pointer;
  transition: 0.15s;
}
.layer-row:hover {
  border-color: var(--color-border-strong);
}
.layer-row.active {
  border-color: var(--color-amber);
  background: var(--color-amber-bg);
}
.layer-row input[type="checkbox"] {
  margin: 0;
  flex-shrink: 0;
  accent-color: var(--color-status-on);
}
.layer-row-name {
  flex: 1;
  min-width: 0;
  background: none;
  border: none;
  border-bottom: 1px solid transparent;
  color: var(--color-text);
  font-size: 10px;
  font-weight: 600;
  font-family: inherit;
  padding: 2px 0;
}
.layer-row-name:focus {
  outline: none;
  border-bottom-color: var(--color-accent-blue);
}
.layer-row-count {
  font-size: 9px;
  color: var(--color-muted);
  font-family: monospace;
  flex-shrink: 0;
}
```

### Mechanical Walkthrough
Every construct here is a 100%-matching repeat, per the Repetition Rule,
used without further comment:

- `.layer-row` / `.layer-row.active` — the identical compound-selector,
  active-state-modifier shape as `.tcard`/`.tcard.on` (Lesson 18's
  descendant/compound-selector unit, Lesson 48's `.tcard` itself).
- `.layer-row-name:focus` — the `:focus` pseudo-class, first taught
  Lesson 43.
- `.layer-row input[type="checkbox"]` — the attribute selector, first
  taught Lesson 46, styling the identical real element type
  (`input[type="checkbox"]`) for the identical real purpose (a bound
  boolean toggle).
- `disabled={!canDelete}`, `className={...}`, `onClick={(e) =>
- e.stopPropagation()}` on a checkbox nested in a clickable row — the
  exact pattern `ToolImportPanel.tsx` (Lesson 18) and `BlockList.tsx`
  (Lesson 46) already established for "a row is clickable as a whole,
  but an element inside it needs its own, independent click."
- `value={layer.name}` / `onChange={(e) => onRename(layer.id,
- e.target.value)}` — a controlled text input updating one item in an array by id — the same shape `BlockList.tsx`'s own editable move

  fields (Lessons 43–44) already established.
- `className="btn full"` — Lesson 46's own full-width action button.

### CS Lens / SE Lens

Not repeated — no new concept in this unit; see the four units above
for everything genuinely new in this feature.

### Commands

```
npx tsc --noEmit
npx vitest run
npx vite build
```

### Run It

```
tsc --noEmit: clean.
vitest run: 18/18 passing.
vite build: succeeds.
Confirmed live in the browser via Playwright, this session: opened the
new Layers tab from the ribbon (identical toggle behavior to DRO/Tools/
Code/Operations); drew a line and a rect on Layer 1 (count showed 2);
clicked "+ Add Layer," drew a circle on the new Layer 2 (count showed
1, Layer 1 unaffected); unchecked Layer 1's visibility -- the line and
rect vanished, the circle stayed; renamed Layer 2 to "Fixtures" via the
inline input; deleted the (now hidden, count-2) Layer 1 -- its geometry
was gone even after the delete, confirming it was actually removed, not
just still hidden; deleted the currently-active layer in a separate
run and confirmed the remaining layer became active automatically, with
its delete button now disabled (the last-layer guard).
```

### Connection

This is the point where all four previous units become a real, usable
feature: a real identity (Unit 1) tags a real relationship (Unit 2)
that a real filter (Unit 3) and a real cascade (Unit 4) both operate
on — and this unit is nothing more than a form that reads and calls
those five already-complete pieces.

---

## Connect the Pieces

Click "+ Add Layer": `makeLayer()` mints a real id with
`crypto.randomUUID()` (Unit 1) and a real, never-reused name off
`layerCounterRef`; the new `Layer` becomes `activeLayerId`. Draw a
circle: `handlePointClick` tags the new `SketchEntity` with that same
`layerId` (Unit 2) — the foreign key. Uncheck that layer's checkbox:
`toggleLayerVisibility` flips its `visible` flag; `visibleEntities`
(Unit 3) re-filters, and the circle disappears from `Viewport` without
being deleted from `sketchEntities` at all — still real, just excluded
from what gets rendered. Click the layer's own ✕: `deleteLayer` (Unit
4) removes the layer and, in the same function, filters every entity
whose `layerId` pointed at it out of existence too — the cascade the
foreign key made possible finally paying off. `LayersManager.tsx`
(Unit 5) is the one place all five of those operations are actually
triggered by a real click, using zero concepts beyond what four
lessons and four units already built.

## What Breaks Without This

Comment out the `layerId !== id` filter inside `deleteLayer`, leaving
only `setLayers((prev) => prev.filter((l) => l.id !== id))`: delete a
layer that has real shapes on it, and those shapes keep rendering —
`visibleEntities`'s own `?? true` default (Unit 3) treats a `layerId`
that no longer resolves to any real layer as "show it anyway," so the
deleted layer's geometry becomes permanently visible, on no layer any
UI can find, with no checkbox anywhere that controls it and no delete
button that reaches it again. Restoring the filter line makes deleting
a layer real again — its shapes disappear along with it.

## Exercises

1. `browser-crypto-randomuuid.md`'s own Try-It-Yourself exercise 1 asks
   you to generate a thousand UUIDs and confirm none collide. Do that,
   then explain in your own words why this project was comfortable
   relying on that same math for a layer's id but not for a tool's
   `id` — name the real, distinguishing test from that file's SE Lens.
2. Trace `layerEntityCounts` by hand for
   `sketchEntities = [{layerId: "X"}, {layerId: "Y"}, {layerId: "X"},
   {layerId: "X"}]`, the same way this lesson's own Execution Trace did,
   and state the final `counts` object.
3. `deleteLayer` currently has no confirmation step before deleting real
   geometry — named directly in this lesson's own SE Lens as an honest,
   current gap. Sketch, in prose (no code), what a real confirmation
   would need to know that `deleteLayer` doesn't currently compute
   itself, and where in `LayersManager.tsx` it would have to be asked.
4. `orm-cascade-delete-vs-core-delete.md`'s own Connection names
   `delete_tool` (`core/tools.py:615-633`) as hitting the identical real
   "cascade by hand" problem on the backend. Read that function, then
   write one sentence stating what's genuinely the same between it and
   `deleteLayer`, and one sentence stating what's genuinely different —
   not just "one's Python and one's TypeScript."

## Known Incomplete — Named Directly

- **No per-shape select or delete** — the reference's own real
  `ObjectsList.jsx` (Unit 5's Reference Source) lets a user select and
  delete *one* shape at a time, regardless of layer, with a real
  highlight in the viewport for whichever one is selected. This project
  has no equivalent yet — a mis-drawn shape can currently only be
  removed by deleting its entire layer. Separate, later work.
- **No confirmation before deleting a layer's geometry** — named
  directly in this lesson's own SE Lens; deleting a layer with real work
  on it is real, immediate, unconfirmed data loss.
- **No G-code generation from a finished sketch** — unchanged from
  Lesson 52's own named gap; still separate, later work.
- **Layer order is always insertion order** — there is no way to
  reorder layers (move one above or below another), unlike most real
  CAD/CAM layer systems, including Mastercam's own Level Manager this
  feature is loosely modeled after.

## Definition of Done

- [x] `sketch.ts`: `Layer` interface; `layerId` on every `SketchEntity`
      variant.
- [x] `useSketch.ts`: `layers`/`activeLayerId` state, `makeLayer`,
      `addLayer`, `renameLayer`, `toggleLayerVisibility`, `deleteLayer`,
      `visibleEntities`, `layerEntityCounts`.
- [x] `LayersManager.tsx`: new sidebar tab, wired into `App.tsx`'s
      existing `ViewId`/`VIEW_LABELS`/`renderViewContent`/ribbon system.
- [x] `theme.css`: `.layer-row` family.
- [x] One new, project-independent concept file
      (`browser-crypto-randomuuid.md`).
- [x] `npx tsc --noEmit` clean.
- [x] `npx vitest run` — 18/18 passing (unaffected).
- [x] `npx vite build` — succeeds.
- [x] Confirmed live in the browser via Playwright: add/select/rename/
      delete a layer; draw on two different layers; toggle visibility;
      delete both a non-active and an active layer.
- [x] Checked with `scripts/check_lesson_diff_coverage.py` (targeted +
      `--all`) and `scripts/check_port_coverage.py` before being
      presented as done.

```
git commit -m "Lesson 53: a foreign key without a database"
```
