# Curriculum Notes — Snake (C#, Objects, Messages, Patterns)

Working notes for whoever writes Lessons 0–20 next (human or AI). `README.md` is
the roadmap; this file is the *why* and the technical groundwork already
verified, so it isn't rediscovered from scratch.

## Why this project exists, and why it's deliberately standalone

Written for a student who explicitly wants a project that **depends on no
other lesson in this curriculum** — unlike `../pocket-inventory-wpf/` (which
assumes nothing either, but is paced for a full term) and
`../bowling-game-tdd/` (a second, denser Java project), this one is meant to be
finishable in a single focused week, off-cycle from the WPF and Android
coursework the student is grinding through on a slower clock during the term.
Do not assume the WPF course's Lesson 0 (C# fundamentals) as a prerequisite,
even though the language overlaps — repeat what's genuinely needed here, but
keep it lean; this student already knows real programming (some other
language), just not C# or OOP specifically.

**Explicitly requested, mid-design, and now the spine of the whole course:**
Alan Kay's own framing of object-oriented programming as fundamentally about
**messaging** between independent objects, not about class hierarchies or
inheritance — and real coverage of Factory, Dependency Injection, and
Publish/Subscribe specifically, because the student named these as patterns
they keep hearing "frameworks use" without understanding why. Do not treat the
Kay framing as a one-time historical aside in Lesson 0 — it must be
explicitly re-invoked, by name, at Lesson 5 (interfaces), Lesson 10 (Pub/Sub —
the strongest, most direct realization of the idea), and Lesson 11
(Dependency Injection). If a later session drafts these lessons without that
explicit callback, it has lost the actual point of the reframing.

## The real Alan Kay quote and context, so it's cited accurately

From a widely-circulated 2003 email (often quoted from the "Squeak" /
Smalltalk mailing list context): *"I'm sorry that I long ago coined the term
'objects' for this topic because it gets many people to focus on the lesser
idea. The big idea is 'messaging'... The key in making great and growable
systems is much more the design of how its modules communicate rather than
what their internal properties and behaviors should be."* Kay's model was
explicitly biological/networked: objects like cells or networked computers,
each fully encapsulating its own state, communicating only via messages,
with late binding (the receiver decides how to respond, potentially
differently depending on its actual runtime type — this is polymorphism,
named plainly). When writing Lesson 0's treatment of this, ground it in a
concrete C# example immediately — a method call like `snake.Move(direction)`
*is* sending the `snake` object a `Move` message; the fact that C# spells it
as a method call rather than Smalltalk's literal message-send syntax
(`snake Move: direction`) is a syntax difference, not a conceptual one.

## Technical groundwork already verified this session

- **`Console.KeyAvailable` throws in non-interactive contexts** — verified
  directly: `System.InvalidOperationException: Cannot see if a key has been
  pressed when either application does not have a console or when console
  input has been redirected from a file.` This means the real-time input loop
  (Lesson 2 onward) cannot be verified by this curriculum's usual
  run-it-and-paste-the-output method in a sandboxed session — write those
  lessons from accurate, established knowledge of the real API, flagged
  honestly as needing verification in the student's own real terminal, the
  same honesty standard applied to WPF windows and Compose UI in this
  curriculum's other courses. Everything *not* touching live console input —
  which is most of the game's actual logic — can and should be verified for
  real, the same way the Bowling Game project verified plain Java.
- **`LinkedList<Position>` with `AddFirst`/`RemoveLast`** — verified, produces
  the correct head-to-tail order for snake growth and movement. This is a
  real, deliberate data-structure choice worth teaching explicitly at Lesson
  3: a `List<Position>` would need an O(n) shift to insert at the front every
  single move; `LinkedList<Position>` does the same operation in O(1). Don't
  present this as arbitrary — it's a genuine CS-lens teaching moment.
- **C# `event`/`Action<T>` pub/sub** — verified with a real `ScoreTracker`
  class and two independent subscribers, neither aware of the other, neither
  named by the publisher. This is the exact code shape Lesson 10 should
  build on.
- **Constructor-based Dependency Injection** — verified with a real
  `IRenderer` interface, a `ConsoleRenderer` and a `FakeTestRenderer`, both
  swapped into the same `FlexibleGameEngine` with zero changes to the engine
  itself, contrasted directly against a `RigidGameEngine` that hardcodes its
  own concrete dependency. This is the exact before/after Lesson 11 should
  use, and the `FakeTestRenderer` is exactly what Lesson 15's unit tests lean
  on.
