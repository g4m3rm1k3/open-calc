# Lesson 44: A Resolved Value Doesn't Know Where It Came From

**What you will build:** the Operations tab's declared blocks (Plane,
WCS, Rotation, Coolant, Tool, SFM) become editable — selects for the
small, closed sets of real machine values, a back-solving input for
SFM — plus independently-collapsible movement-table runs and I/J/K
(arc center) columns the table always round-tripped but never actually
showed. No reference counterpart. The transferable problem underneath
it: a resolved, carried-forward value (Lesson 41's own "declared"
snapshot) tells you *what* is currently true, but not *which specific
line made it true* — and editing requires the second question, not
just the first.

**What you need to know first:** Lesson 41's declared-block/modal-state
model; Lesson 43's `serializeLine`/`applyWordEdit`/`useRef` machinery;
Lesson 18's controlled checkbox; `sticky-state-modal-behavior.md`.

---

## Concept Unit: A Resolved Value Doesn't Know Where It Came From

### The Problem

Lesson 41's `declared` snapshot is the real, resolved modal state as of
one specific line. Editing "Plane" needs to change the *word* that set
the plane — but that word isn't necessarily on `declared`'s own line at
all. A real operation commonly looks like `G21 G90 G17` / `T1 M06 G43
H1` / `S1800 M03 M08` / *(movement starts)* — `declared` is the third
line (right before movement), but the actual `G17` lives on the
*first* line. Writing a changed plane value onto `declared`'s own line
would create a second, conflicting G-word while leaving the real one
untouched.

### Introduce the Concept in Isolation

First appearance of this exact problem in this project — full
standalone treatment: `concepts/attributing-resolved-state-to-its-
origin-event.md`. Read that first; its own isolated example (finding
which line of a sequence actually set a sticky "bold" flag, by
searching backward, not just reading the resolved value) is exactly
this project's own Plane/WCS/Rotation/Coolant problem, generalized.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx`, modified.
- **Change type** — add.
- **Location** — new module-level function, placed after `applyGroupEdit`
  (next unit).
- **Dependencies** — none beyond `Command`.

### The New Code

```ts
function findSourceCommand(
  commands: Command[],
  uptoIndex: number,
  hasWord: (words: Command["words"]) => boolean,
  fallback: Command,
): Command {
  for (let i = uptoIndex; i >= 0; i--) {
    if (hasWord(commands[i].words)) return commands[i];
  }
  return fallback;
}
```

### The Updated Project

```ts
const declaredIndex = commands.indexOf(declared);
const planeSource = findSourceCommand(commands, declaredIndex, hasPlaneWord, declared);
const wcsSource = findSourceCommand(commands, declaredIndex, hasWcsWord, declared);
const rotationSource = findSourceCommand(commands, declaredIndex, hasRotationWord, declared);
const coolantSource = findSourceCommand(commands, declaredIndex, hasCoolantWord, declared);
const sfmSource = findSourceCommand(commands, declaredIndex, (w) => "S" in w, declared);
```

Five separate searches, one per editable declared field — each walks
backward from `declared`'s own position looking for the real line that
last set *that specific* word, falling back to `declared` itself only
when nothing in the operation ever did (an inherited default from
before this operation began).

### Mechanical Walkthrough

- `for (let i = uptoIndex; i >= 0; i--)` — **reappearing** `for` loop
  (already established), counting *downward* — the direction is the
  entire point: the most recent match found this way is the real
  origin, not the first one in the array.
- `commands.indexOf(declared)` — **reappearing** `Array.prototype.
  indexOf` (already used elsewhere); works here because `declared` is a
  real reference to one specific element already inside `commands`, not
  a copy.
- `hasWord(commands[i].words)` — calling one of the already-established
  `hasPlaneWord`/`hasWcsWord`/etc. predicates (Lesson 41) against each
  earlier command in turn.

### CS Lens / SE Lens

Not repeated here — both given full treatment in `concepts/attributing-
resolved-state-to-its-origin-event.md`. This unit is that concept's
first real application: five separate origin-searches, one per
editable field, each cheap (an operation is a handful of lines, not a
large search space) — the real cost this technique accepts (an O(n)
backward walk instead of an O(1) read of the resolved value) is
negligible at this scale.

### Commands

None new.

### Run It

```pycon
# No Python analog runnable standalone -- verified as part of this
# lesson's own Connect the Pieces, against the real backend parser.
```

---

## Concept Unit: Editing Part of a Combined Word Without Erasing the Rest

### The Problem

