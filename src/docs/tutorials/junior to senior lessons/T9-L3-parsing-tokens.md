# Junior to Senior — T9·L3 — Parsing Tokens into Typed Objects

**Prerequisites:** T9·L2 (Tokenisation). You have a working tokeniser. This lesson
builds the parser — the second stage that converts the token stream into typed
G-code command objects.

**What this lab adds:**
- Recursive descent: one function per grammar rule
- A G-code block: word tokens on one line → one command object
- Error recovery: on invalid block, report error, advance to next line, continue
- Discriminated union types for all command types
- The visitor pattern: walking the parsed structure

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `G01 X50 Y25 F400` — how many tokens? How many parsed objects?
> 2. The parser encounters `G99` (an unknown G-code). Should it crash, ignore
>    it silently, or do something else?
> 3. You have `LinearMove`, `ArcMove`, `SpindleOn` command types. A function
>    processes any of them. Which TypeScript pattern ensures you handle all cases?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A parser that converts G-code blocks into typed command objects:

```ts
const source = 'G01 X50.0 Y25.0 F400\nG02 X60 Y30 I5 J0\nM03 S1000\n';
const program = parse(source);

program.commands.forEach(cmd => {
  if (cmd.type === 'LINEAR_MOVE') {
    console.log(`Linear to (${cmd.x}, ${cmd.y}) at feed ${cmd.feed}`);
  }
});
```

---

### Concept: G-Code Grammar

A G-code program is a sequence of **blocks** (lines). Each block contains
zero or more **words** (tokens). The parser reads the words on a block and
determines what command they describe.

**G-code block grammar (simplified):**

```
program    → block* EOF
block      → word* END_OF_BLOCK
word       → G_WORD | M_WORD | AXIS_WORD | F_WORD | S_WORD | ...
```

**Command identification:**

```ts
// The G-word determines the command type:
if (block has G01 or G00)   → LinearMove
if (block has G02 or G03)   → ArcMove
if (block has M03 or M04)   → SpindleCommand
if (block has G90 or G91)   → ModalChange
if (block has G17/G18/G19)  → PlaneSelection
```

---

### Concept: Discriminated Union for Commands

```ts
interface LinearMove {
  type:    'LINEAR_MOVE';
  rapid:   boolean;     // G00 (true) vs G01 (false)
  x?:      number;
  y?:      number;
  z?:      number;
  feed?:   number;
  line:    number;
}

interface ArcMove {
  type:    'ARC_MOVE';
  cw:      boolean;     // G02 (CW) vs G03 (CCW)
  x?:      number;
  y?:      number;
  z?:      number;
  i?:      number;
  j?:      number;
  r?:      number;
  feed?:   number;
  line:    number;
}

interface SpindleCommand {
  type:    'SPINDLE_COMMAND';
  on:      boolean;     // M03/M04 (true) vs M05 (false)
  speed?:  number;
  line:    number;
}

interface ModalChange {
  type:    'MODAL_CHANGE';
  codes:   number[];    // [90, 17] for G90 G17 on one line
  line:    number;
}

interface ParseError {
  type:    'ERROR';
  message: string;
  line:    number;
  raw:     string;
}

export type GCodeCommand =
  | LinearMove
  | ArcMove
  | SpindleCommand
  | ModalChange
  | ParseError;
```

---

## Step 1 — Build the Parser

Create `src/parser.ts`:

```ts
import { tokenise } from './tokeniser';
import type { Token } from './tokens';
import type { GCodeCommand } from './commands';

// Collect tokens for one block (up to END_OF_BLOCK or EOF):
function collectBlock(iter: Iterator<Token>): { tokens: Token[]; atEOF: boolean } {
  const tokens: Token[] = [];
  let   atEOF = false;

  for (;;) {
    const { value: t, done } = iter.next();
    if (done || t.type === 'EOF') { atEOF = true; break; }
    if (t.type === 'END_OF_BLOCK') break;
    if (t.type !== 'COMMENT' && t.type !== 'ERROR') {
      tokens.push(t);
    }
  }

  return { tokens, atEOF };
}

function getGCodes(block: Token[]): number[] {
  return block
    .filter(t => t.type === 'G_WORD')
    .map(t => t.value as number);
}

function getMCodes(block: Token[]): number[] {
  return block
    .filter(t => t.type === 'M_WORD')
    .map(t => t.value as number);
}

function getAxisValue(block: Token[], axis: string): number | undefined {
  const t = block.find(t =>
    t.type === 'AXIS_WORD' &&
    (t.value as { axis: string }).axis === axis
  );
  return t ? (t.value as { value: number }).value : undefined;
}

function getFeed(block: Token[]): number | undefined {
  const t = block.find(t => t.type === 'F_WORD');
  return t ? (t.value as number) : undefined;
}

function parseBlock(block: Token[], lineNumber: number): GCodeCommand | null {
  if (block.length === 0) return null;

  const gCodes = getGCodes(block);
  const mCodes = getMCodes(block);

  // Linear move (G00 or G01):
  if (gCodes.includes(0) || gCodes.includes(1)) {
    return {
      type:  'LINEAR_MOVE',
      rapid: gCodes.includes(0),
      x:     getAxisValue(block, 'X'),
      y:     getAxisValue(block, 'Y'),
      z:     getAxisValue(block, 'Z'),
      feed:  getFeed(block),
      line:  lineNumber,
    };
  }

  // Arc move (G02 or G03):
  if (gCodes.includes(2) || gCodes.includes(3)) {
    return {
      type: 'ARC_MOVE',
      cw:   gCodes.includes(2),
      x:    getAxisValue(block, 'X'),
      y:    getAxisValue(block, 'Y'),
      z:    getAxisValue(block, 'Z'),
      i:    getAxisValue(block, 'I'),
      j:    getAxisValue(block, 'J'),
      r:    getAxisValue(block, 'R'),
      feed: getFeed(block),
      line: lineNumber,
    };
  }

  // Spindle (M03, M04, M05):
  if (mCodes.some(c => [3, 4, 5].includes(c))) {
    const speedToken = block.find(t => t.type === 'S_WORD');
    return {
      type:  'SPINDLE_COMMAND',
      on:    mCodes.some(c => [3, 4].includes(c)),
      speed: speedToken ? (speedToken.value as number) : undefined,
      line:  lineNumber,
    };
  }

  // Modal G-codes (G17/18/19, G90/91, etc.):
  if (gCodes.length > 0 || mCodes.length > 0) {
    return {
      type:  'MODAL_CHANGE',
      codes: gCodes,
      line:  lineNumber,
    };
  }

  return null;  // empty block — N-word only, comments, etc.
}

export interface ParseResult {
  commands: GCodeCommand[];
  errors:   GCodeCommand[];  // error type entries
}

export function parse(source: string): ParseResult {
  const commands: GCodeCommand[] = [];
  const errors:   GCodeCommand[] = [];
  const iter = tokenise(source)[Symbol.iterator]();
  let lineNumber = 1;

  for (;;) {
    const { tokens, atEOF } = collectBlock(iter);

    if (tokens.length > 0) {
      const cmd = parseBlock(tokens, lineNumber);
      if (cmd) {
        if (cmd.type === 'ERROR') {
          errors.push(cmd);
        } else {
          commands.push(cmd);
        }
      }
    }

    lineNumber++;
    if (atEOF) break;
  }

  return { commands, errors };
}
```

Create `src/commands.ts`:

```ts
export interface LinearMove {
  type: 'LINEAR_MOVE'; rapid: boolean;
  x?: number; y?: number; z?: number; feed?: number; line: number;
}
export interface ArcMove {
  type: 'ARC_MOVE'; cw: boolean;
  x?: number; y?: number; z?: number;
  i?: number; j?: number; r?: number; feed?: number; line: number;
}
export interface SpindleCommand {
  type: 'SPINDLE_COMMAND'; on: boolean; speed?: number; line: number;
}
export interface ModalChange {
  type: 'MODAL_CHANGE'; codes: number[]; line: number;
}
export interface ParseError {
  type: 'ERROR'; message: string; line: number; raw: string;
}
export type GCodeCommand = LinearMove | ArcMove | SpindleCommand | ModalChange | ParseError;
```

---

## Step 2 — Write Tests

