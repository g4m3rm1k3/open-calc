# C++ Masterclass — S-02 — LAB 03 — `std::deque`: The Standard Library Solution

**Prerequisites:** S-02 LAB 02. You built a doubly linked list with O(1) at both ends.

**What this lab adds:**
- `std::deque` — the standard library double-ended queue
- What `deque` hides (and what it does differently from your hand-built list)
- Replacing `SnakeList` with `std::deque<Segment>` — the snake movement loop disappears
- Range-based `for` — iterating a `deque` without indices
- `push_front`, `pop_back`, `front`, `back`, `size` — the five operations you need
- Why the standard library implementation is better than yours in practice
- Integrating `std::deque` into the full snake game from LAB 00

**Time:** ~65 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. Your hand-built `SnakeList` works correctly. Why would you replace it with
>    `std::deque` from the standard library? What does the library version offer
>    that yours does not?
> 2. `std::deque` is described as a "double-ended queue." Based on what you built
>    in LABs 01–02, what two operations define a double-ended queue?
> 3. Predict: After `std::deque<Segment> body; body.push_front({4, 10});`, what
>    is `body.front().row`? What is `body.size()`?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The full Snake game from LAB 00, rewritten to use `std::deque`. The movement loop —
which was 99 copies at length 100 in LAB 00, then 6 manual pointer writes in LAB 02 —
is now two standard library function calls. The game is complete and playable:

```
####################
#                  #
#                  #
#  oooO            #
#                  #
#        *         #
#                  #
####################
Score: 1  |  Length: 4  |  Q=quit
```

---

## Part 1 — What `std::deque` Is

### Concept: `std::deque` — The Standard Double-Ended Queue

**What it is:** `std::deque<T>` (double-ended queue) is a container from the C++
standard library (`#include <deque>`) that supports O(1) insertion and removal at
both ends, and O(1) random access by index.

**What it hides:**
Not a simple linked list like yours. `std::deque` is typically implemented as
a sequence of fixed-size **chunks** (small arrays), linked together with a map of
chunk pointers. This gives it properties that a pure linked list cannot match:
- O(1) push and pop at both ends (like your doubly linked list)
- O(1) random access by index `body[i]` (like an array — linked lists are O(n) for this)
- Better cache performance than a linked list — elements within a chunk are
  in contiguous memory, so the CPU cache brings in multiple elements per cache line

**What it does not hide:** That it is a sequence. It maintains insertion order.
`front()` is always the first element inserted with `push_front`.

**The five operations you need for Snake:**

| Operation | Method | Cost | What it does |
|-----------|--------|------|--------------|
| Add to front | `push_front(val)` | O(1) amortized | New head segment |
| Remove from back | `pop_back()` | O(1) | Old tail segment |
| Read front | `front()` | O(1) | The snake's head position |
| Read back | `back()` | O(1) | The snake's tail position |
| Count elements | `size()` | O(1) | Current snake length |

**`#include <deque>`:** The deque type lives in the `<deque>` header.

**Why "amortized O(1)" for `push_front`?** Most `push_front` calls are O(1) —
they add to an existing chunk. Occasionally, a new chunk must be allocated. The
allocation cost is spread across many calls so the average cost per call is O(1).

**The protected invariant:** `deque.front()` is always the most-recently-pushed-front
element. `deque.back()` is always the most-recently-pushed-back element (or the
oldest push_front element, if nothing was pushed back). Calling `pop_back()` on an
empty deque is undefined behavior — always check `size() > 0` first.

**Your custom `SnakeList` vs `std::deque`:**

| Property | Your `SnakeList` | `std::deque` |
|----------|-----------------|--------------|
| push_front | O(1) ✓ | O(1) amortized ✓ |
| pop_back | O(1) ✓ | O(1) ✓ |
| Random access `[i]` | O(n) — must traverse | O(1) — direct ✓ |
| Cache performance | Poor — nodes scattered in heap | Good — chunks are contiguous |
| Memory overhead | 2 pointers + 1 int per node | 1 pointer per chunk (amortized) |
| Tested and maintained | By you | By compiler implementors since 1998 |
| Iterator support | Custom only | Full STL iterator support |

