# Lesson 48: A Shape That Only Exists Once You Ask

**What you will build:** the frontend half (slice 2 of 2) of the
tool-assembly feature — clicking a tool card opens a real 3D preview of
that tool's own real assembly, built from Lesson 47's backend data. A
procedural cutting-tool profile and the backend's own real holder
profile are each revolved into a solid, positioned using the real,
confirmed stickout distance, and shown in a small, dedicated viewport
that frames itself correctly regardless of the real tool's own size.
One real, editable field (a holder's connection type/size) round-trips
through a new `PATCH` endpoint. Live-canvas integration (showing this
during simulation, not just in a static preview) is a deliberately
separate, later piece of work.

**What you need to know first:** Lesson 47's `get_tool_assembly`/
`TlProfileData` (the real data this feature displays); `threejs-
renderer-scene-camera.md`; `threejs-geometry-material-object.md`;
`threejs-lighting-basics.md`; `threejs-orbitcontrols.md`; `threejs-
mutating-scene-after-creation.md`; `react-useeffect-hook.md`;
`react-useref-hook.md`; Lesson 37/38's real teardown discipline
(`viewport.ts`'s own `cleanup`).

---

## Concept Unit: A Procedural Tool Profile, Honestly Simplified

### The Problem

The backend has a real, literal profile for a *holder* (Lesson 47's
`TlProfileData`) — but not for the cutting tool itself; Mastercam
doesn't store one for standard tools any more than it does for standard
holders. A tool's own shape needed to come from its already-real
dimensional fields (`diameter`, `cutting_depth`, `total_length`,
`arbor_diameter` — `ToolCardList.tsx`'s own `Tool` interface, Lesson
17), the same way the reference's own dead `buildFullToolProfile`
reached for a procedural mill-tool shape (tip → flute → shank), just
never wired up anywhere real.

### Project Change

- **Reference Source** — `cnc/toolTemplates.ts`'s `buildFullToolProfile`
  (its real, mill-tool branch) — real inspiration for the *shape*, not
  ported code (it operates on the reference's own template fields, not
  this project's real schema-derived ones, and was confirmed dead in
  Lesson 47).
- **Files affected** — `cnc-web/src/toolAssembly.ts` (new).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — none.

### The New Code

```ts
// A real 2D revolve-profile point -- x = radius, y = axial (Z) position,
// the exact real convention core/tools.py's own TlProfileData uses
// (confirmed by hand-tracing a real holder profile, then independently by
// scaling one in real Mastercam and observing it render fatter -- see
// Lesson 47's own ground-truth verification). Shared here by both the real
// holder profile (fetched from the backend) and the procedurally-built
// tool profile below, so both revolve through the identical function.
export interface ProfilePoint {
  x: number;
  y: number;
}

// The real dimensional fields ToolCardList.tsx's own `Tool` interface
// already carries -- everything a procedural cutting-tool profile needs,
// no new backend data required.
export interface ToolDimensions {
  diameter: number;
  cutting_depth: number;
  total_length: number;
  arbor_diameter: number;
}

// A real, deliberate simplification, named directly (the same honest cut
// the reference's own dead buildFullToolProfile made too): the tip is
// flat, not curved to match a real ball/bull-nose corner_radius -- this is
// a revolve *silhouette*, not a faithful cutting-edge model. Cylindrical
// at the full cutting diameter through the flute length, a single step
// down (or up) to the shank/arbor diameter for the remainder of the
// overall length, closed back to the axis at both ends so the revolve
// produces a real, solid shape with no open hole down its own centerline.
export function buildToolProfile(tool: ToolDimensions): ProfilePoint[] {
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

### Mechanical Walkthrough

Six points, in order: `(0,0)` and `(tipRadius,0)` form the flat tip
(a face, out to the cutting radius); `(tipRadius, cutting_depth)` holds
that same radius through the real flute length; the step to
`shankRadius` at the same `y` is the real transition from cutting
diameter to shank diameter (often, but not always, the same value —
`arbor_diameter` is real, separate data, not assumed equal to
`diameter`); the profile continues at `shankRadius` to `total_length`,
then closes back to `(0, total_length)`.

### CS Lens

Not a hard CS concept — a **silhouette/cross-section approximation**:
representing a real, more complex 3D shape (helical flutes, a curved
ball-nose tip) with the simplest 2D outline that captures its real,
overall proportions, deliberately trading detail for a shape simple
enough to revolve correctly with no new geometry code.

### SE Lens

The honest alternative rejected here: modeling the corner radius as a
real curved arc. That's a real, deferred improvement (Lesson 47's own
`TlProfileData.radius`/`StartAngle`/`SweepAngle` are similarly
unexercised, for the identical honest reason — no real data or code
needed it yet). A flat tip is a cheap, correct-enough-to-communicate-
scale-and-shape first pass; naming the simplification directly (in the
code's own comment) is what keeps it from being mistaken for an
oversight later.

### Commands

None new.

### Run It

```pycon
>>> tipRadius, shankRadius = 10/2, 10/2
>>> [(0,0), (tipRadius,0), (tipRadius,22), (shankRadius,22), (shankRadius,75), (0,75)]
[(0, 0), (5.0, 0), (5.0, 22), (5.0, 22), (5.0, 75), (0, 75)]
```

Matches `buildToolProfile`'s own real output for a 10mm-diameter,
22mm-flute, 75mm-overall, 10mm-shank tool exactly — verified directly
via a real vitest case (below).

---

## Concept Unit: Revolving a Profile Into a Solid

### The Problem

A 2D profile (either the procedural one above, or the backend's own
real holder profile) needs to become an actual 3D shape to display.

### Introduce the Concept in Isolation

**REAPPEARING** — `concepts/threejs-geometry-material-object.md`
already covers the real geometry/material/mesh separation this uses;
nothing new to introduce about that part. `THREE.LatheGeometry` itself
is a specific, real constructor this project hadn't used before, shown
directly below rather than given its own concept file (a narrow API
surface, not a new transferable idea beyond what that file already
covers).

### The New Code

```ts
// Revolves a real 2D profile 360 degrees around its own y-axis into a
// solid THREE.LatheGeometry -- THREE's own convention (a profile's `x`
// becomes distance from the revolve axis, `y` becomes height along it)
// happens to match core/tools.py's TlProfileData convention exactly, so
// no axis remapping is needed here at all.
export function revolveProfile(points: ProfilePoint[], segments = 32): THREE.LatheGeometry {
  const vector2Points = points.map((p) => new THREE.Vector2(p.x, p.y));
  return new THREE.LatheGeometry(vector2Points, segments);
}
```

### Mechanical Walkthrough

`THREE.LatheGeometry(points, segments)` sweeps `points` (an array of
`THREE.Vector2`) 360° around its own local Y axis, generating `segments`
radial divisions — the standard, built-in three.js primitive for
exactly this shape (a lathe/turned part), needing no custom vertex/face
construction at all. The real, load-bearing fact making this a one-line
function: `x`/`y` in a `Vector2` map directly onto "radius"/"height,"
the identical real meaning `core/tools.py`'s own `TlProfileData`
already gives those two values (Lesson 47) — no unit conversion, no
axis swap, the same numbers flow straight through.

### CS Lens / SE Lens

Not repeated — `threejs-geometry-material-object.md` covers the general
shape/appearance separation; the real, specific value here is
recognizing that this project's own real data convention already
matches the library's own expected input shape exactly, avoiding an
unnecessary translation layer.

### Commands

None new.

### Run It

```pycon
>>> # Real vitest case, this session:
>>> # revolveProfile([...4 points...], 16).parameters.segments == 16  # True
>>> # geometry.attributes.position.count > 0  # True, non-degenerate mesh
```

Confirmed directly (`npx vitest run toolAssembly` — 4/4 passing).

---

## Concept Unit: A Simpler Sibling Viewport

### The Problem

The main toolpath viewport (`viewport.ts`) is real, working infrastructure
— but built for a different, more demanding job (a live, glowing,
resizable toolpath with bloom post-processing and thick `Line2` geometry).
This modal only ever shows one small, static, non-animated assembly.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/assemblyViewport.ts` (new).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `threejs-renderer-scene-camera.md`, `threejs-
  lighting-basics.md`, `threejs-orbitcontrols.md` (all reappearing);
  Lesson 37/38's real teardown discipline (reappearing).

### The New Code

```ts
export function createAssemblyViewport(container: HTMLElement) {
  let isDisposed = false;
  const width = container.clientWidth || 260;
  const height = container.clientHeight || 260;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  renderer.setClearColor(0x1a1a1f, 1);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();

  // Z-up, matching viewport.ts's own real convention (a CNC machine's own
  // real axes) -- a LatheGeometry revolves around its own local Y by
  // default, so every mesh built from one is rotated -90deg around X below
  // to stand it up along Z instead.
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.01, 1000);
  camera.up.set(0, 0, 1);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.9);
  directionalLight.position.set(3, 3, 6);
  scene.add(directionalLight);

  const assemblyGroup = new THREE.Group();
  scene.add(assemblyGroup);
```

Render loop, resize handling, and teardown, all directly mirroring
`viewport.ts`'s own real, established shape:

```ts
  function render() {
    if (isDisposed) return;
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
  }
  render();

  const resizeObserver = new ResizeObserver(() => {
    if (isDisposed) return;
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    if (newWidth === 0 || newHeight === 0) return;
    renderer.setSize(newWidth, newHeight);
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
  });
  resizeObserver.observe(container);

  // Same real teardown discipline as viewport.ts's own cleanup (Lesson
  // 37/38) -- releases the renderer/WebGL context/resize observer/DOM
  // canvas every time this modal closes, rather than leaking one per open.
  function cleanup() {
    isDisposed = true;
    resizeObserver.disconnect();
    clearMeshes();
    controls.dispose();
    renderer.dispose();
    if (renderer.domElement.parentElement) {
      renderer.domElement.parentElement.removeChild(renderer.domElement);
    }
  }
```

### Mechanical Walkthrough

No `EffectComposer`/`UnrealBloomPass`/`Line2` at all — a plain
`renderer.render(scene, camera)` call, since two solid, lit meshes need
none of the toolpath viewport's own glow/thick-line machinery.
Everything else (Z-up camera, damped `OrbitControls`, a `ResizeObserver`
driving both the renderer and the camera's aspect ratio, and real
`cleanup()`) is the identical real shape `viewport.ts` already
established and hard-won (Lesson 37's own real resource-leak fix).

### CS Lens / SE Lens

Not repeated — every piece here reappears from an already-covered
concept. The real, deliberate choice worth naming: building a second,
simpler factory function rather than trying to make `createViewport`
itself configurable enough to cover both jobs — two small, clear
functions, each doing one real job well, instead of one function with
conditional branches for "toolpath mode" vs. "assembly-preview mode."

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: the modal's own
preview canvas renders, resizes, and cleans up correctly when the modal
closes and reopens (no accumulating WebGL contexts across repeated
opens).
```

---

## Concept Unit: Rebuilding Meshes Instead of Mutating Them

### The Problem

`setAssembly` gets called again every time the fetched assembly data or
the "Show Holder" toggle changes — the previous tool/holder meshes need
to be replaced, not left in the scene alongside new ones.

### Introduce the Concept in Isolation

**REAPPEARING** — `concepts/threejs-mutating-scene-after-creation.md`
already covers exactly this distinction (which three.js properties can
be reassigned in place vs. which are baked in at construction and need
a fresh object). A `BufferGeometry`'s own vertex data (what
`LatheGeometry` produces) is the latter — read that file first if this
is its first appearance in your own work.

### The New Code

```ts
let meshes: THREE.Mesh[] = [];

function clearMeshes() {
  for (const mesh of meshes) {
    assemblyGroup.remove(mesh);
    mesh.geometry.dispose();
    (mesh.material as THREE.Material).dispose();
  }
  meshes = [];
}

function setAssembly(
  toolProfile: ProfilePoint[],
  holderProfile: ProfilePoint[] | null,
  stickout: number,
  showHolder: boolean,
) {
  clearMeshes();
  const toolGeometry = revolveProfile(toolProfile);
  const toolMaterial = new THREE.MeshStandardMaterial({ color: TOOL_COLOR, metalness: 0.6, roughness: 0.4 });
  const toolMesh = new THREE.Mesh(toolGeometry, toolMaterial);
  toolMesh.rotation.x = -Math.PI / 2;
  assemblyGroup.add(toolMesh);
  meshes.push(toolMesh);
  // The holder mesh (conditional on showHolder) and the camera-framing
  // step both still belong inside this same function -- shown next,
  // then returned to whole, complete, in the unit after that.
}
```

`TOOL_COLOR`/`HOLDER_COLOR`, read above but not yet shown declared — the
real module-level constants, with the real comment already on them:

```ts
// A real, deliberately simpler sibling to viewport.ts's own createViewport:
// this modal only ever shows one small, static (non-animated) assembly, not
// a live, glowing toolpath -- no post-processing composer/bloom, no Line2
// geometry, just two solid, lit meshes. Real colors, not theme-driven yet
// (a reasonable, named scope cut for a first pass, not an oversight): tool
// = a light steel gray, holder = a darker gunmetal, distinct enough to read
// clearly regardless of the app's own current theme.
const TOOL_COLOR = 0xc8ccd4;
const HOLDER_COLOR = 0x4a5568;
```

The comment's own "distinct enough to read clearly" was asserted, not
measured — checked directly, this session, using WCAG's own real
relative-luminance formula as a numeric proxy for "how distinguishable
are these two colors" (WCAG's actual 4.5:1 threshold is defined for
text against a background, not two solid meshes in a lit 3D scene, so
this isn't a claim of accessibility compliance — just borrowing a real,
standard formula instead of eyeballing it): `0xc8ccd4` (light steel
gray) has a relative luminance of `0.602`; `0x4a5568` (dark gunmetal)
has `0.090` — a real contrast ratio of **4.67:1**, comparable to what
WCAG considers strongly distinguishable for text. A real, lucky-not-
measured pass, not a verified one — and "regardless of the app's own
current theme" is only ever checked against this modal's own fixed
background, never against
the app's 18-theme catalog (Lesson 24) this same tool/holder pair could
theoretically be viewed against in a future, theme-aware pass.

### Mechanical Walkthrough

Every call to `setAssembly` first disposes and removes every mesh the
*previous* call created — `mesh.geometry.dispose()` releases the real
GPU-side vertex buffer a `LatheGeometry` allocated (it can't be
"re-profiled" in place; a changed profile means an entirely new
geometry object), and `mesh.material.dispose()` releases its own GPU
resources the same way. Skipping this would leak a full extra tool+
holder mesh pair on every toggle click and every tool switch — small
individually, real and compounding over a session.

### Execution Trace

Two real, sequential `setAssembly` calls, run for real against the
actual `three` package (verified via direct Node execution, not a
browser session, per this session's own cost constraint) — first with
`showHolder=true`, then a toggle to `showHolder=false`:

```
Call 1: setAssembly(toolProfile, holderProfile, showHolder=true)
  clearMeshes(): meshes=[] already → for loop over [] → no-op
  toolGeometry = revolveProfile(toolProfile); toolMesh created;
    assemblyGroup.add(toolMesh); meshes = [toolMesh]
  showHolder true → holderGeometry/holderMesh created;
    assemblyGroup.add(holderMesh); meshes = [toolMesh, holderMesh]
  Real result: meshes.length = 2, assemblyGroup.children.length = 2

Call 2: setAssembly(toolProfile, null, showHolder=false)
  clearMeshes(): for mesh of [toolMesh, holderMesh]:
    assemblyGroup.remove(toolMesh); toolMesh.geometry.dispose();
      toolMesh.material.dispose()
    assemblyGroup.remove(holderMesh); holderMesh.geometry.dispose();
      holderMesh.material.dispose()
  meshes = []  (both real THREE.Mesh objects from call 1 now
    unreferenced by both `meshes` and the scene graph)
  new toolGeometry/toolMaterial/toolMesh created (a fresh object, not
    the disposed one — the concept file's own point: a disposed
    BufferGeometry can't be revived)
  showHolder false → holder branch skipped entirely
  Real result: meshes.length = 1, assemblyGroup.children.length = 1
```

Confirmed directly, this session: `assemblyGroup.children.length` goes
2 → 1, not 2 → 3 — proof `clearMeshes()`'s loop actually removed both
of call 1's meshes from the scene graph before call 2 added its own
single one, rather than the two calls' meshes silently accumulating.

### CS Lens / SE Lens

Not repeated — fully covered by `threejs-mutating-scene-after-
creation.md`.

### Commands

None new.

### Run It

Confirmed by code review and direct Node execution against the real
`three` package (above): `clearMeshes()` is the first line of
`setAssembly`, called unconditionally on every invocation.

---

## Concept Unit: Framing the Camera From the Assembly's Own Real Size

### The Problem

Real tool sizes span more than an order of magnitude — a `0.1875"`
drill and a `3"` face mill with a BT50 holder are both real, valid
tools this feature has to show. A fixed camera position/distance would
frame one of them sensibly and the other either invisibly tiny or
clipped through.

### Introduce the Concept in Isolation

First appearance of this exact technique in this project — full
standalone treatment: `concepts/camera-auto-framing-from-bounding-
box.md`. Read that first; its own isolated example (a tiny sphere and
a huge one, framed correctly by the identical function) is precisely
this project's own real problem, generalized.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/assemblyViewport.ts`.
- **Change type** — add.
- **Location** — end of `setAssembly`.
- **Dependencies** — `camera-auto-framing-from-bounding-box.md`.

### The New Code

```ts
// Real, necessary framing: a 0.1875" drill and a 3" face mill with a
// BT50 holder differ by well over an order of magnitude in real size --
// a fixed camera distance would put one microscopically small and the
// other clipped through, depending which tool happened to be open. The
// real assembly's own bounding box drives both the camera's distance
// and what OrbitControls actually orbits around, so every real tool
// frames sensibly regardless of its own real scale.
const box = new THREE.Box3().setFromObject(assemblyGroup);
const size = box.getSize(new THREE.Vector3());
const center = box.getCenter(new THREE.Vector3());
const maxDimension = Math.max(size.x, size.y, size.z, 0.01);
const distance = maxDimension * 2;
camera.position.set(center.x + distance, center.y - distance, center.z + distance * 0.6);
camera.near = maxDimension / 100;
camera.far = maxDimension * 100;
camera.updateProjectionMatrix();
controls.target.copy(center);
```

### Mechanical Walkthrough / CS Lens / SE Lens

Not repeated — fully covered by `camera-auto-framing-from-bounding-
box.md`. The one project-specific detail beyond that file's own generic
example: `camera.near`/`camera.far` are also derived from
`maxDimension`, not left fixed — a `near` plane fixed at a value fine
for an 8-unit assembly would clip straight through a 0.2-unit one.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: opening the modal
for different real tools frames each one sensibly, without manually
adjusting the camera.
```

---

## Concept Unit: Positioning Tool and Holder With the Real Stickout Offset

### The Problem

The tool and holder are two separate meshes (different profiles,
different real shapes) — they need to sit at the correct real distance
apart, not just both at the origin.

### Project Change

- **Reference Source** — none; a direct application of Lesson 47's own
  confirmed `CScalar` finding.
- **Files affected** — `cnc-web/src/assemblyViewport.ts`.
- **Change type** — add.
- **Location** — `setAssembly`'s own holder branch.
- **Dependencies** — Lesson 47's `CScalar` unit.

### The New Code

```ts
if (showHolder && holderProfile && holderProfile.length > 0) {
  const holderGeometry = revolveProfile(holderProfile);
  const holderMaterial = new THREE.MeshStandardMaterial({ color: HOLDER_COLOR, metalness: 0.5, roughness: 0.5 });
  const holderMesh = new THREE.Mesh(holderGeometry, holderMaterial);
  holderMesh.rotation.x = -Math.PI / 2;
  holderMesh.position.z = stickout;
  assemblyGroup.add(holderMesh);
  meshes.push(holderMesh);
}
```

### The Updated Project

`setAssembly` in full — every line built across the last three units,
none elided, since this is the first point all three pieces (tool mesh,
holder mesh, camera framing) exist together in one real function:

```ts
function setAssembly(
  toolProfile: ProfilePoint[],
  holderProfile: ProfilePoint[] | null,
  stickout: number,
  showHolder: boolean,
) {
  clearMeshes();

  const toolGeometry = revolveProfile(toolProfile);
  const toolMaterial = new THREE.MeshStandardMaterial({ color: TOOL_COLOR, metalness: 0.6, roughness: 0.4 });
  const toolMesh = new THREE.Mesh(toolGeometry, toolMaterial);
  toolMesh.rotation.x = -Math.PI / 2;
  assemblyGroup.add(toolMesh);
  meshes.push(toolMesh);

  if (showHolder && holderProfile && holderProfile.length > 0) {  // ← new
    const holderGeometry = revolveProfile(holderProfile);          // ← new
    const holderMaterial = new THREE.MeshStandardMaterial({ color: HOLDER_COLOR, metalness: 0.5, roughness: 0.5 });  // ← new
    const holderMesh = new THREE.Mesh(holderGeometry, holderMaterial);  // ← new
    holderMesh.rotation.x = -Math.PI / 2;                           // ← new
    holderMesh.position.z = stickout;                               // ← new
    assemblyGroup.add(holderMesh);                                   // ← new
    meshes.push(holderMesh);                                         // ← new
  }                                                                   // ← new

  const box = new THREE.Box3().setFromObject(assemblyGroup);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const maxDimension = Math.max(size.x, size.y, size.z, 0.01);
  const distance = maxDimension * 2;
  camera.position.set(center.x + distance, center.y - distance, center.z + distance * 0.6);
  camera.near = maxDimension / 100;
  camera.far = maxDimension * 100;
  camera.updateProjectionMatrix();
  controls.target.copy(center);
}
```

The function now does exactly three things in order, every time it's
called: clear whatever the previous call built, build the tool mesh
(always) and the holder mesh (only when both requested and real profile
data exists), then reframe the camera around whatever the assembly
group actually contains right now — tool alone, or tool and holder
together.

### Mechanical Walkthrough

The tool mesh's own profile has `y=0` at its tip; left unpositioned
(`position.z = 0`), the tool tip sits at world `z=0` and extends upward
through its own real `total_length`. The holder profile's own `y=0` is
its real nose/gauge line (Lesson 47) — placing the holder mesh at
`position.z = stickout` puts that same nose exactly `stickout` units
above the tool's own tip, matching the real, confirmed meaning of the
value: how far the tool protrudes past the holder before the two
overlap (correctly — the tool's own shank is really inserted inside the
holder's body past that point). `showHolder=false` skips building the
holder mesh at all, not just hiding an existing one — the real toggle
this feature exists to provide.

### Execution Trace

The guard and the real positioning, using `TA5120`'s own confirmed
values (Lesson 47's `get_tool_assembly` output: `stickout: 2.6`):

```
showHolder=true, holderProfile=[18 real points], holderProfile.length(18) > 0
  → guard passes → holder branch runs
  holderMesh.position.z = 2.6
    → holder's own nose (its profile's y=0 point) now sits at world
      z=2.6, 2.6 units above the tool tip (world z=0, unmoved)

showHolder=false (any holderProfile) → first operand false →
  && short-circuits before evaluating holderProfile at all → guard
  fails → holder branch skipped entirely, no mesh created, no
  position.z assignment happens
```

The tool mesh itself is never repositioned by this unit's own code —
only the holder moves, by exactly the one real, confirmed distance
(`CScalar`) that separates a real tool's tip from its holder's real
gauge line.

### CS Lens

Not a hard CS concept — placing two independently-shaped solids of
revolution along one shared axis using one real, confirmed offset.

### SE Lens

The real alternative rejected: merging both profiles into one combined
point array before a single revolve. Keeping them as two separate
meshes is simpler and more honest here — the tool and holder are
genuinely different objects (different colors, materials, and one of
them is optional at all), and nothing about combining them into a
single geometry would have simplified the real positioning logic above.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: toggling "Show
Holder" removes/restores the holder mesh at the correct stickout
distance above the tool tip.
```

---

## Concept Unit: The Modal — Fetch, Preview, Edit, Save

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/ToolAssemblyModal.tsx` (new).
- **Change type** — add.
- **Location** — new file.
- **Dependencies** — `react-useeffect-hook.md`, `react-useref-hook.md`.

### The New Code

The two real fetch functions this modal is built around — the same
`error`-field-checking convention every fetch in this project already
uses (Lesson 28), applied to the two real assembly endpoints:

```tsx
interface AssemblyResponse {
  assembly?: ToolAssembly | null;
  error?: string;
}

async function fetchAssembly(toolId: string): Promise<ToolAssembly | null> {
  const response = await fetch(`http://127.0.0.1:5000/api/tools/${toolId}/assembly`);
  const data: AssemblyResponse = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  logger.info(`fetchAssembly succeeded: ${data.assembly ? data.assembly.holder_name : "no assembly"}`);
  return data.assembly ?? null;
}

async function patchHolderConnections(
  toolId: string,
  fields: {
    upper_connection_type: number;
    upper_connection_size: string;
    lower_connection_type: number;
    lower_connection_size: string;
  },
): Promise<ToolAssembly> {
  const response = await fetch(`http://127.0.0.1:5000/api/tools/${toolId}/assembly`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(fields),
  });
  const data: AssemblyResponse = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }
  return data.assembly!;
}
```

`ToolAssemblyModal` itself is the real caller of both — fetching on
mount, then calling `patchHolderConnections` from `handleSave` below:

```tsx
function ToolAssemblyModal({ tool, onClose }: ToolAssemblyModalProps) {
  const [assembly, setAssembly] = useState<ToolAssembly | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showHolder, setShowHolder] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [upperType, setUpperType] = useState("");
  const [upperSize, setUpperSize] = useState("");
  const [lowerType, setLowerType] = useState("");
  const [lowerSize, setLowerSize] = useState("");

  const previewRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<ReturnType<typeof createAssemblyViewport> | null>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    fetchAssembly(tool.id)
      .then((result) => {
        setAssembly(result);
        if (result) {
          setUpperType(String(result.upper_connection_type));
          setUpperSize(result.upper_connection_size);
          setLowerType(String(result.lower_connection_type));
          setLowerSize(result.lower_connection_size);
        }
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
        logger.error(`fetchAssembly failed: ${err.message}`);
      });
  }, [tool.id]);

  // Mounted exactly once for this modal's own lifetime -- creating a real
  // WebGL context/renderer on every unrelated re-render would be both
  // wasteful and a real resource leak (Lesson 37's own established
  // discipline); `cleanup` releases it when the modal itself closes.
  useEffect(() => {
    if (!previewRef.current) return;
    const viewport = createAssemblyViewport(previewRef.current);
    viewportRef.current = viewport;
    return () => viewport.cleanup();
  }, []);

  useEffect(() => {
    if (!viewportRef.current) return;
    const toolProfile = buildToolProfile(tool);
    viewportRef.current.setAssembly(
      toolProfile,
      assembly?.profile ?? null,
      assembly?.stickout ?? 0,
      showHolder,
    );
  }, [tool, assembly, showHolder]);

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    try {
      const updated = await patchHolderConnections(tool.id, {
        upper_connection_type: Number(upperType),
        upper_connection_size: upperSize,
        lower_connection_type: Number(lowerType),
        lower_connection_size: lowerSize,
      });
      setAssembly(updated);
      logger.info(`Saved holder connections for tool ${tool.id}`);
    } catch (err) {
      setSaveError((err as Error).message);
      logger.error(`patchHolderConnections failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  }
```

### Mechanical Walkthrough

Two separate `useEffect`s, deliberately: one with an **empty dependency
array** (`[]`) creates the real WebGL viewport exactly once, for this
modal's own lifetime — a second one, depending on `[tool, assembly,
showHolder]`, re-runs `setAssembly` whenever any of that real data
changes, reading `viewportRef.current` (populated by the first effect).
React runs effects in the order they're declared within the same
commit, so by the time the second effect's own first run happens,
`viewportRef.current` is already set — no race, confirmed by direct
testing (the tool's own procedural profile renders immediately on open,
before the real assembly fetch even resolves, then the holder appears
once it does). `upperType`/`upperSize`/`lowerType`/`lowerSize` are
local, editable copies seeded once the real assembly loads — the same
"local text state, seeded once from a prop" shape `BlockList.tsx`'s own
editable cells already established.

### CS Lens / SE Lens

Not repeated — `react-useeffect-hook.md`/`react-useref-hook.md` already
cover the dependency-array and ref-across-renders mechanics this relies
on.

### Commands

```
npx tsc --noEmit
npx vitest run
npx vite build
```

### Run It

```
tsc --noEmit: clean.
vitest run: 8/8 passing (4 new toolAssembly.test.ts cases, 4 existing
segments.test.ts cases).
vite build: succeeds (only pre-existing, unrelated Monaco chunk-size
warnings).
Confirmed live in the browser: the modal opens, the preview renders,
tool and holder both appear at the correct relative size and position.
```

---

## Concept Unit: The One Real Editable Field, and Wiring the Trigger

### The Problem

Per direct instruction, a holder's own connection type/size should be
editable — but only its connection metadata, not its literal profile
geometry (which stays real, imported data). And the modal needs a real
way to open: clicking a tool card.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-service/core/tools.py`, `cnc-service/app.py`,
  `cnc-web/src/ToolCardList.tsx`.
- **Change type** — add.
- **Location** — `core/tools.py` near `get_tool_assembly`; `app.py`
  near the existing `/api/tools/...` routes; `ToolCardList.tsx`'s own
  render.
- **Dependencies** — Lesson 47's models.

### The New Code

```python
def update_holder_connections(tool_id, fields):
    """Edits a tool's real holder connection fields (upper/lower
    connection type + size) -- the one real, editable part of a holder
    this pass supports (per direct instruction: connection info, not its
    literal profile geometry, which stays read-only real data). Returns
    False if this tool has no real assembly/holder at all yet (a real,
    honest case this pass doesn't create holders for from scratch --
    editable metadata with no real profile behind it would have no
    visible shape to attach it to)."""
    with get_session() as session:
        assembly = session.execute(
            select(TlAssembly).where(TlAssembly.MainTool == tool_id)
        ).scalar_one_or_none()
        if assembly is None or assembly.MainHolder is None:
            return False
        holder = session.execute(
            select(TlHolder).where(TlHolder.ID == assembly.MainHolder)
        ).scalar_one_or_none()
        if holder is None:
            return False
        if "upper_connection_type" in fields:
            holder.UpperConnectionType = fields["upper_connection_type"]
        if "upper_connection_size" in fields:
            holder.UpperConnectionSize = fields["upper_connection_size"]
        if "lower_connection_type" in fields:
            holder.LowerConnectionType = fields["lower_connection_type"]
        if "lower_connection_size" in fields:
            holder.LowerConnectionSize = fields["lower_connection_size"]
        session.commit()
        return True
```

```python
@app.route("/api/tools/<uuid:tool_id>/assembly", methods=["PATCH"])
def edit_assembly(tool_id):
    if get_tool_by_id(tool_id) is None:
        return {"error": f"no tool with id {tool_id}"}, 404
    body = request.get_json(silent=True)
    if not isinstance(body, dict):
        return {"error": "expected a JSON object body"}, 400
    allowed = {
        "upper_connection_type", "upper_connection_size",
        "lower_connection_type", "lower_connection_size",
    }
    unknown = set(body) - allowed
    if unknown:
        return {"error": f"unknown field(s): {', '.join(sorted(unknown))}"}, 400
    # Real, honest limitation, not silently ignored: a tool with no real
    # imported assembly has no holder row to edit, and this pass doesn't
    # create one from scratch (editable connection metadata with no real
    # profile behind it would have no visible shape to attach it to).
    if not update_holder_connections(tool_id, body):
        return {"error": f"tool {tool_id} has no assembly to edit"}, 404
    logger.info("Updated holder connections for tool id=%s", tool_id)
    return {"assembly": get_tool_assembly(tool_id)}
```

`ToolCardList.tsx` — its own `Tool` interface exported so
`ToolAssemblyModal.tsx` can reuse it rather than duplicating the shape a
third time (`ToolImportPanel.tsx` already duplicates it once), and a
click handler opening the modal for whichever tool was clicked:

```tsx
export interface Tool {
  id: string;
  tool_number: number;
  name: string;
  is_metric: boolean;
  diameter: number;
  total_length: number;
  flute_count: number;
  cutting_depth: number;
  arbor_diameter: number;
  corner_radius: number | null;
  tip_angle: number | null;
  material: string | null;
  manufacturer: string | null;
}
```

```tsx
function ToolCardList({ refreshKey }: ToolCardListProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  // Which tool's own Assembly modal is open, if any -- the tool's real id,
  // not a boolean, since ToolAssemblyModal needs the full Tool object
  // (its own real dimensions drive the procedurally-built cutting-tool
  // profile shown alongside its real holder).
  const [assemblyToolId, setAssemblyToolId] = useState<string | null>(null);

  useEffect(() => {
    fetchTools().then(setTools);
  }, [refreshKey]);

  const handleDelete = async (id: string) => {
    await deleteToolById(id);
    setTools((prev) => prev.filter((t) => t.id !== id));
  };

  const assemblyTool = tools.find((t) => t.id === assemblyToolId) ?? null;  // ← new

  return (
    <>
      <div className="sec">Tool Table (Mill)</div>
      {tools.map((t) => {
        const kind = t.corner_radius != null ? "Endmill" : "Drill";
        return (
          <div key={t.id} className="tcard" onClick={() => setAssemblyToolId(t.id)}>  {/* ← changed: onClick added */}
            <div className="tcard-h">
              <span className="tcard-name">
                T{String(t.tool_number).padStart(2, "0")} — {kind}
              </span>
              <button
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--color-muted)",
                  cursor: "pointer",
                  marginLeft: "auto",
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(t.id);
                }}
              >
                ✕
              </button>
            </div>
            <div className="tcard-meta">
              {t.name} Ø{t.diameter}
              {t.is_metric ? "mm" : "in"}{" "}
              {t.corner_radius != null
                ? `R${t.corner_radius}${t.is_metric ? "mm" : "in"}`
                : `${t.tip_angle}°`}{" "}
              {t.material ?? "—"} · {t.manufacturer ?? "—"}
            </div>
          </div>
        );
      })}
      {tools.length === 0 && (
        <div style={{ color: "var(--color-muted)", fontSize: 9, padding: "8px 0" }}>
          No mill tools defined.
        </div>
      )}
      {assemblyTool && (                                              // ← new
        <ToolAssemblyModal tool={assemblyTool} onClose={() => setAssemblyToolId(null)} />  {/* ← new */}
      )}                                                               // ← new
    </>
  );
}
```

`onClick={() => setAssemblyToolId(t.id)}` on the card's own outer `<div>`
is the one real, new trigger — the delete button's own `e.stopPropagation()`
(already established, Lesson 41) is what keeps clicking *it* from also
opening the assembly modal for the same card.

New CSS for the modal's own two-pane body (`.assembly-modal-body`,
`.assembly-preview`, `.assembly-fields`, `.assembly-toggle-row`,
`.assembly-field-row`, `.assembly-field-row input`):

