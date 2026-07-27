# wpf-lessons

## Purpose

This track exists to learn C# and WPF themselves, as first-class subjects
— not to rebuild `../lessons/`'s app in a new language, and not to arrive
at any particular app. Whatever gets built here is a vehicle for the
language/framework lessons, not the goal. What gets built, and in what
order, is free to diverge from `../lessons/` entirely.

## Not a port

`../lessons/` (`cnc-web`/`cnc-service`) is not being mirrored — not its
lesson order, its lesson count, its app domain, or its architecture. This
track started its own small app (`wpf-app/CncWpf`) rather than porting
`cnc-web`, specifically so C#/WPF mechanics don't compete with CNC-domain
complexity for attention. Where a WPF-native progression makes more sense
than the Flask/React one did, that's the correct choice, not a deviation
to correct — and where building toward the same domain later turns out to
be the natural next step, that's fine too. Neither is decided in advance.

## Concept reuse

Same rule as `../concepts/README.md`'s 100%-match rule, and the same
mechanism `../lessons/` already uses: a concept gets built once, as its
own standalone file in `../concepts/`, and every lesson that needs it
afterward just links it — never rewritten inline, never re-derived. In
practice this cuts one way for this track: the match rule itself requires
*same language*, so nothing C#/WPF-specific can 100%-match anything in
the existing (Python/JS-only) catalog — every C#/WPF construct earns a
new file the first time it's taught, added to the *same* `../concepts/`
catalog, not a separate folder, following that folder's existing rules
(project-independent, one file per concept, a complete lesson in its own
right, usable with zero changes in any other project). Only genuinely
language-independent ideas (SQL, general architecture patterns, CS ideas
not tied to a particular syntax) can ever actually reuse an existing
entry.

Every lesson gets a "Concepts cataloged from this lesson" list near the
top and a `(Full standalone treatment: ...)` pointer under each Concept
Unit heading — the same two things `../lessons/lesson-01...` does —
linking to the concept file instead of duplicating its isolated example
inline. Lesson 1 has both, retroactively, as of this pass.

## What's assumed known

General programming fundamentals — what a variable, loop, function, data
type, or class *is* in the abstract — are not re-taught here; that ground
was covered learning Python/JS in `../lessons/`. Nothing about C# or WPF
specifically is assumed, even where it resembles something already known.
C#'s own syntax, keywords, type system, and WPF's markup and mechanisms
get taught from first principles every time — resemblance to something
Python/JS-shaped is not the same as identity, and gets no shortcut.

## Cadence: just-in-time, not planned ahead

No upfront lesson roadmap, no fixed lesson count decided now. Each lesson
is scoped and written when it's reached, not drafted in advance — so what
gets learned building one lesson can actually change the shape of the
next one, instead of a stale plan getting followed past the point it
stopped fitting.

## Quality bar

Same rigor as `../lessons/`: every command really run, every claim about
what breaks actually broken and captured. This is not a draft-then-revise
process — get each lesson right on the first pass where possible; time
spent rewriting a lesson is time not spent learning the next thing.

## Format: `src/docs/reference/LESSON SCHEMA.md`

Lessons in this track follow that schema (the mechanical, step-by-step
template) and `src/docs/reference/LESSON_CONTRACT.md` (the philosophy it
enforces) — not the lighter, informal Concept Unit shape Lesson 1 used
before this rule was written. Two concrete, non-optional pieces worth
naming explicitly since they're easy to drop without a checklist:

- **Terms introduced in this lesson (glossary)** — a short section right
  after "What you need to know first," one line per term, using each
  term's real, look-up-able name (the language/framework's own name for
  it), for everything marked first appearance anywhere in the lesson —
  including a named pattern/principle bolded inside a CS or SE Lens, not
  just constructs literally tagged "(a) first appearance."
- **Execution traces** — real, concrete step-by-step values (or, for
  timing/callback code, a real numbered control-flow trace) for any code
  with a loop, recursion, or carried state — never a prose paraphrase of
  what it "generally does." Most WPF markup/config lessons won't trigger
  this; C# code with real control flow will.

Lesson 1 is retrofitted with a glossary (its content had no loops, so no
execution trace was owed) and with the concept-extraction pass described
above — `using`/`namespace`/`public`/the constructor/`partial` each now
have their own concept file with a real, run, dedicated isolated example
(a previously-flagged gap: they were explained only by reading real
generated files, with no throwaway lab — resolved by giving each one a
proper concept file rather than rewriting the lesson body itself). New
lessons from here on follow the schema in full from the start.
