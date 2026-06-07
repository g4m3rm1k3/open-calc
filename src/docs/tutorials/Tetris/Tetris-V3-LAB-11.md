# Tetris V3 — LAB 11 — Ghost Piece, Next Preview, and the 7-Bag Queue

**Prerequisites:** LAB-10 complete. Full game loop: spawn, fall, lock, clear,
score, game over, restart. No ghost piece or next-piece preview.

**What this lab adds:**
- `Queue<T>` — a typed queue class (FIFO data structure) — generics intro
- 7-bag randomizer using Fisher-Yates shuffle — no long streaks of the same piece
- Ghost piece — faint outline showing where the piece will land
- Next-piece preview panel

**Time:** 75–90 minutes (generics and the Fisher-Yates algorithm are substantial)

---

## What You Will Build

```
┌──────────────┐   ┌──────────┐
│   ░ ░ ░      │   │  NEXT    │
│     ░        │   │   ░░░    │   ← next piece preview
│              │   │    ░     │
│   ░ ░ ░      │   └──────────┘
│     ░        │
│  ░ ░ ░ ░ ░ ░ │   ← ghost piece (same shape, faint)
│              │     at predicted landing position
│ ▒▒▒▒▒▒▒▒▒▒▒ │
└──────────────┘
```

---

> **Quick Check — try to answer before reading further:**
>
> 1. What is the difference between a Queue and a Stack?
> 2. Why does the standard `Math.random()` approach (pick any of 7 pieces)
>    allow long streaks of the same piece? Why is that unfair?
> 3. *(Prediction)* Without the 7-bag, what is the probability of getting
>    the same piece 4 times in a row?
>
> *(Answers at the end of this lab)*

---

## DSA Concept: Queue — First In, First Out (FIFO)

**What it is:** A data structure where items are added to the back and
removed from the front — like a line at a grocery store. First person in,
first person out.

**Operations:**

| Operation | Description | Array analogy |
|-----------|-------------|---------------|
| `enqueue(item)` | Add to back | `array.push(item)` |
| `dequeue()` | Remove from front | `array.shift()` |
| `peek()` | Read front without removing | `array[0]` |
| `size` | How many items | `array.length` |

**Queue vs Stack:**

```
Queue (FIFO):  add here →  [A, B, C, D]  → remove here
Stack (LIFO):              [A, B, C, D]  → add AND remove here
```

**The real-world analogy:** A printer queue. Jobs are printed in the order
they were submitted — not the most recent first.

**Project Application (The "Why" here):**

The 7-bag randomizer fills a queue with all 7 piece indices (shuffled), then
serves them one-by-one. When the queue is empty, a new shuffled bag of 7 goes in.
This guarantees every piece appears exactly once per 7 pieces — no long droughts
or streaks.

**DSA Analysis:**

```
Array-backed queue:
  enqueue (push):  O(1) amortized
  dequeue (shift): O(n) — all elements shift forward

For a 7-item queue, O(7) per dequeue is negligible. In a general context,
large queues use a circular buffer (ring buffer) for O(1) dequeue.
The circular buffer is the LAB-12 generics challenge.
```

**Watch for:** `Array.shift()` modifies the original array and returns the
removed element. It is NOT the same as `Array.slice(0, 1)` (which returns a
new array without modifying). Do not confuse them.

---

## Math: Fisher-Yates Shuffle

**What it computes:** A perfectly uniform random permutation of an array —
every possible ordering is equally likely.

**The real-world analogy:** Shuffling a physical deck of cards. You pick a
random card from the unshuffled pile, move it to the "shuffled" section.
Repeat until the unshuffled pile is empty. Each card is equally likely to
end up in any position.

**Algorithm (Knuth/Fisher-Yates, modern version):**

```
For i from lastIndex down to 1:
  j = random integer from 0 to i (inclusive)
  swap array[i] and array[j]
```

**Trace on [1, 2, 3, 4] (abbreviated):**

```
Start:  [1, 2, 3, 4]
i=3: j = random(0..3) = 2 → swap [3] and [2] → [1, 2, 4, 3]
i=2: j = random(0..2) = 0 → swap [2] and [0] → [4, 2, 1, 3]
i=1: j = random(0..1) = 1 → swap [1] and [1] → [4, 2, 1, 3]  (no change)
Result: [4, 2, 1, 3]  (one of 24 equally likely permutations of 4 elements)
```

