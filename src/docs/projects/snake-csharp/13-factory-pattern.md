# Lesson 13: Centralizing "Which Concrete Type Do I Actually Need"

*(The Factory Pattern — Food Variety)*

**User Story**
> As a player, I want different kinds of food to appear — some giving bonus
> points, one even shrinking the snake — chosen randomly each time food
> spawns.

**What you will build**
Three kinds of food, each with different effects, created through one
shared method that decides which concrete kind to make — the calling code
never picks a type directly.

**What you need to know first**
Lesson 5's interfaces and Lesson 3's food-spawning logic — this lesson
replaces "always spawn the one kind of food" with genuine variety, chosen
in exactly one place.

---

## Concept Unit: `IFood` — One Contract, Several Effects

### The Problem

Lesson 3's food was a single, fixed kind: eat it, grow by one. Real variety
needs several kinds, each answering the same basic questions (how much
does the snake grow, how many points, what symbol) with different answers.

### The New Code

```csharp
interface IFood
{
    int GrowthAmount { get; }
    int PointValue { get; }
    char Symbol { get; }
}

class NormalFood : IFood
{
    public int GrowthAmount => 1;
    public int PointValue => 10;
    public char Symbol => '*';
}

class GoldenFood : IFood
{
    public int GrowthAmount => 1;
    public int PointValue => 50;
    public char Symbol => '$';
}

class ShrinkFood : IFood
{
    public int GrowthAmount => -1;
    public int PointValue => 5;
    public char Symbol => '!';
}
```

*What this is:* three classes, each implementing `IFood` with completely
independent values — `ShrinkFood` even returning a *negative* growth
amount, a real, deliberate twist the rest of the game (Lesson 3's growth
logic, adjusted to add `GrowthAmount` instead of always adding exactly one)
now has to honor.

### CS Lens

This is Lesson 5's `IDrawable` idea again, at this point a thoroughly
familiar shape: one interface, several independent implementations, no
inheritance relationship required between them at all — `NormalFood`,
`GoldenFood`, and `ShrinkFood` share nothing but the promise to answer
`GrowthAmount`, `PointValue`, and `Symbol`.

### Connection

The next unit is what actually *decides* which of these three gets
created, each time food spawns.

---

## Concept Unit: A Factory — Centralizing the "Which One" Decision

### The Problem

Something has to decide, each time food spawns, which of the three
concrete `IFood` types to actually create. Scattering that decision (a
random roll, then a chain of `if`s creating different concrete types)
across every place food is ever spawned would duplicate the exact same
logic repeatedly, and getting the odds right would mean fixing it in
several places if they ever changed.

### The New Code

```csharp
static class FoodFactory
{
    public static IFood CreateRandomFood(Random rng, Position at)
    {
        int roll = rng.Next(0, 100);
        if (roll < 70) return new NormalFood();
        if (roll < 90) return new GoldenFood();
        return new ShrinkFood();
    }
}
```

Run it, with a fixed random seed so the exact sequence is reproducible:

```csharp
var rng = new Random(1);
for (int i = 0; i < 5; i++)
{
    IFood food = FoodFactory.CreateRandomFood(rng, new Position(i, i));
    Console.WriteLine($"{food.GetType().Name}: growth={food.GrowthAmount}, points={food.PointValue}, symbol='{food.Symbol}'");
}
```

Real output — verified this session:

```text
NormalFood: growth=1, points=10, symbol='*'
NormalFood: growth=1, points=10, symbol='*'
NormalFood: growth=1, points=10, symbol='*'
GoldenFood: growth=1, points=50, symbol='$'
NormalFood: growth=1, points=10, symbol='*'
```

*What this proves:* five calls to `CreateRandomFood`, using the same
seeded `Random`, produced a reproducible mix — mostly `NormalFood`, with
one `GoldenFood` — matching the `70`/`20`/`10` percent split written into
the factory. Every single caller of `CreateRandomFood` gets this exact
distribution automatically, without needing to know the odds, or even how
many food types currently exist.

