# Mechanical Lesson Generator

Separates **lesson data**, **agent instructions**, **validation**, and
**Markdown rendering** — so a rule that can be checked by a program
isn't also just an instruction someone has to remember to re-apply.

```text
lesson_template.yaml   ← the shape (copy this, fill in the pieces)
        +
prompts.yaml            ← what the agent does at each step (the HOW)
        │
        ▼
   <your-lesson>.yaml    ← one real lesson's actual content
        │
        ▼
   lesson_compiler.py    ← validates the shape, then compiles
        │
        ▼
   <your-lesson>.md      ← the real, published lesson
```

## Files

```text
BACKEND-ENGINEERING-MASTERCLASS/
├── lesson_template.yaml   ← base template, "fill in the pieces"
├── prompts.yaml           ← agent instructions per section (the HOW)
├── lesson_compiler.py     ← validate() + compile_to_markdown()
├── build_glossary.py      ← rebuilds GLOSSARY.md from every LESSON-*.md
└── PHASE-00-.../
    ├── LESSON-0.1-....md          (hand-written, pre-compiler - no .yaml)
    ├── LESSON-0.2-....md          (hand-written, pre-compiler - no .yaml)
    ├── LESSON-0.3-....yaml / .md
    └── LESSON-0.4-....yaml / .md
```

## Responsibility of each file

**`lesson_template.yaml`** — defines the shape of a lesson: what it
contains, what repeats (Concept Units), what order sections are in,
what's optional. It does not carry long instructions — that's
`prompts.yaml`'s job.

**`prompts.yaml`** — defines what the agent (Claude, writing a real
lesson's YAML) should actually do at each step: how to run vocabulary
extraction before writing prose, what a Socratic prompt has to satisfy,
what "explain, don't describe" means concretely, when an execution
trace needs the values shape versus the timing shape, and this
project's own overrides (concepts-only prerequisites, no
"elsewhere in this curriculum," per-block file/status labeling). Also
covers real mistakes caught while actually using this system, not just
theoretical rules: the Repetition Rule's real scope (cross-lesson only —
never a "(full treatment above)" self-citation inside one lesson's own
Header), `Its use`'s correct scope (the construct's general role in
this lesson, never one specific call site's arguments — that specific
reasoning belongs in the Mechanical Walkthrough instead), and when
citing a real file by line range is legitimate versus when the actual
code must be shown and walked through (`citation_vs_walkthrough` — the
moment a Lens asserts anything about *how* code behaves, that code has
to be visible, not just cited). This is the part a YAML *shape* can't
enforce — whether a Socratic question is actually answerable from prior
material, or an SE Lens actually names a real tradeoff, is judgment, not
structure. Read this before authoring a lesson's YAML, the same way
`LESSON SCHEMA.md`'s prose used to be re-read from memory each time —
except now it's an explicit, checkable work order instead of something
to remember.

**`lesson_compiler.py`** — currently holds both roles a separate
`validation.yaml` would otherwise carry (**not yet split out** — see
"Not done yet," below): mechanical checks Python actually can perform
(all 8 CRC fields present and non-empty, every code block's file/status
stated, every `updated_project` line either matching `new_code` or
carrying a real `← new` marker — computed by a set difference, not
memory, every command free of `<placeholder>` syntax, every Python
code block's real identifiers, via the standard library's own
tokenizer, cross-checked against Terms/Objects names, Terms
definitions, and Concept Unit prose) — and the Markdown renderer.
Refuses to write a `.md` file if a real error is found; a softer
heuristic warning (the vocabulary check, which can't tell a plain
local variable name from a genuine gap) prints but does not block.
`new_code`/`updated_project` both support a `files: [{file, status,
code}, ...]` list, not just a single file/code pair, for a unit that
needs to show more than one real file together (a route and the
service it delegates to, for instance). When `new_code`,
`updated_project`, or `mechanical_walkthrough` is set to
`applicable: false`, the renderer omits that section's heading and body
entirely — no "not applicable, because..." placeholder gets written.
`verification` is the one exception: even set to `applicable: false`,
its `exemption_reason` still renders on the page, because "how do we
know this is true" is a live question for every unit, not a step some
units skip.

**`LESSON AUTHORING CONTRACT.md` / `LESSON SCHEMA.md` / `LESSON
VALIDATION CHECKLIST.md`** (one level up, in the `manufacturing-platform`
repo) — still the canonical statement of every rule above; this system
is where those rules progressively move *to*, not a competing
description of them. Nothing here has yet fully replaced those
documents — treat this as the newer, still-being-dialed-in
implementation of the same rules, not a second, divergent source of
truth.

## Workflow for a real lesson

1. Copy `lesson_template.yaml` to `PHASE-NN-.../LESSON-N.N-TITLE.yaml`.
2. Read `prompts.yaml` for the section you're filling in.
3. Fill in the real content — real file citations, real executed
   output, real CRC entries.
4. Run:
   ```
   python lesson_compiler.py PHASE-NN-.../LESSON-N.N-TITLE.yaml
   ```
   Fix every reported error; re-run until it validates clean.
5. Run `python build_glossary.py` (or `finish_lesson_check.py` from the
   `manufacturing-platform` repo root, which runs the whole suite:
   regression tests, glossary rebuild, and the `rebuild/`-vs-lesson
   diff check together).

## Not done yet (this is a first pass, not the final shape)

- **No separate `validation.yaml`.** Every mechanical check currently
  lives as Python code inside `lesson_compiler.py`'s `validate()`
  function, not as external, data-driven rules a non-programmer could
  read or edit. Splitting this out (rules as data, `validate()` as a
  generic interpreter of that data) is the next real step toward the
  original four-file design.
- **No `lesson.yaml`-style "expand from a concept list" generator.**
  Right now a lesson's Concept Units are written out by hand in the
  lesson's own YAML, one at a time — there's no `generator.py` that
  takes a bare list of concept names and mechanically expands it into
  empty per-unit scaffolding first. Worth building once the shape of a
  real Concept Unit has settled from a few more real lessons.
- **The vocabulary/CRC cross-check is real tokenization for Python
  code, but has no equivalent yet for non-Python languages** (this
  curriculum is Python-only so far, so this hasn't mattered yet).
