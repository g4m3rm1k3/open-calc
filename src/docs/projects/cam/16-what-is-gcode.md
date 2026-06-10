# CAD/CAM — Lesson 16 — What is G-code

## What You Will Build

A "Load G-code" button appears in the toolbar. Clicking it opens a file picker. The
loaded file's text appears line by line in a scrollable panel. Each line is displayed
as-is — no parsing yet. The panel highlights the selected line when clicked. The
status bar shows the total line count.

## What You Need to Know First

Lessons 01–15. The toolbar, panels, and file loading pattern are established. This
lesson does not require the sketch or 3D geometry — it introduces the G-code domain
from scratch.

---

## The Problem

G-code is the lingua franca of CNC machining. A CNC machine — milling machine,
lathe, router, 3D printer — is a computer that reads G-code and moves its axes
according to the instructions. Understanding G-code is not optional for a CAM
application. CAM software's output is always G-code. The final lesson (24) generates
it. But before generating it, we must understand what it is and how to read it.

This lesson opens a G-code file and displays it raw. The goal is to make G-code
*readable* before making it *parseable*. Every subsequent G-code lesson (17–19, 24)
builds on the understanding established here.

---

## Step 1 — What G-code Is

### A domain-specific language for machine motion

G-code is a **domain-specific language** (DSL) — a programming language designed
for one specific domain. Unlike a general-purpose language (Python, TypeScript),
which can compute anything, G-code can only describe machine motion and spindle
control.

A G-code program is a sequence of **blocks** (lines). Each block contains one or
more **words** (letter-number pairs). Here is a typical G-code program:

```
%
O0001
N10 G21 G90 G17 G40 G49 G80
N20 T1 M6
N30 G0 X0 Y0 Z25.0 S3000 M3
N40 G0 Z5.0
N50 G1 Z-5.0 F300
N60 G1 X50.0 Y0 F500
N70 G1 X50.0 Y50.0
N80 G1 X0 Y50.0
N90 G1 X0 Y0
N100 G0 Z25.0 M5
N110 M30
%
```

**Annotated:**

`%` — program start/end delimiter (Fanuc dialect). Marks the beginning and end of
the program file.

`O0001` — program number. CNC machines store programs by number. `O` is the word
address for program number.

`N10`, `N20` — line numbers (optional on most controllers, used for reference).

`G21` — switch to millimetre units.
`G90` — absolute positioning mode (all coordinates relative to program zero).
`G17` — select XY plane for arc moves.
`G40` — cancel cutter radius compensation.
`G49` — cancel tool length offset.
`G80` — cancel any active canned cycle.

`T1 M6` — select tool 1 and execute tool change.

`G0` — **rapid move** (maximum speed, no cutting). Used for air moves.
`G1` — **linear interpolation** (controlled feed rate). Used for cutting moves.

`X0 Y0 Z25.0` — axis position. Coordinates in millimetres (G21).
`S3000` — spindle speed in RPM. `M3` — start spindle clockwise.

`F300` — feed rate in mm/min for the `G1` move. `F500` — faster feed for the profile.

`M30` — end of program.

**CS lens — modal state:**
G-code is **modal**: many G-code settings remain active until changed. `G90`
(absolute mode) stays active for all subsequent moves until `G91` (relative mode)
appears. The controller maintains a set of current modes — a state machine with
many state variables. This accumulated state is called the **modal group**.

Understanding modality is essential for parsing G-code: a move command `G1 X50 Y0`
without a feed rate is valid if a feed rate was previously set. The parser must
track which modals are currently active.

**Fanuc dialect:**
"Fanuc" refers to Fanuc Ltd, the largest CNC controller manufacturer. The **Fanuc
dialect** of G-code is the de facto standard for milling machines. Other dialects
include Siemens, Heidenhain, HAAS (a superset of Fanuc), and Okuma. This curriculum
targets the Fanuc dialect; the architecture supports adding others.

### G-code is not a high-level language

G-code has no variables (in base Fanuc), no loops, no subroutines (in base Fanuc),
no conditional logic (in base Fanuc). It is a list of instructions executed
sequentially. Higher-level features exist as manufacturer-specific extensions. The
base language is deliberately simple — it must run on hardware from the 1980s.

