# C++ Space Invaders — LAB 1 — The Board Lives (Triple-Weave Edition)

**Prerequisites:** You can compile and run a C++ program with `g++` or `clang++`. This lab builds on basic programming (variables, loops).  
(You do **not** need SDL2/raylib — this runs in the terminal.)

**What this lab adds:**

*   A visible **Space Invaders board** in your terminal (walls + empty space)
*   A **player ship** you can move left/right
*   An **invader formation** that marches sideways, bounces, and drops (classic behavior)

**Time:** 45–90 minutes (you’ll spend time experimenting and doing challenges)

***

## What You Will Build

When you run the program, you will see a playable turn-based “slice”:

    ############################
    #............W.W.W.W......#
    #............W.W.W.W......#
    #............W.W.W.W......#
    #..........................#
    #.............^............#
    ############################
    Commands: a=left, d=right, enter=wait, q=quit
    >

*   `^` is your ship
*   `W` are invaders
*   Type `a` / `d` then Enter to move
*   Press Enter to “wait” (invaders still move)
*   Invaders move sideways, bounce at walls, and drop one row

This is not “just printing.” It’s a real loop: **input → update → render**.

***

## Quick Check — answer these before reading further:

1.  **Prediction:** If we “move” invaders by editing characters in the board directly, what bug might happen?
2.  **Connection:** How is a turn-based loop still a “game loop”?
3.  **C++:** Why would we pass the board into `renderBoard()` by `const&` instead of by value?
    *(Answers at the end of this lab)*

***

# Concept Blocks (before any code that uses them)

### Concept: Named constants (no magic numbers)

**What it is:** A `const` value with a meaningful name.

**The problem before:** Hard-coded numbers make code unreadable and fragile.

```cpp
// What is 28? Why 18? What is '#'? What is '.'?
for (int r = 0; r < 18; r++) { ... }
```

**The solution:** Give every important literal a name.

**Smallest possible example:**

```cpp
const int boardWidth = 28;
const char wallChar = '#';
```

**Why it matters here:** Space Invaders has fixed “board rules” (walls, bounds). Constants make those rules explicit.

**Watch for:** “const but unclear” names like `w` or `n`. Use descriptive names.

***

### Concept: `std::vector<std::string>` as a grid

**What it is:** A 2D grid represented as a list of rows, each row is a string of characters.

**The problem before:** A 2D array is verbose to initialize and print.

**The solution:** A vector of strings is easy to build and easy to render.

**Smallest possible example:**

```cpp
std::vector<std::string> grid = {
  "###",
  "# #",
  "###"
};
```

**Why it matters here:** This gives us something visible in minutes (Law 1).

**Watch for:** Accidentally changing the grid while rendering — keep rendering read-only.

***

### Concept: Pass-by-`const&` (avoid copying)

**What it is:** Passing a parameter as a constant reference so it is not copied and cannot be modified.

**The problem before:** Passing a large vector by value copies the whole board.

**The solution:** Use `const std::vector<std::string>&`.

**Smallest possible example:**

```cpp
void print(const std::vector<std::string>& grid) { ... }
```

**Why it matters here:** Rendering happens every loop; copying would be wasteful and confusing.

**Watch for:** Forgetting `const` and accidentally mutating state while “rendering.”

***

### Concept: Game Loop (Mental Model) — Input → Update → Render

**What it is:** A repeated cycle that reads input, updates state, and draws output.

**The problem before:** If you update state but never render, nothing seems to happen.

**The solution:** Every loop iteration ends with visible output.

**Smallest possible example:**

```cpp
while (true) {
  readInput();
  update();
  render();
}
```

**Why it matters here:** This structure is the “engine.” Everything else is a feature.

**Watch for:** Updating twice per input, or rendering before updating and confusing yourself.

***

### Concept: Separate “state” from “rendering” (Software Engineering)

**What it is:** Store the game world in data (positions), then generate the board from that data.

**The problem before:** If you move invaders by scribbling on the board directly, you leave old characters behind.

**The solution:** Rebuild the board each frame from a clean base, then place objects.

**Smallest possible example:**

```cpp
auto board = createEmptyBoard();
board[y][x] = '^'; // place player based on state
renderBoard(board);
```

**Why it matters here:** This prevents “ghost trails” and keeps your code debuggable.

**Watch for:** Mutating state inside your render function.

***

# Step 1 — Draw a board (walls + empty)

**This step focuses on:**

*   **C++:** named constants, vector-of-strings grid
*   **Software Engineering:** “visible before complex” + no magic numbers
*   **Game:** you see a level boundary immediately

Create `main.cpp`:

```cpp
#include <iostream>
#include <string>
#include <vector>

// ----------------------------
// Named constants (no magic numbers)
// ----------------------------
const int boardWidth  = 28;  // horizontal cells
const int boardHeight = 18;  // vertical cells

const char wallChar  = '#';
const char emptyChar = '.';

// ----------------------------
// Create a board with walls around the edges
// ----------------------------
std::vector<std::string> createEmptyBoard() {
    std::vector<std::string> board;

    for (int rowIndex = 0; rowIndex < boardHeight; rowIndex++) {
        std::string row;

        for (int colIndex = 0; colIndex < boardWidth; colIndex++) {
            const bool isBorderRow = (rowIndex == 0) || (rowIndex == boardHeight - 1);
            const bool isBorderCol = (colIndex == 0) || (colIndex == boardWidth - 1);

            if (isBorderRow || isBorderCol) {
                row.push_back(wallChar);
            } else {
                row.push_back(emptyChar);
            }
        }

        board.push_back(row);
    }

    return board;
}

// ----------------------------
// Render is read-only: const& prevents copying and prevents mutation
// ----------------------------
void renderBoard(const std::vector<std::string>& board) {
    for (const std::string& row : board) {
        std::cout << row << "\n";
    }
}

int main() {
    const std::vector<std::string> board = createEmptyBoard();
    renderBoard(board);
    return 0;
}
```

### SAVE AND TRY

Save. Compile and run:

*   macOS/Linux:
    ```bash
    g++ -std=c++20 main.cpp -O2 -o invaders
    ./invaders
    ```
*   Windows (MinGW):
    ```bash
    g++ -std=c++20 main.cpp -O2 -o invaders.exe
    invaders.exe
    ```

**You should see:** A rectangle of `#` with `.` inside.

**In Terminal, check:** Change `boardHeight` to `10`. Rebuild. Board is shorter. Change it back.

**Change something:** Change `emptyChar` from `'.'` to `' '`. Rebuild. Interior becomes blank. Change back if you prefer dots.

***

## 🎯 Challenge: Add a “ceiling gap” for style (without breaking walls)

**You know:** Borders are determined by `isBorderRow` and `isBorderCol`.

**Task:** Make a 4-cell gap in the top wall centered horizontally, like this:

    ###########....############

**Starting code (inside border check):**

```cpp
if (isBorderRow || isBorderCol) {
    row.push_back(wallChar);
}
```

**Hints:**

1.  The top wall is `rowIndex == 0`.
2.  The center column is `boardWidth / 2`.

Try for at least 5 minutes before revealing the solution.

***

<details>
<summary>▶ Show Solution</summary>

```cpp
const int gapWidth = 4;

const bool isTopRow = (rowIndex == 0);
const int gapStartX = (boardWidth / 2) - (gapWidth / 2);
const int gapEndX   = gapStartX + gapWidth - 1;

const bool isInTopGap = isTopRow && (colIndex >= gapStartX) && (colIndex <= gapEndX);

if ((isBorderRow || isBorderCol) && !isInTopGap) {
    row.push_back(wallChar);
} else {
    row.push_back(emptyChar);
}
```

**Key insight:** You’re learning how to express “level constraints” as simple boolean rules — that’s game logic and software engineering at the same time.

</details>

***

# Step 2 — Add the player ship (state → render)

**This step focuses on:**

*   **C++:** `struct` and indexing into `board[y][x]`
*   **Software Engineering:** state stored separately from rendering
*   **Game:** you see your ship on screen

### Concept: `struct Pos` — a named coordinate type

**What it is:** A tiny type that groups related values (`x`, `y`) together.

**The problem before:** Passing two ints around causes confusion (`is it x,y or y,x?`).

**The solution:** Use a `Pos` struct.

**Smallest possible example:**

```cpp
struct Pos { int x; int y; };
Pos p{10, 5};
```

**Why it matters here:** Player and invaders are positions. This prevents mixups.

**Watch for:** Swapping `x` and `y` when indexing: `board[y][x]` is the correct order.

***

Add this near the top (after constants):

```cpp
struct Pos {
    int x;
    int y;
};

const char playerChar = '^';

Pos defaultPlayerPos() {
    // Player starts centered, one row above the bottom wall.
    return Pos{ boardWidth / 2, boardHeight - 2 };
}
```

Update `main()`:

```cpp
int main() {
    std::vector<std::string> board = createEmptyBoard();

    Pos playerPos = defaultPlayerPos();
    board[playerPos.y][playerPos.x] = playerChar;

    renderBoard(board);
    return 0;
}
```

### SAVE AND TRY

Rebuild and run.

**You should see:** `^` near the bottom center.

**Console test (mental):** Confirm you’re indexing as `board[y][x]` not `board[x][y]`. If you swap them, you’ll likely crash or draw in wrong place.

**Change something:** Change `playerChar` to `'A'`. Rebuild → it changes. Set back to `'^'`.

***

## 🎯 Challenge: Clamp the player spawn inside the walls

**You know:** Valid inside columns are from `1` to `boardWidth - 2`.

