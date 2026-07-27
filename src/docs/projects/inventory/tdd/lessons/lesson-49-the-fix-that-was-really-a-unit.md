# Lesson 49: The Fix That Was Really a Unit

**What you will build:** the third and final slice of the tool-assembly
feature — the currently active tool's real assembly now renders in the
*main* toolpath viewport, positioned at the real tool tip for whichever
step is showing, with a "Show Holder" toggle. Reached by reusing Lesson
48's own revolve machinery completely unchanged. Along the way, three
real, independent bugs were found through live testing, not assumed:
a stale tool list two lessons in the making, a delete that told no one,
and a display that was correctly shaped, correctly positioned, and
wrong by a factor of roughly 25 — all three fixed and named directly.

**What you need to know first:** Lesson 47's `active_t`-adjacent parser
state (`core/parser.py`); Lesson 48's `toolAssembly.ts`/
`assemblyViewport.ts`; Lesson 46's `keep-mounted-vs-conditional-
unmount.md` (the root cause behind bug #2 below); `react-useeffect-
hook.md`.

---

## Concept Unit: A Real Tool Number, Already Tracked

### The Problem

The live viewport needs to know which real tool is active at whichever
step is currently showing — but `MachineState` (`core/machine.py`) has
never tracked a tool number at all; only the *parser* (`core/
parser.py`) does, via its own real `active_t`/`pending_t` modal state,
set from real `T`-words and `M06` (already returned on every command
dict, unused by anything downstream until now).

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-service/core/path.py`.
- **Change type** — replace.
- **Location** — `compute_steps`'s own per-step loop.
- **Dependencies** — `core/parser.py`'s existing `active_t`.

### The New Code

```python
        for point in points[before:]:
            point["command_index"] = index
        # Real, already-tracked parser modal state (core/parser.py's own
        # active_t, from real T-words/M06) -- added here so a step-through
        # viewer can know which real tool is active at a given step without
        # a second fetch of the parsed command list it doesn't otherwise
        # need. 0 means no tool has been selected yet at this point in the
        # program, a real, valid case, not a missing-data placeholder.
        states.append({**state.state(), "active_t": command.get("active_t", 0)})
    return {"points": points, "states": states}
```

### Mechanical Walkthrough

`command.get("active_t", 0)` reads a value the *parser* already put on
every command dict — `compute_steps` doesn't compute anything new here,
it just carries an already-real fact forward into its own per-step
snapshot, the same way `command_index` already rides alongside each
point. `{**state.state(), "active_t": ...}` — spreading `state.state()`'s
own dict and adding one more key, rather than teaching `MachineState`
itself about tool numbers at all; `active_t` is real parser-tracked
modal state, not physical machine state, and doesn't belong on that
class.

### CS Lens / SE Lens

Not a hard concept — recognizing that a fact your own program already
computed doesn't need recomputing, just forwarding to wherever it's
needed next.

### Commands

None new.

### Run It

```pycon
>>> commands = Parser().parse("T1 M06\nG0 X10 Y20\nG1 Z-5 F100\nT2 M06\nG0 X30 Y30")
>>> result = compute_steps(commands)
>>> [s["active_t"] for s in result["states"]]
[1.0, 1.0, 1.0, 2.0, 2.0]
```

Real output, confirmed directly this session against a real T1/T2
tool-change program.

---

## Concept Unit: Resolving a Tool Number to a Real Tool

### The Problem

`active_t` is a plain tool *number* — but every real tool-fetching
function so far (`get_tool_by_id`, `get_tool_assembly`) needs a tool's
real GUID. The viewer only ever has the number.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-service/core/tools.py`, `cnc-service/app.py`.
- **Change type** — add.
- **Location** — `core/tools.py` near `get_tool_assembly`; `app.py`
  near the existing `/api/tools/...` routes.
- **Dependencies** — Lesson 47's `get_tool_assembly`.

### The New Code

```python
def get_tool_assembly_by_number(tool_number):
    """Resolves a real G-code T-word (a plain, non-unique tool number --
    Mastercam really does allow more than one distinct tool to share one
    number, per Lesson 17/18) to one specific real tool and its real
    assembly, for a step-through viewer that only ever has a tool
    *number* (core/path.py's own real `active_t`), not a tool's real
    GUID. Takes the first matching tool -- the same honest, already-
    named "first match" limitation this project's own BlockList.tsx
    tool lookup has, not a new one. Returns None if no tool has this
    number at all (a real, valid case: `active_t == 0`, or a number no
    real tool was ever given)."""
    with get_session() as session:
        tool = session.execute(
            select(TlTool).where(TlTool.ToolNumber == tool_number)
        ).scalars().first()
        if tool is None:
            return None
        tool_dict = _tool_to_dict(tool)
        tool_id = tool.ID
    return {"tool": tool_dict, "assembly": get_tool_assembly(tool_id)}
