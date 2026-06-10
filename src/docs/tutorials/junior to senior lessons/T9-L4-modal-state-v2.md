# Junior to Senior — T9·L4 — Modal State Tracking

**Prerequisites:** T9·L3 (Parsing Tokens). You can parse G-code blocks. This lesson
adds modal state by explaining WHAT modal means in G-code (not just "persistent"), WHY
the state machine analogy applies, and HOW you trace which state applies to a given line.

**What this lab adds:**
- WHY G-code is modal — the machine control philosophy, not just the programming pattern
- How `ModalState.update()` transitions between states based on command type
- The "last stated feed" problem — what happens to `G01 X50` with no F-word
- Why tests for modal state REQUIRE explicit initial state setup
- Tracing a program line by line to verify state transitions

**Time:** 45–60 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A CNC operator runs `G01 X50 F400` then immediately runs `G01 X75`. What feed
>    rate does the second move use? Why doesn't the operator write the F-word again?
> 2. `G90` sets absolute positioning. `G91` sets incremental. A program has neither.
>    The machine starts in absolute mode. What is the modal state at line 1?
> 3. Why must every modal state test call `ModalState.default()` in `beforeEach`?
>    What goes wrong if they share one state instance?
>
> *(Answers at the end of this lab)*

---

## What "Modal" Means in CNC

In a CNC machine, "modal" means: once you state something, it stays stated until you change it.
You do not repeat the feed rate on every line — the machine remembers it.

```
N001 G01 X10 F400   → moves to X=10 at 400mm/min. F=400 is now the modal feed.
N002 G01 X20        → moves to X=20. No F-word. Machine uses the modal feed: 400mm/min.
N003 G01 X30 F600   → moves to X=30 at 600mm/min. F=600 replaces the modal feed.
N004 G01 X40        → moves to X=40 at 600mm/min. F=600 persists.
```

Without modal state, the parser would need the operator to write `F400` on every single line.
With modal state, the parser "remembers" what was last stated.

This is a state machine. The machine is in state "F=400" until it transitions to "F=600".

---

## Step 1 — Trace a Program By Hand First

Before writing code, trace this 4-line program through its state:

```
G90                ← G90: absolute mode
G01 X50 F400       ← move to absolute position X=50, set feed=400
G01 X75            ← move to absolute position X=75, feed still 400
G91                ← G91: switch to incremental mode
G01 X10            ← move 10mm further (incremental), feed still 400
```

State after each line:

| After line | positioningMode | currentFeed | position.x |
|---|---|---|---|
| G90 | ABSOLUTE | 0 | 0 |
| G01 X50 F400 | ABSOLUTE | 400 | 50 |
| G01 X75 | ABSOLUTE | 400 | 75 |
| G91 | INCREMENTAL | 400 | 75 |
| G01 X10 | INCREMENTAL | 400 | 85 |

The last line: incremental mode → `X += 10` → position.x = 75 + 10 = 85.

This trace IS the test specification. We write the code to match it.

---

## Step 2 — Build `ModalState`

Create `src/modal-state.ts`:

```ts
// src/modal-state.ts
import type { GCodeCommand } from './commands';

export type PositioningMode = 'ABSOLUTE' | 'INCREMENTAL';
export type Plane           = 'XY' | 'ZX' | 'YZ';
export type FeedMode        = 'PER_MINUTE' | 'INVERSE_TIME';

export interface Position { x: number; y: number; z: number; }

export class ModalState {
  // These are the "modal groups" — settings that persist:
  positioningMode: PositioningMode = 'ABSOLUTE';  // G90/G91
  plane:           Plane           = 'XY';         // G17/G18/G19
  feedMode:        FeedMode        = 'PER_MINUTE'; // G94/G93

  // Persistent values (not strictly "groups" but also modal):
  currentFeed:  number   = 0;     // last stated F-word value
  currentSpeed: number   = 0;     // last stated S-word value
  currentTool:  number   = 1;     // last stated T-word value

  position: Position = { x: 0, y: 0, z: 0 };  // current machine position

  static default(): ModalState {
    return new ModalState();
  }

  /**
   * Applies a command to the modal state.
   * Called after parsing each command, in program order.
   */
  update(cmd: GCodeCommand): void {
    switch (cmd.type) {

      case 'MODAL_CHANGE':
        // Apply each G-code in the command to the appropriate modal group:
        this._applyModalCodes(cmd.codes);
        break;

      case 'LINEAR_MOVE':
      case 'ARC_MOVE':
        // Feed rate: update if explicitly stated on this line:
        if (cmd.feed !== undefined) this.currentFeed = cmd.feed;
        // Position: update based on absolute vs incremental mode:
        this._updatePosition(cmd);
        break;

      case 'SPINDLE_COMMAND':
        if (cmd.speed !== undefined) this.currentSpeed = cmd.speed;
        break;

      case 'ERROR':
      case 'PARSE_ERROR':
        break;   // errors don't change state
    }
  }

  /**
   * Returns the feed rate that applies to a given command.
   * If the command states its own F-word: uses that.
   * If not: uses the modal (last stated) feed.
   */
  resolvedFeed(cmd: GCodeCommand): number {
    if ('feed' in cmd && cmd.feed !== undefined) return cmd.feed;
    return this.currentFeed;
  }

  private _applyModalCodes(codes: number[]): void {
    for (const code of codes) {
      switch (code) {
        // Positioning mode:
        case 90: this.positioningMode = 'ABSOLUTE';    break;
        case 91: this.positioningMode = 'INCREMENTAL'; break;
        // Plane selection:
        case 17: this.plane = 'XY'; break;
        case 18: this.plane = 'ZX'; break;
        case 19: this.plane = 'YZ'; break;
        // Feed mode:
        case 94: this.feedMode = 'PER_MINUTE';   break;
        case 93: this.feedMode = 'INVERSE_TIME'; break;
        // Other codes (G40, G28, etc.) — not implemented here:
      }
    }
  }

  private _updatePosition(cmd: { x?: number; y?: number; z?: number }): void {
    if (this.positioningMode === 'ABSOLUTE') {
      // Absolute: set position to the stated value:
      if (cmd.x !== undefined) this.position.x = cmd.x;
      if (cmd.y !== undefined) this.position.y = cmd.y;
      if (cmd.z !== undefined) this.position.z = cmd.z;
    } else {
      // Incremental: ADD the stated value to the current position:
      if (cmd.x !== undefined) this.position.x += cmd.x;
      if (cmd.y !== undefined) this.position.y += cmd.y;
      if (cmd.z !== undefined) this.position.z += cmd.z;
    }
  }
}
```

---

## Step 3 — Write the State Transition Tests

The tests directly verify the hand-traced table from Step 1:

```ts
// src/modal-state.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { ModalState }                        from './modal-state';
import { parse }                             from './parser';

describe('ModalState', () => {
  let state: ModalState;

  beforeEach(() => {
    // CRITICAL: fresh state for each test.
    // If tests share one state instance, state from test N leaks into test N+1.
    state = ModalState.default();
  });

  it('starts in absolute mode with zero feed and position', () => {
    // Verifies the default initial state — what the machine starts with:
    expect(state.positioningMode).toBe('ABSOLUTE');
    expect(state.currentFeed).toBe(0);
    expect(state.position).toEqual({ x: 0, y: 0, z: 0 });
  });

  it('G91 switches to incremental mode', () => {
    const { commands } = parse('G91\n');
    commands.forEach(cmd => state.update(cmd));
    expect(state.positioningMode).toBe('INCREMENTAL');
  });

  it('G90 then G91 ends in incremental mode', () => {
    const { commands } = parse('G90\nG91\n');
    commands.forEach(cmd => state.update(cmd));
    // The last modal change wins:
    expect(state.positioningMode).toBe('INCREMENTAL');
  });

  it('feed rate is remembered across blocks', () => {
    const { commands } = parse('G01 X10 F400\nG01 X20\n');
    commands.forEach(cmd => state.update(cmd));
    // After both lines: feed should still be 400 (from line 1):
    expect(state.currentFeed).toBe(400);
  });

  it('absolute mode: X position is the stated value', () => {
    const { commands } = parse('G90\nG01 X50\nG01 X75\n');
    commands.forEach(cmd => state.update(cmd));
    // Absolute: last stated X is 75:
    expect(state.position.x).toBeCloseTo(75);
  });

  it('incremental mode: X position accumulates', () => {
    const { commands } = parse('G91\nG01 X50\nG01 X10\n');
    commands.forEach(cmd => state.update(cmd));
    // Incremental: 0 + 50 + 10 = 60:
    expect(state.position.x).toBeCloseTo(60);
  });

  it('switching from absolute to incremental mid-program', () => {
    // This is the hand-traced example from Step 1:
    const { commands } = parse('G90\nG01 X50 F400\nG01 X75\nG91\nG01 X10\n');
    commands.forEach(cmd => state.update(cmd));

    // After G90 G01 X50: absolute mode, position X=50
    // After G01 X75: absolute mode, position X=75
    // After G91: incremental mode
    // After G01 X10: incremental — X += 10 → X=85
    expect(state.position.x).toBeCloseTo(85);
    expect(state.currentFeed).toBe(400);
    expect(state.positioningMode).toBe('INCREMENTAL');
  });

  it('resolvedFeed uses modal feed when command has no F-word', () => {
    state.currentFeed = 400;
    const { commands } = parse('G01 X50\n');   // no F-word
    if (commands[0].type === 'LINEAR_MOVE') {
      expect(state.resolvedFeed(commands[0])).toBe(400);  // uses modal
    }
  });

  it('resolvedFeed uses command feed when F-word is present', () => {
    state.currentFeed = 400;
    const { commands } = parse('G01 X50 F600\n');
    if (commands[0].type === 'LINEAR_MOVE') {
      expect(state.resolvedFeed(commands[0])).toBe(600);  // uses command's F
    }
  });

});
```

