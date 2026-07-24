# The Bowling Game — Test-Driven Development in Java

## What You Will Build

A ten-pin bowling scoring engine, built **test-first** — every line of
production code exists because a failing test demanded it, not because a
design document said so. You'll follow the actual historical shape of
Robert C. Martin's "Bowling Game Kata" (the single most-cited TDD teaching
exercise after Kent Beck's own Money example), then grow it past the
kata's small original scope into a real small application — multiple
players, multiple games, a leaderboard, simple persistence, and a text
console — because that's where the Java fundamentals this course also
owes you (generics, interfaces, enums, exceptions, collections, `Optional`,
streams) actually come up naturally, not as a bolted-on syllabus.

## Why This Project, Why Now

You have Kent Beck's *Test-Driven Development: By Example* and *Extreme
Programming Explained* on your shelf, and you're right that they're hard
to follow today — Beck's own running example (multi-currency `Money`) is
already "spoken for" by those books; this course deliberately builds a
*different* classic exercise so you get the same TDD discipline applied
fresh, not a re-reading of a book you already own. The Bowling Game Kata is
the right second choice: it's small enough to actually finish, famous
enough that Robert Martin has written multiple public retrospectives on
the design decisions it forces (a real, citable second opinion once you've
built your own version), and its scoring rules (open frame → spare →
strike → the tenth frame's special case) are shaped, historically, almost
exactly like a red-green-refactor lesson sequence already.

**The Extreme Programming half of this ask — the values and practices
(pairing, sustainable pace, courage, simplicity) rather than the
mechanics — lives separately, as a standalone blog-post series in
`src/posts/`, each post independently readable. This project is the TDD
mechanics half specifically: a real, growing codebase built strictly
test-first.**

You mentioned you know Python and JavaScript, not Java specifically — you
can already Google your way to "how do I convert an int to a String," but
things like generics, checked exceptions, and Java's access-modifier
system are genuinely new territory, not just unfamiliar syntax for an idea
you already have. This course treats those as first-class teaching
material, at the exact point the kata's growth actually needs them — see
[`CURRICULUM_NOTES.md`](CURRICULUM_NOTES.md) for the full map of what's
assumed known (from `../track/`'s Java exposure) versus genuinely new here.

## Lesson Standard, With One Adaptation

Every lesson still follows [`LESSON_CONTRACT.md`](../../LESSON_CONTRACT.md)
and [`LESSON SCHEMA.md`](../../LESSON%20SCHEMA.md) — concept labs,
mechanical walkthroughs, both lenses, everything. The one deliberate
adaptation, specific to this project: **the red-green-refactor cycle *is*
the Concept Unit's "Problem → Concept Lab → Project Change" sequence**,
made explicit instead of implicit. Every lesson in Epic 1 opens with a real
failing test (red), the smallest change that passes it (green), and only
then a refactor step — shown as three distinct, run-for-real states, not
just a finished diff. Later epics relax this where a lesson's actual
subject isn't new production logic (Lesson 21's `record` reveal, for
instance) — the cycle is the backbone for *behavior*-adding lessons
specifically, not a rule applied mechanically everywhere.

## Lesson 0 — Java Fundamentals You Didn't Get From Python or JavaScript

No user story, no TDD cycle yet — a dense, contrastive lesson (the same
shape as the WPF course's Lesson 0 and the Kotlin course's Lesson 0, this
time Java-vs-Python/JavaScript specifically): primitives vs. wrapper
classes and autoboxing (the actual mechanism behind `int` → `String`
conversion you've been Googling), `==` vs. `.equals()` (arguably the single
most common real bug for anyone arriving in Java from Python or
JavaScript), access modifiers (`public`/`private`/`protected`/
package-private — four levels, not Python's naming convention or
JavaScript's `#field`), `static` vs. instance members, and constructors.
Ends with JUnit installed and your first passing (and first deliberately
failing) test.

→ [`00-java-fundamentals.md`](00-java-fundamentals.md)

---

## Epic 1 — The Kata: Red, Green, Refactor

The classic kata, followed close to its real historical shape. Each row is
a real TDD cycle — a failing test first, named directly.

| # | The Failing Test First | New Java Concept | SE / TDD Idea | Lesson |
|---|---|---|---|---|
| 1 | A gutter game (all zeros) scores `0` | JUnit `@Test`, `assertEquals` | The TDD cycle itself: red, green, refactor, as three distinct, run states | [01](01-red-green-refactor.md) |
| 2 | A game of all `1`s scores `20` | `List<Integer>`, generics (first appearance), autoboxing in a collection | Generalizing from a hardcoded return — the smallest honest step from "fake it" to "obvious implementation" | [02](02-generics-and-storage.md) |
| 3 | A mixed-frame game sums correctly (no new rule) | Varargs (`int...`) | Test code deserves the same refactoring care as production code — a real, no-new-logic TDD cycle | [03](03-test-helpers-and-varargs.md) |
| 4 | A spare's next roll counts double | Bonus look-ahead logic over the roll list | The first genuinely tricky rule — the test written *before* the logic exists to make it pass | [04](04-spare-scoring.md) |
| 5 | A strike's next two rolls count double | Deeper look-ahead, index arithmetic | Reappearing: driving design from a test, not the other way around | [05](05-strike-scoring.md) |
| 6 | The tenth frame allows bonus rolls | — | Where you expect a fight and the design already generalizes — a real, honest surprise, not scripted | [06](06-tenth-frame.md) |
| 7 | A perfect game (12 strikes) scores exactly `300` | — | The kata's traditional capstone test — verifying the whole design against its best-known edge case | [07](07-perfect-game.md) |
| 8 | (no new test — a refactor-only lesson) | — | Comparing the flat-list design against an alternative object-oriented `Frame`-based design — the kata's famous real fork, both shown, tradeoffs stated honestly | [08](08-design-fork-refactor.md) |

## Epic 2 — From Kata to Real Java Class Design

| # | Concept | You Can See | New Java Concept | Lesson |
|---|---|---|---|---|
| 9 | Value types, written by hand | A `Roll` type with correct `equals`/`hashCode`/`toString` | The manual equals/hashCode contract — *why* both must change together, the bug when they don't | [09](09-value-types-by-hand.md) |
| 10 | Enums | Roll results classified via a real `enum RollResult` | Java `enum` with fields and per-constant behavior, not just named constants | [10](10-enums.md) |
| 11 | Exceptions | Rolling a negative or >10 pin count throws a clear, custom exception | Checked vs. unchecked exceptions, writing a custom exception class | [11](11-custom-exceptions.md) |
| 12 | Interfaces | A second scoring rule variant (`FlatScoring`) plugs in without touching `Game` | `interface`, polymorphism, dependency inversion | [12](12-interfaces.md) |
| 13 | Generics, for real | A generic, reusable `Leaderboard<T extends Comparable<T>>` | Bounded type parameters, not just `List<Integer>` | [13](13-bounded-generics.md) |
| 14 | The Collections Framework | `List`/`Set`/`Map` contrasted; sorting by an external rule | `List` vs. `Set` vs. `Map`, `Comparator` | [14](14-collections-framework.md) |
| 15 | `Optional` | Looking up a player who might not exist, with no `null` check | `Optional<T>`, contrasted directly with C#'s nullable types and Kotlin's `?` from this curriculum's other courses | [15](15-optional.md) |

## Epic 3 — A Bowling Alley: Players, Games, a Leaderboard

| # | Concept | You Can See | New Java Concept | Lesson |
|---|---|---|---|---|
| 16 | Modeling players and games | Multiple players, each with their own game history | Entity vs. value object, `Optional`-based lookup | [16](16-players-and-games.md) |
| 17 | A real leaderboard | Players ranked correctly by best game | `Comparable<Player>`, reusing Lesson 13's generic class unmodified | [17](17-leaderboard.md) |
| 18 | The Stream API | "Show me every player who bowled a 200+ game" in one readable line | Lambdas, method references, `stream()`/`filter()`/`map()` | [18](18-stream-api.md) |
| 19 | Simple persistence | Games survive closing and reopening the program | `java.nio.file`, a real checked `IOException` | [19](19-persistence.md) |
| 20 | A text console | A real, usable menu-driven program | `Scanner`, a simple input loop | [20](20-text-console.md) |

## Epic 4 — Modern Java, and What TDD Actually Bought You

| # | Concept | You Can See | New Java Concept | Lesson |
|---|---|---|---|---|
| 21 | `record` | The `Roll` type from Lesson 9, rewritten in one line | Java's own modern equals/hashCode/toString shortcut — cross-referenced directly against Kotlin's `data class` and C#'s `record` from this curriculum's other two courses | [21](21-record-keyword.md) |
| 22 | A fearless refactor | A real internal redesign of the scoring engine (`bonusSum`), done with the full test suite as a safety net | The actual, central Kent Beck/XP argument, made concrete instead of asserted | [22](22-fearless-refactor.md) |
| 23 | Retrospective | — | Capstone — no new concept, extension ideas (candlepin/duckpin variants, a GUI, a database-backed leaderboard) | [23](23-retrospective.md) |

## Definition of Done

- Every kata test from Epic 1 passes, including the perfect-game case.
- A real bug (negative pins, too many pins in a frame) is rejected with a
  clear custom exception, not a silent wrong score.
- At least one alternate scoring rule variant plugs in via an interface
  with no changes to the core engine.
- A leaderboard across multiple players and games sorts correctly.
- Game history survives closing and reopening the program.
- You can explain, concretely, why the flat-array and object-oriented
  designs from Lesson 8 are both legitimate, and which one you'd choose and
  why.
- You can explain the actual mechanism behind `int` → `String` conversion —
  not just that it works.

## Status

All 24 lessons written (Lesson 0 through Lesson 23). Every kata test —
gutter game through the perfect game — passes, verified for real via a
JUnit 5 test runner built from jars bundled with a local IDE Java-test
extension (no network dependency needed). Every plain-Java code snippet
across all 24 lessons was actually compiled and run this session, not
described from memory — including the two full, independently-verified
`Game` designs compared in Lesson 8.
