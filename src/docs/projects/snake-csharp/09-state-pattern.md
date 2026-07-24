# Lesson 9: Illegal Transitions Become Impossible to Write

*(The State Pattern)*

**User Story**
> As a player, I want the game to move cleanly between a menu, playing,
> paused, and game-over — with no way to, say, pause a game that hasn't
> started.

**What you will build**
A real, working state machine for the game's overall flow — the first of
this project's named design patterns, and the direct foundation Lesson 17's
full menu system builds on.

**What you need to know first**
Lesson 5's interfaces and Lesson 8's abstract-vs-interface distinction —
the State pattern is a specific, well-known *use* of interfaces you already
know how to build.

---

## Concept Unit: The Problem With Boolean Flags

### The Problem

A tempting, naive way to track "what mode is the game in" is a handful of
independent `bool`s: `isPlaying`, `isPaused`, `isGameOver`. This looks
simple and quickly becomes a real liability: nothing stops `isPlaying` and
`isGameOver` from both being `true` at once — a combination that means
nothing, that the rest of the code now has to defensively check for
everywhere it matters, forever. Every new state you add multiplies the
number of nonsensical combinations that were never supposed to be possible
but now technically are.

### The fix, stated directly

Represent "what state the game is in" as **one single object**, of a type
that can only ever be one specific state at a time — not several
independent flags that happen to usually agree with each other.

---

## Concept Unit: Each State as Its Own Class

### The New Code

```csharp
interface IGameState
{
    IGameState HandleInput(string input);
}

class MenuState : IGameState
{
    public IGameState HandleInput(string input) => input == "start" ? new PlayingState() : this;
}

class PlayingState : IGameState
{
    public IGameState HandleInput(string input) => input switch
    {
        "pause" => new PausedState(),
        "lose" => new GameOverState(),
        _ => this
    };
}

class PausedState : IGameState
{
    public IGameState HandleInput(string input) => input == "start" ? new PlayingState() : this;
}

class GameOverState : IGameState
{
    public IGameState HandleInput(string input) => this;
}

class GameStateMachine
{
    public IGameState CurrentState { get; private set; } = new MenuState();
    public void HandleInput(string input)
    {
        CurrentState = CurrentState.HandleInput(input);
    }
}
```

Run it:

```csharp
var machine = new GameStateMachine();
Console.WriteLine($"Starting state: {machine.CurrentState.GetType().Name}");
machine.HandleInput("start");
Console.WriteLine($"After 'start': {machine.CurrentState.GetType().Name}");
machine.HandleInput("pause");
Console.WriteLine($"After 'pause': {machine.CurrentState.GetType().Name}");
machine.HandleInput("start");
Console.WriteLine($"After 'start' again: {machine.CurrentState.GetType().Name}");
machine.HandleInput("lose");
Console.WriteLine($"After 'lose': {machine.CurrentState.GetType().Name}");
machine.HandleInput("pause");
Console.WriteLine($"After invalid 'pause' from GameOver: {machine.CurrentState.GetType().Name}");
```

Real output — verified this session:

```text
Starting state: MenuState
After 'start': PlayingState
After 'pause': PausedState
After 'start' again: PlayingState
After 'lose': GameOverState
After invalid 'pause' from GameOver: GameOverState
```

*What this proves:* the last line is the actual point of this whole
pattern — sending `"pause"` to a game that's already over does *nothing*,
because `GameOverState.HandleInput` was written to ignore every input and
just return itself. There's no `bool` combination to get wrong here,
because there's no `bool` at all — `CurrentState` is always, provably,
exactly one real object, and only that object decides what a valid next
state even is.

### Mechanical walkthrough

1. `interface IGameState { IGameState HandleInput(string input); }` — (hard
   concept reappearing, notable new detail) a message contract whose
   return type is *the interface itself* — each state, given an input,
   returns whichever state should come next, including possibly itself
   unchanged.
