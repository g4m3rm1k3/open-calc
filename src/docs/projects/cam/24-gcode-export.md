# CAD/CAM — Lesson 24 — G-code Export

## What You Will Build

An "Export G-code" button in the toolbar generates a complete, downloadable Fanuc
G-code file from all toolpaths generated in lessons 22 and 23. Clicking it downloads
a `.nc` file to the user's computer — a real G-code file that a CNC machine can
read. The exporter validates its own output by parsing the generated text with the
lesson 18 parser and checking that every block is error-free before the file is
offered for download. A validation summary appears in the toolbar showing how many
blocks were validated and whether any errors were found.

## What You Need to Know First

Lessons 01–23. Lesson 18 defined `parseGcode` — used here for round-trip validation.
Lesson 22 introduced the G-code generator pattern. Lesson 23 introduced canned
cycles. This lesson is the culmination of the G-code pipeline — it combines every
generator, validates the result, and delivers a production-quality output file.

---

## The Problem

Lessons 22 and 23 generate separate G-code strings — one for the contour, one for the
drill cycles. A real CNC program is a single file. The exporter must:

1. Collect all generated operations
2. Combine them into a single, correctly structured Fanuc program
3. Validate the result by parsing it
4. Deliver it as a downloadable file

G-code export is the **inverse of parsing** — the output of parsing is structured
data; the input of export is structured data that becomes text. A well-designed export
pipeline is verified by round-trip testing: export → parse → compare. If the parsed
result matches the original intent, the exporter is correct. If it does not, there is
a bug in either the exporter or the parser.

---

## Step 1 — The Fanuc Program Structure

### The problem

A Fanuc G-code program has a required structure. Deviating from it may cause the
controller to reject the file or behave unexpectedly.

### Fanuc program format

```
%                     ← start-of-file marker (required by some controllers)
O0001                 ← program number (O followed by 4 digits)
(Program name or description)
G21 G90 G17           ← safe start: metric, absolute, XY plane
G28 G91 Z0            ← return Z to home (safe retract before program body)
G90                   ← back to absolute after G91 for home move

[... operation blocks ...]

M30                   ← end of program, rewind
%                     ← end-of-file marker
```

**The `%` markers:**
Fanuc uses `%` as a special delimiter character — it marks the beginning and end of
the program tape. On older controllers that read from physical tape reels, the `%`
told the reader where the program starts and ends. Modern CNC controllers still
require or tolerate it. Omitting it causes some controllers to refuse to load the
file.

**`O0001` — program number:**
Every Fanuc program has a number (`O` followed by 1–4 digits). The controller uses
this number to identify the program in its internal memory. Numbers 8000–9999 are
typically reserved for manufacturer macros — avoid them. For a single program, `O0001`
is the conventional first program number.

**`G28 G91 Z0` — home the Z axis:**
`G28` returns the axis to machine home via the intermediate point defined by the
following word. `G91 Z0` means "relative mode, zero Z displacement" — the
intermediate point is the current position. The effect: Z returns to machine home
from wherever it currently is, without moving in X or Y. This is the standard way
to safely retract the tool before the program begins machining, in case the tool is
close to the work. `G90` on the following line restores absolute positioning.

---

## Step 2 — The Exporter

### Create `src/gcode/exporter.ts`

```typescript
import { parseGcode } from './parser.js'

export interface ExportableOperation {
  label:  string
  gcode:  string
}

export interface ExportResult {
  programText:   string
  blockCount:    number
  errorCount:    number
  errorMessages: string[]
}
```

**`ExportableOperation` — the input contract:**
The exporter accepts an array of operations, each with a label and G-code string. The
label becomes a comment in the output file. The G-code string is the raw output from
`generateContourGcode` or `generateDrillGcode`. The exporter does not know or care
which operation type produced each string — it treats all G-code strings uniformly.

