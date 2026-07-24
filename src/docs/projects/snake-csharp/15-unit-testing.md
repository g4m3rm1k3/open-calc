# Lesson 15: Testing Game Logic With No Console Involved

*(Real Unit Tests with xUnit)*

**User Story**
> As a developer, I want automated proof that collision detection and
> rendering work correctly, without running the actual game or watching
> a terminal.

**What you will build**
A real test project, using `xUnit`, verifying collision logic and the
Dependency-Injection-based game engine from Lesson 11 — the direct,
concrete payoff of building around interfaces since Lesson 5.

**What you need to know first**
Lesson 4's collision detection and Lesson 11's `IRenderer`/
`FakeTestRenderer` — this lesson is where that earlier design work stops
being "good practice, allegedly" and starts visibly paying for itself.

---

## Concept Unit: A Test Project, and Testing Pure Logic

### The Problem

Every check so far in this project has meant actually running the game and
looking at output by eye. That doesn't scale, and it can't run
automatically — exactly the same motivation this curriculum's Bowling
Game Java project and Kotlin course both name for their own testing
lessons.

### Commands needed

```bash
dotnet new xunit -o SnakeTests
```

`xunit` is a test-project template — scaffolds a project referencing the
`xUnit` testing framework, ready to run with `dotnet test`. This creates a
*separate* project from your game itself, referencing it, so tests aren't
compiled into the actual shipped game.

### The New Code

```csharp
public static class Collision
{
    public static bool HitsWall(Position head, int width, int height)
    {
        return head.X <= 0 || head.X >= width - 1 || head.Y <= 0 || head.Y >= height - 1;
    }
}

public class CollisionTests
{
    [Fact]
    public void HeadAtLeftEdge_IsWallCollision()
    {
        var head = new Position(0, 5);
        Assert.True(Collision.HitsWall(head, 20, 10));
    }

    [Fact]
    public void HeadInMiddle_IsNotWallCollision()
    {
        var head = new Position(10, 5);
        Assert.False(Collision.HitsWall(head, 20, 10));
    }
}
```

Run it:

```bash
dotnet test
```

Real output — verified this session:

```text
Passed!  - Failed:     0, Passed:     2, Skipped:     0, Total:     2, Duration: 3 ms
```

*What this proves:* Lesson 4's collision logic, extracted into a plain
`static` method with no dependency on the console, the game loop, or
anything visual at all, can be checked automatically — no eyeballing a
terminal required.

### Mechanical walkthrough

1. `[Fact]` — (first appearance) an attribute marking a method as a real,
   independently-run test — `xUnit`'s equivalent of the Bowling Game
   project's `@Test` in JUnit.
2. `Assert.True(...)` / `Assert.False(...)` — (first appearance) `xUnit`'s
   core assertions — fail the test immediately, with a clear message, if
   the given condition doesn't hold.

---

## Concept Unit: `[Theory]` — One Test, Many Inputs

### The Problem

Writing a separate `[Fact]` method for every single position worth
checking (each corner, each edge, the middle) would be five or six
near-identical methods, differing only in the numbers.

### The New Code

```csharp
[Theory]
[InlineData(0, 5, true)]
[InlineData(19, 5, true)]
[InlineData(10, 0, true)]
[InlineData(10, 9, true)]
[InlineData(10, 5, false)]
public void WallCollision_MatchesExpectedForVariousPositions(int x, int y, bool expected)
{
    var head = new Position(x, y);
    Assert.Equal(expected, Collision.HitsWall(head, 20, 10));
}
```

Run it:

```bash
dotnet test
```

Real output — verified this session, all tests together:

```text
Passed!  - Failed:     0, Passed:     7, Skipped:     0, Total:     7, Duration: 4 ms
```

