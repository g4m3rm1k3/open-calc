# Junior to Senior — T9·L5 — Testing Parsers

**Prerequisites:** T9·L4 (Modal State). You have a complete G-code parser. This
lesson adds systematic test coverage — the techniques specific to testing parsers.

**What this lab adds:**
- Round-trip testing: parse → serialise → compare to original
- Testing each grammar rule with minimal input
- Parametrised tests: one test body, many input/output pairs
- Error case testing: invalid input → specific error, not a crash
- Testing the modal state machine

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Round-trip test: you parse `G01 X50.0` and serialise the result back to text.
>    The output is `G1 X50`. Did the round-trip succeed?
> 2. You have 20 different G-code patterns to test. What is wrong with writing
>    20 separate test functions that each do the same thing with different data?
> 3. A parser receives `G999 X50`. It parses X50 as an axis word — but G999 is
>    an undefined G-code. What should the test assert?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A comprehensive test suite that covers:
- All token types with parametrised tests
- All command types in the parser
- Modal state transitions with fixed setup
- Error cases (invalid G-code, missing required parameters)

---

### Concept: Round-Trip Testing

**What it is:** Parse a string → convert back to a canonical string →
compare the two canonical forms.

```ts
function serialise(cmd: GCodeCommand): string {
  switch (cmd.type) {
    case 'LINEAR_MOVE': {
      const g   = cmd.rapid ? 'G00' : 'G01';
      const xyz = [
        cmd.x !== undefined ? `X${cmd.x}` : '',
        cmd.y !== undefined ? `Y${cmd.y}` : '',
        cmd.z !== undefined ? `Z${cmd.z}` : '',
      ].filter(Boolean).join(' ');
      const f = cmd.feed !== undefined ? ` F${cmd.feed}` : '';
      return `${g} ${xyz}${f}`;
    }
    // ...
  }
}

// Round-trip test:
it('round-trips a linear move', () => {
  const source   = 'G01 X50.0 Y25.0 F400';
  const parsed   = parse(source + '\n').commands[0];
  const back     = serialise(parsed);
  const reparsed = parse(back + '\n').commands[0];
  // The reparsed result should be identical to the first parse:
  expect(reparsed).toEqual(parsed);
});
```

Round-trip testing catches: incorrect value types (string where number expected),
missing fields, serialisation bugs.

---

### Concept: Parametrised Parser Tests

```ts
import { describe, it, expect } from 'vitest';
import { parse } from './parser';

describe.each([
  { source: 'G01 X50 F400\n',        expectedType: 'LINEAR_MOVE',   rapid: false },
  { source: 'G00 X0 Y0\n',           expectedType: 'LINEAR_MOVE',   rapid: true  },
  { source: 'G02 X10 Y10 I5 J0\n',  expectedType: 'ARC_MOVE',      cw: true     },
  { source: 'G03 X10 Y10 I5 J0\n',  expectedType: 'ARC_MOVE',      cw: false    },
  { source: 'M03 S1000\n',           expectedType: 'SPINDLE_COMMAND', on: true   },
  { source: 'M05\n',                 expectedType: 'SPINDLE_COMMAND', on: false  },
])('parsing $source', ({ source, expectedType, ...rest }) => {
  it(`produces a ${expectedType}`, () => {
    const { commands } = parse(source);
    expect(commands[0].type).toBe(expectedType);
    for (const [key, val] of Object.entries(rest)) {
      expect((commands[0] as Record<string, unknown>)[key]).toBe(val);
    }
  });
});
```

---

## Step 1 — Build the Full Test Suite

