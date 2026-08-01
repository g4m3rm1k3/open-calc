# Math Engine — Master Roadmap

**Starting point:** Python basics (data types, functions, loops). No C++, no networking,
no formal CS/discrete math background assumed.

**Destination:** a C++ HTTP server that evaluates a small MATLAB/Julia-inspired language —
lexer, parser, AST, environments, matrices, control flow, closures — built with the testing,
logging, and layered-architecture habits of a working software engineer.

Every lesson is written using the Lesson Schema: throwaway labs for new concepts, real
project code with a mechanical walkthrough, a CS lens, an SE lens, real command output, and
a closing failure/exercise/commit. This document is the map; each numbered lesson below gets
its own lesson file, written one at a time, in order — the same way the Engineering
Mathematics curriculum is being built.

A note on the "would Nvidia hire me" goal, up front, honestly: this project — done well —
builds real fundamentals (systems programming, interpreters, linear algebra, layered
architecture) that show up on strong-engineer resumes, and it'll give you something
substantial to talk about in an interview. It is not a guarantee; hiring also depends on
things this project doesn't touch (internships, DSA interview drilling, networking, timing).
Treat it as building the underlying skill and a portfolio piece, not a ticket.

---

## Stage 1 — Speaking HTTP (Lesson 1)

**Feature:** `POST /evaluate` with body `42` returns `42`.

- **CS:** the client-server model; the HTTP request/response text format; sockets as an OS
  abstraction over a network connection.
- **SE:** why a request handler shouldn't trust or over-parse its input yet; structured
  logging from the very first line of the project, not bolted on later.
- **C++ concepts introduced:** compiling vs. interpreting, `main`, `#include`, `std::string`,
  functions, the POSIX socket API (`socket`, `bind`, `listen`, `accept`, `read`, `write`).
- **Status:** written and verified — see `lesson_01.md`.

## Stage 2 — Tokens and Trees (Lessons 2–3)

**Feature:** `2*(3+4)` evaluates correctly, respecting precedence and parentheses.

- **CS:** what a grammar is; recursive descent parsing; the Abstract Syntax Tree as the
  bridge between "text" and "meaning."
- **Discrete math:** formal languages, grammar rules as production rules, trees as a graph
  structure, induction as the reason recursive descent parsing is correct.
- **DSA:** recursion; the AST as a tree data structure; tree traversal (evaluating an AST
  *is* a traversal).
- **OOP:** first real polymorphism — `Expression` as a base class, `BinaryExpression` /
  `NumberExpression` as derived classes, virtual `evaluate()`.
- **C++ concepts introduced:** classes, inheritance, virtual functions, `enum class` for
  token types, `std::vector`, pointers/`std::unique_ptr` for tree ownership.

## Stage 3 — Variables and State (Lessons 4–5)

**Feature:** `x = 5` then `x + 10` works; state persists across requests.

- **CS:** the symbol table as the classic compiler/interpreter data structure; the idea of an
  "environment" mapping names to values.
- **DSA:** hash tables — how they work, why they're O(1) average, collision handling.
- **SE:** the first real architectural seam — separating "parsing" from "state" from
  "transport" into distinct layers, and why that separation lets each be tested alone.
- **C++ concepts introduced:** `std::unordered_map`, class member state that outlives a
  single request, references vs. values for lookups.

## Stage 4 — Functions as Values (Lesson 6)

**Feature:** `sqrt(16)`, `sin(pi/4)`.

- **CS:** functions as first-class values; the Strategy pattern (each math function is an
  interchangeable strategy behind one call interface).
- **SE:** the tradeoff between a big `if/else` chain and a registry of function objects —
  extensibility vs. simplicity, made concrete instead of abstract.
- **C++ concepts introduced:** `std::function`, function pointers, lambdas.

## Stage 5 — Matrices (Lessons 7–9)

**Feature:** `A = [1 2; 3 4]`, then `A + B`, then `A * B`.

