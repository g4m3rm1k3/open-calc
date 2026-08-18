---
name: write-lesson
description: Use whenever writing, drafting, revising, or adding a Concept Unit to a lesson in any curriculum under src/docs that follows the Lesson Schema (e.g. android-persistence-lab, android-ui-foundations, and other project/tutorial lesson series). Forces a fresh read of the live schema file, a literal step-7 enumeration before any walkthrough prose, and a run of the schema's own self-check against the draft before presenting it. Do not use for non-lesson docs (README, concept files under src/docs/concepts, reference material itself).
---

# Write Lesson — Schema-Enforced

This skill is a **process gate, not a copy of the rules.** It never restates
what the schema says — the schema changes over time, and any restatement
here would drift stale the moment it did. Every step below points back at
the live file instead.

## Before writing or revising any lesson content

1. **Read `src/docs/reference/LESSON SCHEMA.md` in full, right now** —
   never rely on a memory of its contents from an earlier turn, an earlier
   session, or this skill's own prior invocations. Treat any recollection
   of its rules as stale until reconfirmed against the current file.
2. If the schema (as just read) references companion docs by name (its
   current text mentions `LessonContract` and `Guide.md`) and the unit
   being written depends on what they cover, read those fresh too, from
   wherever they actually live — don't assume a cached understanding of
   what they say.
3. **Before drafting the Header, run the schema's Vocabulary Extraction
   Rule — do not write Terms or Objects/methods from memory or feel.**
   Collect every code span this unit will show anywhere it will
   eventually appear (the New Code block, any isolated lab code, and any
   real signature about to be quoted inside an Objects/methods
   *Implementation* bullet), tokenize each into its distinct pieces —
   every keyword, annotation, operator, type name, method name, named
   constant — and give every token a slot (Terms or Objects/methods, per
   the schema's own category rule) before writing a single word of
   Concept Unit prose. This is what the enumeration in the next step
   reuses; it is not a separate pass to redo later.
4. For every code block that will get a Mechanical Walkthrough: produce
   the literal enumeration the schema's step 7 requires — every method
   call, property access, operator, and literal, in the order it appears
   — as its own visible list (this is the same token list from step 3,
   applied to the walkthrough specifically). A chained/fluent call is
   every one of its links, each its own entry, never the chain waved
   through as a unit. Write the walkthrough from that enumeration, one
   bullet per item, checking each against the schema's current
   requirements for: real kind (static vs. instance vs. constructor vs.
   field access — never left implicit), real type contract when not
   obvious from a single call site, full treatment on every appearance
   whether first or reappearing (no bare "reappearing (Lesson N)"
   citation standing in for the explanation), and explanation over
   description (why it's shaped this way / what breaks without it, not
   just what it's called). If a sentence anywhere past this point needs
   a technical word with no slot from step 3, stop and add the slot to
   the Header immediately, in place — do not defer it to the self-check.

5. Before presenting the draft, walk it against the schema's own
   "Self-check before calling a lesson finished" section — read fresh in
   step 1, not paraphrased from memory — line by line. Report which
   boxes are unmet. Fix what's fixable now; flag anything that needs a
   judgment call back to the user rather than silently deciding it
   yourself.

## Scope note

This applies to writing a brand-new lesson, adding a Concept Unit to an
existing one, and revising/repairing an existing lesson found to be out
of compliance (e.g. a walkthrough that bundles a chained call into one
bullet, or cites a prior lesson instead of re-explaining). The gate is
the same in all three cases: read the current schema, enumerate before
explaining, self-check before presenting.