**Why it is fair:** At each step `i`, the element placed at position `i` is
chosen uniformly from the remaining `i+1` unplaced elements. The probability
of any specific permutation is `1/n!`. Naive shuffle (`sort(() => Math.random() - 0.5)`)
is NOT uniformly random — some orderings are more likely than others.

**Implementation in TypeScript:**

```ts
function fisherYatesShuffle(array: number[]): number[] {
  const result = [...array];  // copy — never mutate the input
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // j = random integer from 0 to i (inclusive):
    // Math.random() = [0, 1), × (i+1) = [0, i+1), Math.floor = 0..i
    [result[i], result[j]] = [result[j], result[i]];
    // Destructuring swap — no temporary variable needed.
    // [result[i], result[j]] is the assignment target;
    // [result[j], result[i]] is the source — values are read BEFORE writing.
  }
  return result;
}
```

**Watch for:** `Math.random() * i` (not `i + 1`) incorrectly excludes the
last remaining element from being selected in the first position. Always use
`Math.floor(Math.random() * (i + 1))` to include `i` as a possible result.

---

## Concept: TypeScript Generics — `<T>`

**What it is:** A type parameter that lets you write code that works for
ANY type, while TypeScript still enforces type safety for the specific type
used at each call site.

**The problem before:**

Without generics, you would write a separate `NumberQueue`, `StringQueue`,
`PieceQueue` class for each type. All the code is identical — only the
type name changes.

**The solution — one `Queue<T>` works for all:**

```ts
class Queue<T> {    // T is a placeholder for any type
  private items: T[] = [];

  enqueue(item: T): void {
    this.items.push(item);    // item is type T — whatever caller specifies
  }

  dequeue(): T | undefined {
    return this.items.shift();    // returns type T (or undefined if empty)
  }

  get size(): number {
    return this.items.length;
  }
}

// Usage — TypeScript replaces T with the actual type at each use:
const numberQueue = new Queue<number>();
numberQueue.enqueue(42);       // ✅ number
numberQueue.enqueue("hello");  // ❌ ERROR: not a number

const pieceQueue = new Queue<Piece>();
pieceQueue.enqueue(new Piece(1));  // ✅ Piece
```

**Canonical example (General Explanation):**

A generic queue is like a labeled box. `Queue<number>` is a box labeled
"NUMBERS ONLY." `Queue<Piece>` is a box labeled "PIECES ONLY." The box
mechanism (add, remove, peek) is the same — only the label (type constraint)
changes. Without generics, you need a different box type for each label.

**Pattern category:** Structural — Parameterized Type
**Tradeoff:** Generics add type parameter syntax that can be verbose.
The payoff: one implementation, type-safe at every call site.
**You will see this again in:** LAB-12 (refining the Queue with constraints),
TypeScript built-ins like `Array<T>`, `Promise<T>`, `Map<K, V>`.

**Watch for:** `T` is just a naming convention — you could use any letter
or word. `Queue<Item>` is identical to `Queue<T>`. By convention: `T` for
a single type parameter, `K` for key, `V` for value, `E` for element.

---

## Step 1 — Create `src/queue.ts` with `Queue<T>`

Create `src/queue.ts`:

```ts
// src/queue.ts

// Queue<T>: a generic First-In-First-Out data structure.
// T is a type parameter — it is replaced with a concrete type at each use site.
// Backed by an array. For a Tetris bag of 7 items, array.shift() is fast enough.
export class Queue<T> {
  private items: T[] = [];  // internal array — private so outside code cannot bypass enqueue/dequeue

  // enqueue: add an item to the back of the queue.
  public enqueue(item: T): void {
    this.items.push(item);   // push adds to the end (back of the queue)
  }

  // dequeue: remove and return the item at the front of the queue.
  // Returns T | undefined — undefined if the queue is empty.
  public dequeue(): T | undefined {
    return this.items.shift();  // shift removes from the front (first-in, first-out)
  }

  // peek: return the front item WITHOUT removing it.
  // Useful for the "next piece" preview — we want to see what's next without consuming it.
  public peek(): T | undefined {
    return this.items[0];   // index 0 is the front
  }

  // size: how many items are in the queue.
  public get size(): number {
    return this.items.length;
  }

  // isEmpty: convenience check before calling dequeue.
  public get isEmpty(): boolean {
    return this.items.length === 0;
  }
}
```

### SAVE AND TRY

Save `src/queue.ts`. No visual change yet.

