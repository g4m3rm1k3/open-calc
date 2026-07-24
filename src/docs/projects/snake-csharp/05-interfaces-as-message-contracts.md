# Lesson 5: A Promise About What Messages You'll Answer

*(Interfaces, and Real Polymorphism)*

**User Story**
> As a developer, I want the snake and the food to both know how to draw
> themselves, and the game loop to draw *anything* the same way, without
> caring what it actually is.

**What you will build**
Real classes for the snake's segments and food, both drawable through one
shared method call — the first genuine use of polymorphism in this project,
and the sharpest, most concrete version yet of Lesson 0's Alan Kay framing.

**What you need to know first**
Lesson 0's classes and messaging idea. Lessons 1–4's game loop, which this
lesson starts refactoring into real objects instead of loose variables and
functions.

---

## Concept Unit: `interface` — A Message Contract, Checked by the Compiler

### The Problem

Right now, `Program.cs` draws the snake and food with separate, hand-written
code for each — nothing says "these are both things that can be drawn" in
any way the compiler understands or enforces. An `interface` is C#'s
construct for exactly that: a formal, checked promise that a type can
receive a specific message and respond to it.

### The New Code

```csharp
interface IDrawable
{
    void Draw();
}

class SnakeSegment : IDrawable
{
    private int x, y;
    public SnakeSegment(int x, int y) { this.x = x; this.y = y; }
    public void Draw()
    {
        Console.WriteLine($"Drawing snake segment 'O' at ({x},{y})");
    }
}

class Food : IDrawable
{
    private int x, y;
    public Food(int x, int y) { this.x = x; this.y = y; }
    public void Draw()
    {
        Console.WriteLine($"Drawing food '*' at ({x},{y})");
    }
}
```

Run it against a list holding both kinds of object together:

```csharp
List<IDrawable> objects = new List<IDrawable>();
objects.Add(new SnakeSegment(5, 5));
objects.Add(new Food(8, 3));

foreach (IDrawable obj in objects)
{
    obj.Draw();
}
```

Real output — verified this session:

```text
Drawing snake segment 'O' at (5,5)
Drawing food '*' at (8,3)
```

*What this proves:* `objects` holds two genuinely different concrete
types — `SnakeSegment` and `Food` — in one list, typed as `IDrawable`. The
same call, `obj.Draw()`, produces genuinely different output depending on
which concrete object actually receives it — the loop itself never checks
"is this a `SnakeSegment` or a `Food`" anywhere; it just sends the `Draw`
message and trusts each object to know how to respond to it.

### Mechanical walkthrough

1. `interface IDrawable { void Draw(); }` — (first appearance) declares a
   message contract with **no implementation at all** — just the method's
   name, parameters, and return type. Nothing here says *how* `Draw`
   works — only that anything claiming to be `IDrawable` must provide it.
2. `class SnakeSegment : IDrawable` — (first appearance) `:` here means
   "implements," not "inherits from" (the same symbol both jobs, disambiguated
   by whether what follows is an interface or a class) — `SnakeSegment` is
   making a checked promise to provide everything `IDrawable` declares.
3. `public void Draw() { ... }` in each class — each class provides its
   *own*, completely independent implementation of the same message.
4. `List<IDrawable> objects` — the list's element type is the *interface*,
   not either concrete class — this is what makes it legal to hold both
   `SnakeSegment`s and `Food`s in the same collection at all.
5. `foreach (IDrawable obj in objects) { obj.Draw(); }` — at this point,
   `obj` is only known, at compile time, to be "something `IDrawable`" —
   which concrete `Draw()` actually runs is decided at the moment the
   program runs, based on `obj`'s real, concrete type.

### Now prove the contract is actually enforced

```csharp
class Rock
{
    // does not implement IDrawable
}
```

```csharp
List<IDrawable> objects = new List<IDrawable>();
objects.Add(new Rock());
```

Real output — verified this session:

```text
Program.cs(2,13): error CS1503: Argument 1: cannot convert from 'Rock' to 'IDrawable'
```

*What this proves:* `Rock` never promised to answer the `Draw` message, and
the compiler refuses to let it into a list that requires that promise —
this isn't a suggestion or a convention, it's checked exactly like every
other type mismatch since Lesson 0's very first unit.

### CS Lens