**`ExportResult` — what the exporter tells the caller:**
`programText` is the full downloadable G-code. `blockCount` and `errorCount` provide
the validation summary shown in the UI. `errorMessages` lists any specific block
errors found — these are passed to the UI so the operator knows whether to trust the
file.

```typescript
export function exportFanucProgram(
  operations: ExportableOperation[],
  programNumber: number = 1,
): ExportResult {
  const combinedLines: string[] = []

  combinedLines.push('%')
  combinedLines.push(`O${String(programNumber).padStart(4, '0')}`)
  combinedLines.push(`(${new Date().toISOString()} — CAM project export)`)
  combinedLines.push('G21 G90 G17')
  combinedLines.push('G28 G91 Z0')
  combinedLines.push('G90')
  combinedLines.push('')

  for (const operation of operations) {
    combinedLines.push(`(--- ${operation.label} ---)`)

    const operationLines = operation.gcode
      .split('\n')
      .filter((line) => {
        const trimmed = line.trim()
        return trimmed !== '' &&
               trimmed !== '%' &&
               !trimmed.startsWith('O') &&
               trimmed !== 'M30' &&
               trimmed !== 'G21 G90 G17'
      })

    combinedLines.push(...operationLines)
    combinedLines.push('')
  }

  combinedLines.push('G0 Z25.000')
  combinedLines.push('G28 G91 Z0')
  combinedLines.push('G90')
  combinedLines.push('M30')
  combinedLines.push('%')

  const programText = combinedLines.join('\n')

  return {
    programText,
    ...validateProgram(programText),
  }
}
```

**`String(programNumber).padStart(4, '0')` — first appearance of `padStart`:**
`'1'.padStart(4, '0')` produces `'0001'` — it pads the string on the left with `'0'`
characters until the total length is 4. `padStart(targetLength, padString)` is a
built-in `String` method. `'123'.padStart(4, '0')` → `'0123'`. `'12345'.padStart(4, '0')`
→ `'12345'` (no padding if already at or over the target length). This is used here
to produce standard Fanuc 4-digit program numbers.

**`new Date().toISOString()` — first appearance:**
`new Date()` creates a JavaScript `Date` object representing the current instant.
`.toISOString()` formats it as an ISO 8601 string: `"2026-06-10T14:32:07.000Z"`. This
timestamp in the program header tells the operator when the file was generated — useful
when comparing multiple exported versions on the machine controller.

**Filtering per-operation lines — what is removed and why:**
When combining multiple operations into one program, lines that are valid in standalone
programs become incorrect or redundant in the combined file:

- `%` (tape delimiter) — belongs only at the very start and end of the file
- `Oxxxx` (program number) — only one program number per file
- `M30` (end of program) — only one, at the very end
- `G21 G90 G17` (safe start) — included once at the top of the combined program;
  repeating it is harmless but noisy

The `.filter()` removes these. What remains are the actual motion and canned cycle
blocks from each operation — the part that varies between operations.

**`combinedLines.push(...operationLines)` — adding filtered lines:**
The spread operator unpacks `operationLines` into individual arguments, adding each
as a separate element. This is the same pattern from lesson 19's simulator: spreading
an array into `push` rather than a loop.

**`'G0 Z25.000'` and `'G28 G91 Z0'` before M30:**
After all operations complete, the tool should be at a safe height before program end.
`G0 Z25.000` rapids the tool to 25mm above the work surface — clear of any fixtures.
`G28 G91 Z0` then returns Z to machine home, ensuring the machine is in a known safe
state when the program finishes.

---

## Step 3 — Round-Trip Validation

### The problem

The exporter produces G-code text. Before offering the file for download, we parse
the text with the lesson 18 parser and verify that every block is error-free. This is
**round-trip testing in production** — not in a test suite, but in the live system.

### The maths/CS — what round-trip testing proves

Round-trip testing (generate → parse → verify) proves two things simultaneously:

1. The generator produces syntactically valid G-code that the parser can parse
2. The parser can handle every construct the generator produces