A real G-code line's `M`-word can carry two, unrelated, simultaneous
meanings at once — `M3 M8` is spindle-CW *and* flood-coolant-on, on the
same line, in the same array. Editing Rotation to `M4` (CCW) must not
silently delete the coexisting `M8` — but Lesson 43's own `applyWordEdit`
replaces a whole word unconditionally, which would do exactly that.

### Introduce the Concept in Isolation

First appearance of this exact problem — full standalone treatment:
`concepts/partition-and-replace-within-a-combined-field.md`. Read that
first; its own isolated example (a combined color+size "codes" list,
naively overwritten and silently losing the size) is precisely this
project's own M-word problem.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx`, modified.
- **Change type** — add.
- **Location** — new function, alongside `applyWordEdit` (Lesson 43).
- **Dependencies** — `serializeLine` (Lesson 43).

### The New Code

```ts
function applyGroupEdit(
  program: string,
  command: Command,
  letter: string,
  inGroup: (value: number) => boolean,
  newValues: number[],
): string {
  const existing = command.words[letter];
  const values = existing == null ? [] : Array.isArray(existing) ? existing : [existing];
  const kept = values.filter((v) => !inGroup(v));
  const next = [...kept, ...newValues];
  const newWords: Command["words"] = { ...command.words };
  if (next.length === 0) {
    delete newWords[letter];
  } else {
    newWords[letter] = next.length === 1 ? next[0] : next;
  }
  const lines = program.split("\n");
  lines[command.line_number - 1] = serializeLine(command, newWords);
  return lines.join("\n");
}
```

### The Updated Project

```ts
type EditGroupFn = (
  command: Command,
  letter: string,
  inGroup: (v: number) => boolean,
  newValues: number[],
) => void;
```

```ts
function handleEditGroup(
  command: Command,
  letter: string,
  inGroup: (v: number) => boolean,
  newValues: number[],
) {
  const updated = applyGroupEdit(latestProgramRef.current, command, letter, inGroup, newValues);
  latestProgramRef.current = updated;
  onProgramChange(updated);
}
```

`handleEditGroup` (inside `BlockList`, alongside Lesson 43's own
`handleEditWord`) is `applyGroupEdit`'s real caller — same shape as
`handleEditWord`: read the latest known-good text from
`latestProgramRef` (Lesson 43), apply the edit, write the result back
into the ref *and* up to `App.tsx` in one call. `EditGroupFn` names
that same callback's shape once, as its own type, so
`OperationBlockProps` (below) doesn't have to repeat the full function
signature inline.

### Mechanical Walkthrough

- `existing == null ? [] : Array.isArray(existing) ? existing :
  [existing]` — **reappearing** normalize-to-array idiom (Lesson 41's
  own `mValues`/`gValues`).
- `values.filter((v) => !inGroup(v))` — the actual fix, per `concepts/
  partition-and-replace-within-a-combined-field.md`: keeps every value
  that does *not* belong to the semantic group being replaced.
- `[...kept, ...newValues]` — **reappearing** array spread (Lesson 43);
  appends the real replacement value(s) onto whatever survived
  filtering.
- The rest — `delete`, conditional single-vs-array assignment, line
  splicing — is **reappearing**, identical to `applyWordEdit`'s own
  shape (Lesson 43).

### CS Lens / SE Lens

Not repeated — both given full treatment in the concept file. This
project's own concrete stakes for getting the `inGroup` test wrong: an
`isRotationCode` that also accidentally matched `8` would silently
delete a real, active coolant setting the instant someone changed
spindle direction — a genuinely dangerous, silent machine-behavior
change, not a cosmetic bug.

### Commands

None new.

### Run It

```pycon
>>> from core.parser import Parser
>>> program = "G21 G90 G17\nT1 M06 G43 H1\nS1800 M03 M08\nG00 X0 Y0 Z5.\nM09 M05"
>>> commands = Parser().parse(program)
>>> target = next(c for c in commands if c["words"].get("M") == [3.0, 8.0])
>>> target["line_number"]
3
```

(Full round-trip, mirroring `applyGroupEdit` exactly, shown in Connect
the Pieces.)

---

## Concept Unit: Five Selects for Five Real, Closed Sets of Values

### The Problem

Plane, WCS, Rotation, and Coolant each have a real, small, fixed set of
valid machine values — free text invites a value no real machine could
ever act on.

### Introduce the Concept in Isolation

