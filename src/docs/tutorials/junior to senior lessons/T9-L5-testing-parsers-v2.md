# Junior to Senior — T9·L5 — Testing Parsers

**Prerequisites:** T9·L4 (Modal State). You have a complete G-code parser.
This lesson teaches techniques specific to testing parsers — and explains WHY each
technique exists, because a parser has unique failure modes that unit tests alone miss.

**What this lab adds:**
- WHY a parser needs round-trip tests — what breaks that a unit test cannot detect
- HOW parametrised tests work mechanically — what `forEach` does to the test runner
- WHY you must test that invalid input does NOT crash — the error recovery guarantee
- WHAT "testing the state machine" means — verifying state transitions, not just outputs
- WHY line number tracking must be tested — it is the only thing that makes error messages useful

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. You test that `parse('G01 X50\n').commands[0].x === 50`. This passes. You also
>    implement `serialise(cmd)` which returns `'G01 X50'`. What does a round-trip test
>    catch that neither of these tests catches on its own?
> 2. You have 20 G-code patterns, each requiring the same three assertions. You write
>    20 test functions. Every time you add a field to `LinearMove`, you update 20 tests.
>    What is the specific cost of this approach vs parametrised tests?
> 3. `parse('@@@\nG01 X50\n')` — the `@@@` is invalid. What should `commands` contain?
>    What should it NOT contain?
>
> *(Answers at the end of this lab)*

---

## Why Parsers Need Special Tests

A parser has unique failure modes:

**Problem 1: Parse works, serialise works, but they disagree.**
You parse `G01 X50.0` and get `{x: 50}`. You serialise `{x: 50}` and get `G01 X50`.
Then you parse `G01 X50` and get `{x: 50}`. Looks correct.
But if you serialised and got `G1 X5E1` (scientific notation for 50), reparsing it would produce `{x: 50000}`. Round-trip testing catches this.

**Problem 2: Error handling hides silent data loss.**
`parse('G01 X50 @@@\n')` — the `@@@` generates an ERROR token. What does the parser do?
Does it silently skip the rest of the line? Does it include a partial command? Does it crash?
You need explicit tests that say "invalid input produces exactly this".

**Problem 3: State machine tests are hard to spot missing.**
`G91\nG01 X10\nG01 X10\n` — if you only test the final position, you cannot tell
if the state machine entered incremental mode at line 1 or line 2. You need tests
that check state AT SPECIFIC POINTS in the program.

---

## Step 1 — Build the Serialiser (Round-Trip Requires It)

Create `src/serialiser.ts`:

```ts
// src/serialiser.ts
import type { GCodeCommand } from './commands';

/**
 * Converts a GCodeCommand back into a G-code string.
 * The output is canonical — it may differ from the original input in whitespace
 * and formatting, but must parse to an identical GCodeCommand object.
 *
 * WHY a canonical form?
 * 'G01 X50.0' and 'G1 X50' both parse to the same LinearMove.
 * The round-trip test compares parsed objects, not strings.
 * So the canonical output string just needs to parse correctly —
 * it does not need to match the original character-for-character.
 */
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
      const xy  = [
        cmd.x !== undefined ? `X${cmd.x}` : '',
        cmd.y !== undefined ? `Y${cmd.y}` : '',
        cmd.z !== undefined ? `Z${cmd.z}` : '',
      ].filter(Boolean).join(' ');
      // Use R if available, otherwise I J:
      const centre = cmd.r !== undefined
        ? `R${cmd.r}`
        : `I${cmd.i ?? 0} J${cmd.j ?? 0}`;
      const f = cmd.feed !== undefined ? ` F${cmd.feed}` : '';
      return `${g} ${xy} ${centre}${f}`;
    }

    case 'SPINDLE_COMMAND': {
      const m     = cmd.on ? 'M03' : 'M05';
      const speed = cmd.on && cmd.speed !== undefined ? ` S${cmd.speed}` : '';
      return `${m}${speed}`;
    }

    case 'MODAL_CHANGE':
      return cmd.codes.map(c => `G${c}`).join(' ');

    case 'ERROR':
      // Errors cannot be serialised back to valid G-code:
      return `; ERROR: ${cmd.message}`;
  }
}
```

### SAVE AND TRY — verify the serialiser produces parseable output:

```bash
npx tsx -e "
import { parse }     from './src/parser.ts';
import { serialise } from './src/serialiser.ts';

const original = 'G01 X50 Y25 F400';
const cmd      = parse(original + '\n').commands[0];
const back     = serialise(cmd);
const reparsed = parse(back + '\n').commands[0];

console.log('Original:', original);
console.log('Serialised:', back);
console.log('Objects equal:', JSON.stringify(cmd) === JSON.stringify(reparsed));
"
```