If either direction has a bug, the round-trip catches it. Example bugs caught:
- Generator emits `X10. 000` (space in a number) → parser produces an error token
- Generator emits `G99` (unknown G-code) → parser stores it without error, but the
  operation has no `motionMode` — a logical bug

Round-trip testing is more powerful than testing generator and parser separately
because it catches **integration bugs** — bugs that only appear when the two systems
interact.

```typescript
function validateProgram(programText: string): {
  blockCount:    number
  errorCount:    number
  errorMessages: string[]
} {
  const lines      = programText.split('\n')
  const { blocks } = parseGcode(lines)

  const errorBlocks    = blocks.filter((block) => block.errors.length > 0)
  const errorMessages  = errorBlocks.flatMap((block) => block.errors)

  return {
    blockCount:  blocks.length,
    errorCount:  errorBlocks.length,
    errorMessages,
  }
}
```

**`Array.flatMap` — first appearance:**
`array.flatMap(fn)` maps each element with `fn` and then flattens the results one
level. `[[1,2],[3],[4,5]].flatMap(arr => arr)` produces `[1,2,3,4,5]`. Here, each
`block.errors` is a `string[]`. `errorBlocks.flatMap(block => block.errors)` collects
all error strings from all error blocks into a single flat array. Equivalent to
`errorBlocks.map(b => b.errors).flat()` but more concise.

**`blocks.filter(block => block.errors.length > 0)` — finding error blocks:**
`parseGcode` returns all blocks, including those with errors (the errors are stored in
`block.errors` rather than thrown). We filter to only the blocks that have at least
one error. An empty `block.errors` means the block parsed correctly.

---

## Step 4 — The Browser File Download

### The problem

We have a string containing the complete G-code program. We need to offer it as a
downloadable file. This requires two browser APIs that have not appeared before.

### How browser downloads work — first explanation

The browser's download mechanism uses a **Blob** (Binary Large Object) — an in-memory
file-like object — and a temporary URL that points to it.

**`Blob` — first appearance:**
`new Blob([content], { type: mimeType })` creates an in-memory file containing
`content`. `content` can be a string, an `ArrayBuffer`, or other types.

- `[content]` is an array of parts — the Blob is assembled from multiple chunks if
  needed. Here there is one chunk: the full program string.
- `type: 'text/plain'` is the **MIME type** (Multipurpose Internet Mail Extensions)
  — a standardised label for the file's format. `text/plain` is plain text. `text/plain`
  is correct for G-code — the `.nc` extension tells the machine tool software what
  it is.

**`URL.createObjectURL(blob)` — first appearance:**
Creates a temporary URL of the form `blob:https://your-app/uuid`. This URL exists
only in the current browser tab and points to the in-memory `Blob`. No network
request is made — the URL is purely local. The URL expires when you call
`URL.revokeObjectURL(url)` or when the tab is closed.

**`URL.revokeObjectURL(url)` — why revocation is required:**
The browser keeps the `Blob` in memory until its URL is revoked. If you create 100
download URLs without revoking them, the browser holds 100 Blobs in memory — a
memory leak. Revoking immediately after initiating the download releases the memory
while the browser has already begun the transfer.

### Create `src/gcode/downloadGcode.ts`

```typescript
export function downloadGcodeFile(
  programText: string,
  filename:    string = 'program.nc',
): void {
  const blob         = new Blob([programText], { type: 'text/plain' })
  const objectUrl    = URL.createObjectURL(blob)
  const anchorElement = document.createElement('a')

  anchorElement.href     = objectUrl
  anchorElement.download = filename
  anchorElement.style.display = 'none'

  document.body.appendChild(anchorElement)
  anchorElement.click()
  document.body.removeChild(anchorElement)

  URL.revokeObjectURL(objectUrl)
}
```

