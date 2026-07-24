# Lesson 19: Tuning the Game Without Touching Its Logic

*(Difficulty and Levels — Speed and Obstacles, Driven by Data)*

**User Story**
> As a player, I want the game to genuinely get harder the better I do —
> faster, and with real obstacles to avoid — not stay at one fixed
> difficulty forever.

**What you will build**
A small table of level definitions — score thresholds mapped to speed and
obstacle count — read by the game loop instead of a scatter of `if
(score > 50)` checks buried wherever speed or obstacles happen to be used.
Obstacles themselves are placed using Lesson 18's `Grid<T>`, reused for a
second, genuinely different purpose.

**What you need to know first**
Lesson 3's `record` and Lesson 18's `Grid<T>` — this lesson doesn't
introduce a new C# construct so much as a better way to *organize* ones
you already have.

---

## Concept Unit: A Table of Levels, Instead of Scattered Magic Numbers

### The Problem

The obvious way to make the game harder is to sprinkle checks directly
into the game loop: `if (score > 50) delay = 150; if (score > 100) delay =
100; ...` — and then, separately, wherever obstacle count is decided,
another near-identical set of checks against the same thresholds. The
thresholds `50` and `100` end up typed twice, in two unrelated places,
with nothing forcing them to agree if one is ever changed.

### Introduce the concept in isolation

```csharp
record LevelConfig(int ScoreThreshold, int TickDelayMs, int ObstacleCount);

var levels = new List<LevelConfig>
{
    new(ScoreThreshold: 0,   TickDelayMs: 200, ObstacleCount: 0),
    new(ScoreThreshold: 50,  TickDelayMs: 150, ObstacleCount: 3),
    new(ScoreThreshold: 100, TickDelayMs: 100, ObstacleCount: 6),
    new(ScoreThreshold: 200, TickDelayMs: 60,  ObstacleCount: 10),
};

LevelConfig CurrentLevel(int score)
{
    LevelConfig current = levels[0];
    foreach (var level in levels)
    {
        if (score >= level.ScoreThreshold)
            current = level;
    }
    return current;
}

foreach (var testScore in new[] { 0, 49, 50, 99, 100, 250 })
{
    var level = CurrentLevel(testScore);
    Console.WriteLine($"Score {testScore,3}: delay={level.TickDelayMs}ms, obstacles={level.ObstacleCount}");
}
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Score   0: delay=200ms, obstacles=0
Score  49: delay=200ms, obstacles=0
Score  50: delay=150ms, obstacles=3
Score  99: delay=150ms, obstacles=3
Score 100: delay=100ms, obstacles=6
Score 250: delay=60ms, obstacles=10
```

*What this proves:* every threshold (`0`, `50`, `100`, `200`) lives in
exactly one place — one row of `levels` — and both `TickDelayMs` and
`ObstacleCount` change together, at the same score, because they're read
from the same `LevelConfig` record. There's no way for "speed's threshold"
and "obstacle count's threshold" to silently drift apart, because there
was only ever one threshold to begin with.

### Mechanical walkthrough

1. `record LevelConfig(int ScoreThreshold, int TickDelayMs, int ObstacleCount)`
   — (hard concept reappearing) Lesson 3's `record`, holding three related
   numbers together as one meaningful unit, rather than three separate,
   independently-passed-around variables.
2. `new List<LevelConfig> { new(...), new(...), ... }` — (hard concept
   reappearing) Lesson 0's `List<T>`, this time holding the game's own
   *tuning data* — the actual difficulty curve is this list, in order,
   nothing more.
3. `new(ScoreThreshold: 0, TickDelayMs: 200, ObstacleCount: 0)` — named
   arguments (Lesson 0), used here specifically so each row of the table
   reads clearly without needing to remember which position means what.
4. `foreach (var level in levels) { if (score >= level.ScoreThreshold) current = level; }`
   — walks the table in order, keeping the *last* level whose threshold
   the score has reached — since `levels` is sorted ascending by
   threshold, this always lands on the correct, highest-qualifying level.

### CS Lens

This is **data-driven design**: behavior (how fast the game runs, how many
obstacles appear) is controlled by *values in a data structure*, read by
one small, generic piece of logic (`CurrentLevel`), rather than by
branching logic repeated at every point that behavior is needed. The
`levels` table can grow to twenty rows, or shrink to two, with zero
changes to `CurrentLevel` itself.

### SE Lens

