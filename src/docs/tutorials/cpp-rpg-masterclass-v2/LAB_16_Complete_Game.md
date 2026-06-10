# C++ Terminal RPG — LAB 16 — The Complete Game

**Prerequisites:** All previous labs. You have the full game system: OOP
enemies, procedural generation, animated battles, inventory, and the dungeon
map.

**What this lab adds:**
- The complete multi-floor dungeon experience (5 floors)
- A final boss on floor 5 (Ancient Dragon)
- Win condition — defeat the boss, see the victory screen
- Save score to a file and display a high score table
- Polish: death screen, score tracking, replay prompt

**Time:** 90–120 minutes

---

## What You Will Build

The complete game experience:

```
╔══════════════════════════════════════════════════════════════╗
║          ☠  DUNGEON OF DOOM — COMPLETE EDITION  ☠           ║
╚══════════════════════════════════════════════════════════════╝

  EREVAN — MAGE — LEVEL 7

  HP  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░  58/70
  MP  ▓▓▓▓▓▓▓▓░░░░░░░░  32/50

  MAP: [.][.][E][.][>]  Floor 4 (5 floors total)
       current: Crypt    Staircase ahead!

  You defeated: 12 enemies | Gold: 120 | XP: 450/500

  [N] Move North  [S] Move South  [E] Move East  [W] Move West
  [I] Inventory   [C] Character   [M] Mini-Map   [Q] Quit

─ FLOOR 5 — BOSS CHAMBER ──────────────────────────────────────

╔══════════════════════════════════════════════════════════════╗
║                  ⚔  FINAL BOSS!  ⚔                         ║
╠══════════════════════════════════════════════════════════════╣
║   ANCIENT DRAGON                                             ║
║    ~~(>ᴥ<)~~                                                ║
║    //|🔥🔥|\\                                               ║
║    |  | |  |                                                 ║
║    \__|_|__/                                                 ║
║    //  \\                                                    ║
╠══════════════════════════════════════════════════════════════╣
║  Dragon HP   ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓  40/40                      ║
║  Your HP     ▓▓▓▓▓▓▓▓▓▓░░░░░░  35/70                       ║
╠══════════════════════════════════════════════════════════════╣
║  > You cast Fireball for 18 damage!                          ║
╠══════════════════════════════════════════════════════════════╣
║  [A]ttack  [S]pell  [D]efend  [I]tem  [F]lee               ║
╚══════════════════════════════════════════════════════════════╝

─ VICTORY! ─────────────────────────────────────────────────────

╔══════════════════════════════════════════════════════════════╗
║                  ★  YOU WIN!  ★                             ║
║                                                              ║
║   EREVAN the Mage has conquered the Dungeon of Doom!        ║
║   Final Level: 7   Enemies Slain: 17   Gold: 220            ║
║   Score: 2840                                                ║
║                                                              ║
║   NEW HIGH SCORE!                                            ║
╚══════════════════════════════════════════════════════════════╝
```

---

> **Quick Check — try to answer before reading:**
> 1. What is `std::ofstream` and how do you write text to a file with it?
> 2. How would you calculate a meaningful score from game events (kills,
>    gold, level, floors cleared)?
> 3. Prediction: if you call `srand(time(nullptr))` and then immediately
>    generate 5 dungeons in a loop (all in the same second), will they be
>    different? Why or why not?
> *(Answers at the end of this lab)*

---

## Concept: File I/O — Saving the Score

**What it is:** `std::ofstream` (output file stream) writes data to a file.
`std::ifstream` (input file stream) reads data from a file. Both are in
`<fstream>`.

**The problem before:**
```cpp
// Player's high score only exists while the program is running:
int highScore = 2840;
// Close the program → score is gone
```

**The solution:**
```cpp
#include <fstream>

// Write score to file:
std::ofstream outFile("scores.txt", std::ios::app);  // app = append mode
if (outFile.is_open()) {
    outFile << playerName << " " << score << " " << level << "\n";
    outFile.close();
}

// Read scores:
std::ifstream inFile("scores.txt");
std::string name;
int scoreVal, levelVal;
while (inFile >> name >> scoreVal >> levelVal) {
    std::cout << name << ": " << scoreVal << std::endl;
}
inFile.close();
```

**What it hides:** File handle management, buffering, and OS I/O calls.
Invariant: the file is closed automatically when the stream object goes out
of scope (RAII pattern — see below). The OS file handle is always released,
even if the function exits early.

**Canonical example (General Explanation):**
Writing and reading a journal — `ofstream` is writing new pages, `ifstream`
is reading them back. `ofstream save("save.txt")` opens the journal for
writing. `save << hero.name << " " << hero.level;` writes an entry.
`ifstream load("save.txt")` opens it for reading.

