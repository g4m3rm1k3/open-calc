# Lesson 8: When a Promise Needs Shared Implementation

*(Abstract Classes vs. Interfaces)*

**User Story**
> As a developer, I want walls and power-ups to share their drawing logic
> and position tracking, while each still defining its own symbol and
> behavior.

**What you will build**
A real `abstract class` — the tool for when several related types don't
just need to answer the same message, they need to share genuine,
non-trivial implementation while still each customizing part of it.

**What you need to know first**
Lessons 5–7's interfaces. This lesson is specifically about recognizing
when an interface stops being the right tool.

---

## Concept Unit: `abstract class` — Shared Code, With Required Gaps

### The Problem

`Wall` and `PowerUp` (two new, simple game entities) both need identical
position tracking and an identical `Draw` method's overall shape — only the
specific symbol drawn differs. An interface can't share *any*
implementation at all (Lessons 5–7's `IDrawable`/`ICollidable`/`IMovable`
each require every implementing class to write its own method body from
scratch, even if that body would be identical everywhere). Duplicating the
same `Position` property and the same `Draw` structure in both `Wall` and
`PowerUp` would violate the same "no duplication" principle this
curriculum's other projects apply repeatedly.

### The New Code

```csharp
abstract class GameEntity
{
    public Position Position { get; protected set; }

    protected GameEntity(int x, int y)
    {
        Position = new Position(x, y);
    }

    public void Draw()
    {
        Console.Write($"[{GetType().Name} at ({Position.X},{Position.Y})] ");
        Console.WriteLine(GetSymbol());
    }

    protected abstract char GetSymbol();
}

class Wall : GameEntity
{
    public Wall(int x, int y) : base(x, y) { }
    protected override char GetSymbol() => '#';
}

class PowerUp : GameEntity
{
    public PowerUp(int x, int y) : base(x, y) { }
    protected override char GetSymbol() => '$';
}
```

Run it:

```csharp
GameEntity[] entities = { new Wall(1, 1), new PowerUp(4, 4) };
foreach (var e in entities)
{
    e.Draw();
}
```

Real output — verified this session:

```text
[Wall at (1,1)] #
[PowerUp at (4,4)] $
```

*What this proves:* `Draw()` is written **exactly once**, in `GameEntity`,
and both `Wall` and `PowerUp` use it completely unchanged — but each one
produces a different symbol, because `Draw()` calls `GetSymbol()`, and each
subclass provides its own answer to that one specific piece.

### Mechanical walkthrough

1. `abstract class GameEntity` — (first appearance) `abstract` means this
   class can never be instantiated directly (`new GameEntity(1, 1)` is a
   compile error, verified below) — it only exists to be inherited from.
2. `protected GameEntity(int x, int y)` — (first appearance) `protected`
   means this constructor is callable only from `GameEntity` itself or a
   class that inherits from it — never from ordinary outside code, which
   matches `GameEntity` never being directly instantiable anyway.
3. `public Position Position { get; protected set; }` — (hard concept
   reappearing, new modifier) a real, shared property — `protected set`
   means only `GameEntity` and its subclasses can change `Position`
   directly; ordinary outside code can only read it.
4. `public void Draw() { ... }` — a real, complete, shared method body,
   inherited by every subclass unchanged.
5. `protected abstract char GetSymbol();` — (first appearance) an
   **abstract method** — declared with no body at all, exactly like an
   interface's method, but living inside a class that already has real,
   shared implementation elsewhere. Every non-abstract subclass *must*
   provide this one specific piece.
6. `class Wall : GameEntity` / `public Wall(int x, int y) : base(x, y) { }`
   — (first appearance) `: base(x, y)` calls the parent class's own
   constructor — `Wall`'s constructor doesn't set `Position` itself; it
   delegates that job to `GameEntity`'s constructor, which already knows
   how.
