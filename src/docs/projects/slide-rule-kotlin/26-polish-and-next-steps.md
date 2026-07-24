# Lesson 26: A Retrospective, Not a Feature

*(Polish, Material You, and Where to Go Next)*

**No new feature, no new concept.** Every construct in this course — from
`val`/`var` in Lesson 0 to Compose UI testing in Lesson 25 — has already
been introduced. This lesson is the professional practice this
curriculum's `LESSON_CONTRACT.md` names directly under "Code review":
revisiting your own finished work with better judgment than you had while
building it, one piece at a time.

**What you need to know first:** Lessons 0–25, all of them — this is a
full-codebase pass, not a new slice.

---

## Pass 1: Material You and Final Polish

Add dynamic color (`dynamicLightColorScheme`/`dynamicDarkColorScheme` on
Android 12+, falling back to Lesson 3's fixed schemes on older versions)
and a real app icon. Neither is a new construct — both are direct
extensions of Lesson 3's `MaterialTheme` and ordinary Android resource
work already covered in `../track/`.

## Pass 2: Extract a Repository

Lesson 24's `CalculatorViewModel` calls `dao.insert(...)`/
`dao.observeAll()` directly. `../track/` Lesson 17 already taught exactly
why a **Repository** layer sits between a `ViewModel` and a data source —
so the `ViewModel` doesn't need to know or care whether history comes from
Room, a future network sync, or a fake in tests. Extract a
`CalculationRepository` wrapping `CalculationDao`, and have
`CalculatorViewModel` depend on the repository instead of the DAO
directly — no new concept, a direct application of a principle already
taught, now that there's enough real code for the seam to matter.

## Pass 3: Confirm Every Screen Actually Followed Lesson 24's Pattern

Check the Graph, Linear Algebra, and Physics screens honestly: does each
one hold real logic (state mutation, computation) directly in its
composable, or did only the Calculator screen actually get moved into a
`ViewModel`? If any screen still mixes logic into the UI layer, that's not
a bug — it's this course's own "touch on things, extend yourself" scope
choice made visible — but it's worth naming honestly rather than assuming
Lesson 24's refactor silently applies everywhere it wasn't explicitly
shown.

## Pass 4: Write Your Own Retrospective

In your own words, write down:

- What would you design differently, starting a v2 today, now that you can
  see the whole app at once instead of one lesson at a time?
- Which lesson's "honest scope cut" (Lesson 6's no-parentheses evaluator,
  Lesson 13's hardcoded function list, Lesson 15's approximate
  intersection detection, Lesson 18's exact-zero determinant check) do you
  actually want to fix first, and why that one over the others?
- Where did Kotlin's null safety, sealed classes, or coroutines
  concretely save you from a bug you know you'd have hit in Java?

This retrospective is itself the deliverable — a professional engineer
revisiting old decisions with better judgment than they had when they made
them, per this curriculum's own "Professional Practices" standard.

---

## Where to Go Next — Extensions Left Deliberately Unbuilt

Every one of these was named honestly, in the lesson that touched it, as a
real limitation rather than hidden:

- **Parentheses and variables in the evaluator** (Lesson 6) — extend
  `parseFactor` to recognize `(`, recursively calling `parseExpression`;
  add a variable-lookup environment map for the graph's `evaluateFunction`
  (Lesson 13) to replace its hardcoded `when`.
- **A real root-finder** (Lesson 15's honest gap) — bisection or Newton's
  method (which Lesson 19's `derivative` puts you one step from), replacing
  the sign-change approximation with an exact numerical solve.
- **3×3 and general *n*×*n* linear systems** (Lesson 18's honest scope cut)
  — generalize Cramer's Rule, or implement true Gaussian elimination for
  an arbitrarily-sized system.
- **A tolerance-based determinant check** (Lesson 18's SE Lens) — replace
  `d == 0.0` with `abs(d) < epsilon` for numerically robust singular-matrix
  detection.
- **More physics formulas** (Lesson 21) — a real sealed hierarchy of a
  dozen formulas instead of two, each with its own picker UI.
- **Undo/redo for calculator history** — this curriculum's WPF course
  (`../pocket-inventory-wpf/`) builds exactly this feature via the Command
  and Memento patterns in its own Lesson 45; the same pattern applies
  here almost unchanged.
- **A unit converter or complex-number mode** — genuinely new screens,
  following the exact `NavHost` registration pattern from Lesson 4.

## Definition of Done — For the Whole Course

- [ ] Every lesson's Definition of Done, from Lesson 0 through Lesson 25,
      is actually checked off, not just written.
- [ ] The app has a Repository layer between `ViewModel` and Room.
- [ ] You've written your own honest retrospective, in your own words, not
      a restatement of this lesson's prompts.
- [ ] You've picked at least one extension from the list above and either
      built it or written down a concrete plan for building it yourself.
- [ ] Commit: `git commit -m "Extract a Repository layer and polish theming — v1 complete"`.

---

*This is the same closing note every project in this curriculum ends on:
the app was never the point. If you can explain, in your own words, why
Lesson 0's `var` gotcha happens, why Lesson 2's `remember` matters, why
Lesson 23 uses `suspend fun` instead of a background thread, and why Lesson
24 moved logic out of the UI — you've learned Kotlin and Compose. Slide
Rule itself is yours to keep extending, on your own, from here.*
