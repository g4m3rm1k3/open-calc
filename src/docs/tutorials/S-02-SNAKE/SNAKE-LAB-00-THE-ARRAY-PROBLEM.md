# C++ Masterclass — S-02 — LAB 00 — The Snake Problem: Why Arrays Break

**Prerequisites:** All of S-01. You can write loops, functions, structs, and handle errors.

**What this lab adds:**
- A working snake head that moves on a grid — built the obvious way (fixed array)
- The growth problem — what breaks when the snake eats food
- Concrete experience of O(n) insertion cost before you learn the term
- The exact question that motivates the next lab: "what data structure solves this?"
- Real-time keyboard input on Windows with `_getch()`
- ANSI escape codes — moving the terminal cursor to render a game frame

**Time:** ~75 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. A snake of length 5 occupies 5 grid cells. Each frame, every segment moves
>    to where the segment in front of it was. If you store segments in an array,
>    how many copy operations does one frame of movement require?
> 2. The snake grows by adding a new segment at the head. In an array, what has
>    to happen to all existing elements to make room at index 0?
> 3. Predict: If the snake can grow to 100 segments and runs at 10 frames per
>    second, how many segment-copy operations happen per second with an array?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

A snake head that moves in real time — you control it with WASD. No growth yet.
By the end of Part 2, you will try to add growth and discover the array problem
firsthand:

```
####################
#                  #
#                  #
#      O           #
#                  #
#        *         #
#                  #
####################
Score: 0  |  Length: 1  |  Press Q to quit
```

`O` = snake head. `*` = food. `#` = wall. Movement is live — no Enter needed.

---

## Part 1 — Real-Time Input and Grid Rendering

### Concept: `_getch()` — Non-Blocking Keyboard Input

**What it is:** A Windows function from `<conio.h>` that reads one keypress
immediately — without waiting for the user to press Enter, and without echoing
the character to the screen. This is what makes games feel responsive.

**The problem before:** `std::cin >> choice` waits for Enter. A game that pauses
every frame for the user to press Enter is not a game.

**What it hides:** The Windows Console Input API — `ReadConsoleInput`, event queues,
virtual key codes. `_getch()` wraps all of this into one function that returns the
ASCII value of the key pressed.

**The protected invariant:** `_getch()` always returns exactly one character's worth
of input. It does not return until a key is pressed.

**Watch for:** Arrow keys and function keys return two values from `_getch()` — a
leading `0` or `224`, followed by the key code. We use WASD to avoid this. In later
series, we use a proper input system.

**Platform note:** `_getch()` is Windows-only. On Linux/Mac, the equivalent requires
`termios.h` and `tcsetattr()`. The S-07 Shell series addresses this; for now, this
course targets Windows with w64devkit.

---

### Concept: ANSI Escape Codes — Moving the Terminal Cursor

**What they are:** Special character sequences that instruct the terminal to perform
formatting operations — moving the cursor, clearing the screen, setting colors.
They start with `\033[` (escape character followed by `[`) and end with a letter
command.

**Why we need them for games:** Without cursor control, every frame we print new
output below the previous frame — the game scrolls endlessly. We need to overwrite
the same screen region each frame.

| Code | Effect |
|------|--------|
| `\033[2J` | Clear the entire screen |
| `\033[H` | Move cursor to top-left (row 1, col 1) |
| `\033[H\033[2J` | Clear screen and reset cursor — full frame wipe |
| `\033[A` | Move cursor up one line |
| `\033[32m` | Set text color to green |
| `\033[0m` | Reset all formatting |

**What they hide:** Terminal-specific control sequences. The escape codes are
standardized (ANSI/VT100), so the same strings work in any ANSI-compatible terminal —
Windows Terminal, Linux bash, macOS Terminal.

**Watch for:** Old Windows Command Prompt (cmd.exe) does not support ANSI codes by
default. Windows Terminal and PowerShell 7+ do. The course assumes Windows Terminal.
If you see `←[2J` printed literally, your terminal does not support ANSI.

---

## Step 1 — Grid, Constants, and the Render Function

New folder: `c:\Users\g4m3r\Desktop\cadcam\masterclass\S-02-SNAKE\`

New `main.cpp`:

```cpp
#include <iostream>    // std::cout, std::endl
#include <conio.h>     // _getch(), _kbhit() — Windows keyboard input
#include <string>      // std::string
#include <windows.h>   // Sleep() — pause execution for N milliseconds