```

```python
@app.route("/api/tools/by-number/<int:tool_number>/assembly")
def get_assembly_by_number(tool_number):
    # For the live simulation viewport: it only ever has a real tool
    # *number* (core/path.py's own active_t), never a specific tool's
    # real GUID -- see get_tool_assembly_by_number's own note on the
    # real, honest "first match" limitation this implies.
    result = get_tool_assembly_by_number(tool_number)
    if result is None:
        return {"error": f"no tool with tool_number {tool_number}"}, 404
    return result
```

### Mechanical Walkthrough

The session that looks up `tool` closes (`with get_session() as
session:` exits) *before* `get_tool_assembly(tool_id)` opens its own —
`tool_id` is captured as a plain local variable first, so the second
call doesn't depend on the first session still being open. `.scalars(
).first()` (not `.scalar_one_or_none()`, used everywhere a tool number
is genuinely expected unique) is the deliberate, honest signal that more
than one real row can match here.

### CS Lens / SE Lens

Not repeated — the "first match" honest limitation is the same one
`BlockList.tsx` already named for the identical real reason (tool
numbers are real, allowed to repeat).

### Commands

None new.

### Run It

```pycon
>>> result = tools.get_tool_assembly_by_number(1)
>>> result['tool']['name'], result['assembly']['holder_name']
('0.5 Bull endmill', 'HSK63ATT088394')
>>> tools.get_tool_assembly_by_number(999)
None
```

Real output, this session, against the real, current tool table.

---

## Concept Unit: Reusing Genuinely Reusable Code

### The Problem

The main viewport needs the exact same real geometry-building logic
(`buildToolProfile`, `revolveProfile`) the assembly modal already uses —
building a second copy would mean two places that could quietly drift
apart.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/viewport.ts`.
- **Change type** — add.
- **Location** — new `toolGroup`, `clearToolMeshes`, `setTool`.
- **Dependencies** — `toolAssembly.ts` (Lesson 48, unchanged).

### The New Code

```ts
import { buildToolProfile, revolveProfile, type ProfilePoint, type ToolDimensions } from "./toolAssembly.ts";

// Real colors, matching assemblyViewport.ts's own modal-preview choice --
// distinct enough to read clearly regardless of the app's own current
// theme, not yet theme-driven (the same named, reasonable scope cut).
const TOOL_COLOR = 0xc8ccd4;
const HOLDER_COLOR = 0x4a5568;
```

```ts
  // The currently active tool's own real assembly (Lesson 48's own
  // toolAssembly.ts, reused unchanged here -- x=radius/y=axial already
  // matches THREE.LatheGeometry's own input shape, no new conversion
  // needed) -- positioned at the real tool-tip position for whichever
  // step is currently revealed, not a fixed or decorative placement.
  const toolGroup = new THREE.Group();
  scene.add(toolGroup);
  let toolMeshes: THREE.Mesh[] = [];
```

```ts
  function clearToolMeshes() {
    for (const mesh of toolMeshes) {
      toolGroup.remove(mesh);
      mesh.geometry.dispose();
      (mesh.material as THREE.Material).dispose();
    }
    toolMeshes = [];
  }
```

### Mechanical Walkthrough

Not one line of `toolAssembly.ts` changed for this — `buildToolProfile`/
`revolveProfile` take plain data in, return plain geometry out, with no
dependency on which viewport calls them. `clearToolMeshes` mirrors
`assemblyViewport.ts`'s own identical dispose-then-rebuild shape
(`concepts/threejs-mutating-scene-after-creation.md`, reappearing) —
the same real reason applies here: a `LatheGeometry`'s vertex data is
baked in at construction, not mutable in place.

### CS Lens

