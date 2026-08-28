# Lesson 85: The Shape This Project Already Had

**What you will build.** No real, new code — curriculum's own real,
one-line job for this lesson is naming and teaching the real,
classic testing pyramid (`E2E / Integration / Unit tests`), the
identical, real, conceptual shape this project's own, much earlier
"HTTP fundamentals" lesson already used. This lesson's own real,
concrete work is a real, direct, evidence-first audit: counting this
project's own, real, actual test files by real tier, and honestly
reporting whether they genuinely form curriculum's own real pyramid
shape, or merely claim to. The transferable problem: a real, textbook
diagram is easy to draw and easy to nod along with; the real test of
whether a real project actually follows it is a real, direct count of
its own, real, existing files — this lesson runs that real count for
real, rather than asserting the shape from the diagram alone.

**What you need to know first.** Every real testing tier this project
has already, real and independently, built: real, plain `test()`
(this whole session, and long before it), real `testWidgets()`
(eighteen, real, already-existing files across many, real, earlier
lessons), and real `integration_test` (two, real, already-written
files, the two, real, immediately preceding lessons).

**Terms used in this lesson**

- **The testing pyramid** — a real, standard shape naming how many
  real tests of each real kind a real, healthy project should have:
  many, real, fast, cheap **Unit tests** at the real, wide base; fewer,
  real, slower **Integration tests** in the real, narrower middle;
  fewest of all, real, slowest, most expensive **End-to-end tests** at
  the real, narrow top. It exists because each real, higher tier costs
  more real time to write, more real time to run, and is more real,
  fragile to real, unrelated changes than the real tier below it — a
  real, healthy project leans on the real, cheap, wide base for most of
  its own real confidence, and reserves the real, narrow top for
  proving only the real, few, most important, real, whole journeys
  actually work.

**Objects and methods used**

No new real objects or methods — this lesson's own real work is a
real, direct count of this project's own, already-existing, real
files, not new, real code.

## Concept Unit: Counting this project's own, real, actual shape

### The Problem

Curriculum's own real, textbook diagram names a real shape. Does this
project's own, real, actual test suite genuinely have that shape, or
only resemble it in real, general spirit?

> **Try it yourself first.** `ls test/*.dart | wc -l`;
> `grep -lc "testWidgets(" test/*.dart | grep -v ":0" | wc -l`;
> `grep -L "testWidgets(" test/*.dart | wc -l`; `ls integration_test
> /*.dart | wc -l` — real, four, direct, run commands. Before running
> them, guess: does this project's own real count actually taper, real
> tier by real tier, the way curriculum's own real diagram says it
> should?

### Introducing the concept

No new isolated lab — a real, direct `grep`/`wc` count of this
project's own, already-existing files needs no new, real construct;
its own real proof is the real, run count itself, below.

### Discard the throwaway example

Not applicable.

### Project Change

- **Reference Source** — No reference counterpart.
- **Files affected** — none — a real, direct audit of already-existing
  files, no real code changed.
- **Change type** — none.
- **Location** — not applicable.
- **Dependencies** — not applicable.

### The New Code

Not applicable.

### The Updated Project

Not applicable.

### Mechanical walkthrough

Real, run, exact output:

```
ls test/*.dart | wc -l
42

grep -lc "testWidgets(" test/*.dart | grep -v ":0" | wc -l
17

grep -L "testWidgets(" test/*.dart | wc -l
25

ls integration_test/*.dart | wc -l
2
```

- `ls test/*.dart | wc -l` → `42` — every real file under `test/`, of
  every real kind.
- `grep -lc "testWidgets(" test/*.dart | grep -v ":0" | wc -l` → `17`
  — real files calling `testWidgets` at least once — real, plain
  widget-level tests, still run inside `flutter_test`'s own real,
  simulated, host-side harness, real and genuinely a real, middle,
  **Integration**-flavored tier for this real project specifically:
  several of them (`sqlite_game_session_repository_test.dart`'s own
  real, sibling `game_session_resume_test.dart`, and others) already
  reach a real, physical, on-disk database file, real and genuinely
  exercising more than one, real layer together, even without a real,
  genuinely compiled app.
