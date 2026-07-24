# Lesson 17: Closing the Gap, Honestly

*(A Real Menu — Composing Everything Into One Game Loop)*

**User Story**
> As a player, I want a real start screen, a pause overlay, and the option
> to restart after losing — a complete game, start to finish.

**What you will build**
No new C# construct — this lesson is entirely about composition: wiring
Lesson 9's state machine into the real rendering loop, and closing the one
gap that lesson deliberately left open — there was previously no way out of
`GameOverState` at all.

**What you need to know first**
Every lesson so far, especially Lesson 9's `IGameState`. This is the
"everything comes together" lesson before this project's remaining polish
epic.

---

## Concept Unit: Closing the Honest Gap — `GameOverState`'s Missing Exit

### The Problem

Lesson 9's `GameOverState.HandleInput` always returned `this`, stated
directly at the time as a real, temporary limitation: there was genuinely
no way back to a fresh game yet. A real, finished game needs one.

### The New Code

```csharp
class GameOverState : IGameState
{
    public IGameState HandleInput(string input) => input == "restart" ? new MenuState() : this;
    public string ScreenText() => "=== GAME OVER ===\nPress R to return to menu";
}
```

Run the full sequence:

```csharp
var machine = new GameStateMachine();
void Report(string label) => Console.WriteLine($"{label}: {machine.CurrentState.GetType().Name}");

Report("start");
machine.HandleInput("start");
Report("after start");
machine.HandleInput("lose");
Report("after lose");
machine.HandleInput("restart");
Report("after restart");
```

Real output — verified this session:

```text
start: MenuState
after start: PlayingState
after lose: GameOverState
after restart: MenuState
```

*What this proves:* the full cycle — menu, play, lose, restart back to
menu — now works completely, with `"restart"` being the one specific,
deliberate input `GameOverState` finally answers.

### SE Lens

Naming this gap honestly back in Lesson 9, rather than either pretending
it was already handled or quietly working around it, is worth reflecting
on directly: a real engineer regularly ships a feature with a known,
stated limitation, and closes it later, deliberately, once the rest of the
system around it actually exists to make the fix meaningful (a restart
needs somewhere real to restart *to* — which didn't fully exist until this
project had a complete menu-to-game-over cycle worth returning to).

---

## Concept Unit: `ScreenText()` — Each State Owns Its Own Display

### The New Code

```csharp
interface IGameState
{
    IGameState HandleInput(string input);
    string ScreenText();
}
```

*What this adds:* every state now also answers "what should currently be
shown on screen" — `MenuState` returns a title screen, `PlayingState`
signals live gameplay is rendering, `PausedState` returns a paused
overlay, `GameOverState` returns the game-over message. `IGameState` grew
a second message every implementation must answer, exactly the same
compiler-checked way `HandleInput` already was.

### The Updated Project

```csharp
while (true)
{
    if (machine.CurrentState is PlayingState)
    {
        RunOneGameplayTick(machine);
    }
    else
    {
        Console.Clear();
        Console.WriteLine(machine.CurrentState.ScreenText());
        string input = ReadMenuInput();
        machine.HandleInput(input);
    }
}
```

### Mechanical walkthrough

1. `machine.CurrentState is PlayingState` — (first appearance) the **`is`
   pattern** — checks whether `CurrentState`'s actual runtime type is
   specifically `PlayingState`, used here to decide whether the real-time
   gameplay loop (Lessons 1–4) or the simpler menu-input loop should run
   this iteration.
2. Everything else in this block reuses lessons already complete:
   `RunOneGameplayTick` is Lessons 1–4's loop, and the `else` branch is a
   simple, turn-based menu — no real-time polling needed there, since a
   menu can afford to just wait for one key press at a time.

### CS Lens

This is the practical completion of Lesson 9's State pattern: the *game
loop itself* now asks the current state what to display and how to behave,
rather than the loop containing its own separate `if` logic for "are we in
a menu or playing right now." Each state genuinely owns both its
transitions (`HandleInput`) and its own presentation (`ScreenText`) —
nothing about "what a paused game looks like" lives anywhere except
`PausedState` itself.

### Connection

This is the last piece needed for a complete, playable game, start to
finish — everything remaining in this project (Lessons 18–20) is
extension and polish on top of a genuinely finished core.

---

## Closing

### Connect the pieces

`GameOverState` (unit 1) finally answers `"restart"`, closing the one gap
Lesson 9 named honestly rather than hid. `ScreenText()` (unit 2) gives
every state ownership of its own display, letting the main loop simply ask
the current state what to show, rather than branching on game mode itself.
Together, this is a complete, playable game: menu, play, pause, lose,
restart, indefinitely.

### What breaks without this

Remove the `"restart"` case, restoring `GameOverState.HandleInput` to
always return `this`. Real, observable consequence: the game is
permanently stuck on the game-over screen the instant it's reached, for
the rest of the program's life — no input at all can escape it, exactly
Lesson 9's originally-honest limitation, now felt directly instead of just
described.

### Exercises

- Add a `"quit"` input to `MenuState`, exiting the entire program cleanly.
- Play a complete game, start to finish — menu, movement, growth,
  collision, game over, restart — and confirm every piece from every
  lesson so far still works together correctly.

### Definition of done

- [ ] The full game cycle — menu, play, pause, lose, restart — works
      correctly, verified by actually playing it.
- [ ] You can explain, in your own words, why closing `GameOverState`'s
      gap only made sense once the rest of the game flow existed.
- [ ] Commit: `git commit -m "Complete the game flow — add restart, wire state machine into the real rendering loop"`.