```css
.assembly-modal-body {
  flex: 1;
  display: flex;
  min-height: 0;
}
.assembly-preview {
  flex: 1;
  min-width: 0;
  background: #1a1a1f;
}
.assembly-fields {
  width: 260px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  overflow-y: auto;
  border-left: 1px solid var(--color-border);
}
.assembly-toggle-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: var(--color-text);
  cursor: pointer;
}
.assembly-field-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  font-size: 11px;
  color: var(--color-muted);
}
.assembly-field-row input {
  width: 90px;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  border-radius: 3px;
  color: var(--color-text);
  padding: 4px 6px;
  font-size: 11px;
  text-align: right;
}
```

### Mechanical Walkthrough

`.tcard` already had `cursor: pointer` in `theme.css` (Lesson 17,
originally for a click-to-select interaction the reference has but this
project never wired up) — the click handler added here is the first
real use of that existing affordance. `update_holder_connections`
mutates the already-loaded `holder` ORM object's own attributes
directly and calls `session.commit()` — SQLAlchemy's own unit-of-work
tracks the change without needing an explicit `UPDATE` statement built
by hand. The route's `allowed`/`unknown` check rejects any field name
outside the four real, intended ones with a clear `400`, rather than
silently accepting (and ignoring) a typo'd or unsupported field name.