**You should see:**
```
Original: G01 X50 Y25 F400
Serialised: G01 X50 Y25 F400
Objects equal: true
```

**Change something:** In `serialise`, for `LINEAR_MOVE`, change `X${cmd.x}` to `X${cmd.x}E0`.
This would produce `G01 X50E0 Y25E0` — scientific notation-like garbage.

Re-run the test. The object equality check should now fail because reparsing `X50E0` would
NOT produce `x: 50`. This is exactly what the round-trip test catches — a serialiser bug
that a unit test would miss because the unit test only tested one direction.

Change it back.

---

## Step 2 — The Round-Trip Test: What It Checks That Unit Tests Miss

```ts
// src/round-trip.test.ts
import { describe, it, expect } from 'vitest';
import { parse }                 from './parser';
import { serialise }             from './serialiser';

function roundTrip(source: string) {
  const parsed    = parse(source + '\n').commands[0];
  const canonical = serialise(parsed);
  const reparsed  = parse(canonical + '\n').commands[0];
  return { parsed, canonical, reparsed };
}

describe('round-trip tests', () => {

  it('linear move: parsed object survives serialise → reparse unchanged', () => {
    const { parsed, reparsed } = roundTrip('G01 X50 Y25 F400');
    // The two parsed objects should be identical — not just "similar":
    expect(reparsed).toEqual(parsed);
  });

  it('arc move: CW arc survives round trip', () => {
    const { parsed, reparsed } = roundTrip('G02 X10 Y10 I5 J0');
    expect(reparsed).toEqual(parsed);
  });

  it('spindle on: M03 survives round trip', () => {
    const { parsed, reparsed } = roundTrip('M03 S1500');
    expect(reparsed).toEqual(parsed);
  });

  it('modal change: G90 survives round trip', () => {
    const { parsed, reparsed } = roundTrip('G90');
    expect(reparsed).toEqual(parsed);
  });

  it('serialise output is actually parseable — not garbage', () => {
    const { canonical } = roundTrip('G01 X50 Y25 F400');
    // The canonical form must produce exactly 1 command (not 0, not an error):
    const { commands, errors } = parse(canonical + '\n');
    expect(commands).toHaveLength(1);
    expect(errors).toHaveLength(0);
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/round-trip.test.ts
```

Expected: all 5 tests pass.

**Now deliberately break the serialiser and watch the round-trip catch it:**

Change the `LINEAR_MOVE` case in `serialise` to omit the feed rate:

```ts
// Remove the feed line temporarily:
const f = '';   // ← feed omitted
```

Run the tests. **Expected:** `'linear move: parsed object survives serialise → reparse unchanged'` FAILS because the reparsed object has `feed: undefined` while the original has `feed: 400`. The round-trip test caught a field being dropped.

Change it back.

---

## Step 3 — Parametrised Tests: One Table, Many Cases

The pattern: define the test cases as data, then loop over them.

```ts
// src/parser-parametrised.test.ts
import { it, expect } from 'vitest';
import { parse }       from './parser';

// WHY a table instead of 20 functions:
// When GCodeCommand gains a new field (say, 'tool'), updating 20 functions
// takes 20 edits. Adding a case to this table takes 1 edit.
const COMMAND_CASES: Array<{
  source:      string;
  expectedType: string;
  check:       (cmd: any) => boolean;
  description: string;
}> = [
  {
    source:       'G01 X50 Y25 F400\n',
    expectedType: 'LINEAR_MOVE',
    check:        c => c.rapid === false && c.x === 50 && c.feed === 400,
    description:  'G01 is a non-rapid linear move with x and feed',
  },
  {
    source:       'G00 X0 Y0 Z5\n',
    expectedType: 'LINEAR_MOVE',
    check:        c => c.rapid === true,
    description:  'G00 is a rapid move',
  },
  {
    source:       'G02 X10 Y10 I5 J0\n',
    expectedType: 'ARC_MOVE',
    check:        c => c.cw === true && c.i === 5,
    description:  'G02 is a clockwise arc',
  },
  {
    source:       'G03 X10 Y10 R5\n',
    expectedType: 'ARC_MOVE',
    check:        c => c.cw === false && c.r === 5,
    description:  'G03 is a counter-clockwise arc with radius',
  },
  {
    source:       'M03 S1000\n',
    expectedType: 'SPINDLE_COMMAND',
    check:        c => c.on === true && c.speed === 1000,
    description:  'M03 turns spindle on with speed',
  },
  {
    source:       'M05\n',
    expectedType: 'SPINDLE_COMMAND',
    check:        c => c.on === false,
    description:  'M05 turns spindle off',
  },
  {
    source:       'G90\n',
    expectedType: 'MODAL_CHANGE',
    check:        c => c.codes.includes(90),
    description:  'G90 sets absolute mode as a modal change',
  },
];

// One test body, N test cases:
COMMAND_CASES.forEach(({ source, expectedType, check, description }) => {
  it(description, () => {
    const { commands } = parse(source);

    // Each case asserts three things: right number of commands, right type, right data:
    expect(commands).toHaveLength(1);
    expect(commands[0].type).toBe(expectedType);
    expect(check(commands[0])).toBe(true);
  });
});
```

