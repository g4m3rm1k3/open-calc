# Junior to Senior — T9·L4 — Modal State Tracking

**Prerequisites:** T9·L3 (Parsing Tokens). You can parse G-code blocks. This
lesson adds modal state — the "memory" that persists between blocks.

**What this lab adds:**
- Modal state: settings that persist until explicitly changed
- Implementing a modal state object carried through the parse
- Resolving implied values: `G01 X50` without feed uses the last stated feed
- State machine: the parser transitions between states as it encounters modal G-codes
- Default initial modal values

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A G-code program has `F400` on line 5. Line 20 has `G01 X50` with no F-word.
>    What feed rate applies to line 20?
> 2. `G90` sets absolute positioning. `G91` sets incremental positioning. A program
>    starts in absolute mode and encounters `G91`. What happens to all subsequent
>    moves?
> 3. Why do tests for modal state need fixture/setup that establishes the initial
>    state before each test?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A `ModalState` object that tracks all persistent G-code settings:

```ts
const state = ModalState.default();

// Process G90 (absolute mode):
state.update({ type: 'MODAL_CHANGE', codes: [90], line: 1 });
console.log(state.positioningMode);  // 'ABSOLUTE'

// Process G01 with feed — feed is remembered:
state.update({ type: 'LINEAR_MOVE', x: 50, feed: 400, ... });
console.log(state.currentFeed);  // 400

// Next move with no feed — uses remembered value:
state.update({ type: 'LINEAR_MOVE', x: 60, ... });
console.log(state.currentFeed);  // still 400
```

---

### Concept: What Modal State Contains

**G-code modal groups** (each has exactly one active code at a time):

| Modal group | Codes | Default |
|---|---|---|
| Motion | G00, G01, G02, G03 | G01 |
| Positioning | G90 (absolute), G91 (incremental) | G90 |
| Plane selection | G17 (XY), G18 (ZX), G19 (YZ) | G17 |
| Feed mode | G94 (per-minute), G93 (inverse time) | G94 |
| Tool compensation | G40, G41, G42 | G40 |

**Non-modal persistent values:**
- Current feed rate (last stated F-word)
- Current spindle speed (last stated S-word)
- Current tool number (last stated T-word)
- Current position (X, Y, Z coordinates)

---

## Step 1 — Build `ModalState`

Create `src/modal-state.ts`:

```ts
import type { GCodeCommand } from './commands';

export type PositioningMode = 'ABSOLUTE' | 'INCREMENTAL';
export type Plane           = 'XY' | 'ZX' | 'YZ';
export type FeedMode        = 'PER_MINUTE' | 'INVERSE_TIME';

export interface Position { x: number; y: number; z: number; }

export class ModalState {
  positioningMode: PositioningMode = 'ABSOLUTE';
  plane:           Plane           = 'XY';
  feedMode:        FeedMode        = 'PER_MINUTE';

  currentFeed:    number           = 0;
  currentSpeed:   number           = 0;
  currentTool:    number           = 1;

  position:        Position        = { x: 0, y: 0, z: 0 };

  static default(): ModalState {
    return new ModalState();
  }

  update(cmd: GCodeCommand): void {
    switch (cmd.type) {
      case 'MODAL_CHANGE':
        this._applyModalCodes(cmd.codes);
        break;

      case 'LINEAR_MOVE':
      case 'ARC_MOVE':
        if (cmd.feed !== undefined) this.currentFeed = cmd.feed;
        this._updatePosition(cmd);
        break;

      case 'SPINDLE_COMMAND':
        if (cmd.speed !== undefined) this.currentSpeed = cmd.speed;
        break;
    }
  }

  resolvedFeed(cmd: GCodeCommand): number {
    if ('feed' in cmd && cmd.feed !== undefined) return cmd.feed;
    return this.currentFeed;
  }

  private _applyModalCodes(codes: number[]): void {
    for (const code of codes) {
      switch (code) {
        case 90: this.positioningMode = 'ABSOLUTE';    break;
        case 91: this.positioningMode = 'INCREMENTAL'; break;
        case 17: this.plane = 'XY'; break;
        case 18: this.plane = 'ZX'; break;
        case 19: this.plane = 'YZ'; break;
        case 94: this.feedMode = 'PER_MINUTE';    break;
        case 93: this.feedMode = 'INVERSE_TIME';  break;
      }
    }
  }

  private _updatePosition(cmd: { x?: number; y?: number; z?: number }): void {
    if (this.positioningMode === 'ABSOLUTE') {
      if (cmd.x !== undefined) this.position.x = cmd.x;
      if (cmd.y !== undefined) this.position.y = cmd.y;
      if (cmd.z !== undefined) this.position.z = cmd.z;
    } else {
      if (cmd.x !== undefined) this.position.x += cmd.x;
      if (cmd.y !== undefined) this.position.y += cmd.y;
      if (cmd.z !== undefined) this.position.z += cmd.z;
    }
  }
}
```

---

## Step 2 — Integrate With the Parser

Update `src/parser.ts` to thread modal state through parsing:

