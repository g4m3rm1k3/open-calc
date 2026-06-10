# C++ Masterclass — S-02 — LAB 09 — Capstone: Complete Snake

**Prerequisites:** All S-02 labs (00–08). You have every feature built separately.

**What this lab adds:**
- ANSI color codes — making the terminal game visually distinct
- A complete, integrated codebase — all S-02 features working together
- A proper game-over screen with the final score and high score comparison
- Win detection — recognizing a full grid and celebrating it
- A "play again?" loop — the full game session flow
- An S-02 mastery review before moving to S-03
- A forward look: the 2D grid problem that Tetris introduces

**Time:** ~90 minutes

---

> **Quick Check — try to answer before reading:**
>
> 1. List every data structure you used in S-02 and the Big-O cost of the operation
>    it was chosen to optimize. Can you do this without looking back?
> 2. The snake's head is green, the body is dark green, food is red, walls are
>    white. How do ANSI escape codes let you set these colors without an external
>    library?
> 3. When the player loses, the game should offer to play again. Which loop type
>    wraps the entire game session — `while`, `for`, or `do-while`? Why?
>
> *(Answers at the end of this lab)*

---

## What You Will Build

The final, polished Snake game — colorized, timed, with a full session loop:

```
╔══════════════════════════════════════╗
║         S N A K E   v2.0            ║
╚══════════════════════════════════════╝

  [1]  Classic   [2]  Wrap   [Q]  Quit
```

```
████████████████████████
█                      █     ← white walls
█    oooo              █     ← dark green body
█       O              █     ← bright green head
█            *         █     ← red food
█                      █
████████████████████████
Score: 3  |  Best: 12  |  Len: 7  |  12 FPS
```

```
╔══════════════════════════════════════╗
║        GAME OVER                    ║
║  Score:  7   |  Best: 12            ║
║  Length: 10  |  Time:  43s          ║
║                                     ║
║  [R] Play Again   [Q] Quit          ║
╚══════════════════════════════════════╝
```

---

## Part 1 — ANSI Color Codes

### Concept: ANSI Color Sequences — Terminal Color Without a Library

**What they are:** Extensions to the escape codes from LAB 00. After `\033[`, a
number followed by `m` sets a text attribute. These work in any ANSI-compatible
terminal — Windows Terminal, PowerShell 7, Linux bash, macOS Terminal.

**The color codes you need:**

| Code | Effect |
|------|--------|
| `\033[0m` | Reset — all formatting off |
| `\033[1m` | Bold / bright |
| `\033[32m` | Foreground green |
| `\033[92m` | Foreground bright green |
| `\033[31m` | Foreground red |
| `\033[37m` | Foreground white |
| `\033[90m` | Foreground dark gray |

**Combining codes:** `\033[1;92m` sets bold AND bright green. Separate codes
with `;` inside the same `\033[...m` block.

**The pattern for colored output:**
```cpp
std::cout << "\033[92m" << "O" << "\033[0m";
//            ↑ set bright green   ↑ reset back to normal
```
Always reset after a colored character — otherwise all subsequent output inherits
the color.

**What it hides:** The terminal's rendering engine. The escape sequence is sent as
raw characters in the output stream; the terminal interprets them as commands instead
of displaying them. No external library is needed — the terminal does all the work.

**Watch for:** Standard `cmd.exe` on older Windows systems does not support ANSI
codes without enabling them via `SetConsoleMode`. Windows Terminal (the default on
Windows 10/11) and PowerShell support them natively. The course assumes Windows Terminal.

---

## Step 1 — A Color Utility Header

Create a small set of named color constants. Add before all other code:

```cpp
// ── ANSI Color Codes ──────────────────────────────────────────────────────────
// Stored as string constants so they compose with << naturally.
// Always end a colored block with RESET.
namespace Color {
    const std::string RESET       = "\033[0m";
    const std::string BOLD        = "\033[1m";
    const std::string GREEN       = "\033[32m";
    const std::string BRIGHT_GREEN= "\033[92m";
    const std::string RED         = "\033[31m";
    const std::string WHITE       = "\033[37m";
    const std::string DARK_GRAY   = "\033[90m";
    const std::string CYAN        = "\033[96m";
    const std::string YELLOW      = "\033[93m";
}
```