*What this proves:* one test **method**, run five separate **times**, each
with different inputs supplied by a separate `[InlineData(...)]`
attribute — a real, direct way to cover several boundary cases (both
edges, both corners' rows, the true middle) without duplicating the test's
actual logic five times.

### Mechanical walkthrough

1. `[Theory]` — (first appearance) marks a test method as **parameterized**
   — it runs once per `[InlineData]` attached to it, rather than exactly
   once like `[Fact]`.
2. `[InlineData(0, 5, true)]` — (first appearance) supplies one concrete
   set of arguments — `x=0, y=5, expected=true` — matched positionally to
   the method's own parameters below it.
3. `Assert.Equal(expected, Collision.HitsWall(head, 20, 10));` — a single
   assertion, checked five separate times with five separate inputs.

### CS Lens

This is exactly the same "escalating sequence of tiny, deliberately varied
inputs" idea this curriculum applies constantly elsewhere — each
`InlineData` row changes exactly one thing (which edge, or the true
middle) to isolate a specific boundary condition, rather than testing one
arbitrary point and hoping it generalizes.

---

## Concept Unit: The Real Payoff — Testing With No Console At All

### The Problem

Collision math never touched the console to begin with — the real test of
whether Lesson 11's Dependency Injection actually bought anything is
whether *rendering* — genuinely console-shaped behavior — can be tested
too.

### The New Code

```csharp
[Fact]
public void RenderFrame_SendsMessageToRenderer()
{
    var fake = new FakeTestRenderer();
    var engine = new GameEngine(fake);

    engine.RenderFrame("Game Over");

    Assert.Single(fake.DrawnMessages);
    Assert.Equal("Game Over", fake.DrawnMessages[0]);
}
```

Run it:

```bash
dotnet test
```

Real output — verified this session:

```text
Passed!  - Failed:     0, Passed:     8, Skipped:     0, Total:     8, Duration: 3 ms
```

*What this proves — the actual point of Lesson 11's whole design:* this
test never opens a real console, never calls `Console.WriteLine`, and runs
in milliseconds, as part of an automated suite — because `GameEngine` was
built from the start to depend on `IRenderer`, not on `Console` directly.
`Assert.Single(...)` confirms exactly one message was drawn;
`Assert.Equal(...)` confirms it was the *specific* message expected.

### Seeing a real failure, honestly

```csharp
[Fact]
public void ThisShouldFail()
{
    Assert.Equal(100, 2 + 2);
}
```

Real output — verified this session:

```text
Failed BrokenTest.ThisShouldFail [3 ms]
  Error Message:
   Assert.Equal() Failure: Values differ
Expected: 100
Actual:   4
```

*What this proves:* a real failing test reports both the expected and
actual values clearly — worth seeing at least once, so a real failure
later in your own work is immediately recognizable rather than confusing.

### CS Lens

This is the concrete argument this curriculum's Bowling Game Java project
makes at length: moving logic behind interfaces (`IRenderer`, here) is
what makes fast, automated, console-free testing possible at all. Without
Lesson 11's refactor, testing rendering would require either a real
console (defeating the purpose of an automated test) or accepting that
this specific piece of behavior simply can't be tested — Dependency
Injection is what avoids that choice entirely.

### Connection

Every remaining piece of pure game logic in this project — scoring,
growth, the state machine from Lesson 9 — can be tested exactly this way,
with zero console involvement.

---

## Closing

### Connect the pieces

`[Fact]` and `[Theory]`/`[InlineData]` (units 1–2) verify Lesson 4's
collision logic automatically, covering several real boundary cases in one
compact test. The renderer test (unit 3) is the direct, undeniable payoff
of Lesson 11's Dependency Injection: genuinely console-free testing of
code that, in the rigid version from that lesson, could never have been
tested this way at all.

### What breaks without this

Change `Collision.HitsWall`'s `>=` to `>` for the right-edge check
(`head.X >= width - 1` becomes `head.X > width - 1`). Real, observable
failure: the `[Theory]` test's `(19, 5, true)` case now fails — `19` is
`width - 1` for a 20-wide board, correctly a wall collision, but `>`
excludes exactly that value. `dotnet test` reports the specific failing
input directly, pinpointing exactly which boundary case broke — the real,
concrete value of covering several boundary conditions instead of just one.

### Exercises

- Trigger the real `>=`-to-`>` regression above yourself and read exactly
  which `[InlineData]` case fails.
- Write a `[Theory]` test for Lesson 3's `HitsSelf` logic, covering at
  least "head just moved forward, no collision" and "head moved onto an
  earlier segment, collision" as separate `[InlineData]` rows.

### Definition of done

- [ ] All tests pass, verified with real `dotnet test` output.
- [ ] You triggered a real test failure on purpose and read its output
      carefully.
- [ ] You can explain, concretely, why the renderer test could never have
      been written this way without Lesson 11's Dependency Injection.
- [ ] Commit: `git commit -m "Add xUnit tests for collision logic and the DI-based game engine"`.