- **Linear algebra:** vectors and matrices as the actual objects, not textbook abstractions;
  matrix multiplication's definition, driven by needing to implement it correctly.
- **DSA:** contiguous 2D storage vs. array-of-arrays, and why it matters for cache behavior
  and complexity; algorithmic complexity of naive matrix multiplication (O(n³)) as a first
  real complexity discussion tied to code the reader wrote.
- **OOP:** operator overloading (`operator+`, `operator*`, `operator[]`) as the mechanism
  that makes `A + B` legal C++.
- **SE:** RAII and the Rule of Three/Five, taught at the exact moment a class first owns
  heap memory (the matrix's backing array) — not as an abstract lecture beforehand.
- **C++ concepts introduced:** dynamic memory (`new`/`delete`, then why `std::vector` is
  usually the better answer), copy constructors, operator overloading, `const` correctness.

## Stage 6 — Determinant and Inverse (Lesson 10)

**Feature:** `det(A)`, `inverse(A)`.

- **Discrete math / linear algebra:** cofactor expansion as recursion over smaller matrices;
  where the connection between "recursive algorithm" and "recursive mathematical
  definition" becomes explicit rather than coincidental.
- **DSA:** recursion with a non-trivial base case and branching factor; a first real look at
  exponential vs. polynomial algorithms (naive cofactor expansion vs. LU-decomposition-based
  determinant).

## Stage 7 — Output as Graphics (Lesson 11)

**Feature:** `plot(...)` returns an SVG image in the HTTP response.

- **CS:** generating structured output (SVG/XML) programmatically; separating computation
  from presentation (Result Formatter as its own layer, per the original architecture
  diagram).
- **SE:** why the plotting code shouldn't know anything about sockets, and the interpreter
  shouldn't know anything about SVG — the layering paying off for the first time.

## Stage 8 — Control Flow (Lesson 12)

**Feature:** `for`, `while`, `if` work inside the language itself.

- **CS:** what it means to *interpret* control flow — the interpreter's own call stack
  standing in for the running program's control flow; short-circuit evaluation.
- **Discrete math:** finite-state-machine thinking applied to the lexer revisited now that
  the language has real branching; boolean logic and truth tables for conditionals.

## Stage 9 — Functions, Scope, and Closures (Lesson 13)

**Feature:** user-defined `function f(x) ... end`, with closures.

- **CS:** lexical scope vs. dynamic scope; environments as a linked chain (parent pointers)
  rather than a single flat map — the SICP-style culmination of Stage 3's symbol table.
- **DSA:** the environment chain as a linked list; a closure as "a function plus the
  environment it captured," made concrete in code.
- **OOP:** the interpreter's `Environment` class now needs a parent reference — the first
  place a data structure's own class refers to another instance of itself.

## Stage 10 — Hardening (running throughout, formalized at the end)

Not a single feature — a pass over everything built so far.

- **SE:** unit tests per layer (lexer, parser, environment, matrix ops) using a real C++
  test framework; structured logging with levels; error handling as a designed layer, not
  scattered `try/catch`; a `benchmarks/` directory measuring the matrix-multiply and
  parser performance claims made along the way; documentation; git history that tells a
  story per the schema's "commit message explaining why."
- **Architecture:** the project reorganized into the `lexer/ parser/ ast/ interpreter/
  runtime/ matrix/ http/ tests/ benchmarks/` layout from the original pitch, each piece now
  independently testable because Stage 3 already forced the transport/logic separation.

## Stretch goals (only after Stage 10 is solid)

- AST → bytecode → a small virtual machine (a real, if tiny, compiler pipeline).
- A second front end (CLI) reusing the same interpreter — proving the layering actually
  worked.

---

### How this will actually get built

One lesson at a time, same as the Engineering Mathematics curriculum — I'll write the next
lesson when you're ready for it rather than generating the whole stack up front, since each
lesson needs to react to the exact state your project is actually in (per the schema's
"delta against the previous lesson's end state" requirement). Lesson 1 is done and verified
below; say the word for Lesson 2.