This is **polymorphism** — literally "many forms" — the same message
(`Draw()`) producing different behavior depending on the real, concrete
type of the object that receives it, decided at the moment the program
runs (**late binding**, in Alan Kay's own terms from Lesson 0). This is the
sharpest possible illustration of Kay's messaging idea: the `foreach` loop
above never once asks what kind of object it's holding — it just sends a
message and trusts the receiver.

Also recognized in: any plugin system where a host program calls a method
on plugins it's never seen the source of, any UI framework's event handlers
(this curriculum's WPF and Kotlin/Compose courses both lean on this exact
mechanism constantly), and — Lesson 10 makes this connection directly — any
publish/subscribe system where a publisher sends a message to subscribers
whose concrete types it never knows.

### SE Lens

Why not just give `SnakeSegment` and `Food` a shared *base class* instead
of an interface? An interface makes the weakest possible promise — only
"this type can answer this message" — with no shared implementation, no
shared fields, nothing else assumed. A base class would force a real
inheritance relationship even if `SnakeSegment` and `Food` have nothing
else in common (they don't — Lesson 7 covers exactly when a shared base
class *does* earn its place, once there's real shared behavior worth not
repeating).

### Connection

Lesson 6 adds `IMovable` and `ICollidable` — more message contracts,
composed onto the same classes, each answering a different, independent
question about what a game object can do.

---

## Concept Unit: Refactoring the Game Loop Around Real Objects

### Project Change

- **Reference Source:** No reference counterpart.
- **Files affected:** `Program.cs`.
- **Change type:** Replace the loose `Position`/`LinkedList<Position>`-only
  drawing code with real `SnakeSegment` and `Food` objects implementing
  `IDrawable`.
- **Location:** Wherever the board is currently redrawn each tick.
- **Dependencies:** `IDrawable`, `SnakeSegment`, `Food`.

### The Updated Project

```csharp
void DrawFrame(List<IDrawable> drawableObjects)
{
    Console.Clear();
    DrawBoardBorder();
    foreach (IDrawable obj in drawableObjects)
    {
        obj.Draw();
    }
}
```

Every tick, the game builds a fresh `List<IDrawable>` from the snake's
current segments plus the current food, and hands the whole list to one
drawing function that has no idea, and doesn't need to know, what specific
kinds of objects it's drawing.

### CS Lens

This is the practical payoff of the previous unit: `DrawFrame` is now
**open to new kinds of drawable objects without ever being modified** — a
future obstacle or power-up (Lesson 19's extension territory) that
implements `IDrawable` slots into this exact loop with zero changes to
`DrawFrame` itself. This is the **open/closed principle** — open for
extension, closed for modification — named directly here because it falls
directly out of designing around a message contract instead of a fixed list
of concrete types.

### Connection

Lesson 9's game states and Lesson 13's food varieties both lean on this
same shape: a shared interface, multiple independent implementations,
calling code that never needs to change when a new implementation appears.

---

## Closing

### Connect the pieces

`IDrawable` (unit 1) is a message contract with zero implementation —
`SnakeSegment` and `Food` (unit 1) each fulfill it independently, and the
compiler genuinely enforces the promise, proven with a real error when
`Rock` tried to skip it. `DrawFrame` (unit 2) is written entirely against
the interface, never the concrete types, which is what makes it stay
correct as new kinds of drawable object are added later.

### What breaks without this

Remove `public void Draw()` entirely from `Food`, leaving `class Food :
IDrawable` with no implementation. Real, observable failure: a compile
error stating `Food` does not implement the interface member `Draw()` —
the compiler catches the broken promise the moment it's made, not the
first time something tries to actually call `Draw()` on a `Food` at
runtime.

### Exercises

- Add a third `IDrawable` type — an `Obstacle` — and confirm it slots into
  the existing `DrawFrame` loop with no changes to that function at all.
- Trigger the real "does not implement the interface member" error
  yourself, by deleting an implementation, then restore it.

### Definition of done

- [ ] `SnakeSegment` and `Food` both implement `IDrawable`, verified with
      real output showing both drawn through the same loop.
- [ ] You triggered both real compile errors in this lesson yourself (a
      non-`IDrawable` type rejected from the list; a missing
      implementation rejected outright).
- [ ] You can explain, in your own words, why this is Alan Kay's messaging
      idea in its sharpest form so far in this project.
- [ ] Commit: `git commit -m "Introduce IDrawable — real polymorphism, refactoring drawing around a message contract"`.
