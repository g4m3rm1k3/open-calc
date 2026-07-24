# Lesson 7: One Class, Several Independent Promises

*(`IMovable` and `ICollidable`)*

**User Story**
> As a developer, I want collision checking to work on *any* collidable
> object, and movement logic to work on *any* movable one, without
> hardcoding which specific classes exist.

**What you will build**
Two more message contracts, both implemented by the snake's head at once —
proving a single class can answer several independent kinds of message, each
checked and used completely separately.

**What you need to know first**
Lesson 5's `IDrawable` and Lesson 6's properties — this lesson combines
both directly.

---

## Concept Unit: `ICollidable` — A Position, Exposed as a Property

### The Problem

Lesson 4's collision checks worked directly against `Position` values and a
`LinkedList<Position>` — correct for the snake specifically, but not
reusable for a future obstacle or a second snake (Lesson 12's AI opponent)
without rewriting the same logic again.

### The New Code

```csharp
interface ICollidable
{
    Position Position { get; }
}
```

*What this reads as:* anything `ICollidable` promises to answer "what
position are you at right now?" — as a **read-only property** (`{ get; }`,
no `set`) — because collision checking only ever needs to *ask* a position,
never *set* one directly from outside.

### Mechanical walkthrough

1. `Position Position { get; }` — (hard concept reappearing, new context)
   Lesson 6's property syntax, this time declared inside an *interface* —
   an interface can require a property to exist without saying anything
   about how it's implemented; only that reading it must be possible.

### Connection

Any class implementing `ICollidable` can be checked for collisions using
one shared function, regardless of what the class actually is.

---

## Concept Unit: `IMovable` — A Message That Changes State

### The New Code

```csharp
interface IMovable
{
    void Move(Direction direction);
}
```

*What this reads as:* anything `IMovable` promises to answer a `Move`
message, given a `Direction`, and update its own state accordingly — how it
updates is entirely up to the implementing class.

### CS Lens

`ICollidable` and `IMovable` are deliberately separate, single-purpose
interfaces rather than one larger `IGameObject` interface bundling both —
this is the **Interface Segregation** idea: a class should only have to
promise the messages it actually needs to answer. A stationary obstacle can
be `ICollidable` without ever being `IMovable`, because it genuinely never
moves — forcing it to implement a `Move` method it would never meaningfully
use would be a promise with no honest content behind it.

---

## Concept Unit: One Class, Two Independent Interfaces

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** New file(s) for `SnakeHead`/`StaticObstacle`; existing
  collision-checking code refactored to use `ICollidable` instead of raw
  `Position`.
- **Change type:** Add + refactor.
- **Location:** Wherever the snake's head and any obstacles are represented.
- **Dependencies:** `Position`, `Direction`, `ICollidable`, `IMovable`.

### The New Code

```csharp
class SnakeHead : ICollidable, IMovable
{
    public Position Position { get; private set; }

    public SnakeHead(int x, int y)
    {
        Position = new Position(x, y);
    }

    public void Move(Direction direction)
    {
        Position = direction switch
        {
            Direction.Up => new Position(Position.X, Position.Y - 1),
            Direction.Down => new Position(Position.X, Position.Y + 1),
            Direction.Left => new Position(Position.X - 1, Position.Y),
            Direction.Right => new Position(Position.X + 1, Position.Y),
            _ => Position
        };
    }
}

class StaticObstacle : ICollidable
{
    public Position Position { get; }
    public StaticObstacle(int x, int y) { Position = new Position(x, y); }
}
```

Run it:

```csharp
SnakeHead head = new SnakeHead(5, 5);
head.Move(Direction.Right);
Console.WriteLine($"Head now at ({head.Position.X},{head.Position.Y})");

StaticObstacle rock = new StaticObstacle(6, 5);
Console.WriteLine($"Head collides with rock: {head.Position == rock.Position}");

List<ICollidable> collidables = new List<ICollidable> { head, rock };
foreach (var c in collidables)
{
    Console.WriteLine($"Collidable at ({c.Position.X},{c.Position.Y})");
}
```

Real output — verified this session:

```text
Head now at (6,5)
Head collides with rock: True
Collidable at (6,5)
Collidable at (6,5)
```

*What this proves:* `SnakeHead` implements *both* `ICollidable` and
`IMovable` at once — `head.Move(...)` (only possible because it's
`IMovable`) changed `Position`, which `head.Position` (only possible
because it's `ICollidable`) then correctly reported. `StaticObstacle`
implements only `ICollidable` — it has no `Move` method at all, and doesn't
need one. Both objects sit together in one `List<ICollidable>`, and the
loop checks each one's position identically, with no idea (or need to
know) that one of them can move and the other can't.

### Mechanical walkthrough

1. `class SnakeHead : ICollidable, IMovable` — (first appearance) a class
   can implement **more than one interface**, comma-separated — each is an
   independent promise, checked separately by the compiler.
2. `public Position Position { get; private set; }` — (hard concept
   reappearing, new detail) an auto-property (Lesson 6) whose `set` is
   `private` — meaning only code *inside* `SnakeHead` can assign
   `Position` directly; outside code can only read it. This is exactly
   Lesson 0's encapsulation principle, expressed through a property
   instead of a fully hand-written field.
3. `Position = direction switch { ... };` — (hard concept reappearing) the
   switch expression from Lesson 2, now assigning directly to a property
   instead of a loose local variable.
4. `List<ICollidable> collidables = new List<ICollidable> { head, rock };`
   — (first appearance) **collection initializer syntax** — `{ head, rock
   }` after `new List<ICollidable>()` adds both items immediately, in one
   expression, instead of two separate `.Add(...)` calls.

### CS Lens

This is **interface composition** — building up a class's full capability
set from several small, independent promises, rather than one large,
monolithic contract. `SnakeHead` is `ICollidable` *and* `IMovable`
simultaneously; a future `Food` class might be `ICollidable` *and*
`IDrawable` but never `IMovable`; `StaticObstacle` is `ICollidable` *and*
`IDrawable` but also never `IMovable`. Each class picks exactly the
messages it can honestly answer.

### SE Lens

The real payoff, concretely: a collision-checking function written against
`ICollidable` works correctly on the snake's head, an obstacle, or Lesson
12's second, AI-controlled snake — all without that function ever being
told, or needing to know, which one it's currently checking. Adding a
brand-new kind of collidable object later requires zero changes to
existing collision code — the same open/closed principle from Lesson 5,
now proven with two contracts composed on one class instead of one.

### Connection

Lesson 9's game states and Lesson 12's AI strategy both build directly on
this same "compose small, independent interfaces" instinct rather than one
large class hierarchy.

---

## Closing

### Connect the pieces

`ICollidable` (unit 1) and `IMovable` (unit 2) are each a single, narrow
promise. `SnakeHead` (unit 3) implements both at once, `StaticObstacle`
implements only one — proven with real output showing both objects
coexisting correctly in one `List<ICollidable>`, one of them actually
movable and one of them not, with no code anywhere needing to check which
is which.

### What breaks without this

Try adding `Move` to `ICollidable` itself, forcing every collidable object
to also be movable. Real, observable consequence: `StaticObstacle` — which
never should move — now either has to implement a `Move` method that does
nothing (a dishonest promise, misleading to any reader) or fails to compile
at all, stating it doesn't implement the interface. Splitting the two
interfaces back apart removes the false requirement entirely.

### Exercises

- Add a third interface, `IEdible`, with a single property or method of
  your choosing, and give it to a `Food` class alongside `IDrawable` and
  `ICollidable`.
- Refactor Lesson 4's `HitsWall`/`HitsSelf` functions to accept
  `ICollidable` parameters instead of raw `Position`s, and confirm they
  still work identically.

### Definition of done

- [ ] `SnakeHead` correctly implements both `ICollidable` and `IMovable`,
      verified with real output.
- [ ] A non-movable `ICollidable` (`StaticObstacle`) coexists correctly in
      the same collection.
- [ ] You can explain, in your own words, why these are two separate
      interfaces instead of one combined one.
- [ ] Commit: `git commit -m "Add ICollidable and IMovable — one class can answer several independent message contracts"`.
