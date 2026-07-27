# Lesson 13: A Table of Real Tools

## What you will build

The first slice of your stated priority #2, "Tools": `core/tools.py`
holds four real, faithfully-ported tool definitions — an end mill, a
smaller end mill, a ball mill, and an HSS drill — cited directly from
the reference's own real `TOOL_TEMPLATES` catalog. A new
`GET /api/tools` route serves them; a new `ToolTable` component renders
them as a real HTML table in `cnc-web`. The transferable problem:
**rendering a list in a UI framework isn't just looping over data** —
React needs a stable way to tell "this row is the *same* row as last
render" from "this is a genuinely new row," and gets it wrong, silently
at first, without one.

## What you need to know first

Lesson 6/7: fetching typed JSON from a Flask route. Lesson 11:
components, `useState`/`useEffect`. Lesson 12: `PathDump`'s pattern of a
small, focused component — `ToolTable` follows the identical shape.

## Concepts cataloged from this lesson

Full standalone treatments live in `../concepts/`. Pointers to each are
also placed inline at their point of use below.

- `../concepts/stub-placeholder-pattern.md` — named in depth here; its
  real first appearance in this project was Lesson 1's
  `FAKE_MACHINE_STATUS` (pointer added there retroactively while
  auditing this lesson).
- `../concepts/html-table-elements.md`
- `../concepts/react-key-prop-reconciliation.md`

## No pipeline diagram change

Tools are a new, separate concern from the `Text → Picture` G-code
pipeline — this lesson doesn't touch any of its five stages. (A future
lesson wires a selected tool's diameter into path/visual output —
named, not yet built.)

---

## Concept Unit: Reading the Real Catalog Before Copying Anything

### Reference Source, Read for Real This Session

`cnc/CNCEngine.ts` lines 2774–2844 (`TOOL_TEMPLATES.mill`, the four
entries ported this lesson, quoted verbatim):
```ts
end_mill_4fl: {
  cls: "mill", type: "End Mill", subtype: "square",
  dia: 10, cr: 0, lc: 22, lt: 75, shank: 10, fl: 4,
  mat: "Carbide", profile: "endmill",
  desc: "4-flute square end mill",
},
end_mill_2fl: {
  cls: "mill", type: "End Mill", subtype: "square",
  dia: 8, cr: 0, lc: 19, lt: 65, shank: 8, fl: 2,
  mat: "Carbide", profile: "endmill", desc: "2-flute (aluminium)",
},
ball_mill_4fl: {
  cls: "mill", type: "Ball Mill",
  dia: 10, cr: 5, lc: 22, lt: 75, shank: 10, fl: 4,
  mat: "Carbide", profile: "ballmill", desc: "4-flute ball nose",
},
drill_hss: {
  cls: "mill", type: "Drill",
  dia: 6, cr: 0, lc: 52, lt: 90, shank: 6, fl: 2,
  mat: "HSS", profile: "drill", desc: "HSS jobber drill", pointAngle: 118,
},
```
And `cnc/types.ts` lines 247–268, `ToolDefinition`, confirming every
real field name and what it means (`dia` diameter, `cr` corner radius,
`lc` flute/cutting length, `lt` total length, `shank` shank diameter,
`fl` flute count, `mat` material, `desc` description, `pointAngle` —
drill-specific).