Create `src/parser-comprehensive.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { parse, parseWithState } from './parser';
import { ModalState }             from './modal-state';

// ── Parametrised command type tests ───────────────────────────────────────

const COMMAND_CASES = [
  { source: 'G01 X50 Y25 F400\n', type: 'LINEAR_MOVE',    check: (c: any) => c.x === 50 && c.feed === 400 },
  { source: 'G00 X0 Y0 Z5\n',    type: 'LINEAR_MOVE',    check: (c: any) => c.rapid === true },
  { source: 'G02 X10 Y10 I5\n',  type: 'ARC_MOVE',       check: (c: any) => c.cw === true && c.i === 5 },
  { source: 'G03 X10 Y10 R5\n',  type: 'ARC_MOVE',       check: (c: any) => c.cw === false && c.r === 5 },
  { source: 'M03 S1000\n',        type: 'SPINDLE_COMMAND', check: (c: any) => c.on && c.speed === 1000 },
  { source: 'M05\n',              type: 'SPINDLE_COMMAND', check: (c: any) => !c.on },
  { source: 'G90\n',              type: 'MODAL_CHANGE',   check: (c: any) => c.codes.includes(90) },
];

COMMAND_CASES.forEach(({ source, type, check }) => {
  it(`parses ${source.trim()} as ${type}`, () => {
    const { commands } = parse(source);
    expect(commands).toHaveLength(1);
    expect(commands[0].type).toBe(type);
    expect(check(commands[0])).toBe(true);
  });
});

// ── Error cases ───────────────────────────────────────────────────────────

describe('error handling', () => {

  it('does not crash on empty input', () => {
    expect(() => parse('')).not.toThrow();
  });

  it('does not crash on a line of all comments', () => {
    expect(() => parse('; only comments here\n')).not.toThrow();
  });

  it('does not crash on whitespace-only input', () => {
    expect(() => parse('   \n   \n')).not.toThrow();
  });

  it('continues parsing after an invalid token', () => {
    const { commands } = parse('@@@\nG01 X50\n');  // error on line 1, valid on line 2
    expect(commands.some(c => c.type === 'LINEAR_MOVE')).toBe(true);
  });

  it('produces no commands for comment-only content', () => {
    const { commands } = parse('; just comments\n; more comments\n');
    expect(commands).toHaveLength(0);
  });

});

// ── Line number tracking ──────────────────────────────────────────────────

describe('line numbers', () => {

  it('assigns line 1 to the first command', () => {
    const { commands } = parse('G01 X10\n');
    expect(commands[0].line).toBe(1);
  });

  it('assigns correct line to commands after blank lines', () => {
    const { commands } = parse('\n\nG01 X10\n');
    expect(commands[0].line).toBe(3);
  });

});

// ── Tokeniser edge cases ──────────────────────────────────────────────────

describe('tokeniser edge cases', () => {

  it('handles negative axis values', () => {
    const { commands } = parse('G01 X-50.5 Y-25\n');
    if (commands[0].type === 'LINEAR_MOVE') {
      expect(commands[0].x).toBeCloseTo(-50.5);
      expect(commands[0].y).toBe(-25);
    }
  });

  it('handles fractional G codes like G28.1', () => {
    const { commands } = parse('G28.1\n');
    expect(commands[0].type).toBe('MODAL_CHANGE');
    if (commands[0].type === 'MODAL_CHANGE') {
      expect(commands[0].codes[0]).toBeCloseTo(28.1);
    }
  });

  it('handles both ; and () comments', () => {
    expect(parse('; comment\n').commands).toHaveLength(0);
    expect(parse('(comment)\n').commands).toHaveLength(0);
  });

});

// ── Modal state integration ───────────────────────────────────────────────

describe('modal state with parser', () => {

  it('absolute mode: X50 then X20 gives position X=20', () => {
    const { finalState } = parseWithState('G90\nG01 X50\nG01 X20\n');
    expect(finalState.position.x).toBeCloseTo(20);
  });

  it('incremental mode: X50 then X20 gives position X=70', () => {
    const { finalState } = parseWithState('G91\nG01 X50\nG01 X20\n');
    expect(finalState.position.x).toBeCloseTo(70);
  });

  it('feed rate persists across blocks', () => {
    const { finalState } = parseWithState('G01 X10 F400\nG01 X20\n');
    expect(finalState.currentFeed).toBe(400);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Add a Round-Trip Test

**You know:** Serialisation, round-trip testing, `toEqual`.

**Task:** Implement `serialise(cmd: GCodeCommand): string` and write a round-trip
test that:
1. Parses a G-code string
2. Serialises each command back to a string
3. Parses the serialised string again
4. Verifies the twice-parsed commands equal the once-parsed commands

Test at least 3 command types.

---

<details>
<summary>▶ Show Solution</summary>

```ts
export function serialise(cmd: GCodeCommand): string {
  switch (cmd.type) {
    case 'LINEAR_MOVE': {
      const g   = cmd.rapid ? 'G00' : 'G01';
      const xyz = [
        cmd.x !== undefined ? `X${cmd.x}` : '',
        cmd.y !== undefined ? `Y${cmd.y}` : '',
        cmd.z !== undefined ? `Z${cmd.z}` : '',
      ].filter(Boolean).join(' ');
      const f = cmd.feed !== undefined ? ` F${cmd.feed}` : '';
      return `${g} ${xyz}${f}`;
    }
    case 'ARC_MOVE': {
      const g   = cmd.cw ? 'G02' : 'G03';
      const xyz = [
        cmd.x !== undefined ? `X${cmd.x}` : '',
        cmd.y !== undefined ? `Y${cmd.y}` : '',
        cmd.r !== undefined ? `R${cmd.r}` : `I${cmd.i ?? 0} J${cmd.j ?? 0}`,
      ].filter(Boolean).join(' ');
      return `${g} ${xyz}${cmd.feed !== undefined ? ` F${cmd.feed}` : ''}`;
    }
    case 'SPINDLE_COMMAND':
      return cmd.on ? `M03${cmd.speed !== undefined ? ` S${cmd.speed}` : ''}` : 'M05';
    case 'MODAL_CHANGE':
      return cmd.codes.map(c => `G${c}`).join(' ');
    case 'ERROR':
      return `; ERROR: ${cmd.message}`;
  }
}