**`document.createElement('a')` — programmatic link creation:**
A browser download is triggered by clicking an anchor element (`<a>`) with a `download`
attribute. We create the anchor element in JavaScript (not in HTML), set its `href` to
the Blob URL, set `download` to the desired filename, temporarily add it to the DOM,
programmatically click it, and remove it.

`document.createElement(tagName)` creates a DOM element of the given HTML tag. The
element is not attached to the document — it exists in memory only until
`appendChild` inserts it.

**`anchorElement.download = filename`:**
The `download` attribute on an anchor element tells the browser to download the linked
resource rather than navigate to it. The value is the suggested filename. The browser
may append an extension or modify the name based on the MIME type. Without `download`,
clicking the anchor would navigate to the Blob URL, displaying the G-code as a page
rather than downloading it.

**`anchorElement.style.display = 'none'`:**
The anchor element is briefly in the DOM while we click it programmatically. Setting
`display: none` prevents it from appearing in the page layout. Without this, a brief
flash might appear.

**`document.body.appendChild` and `removeChild`:**
`appendChild` inserts the element as the last child of `document.body`. This is
required because some browsers only allow programmatic clicks on elements that are in
the DOM. `removeChild` removes it immediately after the click. The element exists in
the DOM for approximately one JavaScript event loop tick.

**Security — what the user downloads:**
`programText` is generated entirely by our own code (`exportFanucProgram`), not by
user-typed input. There is no injection risk: the file contains only the G-code we
generated. If user-typed tool names or sketch labels were included in comments, they
should be sanitised to strip parentheses — unbalanced parentheses in G-code comments
can confuse some parsers.

---

## Step 5 — The Export Button in the Toolbar

### Add to the application toolbar (in `src/components/Toolbar.tsx` or equivalent)

```typescript
import { exportFanucProgram }  from '../gcode/exporter.js'
import { downloadGcodeFile }   from '../gcode/downloadGcode.js'
import type { ExportableOperation } from '../gcode/exporter.js'

interface ExportButtonProps {
  operations: ExportableOperation[]
}

export function ExportButton({ operations }: ExportButtonProps) {
  const [validationSummary, setValidationSummary] = useState<string>('')

  function handleExport(): void {
    if (operations.length === 0) {
      setValidationSummary('No operations to export.')
      return
    }

    const result = exportFanucProgram(operations)

    if (result.errorCount > 0) {
      setValidationSummary(
        `Warning: ${result.errorCount} block(s) with errors. ` +
        result.errorMessages.slice(0, 3).join('; ')
      )
    } else {
      setValidationSummary(`Validated ${result.blockCount} blocks — no errors.`)
    }

    const timestamp = new Date().toISOString().slice(0, 10)
    downloadGcodeFile(result.programText, `cam-export-${timestamp}.nc`)
  }

  return (
    <div className="export-section">
      <button className="export-btn" onClick={handleExport}>
        Export G-code
      </button>
      {validationSummary !== '' && (
        <span className="validation-summary">{validationSummary}</span>
      )}
    </div>
  )
}
```

**`result.errorMessages.slice(0, 3).join('; ')` — truncating the error list:**
`.slice(0, 3)` extracts the first 3 elements of the array (or fewer if there are
fewer than 3). `.join('; ')` concatenates them with `'; '` as separator. We show at
most 3 errors in the UI — more than 3 would overflow the toolbar. A "see console for
full list" strategy is appropriate for additional errors, but for a learning project
showing 3 is sufficient.

**`new Date().toISOString().slice(0, 10)` — formatting a date:**
`toISOString()` returns `"2026-06-10T14:32:07.000Z"`. `.slice(0, 10)` extracts the
first 10 characters: `"2026-06-10"`. This is an ISO 8601 date without the time
portion — a clean filename component. The downloaded file is named
`cam-export-2026-06-10.nc`.

---

## Step 6 — Tests

### Create `src/gcode/exporter.test.ts`