```ts
export function parseWithState(source: string): {
  commands: GCodeCommand[];
  finalState: ModalState;
} {
  const result = parse(source);
  const state  = ModalState.default();

  for (const cmd of result.commands) {
    state.update(cmd);
  }

  return { commands: result.commands, finalState: state };
}
```

---

## Step 3 — Write Tests

Create `src/modal-state.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ModalState } from './modal-state';
import { parse }      from './parser';

describe('ModalState', () => {
  let state: ModalState;

  beforeEach(() => {
    state = ModalState.default();
  });

  it('defaults to absolute positioning mode', () => {
    expect(state.positioningMode).toBe('ABSOLUTE');
  });

  it('switches to incremental mode on G91', () => {
    const { commands } = parse('G91\n');
    commands.forEach(cmd => state.update(cmd));
    expect(state.positioningMode).toBe('INCREMENTAL');
  });

  it('remembers feed rate from previous move', () => {
    const { commands } = parse('G01 X10 F400\nG01 X20\n');
    commands.forEach(cmd => state.update(cmd));
    expect(state.currentFeed).toBe(400);
  });

  it('accumulates position in incremental mode', () => {
    const { commands } = parse('G91\nG01 X10\nG01 X5\n');
    commands.forEach(cmd => state.update(cmd));
    expect(state.position.x).toBeCloseTo(15);  // 10 + 5
  });

  it('sets position in absolute mode', () => {
    const { commands } = parse('G90\nG01 X10\nG01 X5\n');
    commands.forEach(cmd => state.update(cmd));
    expect(state.position.x).toBeCloseTo(5);   // last value, not sum
  });

  it('resolvedFeed returns command feed when present', () => {
    state.currentFeed = 200;
    const cmd = { type: 'LINEAR_MOVE' as const, rapid: false, feed: 500, line: 1 };
    expect(state.resolvedFeed(cmd)).toBe(500);
  });

  it('resolvedFeed falls back to modal feed when command has no feed', () => {
    state.currentFeed = 200;
    const cmd = { type: 'LINEAR_MOVE' as const, rapid: false, line: 1 };
    expect(state.resolvedFeed(cmd)).toBe(200);
  });

  it('plane selection updates correctly', () => {
    const { commands } = parse('G18\n');
    commands.forEach(cmd => state.update(cmd));
    expect(state.plane).toBe('ZX');
  });

});
```

### SAVE AND TRY

```bash
npx vitest run
```

Expected: all tests pass.

---

## 🎯 Challenge: Tool Compensation State

**You know:** Modal state, G-code modal groups.

**Task:** Add cutter compensation state to `ModalState`:
- `G40` = compensation OFF
- `G41` = compensation LEFT (tool to the left of the profile)
- `G42` = compensation RIGHT

```ts
type CutterCompensation = 'OFF' | 'LEFT' | 'RIGHT';
```

Write 3 tests first.

---

<details>
<summary>▶ Show Solution</summary>

**Tests:**
```ts
it('defaults to compensation off', () => {
  expect(state.cutterCompensation).toBe('OFF');
});

it('G41 sets compensation to LEFT', () => {
  const { commands } = parse('G41\n');
  commands.forEach(cmd => state.update(cmd));
  expect(state.cutterCompensation).toBe('LEFT');
});

it('G40 turns compensation off', () => {
  const { commands } = parse('G41\nG40\n');
  commands.forEach(cmd => state.update(cmd));
  expect(state.cutterCompensation).toBe('OFF');
});
```

**Add to `ModalState`:**
```ts
cutterCompensation: CutterCompensation = 'OFF';

// In _applyModalCodes:
case 40: this.cutterCompensation = 'OFF';   break;
case 41: this.cutterCompensation = 'LEFT';  break;
case 42: this.cutterCompensation = 'RIGHT'; break;
```

</details>

---

## Final Check

| Modal group | Codes | Tracks |
|---|---|---|
| Positioning | G90/G91 | ABSOLUTE/INCREMENTAL |
| Plane | G17/18/19 | XY/ZX/YZ |
| Feed mode | G94/G93 | PER_MINUTE/INVERSE_TIME |
| Current position | moves | (x, y, z) |
| Current feed | F-words | last stated feed |

---

## Quick Check Answers

**1. `F400` on line 5, `G01 X50` with no F on line 20. What feed applies?**

400. The feed rate is modal — it persists until explicitly changed. When `G01 X50`
is processed, `state.currentFeed` is still 400 from line 5. `state.resolvedFeed(cmd)`
returns `cmd.feed ?? state.currentFeed` — since `cmd.feed` is undefined, it returns
the modal value of 400.

**2. Program starts in absolute mode, encounters `G91`. What happens?**

All subsequent moves are interpreted as incremental (relative to the current position)
until `G90` is encountered again. The modal state tracks `positioningMode = 'INCREMENTAL'`
and the position update logic adds the commanded values instead of replacing them.

**3. Why do modal state tests need initial state setup?**

Because the result of each G-code command depends on what has happened before. A test
for `G01 X50` in absolute mode gives a different result than in incremental mode. Without
a fresh, known state (`ModalState.default()`), tests would interfere with each other —
a test that sets `G91` would affect subsequent tests. `beforeEach(() => state = ModalState.default())`
provides a clean state for every test.
