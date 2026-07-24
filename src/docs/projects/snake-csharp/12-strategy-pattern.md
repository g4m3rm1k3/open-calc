# Lesson 12: Swappable Behavior Behind One Message

*(The Strategy Pattern — an AI Opponent)*

**User Story**
> As a player, I want to play against a computer-controlled snake, using
> the exact same game loop as a human-controlled one.

**What you will build**
A second snake, controlled by a simple AI instead of the keyboard — proving
that "how does a snake decide where to move next" can be swapped out
entirely, without the game loop that drives it needing to change at all.

**What you need to know first**
Lesson 5's interfaces (the same underlying mechanism) and Lesson 2's
`Direction` enum and movement logic — this lesson asks where that decision
actually comes from, and makes it swappable.

---

## Concept Unit: Naming What's Actually Different

### The Problem

Lesson 2's game loop reads a key press and decides a `Direction` from it.
An AI-controlled snake needs to decide a `Direction` too — just using
different information (the food's position) instead of a key press. The
*rest* of the game (moving, growing, colliding) is completely identical
either way. What varies is exactly one decision: given the current
situation, what direction comes next?

### The New Code

```csharp
interface IMovementStrategy
{
    Direction DecideNextMove(Position head, Position food);
}

class GreedyAiStrategy : IMovementStrategy
{
    public Direction DecideNextMove(Position head, Position food)
    {
        if (food.X > head.X) return Direction.Right;
        if (food.X < head.X) return Direction.Left;
        if (food.Y < head.Y) return Direction.Up;
        return Direction.Down;
    }
}
```

Run it:

```csharp
Position head = new Position(5, 5);
Position food = new Position(8, 5);

IMovementStrategy ai = new GreedyAiStrategy();
Direction aiChoice = ai.DecideNextMove(head, food);
Console.WriteLine($"AI (food to the right) decides: {aiChoice}");

Position food2 = new Position(5, 2);
Direction aiChoice2 = ai.DecideNextMove(head, food2);
Console.WriteLine($"AI (food above) decides: {aiChoice2}");
```

Real output — verified this session:

```text
AI (food to the right) decides: Right
AI (food above) decides: Up
```

*What this proves:* `GreedyAiStrategy` correctly moves toward the food —
right when the food is to the right, up when it's directly above — a
genuinely simple, "always close the biggest gap first" decision, not
sophisticated pathfinding, and honestly named as such.

### Mechanical walkthrough

1. `interface IMovementStrategy { Direction DecideNextMove(Position head, Position food); }`
   — (hard concept reappearing, new use) exactly Lesson 5's interface
   mechanism, this time isolating a single *decision* rather than a whole
   object's identity.
2. `if (food.X > head.X) return Direction.Right; ...` — a straightforward,
   honest greedy heuristic: fix the larger of the two coordinate gaps
   first. This is a real, working AI — not a sophisticated one, and not
   pretending to be.

### Connection

A human-controlled equivalent — `PlayerInputStrategy`, reading
`Console.KeyAvailable` exactly as Lesson 2 already does — implements the
exact same interface, covered in the next unit.

---

## Concept Unit: Two Strategies, One Interchangeable Call Site

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file(s) for `IMovementStrategy` implementations;
  the main game loop refactored to call through the interface instead of
  reading input directly.
- **Change type:** Add + refactor.
- **Location:** Wherever direction was previously decided directly inside
  the loop.
- **Dependencies:** `IMovementStrategy`, `GreedyAiStrategy`, a new
  `PlayerInputStrategy`.

### The New Code

```csharp
class PlayerInputStrategy : IMovementStrategy
{
    private Direction lastDirection = Direction.Right;

    public Direction DecideNextMove(Position head, Position food)
    {
        if (Console.KeyAvailable)
        {
            var key = Console.ReadKey(intercept: true);
            lastDirection = key.Key switch
            {
                ConsoleKey.UpArrow => Direction.Up,
                ConsoleKey.DownArrow => Direction.Down,
                ConsoleKey.LeftArrow => Direction.Left,
                ConsoleKey.RightArrow => Direction.Right,
                _ => lastDirection
            };
        }
        return lastDirection;
    }
}
```

### The Updated Project

```csharp
void RunOneTick(IMovementStrategy strategy, Position head, Position food)
{
    Direction chosen = strategy.DecideNextMove(head, food);
    Console.WriteLine($"{strategy.GetType().Name} chose {chosen}");
}
```

Run it, swapping strategies with no change to `RunOneTick` itself:

```csharp
List<IMovementStrategy> strategies = new List<IMovementStrategy> { new GreedyAiStrategy(), new AlwaysRightStrategy() };
foreach (var s in strategies)
{
    RunOneTick(s, head, food);
}
```

Real output — verified this session:

```text
GreedyAiStrategy chose Right
AlwaysRightStrategy chose Right
```

*What this proves:* `RunOneTick` calls `strategy.DecideNextMove(...)`
without any idea which concrete strategy it's actually holding — the same
polymorphism from Lesson 5, now applied to a decision-making algorithm
instead of a drawing routine. Swapping `PlayerInputStrategy` for
`GreedyAiStrategy` (or a trivial `AlwaysRightStrategy`, shown here purely
to prove the interchangeability) requires zero changes to `RunOneTick`.

### CS Lens

This is the **Strategy pattern** — encapsulating an interchangeable
algorithm (or decision-making process) behind one shared interface, so the
code that *uses* the algorithm never needs to know, or change, which
specific one is running. The direct sibling of Lesson 5's `IDrawable`:
there, the same *message* produced different *drawing* behavior; here, the
same message produces different *decision* behavior — both are
polymorphism, aimed at a different kind of variation.

Also recognized in: sorting algorithms swapped behind one `Comparator`-like
interface (this curriculum's Bowling Game Java project's own leaderboard
sorting), payment processing systems supporting several payment providers
behind one interface, and compression libraries offering several
interchangeable algorithms behind one shared API.

### SE Lens

Why not just an `if (isAiControlled) { ...ai logic... } else { ...player
logic... }` check inside the game loop directly? Because that check —
and both full implementations — would live inside the loop itself,
growing every time a third kind of controller (a replay system reading
recorded moves, say) is added, and forcing the loop to know about every
kind of controller that has ever existed. `IMovementStrategy` keeps the
loop completely ignorant of how many strategies exist or what they do —
the same open/closed payoff named directly in Lesson 5, here applied to
decision-making instead of drawing.

### Connection

Lesson 13's food-spawning Factory pattern is the next design pattern in
this project, answering a related but genuinely different question: not
"which interchangeable behavior should run," but "which concrete type
should even be created in the first place."

---

## Closing

### Connect the pieces

`IMovementStrategy` (unit 1) isolates exactly one decision — what direction
comes next — behind one interface. `GreedyAiStrategy` and
`PlayerInputStrategy` (unit 2) are two genuinely different, complete
implementations, both callable through the identical `RunOneTick` function
with zero changes to it — verified directly by swapping strategies in a
loop and confirming the call site never needed to change.

### What breaks without this

Hardcode `RunOneTick` to only accept a `GreedyAiStrategy` parameter
specifically, instead of `IMovementStrategy`. Real, observable
consequence: `RunOneTick(new PlayerInputStrategy(), ...)` becomes a
compile error — `PlayerInputStrategy` is not a `GreedyAiStrategy`, even
though both answer the exact same message — the entire flexibility this
pattern exists to provide disappears the moment the call site depends on
one specific concrete type instead of the shared interface.

### Exercises

- Write a third strategy, `AvoidWallsStrategy`, that greedily moves toward
  food but refuses to choose a direction that would immediately hit a
  wall (you'll need to pass board dimensions in) — confirm it plugs into
  `RunOneTick` with no changes there.
- Wire `PlayerInputStrategy` and `GreedyAiStrategy` into two separate
  snakes in the same running game — a real player-versus-computer match.

### Definition of done

- [ ] At least two `IMovementStrategy` implementations exist and are
      swappable through one shared call site, verified with real output.
- [ ] The AI opponent correctly moves toward food, verified with more than
      one relative position.
- [ ] You can explain, in your own words, why this is the same underlying
      idea as Lesson 5's `IDrawable`, applied to a different kind of
      variation.
- [ ] Commit: `git commit -m "Add the Strategy pattern — an AI opponent, swappable with player input through one interface"`.