```cpp
// Write a journal entry
std::ofstream journal("save.txt");
journal << "Erevan" << " " << 7 << "\n";  // name and level
// journal's destructor closes the file here (RAII)

// Read it back
std::ifstream reader("save.txt");
std::string name; int level;
reader >> name >> level;
std::cout << name << " is level " << level << std::endl;
```

**Why this example makes the mechanic obvious:** The file persists on disk
between program runs. The `<<` and `>>` operators work exactly like `cout`
and `cin` — the only difference is the destination is a file, not the
terminal.

**Project Application (The "Why" here):**
After every run (win or lose), the game writes the player's name, class,
score, and level to `dungeon_scores.txt` using append mode. On the next
startup, `displayHighScores()` reads all entries, sorts them, and shows the
top 5. Scores accumulate across sessions — the file is the persistent
leaderboard.

**Smallest possible example:**
```cpp
#include <fstream>
#include <iostream>

int main() {
    // Write
    std::ofstream out("test.txt");
    out << "Hello, file!" << std::endl;
    out.close();

    // Read back
    std::ifstream in("test.txt");
    std::string line;
    std::getline(in, line);
    std::cout << line << std::endl;  // Hello, file!
    return 0;
}
```

**Why it matters here:** Scores persist between game sessions. Players can
compete for the top score.

---

### Concept: RAII — Resource Acquisition Is Initialization

**What it is:** A C++ idiom where a resource (file, memory, mutex) is tied
to an object's lifetime — acquired in the constructor, released in the
destructor.

**What it hides:** Manual `fclose()`, `free()`, `delete` calls. Invariant:
the resource is ALWAYS released when the object goes out of scope, even if
an exception occurs. No resource leaks are possible.

**Canonical example (General Explanation):**
A hotel key card — you get it at check-in (constructor) and hand it back at
checkout (destructor). If you leave suddenly, the hotel takes it back anyway.

```cpp
{
    std::ofstream file("scores.txt");  // constructor: opens file handle
    file << playerName << " " << score;
    // destructor runs here: file handle closed automatically
}
// No file.close() needed — RAII handles it
```

**Project Application (The "Why" here):**
`saveScore()` and `displayHighScores()` rely on RAII — neither calls
`.close()` explicitly in the final version because the `ofstream`/`ifstream`
destructors close the handles when the local variable goes out of scope at
the end of the function. The file is always cleanly closed, even if the
function throws or returns early.

---

## Concept: Score Calculation — Formula Design

**What it is:** A scoring formula that rewards skilled play.

```
Score = (Enemies Killed × 10)
      + (Gold Collected × 2)
      + (Level Reached × 100)
      + (Floors Cleared × 200)
      + (HP Remaining × 5)         ← reward arriving in good health
      - (Potions Used × 15)        ← small penalty for heavy reliance on items
```

**Canonical example (General Explanation):**
A golf score in reverse — every smart decision (killing enemies without
wasting potions, arriving at the boss in good health) adds points. Every
shortcut (chugging potions to survive) costs points. The formula encodes
the designer's intent for how the game *should* be played.

```
Example run A (efficient warrior):
  20 kills × 10 = 200
  150 gold × 2  = 300
  level 5 × 100 = 500
  4 floors × 200 = 800
  40 HP left × 5 = 200
  2 potions × 15 = -30
  won bonus        = +1000
  TOTAL = 2970

Example run B (potion-heavy mage):
  12 kills × 10 = 120
  80 gold × 2   = 160
  level 4 × 100 = 400
  3 floors × 200 = 600
  10 HP left × 5 = 50
  8 potions × 15 = -120
  won bonus        = +1000
  TOTAL = 2210
```

**Why this example makes the mechanic obvious:** Two winning runs produce
different scores, rewarding the more skilled playthrough. The formula makes
every decision matter: each fight avoided costs kill points, each potion
used costs 15 points.

**Project Application (The "Why" here):**
`calculateScore()` uses this exact formula. The `RunStats` struct tracks
all the required inputs throughout the run. The score is only finalized at
game end (win or death) when `stats.finalHP` is set.

**Why it matters here:** A good score formula makes the game replayable.
Players experiment with different strategies (fight everything vs. stealth,
warrior vs. mage) to maximize their score.

---

### Math: Exponential Level Scaling

**What it computes:** XP required grows faster at higher levels, making
early leveling fast and later leveling slower.

**The real-world analogy:** Learning a skill — going from 0% to 10%
competence is easy; going from 90% to 100% takes much more practice.

