# Lesson 14: The Pattern Everyone Reaches For, and Usually Shouldn't

*(Singleton — and Why Dependency Injection Is Usually the Better Answer)*

**User Story**
> As a developer, I want to understand Singleton well enough to recognize
> when it's tempting, and why this project deliberately doesn't use it.

**What you will build**
A real `Singleton`, working exactly as designed — and then a real,
concrete demonstration of the specific, well-documented problem it causes,
using the exact same class. This lesson's point isn't "never use this" in
the abstract; it's showing you the actual mechanism of the actual harm, so
the usual advice ("prefer DI") means something concrete instead of being a
rule taken on faith.

**What you need to know first**
Lesson 11's Dependency Injection — this lesson is a direct, deliberate
contrast against it, revisiting the exact same kind of problem (shared
game settings) with the opposite design choice.

---

## Concept Unit: Singleton, Built Correctly

### The Problem

Sometimes it seems like a class should have **exactly one instance**,
shared everywhere it's needed — game settings, feels like an obvious
candidate: there's only one game running, so why not one shared settings
object, reachable from anywhere, with no need to pass it around explicitly?

### The New Code

```csharp
class GameSettings
{
    private static GameSettings? instance;
    public static GameSettings Instance => instance ??= new GameSettings();
    public int HighScore { get; set; }
    private GameSettings() { }
}
```

### Mechanical walkthrough

1. `private static GameSettings? instance;` — (first appearance) a
   **static** field — `static` (Lesson 0's brief mention, made concrete
   here) means this field belongs to the *class itself*, not to any
   particular instance — there's exactly one `instance` field, shared by
   the entire program, regardless of how many times anyone tries to
   access it.
2. `public static GameSettings Instance => instance ??= new GameSettings();`
   — (first appearance) `??=` is the **null-coalescing assignment
   operator** — "if `instance` is currently `null`, assign it a new value;
   otherwise, leave it alone" — the first time `Instance` is ever read,
   this creates the one and only `GameSettings`; every subsequent read
   returns that same object.
3. `private GameSettings() { }` — (hard concept reappearing, deliberate
   use) a `private` constructor — this is what makes the class genuinely a
   singleton: nothing outside `GameSettings` itself can call `new
   GameSettings()` at all — the *only* way to get a `GameSettings` is
   through `Instance`.

### Proving the constructor really is locked down

```csharp
var s = new GameSettings();
```

Real output — verified this session:

```text
Program.cs(1,13): error CS0122: 'GameSettings.GameSettings()' is inaccessible due to its protection level
```

*What this proves:* the pattern's core mechanism genuinely works — there is
no way to create a second `GameSettings` anywhere in the program.

### Connection

The next unit shows exactly what this "exactly one, reachable from
anywhere" guarantee actually costs.

---

## Concept Unit: The Real Problem — Hidden, Shared, Mutable State

### The Problem

`GameSettings.Instance` is reachable from *anywhere* in the program, with
no need to be passed in — which sounds convenient right up until two
independent pieces of code, expecting to work with their own,
independent data, are actually silently sharing the exact same object.

### Introduce the concept in isolation

```csharp
GameSettings.Instance.HighScore = 100;
Console.WriteLine($"Test A sees HighScore: {GameSettings.Instance.HighScore}");

RunTestB();
Console.WriteLine($"Test A's value AFTER test B ran: {GameSettings.Instance.HighScore}");

void RunTestB()
{
    GameSettings.Instance.HighScore = 999;
    Console.WriteLine($"Test B sees HighScore: {GameSettings.Instance.HighScore}");
}
```

Run it:

```bash
dotnet run
```

Real output — verified this session:

```text
Test A sees HighScore: 100
Test B sees HighScore: 999
Test A's value AFTER test B ran: 999
```

*What this proves — a real, concrete bug, not a hypothetical:* "Test A"
set `HighScore` to `100`, expecting it to stay `100`. After "Test B" ran —
code that, from Test A's point of view, is completely unrelated — Test
A's own value silently became `999`. Neither piece of code did anything
individually wrong. The Singleton's entire nature — one shared instance,
reachable globally, mutable from anywhere — is what caused this: there is
no such thing as "Test A's own settings" at all, only ever one shared
object every single piece of code in the program secretly depends on.

