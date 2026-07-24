# Snake — Objects, Messages, and Design Patterns in C#

## What You Will Build

A real, playable Snake game running entirely in a terminal — no graphics library,
no game engine, just C# and the console. You'll go from a static grid on screen
to a fully working game with a growing snake, collision detection, an AI
opponent, high scores that survive closing the program, and a real menu —
built one small, playable increment at a time, so every lesson ends with
something you can actually run and enjoy, not just code that compiles.

**This project assumes nothing else in this curriculum.** No prior C#, no prior
OOP, no prior lessons — only real programming experience (loops, functions,
conditionals — whatever language you already know) and a willingness to learn
C#'s own syntax and .NET's console APIs from a blank start. It's designed to be
finishable in a focused week, not stretched across a term — lean and fast on
purpose, alongside the larger WPF and Android courses this curriculum already
has running on a slower clock.

## Why This Project, Why Now

Every other project in this curriculum's C#/Kotlin/Java tracks teaches OOP the
way it's usually taught: classes, inheritance, polymorphism, presented as a
toolkit of language features. This project teaches it differently, starting
from where the term itself came from.

**Alan Kay coined "object-oriented programming"** — and later said, more than
once, that he regretted the name, because it made people focus on *objects*
when the actual idea he meant was **messaging**. His own words, from a widely
quoted 2003 email: *"The big idea is 'messaging'... The key in making great and
growable systems is much more the design of how its modules communicate rather
than what their internal properties and behaviors should be."* His model came
from biological cells and networked computers — independent things, each
controlling its own internals completely, communicating only by sending each
other messages neither side has to understand the internals of.

This reframing isn't decoration — it's a genuinely better lens for the exact
question you asked: *why do real frameworks use Factory, Dependency Injection,
and Pub/Sub, and what problem are they actually solving?* Every one of those
patterns is a direct, practical answer to "how do independent objects
communicate without needing to know each other's concrete internals" — which is
Kay's original question, not a coincidence. This project builds that thread
explicitly, starting in Lesson 0 and returning to it by name every time a new
pattern makes it concrete.

## Lesson Standard

Every lesson follows [`LESSON_CONTRACT.md`](../../LESSON_CONTRACT.md) and
[`LESSON SCHEMA.md`](../../LESSON%20SCHEMA.md) — concept labs, mechanical
walkthroughs, both lenses. Two things specific to this project:

- **Agile delivery is the whole point here.** Every single lesson, without
  exception, ends with a real, visible, playable change to the game — the
  "dopamine hit" this project is explicitly designed around. A lesson that
  only adds invisible infrastructure is a lesson in the wrong order.
- **The messaging thread is explicit, not implicit.** Interfaces, events, and
  dependency injection are each introduced with a direct callback to Lesson
  0's framing — "this is Kay's messaging idea, here, concretely" — not left
  for you to notice on your own.

## Lesson 0 — C# Fundamentals, and What "Object-Oriented" Actually Means

No user story — the one lesson with no visible game yet, because nothing else
can start without it. Covers real C#-specific syntax (`var` and static typing,
methods, string interpolation, `List<T>`, project setup via `dotnet new
console`) assuming real programming experience in some other language but zero
C#. Closes with Alan Kay's messaging framing, stated directly and connected to
what a C# method call actually is: one object sending another a message it
doesn't have to understand the internals of.

→ [`00-csharp-fundamentals-and-messaging.md`](00-csharp-fundamentals-and-messaging.md)

---

## Epic 1 — First Playable Slice

| # | You Build | You Can See | New C# / .NET Concept | Lesson |
|---|---|---|---|---|
| 1 | A static game board | A drawn grid in the terminal | `Console.SetCursorPosition`, a `Position` record | [01](01-the-game-board.md) |
| 2 | A snake that moves | A single segment moving in real time under arrow-key control | `Console.ReadKey`/`KeyAvailable`, a real-time game loop, `enum Direction` | [02](02-a-snake-that-moves.md) |
| 3 | Growing on food | Eating food makes the snake longer, food respawns randomly | `LinkedList<Position>` (and why, over `List<Position>`), `Random` | [03](03-growing-on-food.md) |
| 4 | Game over | Hitting a wall or yourself ends the game with a real message | Collision detection, a first `bool` game-state flag (soon to be replaced) | [04](04-game-over.md) |

## Epic 2 — Objects That Send Each Other Messages

| # | Concept | You Can See | The Messaging Connection | Lesson |
|---|---|---|---|---|
| 5 | Interfaces as message contracts | The snake and food both "know how to draw themselves," called through one shared method | `interface IDrawable` — a promise about what message an object answers, regardless of its concrete type | [05](05-interfaces-as-message-contracts.md) |
| 6 | Encapsulation via properties | Nothing outside `Snake` can corrupt its own body list directly | C# properties (`get`/`set`), read-only fields — an object controlling how it responds to a "give me your state" message | [06](06-encapsulation-via-properties.md) |
| 7 | More message contracts | Collision code works on *anything* collidable, not just the snake | `IMovable`, `ICollidable`, multiple interfaces on one class | [07](07-movable-and-collidable.md) |
| 8 | Abstract classes vs. interfaces | A shared `GameObject` base for common behavior, interfaces for pure contracts | When a message contract needs *some* shared implementation vs. none at all | [08](08-abstract-classes-vs-interfaces.md) |