```typescript
import { describe, test, expect }  from 'vitest'
import { exportFanucProgram }       from './exporter.js'
import type { ExportableOperation } from './exporter.js'

const sampleOperation: ExportableOperation = {
  label: 'Test contour',
  gcode: [
    'G21 G90 G17',
    'G0 Z5.000',
    'G0 X0.000 Y0.000',
    'G1 Z-3.000 F150',
    'G1 X10.000 Y0.000 F500',
    'G1 X0.000 Y0.000 F500',
    'G0 Z5.000',
    'M30',
  ].join('\n'),
}

describe('exportFanucProgram', () => {
  test('output starts with % and program number', () => {
    const result = exportFanucProgram([sampleOperation])
    const lines  = result.programText.split('\n')
    expect(lines[0]).toBe('%')
    expect(lines[1]).toMatch(/^O\d{4}$/)
  })

  test('output ends with M30 and %', () => {
    const result = exportFanucProgram([sampleOperation])
    const lines  = result.programText.split('\n').filter((l) => l.trim() !== '')
    expect(lines[lines.length - 2]).toBe('M30')
    expect(lines[lines.length - 1]).toBe('%')
  })

  test('filters M30 and program number from individual operations', () => {
    const result = exportFanucProgram([sampleOperation])
    const lines  = result.programText.split('\n')
    const m30Lines = lines.filter((l) => l.trim() === 'M30')
    expect(m30Lines).toHaveLength(1)
  })

  test('validates successfully for correct G-code', () => {
    const result = exportFanucProgram([sampleOperation])
    expect(result.errorCount).toBe(0)
    expect(result.blockCount).toBeGreaterThan(0)
  })

  test('custom program number is formatted as four digits', () => {
    const result = exportFanucProgram([sampleOperation], 42)
    expect(result.programText).toContain('O0042')
  })

  test('empty operations array produces no motion blocks', () => {
    const result = exportFanucProgram([])
    expect(result.blockCount).toBeGreaterThan(0)
    expect(result.errorCount).toBe(0)
  })
})
```

**`expect(lines[1]).toMatch(/^O\d{4}$/)` — regex in tests:**
`.toMatch(regex)` asserts that the string matches the regular expression.
`/^O\d{4}$/` means: start of string (`^`), literal `O`, exactly four digits (`\d{4}`),
end of string (`$`). This checks the program number format without hardcoding a
specific value. Regular expressions in JavaScript are written between `/` delimiters
with optional flags after the closing `/`.

`\d` matches any digit (0-9). `{4}` is a quantifier: "exactly 4 of the preceding
pattern." This is more precise than checking for the string `'O0001'` — it validates
the format without tying the test to a specific number.

**Testing the filter — one M30 in combined output:**
The test verifies that even though `sampleOperation.gcode` contains an `M30`, the
combined output has only one. This is a **contract test**: we are testing that the
combination rule (filter per-operation M30) is correctly applied.

Run `npm test`. All six tests pass.

---

## Connect the Pieces

The export pipeline closes the full application loop:

```
Sketch (lessons 07–11)
  ──► offsetPolygon (lesson 21)
  ──► generateContourGcode (lesson 22)
  ──► generateDrillGcode (lesson 23)
  ──► exportFanucProgram (this lesson)
  ──► validateProgram → parseGcode (lesson 18)
  ──► downloadGcodeFile → Blob → browser download → .nc file
```

The `.nc` file that the user downloads can be opened in CAM software (Fusion 360,
Mastercam, or a free viewer like NC Viewer) and simulated. If the G-code is correct,
the simulation matches the Three.js viewport. This is the ultimate validation: the
visual output and the machine output agree.

The `exportFanucProgram` function is the **aggregation layer** — it collects outputs
from multiple independent generators and produces a unified program. This pattern
(independent generators, single combiner) appears in build systems (`webpack`, `esbuild`
bundle multiple modules into one file), API gateways (combine multiple service
responses into one response), and report generators (aggregate data from multiple
queries into one document).

---

## What Breaks Without This

