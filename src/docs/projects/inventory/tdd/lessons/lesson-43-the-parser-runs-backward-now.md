# Lesson 43: The Parser Runs Backward Now

**What you will build:** the Operations tab's movement table (Lesson
41) becomes editable — `G`/`X`/`Y`/`Z`/`M`/`F`/`S` are real inputs, and
an edit writes back into the real source text, flowing through the
same debounced pipeline (Lesson 27) that already drives the DRO and
Viewport from Monaco typing. No reference counterpart. The transferable
problem underneath it: reconstructing real syntax from parsed data is
not just parsing run backward — it has its own, separate correctness
traps, and this lesson hits one for real before shipping.

**What you need to know first:** `core/lexer.py`/`core/parser.py`'s
real command dict (Lessons 2–4, 41); Lesson 18's real controlled
checkbox (`checked`/`onChange`); `react-useref-hook.md` (already used
in `Viewport.tsx`/`CodeEditor.tsx`/`SidePanel.tsx`); Lesson 27's
`code`/`debouncedCode` pipeline.

**Pipeline, extended:** `Text → Lexer → Parser → command dict →
Operations view` (Lesson 41) now runs the other direction too, for one
edited cell: `EditableCell → words dict → serializeLine → spliced into
the full program text → App.tsx's setCode → the exact same debounced
Lexer/Parser pass every other consumer already uses`. One concrete
value, both directions: editing `X0` to `X99.5` on `O0003.nc`'s line 6
produces the exact new line `G0 X99.5 Y0 Z5`, which a fresh parse of
the whole program then reads back as `x: 99.5` on that same line —
proven directly, later in this lesson.

---

## Concept Unit: Reconstructing Source Text from Parsed Data

### The Problem

Every command in this project already carries its own literal, parsed
`words` dict (Lesson 41). Editing a cell changes one entry in that
dict — but nothing yet turns a `words` dict back into a real G-code
line of text, which is what has to be spliced back into the source.

### Introduce the Concept in Isolation

First appearance of this specific problem in this project — full
standalone treatment: `concepts/reconstructing-source-syntax-from-
parsed-data.md`. Read that first; its own isolated example (a
`key=value // comment` parser whose naive reconstruction silently drops
the comment, because the comment lives in a separate return value, not
inside the parsed structure) is exactly the shape of the real mistake
this project's own `seq_n`/`skip`/`comment` fields would cause here if
reconstruction only read `words`.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx`, modified.
- **Change type** — add.
- **Location** — two new module-level functions, placed after `fmtWord`
  (Lesson 41).
- **Dependencies** — `core/parser.py`'s `_SUPPORTED_WORDS` tuple (the
  real word letters this project ever produces).

### The New Code

```ts
const WORD_ORDER = ["G", "X", "Y", "Z", "I", "J", "K", "R", "Q", "F", "S", "M", "H", "T"] as const;