- **Real `xUnit` via `dotnet new xunit` and `dotnet test`** — verified
  working, including a real passing test, in this environment (NuGet restore
  succeeds; network access is available in this session). Lesson 15 should
  use real `xUnit`, not a hand-rolled test runner — better tooling was
  available here than in the Bowling Game project's session, which had to
  work around no network access by assembling JUnit from local jars. Verify
  this is still true before assuming it in a future session; if NuGet
  restore fails, fall back to the Bowling Game project's approach (a small
  hand-written test runner) and document why.

## Pattern list, and why these six specifically

Factory, Dependency Injection, and Publish/Subscribe were explicitly
requested. State, Strategy, and Singleton were added because: State gives
the game's own menu/playing/paused/game-over flow a real, necessary home
(this project needs it regardless of the pedagogical goal, which is exactly
the kind of organic motivation this curriculum's schema requires); Strategy
is what makes an AI opponent a satisfying, natural feature rather than a
forced example; Singleton is included specifically to be honestly
critiqued, not endorsed — Lesson 14 should demonstrate what it breaks
(global hidden state, poor testability) and explicitly connect back to
Lesson 11's DI as the pattern that actually solves the same problem
Singleton is usually reached for, correctly. Don't cut Lesson 14 short by
treating Singleton as "just another pattern" — the honest critique is the
actual lesson.

## Deviations from the original roadmap sketch, and why

The roadmap table drafted before writing began put "encapsulation via
properties" at Lesson 8, after `IMovable`/`ICollidable` at Lesson 6.
Writing Lessons 5–8 for real changed this: Lesson 5's `IDrawable` and
Lesson 7's `IMovable`/`ICollidable` both want property-shaped members
(`Position`, `char Symbol`) the moment you try to write a realistic
implementation against them — introducing `IMovable`/`ICollidable` before
properties existed would have meant either skipping ahead informally or
using public fields and correcting course later. Properties moved to
Lesson 6, immediately after Lesson 5's first interface, so every interface
from that point on could assume real encapsulated state already exists.
`IMovable`/`ICollidable` moved to Lesson 7, and abstract classes stayed at
Lesson 8, unchanged in content — only its number shifted. If resuming work
on this project, trust the actual lesson files and `README.md`'s table
(already updated to match) over the very first roadmap draft's exact
per-lesson assignments — the epics and overall shape held; the precise
lesson-by-lesson slicing was refined by actually writing and verifying
each lesson's code, not by re-planning in the abstract.

## Status

- [x] `README.md` — 21-lesson roadmap (Lesson 0 + 5 epics), table updated
      to match what was actually built (see deviations above)
- [x] Lessons 0–20 — all written and verified. Every C# snippet across all
      21 lessons was compiled and run for real via `dotnet run` this
      session (a fresh scratch console project per lesson, not one
      accumulating project), including: `LinkedList<Position>` growth
      (Lesson 3), the real `event`/`Action<T>` pub/sub with two independent
      subscribers (Lesson 10), both the rigid and DI-based game engines
      contrasted directly (Lesson 11), real `xUnit` via `dotnet new xunit`
      and `dotnet test` (Lesson 15, including one deliberately triggered
      failing test), a real JSON round-trip to disk (Lesson 16), the
      locked-down Singleton constructor and its real test-pollution bug,
      triggered and then fixed with DI (Lesson 14), a hand-written generic
      `Grid<T>` proven to work with two different type arguments plus a
      real caught `ArgumentOutOfRangeException` (Lesson 18), and
      data-driven difficulty levels reusing `Grid<T>` as `Grid<bool>` for
      obstacles (Lesson 19). The one honest, deliberate exception:
      `Console.SetCursorPosition` and real-time `Console.KeyAvailable`
      input genuinely can't be verified by pasting output from this
      sandboxed session (confirmed directly — `KeyAvailable` throws
      `InvalidOperationException` when console input is redirected) —
      those lessons are written from accurate, established knowledge of
      the real API, flagged honestly, and left for confirmation in a real
      terminal, exactly the same honesty standard this curriculum's WPF
      and Kotlin/Compose courses use for GUI content that can't run
      headless either.