**Without round-trip validation:**
A generator bug that produces invalid G-code — for example, `G01` instead of `G1`
(G01 is valid on some controllers, invalid on others) — would not be caught until the
file is loaded onto a machine. The round-trip validation catches such issues
immediately at export time. The `errorCount > 0` warning in the UI gives the operator
a reason to investigate before taking the file to the machine.

**Without `URL.revokeObjectURL`:**
Each export creates a Blob URL that persists in browser memory until revoked. Exporting
10 programs holds 10 copies of the G-code text in memory — potentially megabytes. In
a long session where the operator refines and re-exports frequently, memory grows
unboundedly. `revokeObjectURL` frees the memory immediately after the download begins.
The download is not affected — the browser already has the file in flight.

**Without `anchorElement.style.display = 'none'`:**
The temporarily added anchor element briefly appears in the page layout. If the body
has `display: flex` or `display: grid`, the anchor might displace other elements for
one frame. Depending on the layout, this could cause a visible flash. `display: none`
prevents the element from participating in layout entirely.

---

## Definition of Done

- [ ] `npm test` passes all six tests in `exporter.test.ts`
- [ ] "Export G-code" button appears in the toolbar
- [ ] Clicking it downloads a `.nc` file to the user's computer
- [ ] The downloaded file opens correctly in a text editor
- [ ] The validation summary shows block count and "no errors" for valid programs
- [ ] A validation error (simulated by editing the generator to emit bad syntax) shows the warning message
- [ ] The file begins with `%`, `O0001`, safe start codes and ends with `M30`, `%`
- [ ] You can explain what a Blob is and why `URL.revokeObjectURL` is needed
- [ ] You can explain the `download` attribute on an anchor element
- [ ] You can explain what round-trip testing proves and why it catches integration bugs
- [ ] You can explain `padStart(4, '0')` and name another common use case for it
- [ ] You can explain `flatMap` and the difference between `map().flat()` and `flatMap()`
- [ ] Run:
      ```
      git add src/gcode/
      git commit -m "Add G-code exporter: Fanuc program assembly, round-trip validation via parser, browser file download via Blob URL"
      ```

---

## Project Complete — Definition of Done

You have built a complete browser-based CAD/CAM application:

- **3D viewport** (lessons 01–05): Three.js scene, orbit controls, raycasting
- **Sketch mode** (lessons 06–11): 2D drawing on planes, constraints, Newton-Raphson solver
- **3D solid modelling** (lessons 12–14): extrusion, face selection, sketching on faces
- **Python backend** (lesson 15): geometry computation via REST API
- **G-code pipeline** (lessons 16–19): lexer → parser → simulator → renderer
- **CAM operations** (lessons 20–24): tool library, polygon offset, contour, drill, export

The application is a vertical slice of the OpenMAT CAD/CAM engine. Every module you
have built — the lexer, the parser, the constraint solver, the polygon offset algorithm
— has a direct counterpart in production CAM software. The patterns (pipeline
architecture, pure functions, boundary types, lifting state, round-trip testing) are
the same patterns used in Fusion 360, Mastercam, and the open-source OpenCASCADE
kernel.

The full project definition of done (from the README):

- [ ] Every lesson's tests pass: `npm test` produces no failures
- [ ] A sketch can be drawn, constrained, and extruded into a 3D solid
- [ ] A G-code file can be loaded, simulated, and visualised as an animated toolpath
- [ ] A contour toolpath can be generated from selected sketch geometry and exported
- [ ] A drill cycle can be generated from selected circle centres and exported
- [ ] The exported `.nc` file is valid Fanuc G-code (open it in a viewer to verify)
- [ ] You can explain how the constraint solver works and what Newton-Raphson is doing
- [ ] You can explain the difference between parsing G-code and simulating it
- [ ] You can open a production CAM system (Fusion 360 free, FreeCAD) and recognise the same pipeline: sketch → toolpath → simulate → export
