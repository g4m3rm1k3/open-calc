# Curriculum-Builder Toolkit (Generic)

The mechanical lesson-production pipeline from Stage 6 of
`CURRICULUM-BUILDER-PROCESS.md`, genericized from the
manufacturing-platform backend curriculum's own toolkit. Copy this whole
folder into a new `<SUBJECT>-ENGINEERING-MASTERCLASS/` folder to start a
curriculum for a new codebase.

```text
lesson_template.yaml   <- the shape (copy per lesson, fill in the pieces)
        +
prompts.yaml            <- what the agent does at each step (the HOW)
        |
        v
   <your-lesson>.yaml    <- one real lesson's actual content
        |
        v
   lesson_compiler.py    <- validates the shape, then compiles
        |
        v
   <your-lesson>.md      <- the real, published lesson
```

## Files

- **`lesson_template.yaml`** - base template, 100% generic already
  (Header, Terms, Objects/methods, Concept Units, Closing - no
  subject-specific fields). Copy per lesson.
- **`prompts.yaml`** - the HOW. Also generic already, with one section
  you must NOT copy from another project: `project_overrides`, at the
  bottom, is deliberately empty here. Fill it in with THIS project's own
  real, discovered decisions as they come up - don't paste in another
  project's list.
- **`lesson_compiler.py`** - validates structure (all 8 CRC fields
  present, every code block's file/status stated, every changed line
  marked `<- new`, no placeholder commands) and compiles to Markdown.
  Refuses to write a `.md` if a real error is found. **Known
  limitation:** the vocabulary cross-check (a soft warning, never a
  hard error) is implemented via Python's own `tokenize` module and
  only runs for code blocks with `language: python` (or unset) - every
  other language's code blocks are silently skipped for that one
  heuristic check. All structural checks still run and still block
  compilation regardless of language.
- **`build_glossary.py`** - rebuilds one `GLOSSARY.md` from every
  `LESSON-*.md`'s own Terms/Objects sections in this same folder tree.
  Fully generic; run it after every lesson to keep the glossary current.

## Workflow for a real lesson

1. Copy `lesson_template.yaml` to `PHASE-NN-.../LESSON-N.N-TITLE.yaml`.
2. Read `prompts.yaml` for the section you're filling in - and this
   project's own `project_overrides`, once any exist.
3. Fill in the real content - real file citations, real executed
   output, real CRC entries.
4. Run:
   ```
   python lesson_compiler.py PHASE-NN-.../LESSON-N.N-TITLE.yaml
   ```
   Fix every reported error; re-run until it validates clean.
5. Run `python build_glossary.py`.
6. Before calling the lesson done, walk it against the project's own
   Lesson Authoring Contract / Schema / Validation Checklist by hand -
   a clean compile only proves the *shape* is right.

## What's genuinely portable vs. what needs a fresh pass

See `CURRICULUM-BUILDER-PROCESS.md`'s Stage 6 for the full breakdown.
Short version: everything in this folder works unchanged for a new
project except `prompts.yaml`'s `project_overrides`, which must be
re-derived from real mistakes/decisions on the new project, never
inherited.
