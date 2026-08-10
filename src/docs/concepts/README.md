# Concepts

A catalog of individually-taught software engineering concepts, one file per
concept. This folder is designed to be portable — copied whole into future
projects as they start, and built on further from there. Nothing in it may
depend on `cam-project` specifically; see below.

Full rules live in `../extraction.md` (the "Concept Catalog Rule," "Depth
Rule," and "The 100%-match rule") and `../LessonContract` (the "Repetition
Rule"). This file is a short, practical summary for picking the folder up
cold — read those two for the authoritative version if anything here seems
to conflict.

## A concept file is a complete, standalone lesson

Not a summary, not a quick reference. Each file follows `LessonSchema.md`'s
own format, adapted for teaching exactly one concept in isolation:

- **Header** — the concept's name, what you'll understand by the end, real
  prerequisites (other `concepts/` files it builds on, if any).
- **Setup** — what needs to be installed or configured to run the example
  below, explained, not assumed. Runnable from a clean environment by
  someone who has never seen this project.
- **The problem**, in prose, before any code.
- **The isolated example** — the smallest disposable host that demonstrates
  exactly this concept, run for real, real output shown, and a sentence
  stating what that output proves.
- **Mechanical Walkthrough, Execution Trace, CS Lens, SE Lens** — exactly
  as `LessonSchema.md` defines them. Execution Trace is not optional
  decoration: `LessonSchema.md`'s own step 8 gives a mechanical trigger
  (a loop or equivalent comprehension/generator, recursion, a
  short-circuiting search, 2+ sequential same-kind constructions whose
  results accumulate/compare, or a branch/dispatch depending on state
  carried from an earlier step) — if the isolated example's own code
  meets that trigger, real, concrete step-by-step values are required,
  not a prose paraphrase of what the code "generally does." If none of
  the trigger conditions are met, say so explicitly rather than silently
  omitting the step.
- **Connection** — what this builds on, what commonly builds on it.
- **Try It Yourself** — closes every file: suggested modifications to the
  example and what result each should produce. This is what makes a concept
  file a lesson, not a reference page.

## Project-independent — no exceptions

Nothing in a concept file — not the example, not the walkthrough, not the
framing — may reference `cam-project`, `cnc-service`, `cnc-web`, a specific
lesson number, or any file path from this or any other specific project. A
concept file may say *what kind of* real system commonly uses it (a Flask
app, a REST API) as part of teaching where it's recognized in the world —
that's different from depending on this project's actual files to make
sense. If a concept file doesn't read as sensible dropped into a brand-new,
unrelated project with no changes, it isn't finished.

## The rule that matters most: 100% match, or it's new

A concept only gets skipped or abbreviated in a later lesson if it matches an
existing file here **100%** — same construct, same language, same semantic
purpose. Resembling something already here is not enough. "This is a method
call and we already have a method call" is not a match; a method call that
mutates in place and a method call that returns a new value are different
concepts wearing the same syntax. When genuinely in doubt, it is not a
match — write a new file. This catalog is meant to grow generously; two
similar-looking files sitting side by side is the expected, correct outcome
of a real distinction, not a mistake to tidy up.

The one thing this rule doesn't apply to: calling back to the same named
function, class, or file already built earlier in the actual project. That's
not a recurring concept, it's the project reusing its own prior work — a
one-line callback in the lesson's own prose, no catalog lookup needed.

## How a project lesson uses this folder

A project lesson never re-derives an isolated lab for a concept that already
has a file here. When a concept comes up:

- **100% match exists** → the lesson names the concept file directly and
  moves straight to showing how it's used in *this* project's real code
  (`LessonSchema.md`'s Project Change / New Code / Updated Project /
  Mechanical Walkthrough, applied in context) — that part is inherently
  project-specific and stays in the project lesson, never in the concept
  file.
- **No match** → the concept gets its full, standalone treatment written as
  a *new* file here (in the format above, project-independent), and the
  project lesson then does the same "applied in context" step referencing
  it.

A project lesson's own body should very rarely contain a full isolated
example anymore — that content belongs in a concept file, referenced by
name, not duplicated inline.

## Reference Implementation First

This catalog is extracted from the reference implementation, not from the
project roadmap.

Create a new concept file only after a completed project feature requires a
concept that cannot be satisfied by an existing catalog entry. The
implementation comes first; the concept is documented afterward.

**Failure mode:** creating concept files because a roadmap, vision document,
or planned feature mentions them before any completed project work actually
requires them. Future intent is not evidence that a catalog entry belongs
here.

The same rule applies even to concepts that are broadly applicable outside
this project. The question is never "is this a worthwhile concept?" The
question is "did completed project work require this concept?" If the answer
is no, it does not belong in the catalog yet.

Practical consequence: sessions that are not extracting concepts from
completed project work are limited to maintaining the catalog itself
(organization, consistency, compliance, and cross-references). They do not
add new concept files based solely on planned architecture or future
features.

## Status

Actively being populated — the first real pass is lesson 1 of `cam-project`'s
own curriculum, applying this rule retroactively. Each file here should read
as a complete lesson in its own right, usable with zero changes in any other
project.
