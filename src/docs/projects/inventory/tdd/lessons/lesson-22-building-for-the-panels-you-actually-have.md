# Lesson 22: Building for the Panels You Actually Have

## What you will build

`cnc-web`'s first real step toward the professional CAM-shell target
recorded in `CURRICULUM.md`'s Correction #5: a `RibbonToolbar`
component holding real, working toggle buttons for this project's two
actual panels — DRO and Tools — grouped under one labeled group,
sitting above the viewport. Verified live, with real clicks: each
button actually shows and hides its own section, independently, with
zero console errors. The transferable problem this lesson is really
about: **building for exactly the real cases in front of you, not the
imagined shape of a system that doesn't exist yet** — this project has
two panels today, not the five-plus a full CAM shell will eventually
need, and the honest, correct move is a structure that fits two cleanly
and extends to a third without a rewrite, not a speculative system
engineered for content that isn't real yet.

## What you need to know first

Lesson 17/18: `.map()` over an array to render a list with `key`
(`react-key-prop-reconciliation.md`), a callback passed as a prop,
functional `setState` updates (`setTools((prev) => ...)`), and the exact
conditional-className shape (`` `tcard${isSelected ? " on" : ""}` ``)
reused here unchanged. `avoid-premature-abstraction.md` (Lesson 12) —
the real, direct reason this lesson's own structure stays this small.

## Concepts cataloged from this lesson

No new concepts — every real piece below is an existing one, reapplied.
Full standalone treatments already live in `../concepts/`; pointers to
each are placed inline at their point of use.

## No pipeline diagram change

UI shell/layout, not a stage of the G-code pipeline.

---

## Concept Unit: A Reusable Toggle-Button Component

### The Problem

Two real sections — DRO and Tools — exist in `App.tsx` today with no way
to hide either one. Nothing yet renders anything resembling the ribbon
toolbar `CURRICULUM.md`'s Correction #5 named as the real target shell.

### Project Change