First appearance of the HTML `<select>` element in this project — full
standalone treatment: `concepts/html-select-element.md`.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx`, modified
  (`InfoBlock`, replaced for these four fields by a new
  `EditableInfoBlock`).
- **Change type** — add.
- **Location** — directly after `InfoBlock`.
- **Dependencies** — `applyGroupEdit` (previous unit).

### The New Code

```ts
const PLANE_OPTIONS = [
  { value: "17", label: "G17 (XY)" },
  { value: "18", label: "G18 (XZ)" },
  { value: "19", label: "G19 (YZ)" },
];
const isPlaneCode = (v: number) => v === 17 || v === 18 || v === 19;
```

The same shape repeats three more times:

```ts
const WCS_OPTIONS = [54, 55, 56, 57, 58, 59].map((n) => ({ value: String(n), label: `G${n}` }));
const isWcsCode = (v: number) => v >= 54 && v <= 59;

const ROTATION_OPTIONS = [
  { value: "3", label: "CW" },
  { value: "4", label: "CCW" },
  { value: "5", label: "Stopped" },
];
const isRotationCode = (v: number) => v === 3 || v === 4 || v === 5;
```

— Coolant's own options list is the one genuinely different case:

```ts
const COOLANT_OPTIONS = [
  { value: "9", label: "Off" },
  { value: "8", label: "Flood" },
  { value: "7", label: "Mist" },
  { value: "7,8", label: "Flood + Mist" },
];
const isCoolantCode = (v: number) => v === 7 || v === 8 || v === 9;
```

Each option's `value` is a string (the select element's own real
constraint, `concepts/html-select-element.md`) that may itself encode
more than one real number, comma-joined — matched to the same
comma-split convention `parseWordInput` (Lesson 43) already established
for display. Four small functions turn this project's own real,
resolved state into the matching option string:

```ts
function planeSelectValue(plane: string): string {
  return plane.replace("G", "");
}

function wcsSelectValue(wcs: string): string {
  return wcs.replace("G", "");
}

function rotationSelectValue(dir: string): string {
  if (dir === "CW") return "3";
  if (dir === "CCW") return "4";
  return "5";
}