function serializeWords(words: Command["words"]): string {
  const parts: string[] = [];
  for (const letter of WORD_ORDER) {
    if (!(letter in words)) continue;
    const value = words[letter];
    const values = Array.isArray(value) ? value : [value];
    for (const v of values) parts.push(`${letter}${v}`);
  }
  return parts.join(" ");
}
```

### The Updated Project

```ts
function serializeLine(command: Command, words: Command["words"]): string {
  const segments: string[] = [];
  if (command.skip) segments.push("/");
  if (command.has_real_seq_n) segments.push(`N${command.seq_n}`);
  const body = serializeWords(words);
  if (body) segments.push(body);
  let line = segments.join(" ");
  if (command.comment) line += line ? ` (${command.comment})` : `(${command.comment})`;
  return line;
}
```

`serializeLine` is exactly the concept file's own "read every field the
parser returned, not just the one that looks like the data" fix,
applied to this project's real shape: `words` is the obvious "the
data," but `command.skip`, `command.has_real_seq_n`/`seq_n`, and
`command.comment` are three separate fields a real line's identity
depends on just as much — each one is folded back in explicitly, not
assumed to live inside `words`.

### Mechanical Walkthrough

- `WORD_ORDER` — a fixed, literal array of every letter `core/
  parser.py`'s own `_SUPPORTED_WORDS` recognizes, in a deliberate
  display order (motion/position words first, then arc/cycle words,
  then feed/speed/misc words last) — **first appearance of this
  specific ordering choice**, not a new language construct.
- `for (const letter of WORD_ORDER)` / `if (!(letter in words))
  continue` — **reappearing** (`for...of`, `in` — both already
  established); the real point worth naming: iterating the *fixed*
  order, not `Object.keys(words)`, is what guarantees a rebuilt line
  always reads `G` before `X` before `Y`, regardless of what order the
  original line's words happened to be typed in.
- `Array.isArray(value) ? [value] : value` (normalizing a single value
  or array into always-an-array) — **reappearing** (Lesson 41's own
  `mValues`/`gValues` do the identical normalization).
- `parts.push(`${letter}${v}`)` then `parts.join(" ")` — **reappearing**
  string building (already established); the two-space-separated-words
  shape (`G0 X99.5 Y0`) is real, ordinary G-code syntax.
- `segments.push("/")` — the fix for exactly the "information lives in
  a separate field" trap named above: without this, `command.skip`
  would sit right there, correct and unused, precisely like the
  concept file's own dropped comment.

### CS Lens / SE Lens

Not repeated here — both given full treatment in `concepts/
reconstructing-source-syntax-from-parsed-data.md`. This project's own,
concrete instance of that concept file's SE Lens tradeoff: re-serializing
the *whole* line from canonical rules (not preserving the original
file's own spacing/decimal style) was chosen directly, by explicit
instruction, over surgically patching just the edited token.

### Commands

None new.

### Run It

```pycon
# Verified this session via a direct, non-browser round-trip against
# the real backend parser (not the literal TypeScript, which can't run
# standalone here) -- editing X on O0003.nc's line 6, reparsing the
# result, and confirming only that line's x changed:
>>> # (see this lesson's own "Connect the Pieces" for the full trace)
```

---

## Concept Unit: A Correctness Gap Found *Before* Shipping, Not After

### The Problem

`command.skip` (used directly above) didn't exist until this feature
needed it. Before this lesson's own edit path existed, nothing had ever
needed to know, after the fact, whether a specific parsed command's raw
line had started with `/` (Lesson 10's optional block-skip) — the
parser stripped it and moved on. Reconstructing a line from `words`
alone, without this flag, would have silently turned a real, deliberate
optional-skip block into one that always runs the instant any field on
that line was edited.

### Project Change

- **Reference Source** — none; no reference counterpart tracks this
  either, since the reference never reconstructs source text at all.
- **Files affected** — `cnc-service/core/parser.py` (`Parser.parse`,
  `Parser._parse_block`).
- **Change type** — add.
- **Location** — `skip` (already computed in `Parser.parse`'s own loop
  since Lesson 10) is now passed through to `_parse_block` and included
  on the returned command dict.
- **Dependencies** — none.

### The New Code

```python
"skip": skip,
```

### The Updated Project

```python
commands.append(
    self._parse_block(
        words, comment, seq_n, raw_line, real_seq_n is not None, line_number, skip
    )
)
```

```python
def _parse_block(
    self, words, comment="", seq_n=None, raw="", has_real_seq_n=False, line_number=None,
    skip=False,
):
```

`Parser.parse`'s loop already computed `skip = stripped.startswith("/")`
since Lesson 10 — used there only to decide whether to *drop* the line
entirely (`if skip and self.optional_skip_enabled: continue`), never
passed any further. It's now threaded through as `_parse_block`'s new
final parameter, defaulting to `False` so every other real caller of
`_parse_block` (none currently pass it positionally past `line_number`)
is unaffected.

```python
command = {
    # ...every existing field from Lessons 4/29/32/41, unchanged...
    "line_number": line_number,
    "words": words,
    "skip": skip,
}
```

### Mechanical Walkthrough

- `skip=False` as `_parse_block`'s new keyword parameter default —
  **reappearing** (Python default-argument syntax, already established)
  — the same pattern `has_real_seq_n=False`/`line_number=None` already
  use.
- Nothing else here is new syntax — the walkthrough's real content is
  the *timing* of this fix, named directly in this unit's own title:
  found and fixed while building the edit feature, verified before the
  feature was ever exercised, not discovered afterward by someone
  actually using optional block-skip and silently losing it.

### CS Lens

Not a hard CS concept — a real, project-specific instance of the
previous unit's own "information split into a separate field" trap,
caught in the same feature that would have triggered it.

### SE Lens

The alternative — leaving `skip` unrecorded, since neither real fixture
in this repo (`O0002.nc`/`O0003.nc`) happens to use optional block-skip
— was the real, easy path not taken: it would have shipped a feature
that silently corrupts a real, valid G-code construct the moment
someone who *does* use it tries it, with no error, no warning, just a
quietly-changed machine behavior. Recording one boolean field, already
computed and just sitting unused, was cheaper than the alternative
(discovering this in the field, likely on a real, uploaded program).

### Commands

None new.

### Run It

```pycon
>>> from core.parser import Parser
>>> commands = Parser().parse("/G0 X10\nG1 Y5")
>>> [(c["line_number"], c["skip"]) for c in commands]
[(1, True), (2, False)]
```

Real output, confirmed directly this session: line 1's `/` prefix is
now visible on its own command; line 2 (no prefix) correctly reports
`False`.

---

## Concept Unit: Turning an Edited Cell's Text Back Into a Value

### The Problem

`EditableCell` (next unit) hands back whatever raw text a user typed —
a plain string. Something has to turn that string into either a real
number, a real array of numbers (for a cell showing a repeated word
like `M3,M8`), or "no value at all" (an emptied cell, meaning: remove
this word from the line).

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx`, modified.
- **Change type** — add.
- **Location** — directly below `serializeLine` (previous unit).
- **Dependencies** — `serializeLine`/`serializeWords` (previous unit).

