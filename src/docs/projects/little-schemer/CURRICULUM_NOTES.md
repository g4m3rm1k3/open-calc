# Curriculum Notes — Little Schemer

Working notes for whoever writes the next lesson (human or AI). Not
part of the lesson sequence itself.

## What this series is

A companion to Daniel P. Friedman & Matthias Felleisen's *The Little
Schemer* — short tutorials and challenges to accompany the reader's own
physical/purchased copy of the book, plus a persistent Scheme sandbox
(`/lab/little-schemer`) to work its exercises in. The user owns the
book; this series does not, and must not, reproduce its text, its
specific example lists, or its dialogue wording — that's a copyright
line, not a style preference. Every code example in this series is
original, written to teach the same concept the book's corresponding
chapter teaches, in different words and different sample data.

**Not a schema deviation, an honest adaptation of one field.** This
series follows `../reference/LESSON SCHEMA.md` in full, with one
adapted field: "Project Change" / "Files affected," which assumes a
real, incrementally-built project with files to edit. There is no such
project here — every lesson's code is a runnable snippet, standalone or
in the sandbox. Each Concept Unit states this explicitly ("No reference
counterpart," "Where this lives: nowhere permanent — run this here or
in the sandbox") rather than silently skipping the field. Likewise,
"Definition of done" does not end in a git commit — there's nothing to
commit — it ends in confirming the Exercises were run and, once the
lesson maps to a real book chapter, that the reader has the book open
to that chapter.

## The interpreter

`src/engines/scheme/schemeEngine.js` — hand-written, bundled, no
CDN/npm dependency (see `../../../src/utils/inlineRunner.js`'s
`runSchemeInline` and `src/labs/little-schemer/SchemeRepl.jsx`, which
both import it directly). Scoped deliberately to what the book uses,
not full R7RS:

- Has: `cons`/`car`/`cdr`, `null?`/`atom?`/`pair?`/`eq?`/`equal?`,
  `zero?`/`add1`/`sub1`/`number?`, `+`/`-`/`*`/`=`/`>`/`<`, `#t`/`#f`,
  `quote`/`'`, `cond`/`else`, `if`, `and`/`or`, `begin`, `lambda`,
  `define` (both `(define name (lambda ...))` and `(define (name
  args) body)` sugar), `display`/`newline`, `list`/`list?`, `not`.
- Does not have: string literals (the book never uses them — a
  `(display "...")` with a quoted string will error with a confusing
  "Unbound variable" message, since the tokenizer has no string-token
  case; don't teach string literals in this series, or fix the reader
  first), `call/cc`, macros, tail-call optimization, vectors,
  `let`/`let*`/`letrec` (not yet needed — add if a later book chapter
  needs one rather than pre-building it).
- The REPL sandbox keeps one persistent environment per session (so
  `define`s accumulate); every inline lesson code block gets a fresh
  environment per Run click (so lesson examples stay self-contained
  and don't depend on click order).

## Naming convention

`Lesson NN Title Case With Spaces.md`, matching `android-hardware-python`.
Lesson titles are concept-first per the schema (e.g. "One Syntax for
Code and Data," not "Getting Started").

## Status

- **Lesson 00 (done):** the syntax primer the book itself skips —
  prefix expressions, quote, `car`/`cdr`/`cons`/`null?`/`atom?`/`eq?`,
  `lambda`/`define`/`cond`. Does not map to any book chapter; it's
  purely a prerequisite for being able to read the book's own Chapter
  1 dialogue.
- **Lesson 01 (done):** maps to the book's opening chapter's
  territory — `atom?` in context, and building `lat?` (a
  list-of-atoms predicate) and `member?` from scratch, which is where
  the book first asks the reader to actually write recursive
  procedures. Original toolbox-themed examples (`wrench`, `bolt`,
  `gasket`), not the book's own example lists. Closes by pointing the
  reader at the book's own Chapter 1 questions, to work in the
  sandbox.
- **Not yet written:** everything past Lesson 01. Per this platform's
  usual pacing, don't write Lesson 02 until the user confirms they've
  worked through Lesson 01 (and, presumably, made progress in the
  book's own Chapter 1). When it's time: the book's next real
  territory is `member?`'s cousins built the same recursive shape
  (`rember`, list-building recursion that returns a new list instead
  of `#t`/`#f`) — natural Lesson 02 material, but confirm against
  the book itself before assuming that's exactly next, since chapter
  boundaries in the book don't necessarily line up one-to-one with
  this series' lesson boundaries.
