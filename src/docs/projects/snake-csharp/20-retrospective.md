# Lesson 20: A Retrospective, Not a Feature

**No new feature, no new concept.** Every construct in this course — from
`var` and `List<T>` in Lesson 0 to `Grid<T>` in Lesson 18 and data-driven
levels in Lesson 19 — has already been introduced, verified, and used for
real. This lesson is what Lesson 0 promised at the very start: revisiting
Alan Kay's messaging idea now that you have an entire finished project to
point at, instead of one lesson's worth of code.

**What you need to know first:** every lesson, 0 through 19 — this is a
full-project pass, not a new slice. There is no new game feature here; the
capstone *is* the reflection.

---

## Pass 1: Find Messaging, For Real, in Your Own Code

Go back to Lesson 0's framing: Kay's own words were that OOP's "big idea"
is messaging — independent objects, each controlling its own internals
completely, communicating only by sending each other messages neither
side has to understand the internals of. Now find it, concretely, in code
you actually wrote:

- Where does one object call a method on another, without knowing or
  caring what concrete type answers it? (Lesson 5's `IDrawable`, Lesson
  7's `IMovable`/`ICollidable` are the clearest examples — but look for
  others.)
- Where does an object *broadcast* something happened, with no idea who
  (if anyone) is listening? (Lesson 10's `ScoreChanged` event — the
  strongest, most direct realization of Kay's idea in this entire
  project.)
- Where does an object *declare what it needs* rather than construct it
  itself? (Lesson 11's `IRenderer`, injected rather than `new`'d directly.)

Write down, in your own words, at least three specific places — this is
exactly the closing claim this project's own Definition of Done asks for,
and it's worth actually being able to answer, not just recognize.

## Pass 2: Play the Whole Game, End to End

Run it for real: menu → movement → growth → a wall or self collision →
game over → restart → quit. Confirm, honestly:

- Does the AI opponent (Lesson 12's Strategy pattern) still swap cleanly
  with human input?
- Do all three food types (Lesson 13's Factory) still spawn correctly?
- Does the high score (Lesson 16) still survive closing and reopening the
  game?
- Do the difficulty levels (Lesson 19) actually feel harder as your score
  climbs?

A passing `dotnet test` (Lesson 15) is strong evidence every piece works
in isolation — playing the entire game once, start to finish, is the
human check an automated suite can't fully replace, the same standard
this curriculum's Bowling Game project closed on.

## Pass 3: The One Thing This Session Couldn't Verify For You

Lesson 1 onward flagged this honestly: `Console.SetCursorPosition` and
real-time input via `Console.KeyAvailable` can't be verified by pasting
output from a sandboxed session — they need a real terminal. Now that the
whole game is built, actually run it in your own terminal, not just read
the lessons that described it. Does the board render as a clean, static
grid rather than scrolling text? Does the snake respond immediately to
arrow keys without needing Enter pressed? If something looks wrong, this
is the moment to debug it against real, live console behavior — every
piece of *logic* underneath it was already verified for real, all session
long, so a bug here is almost certainly in the console-specific plumbing,
not the game rules themselves.

## Pass 4: Write Your Own Retrospective

In your own words, write down:

- Which design pattern, of the six covered (State, Pub/Sub, Dependency
  Injection, Strategy, Factory, Singleton), felt most natural once you'd
  actually built it — and which still feels like it's solving a problem
  you wouldn't have noticed yourself?
- Lesson 14 showed Singleton's real cost with a genuine test-pollution
  bug, not just an abstract warning. Has that changed how you'd react the
  next time you're tempted to reach for a global, shared instance?
- Lesson 0 named "messaging" as the point of OOP, before you'd written a
  single class. Now that the project is finished — do you actually
  believe that framing, or do you think classes-and-inheritance is still
  the more natural way to describe what you built? Either honest answer
  is a real, useful one.

This retrospective is itself the deliverable — the same standard this
curriculum's other courses close on: a developer revisiting their own
finished work with better judgment than they had while building it.

---

## Where to Go Next — Extensions Left Deliberately Unbuilt

Every one of these was named honestly, in the lesson that touched it, as a
real, deliberate scope cut rather than something hidden:

- **A second player, competing locally** — the AI Strategy from Lesson 12
  already proves swappable input sources work; a second human-controlled
  snake is a natural next step, not a redesign.
- **A real GUI port** — this curriculum's WPF (`../pocket-inventory-wpf/`)
  and Android/Kotlin courses both show what a graphical version of an
  app looks like on two different platforms; porting this project's game
  logic (`Snake`, `Board`, `ScoreTracker`) behind a real UI, with
  `IRenderer` (Lesson 11) swapped for a graphical implementation instead
  of the console one, is the most direct payoff Dependency Injection could
  still offer.
- **Command pattern** — undo/redo for a puzzle-mode variant, or replay of
  a full game from a recorded input log; not covered in this project, and
  a natural next pattern to explore using the exact same "message, not
  method call" framing Lesson 0 started with.
- **Decorator pattern** — a food type that temporarily wraps the snake
  with a new behavior (invincibility, double points) without subclassing
  `Snake` itself; a genuinely different way of composing behavior than
  Lesson 13's Factory, worth comparing directly against it.
- **Networked multiplayer** — the real, distributed version of Kay's
  original biological/networked-computer metaphor from Lesson 0: objects
  on genuinely separate machines, communicating only by message, with no
  shared memory at all.

## Definition of Done — For the Whole Course

- [ ] Every lesson's own Definition of Done, from Lesson 0 through Lesson
      19, is actually checked off, not just written.
- [ ] You played the complete game, start to finish, in your own real
      terminal — not just read the lessons describing it.
- [ ] You can point to at least three specific places in your own code
      where Kay's messaging idea is the actual mechanism at work, not just
      quote the idea back.
- [ ] You've written your own honest retrospective, in your own words, not
      a restatement of this lesson's prompts.
- [ ] You've picked at least one extension from the list above and either
      built it or written down a concrete plan for building it yourself.
- [ ] Commit: `git commit -m "Retrospective — Snake v1 complete"`.

---

*The same closing note every project in this curriculum ends on: the game
was never the point. If you can explain, in your own words, why Alan Kay
regretted the word "objects," why an `event` with zero subscribers is
still perfectly valid code, why Dependency Injection made Lesson 15's
tests possible at all, and why Singleton's real cost is something you
watched happen rather than took on faith — you've learned both C#'s own
syntax from a blank start and the actual idea object-oriented programming
was originally meant to name. The game itself, and the six patterns
inside it, are yours to keep extending, on your own, from here.*