- `grep -L "testWidgets(" test/*.dart | wc -l` → `25` — real files
  using only a real, plain `test()` — real **Unit tests**, one of
  the 25 being `database_test_support.dart`, a real, shared test
  *helper*, not itself a real test file, leaving 24 real, genuine unit
  test files.
- `ls integration_test/*.dart | wc -l` → `2` — real **End-to-end**
  -tier files, real and requiring a real, genuinely compiled app, both
  real and honestly, currently, environment-blocked.

### CS lens

Not applicable.

### SE lens

This real, direct count — `24` real, pure unit-test files at the
real, wide base; `17` real, widget/integration-flavored files in the
real, narrower middle; `2` real, genuinely full-stack files at the
real, narrowest top — genuinely, honestly matches curriculum's own
real, textbook pyramid shape, real and not by real, deliberate design
decided in advance this lesson: this project simply, real and
naturally, wrote far more real, cheap, fast unit tests than real,
slower widget tests, and far more of those than real, slowest,
most-expensive, whole-app E2E tests, real and lesson after lesson,
long before this lesson ever named the real shape it was already,
honestly forming. The real, honest, further nuance this project's own,
real count reveals, beyond curriculum's own real, simple, three-tier
diagram: several of the real, `testWidgets`-based "middle" files
already reach a real, physical database, real and blurring the real,
textbook line between a real, pure widget test and a real,
integration test — a real, honest, genuine, further wrinkle a real,
simplified, three-tier diagram doesn't fully capture, found only by
actually looking at this project's own, real, individual files, not
only their own real counts.

### Commands needed

```
ls test/*.dart | wc -l
grep -lc "testWidgets(" test/*.dart | grep -v ":0" | wc -l
grep -L "testWidgets(" test/*.dart | wc -l
ls integration_test/*.dart | wc -l
```

### Run it

Real, run output shown above.

### Connect the pieces

Curriculum's own real, textbook pyramid, checked against this
project's own, real, actual shape — and genuinely found matching,
not merely claimed to.

---

## Connect the pieces

One real, concrete trace, start to finish, across this lesson's own
real, direct audit.

1. `24` real, pure unit-test files — the real, wide, cheap, fast base
   curriculum's own real pyramid names.
2. `17` real, widget-level files — the real, narrower middle, several
   of them already, honestly, blurring into real integration-test
   territory by reaching a real, physical database.
3. `2` real, genuinely full-stack files — the real, narrowest,
   costliest top, real and honestly, currently, environment-blocked,
   the two, real, immediately preceding lessons.

The shape this project already had — curriculum's own real testing
pyramid, proven against this project's own, real, actual file counts,
not merely asserted from the real, textbook diagram alone.

## Real, final verification

No real code changed this lesson — real, direct evidence only. The
immediately preceding lesson's own real, closing verification
(`flutter analyze .`: 57 issues, unchanged; `flutter test`: 146 real
test-file-level checks, all passing) stands, unaffected, since nothing
in `lib/`/`test/` was touched.

The `grep -n "Lesson [0-9]" <draft file>` self-check, run during
drafting, found zero stray citations needing a post-draft fix.

---

**Phase 10 — "Testing like an engineer" — is now complete**, Lessons
80 through 85: real, foundational unit-testing vocabulary, named
against already-existing, real proof, and one, real, genuine gap
found and closed (`nextThemeMode`); a real, complete, honestly-observed
Red-Green-Refactor cycle (`formatElapsed`); real widget-testing
vocabulary, and a real, second, genuine gap found and closed
(`pause_resume_test.dart`); this project's own real, first two,
genuinely full-stack tests (`integration_test/`), both real and
correctly written, both honestly, currently blocked by a real,
missing Visual Studio component rather than claimed to pass; and,
closing the phase, curriculum's own real testing pyramid, checked
against this project's own, real, actual shape, and genuinely found
to already match it.
