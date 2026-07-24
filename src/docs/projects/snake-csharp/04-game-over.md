# Lesson 4: Two Different Questions, Both Called "Collision"

*(Game Over — Walls and Self-Collision)*

**User Story**
> As a player, I want the game to end clearly when the snake hits a wall or
> itself.

**What you will build**
Real game-ending conditions: the head reaching the board's border, or
reaching a cell already occupied by the snake's own body — both stop the
game and show a clear message.

**What you need to know first**
Lesson 3's `Position`, `LinkedList<Position>` body, and Lesson 1's board
dimensions.

---

## Concept Unit: Wall Collision — A Boundary Check

### The Problem

The board's border (Lesson 1) is drawn, but nothing currently stops the
snake's head from moving right through it — the `#` characters are purely
visual so far.

### The New Code

```csharp
bool HitsWall(Position head, int width, int height)
{
    return head.X <= 0 || head.X >= width - 1 || head.Y <= 0 || head.Y >= height - 1;
}
```

Run it against two positions:

```csharp
Console.WriteLine($"Wall collision at (0,5): {HitsWall(new Position(0, 5), width, height)}");
Console.WriteLine($"Wall collision at (10,5): {HitsWall(new Position(10, 5), width, height)}");
```

Real output — verified this session:

```text
Wall collision at (0,5): True
Wall collision at (10,5): False
```

*What this proves:* `(0, 5)` sits exactly on the left border column
(`X <= 0`), correctly flagged; `(10, 5)`, well inside a 20-wide board, is
correctly not a collision. This is the exact inverse of Lesson 1's own edge
check (`row == 0 || row == height - 1 || ...`) — the same boundary logic,
now checked against the snake's head instead of used to decide what to
draw.

### Mechanical walkthrough

1. `head.X <= 0 || head.X >= width - 1 || ...` — four independent
   conditions, `||`-joined — `true` the moment *any* one of them is true,
   matching Lesson 1's border being exactly the cells where row or column
   is at its minimum or maximum value.
