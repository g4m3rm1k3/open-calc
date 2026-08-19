# Lesson Schema

This is the mechanical production template for every lesson in this
curriculum. `LessonContract` is the philosophy — what teaching means
here, and why. `Guide.md` is the per-concept dimension list. This
document is neither of those: it's the literal, ordered sequence of
things to write, so that following it _in order_ makes a code-dump
structurally impossible rather than relying on judgment each time.

**The rule this schema exists to enforce:** no two code blocks may ever
sit back-to-back with no prose between them. If you catch yourself about
to write a second code block right after a first one, stop — something
from the Concept Unit sequence below is missing between them.

---

## The Repetition Rule

Referenced throughout this document; defined here, once, so it's
self-contained.

**Every concept, construct, method, or term gets full, real treatment
at every single use it appears in — first appearance or the fiftieth.**
There is no reduced tier for reappearance. A **hard concept** (a design
pattern, an SE principle, a CS idea, a named architectural decision)
gets its real, full explanation — what it *is*, why it exists, what it
does — written out again, by name, every time it appears: never a brief
reminder, and never a bare "see Lesson N" citation. A **basic,
already-taught construct** (ordinary syntax, a previously-explained
method signature) gets the identical treatment: explained again, in
full, at this use — not silently passed over because it appeared
before.

This is a deliberate reversal of treating "already explained somewhere
earlier" as a reason to write less here. This schema used to require an
author to determine, while writing a lesson, whether some earlier
lesson already gave a thing full treatment, how well it did so, and
whether that earlier lesson was still usable as a citation target — a
real, recurring judgment call that failed in practice more than once.
That judgment call is gone: every lesson is self-contained and defines
everything it depends on, in full, inside itself, regardless of what
any other lesson does or doesn't say about the same thing, and without
needing to consult any other lesson to decide how much to write.

The one place a lesson number still belongs is the header's "What you
need to know first" list and the closing "next lesson" pointer — never
as a substitute for an explanation inside a Concept Unit's own prose.

---

## Concept Files — Reuse Across Lessons and Curricula

The Repetition Rule above governs reuse *within* a curriculum's own
lesson sequence. A concept file is the same idea applied *across*
lessons and curricula: a standalone file explaining one piece of
supporting material — never this lesson's own subject, only something
Terms Introduced or Objects and Methods would otherwise have to explain
inline.

**There is one shared catalog, not one per curriculum: `src/docs/concepts/`.**
Every curriculum draws from and contributes to this same folder — do not
create a project-local `concepts/` subfolder next to a lesson series;
that fragments a catalog that's deliberately meant to be single and
shared. `src/docs/concepts/README.md` is the authoritative format spec
for a concept file (Header, Setup, Problem, Isolated Example with real
run output, Mechanical Walkthrough, CS/SE Lens, Connection, Try It
Yourself) and its own rules for when a new file is warranted (the
100%-match rule: resembling an existing file is not enough to skip
writing a new one) — read it before authoring a concept file, and don't
re-derive a competing format here. `src/docs/concepts/GLOSSARY.md` is a
generated index, one line per file — check it before opening candidate
files by hand, though a matching name or summary still has to be
confirmed by reading the real file, never assumed.

**Lookup, from a lesson, is by filename, not by path.** A lesson
references a concept file with a `` `some-concept.md` `` code span or a
`../concepts/some-concept.md`-shaped link; the viewer resolves it
against `src/docs/concepts/` by filename regardless of the actual
relative path written, so an author never has to compute the correct
`../` depth by hand. The reference renders as a clickable trigger, not
inline text: it opens the concept in its own panel with its own
breadcrumb, separate from the lesson's reading flow. A concept file's
own body can reference another concept file the same way — the panel's
breadcrumb handles the chain, so this is always safe and needs no
special handling by the author.

**When to factor something out instead of writing it inline:** the
supporting concept is general enough that it plausibly recurs in a
*different* lesson or a *different* curriculum — a design pattern, a
CS idea, a language feature not specific to this lesson's own code.
Genuinely narrow, one-off material — what one specific line of *this*
lesson's own code does — stays inline, as it always has.

**Self-check:** for every Terms/Objects-and-methods entry this lesson
writes inline, could it plausibly recur in another lesson or another
curriculum? If yes, does `src/docs/concepts/GLOSSARY.md` already show a
matching file — and if not, should this lesson's explanation be the one
written as a new concept file there, per `concepts/README.md`'s format,
rather than inlined?

---

## Header (write once, before any Concept Units)

```
# Lesson N: <title>
```

Title is concept-first, not feature-first. Not "Lesson 2: File Browsing."
"Lesson 2: Trusting Input at a Boundary" (feature as subtitle if wanted).

- **What you will build** — one paragraph. State the working feature,
  then state the transferable problem(s) this lesson is actually about.
- **What you need to know first** — name the specific prior lesson(s) and
  specific concepts from them being reused. "Nothing" only for Lesson 1.
- **Pipeline diagram, if applicable.** Once a lesson touches any stage of
  a named multi-stage pipeline this curriculum has established (for
  example, `Text → Lexer → Parser → AST → Semantic Analysis`), open by
  restating the full pipeline, mark which stage(s) this lesson touches,
  and carry one concrete literal value through _every_ stage built so
  far — not just the stage this lesson adds. A lesson that only shows
  its own new stage in isolation leaves the reader unable to place it in
  the whole system.
- **Terms used in this lesson** — a short glossary, immediately after
  "What you need to know first." One line per term this lesson's code
  actually depends on — new and reappearing alike; per the Repetition
  Rule, above, a term used again gets its own full entry here again,
  the same as a genuinely new one, never a second-tier reminder.
  Format: the term, bolded, an em-dash, a plain
  definition — and, same as everywhere else in this schema, *why* the
  term or thing exists or what problem it solves, not just what it
  means. A reader who has never worked in this lesson's language or
  framework before should be able to read this section once and feel
  oriented before meeting any of these terms in real code, rather than
  meeting each one cold, mid-block.