This is the direct, practical reason "avoid magic numbers" is common
advice: it's not that the number `50` is inherently bad — it's that typing
`50` in two unrelated places creates a hidden, undeclared dependency
between them, invisible to the compiler and easy to forget when one is
changed later. Collecting related magic numbers into one named structure,
read from one place, removes the duplication and the hidden dependency
both at once.

### Connection

The next unit gives `ObstacleCount` something real to mean, reusing
Lesson 18's `Grid<T>` for a second, different purpose than rendering.

---

## Concept Unit: Obstacles — `Grid<T>`'s Second Job

### The Problem

`Grid<T>` was built in Lesson 18 to hold characters for rendering. A grid
of *obstacles* is a genuinely different use for the exact same class:
`Grid<bool>`, where `true` means "something is here that ends the game if
the snake hits it."

### The New Code

```csharp
var obstacles = new Grid<bool>(10, 5, false);
obstacles.Set(4, 2, true);
obstacles.Set(7, 1, true);

bool HitsObstacle(Position head) => obstacles.Get(head.X, head.Y);

var testPositions = new[] { new Position(4, 2), new Position(0, 0), new Position(7, 1) };
foreach (var pos in testPositions)
{
    Console.WriteLine($"({pos.X},{pos.Y}) obstacle? {HitsObstacle(pos)}");
}
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
(4,2) obstacle? True
(0,0) obstacle? False
(7,1) obstacle? True
```

*What this proves — the actual payoff of Lesson 18's design:* `Grid<T>`
was written once, generically, and now serves two completely unrelated
purposes — `Grid<char>` for rendering, `Grid<bool>` for obstacle
placement — with zero changes to `Grid<T>`'s own source code. This is
the same kind of reuse Lesson 15 demonstrated for `IRenderer`, now shown
for a data structure instead of an interface.

### Mechanical walkthrough

1. `new Grid<bool>(10, 5, false)` — a fresh generic instantiation of
   Lesson 18's class, this time with `T` filled in as `bool` — every cell
   starts `false` ("no obstacle here").
2. `bool HitsObstacle(Position head) => obstacles.Get(head.X, head.Y);` —
   an **expression-bodied method** (Lesson 6's syntax, applied to a free
   function here) — reads directly as "is there an obstacle at the head's
   position," delegating the actual lookup, and its bounds-checking, to
   `Grid<T>.Get`.

### CS Lens

Generic types are reusable specifically because they never assume
anything about what `T` will be used for — `Grid<T>` doesn't know or care
whether it's holding display characters or true/false obstacle flags;
that meaning lives entirely in how the calling code chooses to use it.

### Connection

`HitsObstacle`, wired into this project's existing collision check
(Lesson 4), is a third way for the game to end — alongside hitting a wall
or hitting the snake's own body — using the exact same "collision ends
the game" logic already in place.

---

## Closing

### Connect the pieces

The `LevelConfig` table (unit 1) collects every difficulty-related number
into one place, read by one small function, rather than scattering
threshold checks across the codebase. `Grid<bool>` obstacles (unit 2) are
Lesson 18's generic `Grid<T>`, reused for a second, unrelated purpose with
no changes to its own code — proof the generic design from that lesson
was genuinely general, not just convenient for one use.

### What breaks without this

Imagine the alternative actually taken: speed thresholds checked in the
game loop, obstacle thresholds checked separately wherever obstacles
spawn. Now imagine changing "level 2 starts at score 50" to "score 75" —
in the data-driven version, that's one number, in one row, in `levels`.
In the scattered version, it's every single `if (score > 50)` across the
codebase, found by searching and hoping none were missed — exactly the
bug class Lesson 14 named for global state, now shown for duplicated
literals instead.

### Exercises

- Add a fifth `LevelConfig` row for an even harder level, and confirm
  `CurrentLevel` picks it up correctly at a high enough score.
- Wire `HitsObstacle` into this project's real collision check, so
  running into an obstacle ends the game exactly like hitting a wall
  does.

### Definition of done

- [ ] `CurrentLevel` correctly returns the right level for scores at,
      just below, and just above each threshold, verified with real
      output.
- [ ] Obstacles are placed with `Grid<bool>` and correctly detected,
      verified with real output.
- [ ] You can explain, in your own words, why collecting related tuning
      numbers into one table avoids a real class of bug, not just a
      style preference.
- [ ] Commit: `git commit -m "Add data-driven difficulty levels and Grid<bool>-based obstacles"`.