// ── Grid constants ────────────────────────────────────────────────────────────
const int GRID_COLS = 20;   // number of columns (width)
const int GRID_ROWS =  8;   // number of rows (height)

// ── Tile characters ───────────────────────────────────────────────────────────
const char TILE_EMPTY = ' ';
const char TILE_WALL  = '#';
const char TILE_FOOD  = '*';
const char TILE_HEAD  = 'O';

// ── clearScreen ──────────────────────────────────────────────────────────────
// Sends ANSI escape code to clear the terminal and reset cursor to top-left.
// Every game frame starts with this call.
void clearScreen() {
    std::cout << "\033[H\033[2J";   // \033 = ESC character; H = go home; 2J = clear screen
}

// ── drawGrid ─────────────────────────────────────────────────────────────────
// Renders the grid from a 2D array of tile characters.
// The outer loop is rows (Y); the inner loop is columns (X).
void drawGrid(const char grid[GRID_ROWS][GRID_COLS]) {
    for (int row = 0; row < GRID_ROWS; ++row) {
        for (int col = 0; col < GRID_COLS; ++col) {
            std::cout << grid[row][col];   // print each tile with no separator
        }
        std::cout << "\n";   // end of row — \n is faster than std::endl (no flush)
    }
}

// ── initGrid ─────────────────────────────────────────────────────────────────
// Fills the grid: walls on the border, empty inside.
void initGrid(char grid[GRID_ROWS][GRID_COLS]) {
    for (int row = 0; row < GRID_ROWS; ++row) {
        for (int col = 0; col < GRID_COLS; ++col) {
            bool isEdge = (row == 0) || (row == GRID_ROWS - 1)
                       || (col == 0) || (col == GRID_COLS - 1);
            grid[row][col] = isEdge ? TILE_WALL : TILE_EMPTY;
        }
    }
}

int main() {
    char grid[GRID_ROWS][GRID_COLS];
    initGrid(grid);

    clearScreen();
    drawGrid(grid);
    std::cout << "Grid initialized. Press any key." << std::endl;
    _getch();   // wait for one keypress, then exit

    return 0;
}
```

**`const char grid[GRID_ROWS][GRID_COLS]` as a 2D array parameter:**
A 2D array parameter must specify all dimensions except the first. Declaring
`const char grid[GRID_ROWS][GRID_COLS]` tells the compiler each row is exactly
`GRID_COLS` elements wide, enabling correct address arithmetic for `grid[row][col]`.

Create the `Makefile`:
```makefile
CXX      = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -g
dungeon: main.cpp
	$(CXX) $(CXXFLAGS) main.cpp -o dungeon
clean:
	-del dungeon.exe
```

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** A cleared screen with 8 rows of `####################` borders
and empty space inside. Press any key to exit.

**Change something:** Change `GRID_COLS` to `40`. Run. The grid doubles in width.
All border logic still works — it reads from the constants. Change back to `20`.

---

## Step 2 — A Moving Snake Head

Add the snake head position and the game loop. Add before `main()`:

```cpp
// ── Direction enum ────────────────────────────────────────────────────────────
enum class Direction { Up, Down, Left, Right };

// ── placeEntity ──────────────────────────────────────────────────────────────
// Places one tile character at a specific grid position.
void placeEntity(char grid[GRID_ROWS][GRID_COLS], int row, int col, char tile) {
    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLS) {
        grid[row][col] = tile;   // bounds check before writing
    }
}
```

Replace `main()`:

```cpp
int main() {
    char grid[GRID_ROWS][GRID_COLS];

    // Snake head position — starts in the middle of the playfield
    int headRow = GRID_ROWS / 2;
    int headCol = GRID_COLS / 2;

    // Food position — fixed for now
    int foodRow = 2;
    int foodCol = 5;

    Direction dir = Direction::Right;   // initial movement direction
    int score  = 0;
    bool running = true;

    while (running) {
        // ── Handle input (non-blocking) ───────────────────────────────────────
        if (_kbhit()) {            // _kbhit() returns non-zero if a key is waiting
            char key = _getch();   // read the key without waiting
            switch (key) {
                case 'w': case 'W': dir = Direction::Up;    break;
                case 's': case 'S': dir = Direction::Down;  break;
                case 'a': case 'A': dir = Direction::Left;  break;
                case 'd': case 'D': dir = Direction::Right; break;
                case 'q': case 'Q': running = false;        break;
            }
        }

        // ── Update head position based on direction ───────────────────────────
        int newRow = headRow;
        int newCol = headCol;

        if      (dir == Direction::Up)    { --newRow; }
        else if (dir == Direction::Down)  { ++newRow; }
        else if (dir == Direction::Left)  { --newCol; }
        else if (dir == Direction::Right) { ++newCol; }

        // ── Collision: wall ───────────────────────────────────────────────────
        if (grid[newRow][newCol] == TILE_WALL) {
            running = false;
            break;
        }

        // ── Collision: food ───────────────────────────────────────────────────
        if (newRow == foodRow && newCol == foodCol) {
            ++score;
            foodRow = 3;   // move food — fixed positions for now
            foodCol = 12;
        }

        headRow = newRow;
        headCol = newCol;

        // ── Render ────────────────────────────────────────────────────────────
        initGrid(grid);                                  // reset to walls + empty
        placeEntity(grid, foodRow, foodCol, TILE_FOOD);  // place food
        placeEntity(grid, headRow, headCol, TILE_HEAD);  // place head

        clearScreen();
        drawGrid(grid);
        std::cout << "Score: " << score
                  << "  |  Length: 1"
                  << "  |  Press Q to quit" << std::endl;

        Sleep(150);   // pause 150ms between frames (~6 FPS) — Windows Sleep()
    }

    clearScreen();
    std::cout << "Game Over! Final score: " << score << std::endl;
    return 0;
}
```

**`_kbhit()` explained:** Returns non-zero if a keypress is waiting in the input
buffer, zero if not. Using `_kbhit()` before `_getch()` makes input non-blocking —
if no key is pressed, the game continues without waiting. Without this check, `_getch()`
would pause the game every frame until a key is pressed.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** The snake head (`O`) moving right automatically. Steer with WASD.
Hit a wall to get "Game Over." Press Q to quit cleanly.

**Change something:** Change `Sleep(150)` to `Sleep(50)`. The snake moves 3x faster.
Change to `Sleep(300)` for slower. Change back to `150`.

---

## Part 2 — The Growth Problem

Now try to add a body. The naive approach: store the body segments in an array.

### Step 3 — Add a Body Array

Add segment storage before `main()`:

```cpp
const int MAX_LENGTH = 100;   // maximum snake length — fixed at compile time

struct Segment {
    int row = 0;
    int col = 0;
};
```

Inside `main()`, add body tracking:

```cpp
    Segment body[MAX_LENGTH];   // the body array — fixed size
    int     length = 1;

    body[0].row = headRow;      // segment 0 is the head
    body[0].col = headCol;
```

Now update the movement. Replace the `headRow`/`headCol` update section:

```cpp
        // ── Move the body — THE EXPENSIVE PART ───────────────────────────────
        // Every segment must copy the position of the segment in front of it.
        // Segment N gets segment N-1's position. This must go BACK TO FRONT.
        for (int i = length - 1; i > 0; --i) {
            body[i] = body[i - 1];   // copy position from the segment ahead
        }
        // Now move the head to the new position
        body[0].row = newRow;
        body[0].col = newCol;
        headRow = body[0].row;
        headCol = body[0].col;
```

When food is eaten, grow the body:

```cpp
        // ── Collision: food ───────────────────────────────────────────────────
        if (newRow == foodRow && newCol == foodCol) {
            ++score;
            if (length < MAX_LENGTH) {
                ++length;   // add one segment — it will get the tail's old position next frame
            }
            foodRow = 3;
            foodCol = 12;
        }
```

Update the render to draw the whole body:

```cpp
        initGrid(grid);
        placeEntity(grid, foodRow, foodCol, TILE_FOOD);
        for (int i = length - 1; i >= 0; --i) {
            char tile = (i == 0) ? TILE_HEAD : 'o';   // head = 'O', body = 'o'
            placeEntity(grid, body[i].row, body[i].col, tile);
        }
```

### SAVE AND TRY

```
make
.\dungeon
```