**When to build your own vs use the standard library:** You built the linked list
from scratch because understanding how it works makes you a better programmer —
you know what the standard library is doing internally, you can debug it, and you
understand why it makes the performance claims it does. In production code, use
`std::deque`. In learning contexts, build it yourself first.

---

## Step 1 — Port Snake to `std::deque`

Create a fresh `main.cpp` in the S-02 folder. This is the full game built on `deque`:

```cpp
#include <iostream>    // std::cout, std::endl
#include <deque>       // std::deque — O(1) push_front, pop_back
#include <conio.h>     // _getch(), _kbhit()
#include <windows.h>   // Sleep()

// ── Constants ─────────────────────────────────────────────────────────────────
const int GRID_COLS     = 20;
const int GRID_ROWS     =  8;
const int INITIAL_LEN   =  3;
const int FRAME_DELAY   = 150;   // milliseconds between frames

// ── Tile characters ───────────────────────────────────────────────────────────
const char TILE_EMPTY = ' ';
const char TILE_WALL  = '#';
const char TILE_FOOD  = '*';
const char TILE_HEAD  = 'O';
const char TILE_BODY  = 'o';

// ── Direction ─────────────────────────────────────────────────────────────────
enum class Direction { Up, Down, Left, Right };

// ── Segment — one position on the grid ────────────────────────────────────────
struct Segment {
    int row = 0;
    int col = 0;
};
```

**`std::deque<Segment>` — a deque of `Segment` structs:**
`<Segment>` is the **template argument** — it tells `deque` what type each element is.
A `std::deque<Segment>` stores `Segment` objects with `push_front`, `pop_back`, etc.
Templates are covered in depth in S-02 LAB 06; for now, read `deque<Segment>` as
"a deque that holds Segment values."

---

## Step 2 — Grid Functions (same as LAB 00)

```cpp
// ── clearScreen ───────────────────────────────────────────────────────────────
void clearScreen() {
    std::cout << "\033[H\033[2J";
}

// ── initGrid ──────────────────────────────────────────────────────────────────
void initGrid(char grid[GRID_ROWS][GRID_COLS]) {
    for (int row = 0; row < GRID_ROWS; ++row) {
        for (int col = 0; col < GRID_COLS; ++col) {
            bool isEdge = (row == 0) || (row == GRID_ROWS - 1)
                       || (col == 0) || (col == GRID_COLS - 1);
            grid[row][col] = isEdge ? TILE_WALL : TILE_EMPTY;
        }
    }
}

// ── drawGrid ──────────────────────────────────────────────────────────────────
void drawGrid(const char grid[GRID_ROWS][GRID_COLS]) {
    for (int row = 0; row < GRID_ROWS; ++row) {
        for (int col = 0; col < GRID_COLS; ++col) {
            std::cout << grid[row][col];
        }
        std::cout << "\n";
    }
}
```

---

## Step 3 — The Snake Update Function

This is the heart of the improvement. The entire movement logic:

```cpp
// ── updateSnake ───────────────────────────────────────────────────────────────
// Moves the snake one step in 'dir'. Returns false if the snake hit a wall or itself.
// 'ate' is set to true if the snake's new head lands on food.
// grid is used only for collision checking against walls.
bool updateSnake(std::deque<Segment>& body,
                 Direction dir,
                 const char grid[GRID_ROWS][GRID_COLS],
                 int foodRow, int foodCol,
                 bool& ate) {
    // Compute new head position
    Segment newHead = body.front();   // copy the current head position

    if      (dir == Direction::Up)    { --newHead.row; }
    else if (dir == Direction::Down)  { ++newHead.row; }
    else if (dir == Direction::Left)  { --newHead.col; }
    else if (dir == Direction::Right) { ++newHead.col; }

    // Wall collision: check the tile at new head position
    if (grid[newHead.row][newHead.col] == TILE_WALL) {
        return false;   // game over — hit a wall
    }

    // Self collision: new head cannot land on any existing body segment
    for (const Segment& seg : body) {       // range-based for — no index needed
        if (seg.row == newHead.row && seg.col == newHead.col) {
            return false;   // game over — hit itself
        }
    }

    // Check food
    ate = (newHead.row == foodRow && newHead.col == foodCol);

    // ── THE MOVEMENT: two calls replace the entire LAB 00 shift loop ──────────
    body.push_front(newHead);   // O(1): add new head
    if (!ate) {
        body.pop_back();        // O(1): remove old tail (only if we did NOT eat)
    }
    // If we ate, we do not pop — the snake grows by one segment

    return true;   // still alive
}
```

