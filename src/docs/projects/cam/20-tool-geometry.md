# CAD/CAM — Lesson 20 — Tool Geometry

## What You Will Build

A tool library panel appears in the right side of the viewport. Three end mills are
listed — a 6mm, 8mm, and 12mm. Clicking a tool highlights it and shows its details
below the list: diameter, radius, number of flutes, material, and maximum depth of
cut. An SVG diagram beside the details shows the tool's cross-section — a circle
proportional to the tool diameter. The selected tool's diameter is available to the
CAM operations that begin in lesson 21.

## What You Need to Know First

Lessons 01–19. Lesson 02 introduced React components, JSX, and `useState` — all
three are used here. The right panel established in lesson 02's application shell is
where this lesson's component renders. Lesson 19 established `toolRadius` as the value
that drives toolpath offset — this lesson is where that value comes from.

---

## The Problem

A CNC toolpath cannot be correct without knowing the cutting tool. The tool has a
diameter; the toolpath must be offset inward from the part geometry by the tool radius
so the tool's edge follows the intended profile. Before generating a toolpath (lesson
22), we need a tool library — a data source that describes each tool and provides its
radius.

The tool library is also a data persistence problem. Tool definitions must not be
hardcoded in TypeScript files. They belong in a data file that can be edited without
recompiling, shared between engineers, and eventually replaced by a database call.
This lesson builds the simplest correct architecture: a JSON file loaded once at
startup and kept in React state.

---

## Step 1 — The CuttingTool Type

### The problem

We need a TypeScript type that represents a cutting tool precisely enough for CAM
calculations to rely on it — specifically, `toolRadius()` must return a number that
the polygon offset in lesson 21 can use directly.

### Create `src/tools/tool.ts`

```typescript
export type ToolMaterial = 'hss' | 'carbide'

export interface CuttingTool {
  id:            string
  name:          string
  diameter:      number
  fluteCount:    number
  material:      ToolMaterial
  maxDepthOfCut: number
}

export function toolRadius(tool: CuttingTool): number {
  return tool.diameter / 2
}
```

**`CuttingTool` — what each field is and why:**

`id: string` — a unique identifier. String IDs are stable across insertions and
deletions: if the second tool is removed, ID strings do not shift. A numeric index
would change when the list is reordered.

`diameter: number` — in millimetres. One world unit in this project equals 1mm
(established in lesson 01's `GridHelper` sizing). Distances throughout the CAM
pipeline are in millimetres.

`fluteCount: number` — the number of cutting edges. Not used in path generation, but
visible in the tool profile and meaningful to a machinist reading the program.

`material: ToolMaterial` — `'hss'` (high-speed steel) or `'carbide'`. A **union
type** rather than a free string: TypeScript rejects any value that is neither
`'hss'` nor `'carbide'`. This prevents typos (`'Carbide'`, `'steel'`) and enables
exhaustive `switch` statements — the compiler warns if a new material is added to the
union but not handled in a switch.

`maxDepthOfCut: number` — the deepest single pass the tool can make. The contour
toolpath in lesson 22 checks this limit.

**`toolRadius` — why a function rather than inline arithmetic:**
Every place in the codebase that needs the radius could write `tool.diameter / 2`.
But writing `/ 2` everywhere is a **magic number** — the reader must interpret the
arithmetic every time they see it. `toolRadius(tool)` is self-documenting: "give me
the radius of this tool." If the tool model ever changes (for example, tools with
asymmetric cutting geometries where radius ≠ diameter / 2), there is one place to
update.

**SE lens — single responsibility in a data module:**
`tool.ts` owns the shape and semantics of `CuttingTool`. It defines the type,
documents what each field means, and encapsulates the radius formula. Every other
module imports `CuttingTool` and calls `toolRadius`. None of them repeat the formula
or interpret raw fields. This is the **single responsibility principle** applied to
data: one module owns the type; everyone else uses the abstraction.

**CS lens — types as machine-verified documentation:**
`ToolMaterial = 'hss' | 'carbide'` is not just a type annotation — it is a
**specification**. TypeScript enforces it at every call site. A tool object with
`material: 'steel'` fails to compile. The type system acts as a lightweight formal
verification layer, checking the specification against every usage automatically.
Production software uses this pattern extensively: TypeScript discriminated unions,
Rust enums, Haskell algebraic data types are all the same idea.