---

## Step 2 — File Loading

### The HTML file input

Add to `src/components/Toolbar.tsx`:

```tsx
<input
  type="file"
  id="gcode-file-input"
  accept=".nc,.gcode,.gc,.cnc,.tap,.txt"
  style={{ display: 'none' }}
  onChange={onGcodeFileLoad}
/>
<label htmlFor="gcode-file-input" className="toolbar-btn">
  Load G-code
</label>
```

**Hidden file input with label:**
`<input type="file">` opens the OS file picker when clicked. By hiding the input
(`display: none`) and using a `<label htmlFor="gcode-file-input">`, the label's
click behaviour activates the hidden input. This is the standard pattern for
customising the file picker button's appearance — the default browser button is
unstyled and cannot be fully controlled with CSS, but a label can.

**`accept` attribute:**
The `accept` attribute suggests which file types to show in the picker. `.nc`, `.gcode`,
`.gc`, `.cnc`, `.tap` are common G-code file extensions; `.txt` is included because
many G-code files are renamed or have non-standard extensions. The browser may not
enforce this restriction on all platforms — the file reader must handle non-G-code
files gracefully.

### Read the file

```tsx
function onGcodeFileLoad(event: React.ChangeEvent<HTMLInputElement>): void {
  const file = event.target.files?.[0]
  if (file === undefined) return

  const reader = new FileReader()

  reader.addEventListener('load', () => {
    const content = reader.result
    if (typeof content !== 'string') return
    onGcodeLoaded(content)
  })

  reader.readAsText(file)
}
```

**`FileReader` — first appearance:**
`FileReader` is a browser API that reads file contents asynchronously. `readAsText(file)`
reads the file as a string. The `'load'` event fires when reading is complete, with
`reader.result` containing the file contents.

`readAsText` reads the file using the UTF-8 encoding by default. G-code files are
always plain text (ASCII or UTF-8) — binary formats are not standard G-code.

**`event.target.files?.[0]`:**
`event.target.files` is a `FileList` — a browser object like an array. `?.[0]`
uses optional chaining on the index access — if `files` is null or empty,
`files?.[0]` is `undefined` rather than throwing. The `undefined` check
(`if (file === undefined)`) handles this case.

**`React.ChangeEvent<HTMLInputElement>`:**
The event parameter type for `onChange` on an `<input>` element. TypeScript requires
the type to be `React.ChangeEvent<HTMLInputElement>` for type-safe access to
`event.target.files`. Without it, TypeScript does not know `event.target` has a
`files` property.

---

## Step 3 — The G-code Panel

### Create `src/components/GcodePanel.tsx`

```tsx
interface GcodePanelProps {
  lines:           string[]
  selectedLineIndex: number | null
  onLineSelect:    (index: number) => void
}

export function GcodePanel({
  lines,
  selectedLineIndex,
  onLineSelect,
}: GcodePanelProps): JSX.Element {
  return (
    <div className="gcode-panel">
      <p className="panel-section-title">G-code ({lines.length} lines)</p>
      <div className="gcode-list">
        {lines.map((line, index) => (
          <div
            key={index}
            className={`gcode-line ${selectedLineIndex === index ? 'selected' : ''}`}
            onClick={() => onLineSelect(index)}
          >
            <span className="gcode-line-number">{index + 1}</span>
            <span className="gcode-line-content">{line}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

**`key={index}` for G-code lines:**
Using array index as a key is acceptable when the list is stable (items are not
reordered or removed from the middle). G-code lines are only ever loaded all at once
and never individually deleted — index keys are appropriate here. If lines could be
reordered, a content-based key would be necessary.

### Add to `style.css`

```css
.gcode-panel {
  display:        flex;
  flex-direction: column;
  height:         100%;
  overflow:       hidden;
}

.gcode-list {
  flex:       1;
  overflow-y: auto;
  font-family: var(--font-mono);
  font-size:   11px;
}

.gcode-line {
  display:         flex;
  gap:             8px;
  padding:         2px 8px;
  cursor:          pointer;
  border-left:     2px solid transparent;
  white-space:     nowrap;
}

.gcode-line:hover {
  background-color: var(--colour-surface-raised);
}

