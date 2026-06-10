# Junior to Senior — T9·L3 — Parsing Tokens Into Typed Objects

**Prerequisites:** T9·L2 (Tokenisation). You have a working tokeniser. This lesson
builds the parser by explaining HOW it collects a block of tokens and WHICH G-code
determines the command type, and WHY discriminated unions are the right TypeScript
pattern for a value that can be one of several distinct types.

**What this lab adds:**
- HOW the parser collects one block: reads until `END_OF_BLOCK` or `EOF`
- WHY G-code numbers determine the command type — the lookup table
- What a discriminated union type is and WHY it is better than `any` for commands
- The `exhaustive switch` pattern — how TypeScript tells you when you missed a case
- Building and testing the parser incrementally: one command type at a time

**Time:** 60–90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. `G01 X50 Y25 F400` has 5 tokens. After the parser runs, how many objects exist?
>    What does the object look like?
> 2. `G02 X10 Y10 I5 J0` — the tokens are `[G_WORD(2), AXIS_WORD(X,10), AXIS_WORD(Y,10),
>    AXIS_WORD(I,5), AXIS_WORD(J,0)]`. How does the parser know this is a CW arc and not
>    a CCW arc?
> 3. TypeScript union `type Cmd = LinearMove | ArcMove`. In a function that takes `Cmd`,
>    you write `switch(cmd.type)`. TypeScript says `default: never`. What does this mean?
>
> *(Answers at the end of this lab)*

---

## The Parser's Two Jobs

The parser takes the flat token stream and does two things:

**Job 1: Collect a block**
```
Input: [G_WORD(1), AXIS_WORD(X,50), AXIS_WORD(Y,25), F_WORD(400), END_OF_BLOCK, ...]
Block: [G_WORD(1), AXIS_WORD(X,50), AXIS_WORD(Y,25), F_WORD(400)]
↑ collect tokens until END_OF_BLOCK, then stop
```

**Job 2: Identify and construct the command**
```
Block: [G_WORD(1), ...]
→ G_WORD value 1 → this is a linear move (G01 = rapid or linear)
→ find AXIS_WORD(X,?) → x = 50
→ find AXIS_WORD(Y,?) → y = 25
→ find F_WORD(?) → feed = 400
→ return: { type: 'LINEAR_MOVE', x: 50, y: 25, feed: 400, rapid: false }
```

The block collector is the same for every command type. The command builder differs
by G-code number.

---

## Step 1 — Define the Command Types

Create `src/commands.ts`:

```ts
// src/commands.ts
// Each command type is a separate interface with a discriminating 'type' field.
// The 'type' literal is what makes TypeScript able to narrow the union.

export interface LinearMove {
  type:    'LINEAR_MOVE';
  rapid:   boolean;      // G00 = rapid (true), G01 = feed move (false)
  x?:      number;       // optional: G01 Z5 has no X
  y?:      number;
  z?:      number;
  feed?:   number;       // optional: uses modal feed if not specified
  line:    number;       // source line number — for error messages
}

export interface ArcMove {
  type:    'ARC_MOVE';
  cw:      boolean;      // G02 = clockwise (true), G03 = counter-clockwise (false)
  x?:      number;
  y?:      number;
  z?:      number;
  i?:      number;       // arc centre offset from start, X-direction
  j?:      number;       // arc centre offset from start, Y-direction
  r?:      number;       // arc radius (alternative to I/J)
  feed?:   number;
  line:    number;
}

export interface SpindleCommand {
  type:    'SPINDLE_COMMAND';
  on:      boolean;      // M03/M04 = on (true), M05 = off (false)
  speed?:  number;       // S-word spindle speed
  line:    number;
}

export interface ModalChange {
  type:    'MODAL_CHANGE';
  codes:   number[];     // all G-codes on this line, e.g. [90, 17] for G90 G17
  line:    number;
}

export interface ParseError {
  type:    'ERROR';
  message: string;
  line:    number;
  raw:     string;       // the raw token text that caused the error
}

// The discriminated union — exactly one of these types per command:
export type GCodeCommand =
  | LinearMove
  | ArcMove
  | SpindleCommand
  | ModalChange
  | ParseError;

// Type guard: TypeScript narrows the type in a switch on cmd.type
// If you add a new type to GCodeCommand without handling it in a switch,
// the 'default: never' trick catches it at compile time
```

---

## Step 2 — Build the Block Collector

Create `src/parser.ts` incrementally:

```ts
// src/parser.ts
import { tokenise }                  from './tokeniser';
import type { Token }                from './tokens';
import type { GCodeCommand }         from './commands';

/**
 * Reads tokens until END_OF_BLOCK or EOF.
 * Returns the collected tokens and whether we hit the end of input.
 *
 * WHY a separate function? The block boundary (END_OF_BLOCK) is handled
 * the same way for every G-code command type. Separating it avoids
 * repeating the boundary logic in every command handler.
 */
function collectBlock(
  iter: Iterator<Token>
): { tokens: Token[]; atEOF: boolean } {
  const tokens: Token[] = [];
  let   atEOF = false;

  for (;;) {
    const { value: t, done } = iter.next();

    // Generator exhausted OR explicit EOF token:
    if (done || t.type === 'EOF') {
      atEOF = true;
      break;
    }

    // End of one block — stop collecting, return what we have:
    if (t.type === 'END_OF_BLOCK') break;

    // Skip comments and error tokens — they are not commands:
    if (t.type !== 'COMMENT' && t.type !== 'ERROR') {
      tokens.push(t);
    }
  }

  return { tokens, atEOF };
}
```

Add helper functions that extract specific word types from a block:

```ts
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

// getAxisValue('X') finds the AXIS_WORD token where axis === 'X' and returns its value
function getAxisValue(block: Token[], axis: string): number | undefined {
  const t = block.find(t =>
    t.type === 'AXIS_WORD' &&
    (t.value as { axis: string }).axis === axis
  );
  return t ? (t.value as { axis: string; value: number }).value : undefined;
}

function getFeed(block: Token[]): number | undefined {
  const t = block.find(t => t.type === 'F_WORD');
  return t ? (t.value as number) : undefined;
}
```

Add the block identifier:

```ts
function identifyBlock(block: Token[], lineNumber: number): GCodeCommand | null {
  if (block.length === 0) return null;  // blank line

  const gCodes = getGCodes(block);
  const mCodes = getMCodes(block);

  // Check G-codes first — G00 and G01 = linear move:
  if (gCodes.includes(0) || gCodes.includes(1)) {
    return {
      type:  'LINEAR_MOVE',
      rapid: gCodes.includes(0),   // G00 = rapid; G01 = feed move
      x:     getAxisValue(block, 'X'),
      y:     getAxisValue(block, 'Y'),
      z:     getAxisValue(block, 'Z'),
      feed:  getFeed(block),
      line:  lineNumber,
    };
  }

  // G02 = CW arc; G03 = CCW arc:
  if (gCodes.includes(2) || gCodes.includes(3)) {
    return {
      type: 'ARC_MOVE',
      cw:   gCodes.includes(2),   // G02 = clockwise; G03 = CCW
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

  // M03, M04 = spindle on; M05 = spindle off:
  if (mCodes.some(c => [3, 4, 5].includes(c))) {
    const speedToken = block.find(t => t.type === 'S_WORD');
    return {
      type:  'SPINDLE_COMMAND',
      on:    mCodes.some(c => [3, 4].includes(c)),
      speed: speedToken ? (speedToken.value as number) : undefined,
      line:  lineNumber,
    };
  }

  // Other G-codes (G90, G91, G17, G18, G40, etc.):
  if (gCodes.length > 0 || mCodes.length > 0) {
    return {
      type:  'MODAL_CHANGE',
      codes: gCodes,
      line:  lineNumber,
    };
  }

  return null;
}

export interface ParseResult {
  commands: GCodeCommand[];
  errors:   GCodeCommand[];  // only error-type entries
}

export function parse(source: string): ParseResult {
  const commands: GCodeCommand[] = [];
  const errors:   GCodeCommand[] = [];
  const iter = tokenise(source)[Symbol.iterator]();
  let lineNumber = 1;

  for (;;) {
    const { tokens, atEOF } = collectBlock(iter);

    if (tokens.length > 0) {
      const cmd = identifyBlock(tokens, lineNumber);
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

---

## Step 3 — Write Tests, One Command Type at a Time

Create `src/parser.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { parse }                 from './parser';