**Task:** Ensure the player never spawns on wall columns.

**Starting code:**

```cpp
return Pos{ boardWidth / 2, boardHeight - 2 };
```

Try for at least 5 minutes before revealing the solution.

***

<details>
<summary>▶ Show Solution</summary>

```cpp
Pos defaultPlayerPos() {
    const int minInsideX = 1;
    const int maxInsideX = boardWidth - 2;

    int spawnX = boardWidth / 2;

    if (spawnX < minInsideX) spawnX = minInsideX;
    if (spawnX > maxInsideX) spawnX = maxInsideX;

    return Pos{ spawnX, boardHeight - 2 };
}
```

**Key insight:** “Clamp” is an invariant-enforcer. Invariants are a software engineering tool: they prevent impossible states.

</details>

***

# Step 3 — Make it playable (turn-based game loop + movement)

**This step focuses on:**

*   **C++:** functions, pass-by-value vs return values, `std::getline`
*   **Software Engineering:** the game loop mental model (input→update→render)
*   **Game:** you can control the ship

### Concept: `std::getline` — simplest portable input

**What it is:** Reads a full line into a `std::string`.

**The problem before:** Non-blocking input is hard and platform-specific.

**The solution:** Turn-based input gives you a playable loop now (we’ll do real-time later).

**Smallest possible example:**

```cpp
std::string command;
std::getline(std::cin, command);
```

**Why it matters here:** You get interactivity today without libraries.

**Watch for:** Empty string means “Enter pressed” — treat it as “wait”.

***

Add these helper functions:

```cpp
void clearScreenSimple() {
    // Portable "clear": lots of newlines.
    // Not fancy, but avoids system() calls.
    for (int i = 0; i < 40; i++) {
        std::cout << "\n";
    }
}

Pos movePlayer(Pos playerPos, const std::string& command) {
    const int minInsideX = 1;
    const int maxInsideX = boardWidth - 2;

    if (command == "a") {
        playerPos.x -= 1;
    }
    if (command == "d") {
        playerPos.x += 1;
    }

    // Invariant: player stays inside walls
    if (playerPos.x < minInsideX) playerPos.x = minInsideX;
    if (playerPos.x > maxInsideX) playerPos.x = maxInsideX;

    return playerPos;
}
```

Replace `main()` with a loop:

```cpp
int main() {
    Pos playerPos = defaultPlayerPos();

    while (true) {
        std::vector<std::string> board = createEmptyBoard();
        board[playerPos.y][playerPos.x] = playerChar;

        clearScreenSimple();
        renderBoard(board);

        std::cout << "Commands: a=left, d=right, enter=wait, q=quit\n";
        std::cout << "> ";

        std::string command;
        std::getline(std::cin, command);

        if (command == "q") {
            break;
        }

        playerPos = movePlayer(playerPos, command);
    }

    return 0;
}
```

### SAVE AND TRY

Rebuild and run.

**You should see:** board redraws every turn; ship moves with `a` and `d`.

**In Terminal:** Press Enter with no input → ship does not move.

**Change something:** Change movement step from `1` to `2` in `movePlayer`. Rebuild → ship jumps faster. Change back.

***

## 🎯 Challenge: Add “fast move” commands `aa` and `dd`

**You know:** input is a string and changes position deltas.

**Task:** `aa` moves left 2, `dd` moves right 2.

Try for at least 5 minutes before revealing the solution.

***

<details>
<summary>▶ Show Solution</summary>

```cpp
if (command == "a")  { playerPos.x -= 1; }
if (command == "aa") { playerPos.x -= 2; }

if (command == "d")  { playerPos.x += 1; }
if (command == "dd") { playerPos.x += 2; }
```

**Key insight:** You’re building “input mapping” — a common game-engine concept — using only if-statements you understand.

</details>

***

# Step 4 — Add invaders (formation + classic marching)

**This step focuses on:**

*   **C++:** vectors of structs, references, loops
*   **Software Engineering:** separate “invader state” from the board
*   **Game:** Space Invaders starts feeling like Space Invaders

### Concept: “Entity list” (Software Engineering mental model)

**What it is:** A list of objects (positions) that represent the world.

**The problem before:** If you store invaders only as characters in the board, moving them is messy.

**The solution:** Store invaders as positions (`std::vector<Pos>`), then draw them.

**Smallest possible example:**

```cpp
std::vector<Pos> invaders;
invaders.push_back(Pos{10,2});
```

**Why it matters here:** This keeps logic clean and avoids “ghost characters.”

**Watch for:** Updating the board in one place and positions in another → pick one source of truth (positions).

***

Add invader constants and a field struct:

```cpp
const char invaderChar = 'W';

const int invaderRows = 3;
const int invaderCols = 6;
const int invaderStartX = 12; // starting column
const int invaderStartY = 2;  // starting row

struct InvaderField {
    std::vector<Pos> invaders;
    int moveDirX; // +1 right, -1 left
};
```