function coolantSelectValue(command: Command): string {
  if (command.coolant_flood && command.coolant_mist) return "7,8";
  if (command.coolant_flood) return "8";
  if (command.coolant_mist) return "7";
  return "9";
}
```

`String.prototype.replace` — **reappearing** (ordinary string method,
already established) — `"G17".replace("G", "")` strips the letter,
leaving the bare number `"17"` that matches `PLANE_OPTIONS`' own
`value` strings exactly.

### The Updated Project

```tsx
function EditableInfoBlock({
  kind,
  label,
  letter,
  inGroup,
  options,
  currentValue,
  command,
  onEditGroup,
}: {
  kind: string;
  label: string;
  letter: string;
  inGroup: (value: number) => boolean;
  options: { value: string; label: string }[];
  currentValue: string;
  command: Command;
  onEditGroup: (command: Command, letter: string, inGroup: (v: number) => boolean, newValues: number[]) => void;
}) {
  return (
    <div className={`block-info block-info-${kind}`}>
      <span className="block-info-label">
        {INFO_ICONS[kind] || <Settings size={12} />}
        {label}
      </span>
      <select
        className="block-info-select"
        value={currentValue}
        onChange={(e) => {
          const newValues = e.target.value.split(",").map(Number);
          onEditGroup(command, letter, inGroup, newValues);
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
```

`EditableInfoBlock` is `InfoBlock` (Lesson 42)'s own shell — same icon,
same label — with the static value `<span>` replaced by a real
`<select>`.

The real CSS behind `.block-info-select` — shared with `.block-info-input`
(the next unit's own subject), since both are real, editable-value
controls that should look and behave identically except for their real,
distinct cursor and width:

```css
.block-info-select,
.block-info-input {
  box-sizing: border-box;
  color: var(--color-text);
  font-family: "JetBrains Mono", monospace;
  background: color-mix(in srgb, var(--color-bg) 95%, transparent);
  border: 1px solid var(--color-border-strong);
  border-top-color: var(--color-border);
  border-radius: 4px;
  padding: 3px 10px;
  font-size: 11px;
  letter-spacing: 0.5px;
  min-width: 80px;
  cursor: pointer;
}
.block-info-select:hover,
.block-info-input:hover {
  border-color: var(--color-accent-blue);
}
.block-info-select:focus,
.block-info-input:focus {
  outline: none;
  border-color: var(--color-accent-blue);
  box-shadow: 0 0 0 1px var(--color-accent-blue);
}
```

Every selector here is already-established syntax — comma-separated
rules, `:hover`/`:focus` (Lesson 41/43), `box-sizing: border-box`
(introduced properly a few units ahead, in "The Overflow Was a Box-Model
Bug"). `box-shadow: 0 0 0 1px ...` on `:focus` is a real, deliberate
alternative to `outline` for the focus ring itself: a box-shadow
respects `border-radius` (wrapping the element's own rounded corners),
where the browser's default `outline` would draw a plain rectangle
regardless of how rounded the element underneath it is.

### Mechanical Walkthrough

- `"7,8".split(",").map(Number)` — **reappearing** (Lesson 43's own
  `parseWordInput` does the identical split/convert) — the *reason*
  it's needed here is new: "Flood + Mist" is the one option whose
  `value` string encodes *two* real numbers at once (`M7` and `M8`
  together), not one — `applyGroupEdit`'s own `newValues: number[]`
  parameter is what makes writing both in one edit possible.
- `value={currentValue}` / `onChange={...}` on a `<select>` — **first
  appearance of `<select>` itself** (see the concept file), but the
  *controlled-element* mechanism (React owns the displayed value,
  `onChange` is the only path to change it) is **reappearing** — the
  same idea Lesson 18's checkbox and Lesson 43's `EditableCell` already
  established, a third HTML element using the identical pattern.
- Unlike `EditableCell` (Lesson 43), `EditableInfoBlock` has **no local
  state** — `value={currentValue}` reads directly from the prop, every
  render, exactly like Lesson 18's checkbox. This is a deliberate,
  correct difference, not an inconsistency: a `<select>` only changes on
  a discrete, deliberate choice, never mid-keystroke, so there's no
  "fighting the user's typing" problem a debounce-lagged prop would
  otherwise cause for a text input.

### CS Lens / SE Lens

Not repeated — covered in `concepts/html-select-element.md`.

### Commands

None new.

### Run It

Not independently runnable outside a browser; not verified live this
session (Known Incomplete).

---

## Concept Unit: A Tool Change Writes Two Words at Once

### The Problem

Choosing a different tool means writing both `T` and `H` (matching this
project's own real fixture convention, `core/tools.py`'s own citation)
— and a real bug was caught, this session, before shipping: writing them
as two sequential calls to `applyWordEdit` silently reverts the first.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx` (`BlockList`'s
  `handleEditTool`, new `EditableToolInfoBlock`).
- **Change type** — add.
- **Location** — alongside `handleEditWord`/`handleEditGroup`.
- **Dependencies** — `serializeLine` (Lesson 43).

### The New Code

The select itself, choosing among every fetched tool:

```tsx
function EditableToolInfoBlock({
  tool,
  tools,
  command,
  onEditTool,
}: {
  tool: Tool;
  tools: Tool[];
  command: Command;
  onEditTool: (command: Command, toolNumber: number) => void;
}) {
  return (
    <div className="block-info block-info-tool">
      <span className="block-info-label">
        {INFO_ICONS.tool}
        Tool
      </span>
      <select
        className="block-info-select"
        value={String(tool.tool_number)}
        onChange={(e) => onEditTool(command, Number(e.target.value))}
      >
        {tools.map((t) => (
          <option key={t.id} value={t.tool_number}>
            {`T${t.tool_number} — ${t.diameter}${t.is_metric ? "mm" : "in"} dia, ${t.flute_count}fl`}
          </option>
        ))}
      </select>
    </div>
  );
}
```

The write-back it calls:

```ts
function handleEditTool(command: Command, toolNumber: number) {
  const newWords: Command["words"] = { ...command.words, T: toolNumber, H: toolNumber };
  const lines = latestProgramRef.current.split("\n");
  lines[command.line_number - 1] = serializeLine(command, newWords);
  const updated = lines.join("\n");
  latestProgramRef.current = updated;
  onProgramChange(updated);
}
```

### Mechanical Walkthrough

The bug this replaced, named directly rather than silently absorbed:
calling `applyWordEdit(ref, command, "T", ...)` then `applyWordEdit(ref,
command, "H", ...)` — each call reads `command.words` **fresh, from the
original, un-edited command object** — so the second call rebuilds its
`newWords` from the *pre-T-edit* words, silently reverting the `T` the
first call just wrote the moment the second call's own serialization
ran. The fix builds **one combined `newWords`** with both `T` and `H`
set at once, serializing the line exactly once. `{ ...command.words, T:
toolNumber, H: toolNumber }` — **reappearing** object spread (Lesson
43) with two keys overridden at once, rather than one.

### CS Lens

A real, small instance of a much more general class of bug: **read-
modify-write operations that don't compose** when applied sequentially
against a *stale* read rather than the latest state. The same shape of
bug recurs in database updates without transactions (two `UPDATE`
statements each reading the row fresh, the second overwriting the
first's change to an unrelated column) and in any UI state update that
reads `this.state` instead of using a functional updater.

### SE Lens

This was caught by re-deriving the two-call version, noticing it read
`command.words` twice from the same stale reference, and fixing it
*before* running anything — the same discipline Lesson 43's own
skip-flag fix and this lesson's own coolant-array test exist to model:
find the composition bug by reasoning about the code, not by shipping
it and waiting for a report.

### Commands

None new.

### Run It

```pycon
>>> # See Connect the Pieces for the full T+H round-trip trace.
```

---

## Concept Unit: SFM, Solved in Reverse

### The Problem

SFM isn't a real G-code word — it's `computeSfm` (Lesson 41), derived
from the tool's diameter and the program's spindle RPM. Editing SFM
means running that formula backward: given a target surface speed, find
the RPM that would produce it, and write *that*.

### Project Change

- **Reference Source** — none; standard machinist algebra, not sourced
  from any file in this repo.
- **Files affected** — `cnc-web/src/BlockList.tsx`, modified.
- **Change type** — add (`EditableSfmInfoBlock`).
- **Location** — alongside `EditableToolInfoBlock`.
- **Dependencies** — `computeSfm` (Lesson 41), `onEditWord` (Lesson 43).

### The New Code

```ts
const diameterInches = tool.is_metric ? tool.diameter / 25.4 : tool.diameter;
const rpm = (typedSfm * 12) / (Math.PI * diameterInches);
onEditWord(command, "S", String(Math.round(rpm)));
```

### The Updated Project

```tsx
function EditableSfmInfoBlock({
  tool,
  sfm,
  command,
  onEditWord,
}: {
  tool: Tool;
  sfm: number;
  command: Command;
  onEditWord: (command: Command, letter: string, value: string) => void;
}) {
  const [text, setText] = useState(sfm.toFixed(1));
  return (
    <div className="block-info block-info-sfm">
      <span className="block-info-label">
        {INFO_ICONS.sfm}
        SFM
      </span>
      <input
        className="block-info-input"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          const typedSfm = Number(e.target.value);
          if (Number.isNaN(typedSfm)) return;
          const diameterInches = tool.is_metric ? tool.diameter / 25.4 : tool.diameter;
          const rpm = (typedSfm * 12) / (Math.PI * diameterInches);
          onEditWord(command, "S", String(Math.round(rpm)));
        }}
      />
    </div>
  );
}
```

`.block-info-input`'s own real override, on top of the shared rule
already shown in the previous unit — a text input needs a text cursor
and a narrower width than a `<select>`'s own dropdown affordance needs:

```css
.block-info-input {
  cursor: text;
  width: 70px;
}
```

### Mechanical Walkthrough

`(typedSfm * 12) / (Math.PI * diameterInches)` is `computeSfm`'s own
formula (`sfm = π × diameter × rpm / 12`) solved for `rpm` instead of
`sfm` — ordinary algebra, not a new construct. `Number.isNaN(typedSfm)`
gate — **reappearing** (Lesson 43's own `parseWordInput` uses the
identical guard) — a not-yet-finished number while typing doesn't write
a bogus `S` word. The local `text` state, seeded once and not resynced
— **reappearing**, the exact same tradeoff `EditableCell` (Lesson 43)
already accepts, for the identical reason (a debounce-lagged `sfm` prop
shouldn't fight the user's typing).

### CS Lens

Not a hard CS concept — real domain algebra (invert a known formula for
a different variable), not a CS idea.

### SE Lens

The real, deliberate scope cut named directly: CPT (chip load per
tooth) is *not* made editable alongside SFM, even though both live in
the same declared block. CPT is a property on the tool's own database
record (`core/tools.py`'s `ChipLoadPerTooth`) — shared across every
operation that happens to use that tool — not G-code text at all.
Editing it here would need a real, different write path (`PATCH /api/
tools/{id}`) and would silently change every *other* operation using
the same tool, a real, much wider blast radius than one line of one
operation. Left read-only, named directly in the code, rather than
built halfway.

### Commands

None new.

### Run It

```pycon
>>> import math
>>> diameter_inches = 0.5
>>> target_sfm = 300
>>> rpm = (target_sfm * 12) / (math.pi * diameter_inches)
>>> round(rpm)
2292
```

Real output, confirmed this session — matches this unit's own formula
exactly.

---

## Concept Unit: A Run Collapses on Its Own Now

### The Problem

Lesson 41's movement table had exactly one collapse toggle — the whole
operation. The standing design note behind this feature ("gcode
table... anything nested can collapse") was never actually built for
the table itself.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx` (new
  `MoveTableRun`, replacing the bare `<table>` `OperationBlock` used to
  render directly for each "table" run).
- **Change type** — add.
- **Location** — directly after `MoveTableRow`.
- **Dependencies** — none beyond `useState` (already established).

### The New Code

```tsx
function MoveTableRun({
  commands,
  onEditWord,
}: {
  commands: Command[];
  onEditWord: (command: Command, letter: string, value: string) => void;
}) {
  const [expanded, setExpanded] = useState(true);
  return (
    <div className="block-move-run">
      <button type="button" className="block-move-run-header" onClick={() => setExpanded((e) => !e)}>
        <span className="block-row-toggle">{expanded ? "▾" : "▸"}</span>
        <span className="block-move-run-label">
          {commands.length} move{commands.length === 1 ? "" : "s"}
        </span>
      </button>
      {expanded && (
        <table className="block-move-table block-move-table-run">
          <MoveTableHead />
          <tbody>
            {commands.map((c) => (
              <MoveTableRow key={c.seq_n} command={c} onEditWord={onEditWord} />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

The real CSS behind `MoveTableRun`'s own three new class names:

```css
.block-move-run {
  margin-bottom: 2px;
}
.block-move-run-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 3px 8px 3px 12px;
  background: none;
  border: none;
  color: var(--color-muted);
  font: inherit;
  font-size: 10px;
  text-align: left;
  cursor: pointer;
}
.block-move-run-header:hover {
  background: var(--color-panel);
}
.block-move-run-label {
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

All already-established selector syntax — plain classes and one
`:hover`, the same real pattern `.block-program-header`/`.block-row-header`
(Lesson 41) already use for an identical "collapsible header, shaded on
hover" shape, one level deeper in the tree.

### Mechanical Walkthrough

Every construct here is **reappearing** — `useState` toggle, conditional
`{expanded && (...)}` rendering, a `▾`/`▸` button — the identical shape
`OperationBlock`'s own collapse (Lesson 41) and `BlockList`'s program
collapse already use. The only real new content: `{commands.length}
move{commands.length === 1 ? "" : "s"}` — a plain, correct singular/
plural label, ordinary conditional string building, no new construct.

### CS Lens / SE Lens

Not repeated — plain reuse of an already-analyzed pattern (Lesson 41),
applied one level deeper in the same tree.

### Commands

None new.

### Run It

Not independently runnable outside a browser; not verified live this
session (Known Incomplete).

---

## Concept Unit: Columns the Table Round-Tripped But Never Showed

### The Problem

`I`/`J`/`K` (arc center offsets, `G2`/`G3`) were always in `WORD_ORDER`
(Lesson 43) — editing an unrelated field on an arc line already
preserved them correctly — but the table never gave them their own
column, so they were never visible or directly editable.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx`
  (`MoveTableHead`/`MoveTableRow`), `cnc-web/src/theme.css`.
- **Change type** — add.
- **Location** — between the `Z` and `M` columns, matching
  `WORD_ORDER`'s own sequence.
- **Dependencies** — `EditableCell` (Lesson 43), `fmtWord` (Lesson 41).

### The New Code

```tsx
<td className="block-move-col-ijk">
  <EditableCell value={fmtWord(command.words.I)} onCommit={(v) => onEditWord(command, "I", v)} />
</td>
```

(`J`/`K` are the identical shape, repeated twice more.)

### Mechanical Walkthrough

Every line is **reappearing** — `EditableCell`/`fmtWord`/`onEditWord`
are exactly Lesson 43's own machinery, applied to three more letters.
No new construct; the only real content is that these three columns
existed as real, round-tripped data (Lesson 43's own `WORD_ORDER`
already covered them) well before they had anywhere to actually be seen
or touched.

### CS Lens / SE Lens

Not repeated — no new tradeoff; a real, previously-incomplete surface
now matches the data that already existed underneath it.

### Commands

None new.

### Run It

```pycon
>>> from core.parser import Parser
>>> with open("O0003.nc") as f:
...     program = f.read()
>>> commands = Parser().parse(program)
>>> arc = next(c for c in commands if c.get("i") is not None)
>>> arc["line_number"], arc["raw"], arc["i"], arc["j"]
(9, 'G02 I-15. J0. F200', -15.0, 0.0)
```

Real output, confirmed this session — `O0003.nc`'s own real arc line,
now a visible, editable row instead of one whose `I`/`J` data existed
but was never shown.

---

## Concept Unit: The Overflow Was a Box-Model Bug, Not a Layout Bug

### The Problem

The movement table's input cells were visibly pushing the whole panel
wider than it should be, and the same logical column rendered at
different widths across different runs.

### Introduce the Concept in Isolation

Two first appearances in this project, each with full standalone
treatment: `concepts/css-box-sizing-content-box-vs-border-box.md` (the
actual overflow's root cause) and `concepts/css-table-layout-fixed-vs-
auto.md` (the cross-run misalignment's root cause). Read both first.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/theme.css`
  (`.block-move-input`, `.block-move-table`, new `.block-move-col-*`
  classes).
- **Change type** — add/replace.
- **Location** — the existing rules Lesson 41/43 already added.
- **Dependencies** — none.

### The New Code

```css
.block-move-input {
  box-sizing: border-box;                        /* ← new */
}
```

```css
.block-move-table {
  table-layout: fixed;                            /* ← new */
}
```

### The Updated Project

The complete, real rules — every property, none elided, since the
previous unit's "New Code" is only the two new lines added to structures
that already existed since Lesson 41/43:

```css
.block-move-input {
  box-sizing: border-box;               /* ← new */
  width: 100%;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  color: inherit;
  font: inherit;
  font-size: inherit;                   /* ← new */
  padding: 1px 4px;
}
.block-move-input:hover {
  border-color: var(--color-border);
}
.block-move-input:focus {
  outline: none;
  border-color: var(--color-accent-blue);
  background: var(--color-bg);
}
```

```css
.block-move-table {
  width: 100%;
  table-layout: fixed;                  /* ← new */
  border-collapse: collapse;
  font-family: "JetBrains Mono", monospace;
  background: color-mix(in srgb, var(--color-bg) 80%, transparent);
}
.block-move-table-run {
  border-bottom: 1px solid var(--color-border);
}
.block-move-table th {
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.5px;
  color: var(--color-muted);
  text-align: left;
  padding: 6px 6px;                     /* ← changed, was 6px 12px */
  border-bottom: 1px solid var(--color-border-strong);
  position: sticky;
  top: 0;
  background: var(--color-bg);
  z-index: 1;
  overflow: hidden;                     /* ← new */
  text-overflow: ellipsis;              /* ← new */
}
.block-move-table td {
  padding: 4px 6px;                     /* ← changed, was 4px 12px */
  color: var(--color-text);
  white-space: nowrap;
  font-size: 11px;
  overflow: hidden;                     /* ← new */
}
.block-move-table td.block-move-linenum {
  color: var(--color-muted);
  width: 28px;
  border-right: 1px solid var(--color-border);
}
.block-move-col-g {
  width: 9%;
}
.block-move-col-xyz {
  width: 11%;
}
.block-move-col-ijk {
  width: 9%;
}
.block-move-col-m {
  width: 8%;
}
.block-move-col-fs {
  width: 7%;
}
```

Each column class is applied to both the `<th>` (`MoveTableHead`) and
every `<td>` in that position (`MoveTableRow`) — with `table-layout:
fixed`, these declared widths are now the *only* input to column
sizing, identical across every separate `<table>` instance a run
renders. The header/cell padding shrank (`12px` → `6px`) to make real
room for the newly-visible I/J/K columns without widening the panel;
`overflow: hidden`/`text-overflow: ellipsis` on both is what lets a
value that's still too long for its now-narrower column truncate
cleanly with `…` instead of overflowing into its neighbor.

### Mechanical Walkthrough

Both properties are fully covered in their own concept files above —
this unit's own content is the diagnosis, not new syntax: `width: 100%`
without `box-sizing: border-box` let each input's own `padding`/`border`
add on top of 100%, overflowing its cell; `table-layout`'s default
(`auto`) measures each `<table>` independently, so the same logical
column could size differently across the several separate `<table>`
elements this feature renders (one per movement run).

### CS Lens

Not repeated — covered in the two concept files.

### SE Lens

The real, combined lesson: two *independent* root causes were both
contributing to what looked like one visual bug ("too wide, and
misaligned") — fixing only one (say, `box-sizing` alone) would have
stopped the overflow but left cross-run misalignment unexplained, since
`table-layout: auto` alone can misalign identical-looking tables even
with no overflowing content at all. Diagnosing both separately, rather
than reaching for the first plausible fix, is what actually closed the
report.

### Commands

None new.

### Run It

Not independently runnable outside a browser; the fix's correctness
rests on the CSS box model itself (fully demonstrated in both concept
files' own isolated examples), not on anything this project's own code
executes.

---

## Connect the Pieces

One real edit, start to finish, verified directly this session against
the real backend parser:

```pycon
>>> from core.parser import Parser
>>> program = "G21 G90 G17\nT1 M06 G43 H1\nS1800 M03 M08\nG00 X0 Y0 Z5.\nM09 M05"
>>> commands = Parser().parse(program)
>>> target = next(c for c in commands if c["words"].get("M") == [3.0, 8.0])
>>> target["line_number"]
3
```

Changing Rotation from CW to CCW on this line (`isRotationCode` matches
`3`, keeps `8`, appends `4`):

```pycon
>>> is_rotation = lambda v: v in (3, 4, 5)
>>> # applyGroupEdit's own logic, applied by hand:
>>> kept = [v for v in [3.0, 8.0] if not is_rotation(v)]
>>> kept
[8.0]
>>> next_values = kept + [4]
>>> next_values
[8.0, 4]
```

Reparsing a program with that line rebuilt as `"S1800 M8 M4"` confirms
`M = [8.0, 4.0]` — the coolant survives, only rotation changed. The
same `findSourceCommand` search (this lesson's own first unit) is what
would have located *this* line in the first place, had the edit come
from the declared block's own select rather than being targeted by hand
here.

## What Breaks Without This

Reverting `applyGroupEdit` back to a whole-word overwrite (`newWords[
letter] = newValues` unconditionally, no `kept` filter) and repeating
the same rotation edit:

```pycon
>>> # naive: newWords["M"] = [4]  -- no partition, no preservation
>>> # reparsed M would be [4.0] -- coolant (8.0) silently gone
```

The coolant setting vanishes with no error — exactly the regression
this lesson's own second unit exists to have caught before it shipped.

## Exercises

1. Add a sixth real WCS value your machine actually supports (say a
   `G59.1`-style extended offset) to `WCS_OPTIONS`, and trace by hand
   whether `isWcsCode`'s own `v >= 54 && v <= 59` range test would
   correctly classify it — a real, concrete check of whether a
   `inGroup` predicate actually matches its own option list.
2. Simulate editing Tool on a line where `H` is *absent* (only `T` was
   ever on that line) — trace `handleEditTool`'s own `{ ...command.
   words, T: toolNumber, H: toolNumber }` and confirm it *adds* a new
   `H` word rather than requiring one to already exist.
3. Find the one place in `EditableSfmInfoBlock` where a non-numeric
   typed value is silently ignored rather than written — explain, in
   your own words, why silently ignoring it (instead of writing `NaN`
   into the source, or throwing) is the correct choice here.

## Known Incomplete — Named Directly

- **Not verified in a live browser this session** — every "Run It"
  above is a direct, non-browser check against the real backend parser
  or hand-traced logic. The actual interactive behavior (selects
  rendering, focus, the collapsible run's own animation-free toggle)
  has not been exercised.
- **CPT remains read-only**, by explicit, named design — see the SFM
  unit's own SE Lens.
- **Coolant's real option list is hardcoded** (`COOLANT_OPTIONS`), not
  yet driven by a real machine-definition config — named, deferred
  scope (the user's own words: "coolant will eventually be a machine
  configuration").
- **`EditableSfmInfoBlock`'s local state never resyncs from a fresh
  prop**, the same accepted tradeoff `EditableCell` (Lesson 43) already
  named, applied here for the identical reason.

## Definition of Done

- [x] Plane/WCS/Rotation/Coolant/Tool editable via `<select>`; SFM
      editable via back-solved RPM.
- [x] `findSourceCommand` locates the real line to edit, not just
      `declared`'s own line.
- [x] `applyGroupEdit` preserves unrelated values sharing a combined
      G/M word — verified directly (rotation/coolant, plane/units).
- [x] Tool writes T+H in one combined edit — the sequential-call bug
      found and fixed before shipping.
- [x] CPT deliberately left read-only, reason stated directly in code.
- [x] Movement-table runs independently collapsible.
- [x] I/J/K columns added, editable, verified against `O0003.nc`'s real
      arc data.
- [x] CSS overflow/misalignment fixed (`box-sizing: border-box`,
      `table-layout: fixed`, explicit rebalanced column widths).
- [x] Five new, project-independent concept files.
- [x] `npx tsc --noEmit` clean.
- [ ] Live-browser verification — explicitly deferred, named above.

```
git commit -m "Lesson 44: a resolved value doesn't know where it came from"
```