describe('G-code parser', () => {

  describe('linear move (G00, G01)', () => {

    it('parses G01 X50 Y25 F400 as LINEAR_MOVE', () => {
      const { commands } = parse('G01 X50 Y25 F400\n');

      expect(commands).toHaveLength(1);
      expect(commands[0].type).toBe('LINEAR_MOVE');

      // TypeScript narrows the type after the type check:
      if (commands[0].type === 'LINEAR_MOVE') {
        expect(commands[0].rapid).toBe(false);   // G01 = not rapid
        expect(commands[0].x).toBe(50);
        expect(commands[0].y).toBe(25);
        expect(commands[0].feed).toBe(400);
      }
    });

    it('parses G00 as rapid = true', () => {
      const { commands } = parse('G00 X0 Y0 Z5\n');
      if (commands[0].type === 'LINEAR_MOVE') {
        expect(commands[0].rapid).toBe(true);    // G00 = rapid
      }
    });

  });

  describe('arc move (G02, G03)', () => {

    it('parses G02 as CW arc (cw = true)', () => {
      const { commands } = parse('G02 X10 Y10 I5 J0\n');
      expect(commands[0].type).toBe('ARC_MOVE');
      if (commands[0].type === 'ARC_MOVE') {
        expect(commands[0].cw).toBe(true);    // G02 = clockwise
        expect(commands[0].i).toBe(5);
        expect(commands[0].j).toBe(0);
      }
    });

    it('parses G03 as CCW arc (cw = false)', () => {
      const { commands } = parse('G03 X10 Y10 I5 J0\n');
      if (commands[0].type === 'ARC_MOVE') {
        expect(commands[0].cw).toBe(false);   // G03 = counter-clockwise
      }
    });

  });

  describe('spindle commands (M03, M05)', () => {

    it('parses M03 S1000 as spindle on', () => {
      const { commands } = parse('M03 S1000\n');
      expect(commands[0].type).toBe('SPINDLE_COMMAND');
      if (commands[0].type === 'SPINDLE_COMMAND') {
        expect(commands[0].on).toBe(true);
        expect(commands[0].speed).toBe(1000);
      }
    });

    it('parses M05 as spindle off', () => {
      const { commands } = parse('M05\n');
      if (commands[0].type === 'SPINDLE_COMMAND') {
        expect(commands[0].on).toBe(false);
      }
    });

  });

  describe('multi-block programs', () => {

    it('parses multiple lines as separate commands', () => {
      const src = 'G01 X10 F200\nG01 X20\nM05\n';
      const { commands } = parse(src);
      expect(commands).toHaveLength(3);
    });

    it('records correct line numbers', () => {
      const { commands } = parse('G01 X10\nG01 Y20\n');
      expect(commands[0].line).toBe(1);
      expect(commands[1].line).toBe(2);
    });

    it('skips comment-only lines', () => {
      const { commands } = parse('; this is a comment\nG01 X10\n');
      expect(commands).toHaveLength(1);    // only the G01
    });

  });

});
```

### SAVE AND TRY

```bash
npm test
```

Expected: all tests pass.

**Change something:** In the parser, change the condition for `cw` from `gCodes.includes(2)` to `!gCodes.includes(2)`. Run the tests. Expected: the arc tests fail — G02 now produces `cw: false` (wrong). This shows the tests verify the actual logic, not just that something runs. Change back.

---

### Concept: Discriminated Unions and the `never` Trick

**What it is:** A discriminated union is a TypeScript union where each member has a
literal `type` field. The type checker uses this field to narrow the type in conditional blocks.

**The `never` trick for exhaustive checking:**

```ts
function describeCommand(cmd: GCodeCommand): string {
  switch (cmd.type) {
    case 'LINEAR_MOVE':    return `Move to X${cmd.x ?? '?'}`;
    case 'ARC_MOVE':       return `Arc (${cmd.cw ? 'CW' : 'CCW'})`;
    case 'SPINDLE_COMMAND': return `Spindle ${cmd.on ? 'ON' : 'OFF'}`;
    case 'MODAL_CHANGE':   return `Modal G${cmd.codes.join(' G')}`;
    case 'ERROR':          return `Error: ${cmd.message}`;
    default: {
      // This line catches any future command type you add but forget to handle:
      const _exhaustive: never = cmd;
      //                 ↑ TypeScript error if cmd could be anything other than never
      return `Unknown: ${JSON.stringify(_exhaustive)}`;
    }
  }
}
```

If you add a new command type `ProgramEnd` to `GCodeCommand` but forget to add a case
to the switch, TypeScript reports: `Type 'ProgramEnd' is not assignable to type 'never'`.
The error appears at the `default` line — pointing exactly to where the missing case is.

---

## 🎯 Challenge: Implement `describeCommand`

**You know:** Discriminated unions, the `never` exhaustive trick.

**Task:** Implement `describeCommand(cmd: GCodeCommand): string` that returns a
human-readable string for each command type:

```
LinearMove:    "Linear move to (X=50, Y=25) at feed 400"
ArcMove:       "CW arc to (X=10, Y=10) with I=5 J=0"
SpindleCommand: "Spindle ON at 1000 RPM"
ModalChange:   "Modal G90 G17"
ParseError:    "Error at line 5: unexpected token"
```

Use the `never` default to catch any future types you might miss.

Write tests for each case before implementing.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function describeCommand(cmd: GCodeCommand): string {
  switch (cmd.type) {

    case 'LINEAR_MOVE': {
      const coords = [
        cmd.x !== undefined ? `X=${cmd.x}` : '',
        cmd.y !== undefined ? `Y=${cmd.y}` : '',
        cmd.z !== undefined ? `Z=${cmd.z}` : '',
      ].filter(Boolean).join(', ');
      const feed = cmd.feed !== undefined ? ` at feed ${cmd.feed}` : '';
      return `${cmd.rapid ? 'Rapid' : 'Linear'} move to (${coords})${feed}`;
    }

    case 'ARC_MOVE': {
      const dir    = cmd.cw ? 'CW' : 'CCW';
      const centre = cmd.r !== undefined ? `R=${cmd.r}` : `I=${cmd.i ?? 0} J=${cmd.j ?? 0}`;
      return `${dir} arc to (X=${cmd.x ?? '?'}, Y=${cmd.y ?? '?'}) with ${centre}`;
    }

    case 'SPINDLE_COMMAND': {
      const speed = cmd.speed !== undefined ? ` at ${cmd.speed} RPM` : '';
      return `Spindle ${cmd.on ? 'ON' : 'OFF'}${speed}`;
    }

    case 'MODAL_CHANGE':
      return `Modal ${cmd.codes.map(c => `G${c}`).join(' ')}`;

    case 'ERROR':
      return `Error at line ${cmd.line}: ${cmd.message}`;

    default: {
      // If you add a new command type and forget a case, TypeScript catches it here:
      const _exhaustive: never = cmd;
      return `Unknown command: ${JSON.stringify(_exhaustive)}`;
    }
  }
}
```

