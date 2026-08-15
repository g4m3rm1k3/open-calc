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
  needs one rather than pre-building it), **arity checking** — calling
  a procedure with the wrong number of arguments does not error; extra
  arguments are silently ignored, missing ones bind to `undefined`.
  Real Scheme would raise an error here. Used deliberately as a "what
  breaks" demonstration in Lesson 09 (calling a curried one-argument
  procedure as if it still took three), but worth remembering as a
  real gap, not just a teaching device, if it ever causes a confusing
  result somewhere it wasn't intended to.
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
- **Lesson 02 (done):** maps to the book's Chapter 2's opening —
  `rember`, `firsts`, `insertR`, `insertL`. New recursive shape:
  list-*building* recursion (`cons` the kept/transformed item back
  onto a recursive call), distinct from Lesson 01's yes/no-answering
  shape.
- **Lesson 03 (done):** maps to the rest of Chapter 2 — `subst`,
  `multirember`, `multiinsertR`. New idea: separating "found a match"
  from "stop searching" — the multi- procedures recurse past a match
  instead of returning immediately.
- **Lesson 04 (done):** maps to Chapter 3 — `rember*`, `occur*`. New
  recursive shape: tree recursion — when `(car l)` is itself a list,
  recurse into it *and* into `(cdr l)`, as two independent calls,
  combined at the end (`cons` for building a list, `+` for counting).
- **Lesson 05 (done):** maps to Chapter 4 — `plus`/`minus` built from
  `add1`/`sub1`/`zero?` (not the engine's native `+`/`-`, deliberately
  — the point is proving arithmetic reduces to the same recursive
  shape as everything else), then `addtup` (reducing recursion,
  reapplying Lesson 01/04's throwaways) and `tup+` (first appearance
  of recursing on two list arguments in parallel).
- **Lesson 06 (done):** maps to Chapter 5 (Collectors) — `split-nums`,
  splitting a list into two piles in one pass via a **collector**: an
  extra function argument standing in for "what to do with the
  answer," rebuilt fresh (wrapped in a new `lambda`) on every
  recursive call. Got a full execution trace on a minimal warm-up
  (`report-length`) before the real branching procedure, per the
  schema's allowance to give a hard concept extra room instead of
  compressing it.
- **Lesson 07 (done):** maps to Chapter 6 (Shadows) — `numbered?` and
  `value`, a tiny evaluator for arithmetic expressions represented as
  nested lists (`'(1 add (2 mul 3))`). Named accessors (`left-of`,
  `op-of`, `right-of`) introduced to avoid raw nested `car`/`cdr`
  chains. Core new idea: reading a piece of data (the operator symbol)
  to decide which real procedure to call — the mechanism behind every
  real interpreter.
- **Lesson 08 (done):** maps to Chapter 7 (sets) — `set?`, `makeset`,
  `subset?`, `intersect`. Deliberately lighter/faster than surrounding
  lessons — almost entirely reapplication of `member?` (Lesson 01) and
  `multirember` (Lesson 03), no new recursive shape.
- **Lesson 09 (done):** maps to Chapter 8 (Lambda the Ultimate) —
  `eq?-c` (currying warm-up) and `rember-f` (generalizing `rember` to
  take its comparison test as a parameter, returning a specialized
  procedure). The tricky part: the returned inner procedure has no
  name of its own, so recursing means re-currying `(rember-f test?)`
  on every call, not calling itself by name. Also documented, honestly,
  a real interpreter gap this lesson's "what breaks" demo exposed: **no
  arity checking** — see "The interpreter," above.
- **Lesson 10 (done):** maps to the first half of Chapter 9 —
  self-application (`mk-length`), proving recursion doesn't strictly
  require `define` or a name: a procedure can recurse by being handed
  a copy of itself as an argument. The hardest lesson in the series —
  three Concept Units building up in very small steps, each with its
  own execution trace.
- **Lesson 11 (done):** maps to the rest of Chapter 9 and closes the
  series — the `Y` combinator, factoring Lesson 10's hand-written
  self-application machinery into one reusable tool. Shows the *naive*
  version first (`(f (x x))` with no delaying `lambda`), a real,
  verified crash (`Maximum call stack size exceeded` — the `define`
  itself never completes), before the working eta-expanded version.
  Proves reusability directly: the same unmodified `Y` builds both
  `length` and `sum`. Closing "Connect the Pieces" surveys the entire
  series, Lesson 00 through Lesson 11. Chapter 10 (the book's own
  closing synthesis, mostly a revisit of `value` from Lesson 07) is
  left as sandbox work per Lesson 11's own Exercise 4, rather than a
  dedicated Lesson 12 — there wasn't enough new material to justify
  one.
- **The series is now complete: Lesson 00 through Lesson 11**, covering
  the book's full syntax primer through Chapters 1–9. All 12 files
  verified clean — every ` ```scheme ` block across every lesson
  extracted and run standalone; the only errors that occur anywhere
  are the intentional "what breaks" and "the problem" demonstrations,
  matching each lesson's own documented output exactly.
- **Known recurring mistake, hit constantly while writing this
  series — treat as the default risk on every future lesson, not a
  fluke:** a later Concept Unit's code block calling a procedure
  `define`d in an *earlier* Concept Unit's own block, without
  redefining it in the later block too. Every lesson code block runs
  in a fresh environment per Run click (see "The interpreter," above)
  — a block that doesn't redefine everything it calls gets "Unbound
  variable" in the real Studio viewer, even though it looks fine on
  the page. Hit and fixed at least once in nearly every lesson from 01
  through 11. **Before considering any future lesson done, extract
  every ` ```scheme ` block from the file and run each one standalone**
  — read the file, regex out ` ```scheme\n...``` ` blocks, run each
  through `evalSchemeSource` with a brand-new `createEnv()`, check for
  unexpected `error`-type lines (cross-reference against each lesson's
  own documented "what breaks"/"the problem" demos, which are supposed
  to error).
- **If more lessons ever get added** (deeper Chapter 10 material, or
  material beyond the book entirely): the pattern to follow is
  established across 00–11 — pick the real new concept, verify every
  code sample against the actual interpreter before writing prose
  around it, watch for the split-fence mistake above, and keep
  examples original rather than transcribed from the book.