// Round-trip test:
it('round-trips a linear move', () => {
  const original = parse('G01 X50 Y25 F400\n').commands[0];
  const back     = serialise(original);
  const reparsed = parse(back + '\n').commands[0];
  expect(reparsed).toEqual(original);
});
```

</details>

---

## Final Check

| Test technique | When to use |
|---|---|
| Parametrised (`COMMAND_CASES.forEach`) | Same assertion, many inputs |
| Round-trip | Verifies parse + serialise consistency |
| Error cases | Invalid input doesn't crash |
| Modal state setup | `beforeEach` → fresh state for each test |
| Line number tracking | Confirm error location information is correct |

---

## Quick Check Answers

**1. Round-trip: parse `G01 X50.0` → serialise → `G1 X50`. Did it succeed?**

Semantically yes, formally no. If the test compares the output string to the
input string (`'G01 X50.0' === 'G1 X50'`), it fails. The correct round-trip
test compares the PARSED objects from both strings — both should produce
`LinearMove { rapid: false, x: 50, ... }`. The string forms are allowed to differ
(canonical form vs input form), but the semantic content should be identical.

**2. 20 test functions doing the same thing with different data — what's wrong?**

Duplication that scales badly. When the assertion logic needs to change (e.g., a new
field is added to `GCodeCommand`), all 20 tests need updating. Parametrised tests
(`forEach` or `it.each`) put the assertion logic in one place and the data in a table.
Changes to the assertion apply automatically to all 20 cases. Adding case 21 is one
new data entry, not a new function.

**3. `G999 X50` — G999 is undefined. What should the test assert?**

The parser should parse it as a `MODAL_CHANGE` with `codes: [999]` (the X50 would
either be an associated axis word if there's a motion implied, or ignored if it's just
the modal group). The test should assert: (1) no exception thrown, (2) a command is
produced (not null), (3) the line number is correct. Whether `G999` causes an error
depends on the strictness level — a lenient parser accepts unknown codes, a strict one
produces an `ERROR` command.