### SAVE AND TRY

```bash
npm test
```

Expected: all tests pass.

**Change something:** Remove the `beforeEach` fixture and see what happens if two tests
share state:

```ts
// Without beforeEach — state persists between tests:
const state = ModalState.default();  // shared — dangerous!
```

Run the tests with a shared state instance. Expected: some tests may pass or fail
depending on execution order — the "accumulates" test corrupts state for the "absolute"
test if it runs first.

Add `beforeEach` back — this demonstrates why test isolation requires fresh state.

---

## 🎯 Challenge: Add Cutter Compensation State

**You know:** Modal groups, `_applyModalCodes`, `ModalState`.

**The modal group:** Cutter compensation determines which side of the programmed path
the tool cuts on:
- G40 = compensation OFF (default)
- G41 = compensation LEFT (tool left of path)
- G42 = compensation RIGHT (tool right of path)

**Task:** Add `cutterCompensation: 'OFF' | 'LEFT' | 'RIGHT'` to `ModalState` and handle
G40/G41/G42 in `_applyModalCodes`. Write 3 tests before adding the code.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// In ModalState class:
cutterCompensation: 'OFF' | 'LEFT' | 'RIGHT' = 'OFF';  // G40 is default

// In _applyModalCodes:
case 40: this.cutterCompensation = 'OFF';   break;
case 41: this.cutterCompensation = 'LEFT';  break;
case 42: this.cutterCompensation = 'RIGHT'; break;
```

**Tests:**
```ts
it('defaults to compensation OFF', () => {
  expect(ModalState.default().cutterCompensation).toBe('OFF');
});

it('G41 sets compensation to LEFT', () => {
  const { commands } = parse('G41\n');
  state.update(commands[0]);
  expect(state.cutterCompensation).toBe('LEFT');
});

it('G40 turns compensation OFF after G41', () => {
  const { commands } = parse('G41\nG40\n');
  commands.forEach(cmd => state.update(cmd));
  expect(state.cutterCompensation).toBe('OFF');
});
```

</details>

---

## Final Check

| State | Transition | Trigger |
|---|---|---|
| `positioningMode` | ABSOLUTE ↔ INCREMENTAL | G90 / G91 |
| `plane` | XY / ZX / YZ | G17 / G18 / G19 |
| `currentFeed` | New value | Any F-word |
| `position.x/y/z` | Set (absolute) or += (incremental) | G00, G01, G02, G03 |

---

## Quick Check Answers

**1. `G01 X50 F400` then `G01 X75`. What feed does the second move use?**

400mm/min. The F400 set the modal feed. The second line has no F-word, so the modal
feed of 400 persists. This is the fundamental G-code design: operators write the feed
once when they change it, not on every line. The modal state is the machine's "memory."

**2. Program with no G90 or G91. Machine starts in absolute mode. Modal state at line 1?**

Absolute mode (`ABSOLUTE`). The `ModalState.default()` initialises `positioningMode = 'ABSOLUTE'`
because most CNC controls default to absolute. This matches the standard initial state
defined by the CNC control manufacturer (commonly Fanuc, Siemens, etc.).

**3. Why must modal state tests use `beforeEach(() => state = ModalState.default())`?**

Because the modal state accumulates changes as commands run through it. Test A might
switch to incremental mode. If Test B runs with the SAME state instance, it starts
in incremental mode — not the default absolute mode. This makes Test B's results
depend on whether Test A ran first. `beforeEach` gives each test a clean initial state,
making tests independent of each other.