Create `src/parser.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parse }                 from './parser';

describe('G-code parser', () => {

  it('parses a linear move', () => {
    const { commands } = parse('G01 X50.0 Y25.0 F400\n');
    expect(commands).toHaveLength(1);
    expect(commands[0].type).toBe('LINEAR_MOVE');
    if (commands[0].type === 'LINEAR_MOVE') {
      expect(commands[0].x).toBeCloseTo(50.0);
      expect(commands[0].y).toBeCloseTo(25.0);
      expect(commands[0].feed).toBe(400);
      expect(commands[0].rapid).toBe(false);
    }
  });

  it('parses a rapid move (G00)', () => {
    const { commands } = parse('G00 X0 Y0 Z5\n');
    expect(commands[0].type).toBe('LINEAR_MOVE');
    if (commands[0].type === 'LINEAR_MOVE') {
      expect(commands[0].rapid).toBe(true);
    }
  });

  it('parses a CW arc move (G02)', () => {
    const { commands } = parse('G02 X10 Y10 I5 J0 F300\n');
    expect(commands[0].type).toBe('ARC_MOVE');
    if (commands[0].type === 'ARC_MOVE') {
      expect(commands[0].cw).toBe(true);
      expect(commands[0].i).toBe(5);
    }
  });

  it('parses spindle on (M03)', () => {
    const { commands } = parse('M03 S1000\n');
    expect(commands[0].type).toBe('SPINDLE_COMMAND');
    if (commands[0].type === 'SPINDLE_COMMAND') {
      expect(commands[0].on).toBe(true);
      expect(commands[0].speed).toBe(1000);
    }
  });

  it('parses a multi-block program', () => {
    const src = 'G01 X10 F200\nG01 X20\nM05\n';
    const { commands } = parse(src);
    expect(commands).toHaveLength(3);
  });

  it('skips comment-only lines', () => {
    const { commands } = parse('; this is a comment\nG01 X10\n');
    expect(commands).toHaveLength(1);
  });

  it('records line numbers', () => {
    const { commands } = parse('G01 X10\nG01 Y20\n');
    expect(commands[0].line).toBe(1);
    expect(commands[1].line).toBe(2);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Implement the Visitor Pattern

**You know:** Discriminated unions, exhaustive type narrowing.

**Task:** Implement `describe(cmd: GCodeCommand): string` that returns a
human-readable description of any command using the discriminated union:

```ts
describe(LinearMove)    // → "Linear move to (50, 25) at feed 400"
describe(ArcMove)       // → "CW arc to (10, 10) with I=5 J=0"
describe(SpindleCommand) // → "Spindle ON at 1000 RPM"
describe(ModalChange)   // → "Modal G90 G17"
```

Use a `switch` on `cmd.type` — TypeScript should warn if you miss a case.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function describe(cmd: GCodeCommand): string {
  switch (cmd.type) {
    case 'LINEAR_MOVE': {
      const coords = [
        cmd.x !== undefined ? `X${cmd.x}` : '',
        cmd.y !== undefined ? `Y${cmd.y}` : '',
        cmd.z !== undefined ? `Z${cmd.z}` : '',
      ].filter(Boolean).join(', ');
      const feed = cmd.feed !== undefined ? ` at feed ${cmd.feed}` : '';
      return `${cmd.rapid ? 'Rapid' : 'Linear'} move to (${coords})${feed}`;
    }

    case 'ARC_MOVE': {
      const dir = cmd.cw ? 'CW' : 'CCW';
      const center = cmd.r !== undefined
        ? `R=${cmd.r}`
        : `I=${cmd.i ?? 0} J=${cmd.j ?? 0}`;
      return `${dir} arc to (X${cmd.x ?? '?'}, Y${cmd.y ?? '?'}) with ${center}`;
    }

    case 'SPINDLE_COMMAND': {
      const speed = cmd.speed !== undefined ? ` at ${cmd.speed} RPM` : '';
      return `Spindle ${cmd.on ? 'ON' : 'OFF'}${speed}`;
    }

    case 'MODAL_CHANGE':
      return `Modal ${cmd.codes.map(c => `G${c}`).join(' ')}`;

    case 'ERROR':
      return `Parse error at line ${cmd.line}: ${cmd.message}`;

    default: {
      // TypeScript ensures this is never reached (exhaustive check):
      const _exhaustive: never = cmd;
      return `Unknown command: ${JSON.stringify(_exhaustive)}`;
    }
  }
}
```

**Key insight:** The `default: never` trick: if you add a new command type to
`GCodeCommand` but forget to add a case to `switch`, TypeScript produces a compile
error because the new type is not assignable to `never`. This is exhaustive
type checking — the compiler guarantees you handle every case.

</details>

---

## Final Check

| Concept | Verify |
|---|---|
| One command per block | `G01 X50 Y25 F400` → one `LINEAR_MOVE` |
| Discriminated union | TypeScript narrows after `if (cmd.type === ...)` |
| Line numbers | Second block has `line: 2` |
| Comment blocks skipped | `; comment\nG01 X10` → one command |
| Exhaustive switch | Add new type → TypeScript error if switch case missing |

---

## Quick Check Answers

**1. `G01 X50 Y25 F400` — tokens vs parsed objects?**

5 tokens: `G_WORD(1)`, `AXIS_WORD(X,50)`, `AXIS_WORD(Y,25)`, `F_WORD(400)`,
`END_OF_BLOCK`. One parsed object: `LinearMove { x: 50, y: 25, feed: 400, rapid: false }`.
The parser collapses all the words on one line into a single command.

**2. Unknown G-code `G99` — crash, ignore silently, or something else?**

Something else: emit a `ModalChange` with `codes: [99]` and include the line number.
The caller can decide whether to log a warning or reject the program. Never crash —
a tokenise-and-parse pipeline should be resilient to unknown codes. Never ignore
silently — unknown codes may indicate a serious programming error or an unsupported
control dialect.

**3. Function processes `LinearMove`, `ArcMove`, `SpindleOn` — ensure all cases handled?**

Discriminated union with `type` field + `switch(cmd.type)` + `default: never`.
TypeScript narrows the type in each case, and the `never` default makes the compiler
report an error if any case is missing. This is the TypeScript analog to pattern
matching in functional languages.