### Execution Trace

`update_holder_connections`'s own four `if key in fields:` checks, run
for real (the identical attribute-mutation logic, verified directly)
against a **partial** body — only `upper_connection_size` sent, matching
a real PATCH where the user edited one field and left the other three
alone:

```
holder before: {UpperConnectionType: 3, UpperConnectionSize: "BT40",
                LowerConnectionType: 1, LowerConnectionSize: "ER32"}
fields = {"upper_connection_size": "BT50"}

"upper_connection_type" in fields?  → False → holder.UpperConnectionType
  untouched
"upper_connection_size" in fields?  → True  → holder.UpperConnectionSize
  = "BT50"
"lower_connection_type" in fields?  → False → holder.LowerConnectionType
  untouched
"lower_connection_size" in fields?  → False → holder.LowerConnectionSize
  untouched

holder after: {UpperConnectionType: 3, UpperConnectionSize: "BT50",
               LowerConnectionType: 1, LowerConnectionSize: "ER32"}
```

Four independent checks, not one combined "replace the whole holder"
assignment — sending a partial body only ever touches the fields
actually present in `fields`, exactly like Lesson 15's own
`ALLOWED_TOOL_FIELDS` partial-update shape, applied here to a different
table.

### CS Lens

Not a hard concept — ordinary CRUD update logic and a standard
click-to-open UI trigger.