**Formula:** `xpToNext = currentLevel * currentLevel * 100`
```
Level 1 → 100 XP needed
Level 2 → 400 XP needed
Level 3 → 900 XP needed
Level 5 → 2500 XP needed
```

**Why it matters here:** Early floors give enough XP to level up quickly;
later floors require more grinding. This paces the player's power growth
across the 5 floors so they don't arrive at the boss either massively
over-leveled or dramatically under-powered.

**Watch for:** Quadratic scaling can make high levels feel grindy. Linear
(`level * 200`) is simpler; exponential (`100 * 2^level`) makes late game
very long. The quadratic formula is a common middle ground in RPGs.

---

## Step 1 — Score Tracking Struct

Add to the game:

```cpp
// ── Run statistics ────────────────────────────────────────────
struct RunStats {
    int enemiesSlain;
    int goldCollected;
    int potionsUsed;
    int floorsCleared;
    int finalLevel;
    int finalHP;
    int finalMaxHP;
    bool won;     // true if the boss was defeated
};

// ── Calculate final score ─────────────────────────────────────
int calculateScore(const RunStats& stats) {
    int score = 0;
    score += stats.enemiesSlain   * 10;
    score += stats.goldCollected  *  2;
    score += stats.finalLevel     * 100;
    score += stats.floorsCleared  * 200;
    score += stats.finalHP        *  5;
    score -= stats.potionsUsed    * 15;
    if (stats.won) score += 1000;  // bonus for completing the game
    return (score < 0) ? 0 : score;
}
```

Add a `RunStats stats` variable to `main()` and initialize all fields to 0.
Increment the appropriate fields as events happen:
- `stats.enemiesSlain++` when an enemy dies in `awardVictoryRewards`
- `stats.goldCollected += enemy.goldReward` in the same function
- `stats.potionsUsed++` in `useItem` when a health/mana potion is used
- `stats.floorsCleared++` when the player steps through a staircase

---

## Step 2 — The Victory and Death Screens

Add:

```cpp
// ── Victory screen ────────────────────────────────────────────
void showVictoryScreen(const Character& hero, const RunStats& stats) {
    clearScreen();
    int score = calculateScore(stats);

    std::cout << std::endl;
    std::cout << COLOR_YELLOW;
    std::cout << "╔══════════════════════════════════════════════════════════╗" << std::endl;
    std::cout << "║                    ★  YOU WIN!  ★                       ║" << std::endl;
    std::cout << "╠══════════════════════════════════════════════════════════╣" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║   " << hero.name << " the " << getClassName(hero.characterClass)
              << " has conquered the Dungeon of Doom!" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║   Final Level:    " << hero.level                           << std::endl;
    std::cout << "║   Enemies Slain:  " << stats.enemiesSlain                   << std::endl;
    std::cout << "║   Gold Collected: " << stats.goldCollected                  << std::endl;
    std::cout << "║   Floors Cleared: " << stats.floorsCleared                  << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║   FINAL SCORE:  " << score                                  << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "╚══════════════════════════════════════════════════════════╝" << std::endl;
    std::cout << COLOR_RESET << std::endl;

    // Check high score
    saveScore(hero.name, getClassName(hero.characterClass), score, hero.level);
}

// ── Death screen ──────────────────────────────────────────────
void showDeathScreen(const Character& hero, const RunStats& stats) {
    clearScreen();
    int score = calculateScore(stats);

    std::cout << std::endl;
    std::cout << COLOR_RED;
    std::cout << "╔══════════════════════════════════════════════════════════╗" << std::endl;
    std::cout << "║                    ☠  GAME OVER  ☠                      ║" << std::endl;
    std::cout << "╠══════════════════════════════════════════════════════════╣" << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║   " << hero.name << " has fallen in the dungeon depths."  << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║   Reached Level:  " << hero.level                          << std::endl;
    std::cout << "║   Enemies Slain:  " << stats.enemiesSlain                  << std::endl;
    std::cout << "║   Floors Reached: " << stats.floorsCleared + 1             << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "║   SCORE:  " << score                                        << std::endl;
    std::cout << "║                                                          ║" << std::endl;
    std::cout << "╚══════════════════════════════════════════════════════════╝" << std::endl;
    std::cout << COLOR_RESET << std::endl;

    saveScore(hero.name, getClassName(hero.characterClass), score, hero.level);
}
```

---

## Step 3 — File-Based High Scores

Add:

```cpp
#include <fstream>
#include <sstream>
#include <algorithm>

const std::string SCORES_FILE = "dungeon_scores.txt";

// ── Save a score entry ────────────────────────────────────────
void saveScore(const std::string& name, const std::string& cls,
               int score, int level) {
    std::ofstream file(SCORES_FILE, std::ios::app);  // append mode
    if (file.is_open()) {
        file << name << " " << cls << " " << score << " " << level << "\n";
        file.close();
    }
}

// ── Load and display top 5 scores ────────────────────────────
void displayHighScores() {
    std::ifstream file(SCORES_FILE);

    // Collect all scores
    struct ScoreEntry { std::string name, cls; int score, level; };
    std::vector<ScoreEntry> entries;

    if (file.is_open()) {
        std::string name, cls;
        int score, level;
        while (file >> name >> cls >> score >> level) {
            entries.push_back({name, cls, score, level});
        }
        file.close();
    }

    // Sort by score descending
    std::sort(entries.begin(), entries.end(),
              [](const ScoreEntry& a, const ScoreEntry& b) {
                  return a.score > b.score;
              });

    std::cout << std::endl;
    std::cout << "  ─────────────────────────────────────" << std::endl;
    std::cout << "  " << COLOR_YELLOW << "HIGH SCORES" << COLOR_RESET << std::endl;
    std::cout << "  ─────────────────────────────────────" << std::endl;

    const int TOP_N = 5;
    for (int i = 0; i < std::min(TOP_N, static_cast<int>(entries.size())); i++) {
        const ScoreEntry& e = entries[i];
        std::cout << "  " << (i + 1) << ". " << e.name
                  << " (" << e.cls << ") — Level " << e.level
                  << " — Score: " << COLOR_YELLOW << e.score << COLOR_RESET << std::endl;
    }

    if (entries.empty()) {
        std::cout << "  (No scores yet — be the first!)" << std::endl;
    }
    std::cout << "  ─────────────────────────────────────" << std::endl;
}
```

---

## Step 4 — The Win Condition: 5 Floors and the Dragon

Add to main loop, in the staircase transition:

```cpp
} else if (newTile == TILE_STAIRS) {
    stats.floorsCleared++;
    currentFloor++;

    if (currentFloor > MAX_FLOORS) {
        // No more floors — boss was on floor 5 — game is won
        stats.won = true;
        showVictoryScreen(hero, stats);
        displayHighScores();
        isRunning = false;
    } else {
        dungeon          = generateFloor(currentFloor);
        currentRoomIndex = 0;
        hero.position    = {ROOM_ROWS / 2, ROOM_COLS / 2};

        clearScreen();
        std::cout << COLOR_CYAN << "  You descend to Floor "
                  << currentFloor << " of " << MAX_FLOORS << "!" << COLOR_RESET << std::endl;
        std::this_thread::sleep_for(std::chrono::milliseconds(1500));
    }
}
```

Add this constant at the top:
```cpp
const int MAX_FLOORS = 5;  // player wins after clearing floor 5's boss
```

Handle boss room specifically in the enemy encounter code:

```cpp
if (currentDungeonRoom.type == RoomType::BossRoom && currentFloor == MAX_FLOORS) {
    // Final boss — Ancient Dragon
    Enemy boss = Enemy::makeDragon();
    // ... run battle
    if (result == BattleResult::HeroWon) {
        stats.won = true;
        awardVictoryRewards(hero, boss);
        showVictoryScreen(hero, stats);
        displayHighScores();
        isRunning = false;
    }
}
```

---

## Step 5 — The Complete `main()` Game Loop

Here is the final complete `main()` bringing everything together:

```cpp
int main() {
    srand(static_cast<unsigned int>(time(nullptr)));

    // ── Title Screen ──────────────────────────────────────────
    clearScreen();
    std::cout << COLOR_RED;
    std::cout << "╔══════════════════════════════════════════════╗" << std::endl;
    std::cout << "║   ██████╗ ██╗   ██╗███╗  ██╗ ██████╗ ███████╗║" << std::endl;
    std::cout << "║   ██╔══██╗██║   ██║████╗ ██║██╔════╝ ██╔════╝║" << std::endl;
    std::cout << "║   ██║  ██║██║   ██║██╔██╗██║██║  ███╗█████╗  ║" << std::endl;
    std::cout << "║   ██║  ██║██║   ██║██║╚████║██║   ██║██╔══╝  ║" << std::endl;
    std::cout << "║   ██████╔╝╚██████╔╝██║ ╚███║╚██████╔╝███████╗║" << std::endl;
    std::cout << "║   ╚═════╝  ╚═════╝ ╚═╝  ╚══╝ ╚═════╝ ╚══════╝║" << std::endl;
    std::cout << "║                                              ║" << std::endl;
    std::cout << "║            of   D O O M                     ║" << std::endl;
    std::cout << "╚══════════════════════════════════════════════╝" << std::endl;
    std::cout << COLOR_RESET << std::endl;

    displayHighScores();

    std::cout << "  Press ENTER to begin..." << std::endl;
    std::cin.get();

    // ── Character Creation ────────────────────────────────────
    Character hero  = createCharacter();
    RunStats  stats = {0, 0, 0, 0, 1, hero.hp, hero.maxHP, false};

    // ── Generate First Floor ──────────────────────────────────
    int          currentFloor    = 1;
    DungeonFloor dungeon          = generateFloor(currentFloor);
    int          currentRoomIdx  = 0;

    hero.position = {ROOM_ROWS / 2, ROOM_COLS / 2};

    // ── Main Game Loop ────────────────────────────────────────
    bool isRunning = true;

    while (isRunning && hero.alive) {
        DungeonRoom& dRoom = dungeon.rooms[currentRoomIdx];
        Room&        room  = dRoom.roomData;

        clearScreen();

        // ── HUD ───────────────────────────────────────────────
        std::cout << COLOR_RED << "  DUNGEON OF DOOM" << COLOR_RESET
                  << " — Floor " << currentFloor << "/" << MAX_FLOORS
                  << " — Room: " << room.name << std::endl;
        std::cout << "  " << COLOR_YELLOW << hero.name << COLOR_RESET
                  << " — " << getClassName(hero.characterClass)
                  << " — Level " << hero.level << std::endl;
        printHPBar(hero.hp, hero.maxHP);
        printMPBar(hero.mp, hero.maxMP);
        std::cout << "  Gold: " << COLOR_YELLOW << hero.gold << COLOR_RESET
                  << "   XP: " << hero.xp << "/" << hero.xpToNext
                  << "   Kills: " << stats.enemiesSlain << std::endl;

        displayMiniMap(dungeon, currentRoomIdx);

        // ── Room ──────────────────────────────────────────────
        drawRoom(room, hero.position);
        std::cout << "  " << dRoom.entryFlavor << std::endl;

        // ── Command Menu ──────────────────────────────────────
        std::cout << std::endl;
        std::cout << "  [W/A/S/D] Move  [I]nv  [C]har  [H]eal  [Q]uit" << std::endl;
        std::cout << "  > ";

        char cmd;
        std::cin >> cmd;

        if (cmd == 'q' || cmd == 'Q') {
            isRunning = false;

        } else if (cmd == 'c' || cmd == 'C') {
            displayCharacterSheet(hero);
            std::cin.ignore(); std::cin.get();

        } else if (cmd == 'i' || cmd == 'I') {
            displayInventory(hero);
            // (handle sub-commands)
            char invCmd; std::cin >> invCmd;
            if (invCmd == 'u' || invCmd == 'U') {
                std::cout << "Use slot #: "; int slot; std::cin >> slot;
                useItem(hero, slot);
            } else if (invCmd == 'd' || invCmd == 'D') {
                std::cout << "Drop slot #: "; int slot; std::cin >> slot;
                dropItem(hero, slot);
            }

        } else if (cmd == 'h' || cmd == 'H') {
            const int HEAL_COST = 10, HEAL_AMT = 5;
            if (hero.gold < HEAL_COST) std::cout << "  Not enough gold." << std::endl;
            else if (hero.hp >= hero.maxHP) std::cout << "  Already at full HP." << std::endl;
            else {
                hero.gold -= HEAL_COST;
                hero.hp   += HEAL_AMT;
                if (hero.hp > hero.maxHP) hero.hp = hero.maxHP;
                stats.potionsUsed++;
                std::cout << "  +" << HEAL_AMT << " HP. Gold: " << hero.gold << std::endl;
            }

        } else if (cmd == 'w' || cmd == 'W' ||
                   cmd == 's' || cmd == 'S' ||
                   cmd == 'a' || cmd == 'A' ||
                   cmd == 'd' || cmd == 'D') {

            bool moved = movePlayer(room, hero.position, cmd);

            if (moved) {
                int tile = room.grid[hero.position.row][hero.position.col];

                // ── Chest ─────────────────────────────────────
                if (tile == TILE_CHEST && !dRoom.lootTable.empty()) {
                    Item loot = rollLootTable(dRoom.lootTable);
                    if (loot.name != "Nothing") {
                        addToInventory(hero, loot);
                        stats.goldCollected += loot.value / 2;  // finding items counts as gold-equivalent
                    } else {
                        std::cout << "  The chest is empty." << std::endl;
                    }
                    room.grid[hero.position.row][hero.position.col] = TILE_FLOOR;
                    dRoom.lootTable.clear();  // chest looted
                    std::cin.ignore(); std::cin.get();
                }

                // ── Enemy encounter ───────────────────────────
                else if (tile == TILE_ENEMY && dRoom.hasEnemy) {
                    Enemy foe = selectEnemyForRoom(dRoom.type, currentFloor);
                    bool fight = showEncounter(foe);

                    if (fight) {
                        BattleResult result = runBattle(hero, foe);
                        if (result == BattleResult::HeroWon) {
                            awardVictoryRewards(hero, foe);
                            stats.enemiesSlain++;
                            stats.goldCollected += foe.getGoldReward();
                            room.grid[hero.position.row][hero.position.col] = TILE_FLOOR;
                            dRoom.hasEnemy  = false;
                            dRoom.isCleared = true;

                            // Check win condition: boss on final floor
                            if (dRoom.type == RoomType::BossRoom && currentFloor == MAX_FLOORS) {
                                stats.won = true;
                                stats.finalLevel = hero.level;
                                stats.finalHP    = hero.hp;
                                showVictoryScreen(hero, stats);
                                displayHighScores();
                                isRunning = false;
                            }
                        } else if (result == BattleResult::HeroLost) {
                            hero.alive = false;
                        }
                        // HeroFled: step back, enemy still in room
                    }
                }

                // ── Stairs ────────────────────────────────────
                else if (tile == TILE_STAIRS) {
                    stats.floorsCleared++;
                    currentFloor++;
                    if (currentFloor > MAX_FLOORS) {
                        // All floors cleared — game won (boss was defeated already)
                        if (!stats.won) {
                            stats.won = true;
                            showVictoryScreen(hero, stats);
                            displayHighScores();
                            isRunning = false;
                        }
                    } else {
                        dungeon         = generateFloor(currentFloor);
                        currentRoomIdx  = 0;
                        hero.position   = {ROOM_ROWS / 2, ROOM_COLS / 2};
                        clearScreen();
                        std::cout << COLOR_CYAN << "  FLOOR " << currentFloor
                                  << " — descending deeper..." << COLOR_RESET << std::endl;
                        std::this_thread::sleep_for(std::chrono::milliseconds(1500));
                    }
                }

                // ── Room transition (door tiles) ──────────────
                else if (tile == TILE_DOOR_E && dungeon.eastConnections.count(currentRoomIdx)) {
                    currentRoomIdx = dungeon.eastConnections[currentRoomIdx];
                    hero.position  = {ROOM_ROWS / 2, 1};
                } else if (tile == TILE_DOOR_W && dungeon.westConnections.count(currentRoomIdx)) {
                    currentRoomIdx = dungeon.westConnections[currentRoomIdx];
                    hero.position  = {ROOM_ROWS / 2, ROOM_COLS - 2};
                } else if (tile == TILE_DOOR_N && dungeon.northConnections.count(currentRoomIdx)) {
                    currentRoomIdx = dungeon.northConnections[currentRoomIdx];
                    hero.position  = {ROOM_ROWS - 2, ROOM_COLS / 2};
                } else if (tile == TILE_DOOR_S && dungeon.southConnections.count(currentRoomIdx)) {
                    currentRoomIdx = dungeon.southConnections[currentRoomIdx];
                    hero.position  = {1, ROOM_COLS / 2};
                }
            }
        }
    }  // end while (isRunning && hero.alive)

    // ── Game over by death ────────────────────────────────────
    if (!hero.alive) {
        stats.finalLevel = hero.level;
        stats.finalHP    = 0;
        showDeathScreen(hero, stats);
        displayHighScores();
    }

    // ── Replay prompt ─────────────────────────────────────────
    std::cout << std::endl;
    std::cout << "  Play again? (y/n): ";
    char replay; std::cin >> replay;
    if (replay == 'y' || replay == 'Y') {
        return main();  // restart (simple replay — Lab 16 extra credit)
    }

    std::cout << "  Thanks for playing! Farewell, adventurer." << std::endl;
    return 0;
}
```