*(Lessons 6 and 8 are swapped from the original sketch below — see
"Deviations from the original roadmap sketch" in
[`CURRICULUM_NOTES.md`](CURRICULUM_NOTES.md).)*

## Epic 3 — Design Patterns: What Frameworks Actually Use

| # | Pattern | You Can See | Why Frameworks Use This | Lesson |
|---|---|---|---|---|
| 9 | State | Menu → Playing → Paused → Game Over, as real objects instead of a tangle of booleans | Illegal state transitions become impossible to write, not just discouraged | [09](09-state-pattern.md) |
| 10 | Publish/Subscribe | Score changes update the display *and* an achievement tracker, neither knowing the other exists | Kay's messaging idea, realized directly: C# `event`/`Action<T>`, the mechanism behind every UI framework's event system and every pub/sub message queue | [10](10-publish-subscribe.md) |
| 11 | Dependency Injection | The exact same game engine renders to the real console *or* a fake test double, with no code change to the engine | Objects declare what messages they need answered (an interface), instead of constructing their own concrete dependencies — the mechanism behind ASP.NET Core's, and most frameworks', DI container | [11](11-dependency-injection.md) |
| 12 | Strategy | An AI-controlled snake plays against you, swappable with human input at runtime | Interchangeable behavior behind one interface — same idea as Lesson 5, applied to *behavior* instead of *data* | [12](12-strategy-pattern.md) |
| 13 | Factory | Three different food types spawn, each with different rules, from one call site | Centralizing "which concrete type do I actually need right now" so callers never have to know | [13](13-factory-pattern.md) |
| 14 | Singleton — and why it's usually wrong | A shared high-score tracker, then a demonstration of exactly what it breaks | The pattern everyone's told to use and almost never should — replaced with Lesson 11's DI, honestly compared | [14](14-singleton-critique.md) |

## Epic 4 — Testing and Persistence

| # | Concept | You Can See | New Concept | Lesson |
|---|---|---|---|---|
| 15 | Unit testing the game logic | Collision and scoring logic tested and verified with zero console involved | `xUnit`, `dotnet test` — made possible specifically by Lesson 11's dependency injection | [15](15-unit-testing.md) |
| 16 | High score persistence | Your best score survives closing the game | File I/O, simple JSON serialization | [16](16-high-score-persistence.md) |
| 17 | A real menu, tying it together | Start, pause, restart, quit — a complete, real game flow | Composing Lesson 9's `State` pattern into a full application loop | [17](17-a-real-menu.md) |

## Epic 5 — Polish and Where to Go Next

| # | Concept | You Can See | New Concept | Lesson |
|---|---|---|---|---|
| 18 | Generics, for real | A reusable, type-safe grid structure powering the board | Your own generic class, not just `List<T>` used as a given | [18](18-generics-for-real.md) |
| 19 | Difficulty and levels | Speed increases, obstacles appear | Tuning gameplay via data, not scattered magic numbers | [19](19-difficulty-and-levels.md) |
| 20 | Retrospective | — | Capstone — no new concept; extension ideas (multiplayer, a GUI port to this curriculum's WPF or Compose courses, more patterns to explore solo: Command, Decorator) | [20](20-retrospective.md) |

## Definition of Done

- The game is fully playable start to finish: menu, movement, growth, collision,
  game over, restart.
- At least one interface has two genuinely different implementations swapped at
  runtime (the AI/human input strategy, and the real/fake renderer).
- The score system uses a real publish/subscribe event, with at least two
  independent subscribers.
- Game logic is unit tested without a console involved, made possible by
  dependency injection.
- High scores persist across restarts.
- You can explain, concretely, Alan Kay's messaging idea, and point to at least
  three places in your own code where it's the actual mechanism at work — not
  just quote the idea back.

## Status

All 21 lessons written (Lesson 0 through Lesson 20). Every C# snippet
across all 21 lessons was actually compiled and run this session via real
`dotnet run`/`dotnet test` — including both full Dependency Injection
designs compared in Lesson 11, the real Singleton test-pollution bug
triggered and fixed in Lesson 14, and real `xUnit` tests (via `dotnet new
xunit`) in Lesson 15. The one honest exception: `Console.SetCursorPosition`
and real-time `Console.KeyAvailable` input (Lessons 1–2 onward) can't be
verified by pasting output from a sandboxed session — those lessons are
written from accurate, established knowledge of the real API and flagged
directly as needing confirmation in your own terminal, exactly as Lesson
20's retrospective asks you to do.
