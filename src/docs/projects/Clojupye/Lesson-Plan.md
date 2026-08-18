# Clojupye Lesson Plan

This maps `Curriculum.md`'s 30 sections onto an actual lesson series
written under `src/docs/reference/LESSON SCHEMA.md`. It is a living
planning document, not a lesson itself — update it as grouping decisions
firm up while lessons get written.

## Governing decisions

- **Full scope, in order.** All 30 sections of `Curriculum.md` stay,
  including the later production-engineering phases (Python interop
  bridge, modules, macros, IR, packaging, the final application). Nothing
  is deferred to an "optional" track.
- **No outside-book influence.** Lesson content never cites or is shaped
  by any book the author happens to be reading alongside this series.
  Every lesson is self-contained per the schema's Repetition Rule.
- **Checkpoint-driven grouping.** Lessons are grouped so each one ends in
  something actually run, with real output shown — never a long stretch
  of typing before the first check. A section with many substantial new
  concepts splits into multiple lessons rather than producing one long
  lesson with a checkpoint deferred to the end.
- **Refactor sections are flagged.** A few sections (15, 23) restructure
  existing code with no new visible feature. Their checkpoint is "re-run
  the existing example, confirm identical output" — called out explicitly
  in those lessons so it doesn't read as a missing checkpoint.
- **10.4 is moved.** `Curriculum.md` places Differential Testing at 10.4,
  but it compares interpreter output against *compiler* output, and the
  compiler doesn't exist until Section 11+. Section 10's lesson covers
  only 10.1–10.3 (unit/language/snapshot tests — all runnable
  immediately). Differential testing becomes its own lesson placed right
  after Section 12 (Compiling Values and Calls), where the comparison can
  actually execute.
- **Section 17 / 20 are the pip-interop payoff.** The generic Python
  bridge (import/resolve/get-attribute/call/construct/index/iterate/catch,
  never special-cased per library) is what makes arbitrary pip packages
  usable without compiler changes. Section 20.5's Critical Checkpoint —
  install an unseen package, use it, zero compiler modification — is the
  proof of that design, not a stretch goal.

## Lesson files

Each written lesson lives at `lessons/NNN-slug.md`, zero-padded to three
digits (`000-deciding-before-building.md`, `001-...`), matching the
convention already used by `src/docs/FullStackNow/lessons/`. `HANDOFF.md`
tracks which lessons exist and their status — this table tracks the
*plan*, not progress.

## Mapping

