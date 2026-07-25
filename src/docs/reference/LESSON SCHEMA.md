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
question on each half. A previously-taught concept reappearing gets a
brief reminder, never a full re-explanation. The goal is the smallest
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
explanation itself is accurate and complete. Skip the lab only when the
exact construct has already received one earlier in this curriculum,
per the Repetition Rule.

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
   throwaway code, run, real output shown, what the output proves. Skip
   this step only when reusing a concept already lab'd earlier in the
   curriculum — say so explicitly instead of silently skipping.
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
   every property access, every operator, every literal. Do not read the
   block holistically and write about "what seems worth mentioning"; that
   is exactly the failure mode this step exists to prevent, and it has
   failed silently before under this schema, more than once, in exactly
   this way. For each item on that enumeration, decide one of three
   things, explicitly: **(a) first appearance** — full treatment, what it
   is, what it does, what it returns, regardless of how basic it looks;
   **(b) a hard concept reappearing** (per the Repetition Rule — a
   pattern, a principle, a named CS idea) — a real restatement naming
   which earlier lesson taught it, never silence, even if it's "only" a
   clause; **(c) genuinely basic, already-established syntax** (a
   variable read, a already-taught operator) — silently reusable, no
   restatement owed. The failure this enumeration exists to catch is
   quietly sorting something into (c) that actually belongs in (a) or
   (b) because explaining it felt unnecessary in the moment — the
   enumeration step exists specifically so that sorting is checked
   against the actual code, item by item, rather than trusted to memory.

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
   paraphrase of the logic that produces them.

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

- [ ] Does any code block sit immediately next to another code block with
      no prose in between? If yes: split, interleave.
- [ ] For every "The New Code" block, did you actually write out the
      literal enumeration required by step 7 — every method call, every
      property access, every operator, in order — and sort each one into
      (a) first appearance, (b) hard concept reappearing, or (c) already
      basic? Or did you read the block once and write about whatever
      caught your attention? The second one is the exact failure that has
      already happened more than once: real omissions (`.value` on a new
      element type, `JSON.stringify` going unmentioned on reappearance)
      survived an earlier version of this exact check because it was
      applied as a skim, not a literal pass. If you cannot point to the
      enumeration, redo the walkthrough from one.
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
- [ ] Does every new language construct — not just the dense or
      unfamiliar-looking ones — get its own throwaway lab before it
      appears in real project code, per the Concept Isolation Rule's
      "familiar-sounding is a trap" clause? Check specifically for a
      construct explained only inline, inside a real function's
      Mechanical Walkthrough, with no prior isolated example — that is a
      violation even when the explanation is accurate.
- [ ] Does any loop, recursion, or carried-state code have a real
      execution trace — concrete values, step by step — rather than a
      prose paraphrase of what it "generally does"?
- [ ] Does any timing/control-flow trace (a registered callback firing
      later, a framework calling an override at an unpredictable
      moment — no loop, no changing values) use the numbered-list shape
      instead of the `Iteration N: values` shape? Check specifically for
      prose sentences wrapped in a code fence — that's this exact
      failure, and it renders as an unreadable wall of monospace text.
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
