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

## 2026-07-28

- **Lesson 8** — The user asked directly whether overloaded methods and
  constructors, already in use since `println` in Lesson 1 and named in
  this lesson, had ever actually been taught rather than just used. They
  hadn't: "Java picks which one runs based on the arguments supplied at
  the call site" had been asserted three times (`putExtra` here,
  `Item(Parcel in)` here, `this(...)` delegation in Lesson 13) with no
  isolated proof anywhere. Fixed with a new Concept Unit, `Overloading —
  Same Method Name, Chosen at Compile Time`, positioned before this
  lesson's first real use of it: a `Printer`/`OverloadDemo` lab (real
  output verified this session) proving three overloads get selected
  correctly, then a sharper second lab, `StaticTypeDemo`, proving the
  more important and non-obvious fact — overload resolution uses a
  variable's *declared* type, not what it actually holds at runtime.
  Real compile error, this session: a variable declared `Object` but
  holding a real `String` at runtime still gets rejected by `show(...)`,
  because no overload accepts `Object` and the runtime value is never
  consulted. This gave a clean opportunity to name the underlying CS
  distinction directly — overload resolution is **static dispatch**
  (compile-time, from declared types), while `Base`/`Child`'s overridden
  `setup()` (Lesson 2c) is **dynamic dispatch** (runtime, from the
  object's real type) — two different mechanisms this course had used
  side by side without ever naming what separated them. The `putExtra`
  and `Item(Parcel in)` walkthrough bullets now point back to this proof
  instead of re-describing overloading from scratch.
- **Lesson 2c** — The user pointed out that "Annotation" had been
  described identically, shallowly, in three separate lessons
  (2c's own `@Override` bullet, 6e's `@NonNull`, 18's `@LayoutRes`/
  `@MainThread`) — always "metadata attached to code... read by the
  compiler, an IDE's static analysis, or a framework" — without the
  underlying mechanism ever once being proven: what actually makes an
  annotation inert by default, and why `@Override` specifically gets
  real compiler enforcement while the others don't. Fixed with a new
  Concept Unit at true first appearance (before the existing `extends`
  unit, since `@Override` is in this lesson's very first code block):
  a `Reminder`/`Task` lab proving, with identical real output before
  and after deleting the annotation, that a custom annotation changes
  nothing about execution by itself — then a real compile error,
  reusing the `Base`/`Child` files from the lesson's next unit
  (`BadChild.java`, `@Override protected void setupp()`, a
  deliberate typo), proving `@Override` specifically *is* a hardcoded
  javac special case, not evidence of a general "annotations are
  compiler-checked" rule. The three later, now-redundant "Annotation"
  glossary entries in Lessons 6e and 18 were trimmed to point back
  here per the Glossary Rule (a reappearing term doesn't get a second
  full entry), rather than left as silent duplicates.
- **Lesson 6e** — The user pointed out (correctly) that the `LayoutInflater`
  walkthrough bullet named the class responsible for inflation without
  ever explaining the actual mechanism — "the real class that does it"
  described a responsibility, not a how, the same category of failure
  as saying "microwaving heats food" and calling that an explanation of
  microwaves. Fixed with a new Concept Unit, `LayoutInflater — What
  "Inflate" Actually Does`, proving the real mechanism (runtime class
  resolution by name via `Class.forName`, a required constructor shape
  located via `getConstructor`, invoked via `newInstance`) with a
  reflection lab, real output verified this session, then connected
  explicitly to `LayoutInflater`'s own real, documented behavior
  (verified against real AndroidX `Fragment` source this session via
  `android.googlesource.com`, for the adjacent Parent Contract fact that
  `Fragment` itself is not `abstract`). The same audit, widened at the
  user's request to include core Java, not just Android framework,
  found the identical failure shape in `ArrayList` — "a concrete,
  resizable implementation of `List`" named its role, never its
  mechanism. Fixed with a second new Concept Unit, `ArrayList — What
  "Resizable" Actually Means`, proving the backing-array-and-copy
  mechanism with a hand-built `GrowableIntArray`, real output verified
  this session, cross-checked against a real `java.util.ArrayList`'s
  actual backing array via reflection (`--add-opens java.base/java.util=ALL-UNNAMED`)
  to confirm the `0 → 10 → 15` capacity curve matches the real class
  exactly. Separately, added a real logging exercise proving
  `RecyclerView` genuinely recycles `ViewHolder`s instead of just
  asserting it (a 30-item list, `Log.d` in both `onCreateViewHolder`
  and `onBindViewHolder`, real Logcat output showing creation calls stop
  while bind calls continue) — the same class of gap, caught first,
  before the wider LayoutInflater/ArrayList audit.
- **Lesson 18 (new)** — Built following the same rubric this session
  just finished stress-testing on Lesson 6e: every framework claim
  either proven with real output or honestly flagged as unrunnable
  outside a real Android emulator (matching the precedent already set
  by Lessons 8, 12, 15, and 16 for `Parcelable`/`SQLiteOpenHelper`/
  `ViewModel`/`LiveData`). Migrates the inventory screen's entire UI
  into `InventoryListFragment`, hosted by a thin `InventoryActivity` —
  adapted from `track/`'s own Lesson 18 to this course's actual
  architecture (inline Add form from Lesson 9, no separate
  `AddItemActivity`; the granular `notifyItemInserted`/`notifyItemRemoved`
  Adapter from Lessons 9/11, not `track/`'s `setItems(...)` full-replace
  version), not ported wholesale. The `Fragment` Parent Contract block
  (not `abstract`, `onCreateView`'s real default body, the two real
  constructors) is verified against real AndroidX source fetched this
  session from `android.googlesource.com`, not written from memory.
- **Structural pass across Lessons 1–17** — deleted a duplicate,
  stale `Lesson 7 ... (Added).md` file left over from an unmerged
  draft; fixed six cross-references still pointing at the pre-split
  "Lesson 2"/"Lesson 6" (both later split into 2a–2e and 6a–6e) instead
  of the specific sub-lesson that actually owns the concept; added five
  missing glossary entries the project's own linter
  (`scripts/check-narrative-lessons.mjs`) flagged as first-appearance
  terms with no matching "Terms introduced in this lesson" entry.

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