**`namespace Color`:** Groups the constants under a named scope. Access them as
`Color::RED` instead of just `RED`. Namespaces prevent name collisions — a `RED`
defined elsewhere in the program will not conflict with `Color::RED`.
Full namespace coverage is in S-03 (Tetris). For now, read `namespace X { ... }` as
"everything inside belongs to X."

### SAVE AND TRY

Add a quick color test in `main()`:
```cpp
    std::cout << Color::BRIGHT_GREEN << "BRIGHT GREEN" << Color::RESET << std::endl;
    std::cout << Color::RED          << "RED"          << Color::RESET << std::endl;
    std::cout << Color::WHITE        << "WHITE"        << Color::RESET << std::endl;
    _getch();
```
```
make
.\dungeon
```
**You should see:** Three colored lines. Verify the colors match the labels. Remove the test.

---

## Step 2 — Colorized `drawGrid`

Replace the plain `drawGrid` with a version that applies color per tile type:

```cpp
// ── drawGrid — render with ANSI colors ────────────────────────────────────────
void drawGrid(const char grid[GRID_ROWS][GRID_COLS]) {
    for (int row = 0; row < GRID_ROWS; ++row) {
        for (int col = 0; col < GRID_COLS; ++col) {
            char tile = grid[row][col];

            switch (tile) {
                case TILE_WALL:
                    std::cout << Color::WHITE << tile << tile << Color::RESET;
                    // Print wall twice — '##' makes walls look thicker and walls
                    // need 2 chars to balance with the 2-char spacing used before.
                    // Simpler approach: just use a block character '█' once.
                    break;
                case TILE_HEAD:
                    std::cout << Color::BRIGHT_GREEN << tile << " " << Color::RESET;
                    break;
                case TILE_BODY:
                    std::cout << Color::GREEN << tile << " " << Color::RESET;
                    break;
                case TILE_FOOD:
                    std::cout << Color::RED << tile << " " << Color::RESET;
                    break;
                default:   // empty
                    std::cout << "  ";   // two spaces — matches the 2-char width above
                    break;
            }
        }
        std::cout << "\n";
    }
}
```

**Two-character tiles:** Each cell is rendered as two characters — the tile symbol
plus a space (or `##` for walls). This makes the grid appear wider and gives the
snake a more natural aspect ratio in most terminal fonts.

### SAVE AND TRY

```
make
.\dungeon
```

**You should see:** Colorized grid — bright green head, green body, red food,
white walls on a dark background. The game is visually distinct now.

---

## Part 2 — Session Loop and Game-Over Screen

### Concept: The Session Loop — Wrapping Multiple Game Rounds

**What it is:** The outer loop that asks "play again?" after each game ends. The
game loop (from LAB 03–08) handles one round. The session loop handles multiple
rounds.

**The structure:**
```cpp
bool playAgain = true;
while (playAgain) {         // ← session loop
    playOneGame(mode, ...); // ← one complete game
    playAgain = askPlayAgain();
}
```

**`do-while` as an alternative:**
```cpp
do {
    playOneGame(mode, ...);
} while (askPlayAgain());
```
Both work. `do-while` is natural here because you always play at least one game
before asking. Either is acceptable — the important thing is that the session loop
and game loop are separate.

---

## Step 3 — Game-Over Screen Function

Add before `main()`:

```cpp
// ── GameResult — data returned from one game session ─────────────────────────
struct GameResult {
    int score      = 0;
    int finalLen   = 0;
    int elapsedSec = 0;
    bool won       = false;   // true if snake filled the grid
};

// ── showGameOver — display the game-over screen ───────────────────────────────
// Returns true if the player wants to play again.
bool showGameOver(const GameResult& result, int highScore) {
    clearScreen();

    bool newRecord = (result.score > highScore);

    std::cout << Color::WHITE << "╔══════════════════════════════════════╗" << Color::RESET << std::endl;

    if (result.won) {
        std::cout << Color::YELLOW << "║           Y O U  W O N !            ║" << Color::RESET << std::endl;
    } else if (newRecord) {
        std::cout << Color::YELLOW << "║       NEW HIGH SCORE!               ║" << Color::RESET << std::endl;
    } else {
        std::cout << Color::WHITE  << "║          GAME OVER                  ║" << Color::RESET << std::endl;
    }

    std::cout << Color::WHITE << "╠══════════════════════════════════════╣" << Color::RESET << std::endl;

    auto padLine = [](const std::string& s) {
        std::string padded = "║  " + s;
        while (padded.size() < 40) padded += ' ';
        padded += "║";
        return padded;
    };

    std::cout << Color::WHITE
              << padLine("Score:  " + std::to_string(result.score)
                       + "   |  Best: " + std::to_string(std::max(result.score, highScore)))
              << Color::RESET << std::endl;

    std::cout << Color::WHITE
              << padLine("Length: " + std::to_string(result.finalLen)
                       + "   |  Time: " + std::to_string(result.elapsedSec) + "s")
              << Color::RESET << std::endl;

    std::cout << Color::WHITE << "╠══════════════════════════════════════╣" << Color::RESET << std::endl;
    std::cout << Color::WHITE << "║                                      ║" << Color::RESET << std::endl;
    std::cout << Color::CYAN  << "║  [R] Play Again     [Q] Quit         ║" << Color::RESET << std::endl;
    std::cout << Color::WHITE << "╚══════════════════════════════════════╝" << Color::RESET << std::endl;

    char key = _getch();
    return (key == 'r' || key == 'R');
}
```

**Lambda `padLine`:** The `auto padLine = [](const std::string& s) { ... };` defines
a lambda — an anonymous function defined inline. It takes a string, pads it to width
40, and wraps it with `║...║` border characters. Lambdas are covered in depth in S-04;
for now, read it as "a function defined locally, used only here."

---

## Step 4 — Extract `playOneGame`

Wrap the entire game loop into a function. This makes the session loop in `main()`
clean:

```cpp
// ── playOneGame — run one complete game session ───────────────────────────────
// Returns a GameResult summarizing the session.
GameResult playOneGame(GameMode mode, int& highScore) {
    // ── Initialization ────────────────────────────────────────────────────────
    char grid[GRID_ROWS][GRID_COLS];
    initGrid(grid);

    std::deque<Segment> body;
    PosSet occupied;
    const int START_ROW = GRID_ROWS / 2;
    const int START_COL = GRID_COLS / 2;

    for (int i = INITIAL_LEN - 1; i >= 0; --i) {
        Segment seg = {START_ROW, START_COL - i};
        body.push_front(seg);
        occupied.insert({seg.row, seg.col});
    }

    Segment food  = placeFood(body, occupied);
    Direction dir = Direction::Right;
    int  score    = 0;
    bool running  = true;
    const int INTERIOR_CELLS = (GRID_ROWS - 2) * (GRID_COLS - 2);

    auto gameStart = now();   // track total game duration

    // ── Game Loop ─────────────────────────────────────────────────────────────
    while (running) {
        auto frameStart = now();

        // Input
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

        if (!running) break;

        // Update
        bool ate = false;
        if (!updateSnake(body, occupied, dir, grid, food.row, food.col, ate, mode)) {
            running = false;
            break;
        }

        if (ate) {
            ++score;
            if (static_cast<int>(body.size()) >= INTERIOR_CELLS) {
                running = false;   // win condition
                break;
            }
            food = placeFood(body, occupied);
        }

        // Speed
        int targetFps = std::min(MIN_FPS + score, MAX_FPS);
        int targetMs  = 1000 / targetFps;

        // Render
        initGrid(grid);
        grid[food.row][food.col] = TILE_FOOD;
        for (int i = static_cast<int>(body.size()) - 1; i >= 0; --i) {
            char tile = (i == 0) ? TILE_HEAD : TILE_BODY;
            grid[body[i].row][body[i].col] = tile;
        }

        clearScreen();
        drawGrid(grid);
        std::cout << "Score: " << score
                  << "  |  Best: " << highScore
                  << "  |  Len: "  << body.size()
                  << "  |  "       << std::min(MIN_FPS + score, MAX_FPS) << " FPS"
                  << "  |  Q=quit" << std::endl;

        // Frame timing
        int frameMs = elapsedMs(frameStart, now());
        int sleepMs = targetMs - frameMs;
        if (sleepMs > 0) Sleep(sleepMs);
    }

    // ── Build and return result ────────────────────────────────────────────────
    GameResult result;
    result.score      = score;
    result.finalLen   = static_cast<int>(body.size());
    result.elapsedSec = elapsedMs(gameStart, now()) / 1000;
    result.won        = (static_cast<int>(body.size()) >= INTERIOR_CELLS);

    if (score > highScore) {
        highScore = score;
        saveHighScore(HIGHSCORE_FILE, highScore);
    }

    return result;
}
```

