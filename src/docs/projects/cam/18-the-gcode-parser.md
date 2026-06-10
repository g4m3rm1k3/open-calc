# CAD/CAM — Lesson 18 — The G-code Parser

## What You Will Build

Each G-code block (line) is parsed into a structured `ParsedBlock` containing the
active G-code, axis positions, feed rate, and whether positioning is absolute or
relative. Modal state persists across blocks — a feed rate set on line 5 applies to
line 6 if not overridden. The parsed blocks are displayed in the G-code panel as
structured data alongside the raw text. An invalid block shows the error clearly.

## What You Need to Know First

Lessons 01–17. The G-code lexer produces word tokens. This lesson builds the parser
on top: consuming token arrays, tracking modal state, producing structured data.

---

## The Problem

Tokenising `G1 X50 F300` produces `[ WORD('G',1), WORD('X',50), WORD('F',300) ]`.
These tokens say "there are words here" but not "this is a feed-rate move that
positions X at 50mm using 300mm/min." Parsing assigns **meaning** to the token sequence.

G-code parsing has a unique challenge: **modal state**. Line `N50 G1 X50` does not
specify a feed rate. If the previous block established `F300`, that feed rate still
applies. The parser must carry a modal state object and update it as each block is
processed.

---

## Step 1 — Modal State

### Create `src/gcode/modalState.ts`

```typescript
export type PositioningMode = 'absolute' | 'relative'
export type Units           = 'mm' | 'inches'
export type MotionMode      = 'rapid' | 'linear' | 'arc-cw' | 'arc-ccw'

export interface ModalState {
  positioningMode: PositioningMode
  units:           Units
  motionMode:      MotionMode
  feedRate:        number
  spindleSpeed:    number
  activeToolNumber: number
  currentX:        number
  currentY:        number
  currentZ:        number
}

export function createInitialModalState(): ModalState {
  return {
    positioningMode:  'absolute',
    units:            'mm',
    motionMode:       'rapid',
    feedRate:         0,
    spindleSpeed:     0,
    activeToolNumber: 1,
    currentX:         0,
    currentY:         0,
    currentZ:         0,
  }
}
```

**What `modalState.ts` is:**
`modalState.ts` owns the G-code machine state — the accumulated context that
persists between blocks. Each parsed block updates the modal state; subsequent
blocks inherit the updated state. Keeping this in a separate module makes the
state machine explicit and independently testable.

**`currentX/Y/Z` in modal state:**
The parser tracks the machine's current position. In **absolute mode** (`G90`), new
coordinates are the target position. In **relative mode** (`G91`), new coordinates
are offsets from the current position. The modal state must track the current position
to compute absolute coordinates from relative inputs.

---

## Step 2 — The Parsed Block Type

### Create `src/gcode/parser.ts`

```typescript
import { GcodeToken, GcodeWord, tokeniseGcodeLine } from './lexer.js'
import { ModalState, createInitialModalState }       from './modalState.js'
```

**Import explanation:**
`lexer.ts` owns the tokenisation step (lesson 17). We import `tokeniseGcodeLine` to
tokenise each line before parsing, `GcodeToken` for the token union type, and `GcodeWord`
for filtering only WORD tokens.

`modalState.ts` owns the modal state definition (this lesson). We import `ModalState`
for the type and `createInitialModalState` for the initial state when parsing begins.

```typescript
export interface ParsedBlock {
  lineNumber:     number | null
  programNumber:  number | null
  motionMode:     ModalState['motionMode']
  targetX:        number
  targetY:        number
  targetZ:        number
  arcI:           number | null  // arc centre X offset
  arcJ:           number | null  // arc centre Y offset
  arcR:           number | null  // arc radius (alternative to I/J)
  feedRate:       number
  spindleSpeed:   number
  toolNumber:     number | null
  auxFunction:    number | null  // M-code: 3=spindle on, 5=spindle off, 30=end
  positioningMode: ModalState['positioningMode']
  errors:         string[]
}
```

**Why `ParsedBlock` contains resolved coordinates:**
`ParsedBlock` stores the absolute target position (`targetX/Y/Z`), not the raw
word values. The parser resolves relative coordinates to absolute during parsing.
Consumers of `ParsedBlock` (the simulator in lesson 19) always receive absolute
coordinates — they do not need to know whether the original G-code used G90 or G91.

**`arcI/arcJ/arcR`:**
For circular moves (`G2`/`G3`), the arc is specified either by I/J offsets from the
start point to the centre, or by radius R. Both are represented in the block; the
simulator (lesson 19) chooses which to use based on which is non-null.

---

## Step 3 — Parsing a Line

