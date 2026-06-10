# CAD/CAM — Lesson 06 — Sketch Mode

## What You Will Build

Clicking the XY coordinate plane indicator in the toolbar activates **Sketch Mode**.
The camera locks to a top-down orthographic view looking at the XY plane. A finer
2D grid appears. The orbit controls are disabled. Three drawing tool buttons appear
in the tool panel: Line, Circle, Arc. Clicking an empty area of the viewport draws
a dot at the clicked position (the preview for lesson 07's line tool). Pressing
Escape returns to 3D mode and re-enables orbit. The mode is displayed in the status bar.

## What You Need to Know First

Lessons 01–05. The application shell, Three.js viewport, and selection system exist.
This lesson adds an application mode — a switch between two fundamentally different
ways the viewport behaves.

---

## The Problem

A CAD application has at least two modes:
- **3D navigation**: orbit, pan, zoom, select objects
- **Sketch mode**: locked camera, draw 2D geometry on a plane

These modes are not independent features layered on top of each other. They conflict:
in 3D mode, clicking the canvas triggers raycasting for selection; in sketch mode,
the same click draws a point. The same mouse event means two completely different
things depending on mode.

Managing this with `if (isSketchMode)` flags scattered through event handlers is the
bug-prone approach: you always wonder whether you found every flag. A **finite state
machine** (FSM) with named states is the correct model — the same pattern used in
the calculator's input handling (lesson 03 of the calculator project) and in real
CAD applications including SolidWorks and Fusion 360.

---

## Step 1 — Maths: Projecting 3D to 2D

When the camera looks down the Z axis at the XY plane, a 3D world point `(x, y, z)`
projects to 2D sketch coordinates `(x, y)` by simply discarding the Z component.
This is only correct when the camera's view direction is perpendicular to the sketch
plane — the orthographic top-down lock enforces this.

More generally, projecting a 3D point `P_world` onto a sketch plane defined by an
**origin** `O` and two **axis vectors** `U` (X direction in the plane) and `V`
(Y direction in the plane):

```
local_x = (P_world - O) · U
local_y = (P_world - O) · V
```

The dot product `(P_world - O) · U` measures how far `P_world` is from the plane
origin along the U direction — the local X coordinate in the sketch plane's frame.

For the XY plane with `O = (0,0,0)`, `U = (1,0,0)`, `V = (0,1,0)`:
```
local_x = P_world · (1,0,0) = P_world.x
local_y = P_world · (0,1,0) = P_world.y
```

The Z component is discarded. This is why top-down projection is just dropping Z.

Lesson 14 (sketch on a face) generalises this formula to arbitrary planes where
`U` and `V` are not aligned with the world axes.

---

## Step 2 — The Application Mode State Machine

### Create `src/state/appMode.ts`

Create directory `src/state/`:

```typescript
export const AppMode = {
  NAVIGATE_3D: 'NAVIGATE_3D',
  SKETCH_XY:   'SKETCH_XY',
  SKETCH_XZ:   'SKETCH_XZ',
  SKETCH_YZ:   'SKETCH_YZ',
} as const

export type AppMode = typeof AppMode[keyof typeof AppMode]
```

**What `src/state/` is:**
`state/` owns application-level state logic — types, transitions, and rules for
state that spans the whole application (not just one component). Mode transitions
are application-level: entering sketch mode affects the toolbar, tool panel, viewport,
and status bar simultaneously.

**`as const` recap:**
`as const` freezes the object — all values become literal types. `typeof AppMode[keyof typeof AppMode]` extracts `'NAVIGATE_3D' | 'SKETCH_XY' | 'SKETCH_XZ' | 'SKETCH_YZ'`. The type and the runtime values derive from the same source — they can never disagree.

```typescript
export interface ModeTransition {
  from: AppMode
  to:   AppMode
}

export function isValidTransition(transition: ModeTransition): boolean {
  const { from, to } = transition

  // From 3D, can enter any sketch mode
  if (from === AppMode.NAVIGATE_3D) return true

  // From any sketch mode, can return to 3D only
  if (to === AppMode.NAVIGATE_3D) return true

  // Sketch-to-sketch transitions are not allowed
  return false
}
```

**Why validate transitions?**
A valid FSM defines not just states but legal transitions between them. Sketch-to-sketch
transitions are excluded because switching directly from sketching on XY to sketching
on XZ without returning to 3D would leave the camera in an inconsistent orientation
and any in-progress sketch in an ambiguous state. The validator makes the rule
explicit and enforceable — callers that attempt an invalid transition are identified
at development time.

---

## Step 3 — Mode State in App

### Update `src/App.tsx`

```tsx
import { AppMode }    from './state/appMode.js'

const [appMode, setAppMode] = useState<AppMode>(AppMode.NAVIGATE_3D)

function handleModeChange(newMode: AppMode): void {
  setAppMode(newMode)
}
```

Pass mode to components:

```tsx
<Toolbar  appMode={appMode} onModeChange={handleModeChange} />
<ToolPanel appMode={appMode} />
<ViewportComponent
  box={box}
  selectedId={selectedId}
  onSelect={setSelectedId}
  onCursorMove={setCursorPosition}
  appMode={appMode}
/>
<StatusBar cursorPosition={cursorPosition} appMode={appMode} />
```

---

## Step 4 — The Camera Lock

### Create `src/viewport/sketchCamera.ts`

```typescript
import * as THREE from 'three'
import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { AppMode } from '../state/appMode.js'
```

**Import explanation:**
`import * as THREE from 'three'` — Three.js for `OrthographicCamera` (first
appearance here), `Vector3`, and constants.

`import type { OrbitControls } from 'three/addons/controls/OrbitControls.js'` —
`import type` because `OrbitControls` is only needed for its type here, not its
runtime value. The module path is the same as lesson 01.

`import { AppMode } from '../state/appMode.js'` — `state/appMode.ts` owns the mode
type (this lesson). We import `AppMode` to switch camera behaviour based on the
current mode.

```typescript
export function applyModeToCamera(
  mode:          AppMode,
  camera:        THREE.PerspectiveCamera,
  orbitControls: OrbitControls,
  canvasWidth:   number,
  canvasHeight:  number,
): void {
  if (mode === AppMode.NAVIGATE_3D) {
    orbitControls.enabled = true
    camera.position.set(10, 8, 10)
    camera.lookAt(0, 0, 0)
    camera.updateProjectionMatrix()
    return
  }

  orbitControls.enabled = false

  const viewWidth  = 20
  const viewHeight = viewWidth * (canvasHeight / canvasWidth)

  if (mode === AppMode.SKETCH_XY) {
    camera.position.set(0, 50, 0)
    camera.lookAt(0, 0, 0)
    camera.up.set(0, 0, -1)
  } else if (mode === AppMode.SKETCH_XZ) {
    camera.position.set(0, 0, 50)
    camera.lookAt(0, 0, 0)
    camera.up.set(0, 1, 0)
  } else if (mode === AppMode.SKETCH_YZ) {
    camera.position.set(50, 0, 0)
    camera.lookAt(0, 0, 0)
    camera.up.set(0, 1, 0)
  }

  camera.updateProjectionMatrix()
}
```

**Why `PerspectiveCamera` and not `OrthographicCamera`:**
A true 2D sketch view uses an **orthographic camera** — one where parallel lines
remain parallel and there is no perspective foreshortening. However, switching camera
types at runtime in Three.js requires replacing the camera object and reconnecting
`OrbitControls`, which is complex.

For the XY sketch, locking a `PerspectiveCamera` at a high Y position and pointing
it straight down produces a view that is nearly orthographic for the flat grid — the
perspective distortion at `Y=50, fov=45°` is imperceptible for typical sketch sizes.
Lesson 06 uses this simpler approach. A production CAD tool would use `OrthographicCamera`;
the switch point is when orthographic projection becomes perceptibly necessary.

**`camera.up.set(0, 0, -1)` for XY view:**
The camera's `up` vector determines which direction is "upward" in the rendered view.
When looking straight down at XY (`position: (0, 50, 0)`, `lookAt: (0, 0, 0)`),
the default `up = (0, 1, 0)` points toward the camera's position — the camera cannot
determine orientation. Setting `up = (0, 0, -1)` (the negative Z axis) points "up"
away from the viewer in the sketch, which maps the Z axis to screen-down, matching
CAD conventions where Y is the sketch up direction.

**`orbitControls.enabled = false`:**
Disabling `OrbitControls` prevents mouse drag from orbiting the camera in sketch mode.
The same mouse events are used for drawing. Enabling and disabling the same
`OrbitControls` object created in `initViewport` (lesson 02) is the correct approach —
the object is not recreated, just toggled.

### Add mode effect to `ViewportComponent`

```tsx
useEffect(() => {
  const viewport = viewportRef.current
  if (viewport === null) return

  applyModeToCamera(
    appMode,
    viewport.camera,
    viewport.orbitControls,
    container.clientWidth,
    container.clientHeight,
  )
}, [appMode])
```

---

## Step 5 — The Toolbar Mode Buttons

### Update `src/components/Toolbar.tsx`

```tsx
import { AppMode }  from '../state/appMode.js'
```

**`import { AppMode } from '../state/appMode.js'`:**
`state/appMode.ts` owns the mode type (this lesson). We import `AppMode` for the
prop type and button labels.

```tsx
interface ToolbarProps {
  appMode:      AppMode
  onModeChange: (mode: AppMode) => void
}

export function Toolbar({ appMode, onModeChange }: ToolbarProps): JSX.Element {
  return (
    <header className="toolbar">
      <span className="toolbar-title">CAM Project</span>

      <div className="toolbar-separator" />

      <button
        className={`toolbar-btn ${appMode === AppMode.NAVIGATE_3D ? 'active' : ''}`}
        onClick={() => onModeChange(AppMode.NAVIGATE_3D)}
        title="3D Navigation mode"
      >
        3D
      </button>
      <button
        className={`toolbar-btn ${appMode === AppMode.SKETCH_XY ? 'active' : ''}`}
        onClick={() => onModeChange(AppMode.SKETCH_XY)}
        title="Sketch on XY plane"
      >
        XY
      </button>
      <button
        className={`toolbar-btn ${appMode === AppMode.SKETCH_XZ ? 'active' : ''}`}
        onClick={() => onModeChange(AppMode.SKETCH_XZ)}
        title="Sketch on XZ plane"
      >
        XZ
      </button>
      <button
        className={`toolbar-btn ${appMode === AppMode.SKETCH_YZ ? 'active' : ''}`}
        onClick={() => onModeChange(AppMode.SKETCH_YZ)}
        title="Sketch on YZ plane"
      >
        YZ
      </button>
    </header>
  )
}
```

**Template literals for conditional className:**
`` `toolbar-btn ${appMode === AppMode.SKETCH_XY ? 'active' : ''}` `` — a **template
literal** (backtick string) that embeds a JavaScript expression. The `active` CSS
class is added only when the button's mode matches the current mode.

Template literals are the correct way to build strings from values in TypeScript.
`'toolbar-btn ' + (appMode === ... ? 'active' : '')` is the equivalent but less
readable. Template literals use `${}` to embed expressions.

**`title` attribute:**
`title` provides a tooltip text when the user hovers over the element. It also
provides a text alternative for elements without visible labels — important for
accessibility. Icon-only buttons must have a `title` attribute.

Add toolbar CSS:

```css
.toolbar-separator {
  width:            1px;
  height:           24px;
  background-color: var(--colour-border);
  margin:           0 4px;
}

.toolbar-btn {
  background:    transparent;
  border:        1px solid transparent;
  border-radius: 4px;
  color:         var(--colour-text-muted);
  cursor:        pointer;
  font-size:     var(--font-size-label);
  font-family:   var(--font-mono);
  padding:       4px 10px;
  transition:    border-color 0.1s, color 0.1s;
}

.toolbar-btn:hover {
  border-color: var(--colour-border);
  color:        var(--colour-text);
}

.toolbar-btn.active {
  border-color: var(--colour-accent);
  color:        var(--colour-accent);
}
```

**`transition` property:**
`transition: border-color 0.1s, color 0.1s` animates the specified CSS properties
over 0.1 seconds when they change. The button's border and colour transition smoothly
on hover/active state changes. Short transition times (100ms) feel responsive. Long
transitions (500ms+) feel sluggish for interactive elements.

---

## Step 6 — The Tool Panel in Sketch Mode

### Update `src/components/ToolPanel.tsx`

```tsx
import { AppMode } from '../state/appMode.js'

interface ToolPanelProps {
  appMode: AppMode
}

export function ToolPanel({ appMode }: ToolPanelProps): JSX.Element {
  const isSketchMode =
    appMode === AppMode.SKETCH_XY ||
    appMode === AppMode.SKETCH_XZ ||
    appMode === AppMode.SKETCH_YZ

  return (
    <aside className="tool-panel">
      {isSketchMode ? (
        <>
          <p className="panel-section-title">Draw</p>
          <button className="tool-btn">Line</button>
          <button className="tool-btn">Circle</button>
          <button className="tool-btn">Arc</button>
          <div style={{ height: 12 }} />
          <p className="panel-section-title">Constraints</p>
          <button className="tool-btn">Horizontal</button>
          <button className="tool-btn">Vertical</button>
          <button className="tool-btn">Fix Point</button>
        </>
      ) : (
        <>
          <p className="panel-section-title">Objects</p>
          <button className="tool-btn">Add Box</button>
        </>
      )}
    </aside>
  )
}
```

Add to `style.css`:

```css
.tool-btn {
  display:          block;
  width:            100%;
  text-align:       left;
  background:       transparent;
  border:           1px solid transparent;
  border-radius:    4px;
  color:            var(--colour-text-muted);
  cursor:           pointer;
  font-size:        var(--font-size-label);
  font-family:      var(--font-ui);
  padding:          5px 8px;
  margin-bottom:    2px;
  transition:       background-color 0.1s, border-color 0.1s;
}

.tool-btn:hover {
  background-color: var(--colour-surface-raised);
  border-color:     var(--colour-border);
  color:            var(--colour-text);
}
```

---

## Step 7 — Escape Key to Exit Sketch Mode

Add a global keyboard listener to `ViewportComponent`:

```tsx
useEffect(() => {
  function handleKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && appMode !== AppMode.NAVIGATE_3D) {
      onModeChange(AppMode.NAVIGATE_3D)
    }
  }

  window.addEventListener('keydown', handleKeyDown)
  return () => window.removeEventListener('keydown', handleKeyDown)
}, [appMode, onModeChange])
```

**`event.key` — first appearance:**
`event.key` is the string name of the key that was pressed. `'Escape'` is the Escape
key. `'Enter'` is Enter. `' '` (space) is the spacebar. `event.key` uses human-readable
names, unlike `event.keyCode` (a legacy numeric code now deprecated).

**Why `window.addEventListener` and not attaching to the canvas:**
Keyboard events fire on the focused element. A canvas is not focusable by default
(requires `tabIndex` attribute). Attaching to `window` catches keyboard events
regardless of which element has focus, which is the correct behaviour for application-
wide shortcuts like Escape.

---

## Debugging: When Mode Transition Behaves Wrongly

**Symptom: clicking XY button shows top-down view but orbit still works**

`orbitControls.enabled = false` is not being called. Verify `applyModeToCamera`
receives the `orbitControls` instance from `viewportRef.current.orbitControls`.
If `viewportRef.current` is null when the effect runs, the camera was not initialised
yet — check the effect dependencies.

**Symptom: clicking XY then XZ from toolbar without going through 3D**

The `isValidTransition` check is not being called. For now, the toolbar allows any
mode button — the transition validator is there for programmatic use. Add validation
if direct sketch-to-sketch transitions cause problems:
```typescript
if (!isValidTransition({ from: appMode, to: newMode })) return
```

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The `AppMode` state machine is the switch that controls every mode-dependent behaviour:
- Which camera controls are active
- Which mouse events are active (orbit/select vs draw)
- Which UI panels and buttons appear
- Which keyboard shortcuts are active

Lesson 07 (drawing lines) will add drawing tool state inside sketch mode. Lesson 09
(snapping) will add snap behaviour that only activates in sketch mode. All future
behaviour that is mode-dependent reads `appMode` from props or context and acts accordingly.

---

## What Breaks Without This

**Without `camera.up.set(0, 0, -1)` for XY view:**
Looking straight down at the XY plane, the camera's up vector `(0, 1, 0)` points
toward `(0, 50, 0)` — the camera's position. Three.js cannot compute the view
matrix when `up` and the view direction are collinear. The camera "spins" or shows
the scene from a random angle.

**Without disabling `OrbitControls`:**
In sketch mode, every mouse drag orbits the camera. Drawing a line from point A to
point B requires dragging — but the camera would orbit instead of recording the
line's endpoint. The user sees the viewport spin and nothing is drawn. The drawing
tools require the camera to be stationary.

---

## Definition of Done

- [ ] Clicking XY in the toolbar shows a top-down view
- [ ] Orbit is disabled in sketch mode
- [ ] Tool panel shows Draw and Constraints tools in sketch mode
- [ ] Tool panel shows Objects tools in 3D mode
- [ ] Pressing Escape returns to 3D mode
- [ ] The status bar shows the current mode
- [ ] You can explain the FSM states and draw the valid transitions
- [ ] You can explain `camera.up` and why it matters for looking straight down
- [ ] You can derive the 3D-to-2D projection formula `local_x = (P - O) · U`
- [ ] You can explain why `orbitControls.enabled` is toggled rather than replacing the object
- [ ] Run:
      ```
      git add src/
      git commit -m "Add sketch mode: FSM governs 3D/2D transitions, camera locks top-down, orbit disables, Escape returns to 3D"
      ```

---

*Next: Lesson 07 — Lines and Vectors. Click two points to draw a line in the sketch.
The preview line follows the cursor before the second click. Lines are immutable data
in the sketch model; Three.js renders them. Parametric line equations explained.*
