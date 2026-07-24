# Lesson 11: Declare What Messages You Need Answered, Not Who Answers Them

*(Dependency Injection)*

**User Story**
> As a developer, I want the game engine to render to a real console or a
> fake test double, with zero changes to the engine itself.

**What you will build**
A game engine class that never constructs its own renderer — it's simply
handed one, from outside, at the moment it's created. This is the pattern
most real .NET frameworks (ASP.NET Core most of all) are built entirely
around, and it's a direct, structural answer to the same question Lesson 10
answered for events: how does one object use another without needing to
know its concrete details?

**What you need to know first**
Lesson 5's interfaces and Lesson 10's decoupling argument — this lesson
applies the identical reasoning to *constructing* objects, not just
*notifying* them.

---

## Concept Unit: The Rigid Version, First

### The Problem

Worth seeing the tightly-coupled default before the fix, exactly as
Lesson 10 did.

### Introduce the concept in isolation

```csharp
class RigidGameEngine
{
    private ConsoleRenderer renderer = new ConsoleRenderer();
    public void RenderFrame(string message) => renderer.Draw(message);
}

interface IRenderer { void Draw(string message); }
class ConsoleRenderer : IRenderer { public void Draw(string message) => Console.WriteLine($"[Console] {message}"); }
```

Run it:

```csharp
var rigid = new RigidGameEngine();
rigid.RenderFrame("Hello from rigid engine");
```

Real output — verified this session:

```text
[Console] Hello from rigid engine
```

*What this proves:* this works. The problem, precisely: `RigidGameEngine`
creates its *own* `ConsoleRenderer`, directly, inside itself
(`new ConsoleRenderer()`). There is no way to make `RigidGameEngine` render
anywhere else — a test, a file, anything but a real console — without
editing `RigidGameEngine`'s own source code. The dependency is baked in,
permanently, at the exact point it's needed.

---

## Concept Unit: Constructor Injection — Declare, Don't Construct

### The New Code

```csharp
class FlexibleGameEngine
{
    private readonly IRenderer renderer;
    public FlexibleGameEngine(IRenderer renderer) { this.renderer = renderer; }
    public void RenderFrame(string message) => renderer.Draw(message);
}

class FakeTestRenderer : IRenderer
{
    public List<string> DrawnMessages = new();
    public void Draw(string message) => DrawnMessages.Add(message);
}
```

Run it, with two genuinely different renderers:

```csharp
var real = new FlexibleGameEngine(new ConsoleRenderer());
real.RenderFrame("Hello from flexible engine, real renderer");

var fake = new FakeTestRenderer();
var testable = new FlexibleGameEngine(fake);
testable.RenderFrame("Hello from flexible engine, fake renderer");
Console.WriteLine("Fake captured: " + string.Join(" | ", fake.DrawnMessages));
```

Real output — verified this session:

```text
[Console] Hello from flexible engine, real renderer
Fake captured: Hello from flexible engine, fake renderer
```

*What this proves:* **the exact same `FlexibleGameEngine` class**, with
zero changes, zero recompilation of its own logic, rendered to a real
console in one case and to an in-memory list of captured strings in the
other. The engine itself never contains the word `ConsoleRenderer`
anywhere — it only knows about `IRenderer`, the message contract, and
trusts whoever creates it to supply something that fulfills that contract.

### Mechanical walkthrough

1. `private readonly IRenderer renderer;` — (first appearance in this
   shape) `readonly` means this field can only be assigned once, inside
   the constructor, and never changed again afterward — a real, checked
   guarantee that `FlexibleGameEngine` won't quietly swap renderers
   mid-use.
2. `public FlexibleGameEngine(IRenderer renderer) { this.renderer = renderer; }`
   — (first appearance, named) **constructor injection** — the dependency
   (`IRenderer`) is a required constructor parameter, not something the
   class goes and constructs for itself. `FlexibleGameEngine` cannot even
   be created without *something* fulfilling `IRenderer` being handed in.
3. `new FlexibleGameEngine(new ConsoleRenderer())` — the caller, outside
   `FlexibleGameEngine` entirely, decides which concrete `IRenderer` to
   actually use.