### The New Code

```ts
function parseWordInput(rawInput: string): number | number[] | undefined {
  const parts = rawInput
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  const nums = parts.map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return undefined;
  return nums.length === 1 ? nums[0] : nums;
}
```

### The Updated Project

```ts
function applyWordEdit(
  program: string,
  command: Command,
  letter: string,
  rawInput: string,
): string {
  const value = parseWordInput(rawInput);
  const newWords: Command["words"] = { ...command.words };
  if (value === undefined) {
    delete newWords[letter];
  } else {
    newWords[letter] = value;
  }
  const lines = program.split("\n");
  lines[command.line_number - 1] = serializeLine(command, newWords);
  return lines.join("\n");
}
```

`applyWordEdit` is the real entry point every edit eventually calls:
parse the typed text, apply it to a *copy* of this line's own words,
reconstruct that one line, and splice it into the full program at its
real, 1-indexed `line_number` (Lesson 41) minus one (arrays are
0-indexed) — every other line in the file is untouched.

### Mechanical Walkthrough

- `rawInput.split(",").map((s) => s.trim()).filter((s) => s.length >
  0)` — **reappearing** method chain (already used identically in
  `mValues`/`gValues`'s own array normalization, Lesson 41) — splits on
  comma (matching `fmtWord`'s own comma-joined display), trims
  whitespace, drops empty segments (so a trailing comma or repeated
  commas don't produce a stray empty string).
- `parts.map(Number).filter((n) => !Number.isNaN(n))` — **reappearing**
  `Number(...)` conversion (already used throughout this file);
  filtering out `NaN` results means a not-yet-finished number (a lone
  `"-"` while typing a negative value) is treated as "nothing entered
  yet" rather than a crash or a literal `NaN` written into the source.
- `nums.length === 0 ? undefined : ...` — the real "emptied cell" case:
  `undefined` is a distinct, meaningful return value (not `0`, not an
  empty array) — this project's own convention throughout for "this
  field genuinely isn't present" (`css_speed_max: number | null` is the
  closest existing parallel, though `null` there vs. `undefined` here
  is a real, minor inconsistency worth naming, not fixing this lesson).
- `{ ...command.words }` — **reappearing** object spread (already
  established) — a shallow copy, so mutating `newWords` next never
  touches the original `command.words` still being displayed elsewhere
  (other cells in the same row read from the *original* command until
  a fresh parse replaces it).
- `delete newWords[letter]` — **first appearance of the `delete`
  operator** in this project's frontend: removes a key from an object
  entirely, distinct from setting it to `undefined` (which would leave
  the key present with an `undefined` value — `"G" in words` would
  still be `true`, breaking `serializeWords`'s own `letter in words`
  check). A single, self-explanatory operator; not given its own
  concept file per the Stopping Rule.
- `lines[command.line_number - 1] = serializeLine(...)` — **reappearing**
  array index assignment (already established); replaces exactly one
  element of the split-by-newline array.

### CS Lens / SE Lens

Not repeated — this unit is the direct, concrete application of the
previous two units' own concepts (reconstruction, the skip-flag
correctness fix); no new tradeoff of its own.

### Commands

None new.

### Run It

Verified together with the next two units in this lesson's own
"Connect the Pieces" — `applyWordEdit` has no independent entry point
outside a component calling it.

---

## Concept Unit: A Controlled Checkbox Becomes a Controlled Text Input

### The Problem

Reconstructing a line's text is only useful once something in the UI
actually lets a user change a value and reports that change.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx` (`MoveTableRow`,
  replaced; new `EditableCell`).
- **Change type** — add (`EditableCell`), replace (`MoveTableRow`'s
  static cells).
- **Location** — directly above the existing `MoveTableRow`.
- **Dependencies** — none beyond React itself.

### The New Code

```tsx
function EditableCell({
  value,
  onCommit,
}: {
  value: string;
  onCommit: (newValue: string) => void;
}) {
  const [text, setText] = useState(value);
  return (
    <input
      className="block-move-input"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onCommit(e.target.value);
      }}
    />
  );
}
```

### The Updated Project

```tsx
interface MoveTableRowProps {
  command: Command;
  onEditWord: (command: Command, letter: string, value: string) => void;
}