```typescript
export function parseLine(
  line:        string,
  modalState:  ModalState,
): { block: ParsedBlock; updatedModalState: ModalState } {
  const tokens  = tokeniseGcodeLine(line)
  const words   = tokens.filter((t): t is GcodeWord => t.type === 'WORD')
  const errors: string[] = []

  tokens.filter((t) => t.type === 'ERROR').forEach((errorToken) => {
    if (errorToken.type === 'ERROR') {
      errors.push(`Unknown character '${errorToken.char}' at position ${errorToken.position}`)
    }
  })

  // Extract words by letter using a helper
  function getWord(letter: string): number | null {
    const word = words.find((w) => w.letter === letter)
    return word?.value ?? null
  }

  // Update modal state from G-words
  let updatedModal = { ...modalState }

  const gValue = getWord('G')
  if (gValue !== null) {
    if (gValue === 90)  updatedModal.positioningMode = 'absolute'
    if (gValue === 91)  updatedModal.positioningMode = 'relative'
    if (gValue === 20)  updatedModal.units            = 'inches'
    if (gValue === 21)  updatedModal.units            = 'mm'
    if (gValue === 0)   updatedModal.motionMode       = 'rapid'
    if (gValue === 1)   updatedModal.motionMode       = 'linear'
    if (gValue === 2)   updatedModal.motionMode       = 'arc-cw'
    if (gValue === 3)   updatedModal.motionMode       = 'arc-ccw'
  }

  const feedRate = getWord('F')
  if (feedRate !== null) updatedModal.feedRate = feedRate

  const spindleSpeed = getWord('S')
  if (spindleSpeed !== null) updatedModal.spindleSpeed = spindleSpeed

  // Resolve target position
  const rawX = getWord('X')
  const rawY = getWord('Y')
  const rawZ = getWord('Z')

  let targetX = updatedModal.currentX
  let targetY = updatedModal.currentY
  let targetZ = updatedModal.currentZ

  if (rawX !== null) {
    targetX = updatedModal.positioningMode === 'absolute'
      ? rawX
      : updatedModal.currentX + rawX
  }
  if (rawY !== null) {
    targetY = updatedModal.positioningMode === 'absolute'
      ? rawY
      : updatedModal.currentY + rawY
  }
  if (rawZ !== null) {
    targetZ = updatedModal.positioningMode === 'absolute'
      ? rawZ
      : updatedModal.currentZ + rawZ
  }

  // Update current position
  updatedModal.currentX = targetX
  updatedModal.currentY = targetY
  updatedModal.currentZ = targetZ

  const block: ParsedBlock = {
    lineNumber:      getWord('N'),
    programNumber:   getWord('O'),
    motionMode:      updatedModal.motionMode,
    targetX,
    targetY,
    targetZ,
    arcI:            getWord('I'),
    arcJ:            getWord('J'),
    arcR:            getWord('R'),
    feedRate:        updatedModal.feedRate,
    spindleSpeed:    updatedModal.spindleSpeed,
    toolNumber:      getWord('T'),
    auxFunction:     getWord('M'),
    positioningMode: updatedModal.positioningMode,
    errors,
  }

  return { block, updatedModalState: updatedModal }
}
```