---

## Step 5 — Clean `main()` — The Session Loop

```cpp
int main() {
    // Show benchmark results once at startup (from LAB 08)
    benchmarkCollision();
    std::cout << "Press any key to start..." << std::endl;
    _getch();

    int      highScore = loadHighScore(HIGHSCORE_FILE);
    GameMode mode      = selectMode();
    bool     again     = true;

    while (again) {
        // Show mode label briefly
        clearScreen();
        if (mode == GameMode::Wrap) {
            std::cout << Color::CYAN << "[Wrap Mode]" << Color::RESET << std::endl;
        } else {
            std::cout << Color::WHITE << "[Classic Mode]" << Color::RESET << std::endl;
        }
        Sleep(800);

        // Play one complete game
        GameResult result = playOneGame(mode, highScore);

        // Show game-over screen and ask to play again
        again = showGameOver(result, highScore - result.score + result.score);
        //                            ↑ pass the updated highScore (may have changed)

        if (again) {
            // Allow mode switch between rounds
            mode = selectMode();
        }
    }

    clearScreen();
    std::cout << Color::CYAN << "Thanks for playing Snake! Final best: "
              << highScore << Color::RESET << std::endl;
    return 0;
}
```

### SAVE AND TRY

```
make
.\dungeon
```

**Full session test:**
1. Run the benchmark
2. Select Classic Mode
3. Play until you die — verify colorized grid, speed increase, status bar
4. Game-over screen appears — press `R` to play again
5. Select Wrap Mode — verify wrapping works
6. Quit — "Thanks for playing" appears
7. Run again — high score is preserved

---

## S-02 Mastery Review

Before starting S-03 Tetris, you should be able to explain each of these:

| Concept | Lab | Can you explain it? |
|---------|-----|---------------------|
| Why fixed arrays break for Snake | 00 | ☐ |
| Heap vs stack, `new`/`delete` | 01 | ☐ |
| Singly linked list, O(1) prepend | 01 | ☐ |
| Doubly linked list, O(1) `popTail` | 02 | ☐ |
| `std::deque`, `push_front`/`pop_back` | 03 | ☐ |
| Signed modulo trap, safe `wrap()` | 04 | ☐ |
| PRNG, `std::mt19937`, rejection sampling | 05 | ☐ |
| Hash function, collision, `unordered_set` | 06 | ☐ |
| File I/O for persistence | 07 | ☐ |
| `<chrono>`, delta time, frame timing | 08 | ☐ |
| ANSI colors, namespace | 09 | ☐ |

---

## 🎯 Final Challenge: Add a Trail Effect

**You know:** ANSI codes, the `body` deque, indexed access.

**Task:** Display the snake body with a gradient — the head is `Color::BRIGHT_GREEN`,
the first 3 body segments are `Color::GREEN`, segments 4–6 are `Color::DARK_GRAY`,
and everything beyond that is also `Color::DARK_GRAY`. This creates a visual fade
from head to tail that makes the snake feel alive.

Implement this by changing `drawGrid` to accept the body deque separately and apply
color per segment based on its distance from the head.

---

<details>
<summary>▶ Show Solution — Key Change</summary>