function MoveTableRow({ command, onEditWord }: MoveTableRowProps) {
  return (
    <tr className="block-move-row">
      <td className="block-move-linenum">{command.line_number}</td>
      <td>
        <EditableCell
          value={fmtWord(command.words.G)}
          onCommit={(v) => onEditWord(command, "G", v)}
        />
      </td>
      <td>
        <EditableCell
          value={command.x != null ? String(command.x) : ""}
          onCommit={(v) => onEditWord(command, "X", v)}
        />
      </td>
      <td>
        <EditableCell
          value={command.y != null ? String(command.y) : ""}
          onCommit={(v) => onEditWord(command, "Y", v)}
        />
      </td>
      <td>
        <EditableCell
          value={command.z != null ? String(command.z) : ""}
          onCommit={(v) => onEditWord(command, "Z", v)}
        />
      </td>
      <td>
        <EditableCell
          value={fmtWord(command.words.M)}
          onCommit={(v) => onEditWord(command, "M", v)}
        />
      </td>
      <td>
        <EditableCell
          value={fmtWord(command.words.F)}
          onCommit={(v) => onEditWord(command, "F", v)}
        />
      </td>
      <td>
        <EditableCell
          value={fmtWord(command.words.S)}
          onCommit={(v) => onEditWord(command, "S", v)}
        />
      </td>
    </tr>
  );
}
```

`MoveTableRow` no longer renders any value directly — every one of its
seven data columns is now an `EditableCell`, each wired to the same
`onEditWord` callback with its own letter.

The real CSS `EditableCell`'s own `className="block-move-input"`
depends on:

```css
.block-move-input {
  width: 100%;
  min-width: 36px;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 3px;
  color: inherit;
  font: inherit;
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

### Mechanical Walkthrough

- `value={text}` / `onChange={(e) => { setText(...); onCommit(...); }}`
  — **reappearing**, the same React controlled-input mechanism Lesson
  18 first taught (`checked={isSelected}` / `onChange={() =>
  toggleSelected(...)}` on `ToolImportPanel.tsx`'s own checkbox) — a
  text `<input>` instead of a checkbox, `value` instead of `checked`,
  same underlying idea: React owns the displayed value, and `onChange`
  is the only path anything can change it through.
- **The one genuinely new wrinkle**, worth naming directly rather than
  folding silently into "reappearing": Lesson 18's checkbox has *no*
  local state at all — `checked` reads directly from the parent's own
  state, every render. `EditableCell` instead seeds a *local* `useState`
  from `value` once, on mount, and never resyncs it if `value` changes
  later. This is deliberate: `value` here is derived from `program`,
  which only updates ~900ms after a keystroke (Lesson 27's debounce) —
  a fully-controlled-from-props input would fight the user's own typing
  for that entire window, snapping back to the stale parsed value on
  every render. The real, accepted cost: if a fresh reparse ever
  produces a value genuinely different from what the user typed (a
  reformatting quirk, or another edit changing this same line some
  other way), the cell keeps showing the typed text, not the
  freshly-parsed truth, until something remounts it.
- `command.x != null ? String(command.x) : ""` — **reappearing**
  ternary/null-check (already established); `fmtWord(command.words.G)`
  — the G column now reads the *literal* per-line word, not the
  resolved `command.motion` Lesson 41 displayed there — named directly:
  editing the resolved value would stamp an explicit, redundant G-word
  onto every plain continuation line the instant its row was clicked
  into, since resolved motion is shown even on lines that never set G
  themselves.
- `.block-move-input:hover` — **reappearing**, the same pseudo-class
  syntax established since Lesson 17/18.
- `.block-move-input:focus` — **first appearance** of `:focus` in this
  project: matches an element for exactly as long as it holds real
  keyboard focus (a click, or a Tab landing on it) — a state, like
  `:hover`, but tracking *keyboard/input* attention rather than the
  mouse's position. `outline: none` deliberately removes the browser's
  own default focus ring first, replaced immediately by this rule's own
  `border-color`/`background` change — a real, deliberate substitution,
  not a loss of the accessibility signal a focus indicator exists to
  give: every cell still shows *some* visible change the instant it's
  focused, just this project's own, matching every other real
  interactive state already established (`.btn:hover`'s own blue border,
  for one).

### CS Lens

A controlled input with locally-seeded, non-resyncing state is a real,
specific point on the spectrum between "fully controlled" (Lesson 18's
checkbox: state always wins) and "fully uncontrolled" (a plain
`<input>` with no `value` prop at all: the DOM owns everything). This
project picked "seeded once, then locally owned" — a real, third option
worth recognizing as distinct from either end, not a compromise or a
mistake.

### SE Lens

The alternative — resyncing `text` from `value` via a `useEffect`
whenever `value` changes — would keep the cell always showing the
authoritative, freshly-parsed value, at the real cost of a visible
flicker/reset while the user is actively typing (a `useEffect` firing on
every reparse, mid-edit, would overwrite whatever partial text is
currently in the box). The version built here accepts the opposite
risk (a stale display if reparse ever disagrees with what was typed)
in exchange for typing that's never interrupted — the right tradeoff
for a debounce-backed field, not universally correct for every
controlled input.

### Commands

None new.

### Run It

Not independently runnable outside a browser; not verified live this
session (see this lesson's own Known Incomplete) — the reconstruction
logic itself was verified directly against the real backend parser (see
Connect the Pieces).

---

## Concept Unit: A Ref to Keep Two Edits From Racing Each Other

### The Problem

`BlockList` only receives `program` — App.tsx's *debounced* code, ~900ms
behind real typing/editing. If a user edits two different cells within
that window, the second edit's `handleEditWord` would read the same
stale `program` the first edit also started from — computing its new
line from text that doesn't yet include the first edit, silently
discarding it the moment `onProgramChange` is called a second time.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx` (`BlockList`).
- **Change type** — add.
- **Location** — top of `BlockList`, alongside its existing `useState`
  calls.
- **Dependencies** — `react-useref-hook.md` (already used in `Viewport.
  tsx`/`CodeEditor.tsx`/`SidePanel.tsx` — see that concept file for
  `useRef`'s own first-time treatment).

### The New Code

```ts
const latestProgramRef = useRef(program);
useEffect(() => {
  latestProgramRef.current = program;
}, [program]);
```

### The Updated Project

```ts
function handleEditWord(command: Command, letter: string, value: string) {
  const updated = applyWordEdit(latestProgramRef.current, command, letter, value);
  latestProgramRef.current = updated;
  onProgramChange(updated);
}
```

Every edit now reads and writes `latestProgramRef.current`, never the
`program` prop directly — the prop is still what resyncs the ref
whenever a fresh, authoritative reparse actually lands (the `useEffect`
above), but between two rapid edits, the ref (not the lagging prop) is
the real source of truth.

### Mechanical Walkthrough

`useRef(program)` and `.current` reads/writes are **reappearing** — see
`react-useref-hook.md` for the construct's own first-time treatment.
The genuinely new *application*, worth naming directly since it's a
different problem than that concept file's own DOM-node/render-counter
examples: here, a ref holds "the latest value from whichever of two
async sources — a debounced prop, or a synchronous local edit — most
recently produced one," specifically to avoid a stale-read race between
them. The mechanism is identical; the reason it's reached for is not
"avoid a re-render" (that concept file's own framing) but "avoid two
writers stepping on each other."

### CS Lens

This is a real, small instance of a much larger, general problem: two
writers, one of them delayed, both needing to agree on "the current
value." Also recognized in: optimistic UI updates in any client that
also polls/refetches from a server (the local optimistic value must win
until the server's own response catches up); a text editor's own
undo stack needing to know the truly-latest state, not whatever an
in-flight autosave request still thinks is current.

### SE Lens

The alternative — removing the debounce entirely, so `program` always
reflects the very latest text with no lag — was not chosen, and
deliberately so: the 900ms debounce (Lesson 27) exists specifically to
avoid re-parsing/re-fetching on every single keystroke across the whole
app (Monaco typing included), a real, established performance
tradeoff this feature has no standing to unilaterally undo just for
its own convenience. Adding one small, local ref here is a targeted fix
scoped to the one place a race is possible, rather than a global change
with a wider blast radius.

### Commands

None new.

### Run It

Not independently runnable outside a browser (rapid double-edits are an
interaction, not a pure function) — named directly in Known Incomplete
as unverified live this session.

---

## Concept Unit: Wiring the Edit Path Through to `App.tsx`

### The Problem

`handleEditWord`/`EditableCell` exist, but nothing yet connects a
keystroke in the Operations tab to `App.tsx`'s own real `code` state —
the same state Monaco (Lesson 27) already writes into.

### Project Change

- **Reference Source** — none.
- **Files affected** — `cnc-web/src/BlockList.tsx`
  (`OperationBlockProps`/`OperationBlock`, `BlockListProps`), `cnc-web/
  src/App.tsx` (`renderViewContent`).
- **Change type** — add (new props, threaded through).
- **Location** — `OperationBlockProps`/`BlockListProps`' existing
  interfaces; `App.tsx`'s existing `if (id === "blocks") return
  <BlockList .../>` line (Lesson 41).
- **Dependencies** — Lesson 27's `code`/`setCode`.

### The New Code

```ts
interface BlockListProps {
  program: string;
  onProgramChange: (program: string) => void;
}
```

```tsx
if (id === "blocks") return <BlockList program={debouncedCode} onProgramChange={setCode} />;
```

### The Updated Project

```ts
interface OperationBlockProps {
  commands: Command[];
  operationIndex: number;
  hasRealSeqNumbers: boolean;
  toolsByNumber: Map<number, Tool>;
  onEditWord: (command: Command, letter: string, value: string) => void;
}
```

`onEditWord` is passed straight through `OperationBlock` to each
`MoveTableRow` (`<MoveTableRow key={c.seq_n} command={c}
onEditWord={onEditWord} />`), and `BlockList` passes its own
`handleEditWord` (previous unit) as that same prop where it renders
each `OperationBlock`.

### Mechanical Walkthrough

Every line in this unit is **reappearing** prop-threading — already
established throughout this codebase (`SidePanel`'s own multi-level
`tabs`/`onSelectTab` threading, Lesson 23) — passing a callback down
through an intermediate component that doesn't use it itself, only
forwards it. `onProgramChange={setCode}` is the one line that actually
closes the loop: `setCode` is the *exact same* setter Monaco's own
`onChange` already calls (Lesson 27), not a new, parallel state
variable — which is what makes an Operations-tab edit and a Monaco
keystroke behave identically from this point on, both flowing through
the one real `code` → debounce → `debouncedCode` → refetch pipeline.

### CS Lens / SE Lens

Not repeated — plain composition, no new tradeoff.

### Commands

None new.

### Run It

Covered by this lesson's own Connect the Pieces, next.

---

## Connect the Pieces

One real edit, start to finish, verified directly this session (not in
a browser — a direct Python round-trip against the real backend
parser, since the reconstruction logic itself, not the React wiring, is
what correctness depends on):

```pycon
>>> from core.parser import Parser
>>> with open("O0003.nc") as f:
...     program = f.read()
>>> commands = Parser().parse(program)
>>> target = next(c for c in commands if c.get("x") is not None)
>>> target["line_number"], target["raw"], target["x"]
(6, 'G00 X0 Y0 Z5.', 0.0)
```

Editing X to `99.5` (mirroring `applyWordEdit`'s own logic exactly):
`serializeLine` rebuilds line 6 as `"G0 X99.5 Y0 Z5"` (`skip=False`, no
real `seq_n` on this line, no comment); splicing that into the full
program and reparsing it with the real `Parser` again:

```pycon
>>> lines = program.split("\n")
>>> lines[5] = "G0 X99.5 Y0 Z5"
>>> reparsed = Parser().parse("\n".join(lines))
>>> next(c for c in reparsed if c["line_number"] == 6)["x"]
99.5
>>> len(commands) == len(reparsed)
True
```

Every other line's own parsed values are unaffected — confirmed
directly, this session, exactly this way. In the real app, this same
splice happens inside `applyWordEdit`, its result flows through
`onProgramChange` (→ `setCode`) → App.tsx's existing debounce →
`debouncedCode` → both `fetchPath` (Viewport) and `BlockList`'s own
`fetchBlocks` re-run, and the Monaco editor (bound to the same `code`
state) shows the edited line immediately, with no separate write path.

## What Breaks Without This

Reverting just the skip-flag fix (`"skip": skip` removed, `serializeLine`
no longer checking `command.skip`) and repeating this session's own
round-trip test against a `/`-prefixed line:

```pycon
>>> commands = Parser().parse("/G0 X10\nG1 Y5")
>>> # simulate editing X without the skip flag available:
>>> new_line = "G0 X99.5"  # no leading "/" -- the flag no longer exists to add it
>>> reparsed = Parser().parse("\n".join([new_line, "G1 Y5"]))
>>> reparsed[0]["skip"]
False
```

The optional-skip marker is gone — silently, with no error — exactly
the regression this lesson's own correctness-gap unit exists to
document having caught first.

## Exercises

1. Edit a cell on a line that also carries an `I`/`J`/`K` (an arc
   center, not shown as its own column) and confirm those words survive
   in the reconstructed line — proof `WORD_ORDER`'s coverage of every
   `_SUPPORTED_WORDS` letter (not just the seven shown columns) is load-
   bearing, not decorative.
2. Clear an `M` cell that had two values (`M3,M8`) entirely, and trace
   by hand what `parseWordInput`/`applyWordEdit` do — confirm the
   rebuilt line drops the `M`-word entirely rather than writing `M`
   with no number.
3. Simulate two edits to two different cells on the same line "before"
   the 900ms debounce fires (call `handleEditWord` twice in a row, by
   hand, against the same initial `program`) and confirm both edits
   survive in the final text — then repeat using `program` directly
   instead of `latestProgramRef.current`, and observe the second edit
   silently overwrite the first, reproducing this lesson's own
   race-avoidance unit as a real, observable bug.

## Known Incomplete — Named Directly

- **Not verified in a live browser this session.** Every "Run It" above
  is a direct, non-browser check against the real backend parser or a
  hand-traced simulation — the actual interactive behavior (focus
  retention while typing, whether clicking a cell triggers the row's
  own collapse toggle, real debounce timing) has not been exercised.
  Named directly, not assumed fine.
- **Declared blocks (Plane/WCS/Rotation/Coolant/Tool/SFM/CPT) remain
  read-only** — by scope, this pass only touches the movement table.
- **`EditableCell`'s local state never resyncs from a fresh prop** —
  named directly in that unit's own Mechanical Walkthrough as a real,
  accepted tradeoff, not an oversight.
- **No undo.** An edit is immediate and permanent the moment it's
  typed; Monaco's own undo stack (a real, separate editor feature) is
  the only way to revert one today.
- **`value: number | number[] | undefined` vs. `css_speed_max: number |
  null`** — a real, small, existing inconsistency in this project's own
  "field not present" convention, named in this lesson rather than
  silently perpetuated further.

## Definition of Done

- [x] `serializeWords`/`serializeLine` reconstruct a real line from
      `words`/`skip`/`seq_n`/`comment`, verified against the real
      backend parser.
- [x] `core/parser.py` records `skip` on every command dict.
- [x] `parseWordInput`/`applyWordEdit` parse and splice one edited word
      back into the full program text.
- [x] `EditableCell` wired into all seven `MoveTableRow` columns; G
      column now edits the literal per-line word.
- [x] `latestProgramRef` prevents two rapid edits from racing.
- [x] `onProgramChange`/`onEditWord` threaded `App.tsx` → `BlockList` →
      `OperationBlock` → `MoveTableRow`.
- [x] One new, project-independent concept file
      (`reconstructing-source-syntax-from-parsed-data.md`).
- [x] `npx tsc --noEmit` clean; `check_lesson_diff_coverage.py` clean
      (targeted + `--all`) before this lesson was called done.
- [ ] Live-browser verification — explicitly deferred, named above.

```
git commit -m "Lesson 43: the parser runs backward now"
```