**Tests:**
```ts
it('describes a linear move', () => {
  const { commands } = parse('G01 X50 Y25 F400\n');
  expect(describeCommand(commands[0])).toContain('Linear move');
  expect(describeCommand(commands[0])).toContain('X=50');
  expect(describeCommand(commands[0])).toContain('400');
});

it('describes a CW arc', () => {
  const { commands } = parse('G02 X10 Y10 I5 J0\n');
  expect(describeCommand(commands[0])).toContain('CW');
});
```

**Key insight:** The `default: never` is not just a comment or documentation — it is a
COMPILE-TIME check. If you add `ProgramEnd` to `GCodeCommand` without adding a case,
the TypeScript compiler errors. This is the discriminated union pattern's killer feature
for evolving types.

</details>

---

## Final Check

| Concept | Verify |
|---|---|
| Block collector | `collectBlock` stops at `END_OF_BLOCK`, not at the next G-word |
| Command identification | G02 → `cw: true`; G03 → `cw: false` |
| Line numbers | Second line of source → `line: 2` |
| Comment lines skipped | Only `G01` produced from `;comment\nG01 X10` |
| `never` exhaustiveness | Add a type to union without a switch case → compile error |

---

## Quick Check Answers

**1. 5 tokens from `G01 X50 Y25 F400`. How many parsed objects?**

One: `{ type: 'LINEAR_MOVE', rapid: false, x: 50, y: 25, feed: 400, line: 1 }`.
The parser collapses ALL the tokens on one line into a single command object.
The token stream is flat (a sequence); the parse result is structured (typed objects).

**2. The parser knows G02 = CW vs G03 = CCW how?**

The G-code number determines it: G-code 2 → CW, G-code 3 → CCW. This is hardcoded
in the parser's `identifyBlock` function: `cw: gCodes.includes(2)`. G-code 2 is CW by
the ISO G-code standard — the parser just implements that standard.

**3. TypeScript says `default: never`. What does it mean?**

It means: in this default case, TypeScript expects the type of `cmd` to be `never` (an impossible type). If you have handled ALL cases in the union (LinearMove, ArcMove, SpindleCommand, ModalChange, ParseError), then `cmd` in the default case cannot have any other value — it is `never`. If you add a new command type and forget to add a case, TypeScript says `cmd` could be that new type — which is not `never` — and reports an error at the `const _exhaustive: never = cmd` line.