### SAVE AND TRY

Compile and run:
```bash
g++ -std=c++17 -o dungeon main.cpp entity.cpp enemy.cpp
./dungeon
```

**Play a full run:**
1. Create your character
2. Navigate through all 5 floors
3. Find the boss on floor 5
4. Win or die — see the appropriate screen
5. Check `dungeon_scores.txt` in the folder for your saved score

**Watch for:**
- Different rooms each run (procedural generation)
- Enemy difficulty scaling by floor
- Random loot from chests
- Level ups as XP accumulates

**Change something:** Change `MAX_FLOORS` from `5` to `2` for a quick
playtest. You can clear the whole game in 5 minutes. Change back for the
full experience.

---

## Challenge: A Shop Room

**You know:** Inventory, gold, loot tables, new room types.

**Task:** Add a `ShopRoom` room type. Inside the shop, there are 3 random
items for sale. The player can buy items with gold. Add a `[B]uy` command
that only works in shop rooms.

Design the shop:
- Show 3 items with prices
- Allow purchase: `hero.gold -= item.value`, `addToInventory(hero, item)`
- Reject if insufficient gold
- Item purchased is removed from the shop (cannot buy twice)

---

<details>
<summary>▶ Show Solution</summary>

```cpp
// Add to RoomType enum:
// ShopRoom,  // ← add this

struct ShopState {
    std::vector<Item> items;
    bool isOpen;
};

// In getRoomPool, add one ShopRoom on floors 2+
// if (floor >= 2) pool.push_back(RoomType::ShopRoom);  // ← add this

void displayShop(const ShopState& shop, int playerGold) {
    std::cout << std::endl;
    std::cout << "  ╔═══════════════════════════════════════╗" << std::endl;
    std::cout << "  ║   🏪  DUNGEON MERCHANT                ║" << std::endl;
    std::cout << "  ╠═══════════════════════════════════════╣" << std::endl;
    std::cout << "  ║   Your gold: " << playerGold << std::endl;
    std::cout << "  ╠═══════════════════════════════════════╣" << std::endl;
    for (int i = 0; i < static_cast<int>(shop.items.size()); i++) {
        const Item& item = shop.items[i];
        std::cout << "  ║   [" << i << "] " << item.name
                  << " — " << item.description
                  << " — " << COLOR_YELLOW << item.value << "g" << COLOR_RESET << std::endl;
    }
    std::cout << "  ╚═══════════════════════════════════════╝" << std::endl;
    std::cout << "  Buy [0/1/2] or [B]ack: ";
}

// In the main loop, add:
} else if (cmd == 'b' || cmd == 'B') {
    if (dRoom.type != RoomType::ShopRoom) {
        std::cout << "  There is nothing to buy here." << std::endl;
    } else {
        ShopState shop;
        shop.items = {makeHealthPotion(), makeLeatherArmor(), makeManaPotion()};
        displayShop(shop, hero.gold);
        char choice; std::cin >> choice;
        int idx = choice - '0';  // '0'→0, '1'→1, '2'→2
        if (idx >= 0 && idx < static_cast<int>(shop.items.size())) {
            Item& item = shop.items[idx];
            if (hero.gold < item.value) {
                std::cout << "  Not enough gold." << std::endl;
            } else {
                hero.gold -= item.value;
                addToInventory(hero, item);
                std::cout << "  Purchased: " << item.name << std::endl;
            }
        }
    }
```