The snake now has a body. Eat the food — the snake grows.

**Now count the cost.** Look at the movement loop:
```cpp
for (int i = length - 1; i > 0; --i) {
    body[i] = body[i - 1];
}
```

At length 50, this copies 49 segments every frame. At length 100, it copies 99 every
frame. At 10 FPS with length 100: **990 copy operations per second** — just to move.
And this is only 100 segments. What if the grid were 80×24 (1920 cells)?

**The other problem — try it:** The new tail segment appears "for free" because we
just stopped overwriting it. But what if we needed to remove a specific segment from
the middle? We would need another shift loop. There is no efficient way to insert or
remove from the middle of an array.

---

## Part 3 — What We Need

### Concept: The Gap That Motivates S-02's Remaining Labs

The array implementation works — but it has two critical problems:

**Problem 1 — O(n) movement:** Every frame, moving the snake copies `length - 1`
segments. As the snake grows, each frame gets slower. In real Snake, the snake can
fill the entire grid — at that size, the array copy dominates the CPU budget.

**Problem 2 — The real operation is add-to-front, remove-from-back.** The snake
gains a new head segment at the front of the list and loses the tail segment at the
back. If a data structure supported:
- "Add an element to the front in O(1)"
- "Remove the element from the back in O(1)"

...then movement would be O(1) regardless of the snake's length.

**That data structure is a doubly linked list** — or more precisely for Snake, a deque
(double-ended queue). In LAB 01, you will build the linked list from scratch to understand
exactly how it works. In LAB 04, you will replace the array with `std::deque` and watch
the movement loop disappear entirely.

---

## 🎯 Challenge: Measure the Cost

**You know:** The body array, `length`, frame counting.

**Task:** Add a frame counter to the game. Every 100 frames, print to the terminal
(after the grid) how many total segment-copy operations have occurred since the game
started. Watch the number grow as the snake gets longer.

**Hint:** Add `int totalCopies = 0;` before the game loop. Inside the movement loop,
add `++totalCopies;` inside the `for` loop. Print `totalCopies` in the status line.

---

<details>
<summary>▶ Show Solution</summary>

```cpp
int totalCopies = 0;   // before the while loop

// Inside movement for loop:
for (int i = length - 1; i > 0; --i) {
    body[i] = body[i - 1];
    ++totalCopies;          // count each copy
}

// In the status line:
std::cout << "Score: " << score
          << "  |  Length: " << length
          << "  |  Copies: " << totalCopies
          << "  |  Q=quit" << std::endl;
```

**What you will see:** With a short snake, copies accumulate slowly. Eat enough food
to reach length 10 — now each frame does 9 copies. At length 20, each frame does 19.
The number accelerates. This is what O(n) cost **feels** like. A linked list keeps
this at O(1) forever.

</details>

---

## Final Check

| Feature | How to Verify |
|---------|--------------|
| Grid renders | 8 rows, walls on all edges, empty inside |
| Head moves | WASD controls the `O` character in real time |
| Wall collision | Hitting a wall ends the game with "Game Over" |
| Food collection | Moving onto `*` increments score |
| Body renders | After eating food, `o` segments trail behind the head |
| Growth works | `length` increases by 1 each time food is eaten |
| Cost visible | Challenge: `totalCopies` grows faster as the snake gets longer |
| Q quits cleanly | Pressing Q exits the loop and prints the final score |

---

## Quick Check Answers

**1. How many copy operations does one frame require for a length-5 snake?**
Four — segments 4, 3, 2, 1 each copy from the segment ahead. Segment 0 (head) gets
the new position without copying. The formula is `length - 1` copies per frame.

**2. What must happen to make room at index 0?**
Every existing element must shift one index higher — element 0 moves to 1, element 1
moves to 2, and so on. This requires iterating the entire array backwards and copying
each element. It is O(n) work regardless of where the computer performs the shift,
because every element must be touched.

**3. 100 segments at 10 FPS — how many copy operations per second?**
`(100 - 1) × 10 = 990` per second. If the snake could grow to fill a 80×24 terminal
grid (1,920 cells) and still run at 10 FPS, that would be `1,919 × 10 = 19,190`
copy operations per second — for a snake game. A linked list reduces this to 10
pointer operations per second regardless of snake length.