---

## Step 2 — The Tool Data File

### The problem

Tool data lives in JSON, not TypeScript. JSON is human-readable, has no build step,
can be reviewed and edited by non-developers, and is the standard format for data
exchange. In a production system, this file would be replaced by an API call to a
tool database.

### Create `src/tools/tools.json`

```json
[
  {
    "id": "em-6-2f",
    "name": "6mm 2-Flute End Mill",
    "diameter": 6,
    "fluteCount": 2,
    "material": "hss",
    "maxDepthOfCut": 3
  },
  {
    "id": "em-8-4f",
    "name": "8mm 4-Flute End Mill",
    "diameter": 8,
    "fluteCount": 4,
    "material": "carbide",
    "maxDepthOfCut": 4
  },
  {
    "id": "em-12-4f",
    "name": "12mm 4-Flute End Mill",
    "diameter": 12,
    "fluteCount": 4,
    "material": "carbide",
    "maxDepthOfCut": 6
  }
]
```

**JSON — format rules:**
JSON (JavaScript Object Notation) is a text format for structured data. Rules:
- Arrays: `[...]`. Objects: `{...}`.
- Strings: always double-quoted (`"hss"`, not `'hss'`).
- Numbers: unquoted (`6`, not `"6"`).
- No trailing commas, no comments.

JSON has no notion of a TypeScript type — it is pure data. The TypeScript type
(`CuttingTool`) is the schema; the JSON file is the data. They must agree, but the
compiler cannot verify that automatically. We bridge this with a runtime assertion.

**Vite JSON imports:**
In a Vite project, you can import a JSON file directly in TypeScript:
```typescript
import toolData from './tools.json'
```
Vite reads the file at build time, parses it, and inlines the result as a JavaScript
value. The import is synchronous — the data is available immediately, with no `fetch`
or async handling required. This is the correct approach for small, static data files
that are part of the application itself. For user-uploaded tool libraries or
server-managed inventories, a `fetch` call to an API endpoint would replace this import.

### Create `src/tools/toolLibrary.ts`

```typescript
import rawToolData           from './tools.json'
import type { CuttingTool } from './tool.js'

export function loadTools(): CuttingTool[] {
  return rawToolData as CuttingTool[]
}

export function findToolById(
  tools: CuttingTool[],
  id:    string,
): CuttingTool | undefined {
  return tools.find((tool) => tool.id === id)
}
```

**`rawToolData as CuttingTool[]` — type assertion:**
TypeScript infers the type of the imported JSON as a complex literal type derived
from the JSON structure — not `CuttingTool[]`. `as CuttingTool[]` is a **type
assertion**: we are telling TypeScript "trust that this matches `CuttingTool[]`."
This is appropriate when we control the JSON file and know it was written to match
the type. If the JSON were ever edited to break the contract (a field renamed,
`material` set to an invalid string), the error would appear at runtime — tests
catch this.

**`Array.find(predicate)` — first appearance:**
`array.find(fn)` returns the first element for which `fn(element)` returns `true`.
Returns `undefined` if no element matches. The TypeScript return type is
`CuttingTool | undefined` — the compiler requires callers to handle the missing case.
This prevents the silent `undefined` errors that occur in plain JavaScript when a
lookup silently returns `undefined` and code proceeds to call methods on it.

**SE lens — JSON as a simple database:**
The architecture here — JSON file as source of truth, TypeScript type as schema — is
the simplest correct data layer. The contract between data and code is the type
definition. The data file is version-controlled alongside the source code, so
changes to available tools are tracked in git history alongside the code changes
that use them.

Production CAM software replaces the JSON file with a database query, but the
contract (`loadTools() → CuttingTool[]`) remains identical. That is the purpose of
the data abstraction layer: callers never know whether data comes from a file, a
database, or a network request.

---

## Step 3 — The Tool Library Panel

### The problem

The tool list and selected tool details need to live in React state: clicking a tool
in the list updates selection state, which re-renders the details section. React's
component model (introduced in lesson 02) is the right tool for this.

### Create `src/tools/ToolLibraryPanel.tsx`

```typescript
import { useState }         from 'react'
import { loadTools }        from './toolLibrary.js'
import { toolRadius }       from './tool.js'
import type { CuttingTool } from './tool.js'
import './ToolLibraryPanel.css'

const availableTools = loadTools()
```