**`for (const Segment& seg : body)`** — the **range-based for loop:**
This iterates every element of `body` without managing indices. `seg` is a
`const Segment&` — a read-only reference to each element. This works with any
container that supports iteration (deque, vector, array, etc.). The compiler
translates it to iterator-based code internally.

**`body.front()`:** Returns a reference to the first element — the snake's head.
**`body.push_front(newHead)`:** Inserts `newHead` at the front — O(1).
**`body.pop_back()`:** Removes the last element — O(1).

Compare to LAB 00's movement loop:
```cpp
// LAB 00 (O(n)):
for (int i = length - 1; i > 0; --i) { body[i] = body[i - 1]; }

// NOW (O(1)):
body.push_front(newHead);
if (!ate) body.pop_back();
```

---

## Step 4 — Complete `main()`

```cpp
int main() {
    char grid[GRID_ROWS][GRID_COLS];
    initGrid(grid);

    // ── Initialize snake body using push_front ────────────────────────────────
    std::deque<Segment> body;
    const int START_ROW = GRID_ROWS / 2;
    const int START_COL = GRID_COLS / 2;

    // Build initial snake: INITIAL_LEN segments, head at START_COL
    for (int i = INITIAL_LEN - 1; i >= 0; --i) {
        body.push_front({START_ROW, START_COL - i});
        //                ↑ aggregate initialization — sets row and col of Segment
    }

    // Food position
    int foodRow = 2;
    int foodCol = 5;

    Direction dir = Direction::Right;
    int  score   = 0;
    bool running = true;

    while (running) {
        // ── Input ─────────────────────────────────────────────────────────────
        if (_kbhit()) {
            char key = _getch();
            switch (key) {
                case 'w': case 'W': if (dir != Direction::Down)  dir = Direction::Up;    break;
                case 's': case 'S': if (dir != Direction::Up)    dir = Direction::Down;  break;
                case 'a': case 'A': if (dir != Direction::Right) dir = Direction::Left;  break;
                case 'd': case 'D': if (dir != Direction::Left)  dir = Direction::Right; break;
                case 'q': case 'Q': running = false; break;
            }
        }

        // ── Update ────────────────────────────────────────────────────────────
        bool ate = false;
        if (!updateSnake(body, dir, grid, foodRow, foodCol, ate)) {
            running = false;
            break;
        }

        if (ate) {
            ++score;
            // Move food to a new position (simple version — fixed spots)
            foodRow = (foodRow == 2) ? 5 : 2;
            foodCol = (foodCol == 5) ? 14 : 5;
        }

        // ── Render ────────────────────────────────────────────────────────────
        initGrid(grid);
        grid[foodRow][foodCol] = TILE_FOOD;

        // Place body segments — iterate with index to distinguish head from body
        for (int i = 0; i < static_cast<int>(body.size()); ++i) {
            const Segment& seg = body[i];   // O(1) random access — deque supports []
            char tile = (i == 0) ? TILE_HEAD : TILE_BODY;
            grid[seg.row][seg.col] = tile;
        }

        clearScreen();
        drawGrid(grid);
        std::cout << "Score: " << score
                  << "  |  Length: " << body.size()
                  << "  |  Q=quit" << std::endl;

        Sleep(FRAME_DELAY);
    }

    clearScreen();
    std::cout << "Game Over!" << std::endl;
    std::cout << "Final score: " << score
              << "  |  Final length: " << body.size() << std::endl;

    return 0;
}
```