Create invaders:

```cpp
InvaderField createInvaders() {
    InvaderField field;
    field.moveDirX = 1;

    for (int row = 0; row < invaderRows; row++) {
        for (int col = 0; col < invaderCols; col++) {
            field.invaders.push_back(Pos{
                invaderStartX + col * 2, // spacing between invaders
                invaderStartY + row
            });
        }
    }

    return field;
}
```

Movement helpers:

```cpp
bool wouldInvadersHitWallNext(const InvaderField& field) {
    const int minInsideX = 1;
    const int maxInsideX = boardWidth - 2;

    for (const Pos& inv : field.invaders) {
        const int nextX = inv.x + field.moveDirX;
        if (nextX <= minInsideX || nextX >= maxInsideX) {
            return true;
        }
    }

    return false;
}

void stepInvaders(InvaderField& field) {
    const bool bounceNow = wouldInvadersHitWallNext(field);

    if (bounceNow) {
        field.moveDirX *= -1;

        // Classic behavior: drop one row when bouncing.
        for (Pos& inv : field.invaders) {
            inv.y += 1;
        }
        return;
    }

    // Otherwise, shift sideways.
    for (Pos& inv : field.invaders) {
        inv.x += field.moveDirX;
    }
}
```

Update `main()` to include invaders:

```cpp
int main() {
    Pos playerPos = defaultPlayerPos();
    InvaderField invaders = createInvaders();

    while (true) {
        std::vector<std::string> board = createEmptyBoard();

        // Draw invaders from state → board
        for (const Pos& inv : invaders.invaders) {
            board[inv.y][inv.x] = invaderChar;
        }

        // Draw player from state → board
        board[playerPos.y][playerPos.x] = playerChar;

        clearScreenSimple();
        renderBoard(board);

        std::cout << "Commands: a=left, d=right, enter=wait, q=quit\n";
        std::cout << "> ";

        std::string command;
        std::getline(std::cin, command);

        if (command == "q") break;

        // Update phase: player then invaders
        playerPos = movePlayer(playerPos, command);
        stepInvaders(invaders);
    }

    return 0;
}
```

### SAVE AND TRY

Rebuild and run.

**You should see:** invaders shift sideways each turn; bounce and drop at walls.

**Try this:** Press Enter repeatedly — invaders move even if you don’t.

**Change something:** Change `invaderCols` from `6` to `10`. Rebuild → bigger formation. Change back.

***

## 🎯 Challenge: Game Over when invaders reach the player row

**You know:** invaders have `y` positions and player has `playerPos.y`.

**Task:** If any invader reaches `playerPos.y`, print “GAME OVER” and exit.

Try for at least 5 minutes before revealing the solution.

***

<details>
<summary>▶ Show Solution</summary>

Add this right after `stepInvaders(invaders);`:

```cpp
for (const Pos& inv : invaders.invaders) {
    if (inv.y >= playerPos.y) {
        std::cout << "\nGAME OVER: invaders reached your row.\n";
        return 0;
    }
}
```

**Key insight:** You don’t need complex collision systems to get meaningful game constraints. Simple thresholds are valid constraints and are easy to reason about.

</details>

***

# Final Check (verify every feature)

| Feature                         | How to verify                                             |
| ------------------------------- | --------------------------------------------------------- |
| Board renders with walls        | Run → see `#` border                                      |
| No magic numbers for board size | Search code → `boardWidth`, `boardHeight` constants exist |
| Player appears                  | Run → see `^` near bottom                                 |
| Player moves left/right         | Type `a` / `d` + Enter                                    |
| Player clamped inside walls     | Hold `a` until left wall → stops at inside border         |
| Invader formation appears       | Run → see `W` group near top                              |
| Invaders march sideways         | Press Enter repeatedly                                    |
| Invaders bounce and drop        | Keep pressing Enter until they hit wall → they drop a row |
| Quit works                      | Type `q` then Enter                                       |

***

## Quick Check Answers

**1. Prediction: If we move invaders by editing characters in the board directly, what bug might happen?**  
Old invader characters can remain on the board (“ghost trails”) unless you perfectly erase every old position. This lab avoids that by rebuilding the board from scratch each loop (`createEmptyBoard()`), then placing invaders and player from state positions.

**2. Connection: How is a turn-based loop still a “game loop”?**  
It is the same sequence: **input → update → render**. The only difference is what “time” means. Here, time advances on Enter. Later, time advances every frame using a timer.

**3. C++: Why pass the board to `renderBoard()` by `const&` instead of by value?**  
Passing by value copies the entire `std::vector<std::string>` (expensive and unnecessary). Passing by `const&` avoids copying and also prevents `renderBoard()` from accidentally changing game state.

***