**`const availableTools = loadTools()` at module scope:**
`loadTools()` is called once when the module is first imported — not inside the
component function, not on every render. Tool data does not change during a session.
Placing the call at module scope communicates this: the data is loaded once and shared
by every render. If it were inside the component body, React would call `loadTools()`
on every re-render (every click, every state change). For a JSON import this is fast,
but it is architecturally wrong — side effects in render functions are a React
anti-pattern.

```typescript
interface ToolLibraryPanelProps {
  onToolSelected: (tool: CuttingTool) => void
}

export function ToolLibraryPanel({ onToolSelected }: ToolLibraryPanelProps) {
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null)

  const selectedTool = availableTools.find(
    (tool) => tool.id === selectedToolId,
  ) ?? null

  function handleToolClick(tool: CuttingTool): void {
    setSelectedToolId(tool.id)
    onToolSelected(tool)
  }

  return (
    <div className="tool-library-panel">
      <h2 className="panel-title">Tool Library</h2>

      <ul className="tool-list">
        {availableTools.map((tool) => (
          <li
            key={tool.id}
            className={`tool-item${selectedToolId === tool.id ? ' tool-item--selected' : ''}`}
            onClick={() => handleToolClick(tool)}
          >
            {tool.name}
          </li>
        ))}
      </ul>

      {selectedTool !== null && (
        <div className="tool-details">
          <ToolDetails tool={selectedTool} />
        </div>
      )}
    </div>
  )
}
```

**`useState<string | null>(null)` — typed with `string | null`:**
The state stores the selected tool's ID, or `null` when nothing is selected. Using
the ID (a string) rather than the full `CuttingTool` object avoids **stale state**:
if `availableTools` were ever updated (from a network fetch, for example), the stored
ID would still point to the correct entry after a fresh lookup. Storing the object
itself would hold a reference to the old object.

**`onToolSelected` prop — lifting state up:**
`ToolLibraryPanel` does not use the selected tool for anything itself — it tells its
parent via the callback. This is React's **lifting state up** pattern: when a child
needs to communicate a selection to a sibling (the CAM panel in lesson 22), the
common parent passes a callback prop to the child; the child calls it when the user
makes a selection. The parent stores the selected tool in its own state and passes it
to whichever children need it.

**`availableTools.map(...)` — rendering a list:**
`Array.map` with JSX is the standard React pattern for rendering lists. Each element
needs a `key` prop — React uses it to identify which item changed when the list
updates. `key={tool.id}` uses the stable, unique string ID. Using array index as key
is usually wrong: if the list is sorted or filtered, the index-to-item mapping
changes, and React associates old state (like selection highlight) with the wrong
item.

**`{selectedTool !== null && <ToolDetails tool={selectedTool} />}` — conditional rendering:**
The JSX expression `{condition && <Component />}` renders `<Component />` when
`condition` is truthy, and renders nothing when it is falsy. This is the React idiom
for optional UI sections. The TypeScript narrowing is important: inside the block,
`selectedTool` is known to be non-null, so `ToolDetails` receives a guaranteed
`CuttingTool`, not `CuttingTool | null`.

---

## Step 4 — Tool Details and the SVG Profile

### Create the `ToolDetails` component (in the same file)

```typescript
interface ToolDetailsProps {
  tool: CuttingTool
}

function ToolDetails({ tool }: ToolDetailsProps) {
  return (
    <div className="tool-details-content">
      <p>Diameter: {tool.diameter}mm</p>
      <p>Radius: {toolRadius(tool)}mm</p>
      <p>Flutes: {tool.fluteCount}</p>
      <p>Material: {tool.material.toUpperCase()}</p>
      <p>Max depth of cut: {tool.maxDepthOfCut}mm</p>
      <ToolProfileSvg diameter={tool.diameter} />
    </div>
  )
}
```

**`ToolDetails` as a separate component:**
`ToolDetails` is always rendered with a non-null tool — the null check lives in
`ToolLibraryPanel`. Each component handles exactly one concern. If `ToolDetails`
were embedded directly, it would need its own null check and the component would be
doing two jobs.

### The SVG tool profile