### Mechanical walkthrough

1. `static class FoodFactory` — (hard concept reappearing) `static`, from
   Lesson 0's own contrast with instance methods — `FoodFactory` is never
   instantiated; it exists purely to group one related function.
2. `public static IFood CreateRandomFood(Random rng, Position at)` — (first
   appearance in this shape) the method's **return type is the
   interface**, `IFood`, not any specific concrete class — callers receive
   "some `IFood`," and correctly don't need to know, or care, which one.
3. `rng.Next(0, 100)` — (hard concept reappearing) a random roll used to
   weight the odds — `70`, then `20` more (`70` to `90`), then the
   remaining `10` — a real, tunable design decision living in exactly one
   place.
4. `new Random(1)` — (first appearance) passing a fixed **seed** to
   `Random` makes its sequence of "random" numbers exactly reproducible —
   useful here specifically so this lesson's verified output is real and
   repeatable, and useful in the real game too, for Lesson 15's tests,
   where a reproducible sequence is often more valuable than a genuinely
   unpredictable one.

### CS Lens

This is the **Factory pattern** — centralizing the decision of *which
concrete type to create* behind one function, so calling code depends only
on the interface (`IFood`) the factory returns, never on the concrete
classes or the logic that picks between them.

Also recognized in: this curriculum's Kotlin course's own dispatch-table
functions, ORMs that construct different concrete row-mapping classes
depending on a database column's value, and UI frameworks that create
different concrete widget classes from one shared configuration format —
any place "decide which concrete type, then hand back the interface" is a
repeated, centralizable decision.

### SE Lens

Why not just have each spawn-site roll its own random number and pick a
type directly? Because the moment two different places in the codebase
both spawn food (the main loop, and — a real future feature — a level
that guarantees a `GoldenFood` at the start), both would need the exact
same odds logic duplicated, and changing the odds later means finding and
fixing every duplicate. One factory method is one place the actual
probabilities live, and every caller automatically gets whatever the
factory currently decides, with zero risk of the copies drifting out of
sync — the same "no duplication" principle Lesson 8's `Draw()` method
already applied to shared behavior, here applied to a shared *decision*.

### Connection

Lesson 3's spawn logic is updated to call `FoodFactory.CreateRandomFood`
instead of always constructing the same fixed food — everything else
about spawning (finding an empty cell) stays exactly as it was.

---

## Closing

### Connect the pieces

`IFood` (unit 1) is one contract with three independent, meaningfully
different implementations — including a deliberately unusual negative
`GrowthAmount`. `FoodFactory.CreateRandomFood` (unit 2) centralizes the
random decision of which one to create, verified with a reproducible seed
showing the real, weighted distribution in action, with calling code
depending only on `IFood`, never any specific concrete class.

### What breaks without this

Change `FoodFactory`'s three `if`/return lines' order so `ShrinkFood`'s
check comes first with the same `< 70` threshold, without adjusting the
other thresholds. Real, observable consequence: `ShrinkFood` now spawns
roughly 70% of the time instead of 10%, and `NormalFood` almost never
appears — a real, easy-to-make mistake showing why the *order and
thresholds together* define the actual distribution, not just each
threshold in isolation.

### Exercises

- Add a fourth food type of your own design and adjust the percentages to
  include it.
- Run `CreateRandomFood` with several different fixed seeds (`new
  Random(2)`, `new Random(3)`) and confirm you get different, but each
  individually reproducible, sequences.

### Definition of done

- [ ] Three distinct food types exist, each with real, different effects.
- [ ] `FoodFactory.CreateRandomFood` produces a distribution matching its
      written percentages, verified with real, seeded output.
- [ ] You can explain, in your own words, why centralizing this decision
      in one factory method matters, with a concrete scenario where
      *not* centralizing it would cause a real bug.
- [ ] Commit: `git commit -m "Add IFood and FoodFactory — three food types, one centralized creation decision"`.