**In DevTools Console** (after adding an import in main.ts in the next step):

```js
// After importing: const q = new Queue()
// Test queue behavior
```

---

## Step 2 — Implement the 7-Bag Randomizer

Create `src/randomizer.ts`:

```ts
// src/randomizer.ts

import { Queue } from './queue';
import { Piece } from './piece';

// ALL_SHAPE_INDICES: the 7 valid piece shape indices (1–7).
// One of each per bag — guaranteed no duplicates within a bag.
const ALL_SHAPE_INDICES: readonly number[] = [1, 2, 3, 4, 5, 6, 7];

// fisherYatesShuffle: returns a uniformly random permutation of the input array.
// Does not modify the original array — returns a new shuffled copy.
function fisherYatesShuffle(array: readonly number[]): number[] {
  const result = [...array];   // copy into a mutable array
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // j = random integer 0..i (inclusive):
    // Math.random() → [0, 1)  ×  (i+1)  → [0, i+1)  →  Math.floor → 0..i

    [result[i], result[j]] = [result[j], result[i]];
    // Destructuring swap — swap two elements without a temporary variable.
    // Right side is evaluated first: [result[j], result[i]] reads both values.
    // Then they are assigned to [result[i], result[j]] simultaneously.
  }
  return result;
}

// PieceQueue: a Queue<Piece> backed by the 7-bag algorithm.
// When the queue falls below a threshold, a new shuffled bag is added.
export class PieceQueue {
  private queue: Queue<Piece> = new Queue<Piece>();
  //                ↑ Queue<Piece> — TypeScript replaces T with Piece

  constructor() {
    this.fillBag();   // start with one full bag
    this.fillBag();   // fill a second bag so 'peek()' can show the NEXT piece
  }

  // fillBag: shuffles all 7 piece indices and enqueues one Piece for each.
  private fillBag(): void {
    const shuffled = fisherYatesShuffle(ALL_SHAPE_INDICES);
    for (const shapeIndex of shuffled) {
      this.queue.enqueue(new Piece(shapeIndex));
      // Create a fresh Piece for each slot — each piece has its own position state.
    }
  }

  // next: dequeue the front piece. Refills the bag when running low.
  public next(): Piece {
    // Refill when only one bag remains — ensures 'peek' always has a valid next piece:
    if (this.queue.size <= 7) {
      this.fillBag();
    }

    const piece = this.queue.dequeue();
    if (piece === undefined) {
      // This should never happen (we just ensured size > 7), but TypeScript
      // requires handling the 'undefined' case since dequeue() returns T | undefined.
      throw new Error('PieceQueue: dequeue returned undefined — this is a bug');
    }
    return piece;
  }

  // peekNext: return the next piece without consuming it — for the preview panel.
  public peekNext(): Piece | undefined {
    return this.queue.peek();
  }
}
```

### SAVE AND TRY

Save both files. No visual change yet. We wire it in the next step.

---

## Step 3 — Replace `spawnPiece` with `PieceQueue`

Open `src/main.ts`. Update imports:

```ts
import { PieceQueue } from './randomizer';   // ← add this
```

Add the queue to `GameState`:

```ts
interface GameState {
  // ...existing fields...
  pieceQueue: PieceQueue;   // ← add this
}

const state: GameState = {
  // ...existing fields...
  pieceQueue: new PieceQueue(),   // ← add this
};
```

Replace `spawnPiece()` calls with `state.pieceQueue.next()`:

```ts
// In update():
const nextPiece = state.pieceQueue.next();    // ← was: spawnPiece()

// In resetGame():
state.pieceQueue = new PieceQueue();          // ← add this to reset
state.activePiece = state.pieceQueue.next();  // ← was: spawnPiece()
```

Remove the `spawnPiece` function — it is replaced by `PieceQueue.next()`.

### SAVE AND TRY

Save. Play the game. Watch the piece sequence — you should not see 3+ of the
same piece in a row. Every 7 pieces, all 7 types will have appeared.

**In DevTools Console:**

```js
state.pieceQueue.peekNext()  // shows what the NEXT piece will be
state.pieceQueue.size         // → approximately 7+ items in queue
```

---

## Step 4 — Draw the Ghost Piece

The ghost piece is the active piece drawn at its lowest valid position,
with reduced opacity.

Add `getGhostPosition` and `drawGhost` to `main.ts`:

```ts
// getGhostPosition: finds the lowest valid Y position for the active piece.
// Drops the piece down row by row until the next row is invalid.
function getGhostPosition(piece: Piece): Vec2 {
  let ghostY = piece.position.y;

  // Keep moving down while the next row is valid:
  while (
    isValidPosition(
      (col, row) => state.board.getCell(col, row),
      { x: piece.position.x, y: ghostY + 1 },
      piece.getCells(),
      BOARD_COLS,
      BOARD_ROWS
    )
  ) {
    ghostY += 1;
  }

  return { x: piece.position.x, y: ghostY };
}

// drawGhost: renders the ghost piece at the lowest valid position.
// Uses globalAlpha for transparency — ghost is faint but visible.
function drawGhost(piece: Piece): void {
  const ghostPos = getGhostPosition(piece);

  // Do not draw ghost if it overlaps the piece (piece is already at the bottom):
  if (ghostPos.y === piece.position.y) return;

  ctx.globalAlpha = 0.25;  // 25% opacity — faint but visible as a landing guide
  drawShape(piece.getCells(), ghostPos, PIECE_COLORS[piece.getColorIndex()]);
  ctx.globalAlpha = 1.0;   // restore full opacity — everything else draws at 100%
}
```

Update `render()` to draw the ghost:

```ts
function render(): void {
  drawBackground();
  drawBoard(state.board);

  if (state.phase.kind === 'playing') {
    drawGhost(state.activePiece);    // ← draw ghost BEFORE the piece (piece draws on top)
    drawPiece(state.activePiece);
  }

  drawHUD();

  if (state.phase.kind === 'gameover') {
    drawGameOver();
  }
}
```

### SAVE AND TRY

Save. Look at the canvas.

**You should see:** A faint, semi-transparent version of the active piece
appears at the bottom of the column it would land on. As you move the piece
left/right, the ghost moves too. When the piece is at the floor, no ghost
appears (it would overlap the piece).

**Change something:** Change `ctx.globalAlpha = 0.25` to `0.6`. Save.
Ghost is much more visible — almost as bright as the real piece.
Change back to `0.25`.

---

## Step 5 — Draw the Next Piece Preview

Add `drawNextPiece` to `main.ts`:

```ts
// NEXT_PREVIEW_X: x position (canvas pixels) of the next piece preview panel center.
// The preview sits to the right of the 300px board, in the HUD area.
const NEXT_PREVIEW_X: number = 340;   // center of the right panel
const NEXT_PREVIEW_Y: number = 260;   // y start of the preview area

function drawNextPiece(): void {
  const nextPiece = state.pieceQueue.peekNext();
  if (!nextPiece) return;  // queue is empty — nothing to preview

  ctx.font = '14px monospace';
  ctx.fillStyle = '#aaaaaa';
  ctx.textAlign = 'center';
  ctx.fillText('NEXT', NEXT_PREVIEW_X, NEXT_PREVIEW_Y);
  ctx.textAlign = 'left';

  const cells = nextPiece.getCells();
  const color = PIECE_COLORS[nextPiece.getColorIndex()];

  // Center the preview piece in the panel.
  // Offset in CELL_SIZE units: center panel at NEXT_PREVIEW_X,
  // shift left by half the piece width:
  const pieceWidthPx = cells[0].length * CELL_SIZE;
  const startX = NEXT_PREVIEW_X - pieceWidthPx / 2;  // pixel x of left edge
  const startY = NEXT_PREVIEW_Y + 15;                  // pixel y just below label

  for (let rowIndex = 0; rowIndex < cells.length; rowIndex++) {
    for (let colIndex = 0; colIndex < cells[rowIndex].length; colIndex++) {
      if (cells[rowIndex][colIndex] === 0) continue;
      // Draw directly at pixel coordinates (not grid coordinates):
      ctx.fillStyle = color;
      ctx.fillRect(
        startX + colIndex * CELL_SIZE + 1,
        startY + rowIndex * CELL_SIZE + 1,
        CELL_SIZE - 1,
        CELL_SIZE - 1
      );
    }
  }
}
```

Update `render()`:

```ts
function render(): void {
  drawBackground();
  drawBoard(state.board);
  if (state.phase.kind === 'playing') {
    drawGhost(state.activePiece);
    drawPiece(state.activePiece);
  }
  drawHUD();
  drawNextPiece();    // ← add this
  if (state.phase.kind === 'gameover') {
    drawGameOver();
  }
}
```

### SAVE AND TRY

Save. Look at the canvas.