2. `<=`/`>=` rather than `==` — deliberately: if the snake somehow moved
   two cells in one tick (it can't, in this project's design, but a
   defensive check doesn't rely on that never changing), `<=`/`>=` still
   correctly catches it having gone *past* the boundary, not just exactly
   onto it.

### CS Lens

This is **boundary checking** — the same fundamental question as an array
index bounds check, a mouse click's hit-testing against a UI element's
edges, or a physics engine's collision against a level's walls, just
expressed with the simplest possible geometry: an axis-aligned rectangle.

### Connection

The exact same shape of check reappears in Lesson 6, generalized behind an
`ICollidable` interface so *any* object — not just the snake's head — can be
tested against the wall the same way.

---

## Concept Unit: Self-Collision — Counting, Not Just Checking

### The Problem

The head reaching the exact same cell as one of the snake's own *other*
segments should end the game too — but the head is itself always one of the
segments in `body` (Lesson 3 adds it there before checking), which makes a
naive `Contains` check always true.

### The New Code

```csharp
bool HitsSelf(Position head, LinkedList<Position> body)
{
    int count = 0;
    foreach (var seg in body)
    {
        if (seg == head) count++;
    }
    return count > 1;
}
```

Run it:

```csharp
var selfBody = new LinkedList<Position>();
selfBody.AddFirst(new Position(5, 5));
selfBody.AddFirst(new Position(6, 5));
selfBody.AddFirst(new Position(5, 5)); // head moved back onto its own neck
Console.WriteLine($"Self collision: {HitsSelf(new Position(5, 5), selfBody)}");
```

Real output — verified this session:

```text
Self collision: True
```

*What this proves:* `(5, 5)` appears **twice** in this body (once as the
new head, once further back) — counting every match and asking if there's
more than one, rather than asking "is it in the list at all" (which would
always be true, since the head itself is always in the list), correctly
distinguishes "the head is just sitting where it always is" from "the head
has actually run into an *earlier* segment."

### Mechanical walkthrough

1. `int count = 0;` / `foreach (var seg in body) { if (seg == head)
   count++; }` — (hard concept reappearing) a straightforward counting
   loop, using `record`'s generated `==` (Lesson 3) to compare each segment
   against the head.
2. `return count > 1;` — (first appearance in this shape) the actual
   insight of this unit: `count` is *never* zero (the head is always
   structurally part of `body`), so the meaningful question isn't "is it
   present" but "is it present *more than once*."

### CS Lens

This is a subtle but real instance of a **self-reference problem** — the
thing you're testing is itself part of the collection you're testing it
against, and the naive version of "is X in this collection" gives a
useless, always-true answer unless you account for that explicitly. The
same category of care is needed anywhere a query includes the item being
queried about — a very common, easy-to-miss source of off-by-one-style
bugs.

### SE Lens

An alternative design: check the head against `body` *excluding its own
first node*, using `body.Skip(1).Contains(head)` (LINQ, covered properly
later in this project) instead of counting. Both are correct; counting is
shown first here because it needs no new concept to understand, and
because it makes the actual subtlety — "the head is always present once;
twice means collision" — completely explicit in the code, rather than
implicit in a `Skip(1)` call a reader has to think through.

---

## Concept Unit: Ending the Game

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Program.cs`.
- **Change type:** Add a checked exit condition to the main loop.
- **Location:** Immediately after computing the new head position, before
  it's added to the body.
- **Dependencies:** `HitsWall`, `HitsSelf`.

### The New Code

```csharp
if (HitsWall(newHead, width, height) || HitsSelf(newHead, body))
{
    Console.SetCursorPosition(0, height + 1);
    Console.WriteLine("Game over!");
    break;
}
body.AddFirst(newHead);
```

### The Updated Project

This sits directly inside the `while (true)` loop from Lesson 2, right
before the line that adds the new head to `body` — checking *before*
committing the move, not after, so a losing move is never actually applied
to the snake's real state.

### Mechanical walkthrough

1. `if (HitsWall(...) || HitsSelf(...))` — either condition alone ends the
   game; short-circuit evaluation means `HitsSelf` is only even called if
   `HitsWall` was `false` — a small, real efficiency detail, not just
   syntax.
2. `break;` — (hard concept reappearing, new context) this time exiting the
   *outer* `while (true)` loop entirely, not a `switch` case — the same
   keyword, a different scope, worth being precise about which loop it
   actually exits.

### CS Lens

Checking a move's validity *before* committing it, rather than applying it
and checking afterward, is a small instance of a much larger, recurring
idea: **validate before mutating state**, the same principle behind
database transactions checking constraints before committing, and this
curriculum's other projects' own input-validation lessons.

### Run it

```bash
dotnet run
```

Verify yourself: running the snake into a wall, or back into its own body,
ends the game with a clear message instead of continuing silently or
crashing.

---

## Closing

### Connect the pieces

`HitsWall` (unit 1) reuses Lesson 1's own boundary logic against the
snake's head. `HitsSelf` (unit 2) correctly handles the subtlety that the
head is always structurally present in its own body list, counting matches
rather than just checking presence. Both checks (unit 3), run *before* the
new head is committed to `body`, end the game cleanly the instant either
one is true — verified with real, traced output for both collision types.

### What breaks without this

Change `HitsSelf`'s check from `count > 1` to `count >= 1`. Real,
observable failure: the game ends immediately, on the very first tick,
because the head (always present once) now satisfies `count >= 1` on
every single move, even when nothing has actually gone wrong. Restore
`count > 1` and the game only ends on a genuine collision.

### Exercises

- Trigger the `count >= 1` bug yourself and watch the game end
  immediately — then explain, in your own words, why this specific
  off-by-one is easy to make.
- Add a third losing condition: running the same direction into the wall a
  configurable number of times in a row shows a different message before
  actually ending — decide where this state needs to live.

### Definition of done

- [ ] Hitting a wall ends the game with a clear message, verified visually.
- [ ] Hitting the snake's own body ends the game the same way, verified
      visually.
- [ ] You triggered the `count >= 1` bug yourself and understand exactly
      why it's wrong.
- [ ] Commit: `git commit -m "Add wall and self collision detection — the first complete, playable slice"`.
