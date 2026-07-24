# Concept Contract

Every file in `src/concepts/` must meet this contract. It defines the fixed shape
every concept — from `slice()` to dependency injection to a parser — is authored
against, so the schema never needs to change to accommodate a harder topic. This is
the contract for **library entries**: small, atomic, reusable teaching units,
consumed by `<ConceptBlock>` anywhere in the app (embedded in a Lesson Engine
lesson via a `` ```concept `` fence, or dropped directly into a hand-authored course
page, or browsed standalone via the Concept Explorer). It is a different, smaller,
more mechanical contract than `UPSKILLOS_CURRICULUM_CONTRACT.md` (full lessons) or
`LESSON_CONTRACT.md` (the OS-work real-code curriculum) — those govern sequences of
teaching; this one governs a single reusable reference unit.

## Why this exists

The same explanation of "what an array is" or "what `.map()` does" was being
rewritten, slightly differently, in every lesson that happened to use it. A
concept file is written once and reused everywhere — in-lesson, in a hand-authored
course page, or looked up standalone — so improving one explanation improves every
place it's referenced, instead of requiring a hunt through every lesson that
happens to mention the same idea.

## The eight sections

Every concept file is a fixed set of `## Section Name` blocks (case-insensitive
matching, but write them in this canonical casing) plus one section per language.
Section order in the file doesn't matter to the parser, but write them in this
order for consistency:

1. **Definition** *(required)* — what is this? One to three sentences. No example,
   no justification — just what it is.
2. **Problem** *(required unless genuinely inapplicable)* — why does this exist?
   What situation makes it necessary? A concept with no real problem behind it is
   usually not worth its own entry — fold it into whatever concept it's actually
   in service of instead.
3. **Execution** *(optional)* — what actually happens when this runs, in memory or
   at runtime. Use this when the runtime model is the **same across every
   language** the concept covers — dependency injection's object-graph
   construction order, for instance, doesn't differ by language. When the
   execution model genuinely *does* differ by language (see `async-fundamentals`),
   don't force a generic Execution section — let each language's walkthrough (see
   below) carry that instead, and say so explicitly in Problem or Definition.
4. **Computer Science** *(required)* — a short paragraph naming the underlying
   theory, plus a `Tags:` line — a comma-separated list of related CS ideas this
   connects to (data structures, algorithms, complexity, formal theory). The
   paragraph explains; the tags make the connection scannable and are a deliberate
   seam for future cross-linking between concept files as the library grows.
5. **Software Engineering** *(required)* — same shape as Computer Science, but for
   how professionals actually use this: tradeoffs, maintainability, testing,
   architecture. Paragraph + `Tags:` line.
6. **Common Mistakes** *(required)* — a bullet list (`- ...`). What beginners
   consistently get wrong. Concrete, not generic ("assuming X mutates Y" not
   "not understanding the concept fully").
7. **Exercises** *(required)* — a bullet list. "Try this yourself" prompts against
   the actual example code below — vary an input, predict an output before
   running it, comment out a line and predict what breaks. Not new code to write
   from scratch; small, escalating changes to what's already there.
8. **One section per language** *(at least one required)* — the section header is
   the language's lowercase key (`javascript`, `python`, `java`, `csharp`, `cpp`,
   `c`, `sql`, ...), not one of the seven fixed names above. Contains exactly one
   fenced code block (the real, runnable example — this is what `<ConceptBlock>`
   sends to `runCode()`, so it must actually run) followed by a `Walkthrough:`
   paragraph narrating that specific code's behavior line by line.

## Frontmatter

```markdown
---
concept: string-slicing        # matches the filename (no .md), used as the id
name: String Slicing           # display name — shown in the Explorer sidebar and the collapsed trigger
series: async-fundamentals     # optional — set only if this is one part of a linked sequence
seriesTitle: Asynchronous Programming   # optional — the series' display name, required if `series` is set
part: 1                        # optional — this file's position in the series, required if `series` is set
---
```

## When a concept needs to become a series

A series is separate files sharing a `series` value, in contrast with the two
in-file examples above — reach for it when a topic needs enough room that
cramming it into one file (even a two-example one) would either overload that
file or blur together ideas that each deserve their own full Definition /
Problem / CS / SE / Common Mistakes / Exercises treatment. Two independent
triggers justify it:

**1. The explanation itself genuinely differs by language, not just the syntax.**
`slice()` — same idea everywhere, different method name. One file. How
JavaScript's event loop, Python's GIL, and Java's real OS threads actually
execute "concurrent" code — genuinely different machinery, not a syntax variant
of one shared idea. This is a series: `async-1-the-problem.md` (shared: what
blocking means), `async-2-promises-and-futures.md` (shared: the placeholder-value
abstraction, with one real per-language divergence — eager vs. lazy — called out
explicitly), `async-3-execution-models-compared.md` (no shared Execution section
at all — each language's walkthrough *is* the real content).

**2. The topic is a real progression, not a single idea** — each stage is
correct on its own, builds on the one before it, and going from "does it" to
"does it well" to "does it at scale" is itself the thing worth teaching, not
just three facts that happen to be related. The Errors category is the case
that surfaced this: catching an error and giving it a decent message (baseline),
giving it a real custom type instead of a generic string (better), and
collecting every failure instead of stopping at the first one (best practice at
scale) aren't three unrelated atomic concepts and aren't a two-example contrast
either — they're stages. That's `handling-errors-well-1-catch-and-report.md` →
`-2-custom-error-types.md` → `-3-error-aggregation.md`, a progressive series,
separate from the atomic mechanics files (`throw`, `try`, `catch`, `finally`,
`Stack Traces`) that each stage's code actually uses.

When in doubt between "two examples in one file" and "a series," ask: would a
reader ever want to jump straight to stage 2 or 3 without reading stage 1, or
reference just one stage from a lesson? If yes, they're separate concepts that
belong in a series, each independently linkable — not one file with extra
examples bolted on.

A series is linked purely through `series`/`part` frontmatter — no separate index
file. `getConceptSeries(id)` (`src/concepts/loader.ts`) collects and orders every
file sharing a `series` value; `<ConceptBlock>` shows a "Part N of M" badge with
working Prev/Next navigation whenever a concept has more than one series sibling.

## Format details that matter

- **Tags are literal, comma-separated, on one line** starting with `Tags:` inside
  the Computer Science / Software Engineering section — the parser splits on
  commas and trims each one. Don't wrap tags across multiple lines.
- **Inline `**bold**` and `` `code` ``** render correctly everywhere concept prose
  is shown (`InlineMarkdown.tsx`) — use them freely for emphasis and to reference
  identifiers, the same way you would in any other markdown in this repo. This is
  intentionally not a full markdown renderer — concept prose is a few sentences,
  not a document; don't reach for headings, links, or lists inside prose fields
  (Common Mistakes and Exercises are the only fields parsed as lists).
- **The code fence in each language section must actually run.** It's executed for
  real via `runCode()` (`src/utils/codeRunner.js`) — the same function every other
  runnable code block in this app uses — when a reader clicks Run. A snippet that
  only runs with an assumed setup (an undefined variable, an unimported module) is
  a broken concept file, not a stylistic choice, per the same standard the Lesson
  Engine's Rule: Code Examples #8 already holds every other runnable example to.
- **One example per language, by default.** If a language needs to show more than
  one *facet* of the concept — different execution models, different use cases —
  that's a sign the concept should split into a series (see above), not that one
  language section should grow multiple examples. See the next section for the one
  narrow exception.

## When a concept needs more than one example

The default is still one example per language. The one exception: when the
concept's actual teaching point *is a contrast* — a common mistake versus the fix,
or two genuinely competing approaches with a real tradeoff (not just a style
preference). Error Aggregation is the canonical case: fail-fast and collect-all are
both correct, runnable programs that behave differently, and the concept *is* the
difference between them — no bullet point can substitute for seeing both run.

Ask before reaching for a second example: **is this teaching something the first
example cannot show at all, or is it just "more thorough"?** If it's just more
thorough, it doesn't qualify — that's what the Common Mistakes bullet list is
for. Two examples should be two things a reader would actually want to run and
compare side by side, not a second illustration of the same point.

When a language section does need two examples, mark each one with a bold label
line immediately before its fence:

```markdown
## java

**✕ Swallows the error:**
```java
...
```
Walkthrough: ...

**✓ Rethrows with context:**
```java
...
```
Walkthrough: ...
```

Each example still gets its own `Walkthrough:` paragraph. This doesn't have to be
symmetric across every language a concept covers — one language's ceremony
(checked exceptions in Java, say) might warrant the contrast where a more dynamic
language's version doesn't need it to make the same point.

## Checklist

Before a concept file is considered done:

- [ ] Definition is one to three sentences, no justification, no example
- [ ] Problem states what situation makes this necessary (or is explicitly omitted
      because the concept has no real motivating problem of its own)
- [ ] Execution is present only if the runtime model is genuinely shared across
      every language covered — otherwise each language's walkthrough carries it
- [ ] Computer Science and Software Engineering each have a real paragraph, not
      just a tag list standing alone
- [ ] Tags are a single comma-separated line, not prose
- [ ] Common Mistakes are concrete failure modes, not restatements of the definition
- [ ] Exercises are small variations on the existing example, not new problems
- [ ] Every language section's code fence actually runs and produces the output
      its walkthrough claims — verified by clicking Run, not assumed
- [ ] If this concept's explanation genuinely differs by language, it's split into
      a `series` instead of forcing one shared Definition/Problem to paper over
      the difference
- [ ] If a language section has two examples, both are genuinely necessary to see
      side by side (a mistake vs. its fix, or a real tradeoff) — not just "more
      thorough" coverage that belongs in Common Mistakes instead
- [ ] `name` in frontmatter is set and reads correctly as the Explorer sidebar label