**SVG — first appearance:**
**SVG (Scalable Vector Graphics)** is an XML-based format for 2D vector graphics
rendered directly by the browser. Unlike `<canvas>` (where you issue drawing commands
imperatively) or Three.js (where you add objects to a scene graph), SVG is
**declarative**: you describe shapes in markup and the browser renders them. SVG
elements are part of the DOM tree — they can be styled with CSS and receive events.

SVG is resolution-independent: a circle in SVG is always a mathematically perfect
circle regardless of screen zoom or DPI. This makes it the correct choice for
technical diagrams — the tool cross-section must look crisp at any size.

```typescript
interface ToolProfileSvgProps {
  diameter: number
}

function ToolProfileSvg({ diameter }: ToolProfileSvgProps) {
  const svgSize     = 80
  const centreX     = svgSize / 2
  const centreY     = svgSize / 2
  const maxRadius   = svgSize / 2 - 6
  const largestTool = 12
  const scale       = maxRadius / largestTool
  const drawRadius  = Math.min((diameter / 2) * scale, maxRadius)

  return (
    <svg
      width={svgSize}
      height={svgSize}
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      aria-label={`Tool cross-section: ${diameter}mm diameter`}
    >
      <circle
        cx={centreX}
        cy={centreY}
        r={drawRadius}
        fill="none"
        stroke="#94a3b8"
        strokeWidth={1.5}
      />
      <line
        x1={centreX - drawRadius} y1={centreY}
        x2={centreX + drawRadius} y2={centreY}
        stroke="#475569"
        strokeWidth={1}
      />
    </svg>
  )
}
```

**`viewBox` — first appearance:**
The SVG `viewBox` attribute defines the internal coordinate system. `"0 0 80 80"`
means: origin at `(0,0)`, coordinate width 80 units, coordinate height 80 units.
The `width` and `height` attributes set the rendered pixel size. When they match
`viewBox`, there is no scaling. If `width="160"` with `viewBox="0 0 80 80"`, the
SVG doubles in size but all coordinates remain the same — this is why SVG is
resolution-independent.

**`scale` — mapping millimetres to SVG units:**
The 12mm tool is the largest in the library. We want it to fill most of the 80-unit
SVG. `scale = maxRadius / 12 = 34 / 12 ≈ 2.83`. A 6mm tool has draw radius
`3 × 2.83 = 8.5` SVG units. A 12mm tool has draw radius `6 × 2.83 = 17` SVG units.
All tools are visible and proportional to each other.

`Math.min(..., maxRadius)` ensures a tool larger than 12mm (not in this library, but
possible in future) does not overflow the SVG bounds.

**`<circle cx cy r />` — SVG circle element:**
The SVG `<circle>` element draws a circle. `cx` and `cy` are the centre coordinates
in the SVG coordinate system; `r` is the radius. `fill="none"` makes the interior
transparent. `stroke` sets the outline colour; `strokeWidth` sets its thickness.

**`<line x1 y1 x2 y2 />` — SVG line element:**
`<line>` draws a straight segment from `(x1, y1)` to `(x2, y2)`. The horizontal
diameter line across the circle shows the tool's full diameter at a glance — a
standard convention in technical drawing.

**`aria-label` — first appearance:**
The `aria-label` attribute provides an accessible name for the SVG element. Screen
readers (software that reads the screen aloud for users with visual impairments) would
announce this label when the SVG receives focus. Decorative images should have empty
`alt=""` or `aria-hidden="true"`. A meaningful diagram — like a tool profile — should
have a descriptive label. `aria-label` is an ARIA (Accessible Rich Internet
Applications) attribute: a set of HTML attributes that describe the semantics of
elements to accessibility tools.

---

## Step 5 — CSS

### Create `src/tools/ToolLibraryPanel.css`

```css
.tool-library-panel {
  display:        flex;
  flex-direction: column;
  gap:            12px;
  padding:        12px;
  height:         100%;
  overflow-y:     auto;
}

.panel-title {
  font-size:      0.875rem;
  font-weight:    600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color:          var(--colour-text);
}

.tool-list {
  list-style:     none;
  display:        flex;
  flex-direction: column;
  gap:            2px;
}

.tool-item {
  padding:          8px 10px;
  border-radius:    4px;
  cursor:           pointer;
  font-size:        0.875rem;
  color:            var(--colour-text);
  transition:       background-color 0.1s;
}

.tool-item:hover {
  background-color: var(--colour-surface-hover);
}

.tool-item--selected {
  background-color: var(--colour-accent);
  color:            #0f172a;
}

.tool-details-content {
  display:        flex;
  flex-direction: column;
  gap:            6px;
  font-size:      0.8125rem;
  color:          var(--colour-text-muted);
}
```

