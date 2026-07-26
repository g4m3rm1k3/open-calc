# Curriculum Notes — Pocket Inventory (Android, Beginner Track)

Working notes for whoever writes or edits lessons next (human or AI) —
the *why* behind this course that isn't itself part of any single
lesson, so a later session doesn't quietly drift back toward the
weaker version of this plan.

## Why this project exists, and why it isn't just a slower `../track/`

`../track/` is a real, complete, 34-lesson Android/Java course covering
the same Pocket Inventory app. It was built for a reader who already
knows Java and already knows the shape of an Android app — it teaches
*this specific app*, using Java and Android as the tools to build it,
not the language or the platform themselves. `track-beginner` looks
similar on the surface (same app, overlapping lesson titles, some
lessons literally split one `track/` lesson into several slower ones)
but it exists for a genuinely different reader: someone who knows
**neither Java nor Android** yet. The explicit framing, from the user
directly: *"we are taking track and making it for beginners to both
java and android, we are not rewriting it exactly the same, what would
be the point of that?"*

**The mission, stated plainly so it doesn't get silently lost: the goal
is to teach Java and Android. The app is a tool, not the goal.**
`track-beginner` teaches both Java and Android from zero, using the
Pocket Inventory app as the vehicle for that teaching — not as an app
tutorial that happens to use Java and Android. If a choice ever has to
be made between "what this lesson's app needs next" and "what teaches
Java/Android best right now," the teaching goal wins; the app's own
feature roadmap is scaffolding, not the point. Every Java language
construct (nested classes, generics, exceptions, `static`) and every
Android/framework construct (`extends AppCompatActivity`,
`RecyclerView.Adapter`, lifecycle methods, XML layouts) gets the same
depth of real explanation. Neither is assumed. Architectural
simplifications relative to `track/` (e.g., no separate
`AddItemActivity` + Activity Result API in this course's Lesson 9) are
legitimate, deliberate choices for a true-beginner pace — they are not
mistakes just because `track/` does it differently. The only kind of
divergence that *is* a real bug is a sequencing error unrelated to the
simplification itself (swipe-to-delete once shipped before persistence
existed at all — fixed by inserting a real Lesson 10 and renumbering).

## The concrete failure this mission exists to prevent

A lesson had the reader `extends RecyclerView.Adapter<...>`, override
three of its methods, and read a field directly off a `ViewHolder` —
all narrated correctly, but the parent's own actual declared shape
(the real method signatures, the real `itemView` field, the real
constructor) was never shown, only implied by how the subclass used
it. The reader correctly reverse-engineered the contract from context,
but had to — and it cost two real days on one section. That is exactly
the "assumes Android familiarity" failure mode this course is supposed
to not have. The fix is now a standing rule, not a one-off patch — see
`LESSON_CONTRACT.md`'s **Parent Contract Rule**: whenever a lesson has
the reader extend or implement a framework type whose source isn't
shown, show that type's real declared shape, verified against the
actual framework source, before showing the reader's implementation of
it. Apply this test to *every* `extends`/`implements` in this course
whenever a lesson is touched, not only the one that already got fixed.

## Relationship to `track/`

Siblings, not duplicates, same as the WPF course's own relationship to
`../track/` (see `../pocket-inventory-wpf/CURRICULUM_NOTES.md`).
`track/`'s sequence is not this course's roadmap to slavishly follow —
it's a reference for *scope* (what does the finished app eventually
need to do) but not for *pace, architecture, or what can be assumed*.
Citing `track/` as "also recognized in" in a CS/SE Lens's Recognition
list is fine; it must never substitute for this course's own from-zero
explanation of a Java or Android concept.

## Governing documents

`LESSON_CONTRACT.md` + `LESSON SCHEMA.md` (both in `src/docs/reference/`)
govern every lesson file in this course, including the Glossary Rule
("Terms introduced in this lesson," every non-obvious Java/Android/
pattern term gets a real, look-up-able name) and the Parent Contract
Rule above. `scripts/check-narrative-lessons.mjs` structurally lints
lessons against these rules — run it before considering a lesson-schema
compliance question closed; don't hand-audit from memory.