```cpp
// Pass the body to drawGrid so it can color by position
void drawGrid(const char grid[GRID_ROWS][GRID_COLS],
              const std::deque<Segment>& body) {

    // Build a map: (row,col) → index (distance from head)
    std::unordered_map<std::pair<int,int>, int, PairHash> distMap;
    for (int i = 0; i < static_cast<int>(body.size()); ++i) {
        distMap[{body[i].row, body[i].col}] = i;
    }

    for (int row = 0; row < GRID_ROWS; ++row) {
        for (int col = 0; col < GRID_COLS; ++col) {
            char tile = grid[row][col];
            if (tile == TILE_BODY || tile == TILE_HEAD) {
                int dist = distMap[{row, col}];
                if      (dist == 0)     std::cout << Color::BRIGHT_GREEN;
                else if (dist <= 3)     std::cout << Color::GREEN;
                else                    std::cout << Color::DARK_GRAY;
                std::cout << tile << " " << Color::RESET;
            } else {
                // wall, food, empty — same as before
                // ...
            }
        }
        std::cout << "\n";
    }
}
```

**Key insight:** `std::unordered_map<K, V>` is the hash table equivalent with
key-value pairs instead of just keys. `distMap[{row,col}] = i` stores the body index
at that position. Lookup in the render loop is O(1) — you now have a beautiful,
O(1) colorized gradient with no nested loops.

</details>

---

## Final Check — The Complete Game

| Feature | How to Verify |
|---------|--------------|
| ANSI colors compile | Bright green head, green body, red food, white walls visible |
| Namespace syntax | `Color::RED` compiles without `using namespace` |
| Session loop | `R` starts a new game; `Q` exits to goodbye message |
| Mode switch between rounds | After dying, mode select screen appears again |
| High score updated in session | Playing twice, improving score: second game-over shows correct new best |
| Win detection | (Theoretical) Filling the grid ends game with "YOU WON" screen |
| `GameResult` struct | `result.score`, `result.finalLen`, `result.elapsedSec` all correct |
| Frame timing | Status shows increasing FPS as score grows |
| Benchmark on startup | Timing table displays before game starts |

---

## What's Next: S-03 — Tetris and the 2D Grid

Snake used a 2D `char` grid for rendering but treated the game state as 1D (just
the snake's positions). Tetris forces you to think in **2D matrices** for the first time:

- A Tetris piece is a 4×4 matrix of cells
- Rotating a piece is matrix transposition + reflection
- "Does this piece fit here?" checks a 2D region of the board against piece cells
- The board itself is a 2D array that fills from top to bottom

**New concepts S-03 introduces:**
- 2D arrays and matrix operations (transposition, reflection) — linear algebra preview
- `std::vector<std::vector<T>>` — dynamic 2D arrays
- Classes with constructors — the Piece class owns its shape and rotation state
- Stack-based state machines — menu, playing, paused states
- Line clearing — the core Tetris mechanic with a compact O(n) algorithm

The key discovery: rotation of a Tetris piece is just matrix math. You will implement
`rotate90()` and see that "game mechanic" and "linear algebra operation" are the
same thing — the app is the tool to teach the concept.

---

## Quick Check Answers

**1. Data structures and optimized operations:**
- `std::deque` — O(1) `push_front` (new head) and `pop_back` (old tail), replacing
  the O(n) array shift for snake movement
- Doubly linked list — O(1) `popTail` via `prev` pointer, which motivated deque
- `std::unordered_set` — O(1) average self-collision lookup, replacing O(n) body scan
- Rejection sampling (not a data structure, but an algorithm) — O(1) expected food
  placement without scanning every cell

**2. How do ANSI codes set colors without a library?**
ANSI escape sequences are specific character patterns that the terminal interprets
as commands. `\033[92m` is the escape character (ASCII 27, `\033` in octal), followed
by `[`, then `92` (bright green foreground), then `m` (the command terminator).
When the terminal receives these characters in the output stream, it changes the
text color instead of displaying them. No external library — just `std::cout << "\033[92m"`.
The terminal's built-in ANSI interpreter does all the rendering work.

**3. Which loop for the session (play again) wrapper?**
`do-while` is logically the cleanest: you always play at least one game before asking
"again?". The condition is checked at the bottom. `while (again)` with `again = true`
also works, and many real codebases prefer it for clarity. Either is correct — the
key distinction is separating the session loop from the game loop. The game loop
handles one round; the session loop handles the relationship between rounds.