**`transition: background-color 0.1s` — first appearance:**
CSS `transition` animates property changes over time. `transition: background-color 0.1s`
means: when `background-color` changes (on `:hover`, or when `.tool-item--selected`
is added), animate the change over 100 milliseconds. Without transition, the colour
changes instantaneously — visually abrupt. 100ms is fast enough to feel responsive and
slow enough to feel smooth. Always add transitions to hover effects on interactive
elements — it is the minimum visual polish expected in a modern UI.

**Add to `src/style.css` `:root`:**
```css
--colour-surface-hover: #1e293b;
--colour-accent:        #38bdf8;
--colour-text-muted:    #94a3b8;
```

**`overflow-y: auto` on the panel:**
If the tool list grows beyond the panel height (more tools added in future), the panel
scrolls vertically rather than overflowing into the viewport. `auto` shows the
scrollbar only when it is needed — `always` would show it even when there is nothing
to scroll.

---

## Connect the Pieces

The selected tool flows upward through React's lifting-state-up pattern:

```
tools.json
  ──► loadTools()
  ──► ToolLibraryPanel (renders list, tracks selectedToolId)
  ──► onToolSelected(tool) callback to parent
  ──► App component state: selectedTool
  ──► prop to ContourPanel (lesson 22)
  ──► toolRadius(selectedTool) → polygon offset distance
```

`toolRadius()` from `tool.ts` is the single function that computes the offset distance.
No other module repeats this arithmetic — they all call `toolRadius`. This is the
**single source of truth** principle: the formula lives in exactly one place.

`CuttingTool` is the shared type between the tool library and every CAM operation.
Adding a new field to `CuttingTool` (for example, `cornerRadius`) immediately requires
updating `tools.json` — TypeScript's type checking across the import boundary enforces
the contract at every call site.

---

## What Breaks Without This

**Without `key={tool.id}` on list items:**
React logs a warning: "Each child in a list should have a unique key prop." More
seriously, without keys React uses array index to identify items. If tools are ever
sorted or filtered, the selected item's highlight migrates to the wrong tool — the
user selects "6mm End Mill" but "8mm End Mill" highlights instead. Keys are not a
suggestion; they are the mechanism React uses to maintain identity across renders.

**Without `transition` on the hover state:**
Hovering over a tool item produces an instant colour change — visually harsh and
unprofessional. In a list where the user's eye is tracking items, abrupt colour
changes cause visual distraction. The 100ms transition is not decorative; it is the
threshold below which UI state changes feel instantaneous and above which they feel
slow.

**Without the type assertion on the JSON import:**
TypeScript infers the imported JSON as a deeply nested literal type incompatible with
`CuttingTool[]`. Functions accepting `CuttingTool[]` refuse to accept it. The `as
CuttingTool[]` assertion aligns the inferred type with the declared type.

---

## Definition of Done

- [ ] The tool library panel renders in the right panel of the application shell
- [ ] Three tools are listed; clicking one highlights it in the accent colour
- [ ] The selected tool's details appear: diameter, radius, flutes, material, depth
- [ ] An SVG circle proportional to the tool diameter appears in the details
- [ ] `loadTools()` is called at module scope, not inside the component
- [ ] You can explain the difference between `useState` and module-scope data
- [ ] You can explain SVG `viewBox` and why SVG scales cleanly at any resolution
- [ ] You can explain `transition: background-color 0.1s` and why instantaneous changes look worse
- [ ] You can explain `Partial<T>` and name two other TypeScript utility types
- [ ] You can explain `aria-label` and what problem ARIA attributes solve
- [ ] Run:
      ```
      git add src/tools/
      git commit -m "Add tool library: JSON data file, CuttingTool type, selection panel with SVG cross-section diagram"
      ```

---

*Next: Lesson 21 — Polygon Offset. The selected tool's radius is used to offset the
closed sketch profile inward. The offset curve is the path the tool centre must follow
to machine the part profile exactly. Angle bisectors resolve corner intersections;
the maths is derived from first principles.*