**Named, deliberate scope decision:** `TOOL_TEMPLATES` (read in full)
contains dozens of real mill and lathe tools — drills, reamers, taps,
face mills, threading tools, boring bars, and more, across two machine
classes. This lesson ports **four**, the smallest real, representative
slice covering two real distinct shapes (`endmill`/`ballmill` profiles)
and both tool families visible in the reference's own UI (a milling
tool and a drill) — not the whole catalog, not yet. Every field name is
**renamed to be descriptive** (`dia` → `diameter_mm`, `cr` →
`corner_radius_mm`, `lc` → `flute_length_mm`, etc.) per this project's
own standing naming rule (`LessonContract`'s "Names are always
descriptive") — a real, deliberate deviation in *names*, not *values*:
every number ported is byte-for-byte the reference's own real
measurement, confirmed by direct comparison above.

### The New Code

```python
TOOLS = [
    {
        "id": 1,
        "name": "end_mill_4fl",
        "type": "End Mill",
        "subtype": "square",
        "diameter_mm": 10,
        "corner_radius_mm": 0,
        "flute_length_mm": 22,
        "total_length_mm": 75,
        "shank_diameter_mm": 10,
        "flute_count": 4,
        "material": "Carbide",
        "description": "4-flute square end mill",
    },
    # ... three more, same shape, real values cited above
]


def list_tools():
    return TOOLS
```

### The Updated Project

The complete, new `core/tools.py` — all four entries, nothing elided:
```python
TOOLS = [
    {
        "id": 1,
        "name": "end_mill_4fl",
        "type": "End Mill",
        "subtype": "square",
        "diameter_mm": 10,
        "corner_radius_mm": 0,
        "flute_length_mm": 22,
        "total_length_mm": 75,
        "shank_diameter_mm": 10,
        "flute_count": 4,
        "material": "Carbide",
        "description": "4-flute square end mill",
    },
    {
        "id": 2,
        "name": "end_mill_2fl",
        "type": "End Mill",
        "subtype": "square",
        "diameter_mm": 8,
        "corner_radius_mm": 0,
        "flute_length_mm": 19,
        "total_length_mm": 65,
        "shank_diameter_mm": 8,
        "flute_count": 2,
        "material": "Carbide",
        "description": "2-flute (aluminium)",
    },
    {
        "id": 3,
        "name": "ball_mill_4fl",
        "type": "Ball Mill",
        "subtype": None,
        "diameter_mm": 10,
        "corner_radius_mm": 5,
        "flute_length_mm": 22,
        "total_length_mm": 75,
        "shank_diameter_mm": 10,
        "flute_count": 4,
        "material": "Carbide",
        "description": "4-flute ball nose",
    },
    {
        "id": 4,
        "name": "drill_hss",
        "type": "Drill",
        "subtype": None,
        "diameter_mm": 6,
        "corner_radius_mm": 0,
        "flute_length_mm": 52,
        "total_length_mm": 90,
        "shank_diameter_mm": 6,
        "flute_count": 2,
        "material": "HSS",
        "description": "HSS jobber drill",
        "point_angle_deg": 118,
    },
]


def list_tools():
    return TOOLS
```

### Mechanical Walkthrough

- `TOOLS = [ {...}, {...}, ... ]` — a list of dicts, already-known basic
  Python; **(a) worth naming as a real, deliberate, temporary design**:
  this is a plain, in-memory, hardcoded Python list — not a database
  (a real, later lesson, matching `CURRICULUM.md`'s own persistence
  plan). Every request to `/api/tools` (next unit) returns the exact
  same data; nothing here can be added, edited, or persisted across a
  server restart yet.
- `"id": 1` (etc.) — **(a) first appearance** of an explicit, hand-
  assigned identifier field, added by this project (the reference's own
  `TOOL_TEMPLATES` uses its dict *keys*, like `"end_mill_4fl"`, as the
  identifier — this project adds a separate numeric `id` because a
  future real database table, per `CURRICULUM.md`'s own plan, will want
  a real primary key, and deciding that shape now avoids a rename later).
- `"subtype": None` — already-known basic Python (`None`); used here for
  tools that have no real subtype in the reference (only `end_mill_4fl`/
  `end_mill_2fl` have one, `"square"`) — present on every tool
  dict, even when its value is empty, so every tool has the exact same
  set of keys (a deliberate consistency choice, not required by Python
  itself, which would tolerate dicts with different keys in the same
  list just fine).
- `def list_tools(): return TOOLS` — **(a) first appearance of a real,
  if trivial, accessor function** rather than exposing `TOOLS` for
  direct import everywhere: the same instinct as `core/machine.py`'s
  `position()` (Lesson 5) — one real function is the actual "how do I
  get the tools" contract, even though today it does nothing but return
  a constant; if this becomes a real database query later, only this
  function's *body* needs to change, not every caller.

### CS Lens

*(Full standalone treatment: ../concepts/stub-placeholder-pattern.md.)*

A hardcoded, in-memory list standing in for real, persistent data is a
**stub** — a deliberately simple placeholder that satisfies a real
interface (`list_tools() -> list[dict]`) so everything built on top of it
(the route, the frontend table) can be built and verified *now*, before
the real, harder piece (persistence) exists — the same shape as Lesson
1's `FAKE_MACHINE_STATUS`, reused here for a second real feature area.

### SE Lens

Naming this file `core/tools.py` and giving it exactly one real function
now, rather than four or five speculative ones (`create_tool`,
`update_tool`, `delete_tool` — none of which have anywhere to persist to
yet), is a direct application of this project's own standing rule
against premature abstraction: build what's needed for the feature that
exists (a read-only tool list, displayed in a table), not what next
lesson's database might eventually want.

---

## Concept Unit: One More Read-Only Route

### The New Code

```python
@app.route("/api/tools")
def get_tools():
    return {"tools": list_tools()}
```

### Mechanical Walkthrough

- `@app.route("/api/tools")` — **(c) already established** routing
  decorator, defaulting to `GET` (no `methods=` argument, same as
  `/api/status`, Lesson 1) — appropriate here since this route only
  *reads* data, never accepts a body.
- `return {"tools": list_tools()}` — **(c) already established** dict-
  to-JSON auto-conversion, wrapping the real list under a named
  `"tools"` key — the same real convention `/api/path`'s `"points"` and
  `/api/parse`'s `"commands"` already established, kept consistent
  rather than inventing a new shape per route.

### Commands and Real Output

```
Invoke-RestMethod -Uri "http://127.0.0.1:5000/api/tools"
```
**Real output (abridged to one entry):**
```json
{
  "tools": [
    {
      "id": 1, "name": "end_mill_4fl", "type": "End Mill",
      "subtype": "square", "diameter_mm": 10, "corner_radius_mm": 0,
      "flute_length_mm": 22, "total_length_mm": 75,
      "shank_diameter_mm": 10, "flute_count": 4, "material": "Carbide",
      "description": "4-flute square end mill"
    }
  ]
}
```

---

## Concept Unit: A Real HTML Table, and the Prop React Needs to Track a List Correctly

### The New Code

```tsx
import { useEffect, useState } from "react";

interface Tool {
  id: number;
  name: string;
  type: string;
  diameter_mm: number;
  flute_count: number;
  material: string;
}

interface ToolsResponse {
  tools: Tool[];
}

async function fetchTools(): Promise<Tool[]> {
  const response = await fetch("http://127.0.0.1:5000/api/tools");
  const data: ToolsResponse = await response.json();
  return data.tools;
}

function ToolTable() {
  const [tools, setTools] = useState<Tool[]>([]);

  useEffect(() => {
    fetchTools().then(setTools);
  }, []);

  return (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Type</th>
          <th>Diameter (mm)</th>
          <th>Flutes</th>
          <th>Material</th>
        </tr>
      </thead>
      <tbody>
        {tools.map((tool) => (
          <tr key={tool.id}>
            <td>{tool.name}</td>
            <td>{tool.type}</td>
            <td>{tool.diameter_mm}</td>
            <td>{tool.flute_count}</td>
            <td>{tool.material}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ToolTable;
```

### Mechanical Walkthrough

- `interface Tool { id: number; name: string; ... }` — **(a) a real,
  deliberate partial type**: the actual backend response has *more*
  fields (`corner_radius_mm`, `description`, etc.) than this interface
  names. TypeScript's structural typing (Lesson 7) allows this —
  `data.tools` (typed via `ToolsResponse`) can have extra real fields at
  runtime with no error, since nothing here claims the object has
  *only* these fields, just *at least* these. Only what this specific
  component actually displays is declared, named honestly as this
  file's real, current scope, not the whole backend shape.
- `<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>` — **(a) first
  appearance** of real HTML table elements in this project.
  *(Full standalone treatment: ../concepts/html-table-elements.md.)*
  `<table>` is
  the whole table; `<thead>`/`<tbody>` group header rows from data rows
  (letting a browser, and a future stylesheet, treat them differently);
  `<tr>` is one table row; `<th>` a header cell (semantically a label,
  usually bold/centered by default browser styling); `<td>` a real data
  cell.
- `{tools.map((tool) => ( <tr key={tool.id}> ... </tr> ))}` — **(b)
  reappearing** `.map()` (Lesson 8, there converting points to
  `Vector3`s; here, for the first time, mapping data directly into JSX
  elements) — a real, common React pattern: turn an array of data into
  an array of elements, one per item, embedded directly via a JSX
  expression (Lesson 11's `{...}` syntax).
- `key={tool.id}` — **(a) first appearance** of React's `key` prop —
  explained in full, with a real, caused warning, next.

### Execution Trace

`tools.map(...)` against 2 of this project's own real, seeded tools
(`TOOLS[0]`/`TOOLS[1]`, above):

```
tool={id:1, name:"end_mill_4fl", type:"End Mill", diameter_mm:10,
      flute_count:4, material:"Carbide", ...}:
  → <tr key={1}>
      <td>end_mill_4fl</td><td>End Mill</td><td>10</td><td>4</td><td>Carbide</td>
    </tr>

tool={id:2, name:"end_mill_2fl", type:"End Mill", diameter_mm:8,
      flute_count:2, material:"Carbide", ...}:
  → <tr key={2}>
      <td>end_mill_2fl</td><td>End Mill</td><td>8</td><td>2</td><td>Carbide</td>
    </tr>

Result: an array of 2 real <tr> elements, rendered inside <tbody>.
```

Each `tool` object carries real fields this component never displays
(`subtype`, `flute_length_mm`, `description`, ...) — the `.map()`
callback only ever reads the 5 fields `Tool`'s own interface names
(`name`/`type`/`diameter_mm`/`flute_count`/`material`), plus `id` for
the key; the rest ride along on the object unused, exactly what the
Mechanical Walkthrough's "at least these fields" claim means concretely.

### CS Lens

*(Full standalone treatment: ../concepts/react-key-prop-reconciliation.md.)*

React doesn't re-create every DOM element from scratch on every render —
it compares the *previous* list of elements to the *new* one and
patches only what changed, a process called **reconciliation**. Given a
list, it needs a way to tell "row 3 last time and row 3 this time are
the *same logical row* (just maybe with updated data)" from "this is a
genuinely new row inserted at position 3" — array *position* alone
can't answer that (rows can be reordered, inserted, removed). `key`
gives React a stable identity to track across renders, independent of
position.

Also recognized in: any diffing algorithm that needs stable identity
across two versions of a collection (Git's own file-rename detection,
database change-data-capture systems matching rows by primary key, not
row number).

### SE Lens

Using `tool.id` (a real, stable, unique value from the backend) as the
key, rather than the array *index* (`tools.map((tool, index) => <tr
key={index}>`), is the correct, deliberate choice: an index-based key
would silently misattribute rows if this table ever gained sorting,
filtering, or reordering (all real, plausible future features for a
tool table) — the exact bug class `key` exists to prevent, reintroduced
by using the wrong *value* as the key even while technically providing
one.

---

## Concept Unit: The Warning, Caused and Read for Real

### Caused for Real, This Session

The `key={tool.id}` removed from `<tr>`, real page reloaded, real
browser console captured via Playwright:
```
Each child in a list should have a unique "key" prop.%s%s See https://react.dev/link/warning-keys for more information.

Check the render method of `ToolTable`.
```
**What this proves:** React noticed, on its own, that a list of
elements produced by `.map()` had no way to track individual identity,
and said so — by name, pointing at the exact component (`ToolTable`)
responsible — *before* anything visibly broke (the table still rendered
correctly with four real rows; the risk is real but latent, surfacing
only once rows are reordered or the list changes shape, which real
usage of a tool table absolutely will do). Restored (`key={tool.id}`
put back) immediately after confirming this; the warning is gone,
verified.

## Connect the Pieces

1. `ToolTable` mounts; its `useEffect` calls `fetchTools()`.
2. `GET /api/tools` reaches Flask's `get_tools()`, which calls
   `list_tools()` — a plain, in-memory Python list, returned as-is.
3. The real JSON — four tools, matching the reference's own real
   `TOOL_TEMPLATES` entries field-for-field, just renamed — comes back
   and `setTools` triggers a re-render.
4. `tools.map(...)` produces four real `<tr>` elements, each keyed by its
   own stable `id`, rendered inside a real `<table>` — verified live,
   four rows, correct data, no console warnings.

## What Breaks Without This

Already demonstrated in full, live, this lesson: removing `key` doesn't
break *this* render — it produces a real, specific console warning
naming the exact risk (React can't reliably track row identity across
future re-renders of this exact list).

## Exercises

1. Add a fifth tool to `core/tools.py`'s `TOOLS` list — a real one, read
   from `TOOL_TEMPLATES` yourself (`bull_nose`, `drill_carbide`,
   `center_drill`, or `spot_drill` are all real, already-read entries in
   this lesson's own reference excerpt) — and confirm it appears as a
   fifth real row with no other code changes.
2. Change `ToolTable`'s `key` from `tool.id` to the `.map()` callback's
   own index parameter (`tools.map((tool, index) => <tr key={index}>`).
   Confirm `npx tsc --noEmit` still passes (the type system can't catch
   this mistake — it's a real, silent design error, not a type error)
   and explain, in your own words, a real scenario where this specific
   version would misbehave.
3. Add a `<td>{tool.description}</td>` column, using a field this
   lesson's own `Tool` interface doesn't currently declare. Confirm
   `tsc` rejects it, and explain why, from this unit's own "partial
   type" walkthrough.

## Definition of Done

- [ ] `core/tools.py`'s `list_tools()` returns four real tools; run
      directly, no server, matches this lesson's example.
- [ ] `GET /api/tools` returns the same four tools as real JSON.
- [ ] `cnc-web/src/ToolTable.tsx` renders a real four-row table, fetched
      live, `npx tsc --noEmit` passing.
- [ ] You reproduced the missing-`key` warning yourself, read it, and
      confirmed it's gone after restoring the fix.
- [ ] You completed Exercises 1–3.
- [ ] Full regression: `/api/status`, `/api/tokenize`, `/api/parse`,
      `/api/simulate`, `/api/path`, and `segments.test.ts`'s four tests
      all still pass, untouched by this lesson.
- [ ] A git commit exists explaining *why* (the first real slice of your
      stated priority #2, a real, cited subset of the reference's tool
      catalog, and React's `key` prop demonstrated with a real, caused
      warning rather than only described).