- **Reference Source** — none. `cnc-sim` has no ribbon of any kind in
  its own layout (a fixed left/right tab-panel shell instead) — this is
  new UI evolution, cited against a real, external reference instead:
  `Screenshot 2026-07-20 183629.png` (a real Mastercam session, already
  committed to this repo, per Correction #5).
- **Files affected** — new `cnc-web/src/RibbonToolbar.tsx`,
  `cnc-web/src/theme.css` (new rules).
- **Change type** — add.

### The New Code

```typescript
interface PanelToggle {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
}

interface RibbonGroup {
  label: string;
  toggles: PanelToggle[];
}
```

### The Updated Project

The complete, new `cnc-web/src/RibbonToolbar.tsx`:
```typescript
interface PanelToggle {
  id: string;
  label: string;
  visible: boolean;
  onToggle: () => void;
}

interface RibbonGroup {
  label: string;
  toggles: PanelToggle[];
}

interface RibbonToolbarProps {
  groups: RibbonGroup[];
}

function RibbonToolbar({ groups }: RibbonToolbarProps) {
  return (
    <div className="ribbon">
      {groups.map((group) => (
        <div key={group.label} className="ribbon-group">
          <div className="ribbon-buttons">
            {group.toggles.map((toggle) => (
              <button
                key={toggle.id}
                className={`btn ribbon-btn${toggle.visible ? " on" : ""}`}
                onClick={toggle.onToggle}
              >
                {toggle.label}
              </button>
            ))}
          </div>
          <div className="ribbon-group-label">{group.label}</div>
        </div>
      ))}
    </div>
  );
}

export default RibbonToolbar;
```
The real CSS these class names render against — new rules, this
project's existing dark-theme tokens, no new custom properties:
```css
.ribbon {
  display: flex;
  align-items: stretch;
  background: var(--color-panel);
  border-bottom: 1px solid var(--color-border-strong);
  padding: 6px 8px;
  margin-bottom: 10px;
  gap: 14px;
}
.ribbon-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding-right: 14px;
  border-right: 1px solid var(--color-border);
}
.ribbon-group:last-child {
  border-right: none;
  padding-right: 0;
}
.ribbon-buttons {
  display: flex;
  gap: 4px;
}
.ribbon-group-label {
  font-size: 8px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--color-muted);
}
.ribbon-btn.on {
  border-color: var(--color-accent-blue);
  color: var(--color-accent-blue-bright);
  background: var(--color-accent-green-bg);
}
```

### Mechanical Walkthrough

- `interface PanelToggle` / `interface RibbonGroup` — **(b) reappearing**
  one TS interface referencing another as a nested field type
  (`toggles: PanelToggle[]`) — the identical composition
  `ToolsResponse { tools: Record<string, Tool> }` already used in
  Lesson 17.
- `onToggle: () => void` — **(b) reappearing** a callback held as a
  plain object field rather than passed as a standalone component prop
  — the same "a function is a real, first-class value" fact every
  earlier callback prop already relied on, just stored one level deeper
  inside a data structure instead of passed bare.
- `groups.map((group) => (...))`, and a second, independent
  `group.toggles.map((toggle) => (...))` nested directly inside it —
  **(b) reappearing** `.map()`-to-render (Lesson 9's `groupSegments`
  onward) and `key` (`react-key-prop-reconciliation.md`) — applied
  twice, once per real level of the data (a list of groups, each
  holding its own list of toggles), not a new construct, the same one
  used recursively.
- `` `btn ribbon-btn${toggle.visible ? " on" : ""}` `` — **(b)
  reappearing**, the exact conditional-class shape
  `ToolCardList.tsx`'s own `` `tcard${isSelected ? " on" : ""}` ``
  already established — `btn` (Lesson 18) reused as the base look, a new
  `ribbon-btn` class added alongside it for anything specific to this
  context (currently just the `.on` variant, below).
- `.ribbon`, `.ribbon-group`, `.ribbon-buttons`, `.ribbon-group-label` —
  **(b) reappearing** `css-custom-properties.md`/
  `css-rule-syntax-selectors-cascade.md`'s mechanism — real, new rules,
  no new custom properties: every `var(--color-...)` reference here was
  already declared by an earlier lesson.
- `.ribbon-group:last-child` — **(a) first appearance** of the
  `:last-child` pseudo-class specifically (Lesson 18 used `:hover`, a
  different pseudo-class) — removes the group divider after the final
  group, so the ribbon's right edge doesn't end with a stray border.

### CS Lens

No new CS concept — a **higher-order component** (one component
rendering structure entirely driven by data passed into it, per the same
category `ToolCardList` already is) with two real levels of that same
data instead of one.

### SE Lens

The direct, real application of `avoid-premature-abstraction.md`'s own
point: this component could have been built as a fixed, hardcoded pair
of buttons (`<button onClick={onToggleDro}>DRO</button>`, `<button
onClick={onToggleTools}>Tools</button>`) with no `groups`/`toggles` data
structure at all — genuinely simpler, and arguably the more honest
choice for exactly two real buttons. The data-driven shape was chosen
instead for one real, concrete reason: this project's own stated
direction (Correction #5) is more panels and more groups, soon, not a
hypothetical — a real difference from Lesson 12's own
`avoid-premature-abstraction.md` example, where no second real case was
actually expected. Choosing the more general shape here is a judgment
call, not a rule, and named as one rather than defended as obviously
correct either way.

### Verified, Run for Real

```
npx tsc --noEmit
```
```
(no output — clean)
```
Not runnable/visible standalone yet — nothing in `App.tsx` renders
`RibbonToolbar` until the next unit.

---

## Concept Unit: Wiring Real Panels to Real Toggles

### The Problem

`RibbonToolbar` exists but nothing calls it, and `App.tsx`'s DRO/Tools
sections have no visibility state to actually toggle.

### Project Change

- **Files affected** — `cnc-web/src/App.tsx`.
- **Change type** — add (two `useState` calls, one `RibbonToolbar`
  element); replace (DRO/Tools sections, wrapped in a conditional).
- **Dependencies** — `RibbonToolbar`, from the previous unit.

### The New Code

```typescript
const [showDro, setShowDro] = useState(true);
const [showTools, setShowTools] = useState(true);
```
```typescript
{showDro && (
  <>
    <h1>DRO</h1>
    <MachineStatus program={PROGRAM} />
  </>
)}
```

### The Updated Project

`App.tsx`, in full:
```typescript
import { useEffect, useState } from "react";
import Viewport from "./Viewport.tsx";
import PathDump from "./PathDump.tsx";
import ToolCardList from "./ToolCardList.tsx";
import ToolImportPanel from "./ToolImportPanel.tsx";
import MachineStatus from "./MachineStatus.tsx";
import RibbonToolbar from "./RibbonToolbar.tsx";
import type { PathPoint } from "./segments.ts";

interface PathResponse {
  points: PathPoint[];
}

async function fetchPath(program: string): Promise<PathPoint[]> {
  const response = await fetch("http://127.0.0.1:5000/api/path", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ program }),
  });
  const data: PathResponse = await response.json();
  return data.points;
}

const PROGRAM = "M3 S1000\nG0 X10 Y20\nX30\nG1 Z-5 F100\nM8";

function App() {
  const [points, setPoints] = useState<PathPoint[]>([]);
  const [toolsRefreshKey, setToolsRefreshKey] = useState(0);
  const [showDro, setShowDro] = useState(true);
  const [showTools, setShowTools] = useState(true);

  useEffect(() => {
    fetchPath(PROGRAM).then(setPoints);
  }, []);

  return (
    <>
      <RibbonToolbar
        groups={[
          {
            label: "Panels",
            toggles: [
              { id: "dro", label: "DRO", visible: showDro, onToggle: () => setShowDro((v) => !v) },
              { id: "tools", label: "Tools", visible: showTools, onToggle: () => setShowTools((v) => !v) },
            ],
          },
        ]}
      />
      <h1>Toolpath</h1>
      <Viewport points={points} />
      <PathDump data={points} />
      {showDro && (
        <>
          <h1>DRO</h1>
          <MachineStatus program={PROGRAM} />
        </>
      )}
      {showTools && (
        <>
          <h1>Tools</h1>
          <ToolCardList refreshKey={toolsRefreshKey} />
          <ToolImportPanel onImported={() => setToolsRefreshKey((k) => k + 1)} />
        </>
      )}
    </>
  );
}

export default App;
```
`App` now owns two real booleans, one per panel, passed down into
`RibbonToolbar`'s `groups` data and read back by the exact same
sections they control — a single source of truth for "is this panel
visible," not duplicated state on either side.

### Mechanical Walkthrough

- `useState(true)`, twice — **(b) reappearing**, identical to every
  earlier `useState` call in this project; `true` specifically so both
  panels start visible, matching the layout before this lesson.
- `{ id: "dro", label: "DRO", visible: showDro, onToggle: () => setShowDro((v) => !v) }`
  — **(b) reappearing** object-literal syntax and the functional
  `setState` update form (`(v) => !v)`, the exact shape
  `ToolCardList.tsx`'s own `setTools((prev) => {...})` already
  established — reading the *previous* value to compute the next one,
  rather than assuming a stale `showDro` from this render's own closure.
- `{showDro && ( <>...</> )}` — **(b) reappearing**, the identical
  `&&`-conditional-render shape `ToolImportPanel.tsx` already used
  three times (`{file && (...)}`, `{loading && (...)}`,
  `{error && (...)}`) — a `<>...</>` fragment here specifically because
  two sibling elements (an `<h1>` and the real panel component) need to
  appear or disappear together as one unit.

### CS Lens

No new concept — this is **conditional rendering driven by component
state**, the same idea every earlier `&&` render already applied, now
controlling whether a whole section mounts at all rather than which of
several already-mounted states it shows.

### SE Lens

Boolean state living in `App` (the shared parent) rather than inside
`RibbonToolbar` itself or inside `MachineStatus`/`ToolCardList` directly
is the same **lifting state up** principle already named and applied in
this project (`react-lifting-state-up.md`, Lesson 18's own selection
state): the toggle buttons and the sections they control are true
siblings — neither owns the other — so the one thing that has to know
about both, `App`, is the only place the real "is this visible" fact can
correctly live.

### Verified, Run for Real

```
h1 headings, initial: [ 'Toolpath', 'DRO', 'Tools' ]
h1 headings, DRO toggled off: [ 'Toolpath', 'Tools' ]
h1 headings, both toggled off: [ 'Toolpath' ]
h1 headings, both back on: [ 'Toolpath', 'DRO', 'Tools' ]
console errors: []
```
Real output, this session, from an actual headless browser clicking the
actual rendered buttons — not a description of what the code should do.
Confirmed independently for each button, confirmed reversible, confirmed
with zero console errors either direction.

---

## Connect the Pieces

`App` now renders `RibbonToolbar` first, passing it one real group
("Panels") built from its own `showDro`/`showTools` state and the two
setter callbacks that flip them. Clicking either rendered button calls
its own `onToggle`, flipping that one boolean; `App` re-renders, and the
`{showDro && (...)}`/`{showTools && (...)}` blocks controlling the real
DRO and Tools sections mount or unmount accordingly — confirmed live,
independently, in both directions, with the Toolpath viewport itself
unaffected either way, since it was never wrapped in either condition.

## What Breaks Without This

Caused for real, this session's own verification: with no visibility
state at all (this project's condition immediately before this lesson),
there is no way to hide either section — not a subtle bug, the literal,
complete absence of the feature this lesson adds. Nothing to restore
after — the "before" state is simply this lesson's own starting point,
already real and already committed.

## Exercises

1. Add a third, real toggle for the Toolpath/viewport section itself —
   confirm it can hide even though it isn't inside either existing
   conditional, and reason about why `Viewport`/`PathDump` specifically
   might be a case *against* making it hideable (what this project
   actually uses it for on every single page load).
2. Add a second `group` to the array passed into `RibbonToolbar` — even
   with no new real panel to control yet, confirm the divider
   (`.ribbon-group:last-child`) correctly moves to the new last group,
   not the first one.
3. Remove the `key={toggle.id}` prop from the inner `.map()` only (leave
   the outer one), open the browser console, and force a re-render by
   toggling a button rapidly — read whether React's own real key-warning
   appears, and connect it back to `react-key-prop-reconciliation.md`'s
   own explanation of what a missing key actually costs.

## Definition of Done

- [ ] `RibbonToolbar` renders one group, two real buttons, matching the
      current `showDro`/`showTools` state visually (an "on" style when
      visible).
- [ ] Clicking either button actually shows/hides its real section, both
      directions, confirmed by you, not just described.
- [ ] `npx tsc --noEmit` is clean.
- [ ] A git commit exists explaining *why* (the real first step toward
      Correction #5's target shell, deliberately scoped to the two real
      panels this project actually has) — not just a list of files
      changed.
