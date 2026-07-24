# Lesson 23: A Retrospective, Not a Feature

**No new feature, no new concept.** Every construct in this course — from
`==` vs. `.equals()` in Lesson 0 to `record` in Lesson 21 — has already
been introduced, and Lesson 22 already demonstrated this project's central
argument concretely. This lesson is the professional practice
`LESSON_CONTRACT.md` names directly under "Code review": revisiting your
own finished work with better judgment than you had while building it.

**What you need to know first:** every lesson, 0 through 22 — this is a
full-project pass, not a new slice.

---

## Pass 1: Re-Read the Kata's Real History

Robert Martin has written multiple public retrospectives on the Bowling
Game Kata — search for "Bowling Game Kata" and read at least one. Compare
his own design discussion against Lesson 8's flat-list-vs-`Frame`
comparison in this course. Where do you agree with his reasoning? Where
does your own experience building both versions yourself give you a
different, equally legitimate opinion?

## Pass 2: Confirm the Contract, Everywhere

Check honestly: does `Game` still correctly reject invalid rolls (Lesson
11) after Lesson 12's `ScoringStrategy` extraction and Lesson 22's
refactor? Does every value type that should have `equals`/`hashCode`
consistency (Lesson 9) actually have it — including `Roll` after becoming
a `record` (Lesson 21)? A passing test suite (Lesson 22) is strong
evidence, but re-reading the actual code once, end to end, is the human
check a test suite can't fully replace.

## Pass 3: Where Java's Lack of Enforcement Actually Bit You

Lesson 15 named a real, honest limitation: `Optional` is a library
convention Java doesn't enforce the way this curriculum's Kotlin course's
`?` is enforced by the compiler. Did you, at any point across this
project, forget to use `Optional` somewhere a `null` could genuinely have
snuck in? Check `BowlingAlley`, `AlleyPersistence`, and `AlleyConsole`
honestly — this is worth doing as a real audit, not a rhetorical
question.

## Pass 4: Write Your Own Retrospective

In your own words, write down:

- What would you design differently, starting a v2 today, now that you
  can see the whole project at once instead of one lesson at a time?
- Which of Java's specific gaps from Python/JavaScript (Lesson 0's
  `Integer` caching trap, Lesson 9's `equals`/`hashCode` contract, Lesson
  11's checked-vs-unchecked distinction) do you now recognize
  immediately, without having to think it through?
- Kent Beck's own writing argues tests give you the courage to change
  code. Lesson 22 was the first time this project asked you to feel that
  directly — did it? Where, concretely?

This retrospective is itself the deliverable — a professional engineer
revisiting old decisions with better judgment than they had when they made
them, per this curriculum's own "Professional Practices" standard.

---

## Where to Go Next — Extensions Left Deliberately Unbuilt

Every one of these was named honestly, in the lesson that touched it, as
a real limitation rather than hidden:

- **A real candlepin or duckpin `ScoringStrategy`** (Lesson 12's honest
  gap) — a genuinely different rule set, plugged in with zero changes to
  `Game`.
- **Consecutive-frame validation** (Lesson 11's exercise) — reject a
  non-strike frame whose two rolls sum past 10, which needs the *previous*
  roll's context, not just the current one in isolation.
- **A `Map<String, Player>`-backed `BowlingAlley`** (Lesson 16's honest
  scope cut) for faster lookup than linear search, once player counts grow.
- **A real database** (Lesson 19's honest scope cut) — SQLite, the same
  choice this curriculum's WPF and Python/FastAPI courses made, once plain
  text stops being enough.
- **Defensive parsing of the save file** (Lesson 19's exercise) — reject or
  report malformed lines instead of crashing.
- **A GUI** — this curriculum's Kotlin course (Jetpack Compose) and WPF
  course (XAML) both show what a real graphical version of this exact
  kind of app looks like on two different platforms; porting this
  project's domain logic (`Game`, `Player`, `Leaderboard`) behind a real
  UI is a genuinely good next step.
- **The companion XP-practices blog series** in `src/posts/` — agreed on
  when this project was planned, not yet written; a natural next
  companion to actually reading Kent Beck's and this project's own
  values in action.

## Definition of Done — For the Whole Course

- [ ] Every lesson's Definition of Done, from Lesson 0 through Lesson 22,
      is actually checked off, not just written.
- [ ] You read at least one of Robert Martin's real retrospectives on this
      kata and compared it honestly to your own experience.
- [ ] You've written your own honest retrospective, in your own words, not
      a restatement of this lesson's prompts.
- [ ] You've picked at least one extension from the list above and either
      built it or written down a concrete plan for building it yourself.
- [ ] Commit: `git commit -m "Retrospective — v1 of the Bowling Game complete"`.

---

*The same closing note every project in this curriculum ends on: the app
was never the point. If you can explain, in your own words, why a
gutter-game test came before a spare test, why `hashCode` matters even
when `equals` is correct, why `Comparable` and `Comparator` are different
tools, and why the test suite is what made Lesson 22's refactor safe
instead of frightening — you've learned both TDD and the specific gaps
Java has relative to the Python and JavaScript you already knew. The
Bowling Game itself is yours to keep extending, on your own, from here.*