Not a hard CS concept — a real, successful instance of a pure function
being genuinely reusable across two different call sites with two
different real jobs (a static modal preview vs. a live, moving display)
*because* it was written with no assumptions baked in about which one
would call it.

### SE Lens

The real payoff, concretely: fixing the unit-conversion bug (this
lesson's own last unit) or the profile shape itself only ever needs to
happen in one place, and both the modal and the live viewport get the
fix for free — the real cost of *not* sharing this code would have been
finding and fixing the same bug twice, in two slightly different copies.

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: the same tool that
renders correctly in ToolAssemblyModal.tsx's own preview also renders
correctly (shape-wise) in the main viewport, from the identical
buildToolProfile/revolveProfile calls.
```

---

## Concept Unit: One Rotation Sign, Two Different Reasons

### The Problem

`assemblyViewport.ts` (Lesson 48) rotates each mesh with `rotation.x =
-Math.PI / 2`. The main viewport needs the *opposite* sign.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/viewport.ts`.
- **Change type** — add.
- **Location** — `setTool`.
- **Dependencies** — none.

### The New Code

```ts
  // Real, live tool/holder display: `tool`/`position` are both null
  // whenever no real tool is active yet (active_t === 0, before the
  // first real M06) -- correctly shows nothing rather than a stale or
  // placeholder tool. `rotation.x = +Math.PI/2` (not assemblyViewport.ts's
  // own -Math.PI/2 -- that modal's own free-orbiting preview has no real
  // "up" to get right) stands each mesh up so its own local +y (extending
  // from the tip toward the holder) maps to this scene's real +z --
  // matching real G-code convention (Z+ is away from the part, toward
  // the spindle), so the assembly reads correctly relative to the real
  // toolpath already drawn here.
  function setTool(
    tool: ToolDimensions | null,
    holderProfile: ProfilePoint[] | null,
    stickout: number,
    showHolder: boolean,
    position: { x: number; y: number; z: number } | null,
  ) {
    clearToolMeshes();
    if (!tool || !position) return;

    const toolGeometry = revolveProfile(buildToolProfile(tool));
    const toolMaterial = new THREE.MeshStandardMaterial({ color: TOOL_COLOR, metalness: 0.6, roughness: 0.4 });
    const toolMesh = new THREE.Mesh(toolGeometry, toolMaterial);
    toolMesh.rotation.x = Math.PI / 2;
    toolGroup.add(toolMesh);
    toolMeshes.push(toolMesh);

    if (showHolder && holderProfile && holderProfile.length > 0) {
      const holderGeometry = revolveProfile(holderProfile);
      const holderMaterial = new THREE.MeshStandardMaterial({ color: HOLDER_COLOR, metalness: 0.5, roughness: 0.5 });
      const holderMesh = new THREE.Mesh(holderGeometry, holderMaterial);
      holderMesh.rotation.x = Math.PI / 2;
      holderMesh.position.z = stickout;
      toolGroup.add(holderMesh);
      toolMeshes.push(holderMesh);
    }

    toolGroup.position.set(position.x, position.y, position.z);
  }
```

### Mechanical Walkthrough

`clearToolMeshes()`/the tool-then-holder mesh construction — **(b)
reappearing**, the identical shape `assemblyViewport.ts`'s own
`clearMeshes()`/`setAssembly` already established (Lesson 48), applied
here to `toolGroup` instead of `assemblyGroup`. `toolMesh.rotation.x =
Math.PI / 2` (positive, not Lesson 48's negative) is this unit's one
genuinely new value — worked out below, not copied.

### Execution Trace

THREE's own X-axis rotation formula: `y' = y·cos(θ) − z·sin(θ)`, `z' =
y·sin(θ) + z·cos(θ)`. Applied to a local `(0, 1, 0)` point (pure `+y`,
the direction from a tool's tip toward its own holder) at each of the
two real `θ` values in play:

```
θ = +Math.PI/2 (this unit's own choice, viewport.ts):
  cos(90°) = 0, sin(90°) = 1
  y' = 1*0 - 0*1 = 0
  z' = 1*1 + 0*0 = 1
  → local (0,1,0) maps to world (0,0,1) — local +y lands on world +z

θ = -Math.PI/2 (assemblyViewport.ts's own choice, Lesson 48):
  cos(-90°) = 0, sin(-90°) = -1
  y' = 1*0 - 0*(-1) = 0
  z' = 1*(-1) + 0*0 = -1
  → local (0,1,0) maps to world (0,0,-1) — local +y lands on world -z
```

Both are internally consistent — a mesh's own tip still stays at the
local origin either way, and the holder still sits the correct relative
distance from it — but only `+90°` makes `+y` (extending from the
tool's tip toward its own holder) line up with this *specific* scene's
own real `+z` (away from the part, toward the spindle, matching the
toolpath already drawn here in real machine coordinates).
`assemblyViewport.ts`'s own modal preview never had a real external
reference to get right — its camera orbits freely around whatever it's
shown, so either sign looks equally correct there.

### CS Lens

Not a hard CS concept — a concrete instance of a rotation being
"correct" only relative to some external reference frame; with no such
reference (the standalone modal), there is no real right answer to get
wrong in the first place.

### SE Lens

The real, easy mistake this avoids: copying a working value from one
context into a superficially similar one without checking whether the
*reason* it worked there still applies. `-Math.PI/2` was correct code,
verified correct, in `assemblyViewport.ts` — copying it verbatim into
`viewport.ts` would have been a real, subtle bug (the assembly pointing
the wrong direction relative to the toolpath), caught here by working
out *why* the number was what it was, not just what it was.

### Commands

None new.

### Run It

Confirmed by direct derivation above (the rotation-matrix formula,
worked by hand) and live-browser observation: the tool/holder assembly
reads correctly (tip down, holder up toward the spindle) relative to
the already-drawn toolpath.

---

## Concept Unit: Wiring the Trigger — From Step to Displayed Assembly

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/Viewport.tsx`, `cnc-web/src/App.tsx`.
- **Change type** — add.
- **Location** — `Viewport.tsx`'s own props/effect; `App.tsx`'s own
  state.
- **Dependencies** — `react-useeffect-hook.md`.

### The New Code

```tsx
// The currently active tool's own real data -- `null` whenever no real
// tool is active yet (App.tsx's own active_t === 0 case).
export interface ActiveToolDisplay {
  tool: ToolDimensions;
  holderProfile: ProfilePoint[] | null;
  stickout: number;
  position: { x: number; y: number; z: number };
}
```

```tsx
  useEffect(() => {
    viewportRef.current?.setTool(
      activeTool?.tool ?? null,
      activeTool?.holderProfile ?? null,
      activeTool?.stickout ?? 0,
      showHolder,
      activeTool?.position ?? null,
    );
  }, [activeTool, showHolder]);
```

`App.tsx`'s own real state and fetch, driving that prop:

```tsx
type FetchedTool = ToolDimensions & { is_metric: boolean };

interface ByNumberResponse {
  tool?: FetchedTool;
  assembly?: ToolAssembly | null;
  error?: string;
}

async function fetchAssemblyByNumber(
  toolNumber: number,
): Promise<{ tool: FetchedTool; assembly: ToolAssembly | null } | null> {
  const response = await fetch(`http://127.0.0.1:5000/api/tools/by-number/${toolNumber}/assembly`);
  const data: ByNumberResponse = await response.json();
  if (data.error) {
    logger.warn(`fetchAssemblyByNumber(${toolNumber}): ${data.error}`);
    return null;
  }
  return { tool: data.tool!, assembly: data.assembly ?? null };
}
```

```tsx
  const [showHolder, setShowHolder] = useState(true);
  const [activeToolData, setActiveToolData] = useState<{
    tool: FetchedTool;
    assembly: ToolAssembly | null;
  } | null>(null);
  const activeToolNumber = currentState?.active_t ?? 0;

  useEffect(() => {
    if (activeToolNumber === 0) {
      setActiveToolData(null);
      return;
    }
    fetchAssemblyByNumber(activeToolNumber).then(setActiveToolData);
  }, [activeToolNumber]);
```

### Mechanical Walkthrough

`activeToolNumber` (a plain number, derived from `currentState?.
active_t`) is the effect's own dependency — not `currentState` itself.
This matters: `currentState` is a *new* object every step (a fresh
`states[stepIndex]` entry), but `activeToolNumber` only actually
*changes value* when a real tool change happens — depending on the
primitive, not the object, means the fetch only re-runs on a genuine
tool change, not on every single step, with no memoization tricks
needed at all (a plain number is already reference-stable by value,
unlike the array/object cases `react-effect-dependency-reference-
equality.md`, Lesson 46, had to work around).

### CS Lens / SE Lens

Not repeated — ordinary `useEffect` dependency mechanics, deliberately
chosen to depend on the narrowest real value that actually needs
watching, rather than a broader object that happens to contain it.

### Commands

```
npx tsc --noEmit
npx vitest run
```

### Run It

Confirmed live: stepping through a program with two tool changes
re-fetches the assembly exactly twice (once per real change), not once
per step.

---

## Concept Unit: A Real, Live Bug — The List That Never Refreshed

### The Problem

Reported directly, live: after deleting all tools and importing 2 new
ones, a dropdown elsewhere in the app (`BlockList.tsx`'s own Tool
select, Lesson 44) still showed ten-plus entries, including tools that
had already been deleted.

### Introduce the Concept in Isolation

**REAPPEARING** — the real, root mechanism is exactly `concepts/keep-
mounted-vs-conditional-unmount.md` (Lesson 46), from the *other* side:
that lesson fixed a bug caused by components losing state on unmount;
this one is the same fix's own real, unintended side effect —
`BlockList.tsx`'s tools fetch (`useEffect(..., [])`, "run once, on
mount") used to get a fresh mount (and therefore a fresh fetch) every
time its own tab was revisited, back when tabs unmounted on switch.
Once every tab started staying mounted for the whole session, "once, on
mount" quietly became "once, ever."

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx`, `cnc-web/src/App.tsx`.
- **Change type** — replace.
- **Location** — `BlockList`'s own tools-fetch effect.
- **Dependencies** — `keep-mounted-vs-conditional-unmount.md`.

### The New Code

```tsx
  // Same real bump-a-number-to-refetch signal ToolCardList.tsx's own
  // `refreshKey` already uses. Real bug, found live: this component's
  // own tools fetch used to run exactly once, on mount, with no way to
  // learn a tool was added/deleted/imported afterward -- and since every
  // side-panel tab now stays mounted for the whole session (Lesson 46),
  // "once, on mount" had become "once, ever," silently showing a stale
  // tool list (including tools already deleted) for as long as the app
  // stayed open.
  toolsRefreshKey: number;
```

```tsx
  useEffect(() => {
    fetchTools()
      .then(setTools)
      .catch((err: Error) => logger.error(`fetchTools failed: ${err.message}`));
  }, [toolsRefreshKey]);
```

`App.tsx` passes its own, already-existing `toolsRefreshKey` (until now
only wired to `ToolCardList`) through:

```tsx
        <BlockList
          program={debouncedCode}
          onProgramChange={setCode}
          onSelectionChange={setSelectedCommandIndices}
          toolsRefreshKey={toolsRefreshKey}
        />
```

### Mechanical Walkthrough

No new mechanism — `toolsRefreshKey` (a plain number, bumped by
`ToolImportPanel`'s own `onImported` callback) already existed
specifically to solve exactly this class of problem for
`ToolCardList.tsx`; `BlockList.tsx` simply hadn't been wired to it,
because at the time it was written, its own mount/unmount cycle was
accidentally doing the same job.

### CS Lens

Not a hard concept — a real, concrete instance of a fix in one place
(Lesson 46's keep-every-tab-mounted change) removing an *accidental*
side effect another piece of code had been silently depending on,
without either piece of code being individually wrong on its own.

### SE Lens

The real, general lesson: a component's own "refetch on mount" is only
a real refresh mechanism if mounting is guaranteed to happen again at
the right times. The moment something *else* in the system changes how
often mounting happens (here, an unrelated, correct, and genuinely
better fix), any code that was silently relying on the old mount
frequency needs its own real, independent refresh trigger — "it worked
before" is not the same as "it was ever really wired correctly."

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session: after this fix,
deleting all tools and importing 2 new ones correctly shows exactly
those 2 tools in BlockList.tsx's own dropdown, matching the real,
current database contents confirmed directly via a Python query.
```

---

## Concept Unit: A Real, Live Bug — Delete That Told No One

### The Problem

Even with the fix above, a *delete* (as opposed to an import) still
wouldn't have refreshed `BlockList.tsx`'s own list — `ToolCardList.tsx`'s
own delete handler never told anyone the tools table had changed at
all.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/ToolCardList.tsx`.
- **Change type** — add.
- **Location** — `ToolCardListProps`, `handleDelete`.
- **Dependencies** — none.

### The New Code

```tsx
  // Real bug, found live: a delete only ever updated this component's
  // own local `tools` state -- every *other* real consumer of the tools
  // table (BlockList.tsx's own Tool select, its own toolsRefreshKey) had
  // no way to learn a tool was gone, and kept showing it as if it still
  // existed for the rest of the session. `onDeleted` is the same real
  // "tell the parent to bump its refresh key" signal ToolImportPanel's
  // own `onImported` already provides for the other real mutation.
  onDeleted?: () => void;
```

```tsx
  const handleDelete = async (id: string) => {
    await deleteToolById(id);
    setTools((prev) => prev.filter((t) => t.id !== id));
    onDeleted?.();
  };
```

### Mechanical Walkthrough

`setTools((prev) => prev.filter(...))` still runs first — `ToolCardList`
itself updates instantly, an optimistic local update, same as before.
`onDeleted?.()` is the new, real addition: it tells whichever parent
holds `toolsRefreshKey` (`App.tsx`) that *some* real, external state
changed, so every other real consumer (now including `BlockList.tsx`,
per the previous unit) refetches too.

### CS Lens

Not a hard concept — the same **two real mutations, one real signal**
principle the previous unit's own fix relies on: both "a tool was
imported" and "a tool was deleted" need to notify the same real
observers, and until now only one of the two real mutations actually
did.

### SE Lens

The real, easy trap this names: adding a refresh mechanism for *one*
real mutation (import) and considering the problem solved, without
checking whether every other real mutation of the same underlying data
(delete) needs the identical signal. A partial fix here would have
looked completely correct in the one scenario it was tested against
(importing new tools) while still silently failing in the other (this
session's own real report, "I deleted all the tools").

### Commands

None new.

### Run It

```
Real, live-browser behavior confirmed this session, together with the
previous unit's own fix: deleting a tool via the Tools tab now
correctly updates BlockList.tsx's own dropdown too, not just
ToolCardList's own list.
```

---

## Concept Unit: A Real, Live Bug — Right Shape, Wrong Scale

### The Problem

Reported directly, live, with a screenshot: "I see the tool and holder,
they are tiny." The assembly was correctly shaped and correctly
positioned at the real tool tip — just roughly 25 times too small
relative to the toolpath.

### Introduce the Concept in Isolation

First appearance of this exact failure mode in this project — full
standalone treatment: `concepts/unit-conversion-before-combining-
values.md`. Read that first; its own isolated example (a metric and an
inch box, combined with no conversion, off by the identical real
factor) is precisely this project's own mistake, generalized.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/toolAssembly.ts`,
  `cnc-service/core/tools.py`, `cnc-web/src/App.tsx`.
- **Change type** — add.
- **Location** — `toolAssembly.ts`'s own module scope; `get_tool_
  assembly`'s own return dict; `App.tsx`'s `activeToolDisplay`.
- **Dependencies** — `unit-conversion-before-combining-values.md`.

### The New Code

```ts
// Real, found live: nothing anywhere in this project converts between
// inch and mm tool data (Lesson 17's own is_metric flag was, until now,
// only ever a display label -- ToolCardList.tsx's own comment says so
// directly). That was invisible as long as tool geometry was never drawn
// to scale against anything else (the assembly modal's own preview
// auto-frames regardless of absolute size, so it never needed this) --
// but the live simulation viewport draws a tool's real geometry in the
// *same* world units as the toolpath itself, which this project's own
// real programs/grid/camera setup already treat as effectively
// millimeters. An inch tool's raw numbers, used unconverted in that same
// space, rendered a real 0.5"/~4" assembly as if it were 0.5/4 *millimeter*
// units -- correctly shaped, real position, just a real 25.4x too small.
export const INCH_TO_MM = 25.4;

export function toMillimeters(value: number, isMetric: boolean): number {
  return isMetric ? value : value * INCH_TO_MM;
}
```

The backend's own, previously-uncaptured half of the same real fact —
the *holder's* own unit flag, independent of the tool's:

```python
            # Real, previously-uncaptured unit flag for the holder's own
            # profile/stickout numbers (TlAssemblyItem.IsMetric, copied in
            # at import time -- see _copy_tool_assembly -- but never
            # exposed until now). No conversion happens here in the
            # backend, same as the tool's own is_metric (Lesson 17) --
            # this only lets a consumer (the live 3D viewport) know
            # whether these raw numbers are inches or mm before deciding
            # whether to convert them to match the program's own units.
            "holder_is_metric": holder_catalog.IsMetric if holder_catalog else True,
```

`App.tsx`'s own real conversion step, applied independently to tool and
holder:

```tsx
  const activeToolDisplay = useMemo(() => {
    if (!activeToolData || !currentState) return null;
    const tool = activeToolData.tool;
    const mmTool: ToolDimensions = {
      ...tool,
      diameter: toMillimeters(tool.diameter, tool.is_metric),
      cutting_depth: toMillimeters(tool.cutting_depth, tool.is_metric),
      total_length: toMillimeters(tool.total_length, tool.is_metric),
      arbor_diameter: toMillimeters(tool.arbor_diameter, tool.is_metric),
    };
    const assembly = activeToolData.assembly;
    const holderProfile = assembly
      ? assembly.profile.map((p) => ({
          x: toMillimeters(p.x, assembly.holder_is_metric),
          y: toMillimeters(p.y, assembly.holder_is_metric),
        }))
      : null;
    const stickout = assembly ? toMillimeters(assembly.stickout, assembly.holder_is_metric) : 0;
    return { tool: mmTool, holderProfile, stickout, position: currentState.position };
  }, [activeToolData, currentState]);
```

### Mechanical Walkthrough

Tool and holder are converted **independently**, each by its own real
`is_metric`/`holder_is_metric` flag, not by a single shared assumption —
a real assembly can (and in this project's own current data, does) pair
an inch tool with an inch holder, but nothing in the schema guarantees
they always match, so treating them as a single unit would have been a
real, if currently invisible, second version of the exact same mistake.

### Execution Trace

`activeToolDisplay` run for real against tool 1's own real, seeded data
(`"0.5 Bull endmill"`, `is_metric: false`; its real holder,
`holder_is_metric: false`, `stickout: 2.6`):

```
mmTool:
  diameter:       toMillimeters(0.5,  false) = 0.5  * 25.4 = 12.7
  cutting_depth:  toMillimeters(1.25, false) = 1.25 * 25.4 = 31.75
  total_length:   toMillimeters(4.0,  false) = 4.0  * 25.4 = 101.6
  arbor_diameter: toMillimeters(0.5,  false) = 0.5  * 25.4 = 12.7

holderProfile (first real point, of 18):
  {x: 0.0,    y: 0} → toMillimeters(0.0,    false) = 0.0
  {x: 0.6132, y: 0} → toMillimeters(0.6132, false) = 15.57528

stickout: toMillimeters(2.6, false) = 2.6 * 25.4 = 66.04
```

Every one of these seven real values takes the identical `* 25.4` path
— this specific tool/holder pair happens to agree on `is_metric`, so
nothing here demonstrates the two flags actually diverging, but the
code path that reads `assembly.holder_is_metric` independently of
`tool.is_metric` on every single call is the same regardless of whether
this particular assembly's two flags happen to match.
`ToolDimensions` (`toolAssembly.ts`) deliberately does **not** carry
`is_metric` itself — `buildToolProfile` never needs it, only this
conversion step does, so a separate `FetchedTool = ToolDimensions & {
is_metric: boolean }` type carries it instead, on the raw fetched shape
only (a real design correction made while writing this exact code —
first attempt put `is_metric` directly on `ToolDimensions`, which broke
every existing `toolAssembly.test.ts` case by forcing an unrelated field
onto a type that never needed it).

### CS Lens / SE Lens

Not repeated — fully covered by `unit-conversion-before-combining-
values.md`. This project's own concrete cost of getting it wrong: not a
crash, not an error — a feature that looked, at first glance, entirely
broken ("tiny," easy to mistake for a positioning bug) when the real
geometry and real position were both already correct the whole time.

### Commands

```
npx tsc --noEmit
npx vitest run
```

### Run It

```pycon
>>> toMillimeters(10, True)
10
>>> toMillimeters(0.5, False)
12.7
```

Real, confirmed via two new `toolAssembly.test.ts` cases, and live in
the browser: the same tool that previously rendered "tiny" now renders
at its real, correct size relative to the toolpath.

---

## Connect the Pieces

One real chain, start to finish: `core/path.py`'s `compute_steps` now
carries the parser's own already-tracked `active_t` forward into every
step snapshot; `get_tool_assembly_by_number` resolves that real number
to a specific real tool and its real assembly (the same honest
"first match" limitation already established); `viewport.ts`'s new
`setTool` reuses Lesson 48's `buildToolProfile`/`revolveProfile`
completely unchanged, correctly oriented (a real, different rotation
sign than the modal's own, for a real, different reason); `App.tsx`
wires the whole thing together, refetching only on a genuine tool
change, and — after finding it rendered at the wrong real scale —
converting both tool and holder to a shared, consistent unit before
ever placing them in the same coordinate space as the toolpath. Two
further real bugs, found in the course of testing this feature live,
turned out to be older than this session: a stale tool list that Lesson
46's own real fix had silently caused, and a delete that never told
anyone. All three are now named, fixed, and verified.

## What Breaks Without This

Reverting `toolAssembly.ts`'s `toMillimeters` to a no-op (`return
value`) and viewing any real inch-dimensioned tool during simulation:
the assembly reappears at roughly 1/25th its correct size, exactly the
real, reported "tiny" bug, reproduced directly.

## Exercises

1. Read `concepts/unit-conversion-before-combining-values.md`'s own
   Try-It-Yourself exercise 3 and propose a real, concrete convention
   this project could adopt so a future contributor knows *which* unit
   (mm, per this lesson's own real choice) new 3D-display code should
   always convert into.
2. Trace the rotation-matrix derivation in this lesson's own "One
   Rotation Sign" unit by hand for `θ = 0` and `θ = 180°` — confirm
   which one leaves local `+y` pointing at world `+y` unchanged, and
   which one flips it to world `−y`, and explain why neither would have
   been the right choice for this project's own real Z-up scenes.
3. Find the one other real place in this codebase where a value's real
   unit is tracked but never actually used for conversion (hint:
   `BlockList.tsx`'s own declared-field editing, Lesson 44) and describe
   what a similar live bug would look like there, if it were ever drawn
   to scale against something in a different unit.

## Known Incomplete — Named Directly

- **The tool's own `is_metric` still isn't shown anywhere in the DRO**
  (`active_t` itself isn't displayed either — `MachineStatus.tsx`'s own
  comment names this as a reasonable, small, deferred addition).
- **No G-code-level unit tracking (`G20`/`G21`) exists at all** — the
  "mm" assumption this lesson's own conversion targets is this
  project's own historical convention (its real programs, grid, and
  camera setup), not a value read from the program itself. A real
  program explicitly in inches would still be assumed mm-scale for
  toolpath purposes, a real, pre-existing limitation this lesson didn't
  introduce or fix.
- **Only the direct one-tool/one-holder case renders**, matching every
  prior lesson's own named scope cut for `TlAssembly.MainTool`/
  `MainHolder`.

## Definition of Done

- [x] `core/path.py`: `active_t` on every step, verified directly.
- [x] `core/tools.py`/`app.py`: `get_tool_assembly_by_number` +
      `GET /api/tools/by-number/<n>/assembly`, verified directly.
- [x] `viewport.ts`: `setTool`, reusing `toolAssembly.ts` unchanged,
      correctly oriented relative to the real toolpath.
- [x] `Viewport.tsx`/`App.tsx`: wired end-to-end, refetching only on a
      real tool-number change.
- [x] Three real, live bugs found and fixed: the stale `BlockList`
      tools list, the silent delete, and the inch/mm scale bug.
- [x] One new, project-independent concept file
      (`unit-conversion-before-combining-values.md`).
- [x] `npx tsc --noEmit` clean.
- [x] `npx vitest run` — 10/10 passing (2 new `toMillimeters` cases).
- [x] `npx vite build` — succeeds.
- [x] Confirmed live in the browser, including the scale fix.

```
git commit -m "Lesson 49: the fix that was really a unit"
```