**`if (dir != Direction::Down) dir = Direction::Up`:** Prevents the snake from
reversing into itself. If moving down and the player presses up, the input is ignored.
Reversing would immediately cause a self-collision on the next frame.

**`static_cast<int>(body.size())`:** `body.size()` returns `size_t` (unsigned).
Comparing `size_t` with `int i` can produce warnings because `int` can be negative
but `size_t` cannot. The cast makes the comparison explicit and warning-free.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** A fully playable Snake game. WASD to steer, Q to quit.
The snake grows when it eats food (`*`). Self-collision ends the game.

**Deliberately test:**
- Steer into a wall → "Game Over"
- Steer into the snake's own body → "Game Over"
- Eat food → snake grows one segment, score increases

---

## 🎯 Challenge: `std::unordered_set` for Self-Collision

**You know:** `updateSnake`, range-based for, `std::deque`.

**The problem with the current self-collision check:**
```cpp
for (const Segment& seg : body) { ... }   // O(n) — checks every segment
```
At length 50, each frame does 50 comparisons. At length 200, 200 comparisons.

**The solution:** `std::unordered_set` — a hash table that answers "is this value
in the set?" in O(1) amortized.

**Task:** Look up `std::unordered_set` in your reference materials or ask a question,
then redesign `updateSnake` to maintain a `std::unordered_set<std::pair<int,int>>` of
occupied positions. Check self-collision with `.count(newHead)` in O(1).

*Note: This requires a custom hash for `std::pair`. A hint is in the details block.*

---

<details>
<summary>▶ Show Hint</summary>

`std::unordered_set` needs a hash function for `std::pair<int,int>`. A simple approach:

```cpp
struct PairHash {
    size_t operator()(const std::pair<int,int>& p) const {
        return std::hash<int>()(p.first) ^ (std::hash<int>()(p.second) << 16);
    }
};

std::unordered_set<std::pair<int,int>, PairHash> occupied;
```

This is a preview of hash tables — the full treatment is in LAB 06 of this series.
For now: `occupied.insert({row, col})` to add, `occupied.count({row, col})` to check,
`occupied.erase({row, col})` to remove.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| `push_front` moves head | `body.front().col` advances by 1 each frame (moving right) |
| `pop_back` moves tail | `body.size()` stays constant when not eating |
| `pop_back` skipped on eat | `body.size()` increases by 1 after hitting food |
| No shift loop | `updateSnake` contains no for-loop over the entire body for movement |
| Wall collision | Steering into `#` shows "Game Over" |
| Self collision | U-turning into the body shows "Game Over" |
| Direction reversal blocked | Pressing `S` while moving up is ignored |
| Food respawns | After eating, `*` appears at a new position |
| Score tracks | Score increments by 1 each time food is eaten |

---

## Quick Check Answers

**1. Why replace your working `SnakeList` with `std::deque`?**
Several reasons: (1) O(1) random access by index — your linked list required O(n)
traversal to reach `body[i]`, which made rendering the body with indices impossible
without a counter. `std::deque` supports `body[i]` in O(1). (2) Cache performance —
deque stores elements in contiguous chunks; linked list nodes are scattered in heap
memory. Sequential access of a deque is significantly faster due to CPU cache effects.
(3) Tested correctness — the standard library deque has been verified by thousands of
users and compiler implementors. Your linked list was a learning exercise.

**2. What two operations define a double-ended queue?**
O(1) insertion at the front (`push_front`) and O(1) removal from the back (`pop_back`).
These map directly to snake movement: the new head is pushed to the front; the old
tail is popped from the back. A single-ended queue (like `std::queue`) only supports
push at the back and pop at the front — Snake needs both operations at the front,
which is why it is specifically a deque problem.

**3. `body.push_front({4, 10})` — what is `body.front().row`? What is `body.size()`?**
`body.front().row = 4` and `body.size() = 1`. `push_front` inserts at the front.
`front()` returns a reference to the first element. After one `push_front`, the deque
has exactly 1 element. `size()` returns the count of elements.