**Key insight:** The shop is a mini-loop within the room interaction — it
shows a menu, processes a single purchase, then returns to the main game.
The shop's item list is a `vector` that could have items removed on purchase
for a more sophisticated system. The `char - '0'` trick converts a digit
character to its integer value: `'2' - '0' = 2`.

</details>

---

## Challenge: Poison Status Effect

**You know:** Battle system, `BattleState`, per-turn effects.

**Task:** Add a `isPoison` boolean to `Character`. When poisoned:
- Take 2 damage at the start of each combat round
- Show `"Poison burns through you! -2 HP"` in the combat log
- The poison cures itself after 3 rounds OR when the battle ends

Skeletons and certain enemies in the Crypt room type have a 30% chance
to inflict poison on a successful hit.

---

<details>
<summary>▶ Show Solution</summary>

Add to `Character` struct:
```cpp
bool isPoison;
int  poisonRoundsLeft;
```

Add to `BattleState`:
```cpp
int poisonRoundsLeft;  // copy from hero at battle start
```

At the start of each round in `runBattle`:
```cpp
if (hero.isPoison && state.poisonRoundsLeft > 0) {
    hero.hp -= 2;
    if (hero.hp < 0) hero.hp = 0;
    state.poisonRoundsLeft--;
    logMessage(COLOR_GREEN + "Poison" + COLOR_RESET + " deals 2 damage! (" +
               std::to_string(state.poisonRoundsLeft) + " rounds left)");
    if (state.poisonRoundsLeft <= 0) {
        hero.isPoison = false;
        logMessage("The poison fades.");
    }
}
```