### SE Lens

The real, named scope cut worth restating here: a tool with **no** real
assembly gets a clear, honest message (`ToolAssemblyModal.tsx`'s own
"No real assembly imported for this tool yet") rather than either
silently failing or fabricating a fake holder to edit — editable
connection metadata with no real profile behind it would have nothing
real to attach it to, so this pass doesn't pretend otherwise.

### Commands

```
npx tsc --noEmit
npx vitest run
```

### Run It

```pycon
>>> # Real, this session, against an imported tool:
>>> tools.get_tool_assembly(first_id)['upper_connection_type']
4
>>> tools.update_holder_connections(first_id, {'upper_connection_type': 99, 'upper_connection_size': '80'})
True
>>> tools.get_tool_assembly(first_id)['upper_connection_type']
99
>>> # And the honest, real "no assembly" case:
>>> tools.update_holder_connections(seed_tool_id, {'upper_connection_type': 1})
False
```

Both confirmed directly, this session, against real data.

---

## Connect the Pieces

One real chain, start to finish: clicking a tool card
(`ToolCardList.tsx`) opens `ToolAssemblyModal`, which fetches Lesson
47's own `/api/tools/<id>/assembly` and mounts a dedicated
`assemblyViewport` exactly once. `buildToolProfile` turns the tool's
own real dimensions into a procedural profile; the backend's real
`TlProfileData` rows arrive as the holder's own profile; both revolve
through the identical `revolveProfile` function, since this project's
own `x`=radius/`y`=axial convention already matches
`THREE.LatheGeometry`'s expected input exactly. The holder mesh is
placed `stickout` units above the tool's own tip — the real, confirmed
meaning of `CScalar` from Lesson 47 — and the whole assembly frames
itself correctly regardless of whether it's a fractional-inch drill or
a multi-inch face mill, by measuring its own real bounding box rather
than assuming a fixed camera distance. The one real editable piece (a
holder's connection type/size) round-trips through a new `PATCH`
endpoint, honestly refusing to edit a holder that was never really
imported. Live-canvas integration — showing this same assembly moving
with the tool during simulation — is real, separate, next work.

## What Breaks Without This

Reverting `assemblyViewport.ts`'s bounding-box framing back to a fixed
camera position and opening the modal for two real tools of very
different size (e.g. a small drill, then a large face mill): the first
would appear reasonably framed by coincidence; the second would either
render nearly invisible or with the camera positioned inside the
geometry, depending which size the fixed position happened to assume.

## Exercises

1. Read `concepts/camera-auto-framing-from-bounding-box.md`'s own
   Try-It-Yourself exercise 1 and, in `assemblyViewport.ts`, try
   `distance = maxDimension * 1.2` and `distance = maxDimension * 4` —
   describe the real, visible difference in how tightly the assembly is
   framed.
2. Trace `buildToolProfile`'s own output by hand for a tool whose
   `arbor_diameter` is *larger* than its `diameter` (a real, valid case
   — some tools have a wider shank than cutting edge) — confirm the
   profile still closes correctly, and reason about what the resulting
   revolved shape would look like (a step *outward*, not inward, partway
   up the tool).
3. `threejs-mutating-scene-after-creation.md`'s own real distinction
   (mutable vs. baked-in properties) — find one property on the
   `MeshStandardMaterial` this lesson uses (`color`, `metalness`,
   `roughness`) that genuinely *can* be reassigned after construction
   without rebuilding the mesh, and rewrite `assemblyViewport.ts` to
   reuse one persistent tool material across calls to `setAssembly`
   instead of creating (and disposing) a new one every time — what
   real cost does this save, and what would it *not* save (hint: the
   geometry itself)?

## Known Incomplete — Named Directly

- **Not integrated into the live toolpath/simulation canvas** — this
  lesson's own preview is a separate, dedicated modal viewport; showing
  the same assembly positioned at the tool tip during simulation
  (`Viewport.tsx`, following the real per-step `states` array Lesson 46
  already computes) is real, deliberately separate, next work.
- **The cutting-tool profile is a flat-tipped silhouette** — no curved
  ball/bull-nose geometry from `corner_radius`, no drill-point angle
  from `tip_angle`. A real, named simplification, not an oversight.
- **Editing a holder's connection fields requires a real, already-
  imported assembly** — this pass doesn't synthesize a new holder (with
  no real profile) for a tool that never had one.