7. `protected override char GetSymbol() => '#';` — (first appearance)
   `override` is required, and checked — a subclass providing an abstract
   method's actual implementation must say so explicitly, so a reader
   scanning `Wall` immediately knows this method is fulfilling a
   requirement from its base class, not just coincidentally named the
   same thing.

### Proving `abstract` is enforced

```csharp
var e = new GameEntity(1, 1);
```

Real output — verified this session:

```text
Program.cs(1,9): error CS0144: Cannot create an instance of the abstract type or interface 'GameEntity'
```

*What this proves:* the compiler genuinely refuses to let you create a
`GameEntity` directly — it only exists to be inherited from, exactly as
`abstract` promised.

### CS Lens

This is **inheritance**, used specifically for **shared implementation** —
the actual reason it exists, as distinct from Lesson 5's interfaces, which
share *no* implementation at all. `Wall` and `PowerUp` are both, correctly,
"a kind of `GameEntity`" — a real **is-a relationship** — which is the
honest test for whether inheritance is the right tool at all: `Wall` isn't
just "something that can answer the same messages as `PowerUp`," it
genuinely *is* a `GameEntity`, sharing its actual identity and behavior.

### SE Lens

The real, precise rule for choosing between the two, stated directly: use
an **interface** when unrelated types need to answer the same message with
completely independent implementations (Lesson 5's `SnakeSegment` and
`Food` sharing nothing but the ability to draw). Use an **abstract class**
when related types share real, non-trivial implementation and only differ
in specific, well-defined pieces (`Wall` and `PowerUp` sharing all of
position tracking and the overall draw structure). Getting this backwards —
forcing unrelated types into a shared abstract class just to avoid
retyping a few lines, or duplicating real shared logic across several
interface implementations that should have shared a base class — is a
real, common design mistake, not just a style preference.

A class can also do both at once: `GameEntity` could additionally
implement `IDrawable` and `ICollidable` from earlier lessons — abstract
classes and interfaces aren't competing alternatives, they answer two
different questions ("what do these related types share" vs. "what
message can any of these unrelated types answer") that can both apply to
the same type simultaneously.

### Connection

Lesson 12's AI-controlled snake reuses this exact shared-implementation
idea: an abstract `SnakeController` provides shared movement bookkeeping,
with each concrete strategy (human input, AI) overriding only the specific
decision of which direction to move next.

---

## Closing

### Connect the pieces

`GameEntity` (unit 1) shares real, working implementation (`Position`
tracking, the overall `Draw` structure) between `Wall` and `PowerUp`, while
`GetSymbol()` — the one genuinely different piece — is required, not
shared, via an abstract method. The compiler enforces that `GameEntity`
itself can never be instantiated directly, proven with a real error.

### What breaks without this

Remove `protected abstract char GetSymbol();` and instead write a real,
shared `GetSymbol()` returning a single hardcoded character directly in
`GameEntity`. Real, observable consequence: every subclass — `Wall` and
`PowerUp` alike — now draws the exact same symbol, because there's no
longer any required, per-subclass customization point at all; the whole
reason to have separate `Wall` and `PowerUp` classes has quietly
disappeared. Restore the abstract method and each subclass draws its own
symbol again.

### Exercises

- Add a third subclass, `Trap`, with its own symbol — confirm `Draw()`
  works correctly with zero changes to `GameEntity` itself.
- Try calling `base.GetSymbol()` from inside `Wall`'s override and read
  the real compile error — connect it to `GetSymbol` never having any
  base implementation to call in the first place.

### Definition of done

- [ ] `Wall` and `PowerUp` share `Draw()` and `Position` completely, each
      only providing their own `GetSymbol()`, verified with real output.
- [ ] You triggered the real "cannot create an instance of the abstract
      type" error yourself.
- [ ] You can state, in your own words and without hedging, the specific
      rule for choosing an interface versus an abstract class.
- [ ] Commit: `git commit -m "Add GameEntity abstract class — shared implementation for Wall and PowerUp"`.