### SAVE AND TRY

```bash
npx vitest run src/parser-parametrised.test.ts
```

**You should see:**
```
✓ G01 is a non-rapid linear move with x and feed
✓ G00 is a rapid move
✓ G02 is a clockwise arc
...
7 passed
```

**Verify the maintenance advantage:** Add a new field to `LINEAR_MOVE` — say `tool?: number`.
With this parametrised test, you add ONE case to the array to test the new field.
With 20 separate functions, you would add a check to each of the two LINEAR_MOVE functions.

---

## Step 4 — Error Case Tests: Verify the Error Recovery Guarantee

```ts
// src/parser-errors.test.ts
import { describe, it, expect } from 'vitest';
import { parse }                 from './parser';

describe('error recovery — the parser must not crash', () => {

  it('returns empty commands for empty input', () => {
    // Empty string is valid — produces no commands and no errors:
    const { commands, errors } = parse('');
    expect(commands).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });

  it('does not crash on comment-only lines', () => {
    expect(() => parse('; just a comment\n')).not.toThrow();
  });

  it('does not crash on completely garbage input', () => {
    // This should produce error tokens, not an exception:
    expect(() => parse('@@@###$$$\n')).not.toThrow();
  });

  it('continues parsing valid lines after invalid ones', () => {
    // WHY this test matters: if the parser crashes on line 1, it never reaches line 2.
    // This test verifies that error recovery actually works — invalid line is skipped,
    // valid line is still parsed.
    const { commands } = parse('@@@\nG01 X50\n');
    expect(commands.some(c => c.type === 'LINEAR_MOVE')).toBe(true);
    // The @@@-line produced an error, but G01 X50 still parsed successfully:
    expect(commands.find(c => c.type === 'LINEAR_MOVE')).toMatchObject({ x: 50 });
  });

  it('unknown G-code does not crash — produces a MODAL_CHANGE', () => {
    // G999 is not defined. A lenient parser accepts it as a modal change.
    // The test verifies: (1) no crash, (2) a command is produced, (3) it has a line number
    const { commands } = parse('G999\n');
    expect(commands).toHaveLength(1);
    expect(commands[0].type).toBe('MODAL_CHANGE');
    expect(commands[0].line).toBe(1);   // line number preserved even for unknown codes
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/parser-errors.test.ts
```

Expected: all 5 tests pass.

---

## Step 5 — State Machine Tests: Verify Transitions at Specific Points

These tests differ from the modal state tests in T9-L4. Those tested the `ModalState` class
in isolation. These test that the full `parse() + state tracking` pipeline transitions
correctly at each line.

```ts
// src/parser-state-machine.test.ts
import { describe, it, expect } from 'vitest';
import { parse }                 from './parser';
import { ModalState }            from './modal-state';

function parseAndTrace(source: string) {
  const { commands } = parse(source);
  const state = ModalState.default();
  const snapshots: typeof state[] = [];

  // Snapshot the state AFTER each command:
  for (const cmd of commands) {
    state.update(cmd);
    snapshots.push(Object.assign(Object.create(ModalState.prototype), { ...state }));
  }

  return { commands, finalState: state, snapshots };
}

describe('state machine transitions', () => {

  it('absolute mode: each G01 sets position absolutely', () => {
    const { snapshots } = parseAndTrace('G90\nG01 X50\nG01 X75\n');

    // After G90: in absolute mode, no position change yet
    expect(snapshots[0].positioningMode).toBe('ABSOLUTE');

    // After G01 X50: position is 50 (absolute, not 0+50=50 coincidentally):
    expect(snapshots[1].position.x).toBeCloseTo(50);

    // After G01 X75: position is 75, NOT 50+75=125:
    expect(snapshots[2].position.x).toBeCloseTo(75);
  });

  it('incremental mode: each G01 adds to current position', () => {
    const { snapshots } = parseAndTrace('G91\nG01 X50\nG01 X10\n');

    // After first G01 X50: position is 0+50=50
    expect(snapshots[1].position.x).toBeCloseTo(50);

    // After second G01 X10: position is 50+10=60, NOT just 10:
    expect(snapshots[2].position.x).toBeCloseTo(60);
  });

  it('mode switch mid-program changes subsequent moves', () => {
    // This test verifies the state machine transitions at the right line.
    // If the mode switch happened at the WRONG line, the positions would be wrong:
    const { snapshots } = parseAndTrace('G90\nG01 X50\nG91\nG01 X10\n');

    // Index 0: after G90 (modal change, no position change)
    // Index 1: after G01 X50 in absolute mode → X=50
    // Index 2: after G91 (modal change, no position change) → still X=50
    // Index 3: after G01 X10 in incremental mode → X=60
    expect(snapshots[1].position.x).toBeCloseTo(50);  // absolute
    expect(snapshots[3].position.x).toBeCloseTo(60);  // incremental: 50+10
  });

});
```