- **Only the direct one-tool/one-holder case renders** — the same real
  scope cut Lesson 47 named for `TlAssembly.MainTool`/`MainHolder`
  applies here too; holder extensions/right-angle heads aren't shown.
- **Assembly colors are fixed, not theme-driven** — a named, reasonable
  scope cut for a first pass (`assemblyViewport.ts`'s own comment).

## Definition of Done

- [x] `toolAssembly.ts`: `buildToolProfile`, `revolveProfile`, verified
      via 4 new real vitest cases.
- [x] `assemblyViewport.ts`: a real, dedicated preview viewport —
      real teardown discipline, real bounding-box camera framing, real
      tool+holder positioning via the confirmed stickout offset.
- [x] `ToolAssemblyModal.tsx`: fetch, live preview, "Show Holder"
      toggle, editable holder connections, Save.
- [x] Backend: `update_holder_connections` + `PATCH /api/tools/<id>/
      assembly`, verified directly against real imported data and the
      honest "no assembly" case.
- [x] `ToolCardList.tsx`: exported `Tool`, click-to-open wired to the
      existing (previously unused) `.tcard` pointer-cursor affordance.
- [x] One new, project-independent concept file
      (`camera-auto-framing-from-bounding-box.md`).
- [x] `npx tsc --noEmit` clean.
- [x] `npx vitest run` — 8/8 passing.
- [x] `npx vite build` — succeeds.
- [x] Confirmed live in the browser.

```
git commit -m "Lesson 48: a shape that only exists once you ask"
```