### Now the fix: Dependency Injection, exactly as Lesson 11 taught it

```csharp
void RunTestA()
{
    var settings = new GameSettings();
    settings.HighScore = 100;
    Console.WriteLine($"Test A sees HighScore: {settings.HighScore}");
}

void RunTestB()
{
    var settings = new GameSettings();
    settings.HighScore = 999;
    Console.WriteLine($"Test B sees HighScore: {settings.HighScore}");
}

RunTestA();
RunTestB();
RunTestA();

class GameSettings
{
    public int HighScore { get; set; }
}
```

Real output — verified this session:

```text
Test A sees HighScore: 100
Test B sees HighScore: 999
Test A sees HighScore: 100
```

*What this proves:* with a plain, ordinary class — no `static`, no private
constructor, just a regular object each caller creates and owns for
itself — running Test A a second time, after Test B, correctly still shows
`100`. Nothing was shared that shouldn't have been, because nothing was
global in the first place.

### CS Lens

The Singleton pattern is, underneath its name, **global mutable state**
with a design pattern's name attached to make it feel more acceptable than
a bare global variable would. It shares every real problem global mutable
state has always had — anything, anywhere in the program, can change it,
and anything else, anywhere else, is affected, with no way to trace that
relationship from either side's own code alone.

### SE Lens — the honest, complete comparison

Singleton is not *always* wrong — a case can be made for it when a
resource genuinely must be unique at the process level for a real,
physical reason (a single connection to a specific hardware device, for
instance). For nearly everything else — including game settings, which
feels like an obvious candidate — Dependency Injection (Lesson 11) gives
you the same practical convenience (one settings object, used consistently
throughout the running game) without the hidden global coupling: you
construct exactly one `GameSettings` at startup and pass it explicitly to
whatever needs it, via constructors, exactly like `IRenderer` in Lesson 11.
The object is still effectively "the one settings for this run of the
game" — the difference is that dependency is now visible, in every
constructor that needs it, instead of invisible and reachable from
literally anywhere.

The concrete, undeniable cost demonstrated above: a Singleton makes
isolated, independent unit testing (Lesson 15, next) genuinely harder,
because tests that touch the same Singleton are never truly
independent — exactly what just happened to "Test A."

### Connection

Lesson 15's real unit tests are written specifically so each test is
completely independent — a guarantee this lesson just proved a Singleton
would quietly break.

---

## Closing

### Connect the pieces

Singleton (unit 1), built correctly, does guarantee exactly one shared
instance — proven with a real, locked-down private constructor. That exact
guarantee (unit 2) is also its real cost: global, hidden, mutable state
that silently couples any two pieces of code that happen to touch it,
proven with a real test-pollution bug, then fixed completely by returning
to Lesson 11's Dependency Injection instead.

### What breaks without this

You already ran the real bug above — Test A's value silently corrupted by
Test B, through nothing but both touching the same Singleton. That
demonstration *is* this lesson's "what breaks," proven before the
alternative, not after.

### Exercises

- Reproduce the exact test-pollution bug yourself, then apply the DI fix
  and confirm the bug is gone.
- Look through this project's own code so far — is there anywhere a
  Singleton might have felt tempting, that Dependency Injection already
  handled instead? Name the specific spot.

### Definition of done

- [ ] You built and ran the real Singleton, including its locked-down
      constructor, verified with a real compile error.
- [ ] You triggered the real test-pollution bug yourself, not just read
      about it.
- [ ] You confirmed the DI-based fix genuinely resolves it, with real
      output showing Test A unaffected by Test B.
- [ ] You can state, honestly and specifically, the one real case where
      Singleton might still be the right call, and why game settings isn't
      that case.
- [ ] Commit: `git commit -m "Demonstrate Singleton's real cost and confirm this project uses Dependency Injection instead"`.