4. `FakeTestRenderer` — a second, completely independent implementation of
   `IRenderer`, whose entire job is remembering what it was told to draw,
   instead of actually drawing anything — useful for exactly one
   purpose: letting a test check what the engine *tried* to render,
   without needing a real console at all.

### CS Lens

This is **Dependency Injection** — a class declares what it needs (via its
constructor parameters' types) and receives a concrete implementation from
outside, rather than constructing its own dependencies internally. This is
the same messaging idea from Lesson 0 and Lesson 10, applied specifically
to *object construction*: `FlexibleGameEngine` doesn't need to know how to
build an `IRenderer` — it only needs to know what message (`Draw`) it can
send to whatever `IRenderer` it's given.

### SE Lens — why frameworks are built around this

This is the exact mechanism behind ASP.NET Core's built-in **DI
container** — when you write a web API controller with a constructor
parameter like `IEmailService emailService`, you're doing precisely what
`FlexibleGameEngine` does here: declaring a dependency by its interface,
never constructing it yourself. The framework's DI container is
responsible for deciding, at startup, which concrete class actually
fulfills `IEmailService` for the whole application, and handing the right
instance to every constructor that asks for one. This project's version is
deliberately manual — you write `new FlexibleGameEngine(new
ConsoleRenderer())` yourself — specifically so the underlying mechanism is
completely visible, rather than hidden behind a framework's automatic
wiring; a real DI container (`Microsoft.Extensions.DependencyInjection`,
used throughout ASP.NET Core) automates exactly this pattern at a larger
scale, registering "when something asks for `IRenderer`, give it a
`ConsoleRenderer`" once, centrally, instead of writing `new` at every call
site.

The real, honest cost: every class in a heavily-DI'd codebase ends up with
a constructor listing several interface parameters, and tracing "what
actual concrete class handles this at runtime" requires knowing where that
wiring decision was made — a real, sometimes genuinely confusing tradeoff
against the flexibility gained. Lesson 14 revisits this tradeoff directly,
contrasting it with Singleton, the pattern many developers reach for
instead — usually incorrectly.

### Connection

Lesson 15's unit tests are the concrete payoff promised here — testing
`FlexibleGameEngine`'s actual behavior using `FakeTestRenderer`, with no
real console, no real terminal, and no real game running at all.

---

## Closing

### Connect the pieces

`RigidGameEngine` (unit 1) works but permanently hardcodes its own
concrete dependency. `FlexibleGameEngine` (unit 2) declares only an
interface dependency, supplied by whoever constructs it — proven directly
by swapping in a completely different `IRenderer` implementation with zero
changes to the engine's own code, and by capturing what would otherwise be
real console output into a plain list for later inspection.

### What breaks without this

Try writing a test that checks `RigidGameEngine` actually rendered a
specific message. Real, observable difficulty: there is no way to do this
without genuinely printing to a real console during the test and somehow
capturing that output externally — `RigidGameEngine` gives you no seam to
intercept its rendering at all, because its dependency is hardcoded
internally. `FlexibleGameEngine`, by contrast, can be tested by simply
handing it a `FakeTestRenderer` and checking what ended up in
`DrawnMessages` — no console involved anywhere.

### Exercises

- Add a second interface dependency to `FlexibleGameEngine` — an
  `IInputSource` supplying key presses — following the exact same
  constructor-injection pattern, and give it both a real
  (`Console.ReadKey`-based) and fake (a pre-programmed sequence of test
  moves) implementation.
- Explain, in your own words, why `readonly` on the `renderer` field is a
  meaningful guarantee, not just a style preference — what would break, or
  become harder to reason about, without it?

### Definition of done

- [ ] `FlexibleGameEngine` renders correctly to both a real
      `ConsoleRenderer` and a `FakeTestRenderer`, verified with real
      output for both.
- [ ] You can explain, concretely, what an ASP.NET Core DI container
      automates that this lesson's manual `new FlexibleGameEngine(new
      ConsoleRenderer())` does by hand.
- [ ] You can state, in your own words, why `RigidGameEngine` is
      genuinely harder to test, not just "worse style."
- [ ] Commit: `git commit -m "Refactor to constructor-based Dependency Injection — the engine no longer constructs its own renderer"`.