- **Objects and methods used** — immediately after Terms introduced.
  Covers every real external class, interface, or method this lesson's
  code depends on — never a language keyword, annotation, or operator
  (`extends`, `@Override`, `abstract`, a generic type parameter, the
  ternary operator, an access modifier); those are concepts, not
  objects or methods, and belong in Terms Introduced instead, with
  their own real definition there. This includes the lesson's own
  subject when that subject is a real class or method, not only
  supporting cast: a lesson teaching `println`/`javac`/`java` (Java's
  entry-point mechanics) still gives each of those three its own real
  entry here, even though they're what the lesson is *about* — "given
  full treatment below" is a deferral, not a substitute for an entry,
  and it has to resolve into one.

  **Format: one bolded name, then three labeled sub-bullets** — *What
  it is:* (its conceptual identity), *Implementation:* (its real,
  concrete shape — a signature, a return type, an inheritance
  relationship, a constant's actual value), *Its use:* (why this
  lesson's code reaches for it specifically). This is not prose wrapped
  around the same three facts; a paragraph that mixes "what it is" and
  "why it's here" into one flowing sentence fails this the same way a
  multi-member shape explained as one paragraph fails the "own bullet"
  rule below — the reader needs the three facts visually separable, not
  just present somewhere in the text.

  **CRC breakdown — added to every entry, alongside the three facts
  above, never replacing them.** Immediately after *What it is* /
  *Implementation* / *Its use*, every Objects and methods entry also
  carries five more labeled sub-bullets, in this exact order and under
  these exact labels — a Class/Responsibility/Collaborator card (a real,
  decades-old OOP design technique), extended with a fifth field for
  where the thing sits architecturally. "Class" here means whatever
  structural unit the language or paradigm actually uses for this
  entry — a class, a struct, a standalone function, a module — not
  literally a class in every case.

  - *Type:* the exact class/method/function signature — its structural
    shape, restated here even when *Implementation*, above, already gave
    it; this field names *what kind of thing* this is (a class, a
    `static` method, an instance method, an interface, a free function),
    not just its signature in isolation.
  - *Responsibility:* its full job description, stated as a charter —
    the complete scope of what this thing is answerable for, never one
    benefit or side-effect dressed up as the whole job. "Manages the
    list of registered listeners and notifies each one, in order,
    whenever the subject's state changes" is a responsibility; "lets you
    add a listener" names one thing it happens to let you do, not the
    job.
  - *Depends on:* what has to be handed to it — constructor arguments,
    method parameters, an object it's called on, an ambient resource —
    for it to be able to do that job at all.
  - *Connects to:* who calls it, what it calls in turn, and what data or
    control actually flows across each of those edges — not just a list
    of neighboring names with no stated direction.
  - *Shape:* where this sits in the lesson's or project's architecture —
    which seam, layer, or boundary it represents (a public API surface,
    an internal implementation detail, a callback boundary between
    framework and app code, a data-transfer boundary between two
    subsystems).

  Every entry ends up with eight sub-bullets total, not three and not
  five — the original three explain the thing in isolation; the CRC
  breakdown explains it as a piece of a system: what it's on the hook
  for, what it needs from its surroundings, and who it talks to.
  Skipping the CRC breakdown because the original three already "cover
  it" is exactly the omission this addition exists to prevent: *Its
  use* states why this lesson's code reaches for it, which is not the
  same claim as *Responsibility*'s full charter, and *Implementation*'s
  signature is not the same claim as *Connects to*'s actual call graph.

  **Primary vs. supporting cast is about placement, not treatment.**
  Every entry gets the full three-part format regardless of category.
  Items that *are* this lesson's own subject go first, in the order the
  lesson's own Concept Units introduce them — often right where the
  code or the framework contract that uses them is first shown, not
  bunched separately. Everything else — a reappearing construct from an
  earlier lesson, a class named only because it appears in a quoted
  framework contract or an XML tag, a diagnostic tool used to prove a
  claim — goes under a trailing heading, verbatim: **"Everything else
  in the file, not this lesson's subject but still explained."** A
  reappearing item's *Implementation* line states its real, concrete
  shape again in full, the same as a first appearance would — never a
  citation to the lesson that gave it full treatment instead of
  re-deriving it (this is the Repetition Rule applied at the level of
  this section's own format).

  **A tag, declaration, or file is its own artifact, separate from
  whatever class or concept it names or wires to.** An XML `<activity>`
  entry is not the same thing as the `Activity` subclass it declares; a
  Manifest permission tag is not the same thing as the runtime
  permission constant it names. When a lesson's code contains such a
  declaration, the declaration itself — not only the class or constant
  it references — gets its own entry if its own syntax carries meaning
  worth explaining (a leading-dot package shorthand, an attribute that
  changes build-time behavior).

  **Every "Lesson N" forward-reference is a promise that must be kept,
  correctly addressed.** When this lesson explicitly defers a concept's
  real explanation to a specific future lesson ("flagged, not explained
  yet — Lesson N covers this"), that citation is a commitment: Lesson N
  must actually deliver it, under that exact name, by the time this
  curriculum is done. This is not a one-time check — restructuring
  which lesson actually explains something (a common, legitimate
  outcome of later editing) obligates updating every earlier citation
  that pointed at the old location, not just adding the new
  explanation elsewhere. An unfulfilled or misdirected "Lesson N"
  citation reads, to a working student, exactly like a promise that was
  never kept — worse than an honest "not needed yet," because it
  invites them to go looking for something that isn't where it says it
  is.

  When such a type's shape isn't obvious from a single call (see step
  7's "Objects and methods used, not extended" callout, below), show
  its real declared shape here too, not only inline at the call site.

---

## The Vocabulary Extraction Rule

Every Header failure this schema has caught in practice traces back to
the same root cause: Terms and Objects/methods got assembled from memory
or feel while drafting, and a technical word — an annotation quoted
inside a signature, a keyword reappearing from an earlier lesson, a named
exception mentioned only to explain a consequence — slipped into later
prose without ever getting its own entry above it. Catching that after
the fact means re-reading the entire finished draft looking for anything
that feels unexplained, which is expensive, unreliable, and gets more
expensive the longer the draft already is.

**The fix is ordering, not vigilance: extract every token before writing
any prose, then compose the prose from that fixed list, never the
reverse.**

1. Before drafting Terms or Objects and methods, collect every code span
   this Concept Unit will show anywhere — the New Code block, any
   isolated lab code, and any real signature quoted inside an Objects and
   methods *Implementation* bullet. An annotation like `@NonNull`
   appearing only inside a quoted signature still counts; it does not get
   a pass for sitting one level removed from the main code block.
2. Tokenize each span into its distinct pieces: every keyword, annotation,
   operator, type name, method name, and named constant.
3. Every token gets a slot — a Terms entry (a keyword, annotation,
   operator, or reappearing language concept) or an Objects and methods
   entry (a real class, interface, or method) — decided by the category
   rule already given above, never by which section "feels right" in the
   moment. Fill every slot before writing a single word of the Concept
   Unit's own prose.
4. Once the Header is assembled this way, it becomes a closed vocabulary:
   no later section — Mechanical Walkthrough, CS Lens, SE Lens, Connect
   the Pieces, Commands Needed — may introduce a technical word that
   doesn't already have a slot. If writing a sentence in one of those
   sections turns out to need a word with no slot, that is the signal a
   token was missed in step 2 — stop, add the slot to the Header, then
   finish the sentence. This is cheap the moment it's caught (one slot,
   added immediately, in place) and expensive the moment it isn't (a full
   re-read of an already-finished draft, hunting for whatever else
   slipped through the same way).

This does not replace the closing self-check's own vocabulary-related
items — it is what makes passing them the default outcome of writing a
lesson once, instead of the result of a second, separate pass over an
already-finished one.

---

## The Recursive Concept Extraction Rule

Before writing a lesson, recursively analyze the project code being added
to identify every **new teachable concept** in it.

A teachable concept is any language feature, library API, framework
feature, programming construct, design pattern, software engineering
principle, computer science idea, architectural decision, tooling
concept, or project-specific abstraction that has not already been
introduced earlier in the curriculum. This definition is deliberately
generic rather than an enumerated list — an enumerated list of "these
count as concepts" would need constant upkeep as new languages and
frameworks enter the curriculum, and would wrongly imply that anything
not on the list doesn't count.

If a piece of code introduces more than one new concept, split it at the
seam between those concepts into separate Concept Units and repeat the
question on each half. Per the Repetition Rule, above, a previously-
taught concept reappearing still gets its own full, real explanation
here, not a brief reminder — "new concept" versus "reappearing concept"
governs how a lesson is *split into units*, not how much either one
gets explained once it has a unit. The goal is the smallest
_meaningful teaching sequence_ — not the smallest syntax tree.

**Worked example.** On first appearance,
`button.addEventListener("click", () => { save(); });` contains three new
concepts, not one and not eight: `addEventListener` (a new DOM API —
registering a callback for an event), the arrow function (new language
syntax), and `"click"` naming a specific event type worth a clause.
`save()` is an existing function, already taught — no new unit for it.
`(`, `)`, `{`, `}` are not concepts at all; they're syntax that rides
along with whatever construct they belong to.

### The Stopping Rule

Continue splitting until each Concept Unit introduces exactly one new
concept — then stop. Do not split further into individual punctuation,
operators, or basic syntax already taught earlier in the curriculum,
unless that exact token _is_ the concept being taught (a first-appearing
ternary operator `? :` is a concept; a `(` closing an already-familiar
function call is not). The test at every candidate leaf: **"has this
exact idea — not this exact character — been taught before?"** If yes,
stop there. The objective is pedagogical clarity, not syntactic
minimalism — over-decomposing into already-known punctuation is its own
failure mode, not a safer default.

---

## The Concept Isolation Rule

The first appearance of every new concept is taught using **throwaway
code**, never production project code, before that concept is used for
real. This is the Contract's Concept Labs section, restated here as a
standalone rule because it's load-bearing for the Concept Unit sequence
below.

**This applies to every language construct, not just the ones that feel
dense or unfamiliar** — `LessonContract`'s own wording: "familiar-sounding
is a trap, not a reason to skip the lab." A construct with a direct
equivalent in a language already taught (Python's `@dataclass` after
already knowing classes; JavaScript's spread `...` after already knowing
object literals) still gets a lab — the _idea_ may be familiar, but this
specific syntax and behavior is not, and those are different knowledge.
This schema has, in practice, sometimes explained a new construct
directly inside a real function's Mechanical Walkthrough instead of
isolating it first — that is a violation of this rule even when the
explanation itself is accurate and complete. Per the Repetition Rule,
above, there is no "already lab'd earlier in the curriculum" skip
condition — see this rule's own restatement of that, right below.

Throwaway code must:

- demonstrate only the one new concept, with the minimum surrounding code
  needed to run it — no unrelated project code, no second new concept
  riding along;
- actually be executed, with its real output shown;
- state what that output _proves_ about the concept, not just what the
  code does;
- be explicitly discarded once understood — it never appears in the
  project again.

This distinction matters beyond tidiness: most tutorials teach using
examples that quietly become part of the project, so a student can never
tell whether they've learned a transferable concept or just copied an
implementation detail. Discarding the throwaway example on purpose is
what keeps that line clear — _this existed only to teach; the project
never depended on it._

**Per the Repetition Rule, above: a lab is not something a construct
earns once and is done with.** A construct gets an isolated throwaway
lab at every appearance that introduces it into a new lesson's own
Concept Unit sequence — this rule does not carry an "already lab'd
earlier in the curriculum, skip it" exception. Whether a specific
Concept Unit needs one is governed entirely by whether *this lesson's*
own Recursive Concept Extraction Rule enumeration (below) surfaces the
construct as something this Concept Unit is built around — not by
whether some earlier lesson already ran a lab for it.

---

## Concept Unit (repeat this entire sequence for every new concept)

A Concept Unit is the smallest section of a lesson that introduces
exactly one previously-untaught concept, per the two rules above.

**Formatting.** Each numbered step below is written as its own `###`
heading (e.g. `### The Problem`, `### The New Code`, `### The Updated
Project`, `### CS Lens`) — not
a bolded run-in phrase folded into a paragraph. A header followed by a
code block, followed by a header for the prose explaining it, reads as
distinct scannable steps; a bolded phrase buried at the start of a
paragraph reads as prose with labels stapled on. The unit's own title
stays one level up (`## Concept Unit: <name>`), so headings nest
`## unit → ### step` throughout.

1. **The Problem, in prose, no code yet.** What are we trying to solve,
   right now, specifically?

2. **Introduce the concept in isolation** (Concept Isolation Rule) —
   throwaway code, run, real output shown, what the output proves. Per
   the Repetition Rule, above, this step is not skipped because the
   concept was lab'd in an earlier lesson — every Concept Unit built
   around this construct gets its own real, executed lab.
   **When the real project input this construct will face is genuinely
   complex** (a full G-code line, a real multi-field form), don't jump
   straight from a minimal lab to that full complexity — run the real
   construct against a short escalating sequence of tiny inputs first,
   each one changing exactly one thing, so the construct becomes a
   practiced skill before it meets the input it was actually built for.

3. **Discard the throwaway example.** State plainly that it's deleted and
   will not appear in the project again.

   > **Step ordering, for lessons written from this point forward:**
   > steps 2-3 (isolate, discard) read better placed *after* steps 4-6
   > (Project Change, New Code, Updated Project) instead of before them —
   > see the real project code first, so the isolated lab has something
   > concrete to explain and relate back to, rather than justifying
   > itself by abstract foreshadowing alone. When reordered this way, the
   > isolated lab's own explanation must explicitly reference the real
   > code just shown ("this is exactly what `X` in the code above is
   > doing, isolated") — not just teach the concept generically, as if
   > the reader hadn't just seen it in context. Isolation is still the
   > point; isolation with a concrete anchor to relate back to is better.
   > This is a preference for **new** lessons only. Existing lessons
   > using the original isolate-then-build order are not being revised
   > to match, and the original order remains fully valid — do not flag
   > or rewrite them for this reason alone.

   > **Name the concept, for lessons written from this point forward:**
   > step 2's own instructions above only say to demonstrate the
   > concept's *behavior* — run it, show output, state what it proves —
   > without ever requiring the concept's actual *name* to appear
   > anywhere. Somewhere in this step (naturally, right after the real
   > output, in the same sentence that states what it proves), say the
   > name plainly and in bold: "this is called a **lambda expression**,"
   > not just a description of what it does. A reader should walk away
   > with a term they could say out loud or search for, not just an
   > unnamed feel for a pattern. This is a preference for **new** lessons
   > only, same as the step-ordering note above — existing lessons are
   > not being revised to add this retroactively.

4. **Project Change.** Before showing the real code, state exactly how it
   lands in the actual project — a _delta_ against the previous lesson's
   end state, never a full project snapshot (that's noise; the whole
   point of this schema is not re-explaining what's already established).
   State:
   - **Reference Source** — if this unit's subject has a real counterpart
     in a reference implementation the project is being built toward, the
     exact file and line range, quoted verbatim (not paraphrased, not
     summarized from memory — read this session). If no real counterpart
     exists, say so explicitly: *"No reference counterpart — this is a
     from-scratch addition because ___."* This field comes first,
     because nothing below it can be trusted to be a faithful port
     without it. See `LessonContract`'s "Reading the Real Source."
   - **Files affected** — created, modified, or deleted, by exact path.
   - **Change type** — add, replace, remove, refactor, or configure.
   - **Location** — where in the file, named by what's already there
     ("after the `CORSMiddleware` block added in Lesson 1," "inside
     `renderFileList`, replacing the `if (entry.is_directory)` branch").
   - **Dependencies** — anything this change requires that isn't already
     present (a package, an earlier lesson's code, a running service).

   A reader must never have to infer which file they're editing or where
   a snippet belongs. Skip only the fields that are genuinely inapplicable
   (a brand-new file has nothing to locate a position _within_) — never
   skip the section itself, and never skip Reference Source silently even
   when the honest answer is "none."

5. **The New Code — type it yourself.** Already run through the
   Recursive Concept Extraction Rule — the smallest resulting piece, not
   a whole function or file. Written as something to actually type, not
   just read — the smallest fragment that can be typed and run before
   any explanation follows.

6. **The Updated Project — return, immediately, before any explanation.**
   This step comes right here, directly after the code, _before_ the
   walkthrough and lenses — not after them. A reader who has just seen a
   two-line fragment does not yet know where it lives; making them read
   several paragraphs of explanation while holding a placeless fragment
   in their head is the actual failure this step exists to prevent.
   Immediately show the smallest enclosing structure that already existed
   — the function, the block, the element — with the new piece placed
   inside it and marked (`// ← new`, or a `diff`-style `+` prefix for a
   replace/remove Project Change), and say, briefly, what that structure
   now does as a whole. Orientation first, then explanation. **Never
   elide any part of the shown structure** — no `{ ... }`, no
   `// ...unchanged from here down`, no placeholder standing in for real
   code, even code just shown moments earlier in step 5, even code
   that's genuinely identical to an earlier lesson. This has already
   failed once under this schema: eliding a just-shown function defeats
   this step's entire purpose, which is a reader actually _seeing_ where
   they are, not being told to trust that it's fine. If the enclosing
   structure is too large to show whole without becoming a dump, that is
   a sign the unit itself is too large — split it — not a license to
   elide. Skip this step only when step 5's code _is_ the whole new
   structure with nothing surrounding it yet (a brand-new file or a
   freestanding new function) —
   Project Change already covers that case ("a brand-new file has nothing
   to locate a position within").

7. **Mechanical walkthrough — how it works in isolation.** Before writing
   a word of prose, literally enumerate every distinct syntactic element
   in step 5's code block, in the order it appears — every method call,
   every property access, every operator, every literal. **A fluent or
   chained call sequence (`builder.a(...).b(...).c(...)`) is every one of
   those method calls, not one code block to wave through as a unit** —
   each link gets its own place in the enumeration, the same as if the
   calls were written on separate lines; showing the whole chain once
   and explaining only its overall effect is exactly the same failure as
   skipping any other syntactic element. Do not read the block
   holistically and write about "what seems worth mentioning"; that
   is exactly the failure mode this step exists to prevent, and it has
   failed silently before under this schema, more than once, in exactly
   this way. **Per the Repetition Rule, above, every item on that
   enumeration gets full treatment** — what it is, what it does, what it
   returns, and, when it's a hard concept (a pattern, a principle, a
   named CS idea), a real restatement of what the concept *is*, by name.
   There is no "genuinely basic, already-established syntax, silently
   reusable" exit anymore: a variable read or an already-taught operator
   still gets its own real sentence here, every time it appears, not a
   silent pass. The failure this enumeration exists to catch is treating
   something as too basic or too familiar to explain because it felt
   unnecessary in the moment — the enumeration step exists specifically
   so every item is checked against the actual code, one by one, rather
   than silently waved through on the assumption the reader already
   has it.

   > **Objects and methods used, not extended — show the shape, not just
   > prose, once full treatment applies.** The Parent Contract Rule
   > (below) already requires showing a framework type's real declared
   > shape when a lesson has the reader `extend` or `implement` it. The
   > same failure happens on the *usage* side, without any
   > `extend`/`implement` in sight: a lesson's code calls a method on an
   > external class or interface it neither wrote nor is subclassing —
   > a library, a framework service, a standard-library type — and full
   > treatment for that first appearance stays in prose only. Prose
   > alone stops being enough once either holds: **(i)** the lesson
   > calls more than one related member of that same external type (a
   > registration method and its exact removal counterpart; a factory
   > method plus the accessor methods it implicitly builds for you), or
   > **(ii)** a value passed to or returned from the call is a
   > *compound type* — a container, a builder, anything capable of
   > holding more than the single value one call site happens to show.
   > When either is true, show the real declared shape of only the
   > specific members this lesson actually calls — never the whole
   > class — as a code block verified against real documentation or
   > source, at or before the first call site. This failed once
   > already: a lesson's prose correctly stated that a factory method
   > "builds a container holding your value," which was true and
   > exactly where the reader got stuck, because nothing showed that
   > the container could hold *more than one* such value, or named its
   > other real members. The fix was not a longer sentence — it was
   > showing the container's actual declared shape, so the reader could
   > see its members in relation to each other instead of reconstructing
   > that relationship from a single call site. Skip this when Define
   > at Use's ordinary per-call treatment already fully covers what's
   > called — a single simple method, one plain input, one plain
   > output, needs no shown shape, just the explanation already required
   > above.

   > **Every method, object, or function explanation starts with its
   > own bullet — never explained inline inside a paragraph about
   > something else, even when there's only one.** This applies to the
   > shape block above and to the Parent Contract Rule's shape block
   > alike, and also beyond shown shapes entirely: any time prose
   > names and explains what a specific method, class, or function is
   > or does, that explanation gets its own bullet, leading with the
   > name, rather than being folded as a clause into a sentence about
   > something else. A paragraph that explains two or three things in
   > a row — "`ClipData` is built from two parts: a `ClipDescription`
   > \[...\], and one or more `Item`s \[...\]" — is factually complete
   > and still fails this: the eye has nothing to align each thing with
   > its matching line, and a reader skimming for "wait, what's an
   > `Item`" has to read the whole paragraph to find it. This is not
   > only a multi-member-shape rule; a single method mentioned in
   > passing inside unrelated prose gets pulled out to its own bullet
   > too, the moment it's actually being explained rather than just
   > named. Plain prose stays plain prose only for connective narration
   > between bulleted explanations — never as a container for one.

   > **The purpose of all of this is demystification — prove it's
   > ordinary, inspectable code, not opaque magic.** Before explaining
   > any framework or library construct, get its actual *kind* right: a
   > `static` method has no state and is not an object; a class is a
   > blueprint, not a running thing; a constant is a fixed value
   > computed once, not recomputed per use. Conflating these is itself
   > a common source of confusion and worth a sentence whenever it
   > isn't obvious. Then state, concretely, where the thing actually
   > comes from: real source code, written by a real person, sitting in
   > a real file the student's own toolchain already has a local or
   > fetchable copy of — never "the framework handles this" or "the
   > system generates this" as an unexamined black box. When the real
   > implementation is short enough to be illuminating, show its actual
   > body as the proof — fetched and confirmed from the genuine current
   > source *this session*, never reconstructed from memory and never
   > trusted from an unverified secondary reproduction (a blog post, a
   > tutorial, another AI's paraphrase) that was itself never checked
   > against the real thing. This failed once already: a secondhand
   > reproduction of `ClipData.newPlainText`'s body looked plausible,
   > read well, and was wrong — the real method calls a different
   > constructor than the one shown, and builds its supporting constant
   > differently. Fetching the actual current source caught it; nothing
   > about reading the wrong version *felt* wrong until it was compared
   > to the genuine artifact. State, generically for whatever language
   > or tooling is in play, the concrete way a reader could go find this
   > themselves — cite the library's own official public documentation
   > for the method's contract when one exists (the fastest check, no
   > IDE or source browsing required), and separately, for the
   > implementation itself, an IDE's go-to-definition or the language
   > or library's own public source repository. Anything the shown real
   > implementation itself references — another type, a constant, a
   > helper — must already be explained by this point in the lesson, or
   > get explained now; a "here's the real code" reveal that quietly
   > introduces new unexplained names has traded one mystery for
   > another instead of removing one.

   > **Naming the kind once is not enough — the whole bullet has to
   > stay in real vocabulary, not revert to paraphrase.** "Get its
   > actual kind right," above, is not satisfied by a single passing
   > word like "static" followed by plain-English paraphrase for
   > everything else in the bullet. The item's real declaring type
   > (`java.lang.String`, not "a helper"), its real parameter and return
   > types when they carry any of the reasoning (`CharSequence` vs.
   > `String`, `Editable` vs. either, a primitive `int` vs. a boxed
   > `Integer`), and the specific conversion or contract actually at
   > play have to appear in the bullet's own sentences — the effect on
   > the user is explained *in addition to* the mechanism, never as a
   > replacement for it. *"`quantityInput.setText(...)` pre-fills the
   > field with the item's current quantity"* names an effect and no
   > mechanism at all — a reader still can't say what type `setText`
   > actually takes, or why the raw `int` sitting right next to it
   > couldn't be passed directly. Naming the mechanism: *"`setText` is
   > an instance call on `EditText` accepting a `CharSequence`;
   > `String.valueOf` is a separate, static call on `java.lang.String`
   > converting the primitive `int` `getQuantity()` returns into that
   > required type, because `setText` has no overload accepting a raw
   > `int` — Java does not implicitly convert numbers to text the way
   > some scripting languages do."* This failure survives correct
   > decomposition: a walkthrough can isolate every call into its own
   > bullet, per the enumeration rule above, and still fail this if each
   > individual bullet drifts back into behavior-only paraphrase instead
   > of naming its own real mechanism.

   > **Explain, don't just describe — for every item, not only hard
   > concepts:** "explain" and "describe" are not interchangeable, and
   > this schema means the stronger one. To *describe* something is to
   > give an account of its appearance or characteristics — what it
   > looks like, what it's called, what it does, stated flatly. To
   > *explain* something is to give the reasoning behind it — why it
   > works, why it's shaped this way, what would go wrong without it, what
   > it lets the reader do that they couldn't before. A walkthrough bullet
   > can be factually accurate and still fail this schema if it only
   > describes: *"`onCreateViewHolder` inflates the row layout and returns
   > a new `InventoryViewHolder`."* That sentence is true and says nothing
   > a reader couldn't get from reading the method signature. Explained:
   > *"`onCreateViewHolder` inflates the row layout and wraps it in a new
   > `InventoryViewHolder` — new, because this is the one method
   > `RecyclerView` calls only when it needs a row it doesn't already have
   > lying around to reuse; every other visible row reuses an existing
   > `ViewHolder` instead of coming back through here, which is the entire
   > performance idea this class exists for."* Same fact, plus the reason
   > it's true and why it matters. This applies to every item in the
   > enumeration above, new or reappearing alike — not just the ones
   > that feel conceptually hard.
   > A whole walkthrough of accurate, well-written descriptions, with
   > zero reasoning anywhere in it, fails this schema completely, even
   > with nothing factually wrong in it.
   >
   > **When a concept genuinely needs more room than a clause to explain,
   > take the room — do not compress a hard concept down to fit a
   > one-line bullet.** A longer paragraph inside the same Concept Unit,
   > an extra Concept Unit inserted before the one that needs it, or, for
   > a concept that's genuinely load-bearing for everything after it, a
   > whole extra lesson — all of these are correct tools, and reaching
   > for one is not a sign the lesson plan failed. Compressing real
   > difficulty into a single under-explained bullet so the lesson "stays
   > the right size" is the actual failure: a reader who is quietly lost
   > on bullet four of fourteen has not been taught, no matter how
   > correct bullets one through three were.
   >
   > **Explain the concept, don't cite the lesson:** per the Repetition
   > Rule, above, a hard concept reappearing gets its real, full
   > explanation restated here, in this lesson's own prose — not a
   > citation to where it was explained before. "The same Observer
   > pattern `Doorbell`/`Chime` already proved: a subject holds a list
   > of listeners and calls each one back when its own state changes,"
   > not "reappearing from Lesson 2c." A parenthetical lesson citation
   > with nothing else ("— reappearing (Lesson 2c)") is not an
   > explanation; it's an assertion the reader has to go verify by
   > opening another file, and it fails this rule exactly like silence
   > does. Never hyperlink to the earlier lesson either — the site's
   > search finds where a concept was introduced and everywhere else
   > it's used; that's the lookup path, not an in-body citation. The one
   > place a lesson number belongs is the header's "What you need to
   > know first" list and the closing "next lesson" pointer — never
   > inside a Concept Unit's own prose.

   **Execution trace, if this code carries a loop, recursion, or state
   across steps.** A prose description of what a loop "generally does"
   is not sufficient — show the concrete sequence of real values the
   code actually produces, step by step, in a consistent, scannable
   format:

   ```
   Iteration 1: i 0 → 3, tokens = ["abc"]
   Iteration 2: i 3 → 4, tokens = ["abc", " "]
   ```

   The reader must see the actual values a real run produces, not a
   paraphrase of the logic that produces them. Values alone are not
   enough, either: showing `i 0 → 3` is a description of what changed,
   not an explanation of why — every line needs both. State what in the
   code caused that specific value, on that specific iteration, to come
   out the way it did (which condition matched, which branch ran, which
   argument was passed) — not just the before/after values themselves.
   A trace a reader could reproduce by staring at bare numbers with no
   sentence attached has described the run, not explained it, and fails
   this requirement exactly as a prose paraphrase would.

   **This creates a real tension with the fenced `Iteration N: values`
   format itself, and it has already failed once under this rule.**
   Satisfying "explain why," honestly, tends to produce a full sentence
   with a subordinate clause ("...because `id` is a plain, non-static
   field, this copy belongs to `a` alone") — and a fence full of long,
   unwrapped prose sentences is exactly the second shape's own
   failure mode (below), just reached from the values side instead of
   the timing side. **The test is about the shape of the content, not
   which of the two triggers (changing values vs. timing) produced it:**
   if a line is still terse and tabulate-able (`i 0 → 3, tokens =
   [...]`), keep it fenced. The moment explaining "why" pushes a line
   into a real sentence, drop the fence and switch to the second
   shape's unfenced numbered-list format below, even though the
   underlying data is still "changing values," not timing. A fenced
   block of full sentences is not a valid third option.

   **A second shape of execution trace: control flow / timing, not
   changing values.** Some code needs a trace for a different reason —
   not a loop transforming data, but a sequence of calls where the
   entire point is *when* each one actually runs relative to the
   others (a registered callback firing later; a framework invoking an
   override at a moment the reader doesn't control). There's no
   tabulate-able value here, only moments, and each one needs real
   reasoning, not just a position in a list — which means the terse
   `Iteration N: values` format above is the wrong tool for it. This
   has failed once already under this schema: an execution trace for
   exactly this shape was written as full prose sentences wrapped in a
   code fence, which reads as garbled monospace paragraphs and
   misrepresents prose-about-code as if it were code or real output.
   Use a numbered list instead — real markdown, not fenced — one step
   per statement, the statement itself as an inline code span, followed
   by prose stating what happens and, where it's the crux, why a reader
   would expect otherwise. For example:

   1. `doorbell.setCallback(new Chime())` — builds a real `Chime`
      object, but only *stores* it; nothing calls `onTap()` here.
   2. `println("Chime registered...")` — prints before any chime
      sound, proving step 1 didn't already fire it.
   3. `doorbell.press()` — only now does `Doorbell`'s own code decide
      to call `callback.onTap()`.

   **A claim about hidden or invisible behavior needs the same proof, not
   just a confident sentence.** "The compiler generated it," "this
   happens automatically," "the framework does this behind the scenes" —
   any sentence describing behavior the reader cannot see by reading
   their own source is exactly the kind of claim this section's own
   "prose isn't proof" standard applies to, and it's easy to forget that
   mid-explanation because the sentence *sounds* like an explanation
   rather than an assertion. If a real tool can show it — disassembling
   a compiled file, inspecting a generated artifact, printing an object's
   actual runtime shape — show that output. This failed once already:
   Lesson 6b's own trace opened with "prose asserting `Inner` secretly
   holds a reference isn't proof," then two lines later asserted "nothing
   in `Inner`'s own field list shows this reference exists, because the
   compiler generated it, not you" — with no verification at all,
   violating the standard it had just stated. The fix: compile the code
   for real and run `javap -p` against the compiled class, showing the
   actual synthesized field (`final Outer this$0;`) the compiler
   added — an assertion turned into inspectable evidence.

   Never wrap this shape in a code fence. The content is prose that
   references code, not code itself; a fence misrepresents it as
   something copy-pasteable or executable, and renders as an
   unreadable wall of monospace paragraph text.

8. **CS lens.** Name the computational concept this embodies, if any.
   **For a hard concept specifically** (per the Repetition Rule — a
   design pattern, an SE principle, a CS idea, a mathematical
   principle), don't stop at one real-world connection: name _several_
   unrelated places the same idea recurs, as a short list, at the point
   the concept is taught —

   ```
   Also recognized in: traffic lights, TCP connection states,
   regex engines, every real compiler's lexer, CNC controllers
   reading modal G-code
   ```

   One example teaches "this has a real use." Several unrelated ones
   teach "this is a pattern I will keep noticing" — the actual goal.
   Routine syntax doesn't need this; reserve it for concepts substantial
   enough to be worth carrying into a different codebase entirely.

9. **SE lens — why it's engineered this way.** Name the design
   principle. State the alternative that was _not_ chosen and why — a
   real tradeoff, not a vocabulary definition. State the maintenance or
   failure cost honestly, including debt this project is currently
   carrying, if any.

10. **Commands needed to make this unit real, if any.** Every terminal
    command: what program, what each flag/argument means, what success
    output looks like. Every new tool, config field, file, or
    package-management concept gets the same treatment at the point it's
    first needed, not batched elsewhere.

11. **Run it. Show the real output.** Not "this will print X" — actually
    run it and paste what came back. If it can't run standalone yet (a
    fragment mid-way through a multi-unit feature), say so and say what it
    will connect to.

12. **One sentence connecting this unit to what came immediately before.**

The order of this sequence is deliberate and load-bearing: type the
smallest piece (5) → immediately see where it lives (6) → only then read
what it does alone (7), the computer science it embodies (8), and why
it's engineered that way (9). Isolation and connection are both taught
for every unit; connection is not deferred to the end.

---

## Closing (write once, after the last Concept Unit)

- **Connect the pieces** — a full trace, one concrete value or action
  moving through every unit built in this lesson, start to finish.
- **What breaks without this** — cause a real failure on purpose (delete
  a check, remove an argument), show the actual error, restore it.
- **Exercises** — small variations the student runs themselves.
- **Definition of done** — a checklist, ending in a git commit with a
  message explaining _why_, not what.

---

## Self-check before calling a lesson finished

Read the draft top to bottom and answer honestly:

- [ ] Per the Repetition Rule, does every construct in this lesson's
      code — new or reappearing from any earlier lesson — get its own
      full, real explanation written out inside *this* lesson? Check
      specifically for anything left unexplained because it's "not new"
      or "already covered" — that reasoning is exactly what the
      Repetition Rule now forbids; nothing here is skipped or
      abbreviated on the grounds that an earlier lesson already said it.
- [ ] Does the Header have both a "Terms used in this lesson" glossary
      and an "Objects and methods used" section, each entry stating
      *why* the thing exists or what problem it solves, not just what
      it means or does — and does the glossary include every term this
      lesson's code depends on, reappearing terms included, not only
      genuinely new ones? A term or object left as a bare description
      ("X is a Y that does Z," nothing more) fails this exactly like an
      undescribed one would — the fix is the same "explain, don't just
      describe" standard applied here, in the Header, not only inside
      Concept Units.
- [ ] Does every Objects and methods entry carry its full CRC
      breakdown — Type, Responsibility, Depends On, Connects To,
      Shape — in addition to, not instead of, What it is / Implementation
      / Its use? Check *Responsibility* specifically: is it stated as
      the thing's full charter, or has it been narrowed down to the one
      benefit *Its use* already named? And check *Connects To*: does it
      actually name callers, callees, and what flows between them, or
      is it a bare list of neighboring names with no stated direction?
- [ ] Was the Header assembled by literally tokenizing every code span in
      the unit first — including annotations sitting inside a quoted
      signature, not only the main New Code block — and filling a Terms
      or Objects/methods slot for each token before any prose was
      written? Or does a technical word appear anywhere in the
      Mechanical Walkthrough, a Lens, Connect the Pieces, or Commands
      Needed that traces back to no entry in the Header at all? The
      second is the Vocabulary Extraction Rule's failure mode, and it is
      cheap to fix by adding the missed slot now — expensive to find by
      re-reading the whole draft looking for it later.
- [ ] Does any code block sit immediately next to another code block with
      no prose in between? If yes: split, interleave.
- [ ] Does any paragraph explain what a specific method, class, or
      function is or does as a clause folded into prose about
      something else, rather than its own bullet leading with its
      name — including a single one mentioned only in passing? A
      paragraph that is factually complete still fails this: the
      reader needs to scan for the one thing they're looking for, and
      prose without a bullet per named thing can't be scanned, only
      read start to finish. This applies inside shown shapes (Parent
      Contract Rule or the Objects/methods usage callout) and equally
      to ordinary explanatory prose anywhere else in the lesson.
- [ ] For any real implementation body shown as proof (not just a
      signature), was it actually fetched and confirmed from the
      genuine current source this session — not written from memory,
      not trusted from a secondhand reproduction? And does everything
      that shown body itself references (a type, a constant, a helper)
      already have its own explanation by this point, or get one now?
- [ ] For every external type this lesson calls methods on but does not
      `extend`/`implement`, did you check whether it calls more than one
      related member of that type, or passes/returns a compound type? If
      either is true, is that type's real declared shape actually shown
      as code — not just described in a sentence? A type description
      that reads correctly but never shows the shape is the exact
      failure this check exists to catch.
- [ ] For every "The New Code" block, did you actually write out the
      literal enumeration required by step 7 — every method call, every
      property access, every operator, in order — and give every single
      one of them full, real treatment, per the Repetition Rule? Or did
      you read the block once and write about whatever caught your
      attention, silently passing over anything that felt too basic or
      too familiar to explain? The second one is the exact failure that
      has already happened more than once: real omissions (`.value` on a
      new element type, `JSON.stringify` going unmentioned on
      reappearance) survived an earlier version of this exact check
      because it was applied as a skim, not a literal pass. If you
      cannot point to the enumeration, redo the walkthrough from one.
- [ ] Does any "Updated Project" block contain `{ ... }`, a
      `// ...unchanged` comment, or any other placeholder standing in for
      real code? This has already happened once — a just-shown function
      was elided instead of repeated in context, defeating the step's
      entire purpose. If found: show the real code, or split the unit if
      showing it whole would make the block too large.
- [ ] For every code block, did you actually apply the Recursive Concept
      Extraction Rule — ask whether it bundles more than one
      previously-untaught concept — or did you just describe the block as
      a whole? A block explained only in aggregate ("this sets up the
      fetch and updates the page") means the question was never asked.
- [ ] Did any explanation violate the Stopping Rule — decompose down to
      punctuation or already-taught basic syntax? Fold it back into the
      parent unit's explanation as a clause, not a unit.
- [ ] Does every throwaway example have an explicit "discarded" statement,
      and does the real code that follows name the connection to it?
- [ ] Does every Concept Unit have a Project Change step naming the exact
      file, whether it's new or existing, and where the code goes within
      it? If a reader would have to guess which file to open or where to
      paste — that's missing, not implied.
- [ ] Does every Concept Unit's Project Change step have a Reference
      Source field — a real file and line range, quoted, actually read
      this session — for anything with a real counterpart in a reference
      implementation? Or was the reference sampled once and generalized
      from, or skipped because the general idea seemed clear? A Reference
      Source field that says "no reference counterpart" without that
      being true is worse than an honestly missing one.
- [ ] Does every Concept Unit that adds code into an already-existing,
      non-trivial structure have an Updated Project step showing that
      structure with the new lines marked? If a reader has only seen five
      tiny fragments and would have to mentally reconstruct what the
      surrounding function now looks like, that reconstruction should
      have been shown, not left as an exercise.
- [ ] Does the Updated Project step actually return and recompose — does
      it say what the enclosing structure now _does_ as a whole, not just
      show it with a marker on the new line? A version with no sentence
      explaining the parent's new meaning is spatial orientation without
      the return step; add the sentence.
- [ ] Does Updated Project come immediately after The New Code, before
      the walkthrough and lenses? If a reader has to get through
      Mechanical Walkthrough, CS Lens, and SE Lens before finding out
      where the fragment they just read actually lives, the order is
      wrong — orientation comes first, explanation second.
- [ ] Could a reader starting from the previous lesson's completed state
      apply every change in this lesson without guessing which files
      change, where code belongs, or what commands are required?
- [ ] Does every SE lens state an alternative and a real tradeoff, or does
      it just define a vocabulary word and move on? If the latter: it's a
      description, not teaching — go deeper.
- [ ] Was everything marked "verified" actually run, this session, with
      real output pasted in? If it was written from memory of a similar
      past run: rerun it.
- [ ] Does every Concept Unit step use a `###` heading rather than a
      bolded run-in phrase? A lesson with `**The Problem.**` buried inside
      a paragraph instead of `### The Problem` as its own heading hasn't
      applied the current formatting convention.
- [ ] Does every language construct this lesson's Concept Units are
      built around — not just the dense, unfamiliar, or genuinely-new
      ones — get its own throwaway lab before it appears in real project
      code, per the Concept Isolation Rule's "familiar-sounding is a
      trap" clause and the Repetition Rule's "no already-lab'd-earlier
      skip" clause? Check specifically for a construct explained only
      inline, inside a real function's Mechanical Walkthrough, with no
      prior isolated example — that is a violation even when the
      explanation is accurate, and even when this exact construct was
      already lab'd in an earlier lesson.
- [ ] Does any loop, recursion, or carried-state code have a real
      execution trace — concrete values, step by step — rather than a
      prose paraphrase of what it "generally does"? And for each step in
      that trace: is the value change actually explained (which
      condition matched, which branch ran, why this iteration produced
      this value), or does the line just report a before/after value
      with no reasoning attached? A trace of bare values with nothing
      explaining them fails this exactly as a prose paraphrase would.
- [ ] Does any timing/control-flow trace (a registered callback firing
      later, a framework calling an override at an unpredictable
      moment — no loop, no changing values) use the numbered-list shape
      instead of the `Iteration N: values` shape? Check specifically for
      prose sentences wrapped in a code fence — that's this exact
      failure, and it renders as an unreadable wall of monospace text.
- [ ] Does an `Iteration N:` value-trace line's own "why" explanation
      read as a full sentence with a subordinate clause ("...because
      `x` is...")? If so, is it still sitting inside a code fence? A
      fence full of long, unwrapped prose sentences is the values-side
      version of the exact same failure as the bullet above — drop the
      fence and use the unfenced numbered-list shape instead, even
      though the underlying data is changing values, not timing.
- [ ] Does any sentence assert hidden or invisible behavior — "the
      compiler generated it," "this happens automatically," "the
      framework does this internally" — with no verification attached?
      If a real tool can show it (disassembling a compiled file,
      inspecting a generated artifact, printing an object's actual
      runtime shape), that output belongs in the lesson; a confident
      sentence is not a substitute for it, even when it's correct.
- [ ] For every hard concept (per the Repetition Rule), does the CS Lens
      name _several_ unrelated real-world recurrences, not just one? A
      single "this is like X" sentence satisfies the Contract's weaker
      "connect to the real world" bar but not its stronger "Recognition"
      bar — check which one a hard concept actually received.
- [ ] If this lesson touches any stage of a named multi-stage pipeline,
      does it open with the full pipeline diagram, mark which stage(s)
      it touches, and carry one concrete value through every stage built
      so far — not just its own new stage?
- [ ] Before a new nontrivial construct meets the project's real, complex
      input, was it exercised against a short escalating sequence of tiny
      inputs first, each changing one thing? Jumping straight from a
      minimal lab to full complexity skips the practiced-skill step.
- [ ] Read every Mechanical Walkthrough bullet and ask, per bullet: does
      this only describe (what it's called, what it looks like, what it
      does, stated flatly), or does it explain (why it's shaped this way,
      what would break without it, what it enables)? A bullet that is
      factually correct but purely descriptive fails this check — add the
      reasoning, don't just verify the fact. If a concept needed more than
      a clause to actually explain, was it given that room (a longer
      paragraph, an extra Concept Unit, or an extra lesson), rather than
      compressed to fit?