| Lesson(s) | Curriculum.md section(s) | Split reason | Checkpoint |
|---|---|---|---|
| 0 | 0. Project Definition | — (no code) | Written language spec |
| 1 | 1. Language Shell | — | REPL prints prompt, accepts input |
| 2 | 2. Values and Evaluation | — | Literals/symbols/lists print correctly |
| 3 | 3. Reader and Parser — Scanner, Token Types (3.1–3.2) | split: 5 capabilities is too much for one lesson | Token stream printed for `(+ 10 20)` |
| 4 | 3. Reader and Parser — Recursive Reader, Strings, Syntax Errors (3.3–3.5) | (cont.) | Nested reader data + source-aware errors |
| 5 | 4. Language AST | — | AST printer via visitor |
| 6 | 5. Interpreter | — | `(def x 10)(+ x 5)` → `15` |
| 7 | 6. Expressions and Control Flow | — | Nested `let`/`def` shadowing |
| 8 | 7. Functions — Function Values, Named Functions, Multiple Arguments (7.1–7.3) | split: closures deserves its own room | `(square 5)` → `25` |
| 9 | 7. Functions — Variadic Arguments, **Closures** (7.4–7.5) | (cont.) | `make-adder`/`add10` closure → `15` |
| 10 | 8. Functions as a Language Feature | — | Small functional program using `map`/`filter`/`reduce` |
| 11 | 9. Collections — Vectors, Maps (9.1–9.2) | split: 9 collection operations across 2 capabilities | Vector/map operations demonstrated |
| 12 | 9. Collections — Keywords, Sets, Interop (9.3–9.5) | (cont.) | Data-processing app over real collections |
| 13 | 10. Testing Infrastructure — Unit, Language, Snapshot (10.1–10.3) | 10.4 moved, see above | Real test suite, runs now |
| 14 | 11. Python AST Backend | — | Lisp → Lisp AST → Python AST → Python source pipeline shown |
| 15 | 12. Compiling Values and Calls | — | Compiler emits executable Python |
| 16 | **10.4 Differential Testing** (relocated) | see above | Interpreter result == compiler result, for real |
| 17 | 13. Compiling Control Flow | — | Nested-expression program compiles & runs |
| 18 | 14. Name Resolution and Mangling | — | Generated identifiers always valid & deterministic |
| 19 | 15. Runtime Architecture | refactor — no new feature | Same output, now via imported runtime |
| 20 | 16. Python Object Model — Modules, Functions, Classes (16.1–16.3) | split: 7 capabilities | `(math.sqrt 25)` works |
| 21 | 16. Python Object Model — Attributes, Methods, Indexing, Iteration (16.4–16.7) | (cont.) | Stdlib class used with zero custom adapter |
| 22 | 17. Generic Python Interoperability | — | Several unrelated packages work, no compiler changes |
| 23 | 18. Python Values ↔ Language Values | — | Python function round-trips language values |
| 24 | 19. Python Exceptions | — | Real library exception caught from language code |
| 25 | 20. Python Package Ecosystem — venv/pip, stdlib, requests (20.1–20.3) | split: 5 capabilities, capstone deserves room | requests used successfully |
| 26 | 20. Python Package Ecosystem — numpy, PySide6 (20.4–20.5) | (cont.) | **Critical checkpoint**: unseen pip package, zero compiler modification |
| 27 | 21. Modules and Namespaces — Language Modules, Namespace Declaration (21.1–21.2) | split: 5 capabilities | `math.clj` compiles to `math.py` |
| 28 | 21. Modules and Namespaces — Imports, Aliases, Visibility (21.3–21.5) | (cont.) | Multi-file application compiles & runs |
| 29 | 22. Macro System — Quote, Quoted Structures, Unquote (22.1–22.3) | split: metaprogramming is dense | Code manipulated as data |
| 30 | 22. Macro System — Macro Definitions, Expansion (22.4–22.5) | (cont.) | Full macro-expansion pipeline shown |
| 31 | 23. Compiler Pipeline | refactor — no new feature | Each pass independently inspectable |
| 32 | 24. Intermediate Representation | — | Full pipeline traced AST → IR → Python AST → Python |
| 33 | 25. Advanced Python Semantics — Multiple Returns, Keyword Args, Default Args (25.1–25.3) | split: 8 capabilities | Keyword/default arguments working |
| 34 | 25. Advanced Python Semantics — Variadic Functions, Keyword Variadics, Generators (25.4–25.6) | (cont.) | Generator-backed sequence producer |
| 35 | 25. Advanced Python Semantics — `with`, Async (25.7–25.8) | (cont.) | Async third-party API used from the language |
| 36 | 26. Classes — Language Classes, Compilation to Python Classes (26.1–26.2) | split | Language class compiles to a real Python class |
| 37 | 26. Classes — Methods, Construction, Python Interop (26.3–26.5) | (cont.) | Language class + Python class interop |
| 38 | 27. Tooling — Compiler CLI, Diagnostics (27.1–27.2) | split | Structured diagnostics with file/line/column |
| 39 | 27. Tooling — Stack Traces, Formatter, Linter (27.3–27.5) | (cont.) | Linter catches a real language-level problem |
| 40 | 28. Compiler Testing — Unit, Integration, Golden (28.1–28.3) | split | Golden tests protecting AST/IR/Python output |
| 41 | 28. Compiler Testing — Differential, Fuzz, Regression (28.4–28.6) | (cont.) | Fuzz-discovered bug becomes a permanent regression test |
| 42 | 29. Packaging the Language | — | `pip install yourlang && yourlang program.clj` |
| 43+ | 30. Real Application / Final Validation | likely multiple lessons — a real multi-module app | The full validation project runs end to end |

~43+ lessons at this grain. Exact lesson numbers may shift as later
sections get drafted and their capability count is checked against how
much a single lesson can carry without breaking the checkpoint-driven
grouping rule above.
</content>
