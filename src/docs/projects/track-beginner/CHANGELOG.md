# Revision Log

Every lesson in this series gets fixed in place as real discrepancies
turn up — a newer Android Studio template generating different
boilerplate, a wrong claim, a missing step. This file is the fast way
to check "did anything I already read change?" without re-reading a
whole lesson.

Two levels, both maintained together:

1. **The heading itself, in the lesson file** — any `###`/`##` heading
   whose *content* changed gets `(revised MM/DD)` appended directly to
   it, e.g. `### CS Lens (revised 07/25)`. Since headings are what
   Studio's "On This Page" sidebar lists, this means a changed section
   is visible in the sidebar without opening the lesson at all — scan
   the list, click straight to the marked heading, skip everything
   else. A brand-new heading you've never seen before doesn't get this
   treatment — it's self-evidently new.
2. **This file** — one entry per fix, newest first, explaining *why*
   each change happened, for whenever the heading marker alone isn't
   enough context.

Each affected lesson also has a one-line `> **Revised <date>**` note
near its own top pointing back to both.

---

## 2026-07-25

- **Lesson 2c, Lesson 4** — The two "Observer pattern" fixes below (both
  dated the same day) turned out to still be incomplete: they made the
  *description* of Observer accurate, but the user pointed out — while
  on Lesson 2c, not yet at Lesson 4 — that Lesson 2c's insets unit named
  "Observer pattern" with **zero isolated proof**, the same complaint
  that started this whole conversation about patterns needing more than
  descriptions. Real fix, not a wording fix this time: added a full new
  isolated lab to Lesson 2c's insets unit — `TapCallback`/`Doorbell`/
  `Chime`, run for real output — proving Observer by hand, the same
  treatment `Base`/`Child` already gave Template Method in this same
  lesson. This also means `interface`, `implements`, and the
  polymorphism-via-interface-typed-field idea now genuinely first
  appear in Lesson 2c, earlier than Lesson 4. Lesson 4's `FakeButton`/
  `OnTapListener` lab is now correctly marked **reappearing** — its
  actual news is narrower and more honest: not "here's Observer," but
  "here's the lambda shortcut for the `Chime`-style long way you
  already proved." Lesson 4's Concept Unit was retitled to match
  ("Lambda Expressions — a Shortcut for What You Already Know"), and
  its Problem/CS Lens sections now explicitly point back to
  `Doorbell`/`Chime` instead of re-teaching the mechanism from scratch.
- **Lesson 2c** — Fixed a real error in the edge-to-edge insets unit's
  CS Lens: it called `setOnApplyWindowInsetsListener` "the Observer
  pattern again... reappearing from this lesson's first Concept Unit,"
  which wrongly implied `onCreate` (that first unit) was Observer too.
  `onCreate` is **Template Method** (inheritance — a fixed lifecycle,
  you override one slot in it); the insets listener is genuinely
  **Observer** (composition — you register a standalone callback for one
  specific event). Both are examples of Inversion of Control, but
  they're structurally different patterns. CS Lens now explains the
  distinction directly instead of conflating them. (Caught by the user
  cross-checking the lesson against a second AI's opinion — a good
  collaboration pattern worth repeating.)
- **Lesson 2c** — Added a full new Concept Unit explaining the
  `ViewCompat.setOnApplyWindowInsetsListener(...)` block that current
  Android Studio versions generate inside `onCreate` by default (edge-
  to-edge display became the default behavior for apps targeting
  Android 15+). Covers `ViewCompat`, `findViewById` (its real first
  appearance — moved earlier than Lesson 4, which now says so),
  `Insets`, `WindowInsetsCompat.Type.systemBars()`, `setPadding`, with
  the lambda syntax itself flagged and deferred to Lesson 4 by design.
- **Lesson 1** — Added a missing "Run It" step at the end of the wizard
  Concept Unit (click Run, set up an emulator, see "Hello World!"
  actually launch). Lesson 2c already referenced "when you ran this app
  in Lesson 1" — that sentence was never actually true until this fix.
  Also added a matching Definition of Done checkbox.
- **Lesson 3** — Added `android:id="@+id/main"` to the root
  `ConstraintLayout` in both the placeholder and the real layout XML —
  needed for Lesson 2c's insets code to find the view via
  `findViewById(R.id.main)`. Without this, following the lessons in
  order would work fine through 2c, then silently start crashing once
  Lesson 3's XML replacement removed the id.
- **Lesson 2b** — Updated the shown Manifest to match what current
  Android Studio actually generates: added the XML declaration,
  `xmlns:tools`, `android:dataExtractionRules`/`fullBackupContent`
  (backup config), `android:roundIcon`, `android:supportsRtl`, and
  `android:windowSoftInputMode` — none of these were in the original
  lesson text, all now explained.
- **Lesson 4** — Updated `findViewById`'s mechanical-walkthrough entry
  from "first appearance" to "reappearing, from Lesson 2c" (its real
  first appearance moved earlier — see the Lesson 2c entry above). Added
  a note in the Lambda Concept Unit acknowledging you may have already
  seen the `(a, b) -> { ... }` shape once, flagged and deferred, in
  Lesson 2c's insets code.
- **Lesson 4** — Two more pattern-naming fixes, same category as the
  Lesson 2c one above, found by the user asking "wait, did I actually
  run something labeled Observer, or just something that turned out to
  be Observer later?" — a fair question. (1) The `FakeButton`/
  `OnTapListener` lab's CS Lens only named it a "functional interface"
  — true, but incomplete: it never actually named Observer, even though
  it's the concrete, run, isolated example of Observer this whole
  curriculum points back to. Now names both, at their correct separate
  levels (language mechanism vs. design pattern). (2) The real
  `setOnClickListener` code's walkthrough called Observer "the exact
  same shape as `onCreate`" — the identical Template-Method-vs-Observer
  conflation as the Lesson 2c bug, just in a different lesson. Fixed to
  state what's shared (Inversion of Control) and what's actually
  different (inheritance + fixed lifecycle slot vs. composition +
  registered callback).