.gcode-line.selected {
  background-color: var(--colour-surface-raised);
  border-left-color: var(--colour-accent);
}

.gcode-line-number {
  color:      var(--colour-text-muted);
  min-width:  32px;
  text-align: right;
  flex-shrink: 0;
  user-select: none;
}

.gcode-line-content {
  color: var(--colour-text);
}
```

**`white-space: nowrap`:**
G-code lines can be long. `nowrap` prevents them from wrapping, keeping each block
on a single visual line. The panel scrolls horizontally (implicitly, via the overflow)
rather than wrapping mid-block, which would make the G-code harder to read.

**`user-select: none` on line numbers:**
`user-select: none` prevents the line numbers from being selected when the user
clicks or drags. Without this, clicking a line selects both the number and the
content, which is unexpected. The user should only select the G-code text.

---

## Step 4 — App State for G-code

Add to `src/App.tsx`:

```tsx
const [gcodeLines,        setGcodeLines]        = useState<string[]>([])
const [selectedLineIndex, setSelectedLineIndex] = useState<number | null>(null)

function handleGcodeLoaded(content: string): void {
  const lines = content.split('\n').map((line) => line.trimEnd())
  setGcodeLines(lines)
  setSelectedLineIndex(null)
}
```

**`string.split('\n')`:**
`split('\n')` divides the file content at every newline character. The result is an
array of line strings. `trimEnd()` removes trailing carriage returns (`\r`) — G-code
files often use Windows-style CRLF line endings (`\r\n`). `split('\n')` leaves the
`\r` attached to each line; `trimEnd()` removes it.

The layout gains a right panel for G-code, or the existing properties panel shows it
when G-code is loaded. Either approach is valid — the choice depends on the visual
design.

---

## Debugging: When File Loading Does Not Work

**Symptom: clicking "Load G-code" opens the picker but selecting a file does nothing**

The `onChange` handler is not attached to the file input. Check that `onGcodeFileLoad`
is passed to `onChange` on the `<input type="file">`. Note: the event fires only when
the selected file changes — selecting the same file twice does not re-fire. To allow
reloading the same file, add `event.target.value = ''` at the end of the handler.

**Symptom: G-code displays with every line showing `\r` at the end**

The `trimEnd()` is missing from the line processing. Windows-style files end each
line with `\r\n`. After `split('\n')`, each line ends with `\r`. `trimEnd()` or
`.replace(/\r$/, '')` removes it.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

The raw G-code lines displayed here are the input to lesson 17 (the lexer). The
`gcodeLines` array (strings) becomes the input to `tokeniseGcode` in lesson 17.
The `selectedLineIndex` connects to the toolpath simulator in lesson 19: selecting
a line in the G-code panel highlights the corresponding 3D move in the viewport.

This lesson establishes the data flow for all G-code lessons: file → string array
→ token array (lesson 17) → parsed blocks (lesson 18) → 3D moves (lesson 19).

---

## What Breaks Without This

**Without the hidden file input pattern:**
The default `<input type="file">` button cannot be styled. It appears as a
browser-default button that does not match the application's design. In some
browsers, it cannot even be resized. The label trick allows full CSS control.

**Without `trimEnd()`:**
`\r` characters appear as visible artifacts in the G-code display. On some systems,
they produce rendering glitches. Worse, in lesson 17, the lexer would fail to
recognise valid tokens because `G1\r` is not the same token as `G1`.

---

## Definition of Done

- [ ] Load G-code button appears in the toolbar
- [ ] Clicking it opens the OS file picker
- [ ] The G-code lines appear in the panel with line numbers
- [ ] Clicking a line highlights it
- [ ] Status bar shows the total line count
- [ ] You can explain what G-code is and list 5 G-codes with their meanings
- [ ] You can explain modal state with the `G90`/`G91` example
- [ ] You can explain `FileReader` and why reading is asynchronous
- [ ] You can explain the hidden file input + label pattern and why it is used
- [ ] Run:
      ```
      git add src/
      git commit -m "Add G-code file loading: FileReader reads file as text, raw lines displayed with selection highlight; G-code domain explained"
      ```

---

*Next: Lesson 17 — The G-code Lexer. G-code tokenised into word-address tokens.
Builds directly on the lexer pattern from the calculator project.*