**You should see:** A small piece preview in the right panel below the HUD.
When a piece locks and the next piece spawns, the preview updates to show
the one after that.

---

## 🎯 Challenge: Count Consecutive Same Pieces

**You know:** Without the 7-bag, `Math.random()` can produce long streaks.
With the bag, the maximum run of the same piece is 2 (last of one bag,
first of the next).

**Task:** Add a streak counter that tracks the longest run of the same piece
type seen since the game started. Display it in the HUD as "MAX STREAK: N".

**Hint:** Track `lastPieceIndex: number` and `currentStreak: number` and
`maxStreak: number` in state. After `pieceQueue.next()`, compare the new
piece's color index to `lastPieceIndex`.

---

<details>
<summary>▶ Show Solution</summary>

```ts
// Add to GameState:
interface GameState {
  // ...
  lastPieceIndex: number;
  currentStreak: number;
  maxStreak: number;
}

// Initialize:
const state = {
  // ...
  lastPieceIndex: -1,
  currentStreak: 0,
  maxStreak: 0,
};

// In update() after getting nextPiece:
const nextPiece = state.pieceQueue.next();
const nextIndex = nextPiece.getColorIndex();

if (nextIndex === state.lastPieceIndex) {
  state.currentStreak += 1;
  state.maxStreak = Math.max(state.maxStreak, state.currentStreak);
} else {
  state.currentStreak = 1;
}
state.lastPieceIndex = nextIndex;

// With a 7-bag: maxStreak should never exceed 2.
// Try removing the 7-bag and using Math.random() — max streak grows much higher.
```

**Key insight:** The 7-bag guarantees `maxStreak <= 2` because each bag has
exactly one of each piece. The only way to get the same piece twice is
`[..., X]` end of one bag followed by `[X, ...]` start of the next — the
odds of that are 1/7 per boundary. Pure random gives each piece a 1/7 chance
per draw — the streak can grow unboundedly (though rarely).

</details>

---

## Final Check

| Feature | How to verify |
|---------|---------------|
| 7-bag prevents streaks | Watch 14 pieces — each type appears exactly twice |
| Ghost piece tracks horizontal movement | Move piece left/right — ghost moves too |
| Ghost disappears when piece is at floor | Move piece all the way down — no ghost visible |
| Next preview updates on lock | Watch preview after each lock — shows the upcoming piece |
| Queue size stays healthy | `state.pieceQueue.size` → always > 7 |
| `Queue<T>` is type-safe | Try `state.pieceQueue.queue.enqueue(42)` → TypeScript error (private + wrong type) |

---

## Quick Check Answers

**1. What is the difference between a Queue and a Stack?**

Both add and remove items, but they differ in order. A **Queue** is FIFO (First
In, First Out) — the first item added is the first removed. A **Stack** is LIFO
(Last In, First Out) — the last item added is the first removed. Think: a queue
is a ticket line (first in line gets served first); a stack is a pile of plates
(the last plate added is the first plate used). Queues use `push` + `shift`;
stacks use `push` + `pop`.

**2. Why does pure `Math.random()` allow long streaks?**

Each draw is independent — the probability of the same piece is always 1/7,
regardless of what came before. Probability does not have memory. After drawing
an I-piece, the chance of another I-piece is still 1/7. After 3 I-pieces, the
4th is still 1/7. The 7-bag breaks independence: within a bag, each piece
appears exactly once — the bag "remembers" what it has already given you.

**3. (Prediction) Probability of the same piece 4 times in a row with pure random?**

`(1/7)^3 = 1/343 ≈ 0.29%`. The first draw sets the piece type; each subsequent
draw has a `1/7` chance of matching. For 4 in a row: the first sets the type,
and the next 3 must each match: `(1/7) × (1/7) × (1/7) = 1/343`. In a long
game, this happens roughly once per 1200 piece draws — uncommon but not rare.
Skilled Tetris players rely on piece distribution regularity; a pure random
4-in-a-row of Z-pieces (the "S/Z drought") can be game-ending.

---

*Next: LAB-12 — Generic Queue and Type Constraints. We refine `Queue<T>` with
a type constraint (`T extends object`), discuss when constraints are appropriate,
and briefly show how TypeScript's built-in generic types (`Array<T>`,
`Map<K, V>`, `Record<K, V>`) follow the same pattern. The series ends here —
you have built a complete Tetris game in TypeScript using OOP, linear algebra,
and formal data structures.*
