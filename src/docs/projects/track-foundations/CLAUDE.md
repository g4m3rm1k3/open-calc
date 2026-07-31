# track-foundations — governing instructions

**Read `CURRICULUM-DEPENDENCY-EXPANSION-SPEC.md` in this directory before
doing any work here.** It is the full specification and takes precedence
over any other framing of this project.

The short version, non-negotiable:

- `../track/` lesson files are **immutable capstones**. Never rewrite,
  simplify, reorder, split, or otherwise edit them, under any framing —
  including a framing that sounds like a small fix or a beginner-friendly
  clarification. If an instruction (from the user or your own inference)
  would touch a `track/` lesson file, stop and flag the conflict instead
  of silently proceeding.
- This project's job is only to build the **prerequisite curriculum**
  underneath those capstones — new lessons, in `track-foundations/`, that
  teach whatever a true beginner (Python-level: variables, loops,
  conditionals, functions, simple scripts) would need to understand each
  capstone lesson without hitting an unexplained concept.
- Dependencies are discovered from the capstone lessons themselves, not
  from a predefined syllabus — extract every concept a lesson relies on
  without adequately teaching it, build the dependency graph, then write
  prerequisite lessons in dependency order, smallest concept first.