In Skeleton's `rollAttack` (or after a successful hit by a skeleton):
```cpp
if (!hero.isPoison && rand() % 100 < 30) {
    hero.isPoison = true;
    state.poisonRoundsLeft = 3;
    logMessage(COLOR_GREEN + "You are POISONED!" + COLOR_RESET);
}
```

**Key insight:** Status effects are flags + counters on the character (or a
`std::vector<StatusEffect>` for multiple effects). The effect is applied
at a well-defined moment in the round (start/end of your turn), and it
expires when its counter reaches zero. This is the exact same design used
in all RPGs: D&D, Final Fantasy, and every dungeon crawler. The complexity
comes from tracking multiple simultaneous effects — a `vector` of structs
with a name, power, and duration handles that cleanly.

</details>

---

## Final Check

| Feature | How to verify |
|---------|--------------|
| Game starts with title screen | Run — see ASCII art title |
| High scores show at start | See score table (empty on first run) |
| 5 floors generate | Play through all 5 — see floor counter |
| Boss appears on floor 5 | Reach floor 5, enter boss room — see Dragon |
| Win screen appears after defeating boss | Defeat Dragon — see victory screen |
| Death screen appears if killed | Die in combat — see game over screen |
| Score saved to file | Win/lose — check `dungeon_scores.txt` in folder |
| High score table sorts correctly | Play twice with different scores — see sorted list |
| Replay prompt works | At game end, type `y` — game restarts |
| Procedural generation varies each run | Play 3 times — different room layouts each time |

---

## Quick Check Answers

**1. What is `std::ofstream` and how do you write text to a file?**
`ofstream` (output file stream) opens a file for writing. Constructing it
with a filename and `std::ios::app` opens in append mode (adds to the end
without overwriting). You write to it exactly like `cout`: `file << "text"`.
Always call `file.close()` when done, or let it go out of scope (RAII —
the destructor closes it automatically). If the file cannot be opened,
`file.is_open()` returns false — always check this before writing.

**2. How would you calculate a meaningful score from game events?**
A good score formula rewards core game behaviors and penalizes shortcuts.
Example: `(kills × 10) + (gold × 2) + (level × 100) + (floors × 200) + (remaining HP × 5) - (potions used × 15) + (1000 if won)`.
The HP-remaining bonus rewards arriving at the final boss in good shape.
The potion penalty discourages overuse of healing as a crutch. The floor
multiplier rewards exploration. These weights are game design decisions —
balance them by playtesting and observing which strategies feel too optimal.

**3. `srand(time(nullptr))` then generate 5 dungeons in a loop — all different?**
No — `time(nullptr)` returns seconds precision. If all 5 dungeons are
generated within the same second, `srand()` is called with the same value
each time, resetting the RNG to the same state. Each dungeon would be
identical. The fix: call `srand()` ONCE before the loop, not before each
generation. The RNG then continues its sequence across all 5 generations,
giving different dungeons. This is why the spec says: "Call `srand()` exactly
ONCE at the start of `main()`."

---

## What You've Built — The Complete Feature List

Congratulations. Your game now implements:

| Feature | Lab |
|---------|-----|
| Terminal I/O, compilation, `cout`/`cin` | 01 |
| Variables, types, `const`, character sheet | 02 |
| Conditionals, `if`/`else`, logical operators | 03 |
| Game loop, `while`/`for`, `break` | 04 |
| Functions, return values, dice rolling (d4–d20) | 05 |
| Structs, `Character`, `Enemy` factory functions | 06 |
| `enum class`, `switch`, 6 character classes | 07 |
| ANSI colors, HP bars, `clearScreen()` | 08 |
| `std::vector`, inventory, use/drop/equip | 09 |
| 2D arrays, room grid, movement, collision | 10 |
| ASCII art arrays, 3-frame animation, encounters | 11 |
| Turn-based combat, hit rolls, crits, leveling | 12 |
| Animated battle window, `deque` combat log | 13 |
| OOP: `class`, inheritance, `virtual`, multi-file | 14 |
| `std::map`, procedural dungeon generation, loot tables | 15 |
| File I/O, score system, complete 5-floor game | 16 |

**C++ concepts mastered:**
`iostream`, `string`, `vector`, `map`, `deque`, `fstream`, structs, classes,
inheritance, virtual functions, enums, arrays, loops, functions, lambdas,
ANSI escape codes, random numbers, file I/O, and the full build system.

**You are ready for:**
- Adding network play (sockets)
- Porting to a graphical library (SDL2, SFML)
- Writing a proper save/load system
- Adding procedural story generation with text templates
- Performance optimization for large dungeon maps