### SAVE AND TRY

```bash
npx vitest run src/parser-state-machine.test.ts
```

Expected: all 3 tests pass.

**Change something:** In `_updatePosition` in `modal-state.ts`, temporarily swap the two
branches — make ABSOLUTE add to position and INCREMENTAL set it:

```ts
if (this.positioningMode === 'INCREMENTAL') {   // ← was ABSOLUTE
  if (cmd.x !== undefined) this.position.x = cmd.x;
```

Run the state machine tests. Expected: the "absolute mode" test FAILS because
`G01 X50` followed by `G01 X75` now adds (0→50→125) instead of setting (0→50→75).
This shows the state machine tests catch logic inversions that modal state unit tests would miss.

Change it back.

---

## 🎯 Challenge: Add Line Number Tests

**You know:** Parser, line tracking, parametrised tests.

**The mechanism to understand:**

The tokeniser increments `line` after each `END_OF_BLOCK` token. The parser records
the current line number in each command it produces. Line numbers are the ONLY way
to tell the user "your G-code error is on line 47."

**Task:** Write tests that verify line numbers are correct for:
1. First line
2. After a blank line
3. After a comment-only line
4. After an invalid (error) line

The line number for each command should reflect where that command appeared in the source.

---

<details>
<summary>▶ Show Solution</summary>

```ts
describe('line number tracking', () => {

  it('first command is on line 1', () => {
    const { commands } = parse('G01 X10\n');
    expect(commands[0].line).toBe(1);
  });

  it('command after a blank line is on line 3', () => {
    const { commands } = parse('\n\nG01 X10\n');
    // Line 1: blank, Line 2: blank, Line 3: G01
    expect(commands[0].line).toBe(3);
  });

  it('command after a comment is on the correct line', () => {
    const { commands } = parse('; comment\nG01 X10\n');
    // Line 1: comment (no command), Line 2: G01
    expect(commands[0].line).toBe(2);
  });

  it('command after an invalid line is on the correct line', () => {
    const { commands } = parse('@@@\nG01 X10\n');
    // Line 1: error (no command), Line 2: G01
    const move = commands.find(c => c.type === 'LINEAR_MOVE');
    expect(move?.line).toBe(2);
  });

});
```

**Key insight:** If line numbers are wrong, error messages mislead users. "Error on line 47"
when the actual error is on line 53 wastes the machinist's time. Testing line numbers is not
pedantic — it is verifying that the error reporting system works correctly.

</details>

---

## Final Check

| Test type | What failure it catches |
|---|---|
| Round-trip | Serialiser drops a field or produces unparseable output |
| Parametrised | Parser produces wrong type or wrong field value |
| Error cases | Parser crashes on invalid input instead of recovering |
| State machine | Mode transition happens at wrong line |
| Line numbers | Error messages point to wrong line |

---

## Quick Check Answers

**1. Round-trip catches what unit tests miss?**

The unit test `commands[0].x === 50` only verifies the parser reads X correctly.
The serialiser test `serialise(cmd) === 'G01 X50'` only verifies the serialiser formats correctly.
A round-trip test catches the COMBINATION: that what the parser reads, the serialiser can reproduce,
and that reproduction parses back to the same thing. Bugs like "serialiser uses scientific notation
that the tokeniser doesn't handle" or "serialiser omits the feed, so reparse gives undefined feed"
require the combination test to detect.

**2. 20 separate test functions vs parametrised — what is the specific cost?**

Every time you add a field to `LinearMove`, `ArcMove`, etc., you must update 20 separate test
functions. With a parametrised table, you add ONE entry. The ratio is 20:1 for additions.
For changes to the assertion logic (e.g., you change the error message format), parametrised means
one edit; 20 functions means 20 edits. The cost is proportional to the number of test cases.

**3. `parse('@@@\nG01 X50\n')` — what should `commands` contain?**

`commands` should contain ONE `LinearMove` (from line 2). It should NOT contain any command
from line 1 (the `@@@` is invalid — no command can be extracted from it). The error recovery
guarantee: the parser emits an ERROR token for each `@` character, advances past it, and
continues tokenising line 2 normally. Line 1 produces no command; line 2 produces a LinearMove.