**`tokens.filter((t): t is GcodeWord => t.type === 'WORD')` — type narrowing in filter:**
`(t): t is GcodeWord` is a **type predicate** in the filter callback (introduced in
the calculator project's lesson 04). `Array.filter` with a type predicate produces
a narrowed array type — the result is `GcodeWord[]`, not `GcodeToken[]`. Without
the type predicate, TypeScript would infer `GcodeToken[]` for the filtered array.

**`word?.value ?? null` — optional chaining with nullish coalescing:**
`words.find(...)` returns `GcodeWord | undefined`. `?.value` accesses `value` if
the word was found, producing `number | undefined`. `?? null` converts `undefined`
to `null` so the return type is `number | null`. This chain is a compact way to
express "find the word's value or null if not found."

### Walkthrough — parsing `G1 X50.0 Y25.0 F300`

Starting modal state: `positioningMode: 'absolute', motionMode: 'linear', feedRate: 0`

Tokens: `[ WORD('G',1), WORD('X',50.0), WORD('Y',25.0), WORD('F',300) ]`

```
gValue = 1 → motionMode = 'linear'
feedRate = 300 → updatedModal.feedRate = 300

rawX = 50.0 → absolute: targetX = 50.0
rawY = 25.0 → absolute: targetY = 25.0
rawZ = null → targetZ = currentZ (unchanged, e.g., 0)

updatedModal.currentX = 50.0
updatedModal.currentY = 25.0

Block: {
  motionMode: 'linear',
  targetX: 50.0, targetY: 25.0, targetZ: 0,
  feedRate: 300,
  ...
}
```

### Parsing a full program

```typescript
export function parseGcode(lines: string[]): {
  blocks: ParsedBlock[]
  finalModalState: ModalState
} {
  let   modalState = createInitialModalState()
  const blocks: ParsedBlock[] = []

  for (const line of lines) {
    if (line.trim() === '' || line.trim() === '%') continue

    const { block, updatedModalState } = parseLine(line, modalState)
    blocks.push(block)
    modalState = updatedModalState
  }

  return { blocks, finalModalState: modalState }
}
```

---

## Step 4 — Tests

### Create `src/gcode/parser.test.ts`

```typescript
import { describe, test, expect } from 'vitest'
import { parseLine, parseGcode }  from './parser.js'
import { createInitialModalState } from './modalState.js'

describe('G-code parser', () => {
  test('G1 linear move sets motion mode and position', () => {
    const { block } = parseLine('G1 X50.0 Y25.0 F300', createInitialModalState())
    expect(block.motionMode).toBe('linear')
    expect(block.targetX).toBe(50.0)
    expect(block.targetY).toBe(25.0)
    expect(block.feedRate).toBe(300)
  })

  test('modal feedRate persists to next line', () => {
    const { updatedModalState } = parseLine('F500', createInitialModalState())
    const { block } = parseLine('G1 X10', updatedModalState)
    expect(block.feedRate).toBe(500)
  })

  test('G91 relative mode resolves to absolute positions', () => {
    const initial = { ...createInitialModalState(), currentX: 10, currentY: 5 }
    const { block } = parseLine('G91 X5 Y-3', initial)
    expect(block.targetX).toBe(15)
    expect(block.targetY).toBe(2)
    expect(block.positioningMode).toBe('relative')
  })

  test('G90 switches back to absolute', () => {
    const relative = { ...createInitialModalState(), positioningMode: 'relative' as const }
    const { block } = parseLine('G90 X10', relative)
    expect(block.positioningMode).toBe('absolute')
    expect(block.targetX).toBe(10)
  })

  test('errors from lexer are surfaced in block', () => {
    const { block } = parseLine('G0 @ X10', createInitialModalState())
    expect(block.errors).toHaveLength(1)
    expect(block.errors[0]).toContain('@')
  })
})
```

Run `npm test`. All tests pass.

---

## Debugging: When Parser Produces Wrong Positions

**Symptom: G91 relative moves produce wrong positions**

The parser is not adding the offset to `currentX/Y/Z`. Check the relative mode
branch: `targetX = updatedModal.currentX + rawX`. If it reads `modalState.currentX`
(before the modal update from the current block) instead of `updatedModal.currentX`,
positioning errors accumulate.

**Symptom: feed rate from previous line not used**

The `updatedModalState` is not passed from one `parseLine` call to the next in
`parseGcode`. Verify the loop updates `modalState = updatedModalState` after each
line.

Remove all temporary `console.log` statements before committing.

---

## Connect the Pieces

`parseGcode(lines)` produces an array of `ParsedBlock` objects and a final modal
state. The `ParsedBlock` array is the input to the toolpath simulator (lesson 19).
The final modal state is useful for detecting end-of-program conditions (M30 found).

The parser is **dialect-independent** in its output: `ParsedBlock` always contains
absolute coordinates regardless of whether the input used G90 or G91. The simulator
never needs to track positioning mode — the parser handles it. This is the design
principle of separating parsing from interpretation: parse once, consume many times.

---

## What Breaks Without This

**Without tracking `currentX/Y/Z` in modal state:**
Relative mode moves cannot be resolved to absolute coordinates. `G91 X5` with
current position `X=10` should target `X=15`. Without tracking current position,
the parser would return `targetX = 5` — wrong.

**Without modal persistence across lines:**
Every block would need to re-specify every mode (G90, G21, etc.) and every
parameter (F, S). This is actually valid G-code — but rare in practice. More
importantly, the simulator would receive blocks with `feedRate: 0` for every line
that does not re-specify `F`, causing the simulator to treat them as instantaneous
moves.

---

## Definition of Done

- [ ] `parseLine('G1 X50 F300', initialState)` returns the correct ParsedBlock
- [ ] Feed rate, spindle speed, and motion mode persist across lines
- [ ] G91 relative moves correctly resolve to absolute positions
- [ ] Lexer errors surface in `block.errors`
- [ ] `npm test` passes all tests in `parser.test.ts`
- [ ] You can explain modal state with a concrete example across two lines
- [ ] You can explain why `ParsedBlock` stores absolute coordinates, not raw values
- [ ] You can explain the type predicate in the filter call
- [ ] Run:
      ```
      git add src/gcode/
      git commit -m "Add G-code parser: modal state tracking, relative/absolute resolution, ParsedBlock as dialect-independent output"
      ```

---

*Next: Lesson 19 — The Toolpath Simulator. Parsed G-code converted to 3D moves
drawn as lines. Arc interpolation for G02/G03 circular moves derived.*