2. `public IGameState HandleInput(string input) => input == "start" ? new PlayingState() : this;`
   — (hard concept reappearing) `MenuState`'s entire transition logic in
   one expression-bodied method (Lesson 6's `=>` syntax) — `"start"`
   produces a brand-new `PlayingState`; anything else returns `this`
   (Lesson 0's `this`, referring to the current, unchanged `MenuState`
   instance) — staying put.
3. `input switch { "pause" => ..., "lose" => ..., _ => this }` —
   (hard concept reappearing) `PlayingState` has two valid transitions and
   a default of "stay here" for anything else.
4. `GameOverState.HandleInput` always returns `this` — deliberately, for
   now: there's genuinely no way out of game over yet in this project,
   which Lesson 17's real menu, adding a `"restart"` transition, changes
   honestly rather than pretending this class already handles it.
5. `public IGameState CurrentState { get; private set; } = new MenuState();`
   — (hard concept reappearing) an auto-property with a default value,
   `private set` so only `GameStateMachine` itself can change which state
   is current.

### CS Lens

This is the **State pattern** — modeling "what mode is this system in" as a
family of interchangeable objects, each one owning its own valid
transitions, rather than as data (flags, an `enum` alone) checked by
scattered `if` statements elsewhere. The interface guarantees, at compile
time, that every state knows how to answer "what happens next" for any
input — there's no code path where nobody decided what should happen.

Also recognized in: TCP's own connection states (`LISTEN`, `SYN_SENT`,
`ESTABLISHED`, each with its own valid next states), traffic light
controllers, and this curriculum's WPF and Kotlin courses' own UI
navigation, where "which screen is currently active" is exactly this same
shape of problem.

### SE Lens

Compare directly to the boolean-flags version this unit opened by
rejecting: with flags, "is a pause valid right now" has to be checked
everywhere pausing might be requested, by re-deriving "are we currently
playing" from whichever combination of `bool`s happens to be true. With
the State pattern, that same question is answered in exactly one
place — `PlayingState`'s own `HandleInput` — and every other state
answers it independently and correctly by simply not having a `"pause"`
case at all. Illegal transitions aren't checked for and rejected; they're
structurally impossible to accidentally implement in the first place.

### Connection

Lesson 17 wires this exact state machine into the real game loop —
`GameStateMachine.CurrentState` decides whether the loop is currently
drawing a menu, running gameplay, or showing a paused overlay.

---

## Closing

### Connect the pieces

Boolean flags (unit 1) allow nonsensical combinations by construction.
`IGameState` (unit 2) makes "what state am I in" exactly one real object at
a time, with each state class owning its own valid transitions — verified
directly by sending an invalid input to a terminal state and confirming
nothing happens, rather than trusting a scattered `if` check to catch it.

### What breaks without this

Add a `bool isPlaying` and a `bool isPaused` side by side, and imagine (or
actually write) code that sets both to `true` by a bug — some code path
pauses without first checking `isPlaying`, say. Real, observable
consequence: the game now claims to be simultaneously playing and paused,
and every piece of code that checks one flag without the other has to
guess which one is "really" true. The `IGameState` version makes this
specific bug structurally impossible — there is no way to be in two states
at once, because `CurrentState` is a single reference, not a set of
independent flags.

### Exercises

- Add a `"quit"` input to `PlayingState` and `PausedState`, both
  transitioning to a new `QuitConfirmState` — decide what that new state's
  own valid transitions should be.
- Trace the six `HandleInput` calls in the verified example by hand,
  writing down which state each one starts and ends in, before checking
  it against the real output above.

### Definition of done

- [ ] The state machine correctly transitions through menu, playing,
      paused, and game-over, verified with real output.
- [ ] An invalid input to a terminal state does nothing, verified
      directly.
- [ ] You can explain, in your own words, why this is structurally safer
      than a handful of independent `bool` flags, with a concrete example
      of what the flags version could get wrong.
- [ ] Commit: `git commit -m "Add the State pattern for game flow — menu, playing, paused, game over"`.
